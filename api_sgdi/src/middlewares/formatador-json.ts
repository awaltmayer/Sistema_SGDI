import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware para garantir que as rotas da API respondam com o cabeçalho JSON,
 * exceto as páginas da documentação interativa (HTML, CSS, JS).
 */
export function formatadorJson(req: Request, res: Response, next: NextFunction): void {
  // Não aplica Content-Type JSON para a interface gráfica da documentação
  if (req.path.startsWith('/docs') && !req.path.endsWith('.json')) {
    return next();
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
}
