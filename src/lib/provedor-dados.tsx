import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import { toast } from "sonner";
import * as seed from "@/dados/dados-iniciais";
import type {
  Card,
  Comment,
  TeamMember,
  Profile,
  Priority,
  ColumnId,
  Theme,
  Complexity,
  TaskTimeTracker,
} from "@/dados/dados-iniciais";

// ── Tipos de entrada ──────────────────────────────────────────────────

export interface EntradaCriarCartao {
  title: string;
  column: ColumnId;
  nextPosition: number;
  description?: string;
  priority?: Priority;
  assignee_id?: string | null;
  due_date?: string | null;
}
export type CreateCardInput = EntradaCriarCartao;

export interface EntradaAtualizarCartao {
  title?: string;
  description?: string;
  column?: ColumnId;
  priority?: Priority;
  complexity?: Complexity;
  assignee_id?: string | null;
  due_date?: string | null;
  color?: string | null;
  time_tracker?: TaskTimeTracker;
}
export type UpdateCardInput = EntradaAtualizarCartao;

export interface EntradaReordenar {
  id: string;
  column: ColumnId;
  position: number;
}
export type ReorderInput = EntradaReordenar;

export interface EntradaCriarComentario {
  cardId: string;
  authorId: string;
  body: string;
}
export type CreateCommentInput = EntradaCriarComentario;

export interface EntradaAtualizarPerfil {
  fullName: string;
  initials: string;
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

export interface CartaoComResponsavel extends Card {
  assignee?: {
    id: string;
    full_name: string;
    initials: string;
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
    mutate: (input: { cardId: string; title: string }) => void;
    isPending: boolean;
  };
  useUpdateChecklist(): {
    mutate: (input: { cardId: string; checklistId: string; title: string }) => void;
    isPending: boolean;
  };
  useDeleteChecklist(): {
    mutate: (input: { cardId: string; checklistId: string }) => void;
    isPending: boolean;
  };
  useCreateChecklistItem(): {
    mutate: (input: { cardId: string; checklistId: string; title: string }) => void;
    isPending: boolean;
  };
  useUpdateChecklistItem(): {
    mutate: (input: {
      cardId: string;
      checklistId: string;
      itemId: string;
      title: string;
    }) => void;
    isPending: boolean;
  };
  useDeleteChecklistItem(): {
    mutate: (input: {
      cardId: string;
      checklistId: string;
      itemId: string;
    }) => void;
    isPending: boolean;
  };
  useToggleChecklistItem(): {
    mutate: (input: {
      cardId: string;
      checklistId: string;
      itemId: string;
    }) => void;
    isPending: boolean;
  };

  // Cronômetro e Complexidade
  useStartTaskTimer(): {
    mutate: (cardId: string) => void;
    isPending: boolean;
  };
  usePauseTaskTimer(): {
    mutate: (input: { cardId: string; reason: string }) => void;
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
    mutate: (input: { cardId: string; complexity: Complexity }) => void;
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
    mutate: (input: { memberId: string; role: "admin" | "member" }) => void;
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

// ── Vincular dados do responsável ao cartão ───────────────────────────

function joinAssignee(card: Card, members: TeamMember[]): CardWithAssignee {
  const member = card.assignee_id
    ? (members.find((m) => m.id === card.assignee_id) ?? null)
    : null;
  return {
    ...card,
    checklists: card.checklists ?? [],
    complexity: card.complexity ?? "medium",
    time_tracker: card.time_tracker ?? {
      is_running: false,
      total_spent_seconds: 0,
      pauses: [],
    },
    assignee: member
      ? {
        id: member.id,
        full_name: member.full_name,
        initials: member.initials,
        avatar_url: member.avatar_url,
      }
      : null,
  };
}

// ── AppData — Provedor de dados autenticado via Supabase ───────────────
// Exige que o usuário esteja autenticado; redireciona para /auth caso contrário.

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

// Armazenamento auxiliar para checklists no modo Supabase
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

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Carrega e aplica o tema salvo no perfil do usuário
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("theme")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const theme = (data?.theme ?? "system") as Theme;
        const root = document.documentElement;
        root.classList.remove("dark");
        if (
          theme === "dark" ||
          (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
          root.classList.add("dark");
        }
      });
  }, [user]);

  // Inscrição em Tempo Real (Supabase Realtime) para sincronização instantânea entre múltiplos usuários
  useEffect(() => {
    if (!user) return;

    const canalRealtime = supabase
      .channel("sgdi-mudancas-tempo-real")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards" },
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
        { event: "*", schema: "public", table: "comments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comments"] });
          queryClient.invalidateQueries({ queryKey: ["comment-counts"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_members" },
        () => {
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
          const { data, error } = await supabase
            .from("cards")
            .select(
              `
              id, title, description, column, priority,
              assignee_id, due_date, position, created_at,
              team_members!cards_assignee_id_fkey (id, full_name, initials, avatar_url)
            `
            )
            .order("column", { ascending: true })
            .order("position", { ascending: true });
          if (error) throw error;
          const chkMap = loadSupabaseChecklists();
          const metaMap = loadSupabaseMetadata();
          return (data ?? []).map((row) => {
            const tm: any = Array.isArray(row.team_members)
              ? row.team_members[0]
              : row.team_members;
            const meta = metaMap[row.id] ?? {};
            return {
              id: row.id,
              title: row.title,
              description: row.description,
              column: row.column as ColumnId,
              priority: row.priority as Priority,
              assignee_id: row.assignee_id,
              due_date: row.due_date,
              position: row.position,
              created_at: row.created_at,
              checklists: chkMap[row.id] ?? [],
              assignee: tm
                ? {
                  id: tm.id,
                  full_name: tm.full_name,
                  initials: tm.initials,
                  avatar_url: tm.avatar_url,
                }
                : null,
            };
          });
        },
        enabled: !!user,
        refetchInterval: 3000,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useCard: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ["card", id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("cards")
            .select(
              `
              id, title, description, column, priority, due_date, position, created_at,
              assignee_id,
              team_members!cards_assignee_id_fkey (id, full_name, initials, avatar_url)
            `,
            )
            .eq("id", id)
            .single();
          if (error) throw error;
          const chkMap = loadSupabaseChecklists();
          return {
            id: data.id,
            title: data.title,
            description: data.description,
            column: data.column as ColumnId,
            priority: data.priority as Priority,
            assignee_id: data.assignee_id,
            due_date: data.due_date,
            position: data.position,
            created_at: data.created_at,
            checklists: chkMap[data.id] ?? [],
            assignee: (() => {
              const tm: any = Array.isArray(data.team_members)
                ? data.team_members[0]
                : data.team_members;
              return tm
                ? {
                  id: tm.id,
                  full_name: tm.full_name,
                  initials: tm.initials,
                  avatar_url: tm.avatar_url,
                }
                : null;
            })(),
          };
        },
        enabled: !!user && !!id,
        refetchInterval: 3000,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? null, isLoading };
    },

    useCreateCard: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateCardInput) => {
          const { data, error } = await supabase
            .from("cards")
            .insert({
              user_id: user?.id ?? null,
              title: input.title,
              column: input.column,
              priority: input.priority ?? "low",
              assignee_id: input.assignee_id ?? null,
              due_date: input.due_date ?? null,
              position: input.nextPosition,
              description: input.description ?? "",
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
        },
        onError: () => {
          toast.error("Failed to create card");
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
          const { data, error } = await supabase
            .from("cards")
            .update(fields)
            .eq("id", id)
            .select()
            .single();
          if (error) throw error;
          return data;
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
          toast.error("Failed to update card");
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
            .from("cards")
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
          toast.error("Failed to delete card");
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
              .from("cards")
              .update({ column: c.column, position: c.position })
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
                return update
                  ? { ...c, column: update.column, position: update.position }
                  : c;
              }),
            );
          }
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["cards"], context.previous);
          }
          toast.error("Failed to reorder cards");
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
        mutate: ({ cardId, title }: { cardId: string; title: string }) => {
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cardId] ?? [];
          if (current.length >= 5) {
            toast.error("Limite máximo de 5 checklists por cartão atingido");
            return;
          }
          const newChecklist: seed.Checklist = {
            id: `chk-${Date.now()}`,
            card_id: cardId,
            title: title.trim() || "Checklist",
            position: current.length,
            items: [],
          };
          chkMap[cardId] = [...current, newChecklist];
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
        },
        isPending: false,
      };
    },

    useUpdateChecklist: () => {
      return {
        mutate: ({
          cardId,
          checklistId,
          title,
        }: {
          cardId: string;
          checklistId: string;
          title: string;
        }) => {
          const trimmed = title.trim();
          if (!trimmed) return;
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cardId] ?? [];
          chkMap[cardId] = current.map((chk) =>
            chk.id === checklistId ? { ...chk, title: trimmed } : chk
          );
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
        },
        isPending: false,
      };
    },

    useDeleteChecklist: () => {
      return {
        mutate: ({
          cardId,
          checklistId,
        }: {
          cardId: string;
          checklistId: string;
        }) => {
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cardId] ?? [];
          chkMap[cardId] = current.filter((chk) => chk.id !== checklistId);
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
        },
        isPending: false,
      };
    },

    useCreateChecklistItem: () => {
      return {
        mutate: ({
          cardId,
          checklistId,
          title,
        }: {
          cardId: string;
          checklistId: string;
          title: string;
        }) => {
          const trimmed = title.trim();
          if (!trimmed) return;
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cardId] ?? [];
          chkMap[cardId] = current.map((chk) => {
            if (chk.id !== checklistId) return chk;
            const newItem: seed.ChecklistItem = {
              id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: trimmed,
              is_completed: false,
              position: chk.items.length,
            };
            return {
              ...chk,
              items: [...chk.items, newItem],
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
        },
        isPending: false,
      };
    },

    useUpdateChecklistItem: () => {
      return {
        mutate: ({
          cardId,
          checklistId,
          itemId,
          title,
        }: {
          cardId: string;
          checklistId: string;
          itemId: string;
          title: string;
        }) => {
          const trimmed = title.trim();
          if (!trimmed) return;
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cardId] ?? [];
          chkMap[cardId] = current.map((chk) => {
            if (chk.id !== checklistId) return chk;
            return {
              ...chk,
              items: chk.items.map((item) =>
                item.id === itemId ? { ...item, title: trimmed } : item
              ),
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
        },
        isPending: false,
      };
    },

    useDeleteChecklistItem: () => {
      return {
        mutate: ({
          cardId,
          checklistId,
          itemId,
        }: {
          cardId: string;
          checklistId: string;
          itemId: string;
        }) => {
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cardId] ?? [];
          chkMap[cardId] = current.map((chk) => {
            if (chk.id !== checklistId) return chk;
            return {
              ...chk,
              items: chk.items.filter((item) => item.id !== itemId),
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
        },
        isPending: false,
      };
    },

    useToggleChecklistItem: () => {
      return {
        mutate: ({
          cardId,
          checklistId,
          itemId,
        }: {
          cardId: string;
          checklistId: string;
          itemId: string;
        }) => {
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cardId] ?? [];
          chkMap[cardId] = current.map((chk) => {
            if (chk.id !== checklistId) return chk;
            return {
              ...chk,
              items: chk.items.map((item) =>
                item.id === itemId
                  ? { ...item, is_completed: !item.is_completed }
                  : item
              ),
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
        },
        isPending: false,
      };
    },

    // ── Cronômetro e Complexidade (SupabaseDataProvider) ───────────
    useStartTaskTimer: () => {
      return {
        mutate: (cardId: string) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            is_running: false,
            total_spent_seconds: 0,
            pauses: [],
          };
          if (tracker.is_running) return;
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              ...tracker,
              is_running: true,
              started_at: new Date().toISOString(),
              last_action_at: new Date().toISOString(),
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
        mutate: ({ cardId, reason }: { cardId: string; reason: string }) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            is_running: false,
            total_spent_seconds: 0,
            pauses: [],
          };
          if (!tracker.is_running || !tracker.started_at) return;
          const now = new Date();
          const elapsed = Math.max(
            0,
            Math.floor(
              (now.getTime() - new Date(tracker.started_at).getTime()) / 1000
            )
          );
          const newPause = {
            id: `pause-${Date.now()}`,
            paused_at: now.toISOString(),
            duration_seconds: 0,
            reason: reason.trim() || "Pausa",
          };
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              is_running: false,
              started_at: null,
              total_spent_seconds: tracker.total_spent_seconds + elapsed,
              last_action_at: now.toISOString(),
              pauses: [...tracker.pauses, newPause],
            },
          };
          saveSupabaseMetadata(metaMap);
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
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
            is_running: false,
            total_spent_seconds: 0,
            pauses: [],
          };
          if (tracker.is_running) return;
          const now = new Date();
          const updatedPauses = [...tracker.pauses];
          if (updatedPauses.length > 0) {
            const lastIdx = updatedPauses.length - 1;
            const last = updatedPauses[lastIdx];
            if (!last.resumed_at) {
              const pauseDur = Math.max(
                0,
                Math.floor(
                  (now.getTime() - new Date(last.paused_at).getTime()) / 1000
                )
              );
              updatedPauses[lastIdx] = {
                ...last,
                resumed_at: now.toISOString(),
                duration_seconds: pauseDur,
              };
            }
          }
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              ...tracker,
              is_running: true,
              started_at: now.toISOString(),
              last_action_at: now.toISOString(),
              pauses: updatedPauses,
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
            is_running: false,
            total_spent_seconds: 0,
            pauses: [],
          };
          const now = new Date();
          const elapsed =
            tracker.is_running && tracker.started_at
              ? Math.max(
                0,
                Math.floor(
                  (now.getTime() - new Date(tracker.started_at).getTime()) /
                  1000
                )
              )
              : 0;
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              ...tracker,
              is_running: false,
              started_at: null,
              total_spent_seconds: tracker.total_spent_seconds + elapsed,
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
          complexity,
        }: {
          cardId: string;
          complexity: Complexity;
        }) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          metaMap[cardId] = {
            ...currentMeta,
            complexity,
          };
          saveSupabaseMetadata(metaMap);
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
          toast.success(
            `Complexidade alterada para ${seed.complexityConfig[complexity].label}`
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
            .from("comments")
            .select(
              `
              id, body, created_at,
              author_id,
              team_members!comments_author_id_fkey (id, full_name, initials)
            `,
            )
            .eq("card_id", cardId)
            .order("created_at", { ascending: true });
          if (error) throw error;
          return (data ?? []).map((row) => ({
            id: row.id,
            card_id: cardId,
            author_id: row.author_id,
            body: row.body,
            created_at: row.created_at,
          }));
        },
        enabled: !!user && !!cardId,
        refetchInterval: 3000,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useCreateComment: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateCommentInput) => {
          const { data, error } = await supabase
            .from("comments")
            .insert({
              user_id: user?.id ?? null,
              card_id: input.cardId,
              author_id: input.authorId,
              body: input.body,
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        },
        onSuccess: (_data, variables) => {
          queryClient.invalidateQueries({
            queryKey: ["comments", variables.cardId],
          });
          queryClient.invalidateQueries({
            queryKey: ["comment-counts"],
          });
        },
        onError: () => {
          toast.error("Failed to add comment");
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
            .from("comments")
            .select("card_id");
          if (error) throw error;
          const counts: Record<string, number> = {};
          for (const row of data ?? []) {
            counts[row.card_id] = (counts[row.card_id] ?? 0) + 1;
          }
          return counts;
        },
        enabled: !!user,
        refetchInterval: 3000,
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
            .from("team_members")
            .select("id, full_name, initials, email, role, status, avatar_url")
            .neq("status", "removed")
            .order("role", { ascending: false })
            .order("full_name", { ascending: true });
          if (error) throw error;
          return (data ?? []) as TeamMember[];
        },
        enabled: !!user,
        refetchInterval: 4000,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useInviteTeamMember: () => {
      const mutation = useMutation({
        mutationFn: async (email: string) => {
          const { data, error } = await supabase
            .from("team_members")
            .insert({
              user_id: user?.id ?? null,
              email,
              full_name: "",
              initials: "",
              role: "member",
              status: "pending",
              invited_at: new Date().toISOString(),
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
          toast.success(`Invite sent to ${email}`);
        },
        onError: () => {
          toast.error("Failed to send invite");
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
            .from("team_members")
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
          toast.error("Failed to remove team member");
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
        mutationFn: async ({
          memberId,
          role,
        }: {
          memberId: string;
          role: "admin" | "member";
        }) => {
          const { error } = await supabase
            .from("team_members")
            .update({ role })
            .eq("id", memberId);
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["team_members"],
          });
          toast.success("Role updated");
        },
        onError: () => toast.error("Failed to update role"),
      });
      return {
        mutate: (input: { memberId: string; role: "admin" | "member" }) =>
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
            .from("profiles")
            .select("id, full_name, initials, email, theme, avatar_url")
            .eq("id", user!.id)
            .single();
          if (error) throw error;
          return data as Profile;
        },
        enabled: !!user,
      });
      return { data: data ?? null, isLoading };
    },

    useUpdateProfile: () => {
      const mutation = useMutation({
        mutationFn: async (fields: UpdateProfileInput) => {
          const { data, error } = await supabase
            .from("profiles")
            .update({
              full_name: fields.fullName,
              initials: fields.initials,
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
            queryClient.setQueryData<Profile>(["profile", user?.id], {
              ...previous,
              full_name: fields.fullName,
              initials: fields.initials,
              email: fields.email,
            });
          }
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["profile", user?.id], context.previous);
          }
          toast.error("Failed to update profile");
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
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
          toast.success("Password updated");
        },
        onError: () => {
          toast.error("Failed to update password");
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
            .from("profiles")
            .update({ theme })
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
              theme,
            });
          }
          // Aplica o tema imediatamente
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
            const prev = context.previous.theme;
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
          toast.error("Failed to update theme");
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
            .from("cards")
            .delete()
            .neq("id", "");
          if (error) throw error;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["comments"] });
          toast.success("Board data deleted");
        },
        onError: () => {
          toast.error("Failed to delete board data");
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
            .from("cards")
            .select("id, column");
          if (error) throw error;
          const rows = data ?? [];
          return {
            total: rows.length,
            done: rows.filter((c) => c.column === "done").length,
            inProgress: rows.filter((c) => c.column === "in-progress").length,
            todo: rows.filter((c) => c.column === "todo").length,
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
            .from("cards")
            .select("id, column, created_at")
            .eq("column", "done");
          if (error) throw error;
          const weekMap = new Map<string, number>();
          for (const card of data ?? []) {
            const weekStart = getWeekStart(card.created_at);
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
            .from("cards")
            .select("id, priority");
          if (error) throw error;
          const priorityMap = new Map<string, number>();
          for (const card of data ?? []) {
            priorityMap.set(
              card.priority,
              (priorityMap.get(card.priority) ?? 0) + 1,
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
            .from("cards")
            .select("id, created_at")
            .order("created_at", { ascending: true });
          if (error) throw error;
          const dayMap = new Map<string, number>();
          for (const card of data ?? []) {
            const date = card.created_at.slice(0, 10);
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




