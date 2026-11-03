import { Router } from 'express';
import { usuariosControlador } from '../controladores/usuarios.controlador.js';
import { autenticarApiKey } from '../middlewares/autenticacao.js';

export const usuariosRotas = Router();

// Aplica autenticação por chave de API
usuariosRotas.use(autenticarApiKey);

usuariosRotas.get('/usuarios', usuariosControlador.listar);
usuariosRotas.get('/usuarios/:id', usuariosControlador.obterPorId);
usuariosRotas.post('/usuarios', usuariosControlador.criar);
