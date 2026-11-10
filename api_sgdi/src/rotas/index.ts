import { Router } from 'express';
import { docsRotas } from './docs.rotas.js';
import { statusRotas } from './status.rotas.js';
import { demandasRotas } from './demandas.rotas.js';
import { usuariosRotas } from './usuarios.rotas.js';

export const rotasApi = Router();

// Endpoint raiz do prefixo /api
rotasApi.get('/', (req, res) => {
  res.status(200).json({
    sucesso: true,
    servico: 'API REST SGDI',
    versao: '1.0.0',
    status: 'operacional',
    documentacao: '/api/docs',
    especificacao: '/api/docs/openapi.json',
    healthcheck: '/api/status',
  });
});

// 1. Rotas públicas (Documentação e Healthcheck)
rotasApi.use(docsRotas);
rotasApi.use(statusRotas);

// 2. Rotas protegidas (Demandas e Usuários)
rotasApi.use(demandasRotas);
rotasApi.use(usuariosRotas);
