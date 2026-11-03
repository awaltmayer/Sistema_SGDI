import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

/**
 * Middleware para validar a chave de autenticação nas rotas protegidas.
 * Aceita a chave através dos cabeçalhos:
 *  - X-API-Key: <chave>
 *  - Authorization: Bearer <chave>
 *
 * Em caso de chave ausente ou inválida, retorna HTTP 401 Unauthorized em formato JSON.
 */
export function autenticarApiKey(req: Request, res: Response, next: NextFunction): void {
  const chaveApiKeyHeader = req.headers['x-api-key'] as string | undefined;
  const authHeader = req.headers['authorization'];

  let chaveFornecida: string | undefined = chaveApiKeyHeader;

  if (!chaveFornecida && authHeader && authHeader.startsWith('Bearer ')) {
    chaveFornecida = authHeader.substring(7).trim();
  }

  // Verifica se a chave foi fornecida
  if (!chaveFornecida) {
    res.status(401).json({
      sucesso: false,
      erro: 'Não autorizado',
      mensagem: "Chave de autenticação ausente. Forneça a chave no cabeçalho 'X-API-Key' ou 'Authorization: Bearer <chave>'.",
      codigo_status: 401,
    });
    return;
  }

  // Verifica se a chave corresponde à configurada no ambiente
  if (chaveFornecida !== config.chaveApi) {
    res.status(401).json({
      sucesso: false,
      erro: 'Não autorizado',
      mensagem: 'Chave de autenticação inválida. Acesso negado aos recursos do SGDI.',
      codigo_status: 401,
    });
    return;
  }

  next();
}
