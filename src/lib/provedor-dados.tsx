import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import { toast } from "sonner";
import * as seed from "@/dados/dados-iniciais";
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

// ── Tipos de entrada ──────────────────────────────────────────────────

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
  id_solicitante?: string | null;
  solicitante_id?: string | null;
  data_vencimento?: string | null;
  due_date?: string | null;
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
  id_solicitante?: string | null;
  solicitante_id?: string | null;
  data_vencimento?: string | null;
  due_date?: string | null;
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

// ── Tipos de agregação ────────────────────────────────────────────────

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

// ── Cartão com responsável vinculado (para exibição) ──────────────────

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
  solicitante?: {
    id: string;
    nome_completo: string;
    iniciais: string;
    email?: string;
    url_avatar?: string | null;
    full_name?: string;
    initials?: string;
    avatar_url?: string | null;
  } | null;
}
export type CardWithAssignee = CartaoComResponsavel;

// ── Interface do provedor ─────────────────────────────────────────────

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
  useDeleteCard(): { mutate: (id: string) => void; isPending: boolean };
  useReorderCards(): {
    mutate: (reordered: EntradaReordenar[]) => void;
    isPending: boolean;
  };

  // Checklists (até 5 por cartão)
  useCreateChecklist(): {
    mutate: (input: { cardId?: string; card_id?: string; title?: string; titulo?: string }) => void;
    isPending: boolean;
  };
  useUpdateChecklist(): {
    mutate: (input: { cardId?: string; card_id?: string; checklistId?: string; checklist_id?: string; title?: string; titulo?: string }) => void;
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

  // Equipe
  useTeamMembers(): { data: TeamMember[]; isLoading: boolean };
  useInviteTeamMember(): {
    mutate: (email: string) => void;
    isPending: boolean;
  };
  useRemoveTeamMember(): {
    mutate: (memberId: string) => void;
    isPending: boolean;
  };
  useUpdateMemberRole(): {
    mutate: (input: { memberId?: string; member_id?: string; role?: "admin" | "member"; funcao?: "admin" | "member" }) => void;
    isPending: boolean;
  };

  // Perfil / Configurações
  useCurrentUser(): { data: Profile | null; isLoading: boolean };
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

const ContextoProvedorDados = createContext<ProvedorDadosApp | null>(null);

export function usarProvedorDados(): ProvedorDadosApp {
  const ctx = useContext(ContextoProvedorDados);
  if (!ctx) throw new Error("usarProvedorDados deve ser usado dentro de ProvedorDados");
  return ctx;
}
export const useDataProvider = usarProvedorDados;

// ── Auxiliar: obter início da semana ISO (segunda-feira) ──────────────

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().slice(0, 10);
}

// ── AppData — Provedor de dados autenticado via Supabase ───────────────

export function AppData({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <SupabaseDataProvider>{children}</SupabaseDataProvider>;
}

// ── Provedor de Dados Supabase ─────────────────────────────────────────

const SUPABASE_CHECKLISTS_KEY = "supabase-card-checklists-v1";
function loadSupabaseChecklists(): Record<string, seed.Checklist[]> {
  try {
    const raw = localStorage.getItem(SUPABASE_CHECKLISTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return {};
}
function saveSupabaseChecklists(map: Record<string, seed.Checklist[]>) {
  try {
    localStorage.setItem(SUPABASE_CHECKLISTS_KEY, JSON.stringify(map));
  } catch { }
}

const SUPABASE_METADATA_KEY = "supabase-card-metadata-v1";
interface SupabaseCardMeta {
  complexity?: Complexity;
  time_tracker?: TaskTimeTracker;
  id_solicitante?: string | null;
}
function loadSupabaseMetadata(): Record<string, SupabaseCardMeta> {
  try {
    const raw = localStorage.getItem(SUPABASE_METADATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return {};
}
function saveSupabaseMetadata(map: Record<string, SupabaseCardMeta>) {
  try {
    localStorage.setItem(SUPABASE_METADATA_KEY, JSON.stringify(map));
  } catch { }
}

function resolverSolicitante(
  idSolicitante: string | null | undefined,
  idUsuario: string | null | undefined,
  membros: any[],
  usuarioAtualAuth: any
) {
  const idAlvo = idSolicitante || idUsuario;
  if (!idAlvo) return null;

  const membroEncontrado = membros.find(
    (m) => m.id === idAlvo || m.id_usuario_membro === idAlvo || m.id_usuario === idAlvo
  );

  if (membroEncontrado) {
    return {
      id: membroEncontrado.id,
      nome_completo: membroEncontrado.nome_completo,
      iniciais: membroEncontrado.iniciais,
      email: membroEncontrado.email,
      url_avatar: membroEncontrado.url_avatar,
      full_name: membroEncontrado.nome_completo,
      initials: membroEncontrado.iniciais,
      avatar_url: membroEncontrado.url_avatar,
    };
  }

  if (usuarioAtualAuth && (usuarioAtualAuth.id === idAlvo || usuarioAtualAuth.id === idUsuario)) {
    const nome = usuarioAtualAuth.user_metadata?.full_name ?? usuarioAtualAuth.email?.split("@")[0] ?? "Usuário";
    const iniciais = (usuarioAtualAuth.user_metadata?.full_name ?? usuarioAtualAuth.email ?? "U")
      .slice(0, 2)
      .toUpperCase();
    return {
      id: usuarioAtualAuth.id,
      nome_completo: nome,
      iniciais: iniciais,
      email: usuarioAtualAuth.email,
      url_avatar: usuarioAtualAuth.user_metadata?.avatar_url ?? null,
      full_name: nome,
      initials: iniciais,
      avatar_url: usuarioAtualAuth.user_metadata?.avatar_url ?? null,
    };
  }

  return null;
}

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Carrega e aplica o tema salvo no perfil do usuário
  useEffect(() => {
    if (!user) return;
    supabase
      .from("perfis")
      .select("tema")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const tema = (data?.tema ?? "system") as Theme;
        const root = document.documentElement;
        root.classList.remove("dark");
        if (
          tema === "dark" ||
          (tema === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
          root.classList.add("dark");
        }
      });
  }, [user]);

  // Inscrição em Tempo Real (Supabase Realtime)
  useEffect(() => {
    if (!user) return;

    const canalRealtime = supabase
      .channel("sgdi-mudancas-tempo-real")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cartoes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
          queryClient.invalidateQueries({ queryKey: ["completion-by-week"] });
          queryClient.invalidateQueries({ queryKey: ["priority-donut"] });
          queryClient.invalidateQueries({ queryKey: ["velocity-by-day"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comentarios" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comments"] });
          queryClient.invalidateQueries({ queryKey: ["comment-counts"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "membros_equipe" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["team_members"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "perfis" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({ queryKey: ["team_members"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalRealtime);
    };
  }, [user, queryClient]);

  const provider: AppDataProvider = {

    // ── Quadro ─────────────────────────────────────────────────────

    useCards: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["cards"],
        queryFn: async () => {
          let rows: any[] = [];
          const res = await supabase
            .from("cartoes")
            .select(
              `
              id, id_usuario, id_solicitante, titulo, descricao, coluna, prioridade,
              id_responsavel, data_vencimento, posicao, criado_em,
              membros_equipe (id, nome_completo, iniciais, url_avatar)
            `
            )
            .order("coluna", { ascending: true })
            .order("posicao", { ascending: true });

          if (res.error) {
            const fallback = await supabase
              .from("cartoes")
              .select(
                `
                id, id_usuario, titulo, descricao, coluna, prioridade,
                id_responsavel, data_vencimento, posicao, criado_em,
                membros_equipe (id, nome_completo, iniciais, url_avatar)
              `
              )
              .order("coluna", { ascending: true })
              .order("posicao", { ascending: true });
            if (fallback.error) throw fallback.error;
            rows = fallback.data ?? [];
          } else {
            rows = res.data ?? [];
          }

          const { data: todosMembros } = await supabase
            .from("membros_equipe")
            .select("id, id_usuario, id_usuario_membro, nome_completo, iniciais, email, url_avatar")
            .neq("status", "removed");

          const chkMap = loadSupabaseChecklists();
          const metaMap = loadSupabaseMetadata();
          return rows.map((row: any) => {
            const tm = Array.isArray(row.membros_equipe)
              ? row.membros_equipe[0]
              : row.membros_equipe;
            const meta = metaMap[row.id] ?? {};
            const respObj = tm
              ? {
                  id: tm.id,
                  nome_completo: tm.nome_completo,
                  iniciais: tm.iniciais,
                  url_avatar: tm.url_avatar,
                  full_name: tm.nome_completo,
                  initials: tm.iniciais,
                  avatar_url: tm.url_avatar,
                }
              : null;

            const idSolicitante = row.id_solicitante ?? meta.id_solicitante ?? row.id_usuario ?? null;
            const solicitanteObj = resolverSolicitante(idSolicitante, row.id_usuario, todosMembros ?? [], user);

            return {
              id: row.id,
              id_usuario: row.id_usuario,
              id_solicitante: idSolicitante,
              solicitante_id: idSolicitante,
              solicitante: solicitanteObj,
              titulo: row.titulo,
              descricao: row.descricao,
              coluna: row.coluna as IdColuna,
              prioridade: row.prioridade as Prioridade,
              id_responsavel: row.id_responsavel,
              data_vencimento: row.data_vencimento,
              posicao: row.posicao,
              criado_em: row.criado_em,
              listas_verificacao: chkMap[row.id] ?? [],
              checklists: chkMap[row.id] ?? [],
              complexidade: meta.complexity ?? "medium",
              complexity: meta.complexity ?? "medium",
              rastreador_tempo: meta.time_tracker ?? {
                em_execucao: false,
                is_running: false,
                tempo_total_segundos: 0,
                total_spent_seconds: 0,
                pausas: [],
                pauses: [],
              },
              time_tracker: meta.time_tracker ?? {
                em_execucao: false,
                is_running: false,
                tempo_total_segundos: 0,
                total_spent_seconds: 0,
                pausas: [],
                pauses: [],
              },
              // Aliases de compatibilidade
              title: row.titulo,
              description: row.descricao,
              column: row.coluna as IdColuna,
              priority: row.prioridade as Prioridade,
              assignee_id: row.id_responsavel,
              due_date: row.data_vencimento,
              position: row.posicao,
              created_at: row.criado_em,
              responsavel: respObj,
              assignee: respObj,
            };
          });
        },
        enabled: !!user,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useCard: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ["card", id],
        queryFn: async () => {
          let dataRow: any = null;
          const res = await supabase
            .from("cartoes")
            .select(
              `
              id, id_usuario, id_solicitante, titulo, descricao, coluna, prioridade, data_vencimento, posicao, criado_em,
              id_responsavel,
              membros_equipe (id, nome_completo, iniciais, url_avatar)
            `,
            )
            .eq("id", id)
            .single();

          if (res.error) {
            const fallback = await supabase
              .from("cartoes")
              .select(
                `
                id, id_usuario, titulo, descricao, coluna, prioridade, data_vencimento, posicao, criado_em,
                id_responsavel,
                membros_equipe (id, nome_completo, iniciais, url_avatar)
              `
              )
              .eq("id", id)
              .single();
            if (fallback.error) throw fallback.error;
            dataRow = fallback.data;
          } else {
            dataRow = res.data;
          }

          const { data: todosMembros } = await supabase
            .from("membros_equipe")
            .select("id, id_usuario, id_usuario_membro, nome_completo, iniciais, email, url_avatar")
            .neq("status", "removed");

          const chkMap = loadSupabaseChecklists();
          const metaMap = loadSupabaseMetadata();
          const meta = metaMap[dataRow.id] ?? {};
          const tm: any = Array.isArray(dataRow.membros_equipe)
            ? dataRow.membros_equipe[0]
            : dataRow.membros_equipe;
          const respObj = tm
            ? {
                id: tm.id,
                nome_completo: tm.nome_completo,
                iniciais: tm.iniciais,
                url_avatar: tm.url_avatar,
                full_name: tm.nome_completo,
                initials: tm.iniciais,
                avatar_url: tm.url_avatar,
              }
            : null;

          const idSolicitante = dataRow.id_solicitante ?? meta.id_solicitante ?? dataRow.id_usuario ?? null;
          const solicitanteObj = resolverSolicitante(idSolicitante, dataRow.id_usuario, todosMembros ?? [], user);

          return {
            id: dataRow.id,
            id_usuario: dataRow.id_usuario,
            id_solicitante: idSolicitante,
            solicitante_id: idSolicitante,
            solicitante: solicitanteObj,
            titulo: dataRow.titulo,
            descricao: dataRow.descricao,
            coluna: dataRow.coluna as IdColuna,
            prioridade: dataRow.prioridade as Prioridade,
            id_responsavel: dataRow.id_responsavel,
            data_vencimento: dataRow.data_vencimento,
            posicao: dataRow.posicao,
            criado_em: dataRow.criado_em,
            listas_verificacao: chkMap[dataRow.id] ?? [],
            checklists: chkMap[dataRow.id] ?? [],
            complexidade: meta.complexity ?? "medium",
            complexity: meta.complexity ?? "medium",
            rastreador_tempo: meta.time_tracker ?? {
              em_execucao: false,
              is_running: false,
              tempo_total_segundos: 0,
              total_spent_seconds: 0,
              pausas: [],
              pauses: [],
            },
            time_tracker: meta.time_tracker ?? {
              em_execucao: false,
              is_running: false,
              tempo_total_segundos: 0,
              total_spent_seconds: 0,
              pausas: [],
              pauses: [],
            },
            // Aliases de compatibilidade
            title: dataRow.titulo,
            description: dataRow.descricao,
            column: dataRow.coluna as IdColuna,
            priority: dataRow.prioridade as Prioridade,
            assignee_id: dataRow.id_responsavel,
            due_date: dataRow.data_vencimento,
            position: dataRow.posicao,
            created_at: dataRow.criado_em,
            responsavel: respObj,
            assignee: respObj,
          };
        },
        enabled: !!user && !!id,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? null, isLoading };
    },

    useCreateCard: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateCardInput) => {
          const idSolicitante = input.id_solicitante ?? input.solicitante_id ?? user?.id ?? null;
          const payload: any = {
            id_usuario: user?.id ?? undefined,
            id_solicitante: idSolicitante,
            titulo: input.titulo ?? input.title ?? "",
            coluna: input.coluna ?? input.column ?? "todo",
            prioridade: input.prioridade ?? input.priority ?? "low",
            id_responsavel: input.id_responsavel ?? input.assignee_id ?? null,
            data_vencimento: input.data_vencimento ?? input.due_date ?? null,
            posicao: input.posicao ?? input.nextPosition ?? 0,
            descricao: input.descricao ?? input.description ?? "",
          };

          let dataResult: any;
          const res = await supabase.from("cartoes").insert(payload).select().single();
          if (res.error) {
            delete payload.id_solicitante;
            const retry = await supabase.from("cartoes").insert(payload).select().single();
            if (retry.error) throw retry.error;
            dataResult = retry.data;
          } else {
            dataResult = res.data;
          }

          if (idSolicitante && dataResult?.id) {
            const metaMap = loadSupabaseMetadata();
            metaMap[dataResult.id] = {
              ...(metaMap[dataResult.id] ?? {}),
              id_solicitante: idSolicitante,
            };
            saveSupabaseMetadata(metaMap);
          }

          return dataResult;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
        },
        onError: () => {
          toast.error("Falha ao criar cartão");
        },
      });
      return {
        mutate: (input: CreateCardInput) => mutation.mutate(input),
        isPending: mutation.isPending,
      };
    },

    useUpdateCard: () => {
      const mutation = useMutation({
        mutationFn: async ({
          id,
          fields,
        }: {
          id: string;
          fields: UpdateCardInput;
        }) => {
          const patch: any = {};
          if (fields.titulo !== undefined || fields.title !== undefined) {
            patch.titulo = fields.titulo ?? fields.title;
          }
          if (fields.descricao !== undefined || fields.description !== undefined) {
            patch.descricao = fields.descricao ?? fields.description;
          }
          if (fields.coluna !== undefined || fields.column !== undefined) {
            patch.coluna = fields.coluna ?? fields.column;
          }
          if (fields.prioridade !== undefined || fields.priority !== undefined) {
            patch.prioridade = fields.prioridade ?? fields.priority;
          }
          if (fields.id_responsavel !== undefined || fields.assignee_id !== undefined) {
            patch.id_responsavel = fields.id_responsavel ?? fields.assignee_id;
          }
          if (fields.id_solicitante !== undefined || fields.solicitante_id !== undefined) {
            patch.id_solicitante = fields.id_solicitante ?? fields.solicitante_id;
          }
          if (fields.data_vencimento !== undefined || fields.due_date !== undefined) {
            patch.data_vencimento = fields.data_vencimento ?? fields.due_date;
          }

          let dataResult: any;
          const res = await supabase
            .from("cartoes")
            .update(patch)
            .eq("id", id)
            .select()
            .single();

          if (res.error) {
            if (patch.id_solicitante !== undefined) {
              const solId = patch.id_solicitante;
              delete patch.id_solicitante;
              const retry = await supabase
                .from("cartoes")
                .update(patch)
                .eq("id", id)
                .select()
                .single();
              if (retry.error) throw retry.error;
              dataResult = retry.data;

              const metaMap = loadSupabaseMetadata();
              metaMap[id] = {
                ...(metaMap[id] ?? {}),
                id_solicitante: solId,
              };
              saveSupabaseMetadata(metaMap);
            } else {
              throw res.error;
            }
          } else {
            dataResult = res.data;
          }

          if (fields.id_solicitante !== undefined || fields.solicitante_id !== undefined) {
            const solId = fields.id_solicitante ?? fields.solicitante_id ?? null;
            const metaMap = loadSupabaseMetadata();
            metaMap[id] = {
              ...(metaMap[id] ?? {}),
              id_solicitante: solId,
            };
            saveSupabaseMetadata(metaMap);
          }

          return dataResult;
        },
        onMutate: async ({ id, fields }) => {
          await queryClient.cancelQueries({ queryKey: ["cards"] });
          const previous = queryClient.getQueryData<CardWithAssignee[]>([
            "cards",
          ]);
          if (previous) {
            queryClient.setQueryData<CardWithAssignee[]>(
              ["cards"],
              previous.map((c) => (c.id === id ? { ...c, ...fields } : c)),
            );
          }
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["cards"], context.previous);
          }
          toast.error("Falha ao atualizar cartão");
        },
        onSettled: (_data, _err, { id }) => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", id] });
        },
      });
      return {
        mutate: (id: string, fields: UpdateCardInput) =>
          mutation.mutate({ id, fields }),
        isPending: mutation.isPending,
      };
    },

    useDeleteCard: () => {
      const mutation = useMutation({
        mutationFn: async (id: string) => {
          const { error } = await supabase
            .from("cartoes")
            .delete()
            .eq("id", id);
          if (error) throw error;
        },
        onMutate: async (id) => {
          await queryClient.cancelQueries({ queryKey: ["cards"] });
          const previous = queryClient.getQueryData<CardWithAssignee[]>([
            "cards",
          ]);
          if (previous) {
            queryClient.setQueryData<CardWithAssignee[]>(
              ["cards"],
              previous.filter((c) => c.id !== id),
            );
          }
          return { previous };
        },
        onError: (_err, _id, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["cards"], context.previous);
          }
          toast.error("Falha ao excluir cartão");
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
        },
      });
      return {
        mutate: (id: string) => mutation.mutate(id),
        isPending: mutation.isPending,
      };
    },

    useReorderCards: () => {
      const mutation = useMutation({
        mutationFn: async (reordered: ReorderInput[]) => {
          for (const c of reordered) {
            const { error } = await supabase
              .from("cartoes")
              .update({
                coluna: c.coluna ?? c.column,
                posicao: c.posicao ?? c.position,
              })
              .eq("id", c.id);
            if (error) throw error;
          }
        },

        onMutate: async (reordered) => {
          await queryClient.cancelQueries({ queryKey: ["cards"] });
          const previous = queryClient.getQueryData<CardWithAssignee[]>([
            "cards",
          ]);
          if (previous) {
            const reorderMap = new Map(reordered.map((r) => [r.id, r]));
            queryClient.setQueryData<CardWithAssignee[]>(
              ["cards"],
              previous.map((c) => {
                const update = reorderMap.get(c.id);
                if (!update) return c;
                const nextCol = update.coluna ?? update.column ?? c.coluna;
                const nextPos = update.posicao ?? update.position ?? c.posicao;
                return {
                  ...c,
                  coluna: nextCol,
                  column: nextCol,
                  posicao: nextPos,
                  position: nextPos,
                };
              }),
            );
          }
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["cards"], context.previous);
          }
          toast.error("Falha ao reordenar cartões");
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
        },
      });
      return {
        mutate: (reordered: ReorderInput[]) => mutation.mutate(reordered),
        isPending: mutation.isPending,
      };
    },

    // ── Checklists ─────────────────────────────────────────────────
    useCreateChecklist: () => {
      return {
        mutate: ({ cardId, card_id, title, titulo }: { cardId?: string; card_id?: string; title?: string; titulo?: string }) => {
          const cId = cardId ?? card_id ?? "";
          const t = (titulo ?? title ?? "Checklist").trim();
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          if (current.length >= 5) {
            toast.error("Limite máximo de 5 checklists por cartão atingido");
            return;
          }
          const newChecklist: seed.Checklist = {
            id: `chk-${Date.now()}`,
            id_cartao: cId,
            card_id: cId,
            titulo: t,
            title: t,
            posicao: current.length,
            position: current.length,
            itens: [],
            items: [],
          };
          chkMap[cId] = [...current, newChecklist];
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useUpdateChecklist: () => {
      return {
        mutate: ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          title,
          titulo,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          title?: string;
          titulo?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const trimmed = (titulo ?? title ?? "").trim();
          if (!trimmed) return;
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) =>
            chk.id === chkId ? { ...chk, titulo: trimmed, title: trimmed } : chk
          );
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useDeleteChecklist: () => {
      return {
        mutate: ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.filter((chk) => chk.id !== chkId);
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useCreateChecklistItem: () => {
      return {
        mutate: ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          title,
          titulo,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          title?: string;
          titulo?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const trimmed = (titulo ?? title ?? "").trim();
          if (!trimmed) return;
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            const newItem: seed.ChecklistItem = {
              id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              titulo: trimmed,
              title: trimmed,
              esta_concluido: false,
              is_completed: false,
              posicao: existingItems.length,
              position: existingItems.length,
            };
            const updatedItems = [...existingItems, newItem];
            return {
              ...chk,
              itens: updatedItems,
              items: updatedItems,
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useUpdateChecklistItem: () => {
      return {
        mutate: ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          itemId,
          item_id,
          title,
          titulo,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          itemId?: string;
          item_id?: string;
          title?: string;
          titulo?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const itId = itemId ?? item_id ?? "";
          const trimmed = (titulo ?? title ?? "").trim();
          if (!trimmed) return;
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            const updated = existingItems.map((item) =>
              item.id === itId ? { ...item, titulo: trimmed, title: trimmed } : item
            );
            return {
              ...chk,
              itens: updated,
              items: updated,
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useDeleteChecklistItem: () => {
      return {
        mutate: ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          itemId,
          item_id,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          itemId?: string;
          item_id?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const itId = itemId ?? item_id ?? "";
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            const updated = existingItems.filter((item) => item.id !== itId);
            return {
              ...chk,
              itens: updated,
              items: updated,
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useToggleChecklistItem: () => {
      return {
        mutate: ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          itemId,
          item_id,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          itemId?: string;
          item_id?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const itId = itemId ?? item_id ?? "";
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            const updated = existingItems.map((item) => {
              if (item.id !== itId) return item;
              const nextVal = !(item.esta_concluido ?? item.is_completed);
              return {
                ...item,
                esta_concluido: nextVal,
                is_completed: nextVal,
              };
            });
            return {
              ...chk,
              itens: updated,
              items: updated,
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    // ── Cronômetro e Complexidade ──────────────────────────────────
    useStartTaskTimer: () => {
      return {
        mutate: (cardId: string) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            is_running: false,
            tempo_total_segundos: 0,
            total_spent_seconds: 0,
            pausas: [],
            pauses: [],
          };
          if (tracker.em_execucao || tracker.is_running) return;
          const nowIso = new Date().toISOString();
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              ...tracker,
              em_execucao: true,
              is_running: true,
              iniciado_em: nowIso,
              started_at: nowIso,
              ultima_acao_em: nowIso,
              last_action_at: nowIso,
            },
          };
          saveSupabaseMetadata(metaMap);
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
          toast.success("Cronômetro iniciado");
        },
        isPending: false,
      };
    },

    usePauseTaskTimer: () => {
      return {
        mutate: ({ cardId, card_id, reason, motivo }: { cardId?: string; card_id?: string; reason?: string; motivo?: string }) => {
          const cId = cardId ?? card_id ?? "";
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            is_running: false,
            tempo_total_segundos: 0,
            total_spent_seconds: 0,
            pausas: [],
            pauses: [],
          };
          const started = tracker.iniciado_em ?? tracker.started_at;
          if ((!tracker.em_execucao && !tracker.is_running) || !started) return;
          const now = new Date();
          const elapsed = Math.max(
            0,
            Math.floor(
              (now.getTime() - new Date(started).getTime()) / 1000
            )
          );
          const reasonText = (motivo ?? reason ?? "Pausa").trim() || "Pausa";
          const newPause = {
            id: `pause-${Date.now()}`,
            pausado_em: now.toISOString(),
            paused_at: now.toISOString(),
            duracao_segundos: 0,
            duration_seconds: 0,
            motivo: reasonText,
            reason: reasonText,
          };
          const existingPauses = tracker.pausas ?? tracker.pauses ?? [];
          const totalSpent = (tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0) + elapsed;
          metaMap[cId] = {
            ...currentMeta,
            time_tracker: {
              em_execucao: false,
              is_running: false,
              iniciado_em: null,
              started_at: null,
              tempo_total_segundos: totalSpent,
              total_spent_seconds: totalSpent,
              ultima_acao_em: now.toISOString(),
              last_action_at: now.toISOString(),
              pausas: [...existingPauses, newPause],
              pauses: [...existingPauses, newPause],
            },
          };
          saveSupabaseMetadata(metaMap);
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
          toast.info("Cronômetro pausado");
        },
        isPending: false,
      };
    },

    useResumeTaskTimer: () => {
      return {
        mutate: (cardId: string) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            is_running: false,
            tempo_total_segundos: 0,
            total_spent_seconds: 0,
            pausas: [],
            pauses: [],
          };
          if (tracker.em_execucao || tracker.is_running) return;
          const now = new Date();
          const existingPauses = [...(tracker.pausas ?? tracker.pauses ?? [])];
          if (existingPauses.length > 0) {
            const lastIdx = existingPauses.length - 1;
            const last = existingPauses[lastIdx];
            const pausedAt = last.pausado_em ?? last.paused_at;
            if (pausedAt && (!last.retomado_em && !last.resumed_at)) {
              const pauseDur = Math.max(
                0,
                Math.floor(
                  (now.getTime() - new Date(pausedAt).getTime()) / 1000
                )
              );
              existingPauses[lastIdx] = {
                ...last,
                retomado_em: now.toISOString(),
                resumed_at: now.toISOString(),
                duracao_segundos: pauseDur,
                duration_seconds: pauseDur,
              };
            }
          }
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              ...tracker,
              em_execucao: true,
              is_running: true,
              iniciado_em: now.toISOString(),
              started_at: now.toISOString(),
              ultima_acao_em: now.toISOString(),
              last_action_at: now.toISOString(),
              pausas: existingPauses,
              pauses: existingPauses,
            },
          };
          saveSupabaseMetadata(metaMap);
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
          toast.success("Cronômetro retomado");
        },
        isPending: false,
      };
    },

    useStopTaskTimer: () => {
      return {
        mutate: (cardId: string) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            is_running: false,
            tempo_total_segundos: 0,
            total_spent_seconds: 0,
            pausas: [],
            pauses: [],
          };
          const now = new Date();
          const isRunning = tracker.em_execucao || tracker.is_running;
          const started = tracker.iniciado_em ?? tracker.started_at;
          const elapsed =
            isRunning && started
              ? Math.max(
                0,
                Math.floor(
                  (now.getTime() - new Date(started).getTime()) / 1000
                )
              )
              : 0;
          const totalSpent = (tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0) + elapsed;
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              ...tracker,
              em_execucao: false,
              is_running: false,
              iniciado_em: null,
              started_at: null,
              tempo_total_segundos: totalSpent,
              total_spent_seconds: totalSpent,
              ultima_acao_em: now.toISOString(),
              last_action_at: now.toISOString(),
            },
          };
          saveSupabaseMetadata(metaMap);
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
          toast.success("Cronômetro finalizado e tempo registrado");
        },
        isPending: false,
      };
    },

    useUpdateTaskComplexity: () => {
      return {
        mutate: ({
          cardId,
          card_id,
          complexity,
          complexidade,
        }: {
          cardId?: string;
          card_id?: string;
          complexity?: Complexity;
          complexidade?: Complexity;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const compl = (complexidade ?? complexity ?? "medium") as Complexity;
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cId] ?? {};
          metaMap[cId] = {
            ...currentMeta,
            complexity: compl,
          };
          saveSupabaseMetadata(metaMap);
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
          toast.success(
            `Complexidade alterada para ${seed.configuracaoComplexidade[compl].label}`
          );
        },
        isPending: false,
      };
    },

    // ── Comentários ────────────────────────────────────────────────

    useComments: (cardId) => {
      const { data, isLoading } = useQuery({
        queryKey: ["comments", cardId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("comentarios")
            .select(
              `
              id, id_usuario, id_cartao, id_autor, conteudo, criado_em,
              membros_equipe (id, nome_completo, iniciais)
            `,
            )
            .eq("id_cartao", cardId)
            .order("criado_em", { ascending: true });
          if (error) throw error;
          return (data ?? []).map((row: any) => ({
            id: row.id,
            id_usuario: row.id_usuario,
            id_cartao: row.id_cartao,
            id_autor: row.id_autor,
            conteudo: row.conteudo,
            criado_em: row.criado_em,
            // Aliases de compatibilidade
            card_id: row.id_cartao,
            author_id: row.id_autor,
            body: row.conteudo,
            created_at: row.criado_em,
          }));
        },
        enabled: !!user && !!cardId,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useCreateComment: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateCommentInput) => {
          const cId = input.idCartao ?? input.cardId ?? "";
          const aId = input.idAutor ?? input.authorId ?? "";
          const bodyText = input.conteudo ?? input.body ?? "";
          const { data, error } = await supabase
            .from("comentarios")
            .insert({
              id_usuario: user?.id ?? undefined,
              id_cartao: cId,
              id_autor: aId,
              conteudo: bodyText,
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onSuccess: (_data, variables) => {
          const cId = variables.idCartao ?? variables.cardId;
          queryClient.invalidateQueries({
            queryKey: ["comments", cId],
          });
          queryClient.invalidateQueries({
            queryKey: ["comment-counts"],
          });
        },
        onError: () => {
          toast.error("Falha ao adicionar comentário");
        },
      });
      return {
        mutate: (input: CreateCommentInput) => mutation.mutate(input),
        isPending: mutation.isPending,
      };
    },

    useCommentCounts: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["comment-counts"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("comentarios")
            .select("id_cartao");
          if (error) throw error;
          const counts: Record<string, number> = {};
          for (const row of (data ?? []) as any[]) {
            counts[row.id_cartao] = (counts[row.id_cartao] ?? 0) + 1;
          }
          return counts;
        },
        enabled: !!user,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? {}, isLoading };
    },

    // ── Equipe ─────────────────────────────────────────────────────

    useTeamMembers: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["team_members"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("membros_equipe")
            .select("id, id_usuario, id_usuario_membro, nome_completo, iniciais, email, funcao, status, url_avatar, convidado_em, criado_em")
            .neq("status", "removed")
            .order("funcao", { ascending: false })
            .order("nome_completo", { ascending: true });
          if (error) throw error;
          return (data ?? []).map((m: any) => ({
            id: m.id,
            id_usuario: m.id_usuario,
            id_usuario_membro: m.id_usuario_membro,
            nome_completo: m.nome_completo,
            iniciais: m.iniciais,
            email: m.email,
            funcao: m.funcao,
            status: m.status,
            url_avatar: m.url_avatar,
            convidado_em: m.convidado_em,
            criado_em: m.criado_em,
            // Aliases de compatibilidade
            full_name: m.nome_completo,
            initials: m.iniciais,
            role: m.funcao,
            avatar_url: m.url_avatar,
            invited_at: m.convidado_em,
            created_at: m.criado_em,
          })) as TeamMember[];
        },
        enabled: !!user,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useInviteTeamMember: () => {
      const mutation = useMutation({
        mutationFn: async (email: string) => {
          const { data, error } = await supabase
            .from("membros_equipe")
            .insert({
              id_usuario: user?.id ?? undefined,
              email,
              nome_completo: "",
              iniciais: "",
              funcao: "member",
              status: "pending",
              convidado_em: new Date().toISOString(),
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onSuccess: (_data, email) => {
          queryClient.invalidateQueries({
            queryKey: ["team_members"],
          });
          toast.success(`Convite enviado para ${email}`);
        },
        onError: () => {
          toast.error("Falha ao enviar convite");
        },
      });
      return {
        mutate: (email: string) => mutation.mutate(email),
        isPending: mutation.isPending,
      };
    },

    useRemoveTeamMember: () => {
      const mutation = useMutation({
        mutationFn: async (memberId: string) => {
          const { error } = await supabase
            .from("membros_equipe")
            .update({ status: "removed" })
            .eq("id", memberId);
          if (error) throw error;
        },
        onMutate: async (memberId) => {
          await queryClient.cancelQueries({
            queryKey: ["team_members"],
          });
          const previous = queryClient.getQueryData<TeamMember[]>([
            "team_members",
          ]);
          if (previous) {
            queryClient.setQueryData<TeamMember[]>(
              ["team_members"],
              previous.filter((m) => m.id !== memberId),
            );
          }
          return { previous };
        },
        onError: (_err, _id, context) => {
          if (context?.previous) {
            queryClient.setQueryData(
              ["team_members"],
              context.previous,
            );
          }
          toast.error("Falha ao remover membro da equipe");
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: ["team_members"],
          });
        },
      });
      return {
        mutate: (memberId: string) => mutation.mutate(memberId),
        isPending: mutation.isPending,
      };
    },

    useUpdateMemberRole: () => {
      const mutation = useMutation({
        mutationFn: async (input: { memberId?: string; member_id?: string; role?: "admin" | "member"; funcao?: "admin" | "member" }) => {
          const mId = input.memberId ?? input.member_id ?? "";
          const f = input.funcao ?? input.role ?? "member";
          const { error } = await supabase
            .from("membros_equipe")
            .update({ funcao: f })
            .eq("id", mId);
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["team_members"],
          });
          toast.success("Função do membro atualizada");
        },
        onError: () => toast.error("Falha ao atualizar função"),
      });
      return {
        mutate: (input: { memberId?: string; member_id?: string; role?: "admin" | "member"; funcao?: "admin" | "member" }) =>
          mutation.mutate(input),
        isPending: mutation.isPending,
      };
    },

    // ── Perfil / Configurações ──────────────────────────────────────

    useCurrentUser: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("perfis")
            .select("id, nome_completo, iniciais, email, tema, url_avatar, criado_em")
            .eq("id", user!.id)
            .single();
          if (error) throw error;
          return {
            id: data.id,
            nome_completo: data.nome_completo,
            iniciais: data.iniciais,
            email: data.email,
            tema: data.tema as Tema,
            url_avatar: data.url_avatar,
            criado_em: data.criado_em,
            // Aliases de compatibilidade
            full_name: data.nome_completo,
            initials: data.iniciais,
            theme: data.tema as Tema,
            avatar_url: data.url_avatar,
            created_at: data.criado_em,
          } as Profile;
        },
        enabled: !!user,
      });
      return { data: data ?? null, isLoading };
    },

    useUpdateProfile: () => {
      const mutation = useMutation({
        mutationFn: async (fields: UpdateProfileInput) => {
          const nome = fields.nomeCompleto ?? fields.fullName ?? "";
          const inic = fields.iniciais ?? fields.initials ?? "";
          const { data, error } = await supabase
            .from("perfis")
            .update({
              nome_completo: nome,
              iniciais: inic,
              email: fields.email,
            })
            .eq("id", user!.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onMutate: async (fields) => {
          await queryClient.cancelQueries({ queryKey: ["profile", user?.id] });
          const previous = queryClient.getQueryData<Profile>([
            "profile",
            user?.id,
          ]);
          if (previous) {
            const nome = fields.nomeCompleto ?? fields.fullName ?? previous.nome_completo;
            const inic = fields.iniciais ?? fields.initials ?? previous.iniciais;
            queryClient.setQueryData<Profile>(["profile", user?.id], {
              ...previous,
              nome_completo: nome,
              iniciais: inic,
              email: fields.email,
              full_name: nome,
              initials: inic,
            });
          }
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["profile", user?.id], context.previous);
          }
          toast.error("Falha ao atualizar perfil");
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
          queryClient.invalidateQueries({ queryKey: ["team_members"] });
        },
      });
      return {
        mutate: (fields: UpdateProfileInput) => mutation.mutate(fields),
        isPending: mutation.isPending,
      };
    },

    useUpdatePassword: () => {
      const mutation = useMutation({
        mutationFn: async (fields: UpdatePasswordInput) => {
          const { error } = await supabase.auth.updateUser({
            password: fields.newPassword,
          });
          if (error) throw error;
        },
        onSuccess: () => {
          toast.success("Senha atualizada com sucesso");
        },
        onError: () => {
          toast.error("Falha ao atualizar senha");
        },
      });
      return {
        mutate: (fields: UpdatePasswordInput) => mutation.mutate(fields),
        isPending: mutation.isPending,
      };
    },

    useUpdateTheme: () => {
      const mutation = useMutation({
        mutationFn: async (theme: Theme) => {
          const { data, error } = await supabase
            .from("perfis")
            .update({ tema: theme })
            .eq("id", user!.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onMutate: async (theme) => {
          await queryClient.cancelQueries({ queryKey: ["profile", user?.id] });
          const previous = queryClient.getQueryData<Profile>([
            "profile",
            user?.id,
          ]);
          if (previous) {
            queryClient.setQueryData<Profile>(["profile", user?.id], {
              ...previous,
              tema: theme,
              theme,
            });
          }
          const root = document.documentElement;
          root.classList.remove("dark");
          if (
            theme === "dark" ||
            (theme === "system" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches)
          ) {
            root.classList.add("dark");
          }
          localStorage.setItem("theme", theme);
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["profile", user?.id], context.previous);
            const prev = context.previous.tema ?? context.previous.theme ?? "system";
            const root = document.documentElement;
            root.classList.remove("dark");
            if (
              prev === "dark" ||
              (prev === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
            ) {
              root.classList.add("dark");
            }
            localStorage.setItem("theme", prev);
          }
          toast.error("Falha ao atualizar tema");
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
        },
      });
      return {
        mutate: (theme: Theme) => mutation.mutate(theme),
        isPending: mutation.isPending,
      };
    },

    useDeleteBoardData: () => {
      const mutation = useMutation({
        mutationFn: async () => {
          const { error } = await supabase
            .from("cartoes")
            .delete()
            .neq("id", "");
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["comments"] });
          toast.success("Dados do quadro excluídos");
        },
        onError: () => {
          toast.error("Falha ao excluir dados do quadro");
        },
      });
      return {
        mutate: () => mutation.mutate(),
        isPending: mutation.isPending,
      };
    },

    // ── Painel ──────────────────────────────────────────────────────

    useDashboardKpis: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["dashboard-kpis"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("cartoes")
            .select("id, coluna");
          if (error) throw error;
          const rows = data ?? [];
          return {
            total: rows.length,
            done: rows.filter((c) => c.coluna === "done").length,
            inProgress: rows.filter((c) => c.coluna === "in-progress").length,
            todo: rows.filter((c) => c.coluna === "todo").length,
          };
        },
        enabled: !!user,
      });
      return {
        data: data ?? { total: 0, done: 0, inProgress: 0, todo: 0 },
        isLoading,
      };
    },

    useCompletionByWeek: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["completion-by-week"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("cartoes")
            .select("id, coluna, criado_em")
            .eq("coluna", "done");
          if (error) throw error;
          const weekMap = new Map<string, number>();
          for (const card of (data ?? []) as any[]) {
            const weekStart = getWeekStart(card.criado_em);
            weekMap.set(weekStart, (weekMap.get(weekStart) ?? 0) + 1);
          }
          return Array.from(weekMap.entries())
            .map(([weekStart, count]) => ({ weekStart, count }))
            .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    usePriorityDonut: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["priority-donut"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("cartoes")
            .select("id, prioridade");
          if (error) throw error;
          const priorityMap = new Map<string, number>();
          for (const card of (data ?? []) as any[]) {
            priorityMap.set(
              card.prioridade,
              (priorityMap.get(card.prioridade) ?? 0) + 1,
            );
          }
          return ["high", "medium", "low"].map((p) => ({
            priority: p,
            count: priorityMap.get(p) ?? 0,
          }));
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useVelocityByDay: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["velocity-by-day"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("cartoes")
            .select("id, criado_em")
            .order("criado_em", { ascending: true });
          if (error) throw error;
          const dayMap = new Map<string, number>();
          for (const card of (data ?? []) as any[]) {
            const date = card.criado_em.slice(0, 10);
            dayMap.set(date, (dayMap.get(date) ?? 0) + 1);
          }
          return Array.from(dayMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },
  };

  return (
    <ContextoProvedorDados.Provider value={provider}>
      {children}
    </ContextoProvedorDados.Provider>
  );
}
