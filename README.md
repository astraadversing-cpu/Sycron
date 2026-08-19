<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/efdf26f7-8a1d-4621-a2f5-488c279372be

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## API e banco de dados

O servidor REST usa um arquivo JSON persistente em `data/sycron.json` e inicializa automaticamente o armazenamento e os dados iniciais da plataforma.

1. Instale as dependências: `npm install`
2. Inicie a API: `npm run server`
3. Verifique o serviço em `http://localhost:8787/api/health`

Para desenvolvimento com reinício automático, use `npm run server:dev`. A variável `DATABASE_PATH` pode apontar para outro arquivo SQLite e `PORT` altera a porta HTTP.

Endpoints principais: `GET /api/collections`, `GET /api/:collection`, `GET /api/:collection/:id`, `POST /api/:collection`, `PATCH /api/:collection/:id` e `DELETE /api/:collection/:id`.
