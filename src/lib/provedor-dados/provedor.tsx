import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import type { ProvedorDadosApp, Theme } from "./tipos";
import { criarModuloCartoes } from "./hooks/use-cartoes";
import { criarModuloChecklists } from "./hooks/use-checklists";
import { criarModuloCronometro } from "./hooks/use-cronometro";
import { criarModuloComentarios } from "./hooks/use-comentarios";
import { criarModuloUsuarios } from "./hooks/use-usuarios";
import { criarModuloPerfil } from "./hooks/use-perfil";
import { criarModuloPainel } from "./hooks/use-painel";

export const ContextoProvedorDados = createContext<ProvedorDadosApp | null>(null);

export function useProvedorDados(): ProvedorDadosApp {
  const ctx = useContext(ContextoProvedorDados);
  if (!ctx) throw new Error("useProvedorDados deve ser usado dentro de ProvedorDados");
  return ctx;
}

export const useDataProvider = useProvedorDados;
export const usarProvedorDados = useProvedorDados;

// ── AppData — Guarda de rota autenticada via Supabase ─────────────────

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

// ── SupabaseDataProvider — Provedor de dados agregador ────────────────

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
        { event: "*", schema: "public", table: "checklists" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "itens_checklist" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card"] });
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

  // Agregação dos submódulos
  const moduloCartoes = criarModuloCartoes();
  const moduloChecklists = criarModuloChecklists();
  const moduloCronometro = criarModuloCronometro();
  const moduloComentarios = criarModuloComentarios();
  const moduloUsuarios = criarModuloUsuarios();
  const moduloPerfil = criarModuloPerfil();
  const moduloPainel = criarModuloPainel();

  const provider: ProvedorDadosApp = {
    ...moduloCartoes,
    ...moduloChecklists,
    ...moduloCronometro,
    ...moduloComentarios,
    ...moduloUsuarios,
    ...moduloPerfil,
    ...moduloPainel,
  };

  return (
    <ContextoProvedorDados.Provider value={provider}>
      {children}
    </ContextoProvedorDados.Provider>
  );
}
