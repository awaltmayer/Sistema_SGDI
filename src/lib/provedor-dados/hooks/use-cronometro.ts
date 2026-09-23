import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { configuracaoComplexidade } from "@/dados/dados-iniciais";
import type { Complexity } from "../tipos";
import { loadSupabaseMetadata, saveSupabaseMetadata } from "../storage-local";

export function criarModuloCronometro() {
  return {
    useStartTaskTimer: () => {
      const queryClient = useQueryClient();
      return {
        mutate: (cardId: string) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            tempo_total_segundos: 0,
            pausas: [],
          };
          if (tracker.em_execucao || tracker.is_running) return;
          const nowIso = new Date().toISOString();
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              ...tracker,
              em_execucao: true,
              iniciado_em: nowIso,
              ultima_acao_em: nowIso,
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
      const queryClient = useQueryClient();
      return {
        mutate: ({ cardId, card_id, reason, motivo }: { cardId?: string; card_id?: string; reason?: string; motivo?: string }) => {
          const cId = cardId ?? card_id ?? "";
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            tempo_total_segundos: 0,
            pausas: [],
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
            duracao_segundos: 0,
            motivo: reasonText,
          };
          const existingPauses = tracker.pausas ?? tracker.pauses ?? [];
          const totalSpent = (tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0) + elapsed;
          metaMap[cId] = {
            ...currentMeta,
            time_tracker: {
              em_execucao: false,
              iniciado_em: null,
              tempo_total_segundos: totalSpent,
              ultima_acao_em: now.toISOString(),
              pausas: [...existingPauses, newPause],
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
      const queryClient = useQueryClient();
      return {
        mutate: (cardId: string) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            tempo_total_segundos: 0,
            pausas: [],
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
                duracao_segundos: pauseDur,
              };
            }
          }
          metaMap[cardId] = {
            ...currentMeta,
            time_tracker: {
              ...tracker,
              em_execucao: true,
              iniciado_em: now.toISOString(),
              ultima_acao_em: now.toISOString(),
              pausas: existingPauses,
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
      const queryClient = useQueryClient();
      return {
        mutate: (cardId: string) => {
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cardId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            tempo_total_segundos: 0,
            pausas: [],
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
              iniciado_em: null,
              tempo_total_segundos: totalSpent,
              ultima_acao_em: now.toISOString(),
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
      const queryClient = useQueryClient();
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
            `Complexidade alterada para ${configuracaoComplexidade[compl].label}`
          );
        },
        isPending: false,
      };
    },
  };
}
