/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import { toast } from "sonner";
import type { Comment, CreateCommentInput } from "../tipos";

export function criarModuloComentarios() {
  return {
    useComments: (cardId: string) => {
      const { user } = useAuth();
      const { data, isLoading } = useQuery({
        queryKey: ["comments", cardId],
        queryFn: async () => {
          const idQuery = /^\d+$/.test(String(cardId)) ? Number(cardId) : cardId;
          const { data, error } = await supabase
            .from("comentarios")
            .select(
              `
              id, id_usuario, id_cartao, id_autor, conteudo, criado_em,
              membros_equipe (id, nome_completo, iniciais)
            `,
            )
            .eq("id_cartao", idQuery)
            .order("criado_em", { ascending: true });
          if (error) throw error;
          return (data ?? []).map((row: any) => ({
            id: String(row.id),
            id_usuario: row.id_usuario,
            id_cartao: String(row.id_cartao),
            id_autor: row.id_autor ? String(row.id_autor) : "",
            conteudo: row.conteudo,
            criado_em: row.criado_em,
            // Aliases de compatibilidade
            card_id: String(row.id_cartao),
            author_id: row.id_autor ? String(row.id_autor) : "",
            body: row.conteudo,
            created_at: row.criado_em,
          })) as Comment[];
        },
        enabled: !!user && !!cardId,
        refetchOnWindowFocus: true,
      });
      return { data: data ?? [], isLoading };
    },

    useCreateComment: () => {
      const { user } = useAuth();
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: async (input: CreateCommentInput) => {
          const cId = input.idCartao ?? input.cardId ?? "";
          const aId = input.idAutor ?? input.authorId ?? "";
          const bodyText = input.conteudo ?? input.body ?? "";
          const cIdQuery = /^\d+$/.test(String(cId)) ? Number(cId) : cId;
          const aIdQuery = aId ? (/^\d+$/.test(String(aId)) ? Number(aId) : aId) : null;
          const { data, error } = await supabase
            .from("comentarios")
            .insert({
              id_usuario: user?.id ?? undefined,
              id_cartao: cIdQuery,
              id_autor: aIdQuery,
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
      const { user } = useAuth();
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
  };
}
