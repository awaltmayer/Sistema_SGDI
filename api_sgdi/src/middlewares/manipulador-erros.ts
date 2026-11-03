import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware para rotas não encontradas (404 Not Found).
 * Sempre responde em JSON estruturado.
 */
export function rotaNaoEncontrada(req: Request, res: Response): void {
  res.status(404).json({
    sucesso: false,
    erro: 'Rota não encontrada',
    mensagem: `O caminho '${req.method} ${req.originalUrl}' não existe na API SGDI. Consulte a documentação em /api/docs`,
    codigo_status: 404,
  });
}

/**
 * Middleware global de tratamento de erros inesperados (500 ou 400 em erros de parse).
 */
export function manipuladorErros(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Erro de parsing de JSON no corpo da requisição (ex: JSON malformatado enviado pelo cliente)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    res.status(400).json({
      sucesso: false,
      erro: 'JSON Inválido',
      mensagem: 'O corpo da requisição contém JSON sintaticamente inválido.',
      detalhes: err.message,
      codigo_status: 400,
    });
    return;
  }

  console.error('[ERRO NÃO TRATADO NA API SGDI]:', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    sucesso: false,
    erro: err.name || 'Erro Interno do Servidor',
    mensagem: err.message || 'Ocorreu um erro inesperado ao processar sua requisição.',
    codigo_status: statusCode,
  });
}
