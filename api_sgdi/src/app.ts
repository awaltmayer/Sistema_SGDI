import express from 'express';
import cors from 'cors';
import { formatadorJson } from './middlewares/formatador-json.js';
import { rotaNaoEncontrada, manipuladorErros } from './middlewares/manipulador-erros.js';
import { rotasApi } from './rotas/index.js';

export function criarApp() {
  const app = express();

  // Permite CORS para integrações seguras entre sistemas
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    })
  );

  // Parser de JSON com suporte a até 2MB
  app.use(express.json({ limit: '2mb' }));

  // Middleware para garantir Content-Type JSON padrão
  app.use('/api', formatadorJson);

  // Redirecionamento amigável da raiz para a documentação interativa
  app.get('/', (req, res) => {
    res.redirect('/api/docs');
  });

  // Todas as rotas da API começam com /api
  app.use('/api', rotasApi);

  // Captura rotas não encontradas (404)
  app.use(rotaNaoEncontrada);

  // Tratamento de erros não capturados (500)
  app.use(manipuladorErros);

  return app;
}

export const app = criarApp();
