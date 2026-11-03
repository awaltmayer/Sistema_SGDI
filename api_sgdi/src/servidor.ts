import { app } from './app.js';
import { config } from './config/env.js';

const porta = config.porta;

app.listen(porta, () => {
  console.log(`=======================================================`);
  console.log(`🚀 API SGDI inicializada com sucesso!`);
  console.log(`📡 URL Base:        http://localhost:${porta}/api`);
  console.log(`📚 Documentação:    http://localhost:${porta}/api/docs`);
  console.log(`🔍 OpenAPI JSON:    http://localhost:${porta}/api/docs/openapi.json`);
  console.log(`🩺 Healthcheck:     http://localhost:${porta}/api/status`);
  console.log(`🔑 Autenticação:    Ativa via Header 'X-API-Key'`);
  console.log(`=======================================================`);
});
