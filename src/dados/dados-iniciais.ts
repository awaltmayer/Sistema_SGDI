// Dados iniciais tipados para o modelo de quadro do sistema.

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
  full_name: string;
  initials: string;
  email: string;
  role: FuncaoMembro;
  status: StatusMembro;
  avatar_url?: string | null;
}
export type TeamMember = MembroEquipe;

export interface ItemListaVerificacao {
  id: string;
  title: string;
  is_completed: boolean;
  position: number;
}
export type ChecklistItem = ItemListaVerificacao;

export interface ListaVerificacao {
  id: string;
  card_id: string;
  title: string;
  position: number;
  items: ItemListaVerificacao[];
}
export type Checklist = ListaVerificacao;

export interface RegistroPausaTempo {
  id: string;
  paused_at: string;
  resumed_at?: string | null;
  duration_seconds: number;
  reason: string;
}
export type TimePauseLog = RegistroPausaTempo;

export interface RastreadorTempoTarefa {
  is_running: boolean;
  started_at?: string | null;
  total_spent_seconds: number;
  last_action_at?: string;
  pauses: RegistroPausaTempo[];
}
export type TaskTimeTracker = RastreadorTempoTarefa;

export interface CartaoTarefa {
  id: string;
  title: string;
  description: string;
  column: IdColuna;
  priority: Prioridade;
  complexity?: Complexidade;
  time_tracker?: RastreadorTempoTarefa;
  assignee_id: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  checklists?: ListaVerificacao[];
  color?: string | null;
}
export type Card = CartaoTarefa;

export interface Comentario {
  id: string;
  card_id: string;
  author_id: string;
  body: string;
  created_at: string;
}
export type Comment = Comentario;

export interface PerfilUsuario {
  id: string;
  full_name: string;
  initials: string;
  email: string;
  theme: Tema;
  avatar_url?: string | null;
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

export interface LinksRodape {
  product: LinkRodape[];
  company: LinkRodape[];
  legal: LinkRodape[];
}
export type FooterLinks = LinksRodape;

export const colunas: Coluna[] = [
  { id: 'todo', label: 'A fazer', icon: 'circle-dashed' },
  { id: 'in-progress', label: 'Em andamento', icon: 'progress' },
  { id: 'done', label: 'Concluído', icon: 'circle-check' },
];
export const columns = colunas;

export const membrosEquipe: MembroEquipe[] = [
  { id: '1138165', full_name: 'Enio Muliterno Neto', initials: 'EN', email: '1138165@atitus.edu.br', role: 'owner', status: 'active', avatar_url: null },
  { id: '1138100', full_name: 'Augusto Wolfart Altmayer', initials: 'AA', email: '1138100@atitus.edu.br', role: 'member', status: 'active', avatar_url: null },
  { id: '1138132', full_name: 'Ricardo Pereira Drews', initials: 'RD', email: '1138132@atitus.edu.br', role: 'member', status: 'active', avatar_url: null },
  { id: '1138930', full_name: 'Luiz Henrique Appelt Weller', initials: 'LW', email: '1138930@atitus.edu.br', role: 'member', status: 'active', avatar_url: null },
];
export const teamMembers = membrosEquipe;

export const usuarioAtual: PerfilUsuario = {
  id: '1138165',
  full_name: 'Enio Muliterno Neto',
  initials: 'EN',
  email: '1138165@atitus.edu.br',
  theme: 'system',
  avatar_url: null,
};
export const currentUser = usuarioAtual;

export const cartoes: CartaoTarefa[] = [
  // A fazer (4 cards)
  {
    id: 'c1',
    title: 'Auditoria do sistema de design',
    description: 'Audite os tokens e a biblioteca de componentes atuais. Documente as lacunas e proponha atualizações antes do kickoff do sprint do Q2.',
    column: 'todo',
    priority: 'high',
    complexity: 'high',
    assignee_id: '1138165',
    due_date: '2026-07-08',
    position: 0,
    created_at: '2026-06-28T09:00:00Z',
    color: 'blue',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 5400, // 1.5h
      pauses: [
        {
          id: 'pause-1',
          paused_at: '2026-06-29T10:00:00Z',
          resumed_at: '2026-06-29T10:30:00Z',
          duration_seconds: 1800,
          reason: 'Reunião de alinhamento com stakeholders',
        },
      ],
    },
    checklists: [
      {
        id: 'chk-1',
        card_id: 'c1',
        title: 'Checklist de Design',
        position: 0,
        items: [
          { id: 'item-1', title: 'Auditar paleta de cores e contraste WCAG', is_completed: true, position: 0 },
          { id: 'item-2', title: 'Mapear todos os botões e variantes', is_completed: true, position: 1 },
          { id: 'item-3', title: 'Revisar tipografia e espaçamentos', is_completed: false, position: 2 },
          { id: 'item-4', title: 'Validar tokens do modo escuro', is_completed: false, position: 3 },
        ],
      },
      {
        id: 'chk-2',
        card_id: 'c1',
        title: 'Checklist de Revisão',
        position: 1,
        items: [
          { id: 'item-5', title: 'Apresentar proposta para o time de Design', is_completed: false, position: 0 },
          { id: 'item-6', title: 'Aprovação final do Tech Lead', is_completed: false, position: 1 },
        ],
      },
    ],
  },
  {
    id: 'c2',
    title: 'Escrever documentação de onboarding',
    description: 'Crie um guia passo a passo para novos membros da equipe que entrarem no quadro.',
    column: 'todo',
    priority: 'low',
    complexity: 'low',
    assignee_id: '1138930',
    due_date: '2026-07-12',
    position: 1,
    created_at: '2026-07-01T10:00:00Z',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 3600, // 1h
      pauses: [],
    },
  },
  {
    id: 'c3',
    title: 'Atualizar página de preços',
    description: 'Revise o texto e o layout da página de preços com base no relatório de feedback dos clientes do Q1.',
    column: 'todo',
    priority: 'medium',
    complexity: 'medium',
    assignee_id: '1138100',
    due_date: '2026-07-15',
    position: 2,
    created_at: '2026-07-02T11:00:00Z',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 7200, // 2h
      pauses: [
        {
          id: 'pause-2',
          paused_at: '2026-07-03T14:00:00Z',
          resumed_at: '2026-07-03T14:45:00Z',
          duration_seconds: 2700,
          reason: 'Aguardando aprovação / cliente',
        },
      ],
    },
  },
  {
    id: 'c4',
    title: 'Auditoria de acessibilidade',
    description: 'Execute uma auditoria de acessibilidade em todas as páginas públicas e produza um relatório de conformidade WCAG 2.1 AA.',
    column: 'todo',
    priority: 'high',
    complexity: 'very-high',
    assignee_id: '1138132',
    due_date: '2026-07-20',
    position: 3,
    created_at: '2026-07-03T09:30:00Z',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 14400, // 4h
      pauses: [
        {
          id: 'pause-3',
          paused_at: '2026-07-04T11:00:00Z',
          resumed_at: '2026-07-04T12:00:00Z',
          duration_seconds: 3600,
          reason: 'Bloqueio técnico / dependência',
        },
      ],
    },
  },
  // Em andamento (3 cards)
  {
    id: 'c5',
    title: 'Integração de API',
    description: 'Integre a API de análise de terceiros. Implemente autenticação, busca de dados e tratamento de erros.',
    column: 'in-progress',
    priority: 'medium',
    complexity: 'high',
    assignee_id: '1138100',
    due_date: '2026-07-05',
    position: 0,
    created_at: '2026-06-20T14:00:00Z',
    color: 'purple',
    time_tracker: {
      is_running: true,
      started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      total_spent_seconds: 25200, // 7h
      pauses: [
        {
          id: 'pause-4',
          paused_at: '2026-06-22T12:00:00Z',
          resumed_at: '2026-06-22T13:00:00Z',
          duration_seconds: 3600,
          reason: 'Intervalo / Almoço',
        },
        {
          id: 'pause-5',
          paused_at: '2026-06-23T15:00:00Z',
          resumed_at: '2026-06-23T15:30:00Z',
          duration_seconds: 1800,
          reason: 'Aguardando aprovação / cliente',
        },
      ],
    },
    checklists: [
      {
        id: 'chk-3',
        card_id: 'c5',
        title: 'Checklist de Integração',
        position: 0,
        items: [
          { id: 'item-7', title: 'Configurar credenciais e variáveis de ambiente', is_completed: true, position: 0 },
          { id: 'item-8', title: 'Criar cliente de requisições com retry automático', is_completed: true, position: 1 },
          { id: 'item-9', title: 'Implementar tratamento de erros e fallbacks', is_completed: false, position: 2 },
        ],
      },
    ],
  },
  {
    id: 'c6',
    title: 'Passagem de QA 2',
    description: 'Segunda rodada de QA cobrindo casos de borda identificados na primeira etapa. Foco em breakpoints mobile.',
    column: 'in-progress',
    priority: 'high',
    complexity: 'medium',
    assignee_id: '1138165',
    due_date: '2026-07-06',
    position: 1,
    created_at: '2026-06-22T10:00:00Z',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 18000, // 5h
      pauses: [
        {
          id: 'pause-6',
          paused_at: '2026-06-23T10:00:00Z',
          resumed_at: '2026-06-23T10:30:00Z',
          duration_seconds: 1800,
          reason: 'Reunião de alinhamento com stakeholders',
        },
        {
          id: 'pause-7',
          paused_at: '2026-06-24T16:00:00Z',
          resumed_at: '2026-06-24T16:40:00Z',
          duration_seconds: 2400,
          reason: 'Bloqueio técnico / dependência',
        },
      ],
    },
  },
  {
    id: 'c7',
    title: 'Notificações por e-mail',
    description: 'Crie templates de e-mails transacionais e conecte os gatilhos de notificação no backend.',
    column: 'in-progress',
    priority: 'low',
    complexity: 'low',
    assignee_id: '1138930',
    due_date: '2026-07-09',
    position: 2,
    created_at: '2026-06-25T09:00:00Z',
    time_tracker: {
      is_running: true,
      started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      total_spent_seconds: 7200, // 2h
      pauses: [
        {
          id: 'pause-8',
          paused_at: '2026-06-26T12:30:00Z',
          resumed_at: '2026-06-26T13:30:00Z',
          duration_seconds: 3600,
          reason: 'Intervalo / Almoço',
        },
      ],
    },
  },
  // Concluído (5 cards)
  {
    id: 'c8',
    title: 'Fluxo de autenticação',
    description: 'Implemente fluxos de cadastro, login, OAuth e confirmação por e-mail.',
    column: 'done',
    priority: 'high',
    complexity: 'very-high',
    assignee_id: '1138930',
    due_date: null,
    position: 0,
    created_at: '2026-06-10T09:00:00Z',
    color: 'green',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 43200, // 12h
      pauses: [
        {
          id: 'pause-9',
          paused_at: '2026-06-11T11:00:00Z',
          resumed_at: '2026-06-11T12:00:00Z',
          duration_seconds: 3600,
          reason: 'Reunião de alinhamento com stakeholders',
        },
        {
          id: 'pause-10',
          paused_at: '2026-06-13T15:00:00Z',
          resumed_at: '2026-06-13T16:00:00Z',
          duration_seconds: 3600,
          reason: 'Revisão de código / PR Review',
        },
      ],
    },
    checklists: [
      {
        id: 'chk-4',
        card_id: 'c8',
        title: 'Critérios de Aceite',
        position: 0,
        items: [
          { id: 'item-10', title: 'Login com e-mail e senha funcionando', is_completed: true, position: 0 },
          { id: 'item-11', title: 'Autenticação social via Google e Apple', is_completed: true, position: 1 },
          { id: 'item-12', title: 'Recuperação e redefinição de senha', is_completed: true, position: 2 },
          { id: 'item-13', title: 'Sessão persistente com refresh token', is_completed: true, position: 3 },
        ],
      },
    ],
  },
  {
    id: 'c9',
    title: 'Esquema do banco',
    description: 'Desenhe e migre o esquema inicial do Supabase para cartões, comentários e membros da equipe.',
    column: 'done',
    priority: 'medium',
    complexity: 'high',
    assignee_id: '1138100',
    due_date: null,
    position: 1,
    created_at: '2026-06-12T10:30:00Z',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 28800, // 8h
      pauses: [
        {
          id: 'pause-11',
          paused_at: '2026-06-13T10:00:00Z',
          resumed_at: '2026-06-13T11:00:00Z',
          duration_seconds: 3600,
          reason: 'Bloqueio técnico / dependência',
        },
      ],
    },
  },
  {
    id: 'c10',
    title: 'Página inicial',
    description: 'Construa a landing page marketing com hero, showcase de recursos, depoimentos e rodapé.',
    column: 'done',
    priority: 'low',
    complexity: 'medium',
    assignee_id: '1138165',
    due_date: null,
    position: 2,
    created_at: '2026-06-14T14:00:00Z',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 18000, // 5h
      pauses: [
        {
          id: 'pause-12',
          paused_at: '2026-06-15T12:00:00Z',
          resumed_at: '2026-06-15T13:00:00Z',
          duration_seconds: 3600,
          reason: 'Intervalo / Almoço',
        },
      ],
    },
  },
  {
    id: 'c11',
    title: 'Entrevistas com usuários',
    description: 'Realize 5 entrevistas com usuários para validar o design da aba de detalhes do cartão. Resuma os achados.',
    column: 'done',
    priority: 'high',
    complexity: 'high',
    assignee_id: '1138132',
    due_date: null,
    position: 3,
    created_at: '2026-06-16T11:00:00Z',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 21600, // 6h
      pauses: [
        {
          id: 'pause-13',
          paused_at: '2026-06-17T11:00:00Z',
          resumed_at: '2026-06-17T12:00:00Z',
          duration_seconds: 3600,
          reason: 'Reunião de alinhamento com stakeholders',
        },
      ],
    },
  },
  {
    id: 'c12',
    title: 'Análise competitiva',
    description: 'Pesquise 6 ferramentas PM concorrentes e documente as lacunas de recursos relevantes para nossa roadmap do Q2.',
    column: 'done',
    priority: 'low',
    complexity: 'low',
    assignee_id: '1138132',
    due_date: null,
    position: 4,
    created_at: '2026-06-18T09:00:00Z',
    time_tracker: {
      is_running: false,
      total_spent_seconds: 10800, // 3h
      pauses: [
        {
          id: 'pause-14',
          paused_at: '2026-06-18T11:30:00Z',
          resumed_at: '2026-06-18T12:00:00Z',
          duration_seconds: 1800,
          reason: 'Pesquisa e benchmark externo',
        },
      ],
    },
  },
];
export const cards = cartoes;

export const comentarios: Comentario[] = [
  { id: 'cm1', card_id: 'c1', author_id: '1138165', body: 'Arquivo de tokens atualizado — precisa de revisão por pares.', created_at: '2026-07-06T10:00:00Z' },
  { id: 'cm2', card_id: 'c1', author_id: '1138100', body: 'Claro — vou revisar até o fim do dia.', created_at: '2026-07-07T14:30:00Z' },
];
export const comments = comentarios;

export const depoimentos: Depoimento[] = [
  { id: 't1', quote: 'Reduzimos nossa daily semanal de 30 minutos para 10. Tudo que a equipe precisa está em um único quadro.', author: 'Priya Nair', title: 'Gerente de Engenharia', company: 'Stackform', initials: 'PN', isPrimary: true },
  { id: 't2', quote: 'Finalmente um quadro que não exige tutorial.', author: 'David Lim', title: 'Líder de Produto', company: 'Loopcast', initials: 'DL', isPrimary: false },
];
export const testimonials = depoimentos;

export const abasRecurso: AbaRecurso[] = [
  { id: 'drag', label: 'Arrastar cartões', description: 'Mova tarefas de A fazer → Em andamento → Concluído em um gesto.', mockupId: 'drag' },
  { id: 'inline', label: 'Editar inline', description: 'Clique em qualquer badge de prioridade, avatar de responsável ou data de vencimento para atualizar sem abrir um modal.', mockupId: 'inline' },
  { id: 'details', label: 'Abrir detalhes', description: 'Clique no corpo de um cartão para abrir título, descrição e comentários em um painel lateral focado.', mockupId: 'details' },
];
export const featureTabs = abasRecurso;

export const iconesRecurso: IconeRecurso[] = [
  { id: 'analytics', icon: 'BarChart2', label: 'Analytics', description: 'Acompanhe o progresso em uma olhada.' },
  { id: 'collab', icon: 'Users', label: 'Colaboração', description: 'Feito para toda a sua equipe.' },
  { id: 'editing', icon: 'Zap', label: 'Edição inline', description: 'Edições em um clique, sem modais.' },
];
export const featureIcons = iconesRecurso;

export const linksRodape: LinksRodape = {
  product: [{ label: 'Quadro', href: '/demo/board' }, { label: 'Painel', href: '/demo/dashboard' }, { label: 'Configurações', href: '/demo/settings' }],
  company: [{ label: 'Sobre', href: '#' }, { label: 'Blog', href: '#' }],
  legal: [{ label: 'Privacidade', href: '#' }, { label: 'Termos', href: '#' }],
};
export const footerLinks = linksRodape;




