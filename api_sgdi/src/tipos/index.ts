// Tipos e Interfaces padronizadas da API SGDI

export type PrioridadeDemanda = 'low' | 'medium' | 'high';
export type ColunaDemanda = 'todo' | 'in-progress' | 'done';
export type FuncaoUsuario = 'owner' | 'admin' | 'member' | 'Membro' | 'Administrador' | 'Proprietário';
export type StatusUsuario = 'active' | 'pending' | 'removed';

export interface Demanda {
  id: number | string;
  id_usuario: string | null;
  titulo: string;
  descricao: string;
  coluna: ColunaDemanda | string;
  prioridade: PrioridadeDemanda | string;
  data_vencimento: string | null;
  posicao: number;
  ids_responsaveis: (string | number)[];
  criado_em: string;
}

export interface CriarDemandaDTO {
  titulo: string;
  descricao?: string;
  coluna?: ColunaDemanda | string;
  prioridade?: PrioridadeDemanda | string;
  data_vencimento?: string | null;
  posicao?: number;
  id_usuario?: string | null;
  ids_responsaveis?: (string | number)[];
}

export interface AtualizarDemandaDTO {
  titulo?: string;
  descricao?: string;
  coluna?: ColunaDemanda | string;
  prioridade?: PrioridadeDemanda | string;
  data_vencimento?: string | null;
  posicao?: number;
  id_usuario?: string | null;
  ids_responsaveis?: (string | number)[];
}

export interface Usuario {
  id: number | string;
  id_usuario?: string | null;
  nome_completo: string;
  iniciais: string;
  email: string;
  funcao: string;
  status: string;
  url_avatar?: string | null;
  criado_em: string;
}

export interface CriarUsuarioDTO {
  nome_completo: string;
  email: string;
  funcao?: string;
  status?: string;
  iniciais?: string;
  url_avatar?: string | null;
}

export interface Comentario {
  id: number | string;
  id_cartao: number | string;
  id_autor: number | string;
  autor_nome?: string;
  conteudo: string;
  criado_em: string;
}

export interface CriarComentarioDTO {
  id_autor: number | string;
  conteudo: string;
}

export interface ApiResponse<T = unknown> {
  sucesso: boolean;
  mensagem?: string;
  dados?: T;
  meta?: {
    total?: number;
    pagina?: number;
    limite?: number;
    total_paginas?: number;
  };
}

export interface ApiErrorResponse {
  sucesso: false;
  erro: string;
  mensagem: string;
  detalhes?: unknown;
}
