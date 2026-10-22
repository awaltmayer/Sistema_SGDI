import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LogAuditoria, EntradaRegistrarLog, FiltrosLogs } from "@/tipos/auditoria";
import {
  buscarLogsAuditoria,
  registrarLogAuditoria,
  exportarLogsCSV,
  exportarLogsJSON,
} from "@/lib/auditoria/servico-auditoria";

export function criarModuloAuditoria() {
  return {
    useAuditLogs: (filtros?: FiltrosLogs) => {
      const queryClient = useQueryClient();

      useEffect(() => {
        const lidarComNovoLog = () => {
          queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        };

        window.addEventListener("sgdi-novo-log-auditoria", lidarComNovoLog);
        return () => {
          window.removeEventListener("sgdi-novo-log-auditoria", lidarComNovoLog);
        };
      }, [queryClient]);

      const { data, isLoading, refetch } = useQuery({
        queryKey: ["audit-logs", filtros],
        queryFn: async () => {
          return await buscarLogsAuditoria(filtros);
        },
        refetchOnWindowFocus: true,
      });

      return {
        data: (data ?? []) as LogAuditoria[],
        isLoading,
        refetch,
      };
    },

    useLogAuditoria: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async (entrada: EntradaRegistrarLog) => {
          return await registrarLogAuditoria(entrada);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
      });
    },

    exportarLogsCSV,
    exportarLogsJSON,
  };
}
