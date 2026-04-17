# Guia de Migração: Integração de Sistemas Satélites ao ToolCenter SSO

> **Contexto para IAs Assistentes:** Este documento serve como prompt/instrução de regras e patterns que DEVE ser seguido para refatorar a autenticação de uma aplicação web comum (Frontend + API), removendo seu login local e a plugando ao SSO do **ToolCenter**.

---

## 🏗️ Resumo das Obrigabilidades
- A aplicação deixa de ter tela de Login, Perdeu Senha ou Cadastro próprios.
- A autenticação baseia-se num Cookie HTTP-Only chamado `jwt`, mantido e injetado pelo ToolCenter no domínio.
- O Frontend não armazena Tokens. Ele apenas sabe se "Está ou não autorizado" questionando o Backend (`/api/v1/me`).
- O Backend recupera o `jwt` (via cookies ou header config), extrai as permissões, consulta as chaves públicas em tempo real no JWKS do ToolCenter e, caso o usuário não exista localmente, o cria "on the fly" (Auto-Provisioning).

---

## 🛠️ Passo 1: Configuração de Variáveis e Permissões (.env e CORS)

1. Mova a porta do Frontend para ficar diferente da 3000 (O ToolCenter assume a 3000). Exemplo da sub-ferramenta: Web em 3002, API em 3001.
2. No Backend, defina nas variáveis de ambiente:
   ```env
   TOOLCENTER_JWKS_URL="http://127.0.0.1:3000/.well-known/jwks.json" # Use 127.0.0.1 para evitar Socket Hang up no Node local
   TOOLCENTER_LOGIN_URL="http://127.0.0.1:3000/login"
   ```
3. Permita _Credentials_ no Backend (`server.ts`):
   ```typescript
   import cookieParser from 'cookie-parser';
   
   app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3002'], credentials: true }));
   app.use(cookieParser());
   ```

---

## 🛠️ Passo 2: O Middleware Especialista (Obrigações e Precauções)

No Backend, instale o pacote `jwks-rsa`. Construa um `toolcenterAuthMiddleware.ts`. Este middleware deve cumprir as seguintes lógicas:

1. **Extração:** Tentar extrair do cookie (`req.cookies.jwt`) ou do Header (`Authorization: Bearer`).
2. **JwksClient Seguro:** O pacote moderno do Jwks-RSA opera via Promises. Adicionar timeout de segurança.
   ```typescript
   const client = jwksClient({
     jwksUri: process.env.TOOLCENTER_JWKS_URL,
     cache: true, cacheMaxAge: 3600000, timeout: 5000
   });
   ```
3. **Robustez na Busca da Key (O Segredo do KID):** Algum gerador JWT do ToolCenter pode omitir o parâmetro `KID` no Header. A IA deve codificar a extração preveendo uma rotina de fallback caso `header.kid` esteja undefined:
   ```typescript
   // Exemplo OBRIGATÓRIO de Fallback com PROMISES (sempre use `.then()` no jwksClient moderno):
   if (!header.kid) {
     client.getSigningKeys().then(keys => {
       if (!keys || keys.length === 0) return callback(new Error('...'));
       callback(null, keys[0].getPublicKey());
     }).catch(err => callback(err));
     return;
   }
   client.getSigningKey(header.kid).then(key => callback(null, key!.getPublicKey())).catch(err => callback(err));
   ```
4. **Verificação Matrix (Autorização Local Nível 2):** Ao decodificar com `RS256`, procure o Array `decoded.tools_access`. Encontre o `tool_slug` da ferramenta alvo (Ex: `receitas-web`, `pdf-indexer`). Se ele não possuir na lista, retornar `403 Access Denied`.
5. **Auto-Provisioning / Sync de Banco de Dados:**
   Cuidado com restrições Unique (email repetido localmente). Registre o ID Global como `toolcenterId`.
   * Lógica padrão: Tenta achar o UID. Se não acha, atualiza por Email. Se não acha, Cria no DB como `senha_hash = nulo`. Se acha, espelha Nome e E-mail. Encerra e repassa ao `req.user`.

> Substitua todos os middlewares antigos nas Rotas para apontarem unicamente ao `toolcenterAuthMiddleware.ts`.

---

## 🛠️ Passo 3: Frontend - O Interceptor e o Novo Estado Global

1. **Delete rotas ou telas relacionadas a Login e Registro.** Elimine guardas `PrivateRoute` da árvore de dom, torne todo o App restrito de forma "Passiva".
2. **Estratégia de Requisição Base (Axios ou Fetch):** Force a injeção do Cookie adicionando `withCredentials: true` na instância padrão.
3. **Interceptor Global de Resposta Axios:**
   ```typescript
   api.interceptors.response.use(res => res,
     async (error) => {
       if (error.response?.status === 401) {
         window.location.href = error.response?.data?.redirectTo || 'http://localhost:3000/login';
         return Promise.reject(error);
       }
       if (error.response?.status === 403) return Promise.reject(error); // Permissão Negada (Lidada no app)
       // Recomendado: Adicionar Retries Recursivos Exponenciais para status 500.
       return Promise.reject(error);
     }
   );
   ```
4. **O Controle Mestre (Main App Component):**
   Ao carregar o Layout Central da interface base do React/Vue:
   - Dispare um endpoint de `/me` da API logo no `useEffect()`.
   - Enquanto resolve = Renderize a tela "Carregando...".
   - Se 403 = Renderize um componente `<AccessDenied />`.
   - Se 200 = Sete no estado Global (Zustand/Pinia) `.user` e `.isAuthenticated = true`, permitindo a liberação do Outlet e Navbar e desenhando a UI.

**Opcional de UX:** Mostrar papéis do usuário (`toolRole` como `ADMINISTRADOR` ou `OPERADOR`) na UI do Satélite, caso existam hierarquias restritas ali.
