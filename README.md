# Inetum Travel

Aplicação React para explorar países, consultar meteorologia e guardar destinos favoritos. A interface segue uma linguagem visual inspirada no iOS, inclui modo claro/escuro e adapta-se a smartphone, tablet e desktop.

## Funcionalidades

- Autenticação Google opcional no header e proteção das definições da conta.
- Perfil com nome, email, fotografia e logout.
- Globo 3D interativo com rotação, zoom, hover e seleção de países.
- Pesquisa em tempo real com debounce por país, capital, região, moeda ou idioma.
- Informação detalhada sobre bandeira, população, capital, moeda, idioma e região.
- Meteorologia atual da capital e da localização do utilizador.
- Favoritos persistentes por utilizador através de Context API e `localStorage`.
- Atualização local dos dados de perfil.
- Glassmorphism, fundo animado, cartões interativos, skeleton loading e temas claro/escuro.
- Estados de loading, mensagens de erro e notificações visuais.

## Tecnologias

React 18, Vite, React Router 6, Axios, Context API, CSS Modules, Google OAuth, Three.js, React Globe GL e Vitest.

## Requisitos

- Node.js 20 ou superior.
- Uma credencial OAuth 2.0 do tipo aplicação Web no Google Cloud Console.
- Uma chave da REST Countries API v5.
- Uma chave da OpenWeatherMap API.

Para desenvolvimento local, adiciona `http://localhost:5173` às origens JavaScript autorizadas da credencial Google.

## Configuração

1. Instala as dependências:

   ```bash
   npm install
   ```

2. Cria o ficheiro `.env` na raiz, a partir de `.env.example`:

   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   VITE_REST_COUNTRIES_API_KEY=your_rest_countries_api_key
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key
   ```

3. Inicia o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abre `http://localhost:5173`. A aplicação entra diretamente na Dashboard;
   o login Google pode ser iniciado no header quando for necessário.

O ficheiro `.env` não deve ser enviado para o repositório. Depois de alterares variáveis de ambiente, reinicia o servidor Vite.

## Comandos disponíveis

```bash
npm run dev        # servidor de desenvolvimento
npm run lint       # análise estática do código
npm test           # testes automatizados
npm run test:watch # testes em modo interativo
npm run build      # build de produção
npm run preview    # pré-visualização do build
```

## Estrutura

```text
src/
├── components/  componentes reutilizáveis, layout, globo e meteorologia
├── context/     autenticação, favoritos, tema e notificações
├── hooks/       hooks de dados e comportamento
├── pages/       páginas da aplicação
├── services/    clientes das APIs externas
├── styles/      estilos e variáveis globais
└── utils/       pesquisa, formatação e credenciais Google
```

## Notas

- A geolocalização é pedida apenas ao carregar no botão da página Local. Em produção, o browser exige HTTPS; `localhost` é aceite durante o desenvolvimento.
- As alterações de nome e fotografia são guardadas apenas neste dispositivo e não modificam a conta Google.
- A sessão é guardada em `sessionStorage`; favoritos, tema e personalização do perfil usam `localStorage`.
- O bundle do globo 3D é carregado de forma assíncrona para não bloquear a interface inicial.
