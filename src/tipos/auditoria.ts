// Tipos de dados e definições para a camada de logs de auditoria do Sistema SGDI

export type TipoAcaoAuditoria =
  | 'CRIACAO'
  | 'ATUALIZACAO'
  | 'EXCLUSAO'
  | 'MOVIMENTACAO'
  | 'STATUS'
  | 'CRONOMETRO'
  | 'CONFIGURACAO'
  | 'ACESSO';

export type TipoEntidadeAuditoria =
  | 'Demanda'
  | 'Checklist'
  | 'Comentário'
  | 'Cronômetro'
  | 'Sistema'
  | 'Perfil';

export interface LogAuditoria {
  id: string | number;
  id_usuario?: string | null;
  usuario_nome: string;
  usuario_email?: string | null;
  acao: TipoAcaoAuditoria;
  entidade: TipoEntidadeAuditoria;
  entidade_id?: string | null;
  entidade_titulo?: string | null;
  detalhes: string;
  metadados?: Record<string, unknown> | null;
  criado_em: string;
}

export interface EntradaRegistrarLog {
  acao: TipoAcaoAuditoria;
  entidade: TipoEntidadeAuditoria;
  entidade_id?: string | number | null;
  entidade_titulo?: string | null;
  detalhes: string;
  metadados?: Record<string, unknown>;
  usuario?: {
    id?: string | null;
    nome?: string | null;
    email?: string | null;
  };
}

export type PeriodoFiltroLogs = 'todos' | 'hoje' | '7dias' | '30dias';

export interface FiltrosLogs {
  termoBusca?: string;
  acao?: string;
  entidade?: string;
  periodo?: PeriodoFiltroLogs;
  idUsuario?: string;
}
