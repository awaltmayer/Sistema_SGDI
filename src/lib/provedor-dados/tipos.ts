import type {
  CartaoTarefa,
  Comentario,
  MembroEquipe,
  PerfilUsuario,
  Prioridade,
  IdColuna,
  Tema,
  Complexidade,
  RastreadorTempoTarefa,
  ListaVerificacao,
  ItemListaVerificacao,
} from "@/dados/dados-iniciais";

// ── Aliases de Entidades ──────────────────────────────────────────────
export type Card = CartaoTarefa;
export type Comment = Comentario;
export type TeamMember = MembroEquipe;
export type Profile = PerfilUsuario;
export type Priority = Prioridade;
export type ColumnId = IdColuna;
export type Theme = Tema;
export type Complexity = Complexidade;
export type TaskTimeTracker = RastreadorTempoTarefa;
export type Checklist = ListaVerificacao;
export type ChecklistItem = ItemListaVerificacao;

// ── Tipos de Entrada ──────────────────────────────────────────────────

export interface EntradaCriarCartao {
  titulo?: string;
  title?: string;
  coluna?: IdColuna;
  column?: IdColuna;
  nextPosition?: number;
  posicao?: number;
  descricao?: string;
  description?: string;
  prioridade?: Prioridade;
  priority?: Prioridade;
  id_responsavel?: string | null;
  assignee_id?: string | null;
  ids_responsaveis?: string[] | null;
  assignee_ids?: string[] | null;
  data_vencimento?: string | null;
  due_date?: string | null;
  id?: string | number;
}
export type CreateCardInput = EntradaCriarCartao;

export interface EntradaAtualizarCartao {
  titulo?: string;
  title?: string;
  descricao?: string;
  description?: string;
  coluna?: IdColuna;
  column?: IdColuna;
  prioridade?: Prioridade;
  priority?: Prioridade;
  complexidade?: Complexidade;
  complexity?: Complexity;
  id_responsavel?: string | null;
  assignee_id?: string | null;
  ids_responsaveis?: string[] | null;
  assignee_ids?: string[] | null;
  data_vencimento?: string | null;
  due_date?: string | null;
  posicao?: number;
  position?: number;
  cor?: string | null;
  color?: string | null;
  rastreador_tempo?: TaskTimeTracker;
  time_tracker?: TaskTimeTracker;
}
export type UpdateCardInput = EntradaAtualizarCartao;

export interface EntradaReordenar {
  id: string;
  coluna?: IdColuna;
  column?: IdColuna;
  posicao?: number;
  position?: number;
}
export type ReorderInput = EntradaReordenar;

export interface EntradaCriarComentario {
  idCartao?: string;
  cardId?: string;
  idAutor?: string;
  authorId?: string;
  idUsuario?: string;
  userId?: string;
  conteudo?: string;
  body?: string;
}
export type CreateCommentInput = EntradaCriarComentario;

export interface EntradaAtualizarPerfil {
  nomeCompleto?: string;
  fullName?: string;
  iniciais?: string;
  initials?: string;
  email: string;
}
export type UpdateProfileInput = EntradaAtualizarPerfil;

export interface EntradaAtualizarSenha {
  currentPassword: string;
  newPassword: string;
}
export type UpdatePasswordInput = EntradaAtualizarSenha;

// ── Tipos de Agregação / Painel ───────────────────────────────────────

export interface KpisPainel {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}
export type DashboardKpis = KpisPainel;

export interface ConclusaoPorSemana {
  weekStart: string;
  count: number;
}
export type CompletionByWeek = ConclusaoPorSemana;

export interface RoscaPrioridade {
  priority: string;
  count: number;
}
export type PriorityDonut = RoscaPrioridade;

export interface VelocidadePorDia {
  date: string;
  count: number;
}
export type VelocityByDay = VelocidadePorDia;

// ── Cartão com Responsável Vinculado ──────────────────────────────────

export interface CartaoComResponsavel extends CartaoTarefa {
  responsavel?: {
    id: string;
    nome_completo: string;
    iniciais: string;
    url_avatar?: string | null;
    full_name?: string;
    initials?: string;
    avatar_url?: string | null;
  } | null;
  assignee?: {
    id: string;
    nome_completo: string;
    iniciais: string;
    url_avatar?: string | null;
    full_name?: string;
    initials?: string;
    avatar_url?: string | null;
  } | null;
}
export type CardWithAssignee = CartaoComResponsavel;

// ── Interface Central do Provedor de Dados ────────────────────────────

export interface ProvedorDadosApp {
  // Quadro
  useCards(): { data: CartaoComResponsavel[]; isLoading: boolean };
  useCard(id: string): { data: CartaoComResponsavel | null; isLoading: boolean };
  useCreateCard(): {
    mutate: (input: EntradaCriarCartao) => void;
    isPending: boolean;
  };
  useUpdateCard(): {
    mutate: (id: string, fields: EntradaAtualizarCartao) => void;
    isPending: boolean;
  };
  useDeleteCard(): {
    mutate: (id: string) => void;
    mutateAsync?: (id: string) => Promise<void>;
    isPending: boolean;
  };
  useReorderCards(): {
    mutate: (reordered: EntradaReordenar[]) => void;
    isPending: boolean;
  };

  // Checklists (até 5 por cartão)
  useCreateChecklist(): {
    mutate: (input: {
      cardId?: string;
      card_id?: string;
      title?: string;
      titulo?: string;
      prioridade?: Prioridade;
      priority?: Prioridade;
      itensIniciais?: string[];
      initialItems?: string[];
    }) => void;
    isPending: boolean;
  };
  useUpdateChecklist(): {
    mutate: (input: {
      cardId?: string;
      card_id?: string;
      checklistId?: string;
      checklist_id?: string;
      title?: string;
      titulo?: string;
      prioridade?: Prioridade;
      priority?: Prioridade;
    }) => void;
    isPending: boolean;
  };
  useDeleteChecklist(): {
    mutate: (input: { cardId?: string; card_id?: string; checklistId?: string; checklist_id?: string }) => void;
    isPending: boolean;
  };
  useCreateChecklistItem(): {
    mutate: (input: { cardId?: string; card_id?: string; checklistId?: string; checklist_id?: string; title?: string; titulo?: string }) => void;
    isPending: boolean;
  };
  useUpdateChecklistItem(): {
    mutate: (input: {
      cardId?: string;
      card_id?: string;
      checklistId?: string;
      checklist_id?: string;
      itemId?: string;
      item_id?: string;
      title?: string;
      titulo?: string;
    }) => void;
    isPending: boolean;
  };
  useDeleteChecklistItem(): {
    mutate: (input: {
      cardId?: string;
      card_id?: string;
      checklistId?: string;
      checklist_id?: string;
      itemId?: string;
      item_id?: string;
    }) => void;
    isPending: boolean;
  };
  useToggleChecklistItem(): {
    mutate: (input: {
      cardId?: string;
      card_id?: string;
      checklistId?: string;
      checklist_id?: string;
      itemId?: string;
      item_id?: string;
    }) => void;
    isPending: boolean;
  };

  // Cronômetro e Complexidade
  useStartTaskTimer(): {
    mutate: (cardId: string) => void;
    isPending: boolean;
  };
  usePauseTaskTimer(): {
    mutate: (input: { cardId?: string; card_id?: string; reason?: string; motivo?: string }) => void;
    isPending: boolean;
  };
  useResumeTaskTimer(): {
    mutate: (cardId: string) => void;
    isPending: boolean;
  };
  useStopTaskTimer(): {
    mutate: (cardId: string) => void;
    isPending: boolean;
  };
  useUpdateTaskComplexity(): {
    mutate: (input: { cardId?: string; card_id?: string; complexity?: Complexity; complexidade?: Complexity }) => void;
    isPending: boolean;
  };

  // Comentários
  useComments(cardId: string): { data: Comment[]; isLoading: boolean };
  useCommentCounts(): { data: Record<string, number>; isLoading: boolean };
  useCreateComment(): {
    mutate: (input: EntradaCriarComentario) => void;
    isPending: boolean;
  };
  useDeleteComment(): {
    mutate: (id: string) => void;
    isPending: boolean;
  };

  // Membros / Usuários
  useTeamMembers(): { data: TeamMember[]; isLoading: boolean };

  // Perfil / Configurações
  useCurrentUser(): { data: Profile | null; isLoading: boolean };
  useProfiles(): { data: Profile[]; isLoading: boolean };
  useUpdateProfile(): {
    mutate: (fields: EntradaAtualizarPerfil) => void;
    isPending: boolean;
  };
  useUpdatePassword(): {
    mutate: (fields: EntradaAtualizarSenha) => void;
    isPending: boolean;
  };
  useUpdateTheme(): { mutate: (theme: Theme) => void; isPending: boolean };
  useDeleteBoardData(): { mutate: () => void; isPending: boolean };

  // Painel
  useDashboardKpis(): { data: KpisPainel; isLoading: boolean };
  useCompletionByWeek(): { data: ConclusaoPorSemana[]; isLoading: boolean };
  usePriorityDonut(): { data: RoscaPrioridade[]; isLoading: boolean };
  useVelocityByDay(): { data: VelocidadePorDia[]; isLoading: boolean };
}

export type AppDataProvider = ProvedorDadosApp;
