// Tipos de domínio e configurações estruturais do modelo de quadro do sistema SGDI.

export type Prioridade = 'high' | 'medium' | 'low';
export type Priority = Prioridade;

export type Complexidade = 'low' | 'medium' | 'high' | 'very-high';
export type Complexity = Complexidade;

export type IdColuna = 'todo' | 'in-progress' | 'done';
export type ColumnId = IdColuna;

export type FuncaoMembro = 'owner' | 'admin' | 'member';
export type Role = FuncaoMembro;

export type StatusMembro = 'active' | 'pending' | 'removed';
export type MemberStatus = StatusMembro;

export type Tema = 'light' | 'dark' | 'system';
export type Theme = Tema;

export type IconeColuna = 'circle-dashed' | 'progress' | 'circle-check';
export type ColumnIcon = IconeColuna;

export interface ItemConfiguracaoComplexidade {
  label: string;
  dot: string;
  badge: string;
  color: string;
  estimatedHours: number;
}
export type ComplexityConfigItem = ItemConfiguracaoComplexidade;

export const configuracaoComplexidade: Record<Complexidade, ItemConfiguracaoComplexidade> = {
  low: {
    label: 'Baixa',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    color: '#10b981',
    estimatedHours: 2,
  },
  medium: {
    label: 'Média',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
    color: '#f59e0b',
    estimatedHours: 4,
  },
  high: {
    label: 'Alta',
    dot: 'bg-orange-500',
    badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20',
    color: '#f97316',
    estimatedHours: 8,
  },
  'very-high': {
    label: 'Muito Alta',
    dot: 'bg-purple-500',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20',
    color: '#8b5cf6',
    estimatedHours: 16,
  },
};
export const complexityConfig = configuracaoComplexidade;

export interface Coluna {
  id: IdColuna;
  label: string;
  icon: IconeColuna;
}
export type Column = Coluna;

export interface MembroEquipe {
  id: string;
  id_usuario?: string;
  id_usuario_membro?: string | null;
  nome_completo: string;
  iniciais: string;
  email: string;
  funcao: FuncaoMembro;
  status: StatusMembro;
  url_avatar?: string | null;
  convidado_em?: string | null;
  criado_em?: string;

  // Aliases para compatibilidade
  full_name?: string;
  initials?: string;
  role?: FuncaoMembro;
  avatar_url?: string | null;
  invited_at?: string | null;
  created_at?: string;
  user_id?: string;
  member_user_id?: string | null;
}
export type TeamMember = MembroEquipe;

export interface ItemListaVerificacao {
  id: string;
  titulo: string;
  esta_concluido: boolean;
  posicao: number;

  // Aliases
  title?: string;
  is_completed?: boolean;
  position?: number;
}
export type ChecklistItem = ItemListaVerificacao;

export interface ListaVerificacao {
  id: string;
  id_cartao: string;
  titulo: string;
  prioridade?: Prioridade;
  posicao: number;
  itens: ItemListaVerificacao[];

  // Aliases
  card_id?: string;
  title?: string;
  priority?: Prioridade;
  position?: number;
  items?: ItemListaVerificacao[];
}
export type Checklist = ListaVerificacao;

export interface RegistroPausaTempo {
  id: string;
  pausado_em: string;
  retomado_em?: string | null;
  duracao_segundos: number;
  motivo: string;
  usuario_id?: string | null;
  usuario_nome?: string | null;
  usuario_email?: string | null;
  tipo?: 'pausa' | 'conclusao';

  // Aliases
  paused_at?: string;
  resumed_at?: string | null;
  duration_seconds?: number;
  reason?: string;
  user_name?: string | null;
  type?: 'pausa' | 'conclusao';
}
export type TimePauseLog = RegistroPausaTempo;

export interface RastreadorTempoTarefa {
  em_execucao: boolean;
  iniciado_em?: string | null;
  tempo_total_segundos: number;
  ultima_acao_em?: string;
  pausas: RegistroPausaTempo[];
  concluido_em?: string | null;
  concluido_por_nome?: string | null;
  concluido_por_email?: string | null;
  concluido_por_id?: string | null;

  // Aliases
  is_running?: boolean;
  started_at?: string | null;
  total_spent_seconds?: number;
  last_action_at?: string;
  pauses?: RegistroPausaTempo[];
  completed_at?: string | null;
  completed_by_name?: string | null;
}
export type TaskTimeTracker = RastreadorTempoTarefa;

export interface CartaoTarefa {
  id: string;
  id_usuario?: string;
  titulo: string;
  descricao: string;
  coluna: IdColuna;
  prioridade: Prioridade;
  complexidade?: Complexidade;
  rastreador_tempo?: RastreadorTempoTarefa;
  id_responsavel: string | null;
  ids_responsaveis?: string[];
  responsaveis?: MembroEquipe[];
  data_vencimento: string | null;
  posicao: number;
  criado_em: string;
  listas_verificacao?: ListaVerificacao[];
  cor?: string | null;

  // Aliases para retrocompatibilidade
  title?: string;
  description?: string;
  column?: IdColuna;
  priority?: Prioridade;
  complexity?: Complexidade;
  time_tracker?: RastreadorTempoTarefa;
  assignee_id?: string | null;
  assignee_ids?: string[];
  assignees?: MembroEquipe[];
  due_date?: string | null;
  position?: number;
  created_at?: string;
  checklists?: ListaVerificacao[];
  color?: string | null;
  user_id?: string;
}
export type Card = CartaoTarefa;

export interface Comentario {
  id: string;
  id_usuario?: string;
  id_cartao: string;
  id_autor: string;
  conteudo: string;
  criado_em: string;
  autor?: {
    id?: string;
    nome_completo?: string;
    iniciais?: string;
    url_avatar?: string | null;
  } | null;

  // Aliases para retrocompatibilidade
  user_id?: string;
  card_id?: string;
  author_id?: string;
  body?: string;
  created_at?: string;
  author?: {
    id?: string;
    full_name?: string;
    initials?: string;
    avatar_url?: string | null;
  } | null;
}
export type Comment = Comentario;

export interface PerfilUsuario {
  id: string;
  nome_completo: string;
  iniciais: string;
  email: string;
  tema: Tema;
  url_avatar?: string | null;
  criado_em?: string;

  // Aliases para retrocompatibilidade
  full_name?: string;
  initials?: string;
  theme?: Tema;
  avatar_url?: string | null;
  created_at?: string;
}
export type Profile = PerfilUsuario;

export interface Depoimento {
  id: string;
  quote: string;
  author: string;
  title: string;
  company: string;
  initials: string;
  isPrimary: boolean;
}
export type Testimonial = Depoimento;

export interface AbaRecurso {
  id: string;
  label: string;
  description: string;
  mockupId: string;
}
export type FeatureTab = AbaRecurso;

export interface IconeRecurso {
  id: string;
  icon: string;
  label: string;
  description: string;
}
export type FeatureIcon = IconeRecurso;

export interface LinkRodape {
  label: string;
  href: string;
}
export type FooterLink = LinkRodape;

export const colunas: Coluna[] = [
  { id: 'todo', label: 'A fazer', icon: 'circle-dashed' },
  { id: 'in-progress', label: 'Em andamento', icon: 'progress' },
  { id: 'done', label: 'Concluído', icon: 'circle-check' },
];
