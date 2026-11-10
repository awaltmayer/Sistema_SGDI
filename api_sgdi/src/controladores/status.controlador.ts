import type { Request, Response } from 'express';

const tempoInicio = Date.now();

export const statusControlador = {
  /**
   * GET /api/status
   * Healthcheck da API REST SGDI para monitoramento externo e integridade do serviço.
   */
  obterStatus(req: Request, res: Response): void {
    const uptimeSegundos = Math.floor((Date.now() - tempoInicio) / 1000);

    res.status(200).json({
      sucesso: true,
      servico: 'API REST SGDI',
      versao: '1.0.0',
      status: 'operacional',
      uptime_segundos: uptimeSegundos,
      timestamp: new Date().toISOString(),
      documentacao: '/api/docs',
    });
  },
};
