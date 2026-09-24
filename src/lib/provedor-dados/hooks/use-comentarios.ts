/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import { toast } from "sonner";
import type { Comment, CreateCommentInput } from "../tipos";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseParamId(id: string | number | null | undefined): string | number | null {
  if (id === null || id === undefined || id === "") return null;
  const str = String(id).trim();
  if (UUID_REGEX.test(str)) return str;
  if (/^\d+$/.test(str)) return Number(str);
  return str;
}

export function criarModuloComentarios() {
  return {
    useComments: (cardId: string) => {
      const { user } = useAuth();
      const { data, isLoading } = useQuery({
        queryKey: ["comments", cardId],
        queryFn: async () => {
          if (!cardId) return [];
          const idQuery = parseParamId(cardId);
          if (idQuery === null) return [];

          try {
            const { data, error } = await supabase
              .from("comentarios")
              .select(
                `
                id, id_usuario, id_cartao, id_autor, conteudo, criado_em,
                usuarios (id, nome_completo, iniciais, url_avatar)
              `
              )
              .eq("id_cartao", idQuery as any)
              .order("criado_em", { ascending: true });

            if (error) {
              console.warn("Aviso ao carregar comentários do Supabase:", error.message);
              return [];
            }

            return (data ?? []).map((row: any) => {
              const tm = Array.isArray(row.usuarios)
                ? row.usuarios[0]
                : (row.usuarios || (Array.isArray(row.membros_equipe) ? row.membros_equipe[0] : row.membros_equipe));

              const autorObj = tm
                ? {
                    id: String(tm.id),
                    nome_completo: tm.nome_completo,
                    iniciais: tm.iniciais,
                    url_avatar: tm.url_avatar,
                    full_name: tm.nome_completo,
                    initials: tm.iniciais,
                    avatar_url: tm.url_avatar,
                  }
                : null;

              return {
                id: String(row.id),
                id_usuario: row.id_usuario,
                id_cartao: String(row.id_cartao),
                id_autor: row.id_autor != null ? String(row.id_autor) : "",
                conteudo: row.conteudo,
                criado_em: row.criado_em,
                autor: autorObj,
                // Aliases de compatibilidade
                user_id: row.id_usuario,
                card_id: String(row.id_cartao),
                author_id: row.id_autor != null ? String(row.id_autor) : "",
                body: row.conteudo,
                created_at: row.criado_em,
                author: autorObj,
              } as Comment;
            });
          } catch (err) {
            console.warn("Erro ao buscar comentários:", err);
            return [];
          }
        },
        enabled: Boolean(cardId),
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useCreateComment: () => {
      const { user } = useAuth();
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: async (input: CreateCommentInput) => {
          const rawCardId = input.idCartao ?? input.cardId ?? "";
          const rawAuthorId = input.idAutor ?? input.authorId ?? "";
          const bodyText = (input.conteudo ?? input.body ?? "").trim();

          if (!bodyText) {
            throw new Error("O comentário não pode ser vazio.");
          }
          if (!rawCardId) {
            throw new Error("Identificador do cartão não especificado.");
          }

          const cardIdQuery = parseParamId(rawCardId);
          const authorIdQuery = parseParamId(rawAuthorId);
          const userId = user?.id ?? input.idUsuario ?? input.userId ?? undefined;

          const payload: Record<string, any> = {
            id_cartao: cardIdQuery,
            conteudo: bodyText,
          };

          if (userId) {
            payload.id_usuario = userId;
          }

          if (authorIdQuery !== null) {
            payload.id_autor = authorIdQuery;
          }

          let res = await supabase
            .from("comentarios")
            .insert(payload as any)
            .select(
              `
              id, id_usuario, id_cartao, id_autor, conteudo, criado_em,
              usuarios (id, nome_completo, iniciais, url_avatar)
            `
            )
            .single();

          // Fallback resiliente: se falhar por restrição de chave estrangeira em id_autor,
          // tenta novamente sem id_autor preservando id_usuario e conteudo
          if (res.error && payload.id_autor) {
            delete payload.id_autor;
            res = await supabase
              .from("comentarios")
              .insert(payload as any)
              .select(
                `
                id, id_usuario, id_cartao, id_autor, conteudo, criado_em,
                usuarios (id, nome_completo, iniciais, url_avatar)
              `
              )
              .single();
          }

          if (res.error) {
            throw res.error;
          }

          return res.data;
        },
        onSuccess: (_data, variables) => {
          const cId = variables.idCartao ?? variables.cardId;
          queryClient.invalidateQueries({
            queryKey: ["comments"],
          });
          if (cId) {
            queryClient.invalidateQueries({
              queryKey: ["comments", String(cId)],
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["comment-counts"],
          });
          toast.success("Comentário adicionado com sucesso!");
        },
        onError: (err: any) => {
          console.error("Erro ao adicionar comentário:", err);
          toast.error(err?.message || "Falha ao adicionar comentário");
        },
      });

      return {
        mutate: (input: CreateCommentInput) => mutation.mutate(input),
        mutateAsync: (input: CreateCommentInput) => mutation.mutateAsync(input),
        isPending: mutation.isPending,
      };
    },

    useDeleteComment: () => {
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: async (commentId: string | number) => {
          const idQuery = parseParamId(commentId);
          if (idQuery === null) throw new Error("ID de comentário inválido.");

          const { error } = await supabase
            .from("comentarios")
            .delete()
            .eq("id", idQuery as any);

          if (error) throw error;
          return commentId;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["comments"] });
          queryClient.invalidateQueries({ queryKey: ["comment-counts"] });
          toast.success("Comentário excluído com sucesso!");
        },
        onError: (err: any) => {
          console.error("Erro ao excluir comentário:", err);
          toast.error(err?.message || "Falha ao excluir comentário");
        },
      });

      return {
        mutate: (commentId: string | number) => mutation.mutate(commentId),
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

          if (error) {
            console.warn("Aviso ao carregar contagem de comentários:", error.message);
            return {};
          }

          const counts: Record<string, number> = {};
          for (const row of (data ?? []) as any[]) {
            const cid = String(row.id_cartao);
            counts[cid] = (counts[cid] ?? 0) + 1;
          }
          return counts;
        },
        refetchOnWindowFocus: true,
      });

      return { data: data ?? {}, isLoading };
    },
  };
}
