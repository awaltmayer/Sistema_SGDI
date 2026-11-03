import { Router } from 'express';
import { demandasControlador } from '../controladores/demandas.controlador.js';
import { autenticarApiKey } from '../middlewares/autenticacao.js';

export const demandasRotas = Router();

// Aplica autenticação por chave de API em todas as rotas de demandas
demandasRotas.use(autenticarApiKey);

// CRUD de Demandas do SGDI
demandasRotas.get('/demandas', demandasControlador.listar);
demandasRotas.get('/demandas/:id', demandasControlador.obterPorId);
demandasRotas.post('/demandas', demandasControlador.criar);
demandasRotas.put('/demandas/:id', demandasControlador.atualizar);
demandasRotas.patch('/demandas/:id', demandasControlador.atualizar);
demandasRotas.delete('/demandas/:id', demandasControlador.excluir);

// Sub-recurso: Comentários
demandasRotas.get('/demandas/:id/comentarios', demandasControlador.listarComentarios);
demandasRotas.post('/demandas/:id/comentarios', demandasControlador.adicionarComentario);
