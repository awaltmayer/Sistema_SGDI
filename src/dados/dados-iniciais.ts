// Dados iniciais tipados para o modelo de quadro do sistema (100% em Português).

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
  posicao: number;
  itens: ItemListaVerificacao[];

  // Aliases
  card_id?: string;
  title?: string;
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

  // Aliases
  paused_at?: string;
  resumed_at?: string | null;
  duration_seconds?: number;
  reason?: string;
}
export type TimePauseLog = RegistroPausaTempo;

export interface RastreadorTempoTarefa {
  em_execucao: boolean;
  iniciado_em?: string | null;
  tempo_total_segundos: number;
  ultima_acao_em?: string;
  pausas: RegistroPausaTempo[];

  // Aliases
  is_running?: boolean;
  started_at?: string | null;
  total_spent_seconds?: number;
  last_action_at?: string;
  pauses?: RegistroPausaTempo[];
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

  // Aliases para retrocompatibilidade
  user_id?: string;
  card_id?: string;
  author_id?: string;
  body?: string;
  created_at?: string;
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

export const membrosEquipe: MembroEquipe[] = [
  {
    id: '1',
    nome_completo: 'Enio Muliterno Neto',
    iniciais: 'EN',
    email: '1138165@atitus.edu.br',
    funcao: 'owner',
    status: 'active',
    url_avatar: null,
    full_name: 'Enio Muliterno Neto',
    initials: 'EN',
    role: 'owner',
    avatar_url: null,
  },
  {
    id: '2',
    nome_completo: 'Augusto Wolfart Altmayer',
    iniciais: 'AA',
    email: '1138100@atitus.edu.br',
    funcao: 'member',
    status: 'active',
    url_avatar: null,
    full_name: 'Augusto Wolfart Altmayer',
    initials: 'AA',
    role: 'member',
    avatar_url: null,
  },
  {
    id: '3',
    nome_completo: 'Ricardo Pereira Drews',
    iniciais: 'RD',
    email: '1138132@atitus.edu.br',
    funcao: 'member',
    status: 'active',
    url_avatar: null,
    full_name: 'Ricardo Pereira Drews',
    initials: 'RD',
    role: 'member',
    avatar_url: null,
  },
  {
    id: '4',
    nome_completo: 'Luiz Henrique Appelt Weller',
    iniciais: 'LW',
    email: '1138930@atitus.edu.br',
    funcao: 'member',
    status: 'active',
    url_avatar: null,
    full_name: 'Luiz Henrique Appelt Weller',
    initials: 'LW',
    role: 'member',
    avatar_url: null,
  },
];

export const usuarioAtual: PerfilUsuario = {
  id: '1',
  nome_completo: 'Enio Muliterno Neto',
  iniciais: 'EN',
  email: '1138165@atitus.edu.br',
  tema: 'system',
  url_avatar: null,
  full_name: 'Enio Muliterno Neto',
  initials: 'EN',
  theme: 'system',
  avatar_url: null,
};

export const cartoes: CartaoTarefa[] = [
  {
    id: '1',
    titulo: 'Auditoria do sistema de design',
    descricao: 'Audite os tokens e a biblioteca de componentes atuais. Documente as lacunas e proponha atualizações antes do kickoff do sprint do Q2.',
    coluna: 'todo',
    prioridade: 'high',
    complexidade: 'high',
    id_responsavel: '1',
    data_vencimento: '2026-07-08',
    posicao: 0,
    criado_em: '2026-06-28T09:00:00Z',
    cor: 'blue',
    rastreador_tempo: {
      em_execucao: false,
      tempo_total_segundos: 5400,
      pausas: [{ id: 'pause-1', pausado_em: '2026-06-29T10:00:00Z', retomado_em: '2026-06-29T10:30:00Z', duracao_segundos: 1800, motivo: 'Reunião de alinhamento' }],
    },
    // Compatibilidade
    title: 'Auditoria do sistema de design',
    description: 'Audite os tokens e a biblioteca de componentes atuais. Documente as lacunas e proponha atualizações antes do kickoff do sprint do Q2.',
    column: 'todo',
    priority: 'high',
    complexity: 'high',
    assignee_id: '1',
    due_date: '2026-07-08',
    position: 0,
    created_at: '2026-06-28T09:00:00Z',
    color: 'blue',
  },
  {
    id: '2',
    titulo: 'Escrever documentação de onboarding',
    descricao: 'Crie um guia passo a passo para novos membros da equipe.',
    coluna: 'todo',
    prioridade: 'low',
    complexidade: 'low',
    id_responsavel: '4',
    data_vencimento: '2026-07-12',
    posicao: 1,
    criado_em: '2026-07-01T10:00:00Z',
    rastreador_tempo: { em_execucao: false, tempo_total_segundos: 3600, pausas: [] },
    // Compatibilidade
    title: 'Escrever documentação de onboarding',
    description: 'Crie um guia passo a passo para novos membros da equipe.',
    column: 'todo',
    priority: 'low',
    complexity: 'low',
    assignee_id: '4',
    due_date: '2026-07-12',
    position: 1,
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: '3',
    titulo: 'Atualizar página de preços',
    descricao: 'Revise o texto e o layout da página de preços.',
    coluna: 'todo',
    prioridade: 'medium',
    complexidade: 'medium',
    id_responsavel: '2',
    data_vencimento: '2026-07-15',
    posicao: 2,
    criado_em: '2026-07-02T11:00:00Z',
    rastreador_tempo: { em_execucao: false, tempo_total_segundos: 7200, pausas: [] },
    // Compatibilidade
    title: 'Atualizar página de preços',
    description: 'Revise o texto e o layout da página de preços.',
    column: 'todo',
    priority: 'medium',
    complexity: 'medium',
    assignee_id: '2',
    due_date: '2026-07-15',
    position: 2,
    created_at: '2026-07-02T11:00:00Z',
  },
  {
    id: '4',
    titulo: 'Auditoria de acessibilidade',
    descricao: 'Execute uma auditoria de acessibilidade em todas as páginas públicas e produza um relatório de conformidade WCAG 2.1 AA.',
    coluna: 'todo',
    prioridade: 'high',
    complexidade: 'very-high',
    id_responsavel: '3',
    data_vencimento: '2026-07-20',
    posicao: 3,
    criado_em: '2026-07-03T09:30:00Z',
    rastreador_tempo: {
      em_execucao: false,
      tempo_total_segundos: 14400,
      pausas: [
        {
          id: 'pause-3',
          pausado_em: '2026-07-04T11:00:00Z',
          retomado_em: '2026-07-04T12:00:00Z',
          duracao_segundos: 3600,
          motivo: 'Bloqueio técnico / dependência',
        },
      ],
    },
    // Compatibilidade
    title: 'Auditoria de acessibilidade',
    description: 'Execute uma auditoria de acessibilidade em todas as páginas públicas e produza um relatório de conformidade WCAG 2.1 AA.',
    column: 'todo',
    priority: 'high',
    complexity: 'very-high',
    assignee_id: '3',
    due_date: '2026-07-20',
    position: 3,
    created_at: '2026-07-03T09:30:00Z',
  },
];

export const comentarios: Comentario[] = [
  {
    id: '1',
    id_cartao: '1',
    id_autor: '1',
    conteudo: 'Arquivo de tokens atualizado — precisa de revisão por pares.',
    criado_em: '2026-07-06T10:00:00Z',
    card_id: '1',
    author_id: '1',
    body: 'Arquivo de tokens atualizado — precisa de revisão por pares.',
    created_at: '2026-07-06T10:00:00Z',
  },
  {
    id: '2',
    id_cartao: '1',
    id_autor: '2',
    conteudo: 'Claro — vou revisar até o fim do dia.',
    criado_em: '2026-07-07T14:30:00Z',
    card_id: '1',
    author_id: '2',
    body: 'Claro — vou revisar até o fim do dia.',
    created_at: '2026-07-07T14:30:00Z',
  },
];
