/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import type {
  KpisPainel,
  ConclusaoPorSemana,
  RoscaPrioridade,
  VelocidadePorDia,
} from "../tipos";
import { getWeekStart } from "../auxiliares";

export function criarModuloPainel() {
  return {
    useDashboardKpis: () => {
      const { user } = useAuth();
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
        data: (data ?? { total: 0, done: 0, inProgress: 0, todo: 0 }) as KpisPainel,
        isLoading,
      };
    },

    useCompletionByWeek: () => {
      const { user } = useAuth();
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
      return { data: (data ?? []) as ConclusaoPorSemana[], isLoading };
    },

    usePriorityDonut: () => {
      const { user } = useAuth();
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
      return { data: (data ?? []) as RoscaPrioridade[], isLoading };
    },

    useVelocityByDay: () => {
      const { user } = useAuth();
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
      return { data: (data ?? []) as VelocidadePorDia[], isLoading };
    },
  };
}
