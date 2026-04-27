# StandardPoint-web

**StandardPoint-web** é uma solução completa para **Análise de Pontos de Função (APF)**, desenvolvida sob os rigorosos padrões métricos do **IFPUG** (International Function Point Users Group). 

Esta ferramenta web permite o gerenciamento centralizado de empresas, projetos e contagens, automatizando o cálculo de Pontos de Função Não Ajustados (PFNA) e Pontos de Função Ajustados (PFA), integrando o Valor de Ajuste de Função (VAF) de forma precisa e intuitiva.

---

## ✨ Principais Características

- **Gestão de Inventário**: Cadastro de empresas, projetos e times (squads).
- **Métricas IFPUG**: Cálculo automatizado de complexidade (Baixa, Média, Alta) para ALI, AIE, EE, SE e CE.
- **Relatórios Dinâmicos**: Geração de relatórios Gerenciais, Analíticos, Detalhados (Auditoria) e Completos.
- **Exportação em PDF**: Documentação pronta para auditoria com um clique.
- **Segurança e Persistência**: Backend robusto com SQLite e sistema de backup automatizado.
- **Autenticação Corporativa**: Integração com ToolCenter SSO.

## 🚀 Stack Tecnológica

- **Frontend**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Backend**: [Node.js](https://nodejs.org/) com [Express 5](https://expressjs.com/) e [TSX](https://github.com/privatenumber/tsx)
- **Banco de Dados**: [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
- **Estilização**: Vanilla CSS com padrões modernos de UI/UX
- **Estado**: [Zustand](https://github.com/pmndrs/zustand)
- **Documentação PDF**: [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/)

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/) (Versão 18 ou superior)
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/fabianofern/StandardPoint-web.git
   cd StandardPoint-web
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_API_URL=http://localhost:3001/api/v1
   PORT=3002
   SERVER_PORT=3001
   CORS_ORIGINS=http://localhost:3002
   TOOLCENTER_JWKS_URL=https://auth.seutoolcenter.com/.well-known/jwks.json
   BYPASS_AUTH=true # Use true para desenvolvimento local sem SSO
   ```

4. **Inicie o ambiente de desenvolvimento:**
   ```bash
   npm run dev
   ```
   *Este comando utiliza o `concurrently` para iniciar simultaneamente o servidor de API (porta 3001) e o frontend (porta 3002).*

---

## 📜 Scripts Disponíveis

- `npm run dev`: Modo desenvolvimento completo (Frontend + Backend).
- `npm run dev:web`: Inicia apenas o ambiente Vite.
- `npm run dev:server`: Inicia o servidor Express via `tsx` (Node.js + TS).
- `npm run build`: Compila a aplicação para produção.
- `npm run test`: Executa a suíte de testes unitários via Vitest.

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com foco em precisão métrica e excelência em UX.
