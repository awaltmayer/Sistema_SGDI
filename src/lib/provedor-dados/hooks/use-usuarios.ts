/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import type { TeamMember } from "../tipos";

export function criarModuloUsuarios() {
  return {
    useTeamMembers: () => {
      const { user } = useAuth();
      const { data, isLoading } = useQuery({
        queryKey: ["team_members"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("usuarios")
            .select("id, id_usuario, nome_completo, iniciais, email, funcao, status, url_avatar, convidado_em, criado_em")
            .neq("status", "removed")
            .order("funcao", { ascending: false })
            .order("nome_completo", { ascending: true });
          if (error) throw error;
          return (data ?? []).map((m: any) => ({
            id: String(m.id),
            id_usuario: m.id_usuario,
            id_usuario_membro: m.id_usuario,
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
  };
}
