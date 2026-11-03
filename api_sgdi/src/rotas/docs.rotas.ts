import { Router } from 'express';
import { especificacaoOpenApi } from '../docs/swagger.js';

export const docsRotas = Router();

// Endpoint para obter a especificação OpenAPI em formato JSON puro
docsRotas.get('/docs/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json(especificacaoOpenApi);
});

// Template HTML interativo do Swagger UI integrado
const htmlSwaggerInterativo = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Documentação Interativa - API SGDI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .topbar-sgdi {
      background: #0f172a;
      color: #ffffff;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .topbar-sgdi h1 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      letter-spacing: -0.025em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .topbar-sgdi a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.85rem;
      border: 1px solid #334155;
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .topbar-sgdi a:hover {
      color: #ffffff;
      background: #1e293b;
      border-color: #475569;
    }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 25px 0; }
    .swagger-ui .scheme-container {
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border-radius: 8px;
      margin-bottom: 20px;
      padding: 15px;
    }
  </style>
</head>
<body>
  <div class="topbar-sgdi">
    <h1>🚀 Sistema SGDI &bull; Documentação Interativa da API REST</h1>
    <a href="/api/docs/openapi.json" target="_blank">📄 Baixar OpenAPI JSON</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/docs/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        displayRequestDuration: true,
        persistAuthorization: true
      });
    };
  </script>
</body>
</html>`;

// Rota para a interface interativa (atende tanto /docs quanto /docs/)
docsRotas.get(['/docs', '/docs/'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(htmlSwaggerInterativo);
});
