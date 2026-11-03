import type { Request, Response } from 'express';

const tempoInicio = Date.now();

export const statusControlador = {
  obterStatus(req: Request, res: Response): void {
    const uptimeSegundos = Math.floor((Date.now() - tempoInicio) / 1000);

    res.status(200).json({
      sucesso: true,
      servico: 'API REST - Sistema SGDI (Gestão de Demandas de TI)',
      versao: '1.0.0',
      status: 'operacional',
      timestamp: new Date().toISOString(),
      uptime_segundos: uptimeSegundos,
      documentacao: '/api/docs',
      rotas_disponiveis: {
        status: 'GET /api/status',
        documentacao: 'GET /api/docs',
        demandas: {
          listar: 'GET /api/demandas',
          obter_por_id: 'GET /api/demandas/:id',
          criar: 'POST /api/demandas',
          atualizar: 'PUT /api/demandas/:id (ou PATCH)',
          excluir: 'DELETE /api/demandas/:id',
          comentarios: {
            listar: 'GET /api/demandas/:id/comentarios',
            criar: 'POST /api/demandas/:id/comentarios',
          },
        },
        usuarios: {
          listar: 'GET /api/usuarios',
          obter_por_id: 'GET /api/usuarios/:id',
          criar: 'POST /api/usuarios',
        },
      },
    });
  },
};
