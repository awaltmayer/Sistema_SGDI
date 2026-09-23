/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import { toast } from "sonner";
import * as seed from "@/dados/dados-iniciais";
import type {
  CardWithAssignee,
  CreateCardInput,
  UpdateCardInput,
  ReorderInput,
  IdColuna,
  Prioridade,
  Complexity,
} from "../tipos";
import { loadSupabaseChecklists, loadSupabaseMetadata, saveSupabaseChecklists, saveSupabaseMetadata } from "../storage-local";

export function criarModuloCartoes() {
  return {
    useCards: () => {
      const { user } = useAuth();
      const { data, isLoading } = useQuery({
        queryKey: ["cards"],
        queryFn: async () => {
          const { data, error } = await supabase
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
          if (error) throw error;
          const chkMap = loadSupabaseChecklists();
          const metaMap = loadSupabaseMetadata();
          return (data ?? []).map((row: any) => {
            const tm = Array.isArray(row.membros_equipe)
              ? row.membros_equipe[0]
              : row.membros_equipe;
            const meta = metaMap[row.id] ?? {};
            const respObj = tm
              ? {
                  id: String(tm.id),
                  nome_completo: tm.nome_completo,
                  iniciais: tm.iniciais,
                  url_avatar: tm.url_avatar,
                }
              : null;

            return {
              id: String(row.id),
              id_usuario: row.id_usuario,
              titulo: row.titulo,
              descricao: row.descricao,
              coluna: row.coluna as IdColuna,
              prioridade: row.prioridade as Prioridade,
              id_responsavel: row.id_responsavel != null ? String(row.id_responsavel) : null,
              data_vencimento: row.data_vencimento,
              posicao: row.posicao,
              criado_em: row.criado_em,
              listas_verificacao: chkMap[row.id] ?? [],
              complexidade: (meta.complexity ?? "medium") as Complexity,
              rastreador_tempo: meta.time_tracker ?? {
                em_execucao: false,
                tempo_total_segundos: 0,
                pausas: [],
              },
              responsavel: respObj,
            };
          });
        },
        enabled: !!user,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useCard: (id: string) => {
      const { user } = useAuth();
      const { data, isLoading } = useQuery({
        queryKey: ["card", id],
        queryFn: async () => {
          const idQuery = /^\d+$/.test(String(id)) ? Number(id) : id;
          const { data, error } = await supabase
            .from("cartoes")
            .select(
              `
              id, id_usuario, titulo, descricao, coluna, prioridade, data_vencimento, posicao, criado_em,
              id_responsavel,
              membros_equipe (id, nome_completo, iniciais, url_avatar)
            `,
            )
            .eq("id", idQuery)
            .single();
          if (error) throw error;
          const chkMap = loadSupabaseChecklists();
          const metaMap = loadSupabaseMetadata();
          const meta = metaMap[data.id] ?? {};
          const tm: any = Array.isArray((data as any).membros_equipe)
            ? (data as any).membros_equipe[0]
            : (data as any).membros_equipe;
          const respObj = tm
            ? {
                id: String(tm.id),
                nome_completo: tm.nome_completo,
                iniciais: tm.iniciais,
                url_avatar: tm.url_avatar,
              }
            : null;

          return {
            id: String(data.id),
            id_usuario: data.id_usuario,
            titulo: data.titulo,
            descricao: data.descricao,
            coluna: data.coluna as IdColuna,
            prioridade: data.prioridade as Prioridade,
            id_responsavel: data.id_responsavel != null ? String(data.id_responsavel) : null,
            data_vencimento: data.data_vencimento,
            posicao: data.posicao,
            criado_em: data.criado_em,
            listas_verificacao: chkMap[data.id] ?? [],
            complexidade: (meta.complexity ?? "medium") as Complexity,
            rastreador_tempo: meta.time_tracker ?? {
              em_execucao: false,
              tempo_total_segundos: 0,
              pausas: [],
            },
            responsavel: respObj,
          };
        },
        enabled: !!user && !!id,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? null, isLoading };
    },

    useCreateCard: () => {
      const { user } = useAuth();
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: async (input: CreateCardInput) => {
          const rawResp = input.id_responsavel ?? input.assignee_id;
          const respParsed = rawResp != null ? (/^\d+$/.test(String(rawResp)) ? Number(rawResp) : rawResp) : null;
          const payload: any = {
            id_usuario: user?.id ?? undefined,
            titulo: input.titulo ?? input.title ?? "",
            coluna: input.coluna ?? input.column ?? "todo",
            prioridade: input.prioridade ?? input.priority ?? "low",
            id_responsavel: respParsed,
            data_vencimento: input.data_vencimento ?? input.due_date ?? null,
            posicao: input.posicao ?? input.nextPosition ?? 0,
            descricao: input.descricao ?? input.description ?? "",
          };
          if (input.id && /^\d+$/.test(String(input.id))) {
            payload.id = Number(input.id);
          }

          const { data, error } = await supabase
            .from("cartoes")
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          return data;
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
      const queryClient = useQueryClient();
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
            const rawResp = fields.id_responsavel !== undefined ? fields.id_responsavel : fields.assignee_id;
            patch.id_responsavel = rawResp != null ? (/^\d+$/.test(String(rawResp)) ? Number(rawResp) : rawResp) : null;
          }
          if (fields.data_vencimento !== undefined || fields.due_date !== undefined) {
            patch.data_vencimento = fields.data_vencimento ?? fields.due_date;
          }
          if (fields.posicao !== undefined || fields.position !== undefined) {
            patch.posicao = fields.posicao ?? fields.position;
          }

          const idQuery = /^\d+$/.test(String(id)) ? Number(id) : id;
          const { data, error } = await supabase
            .from("cartoes")
            .update(patch)
            .eq("id", idQuery)
            .select(
              `
              id, id_usuario, titulo, descricao, coluna, prioridade,
              id_responsavel, data_vencimento, posicao, criado_em,
              membros_equipe (id, nome_completo, iniciais, url_avatar)
            `
            )
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
            const teamMembers = queryClient.getQueryData<seed.TeamMember[]>(["team_members"]) ?? [];
            const newRespId =
              fields.id_responsavel !== undefined
                ? fields.id_responsavel
                : fields.assignee_id;
            let respObj = null;
            if (newRespId) {
              const found = teamMembers.find((m) => m.id === newRespId);
              if (found) {
                respObj = {
                  id: String(found.id),
                  nome_completo: found.nome_completo,
                  iniciais: found.iniciais,
                  url_avatar: found.url_avatar,
                };
              }
            }

            queryClient.setQueryData<CardWithAssignee[]>(
              ["cards"],
              previous.map((c) => {
                if (c.id === id) {
                  const updated: any = { ...c, ...fields };
                  if (newRespId !== undefined) {
                    updated.id_responsavel = newRespId;
                    updated.responsavel = respObj;
                  }
                  return updated;
                }
                return c;
              }),
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
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: async (id: string) => {
          const idQuery = /^\d+$/.test(String(id)) ? Number(id) : id;
          // 1. Exclui comentários vinculados primeiro para evitar falha de chave estrangeira
          const { error: errComentarios } = await supabase
            .from("comentarios")
            .delete()
            .eq("id_cartao", idQuery);
          if (errComentarios) {
            console.error("Erro ao excluir comentários associados:", errComentarios);
          }

          // 2. Exclui o cartão do banco de dados Supabase
          const { error } = await supabase
            .from("cartoes")
            .delete()
            .eq("id", idQuery);
          if (error) throw error;

          // 3. Limpa listas de verificação e metadados locais do cartão
          try {
            const chkMap = loadSupabaseChecklists();
            if (chkMap[id]) {
              delete chkMap[id];
              saveSupabaseChecklists(chkMap);
            }
            const metaMap = loadSupabaseMetadata();
            if (metaMap[id]) {
              delete metaMap[id];
              saveSupabaseMetadata(metaMap);
            }
          } catch {
            /* erro silencioso ao limpar cache local do cartão excluído */
          }
        },
        onMutate: async (id) => {
          await queryClient.cancelQueries({ queryKey: ["cards"] });
          await queryClient.cancelQueries({ queryKey: ["card", id] });

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
        onSuccess: () => {
          toast.success("Cartão excluído com sucesso");
        },
        onError: (_err, _id, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["cards"], context.previous);
          }
          toast.error("Falha ao excluir cartão");
        },
        onSettled: (_data, _error, id) => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          if (id) {
            queryClient.removeQueries({ queryKey: ["card", id] });
            queryClient.removeQueries({ queryKey: ["comments", id] });
          }
          queryClient.invalidateQueries({ queryKey: ["comment_counts"] });
        },
      });
      return {
        mutate: (id: string) => mutation.mutate(id),
        mutateAsync: (id: string) => mutation.mutateAsync(id),
        isPending: mutation.isPending,
      };
    },

    useReorderCards: () => {
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: async (reordered: ReorderInput[]) => {
          for (const c of reordered) {
            const idQuery = /^\d+$/.test(String(c.id)) ? Number(c.id) : c.id;
            const { error } = await supabase
              .from("cartoes")
              .update({
                coluna: c.coluna ?? c.column,
                posicao: c.posicao ?? c.position,
              })
              .eq("id", idQuery);
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
                  posicao: nextPos,
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
  };
}
