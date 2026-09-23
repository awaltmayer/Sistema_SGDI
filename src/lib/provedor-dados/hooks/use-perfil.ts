/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import { toast } from "sonner";
import type { Profile, Theme, UpdateProfileInput, UpdatePasswordInput, Tema } from "../tipos";

export function criarModuloPerfil() {
  return {
    useCurrentUser: () => {
      const { user } = useAuth();
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

    useProfiles: () => {
      const { user } = useAuth();
      const { data, isLoading } = useQuery({
        queryKey: ["profiles"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("perfis")
            .select("id, nome_completo, iniciais, email, tema, url_avatar, criado_em")
            .order("nome_completo", { ascending: true });
          if (error) return [];
          return (data ?? []).map((row: any) => ({
            id: row.id,
            nome_completo: row.nome_completo,
            iniciais: row.iniciais,
            email: row.email,
            tema: row.tema as Tema,
            url_avatar: row.url_avatar,
            criado_em: row.criado_em,
            // Aliases de compatibilidade
            full_name: row.nome_completo,
            initials: row.iniciais,
            theme: row.tema as Tema,
            avatar_url: row.url_avatar,
            created_at: row.criado_em,
          })) as Profile[];
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useUpdateProfile: () => {
      const { user } = useAuth();
      const queryClient = useQueryClient();
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
      const { user } = useAuth();
      const queryClient = useQueryClient();
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
      const queryClient = useQueryClient();
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
  };
}
