# StandardPoint (Web Version)

**StandardPoint** é uma ferramenta web desenvolvida para auxiliar na **Análise de Pontos de Função (APF)**, seguindo as métricas e padrões estabelecidos pelo **IFPUG** (International Function Point Users Group).

A aplicação permite o gerenciamento de empresas, projetos e contagens de pontos de função, facilitando o cálculo de Pontos de Função Não Ajustados (PFNA) e Pontos de Função Ajustados (PFA), além de integrar o Valor de Ajuste de Função (VAF).

## 🚀 Tecnologias

Este projeto foi construído utilizando as seguintes tecnologias:

- **React**: Biblioteca JavaScript para construção de interfaces de usuário.
- **Vite**: Build tool rápida e moderna.
- **Node.js & Express**: API Backend para gerenciamento seguro de arquivos e backups no sistema host.
- **Axios**: Cliente HTTP para comunicação client-server.
- **CSS3**: Estilização moderna e responsiva.

## 🛠️ Instalação e Execução

Para rodar o projeto localmente, siga os passos abaixo:

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.
- Gerenciador de pacotes (npm ou yarn).

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/fabianofern/function-point-web.git
   cd function-point-web
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Crie arquivo `.env` (opcionalmente configurado):**
   ```env
   VITE_API_URL=http://localhost:3001/api/v1
   PORT=3002
   SERVER_PORT=3001
   CORS_ORIGINS=http://localhost:3002
   ```

4. **Inicie a aplicação em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   *Este comando iniciará o Backend Express (porta 3001) e o Frontend Vite (porta 3002) simultaneamente usando o `concurrently`.*

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia todo o ambiente de desenvolvimento (API + Web).
- `npm run dev:web`: Inicia apenas o frontend React/Vite.
- `npm run dev:server`: Inicia apenas o backend Node.js.
- `npm run build`: Gera o build de produção do frontend.
- `npm run preview`: Visualiza o build de produção localmente.

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---
Desenvolvido para facilitar a análise métrica de software com precisão e agilidade.
