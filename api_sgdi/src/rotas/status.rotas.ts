import { Router } from 'express';
import { statusControlador } from '../controladores/status.controlador.js';

export const statusRotas = Router();

// Rota pública de status / healthcheck
statusRotas.get('/status', statusControlador.obterStatus);
