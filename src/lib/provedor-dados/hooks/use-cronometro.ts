/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  configuracaoComplexidade,
  type RastreadorTempoTarefa,
  type RegistroPausaTempo,
} from "@/dados/dados-iniciais";
import type { Complexity } from "../tipos";
import { loadSupabaseMetadata, saveSupabaseMetadata } from "../storage-local";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";

function updateTrackerQueryCache(
  queryClient: any,
  cardId: string,
  updatedTracker: RastreadorTempoTarefa
) {
  const cIdStr = String(cardId);
  queryClient.setQueryData(["card", cIdStr], (oldCard: any) => {
    if (!oldCard) return oldCard;
    return {
      ...oldCard,
      rastreador_tempo: updatedTracker,
      time_tracker: updatedTracker,
    };
  });
  queryClient.setQueryData(["cards"], (oldCards: any[]) => {
    if (!Array.isArray(oldCards)) return oldCards;
    return oldCards.map((c) => {
      if (String(c.id) !== cIdStr) return c;
      return {
        ...c,
        rastreador_tempo: updatedTracker,
        time_tracker: updatedTracker,
      };
    });
  });
}

export function criarModuloCronometro() {
  return {
    useStartTaskTimer: () => {
      const queryClient = useQueryClient();
      return {
        mutate: (cardId: string) => {
          const cId = String(cardId);
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            tempo_total_segundos: 0,
            pausas: [],
          };
          if (tracker.em_execucao || tracker.is_running) return;

          const nowIso = new Date().toISOString();
          const updatedTracker: RastreadorTempoTarefa = {
            ...tracker,
            em_execucao: true,
            is_running: true,
            iniciado_em: nowIso,
            started_at: nowIso,
            ultima_acao_em: nowIso,
            last_action_at: nowIso,
            tempo_total_segundos:
              tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0,
            total_spent_seconds:
              tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0,
            pausas: tracker.pausas ?? tracker.pauses ?? [],
            pauses: tracker.pausas ?? tracker.pauses ?? [],
          };

          metaMap[cId] = {
            ...currentMeta,
            time_tracker: updatedTracker,
          };
          saveSupabaseMetadata(metaMap);

          // Atualização otimista instantânea no cache do React Query
          updateTrackerQueryCache(queryClient, cId, updatedTracker);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
          toast.success("Cronômetro iniciado");
        },
        isPending: false,
      };
    },

    usePauseTaskTimer: () => {
      const queryClient = useQueryClient();
      const { user } = useAuth();

      return {
        mutate: ({
          cardId,
          card_id,
          reason,
          motivo,
        }: {
          cardId?: string;
          card_id?: string;
          reason?: string;
          motivo?: string;
        }) => {
          const cId = String(cardId ?? card_id ?? "");
          if (!cId) return;

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
          const nowIso = now.toISOString();
          const elapsed = Math.max(
            0,
            Math.floor((now.getTime() - new Date(started).getTime()) / 1000)
          );
          const reasonText = (motivo ?? reason ?? "Pausa").trim() || "Pausa";

          const userName =
            (user?.user_metadata as any)?.full_name ??
            (user?.user_metadata as any)?.name ??
            user?.email?.split("@")[0] ??
            "Usuário";

          const newPause: RegistroPausaTempo = {
            id: `pause-${Date.now()}`,
            pausado_em: nowIso,
            paused_at: nowIso,
            retomado_em: null,
            resumed_at: null,
            duracao_segundos: 0,
            duration_seconds: 0,
            motivo: reasonText,
            reason: reasonText,
            usuario_id: user?.id ?? null,
            usuario_nome: userName,
            usuario_email: user?.email ?? null,
            user_name: userName,
          };

          const existingPauses = tracker.pausas ?? tracker.pauses ?? [];
          const totalSpent =
            (tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0) +
            elapsed;

          const updatedTracker: RastreadorTempoTarefa = {
            em_execucao: false,
            is_running: false,
            iniciado_em: null,
            started_at: null,
            tempo_total_segundos: totalSpent,
            total_spent_seconds: totalSpent,
            ultima_acao_em: nowIso,
            last_action_at: nowIso,
            pausas: [...existingPauses, newPause],
            pauses: [...existingPauses, newPause],
          };

          metaMap[cId] = {
            ...currentMeta,
            time_tracker: updatedTracker,
          };
          saveSupabaseMetadata(metaMap);

          // Atualização otimista instantânea no cache do React Query
          updateTrackerQueryCache(queryClient, cId, updatedTracker);

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
          const cId = String(cardId);
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            tempo_total_segundos: 0,
            pausas: [],
          };
          if (tracker.em_execucao || tracker.is_running) return;

          const now = new Date();
          const nowIso = now.toISOString();
          const existingPauses = [...(tracker.pausas ?? tracker.pauses ?? [])];

          if (existingPauses.length > 0) {
            const lastIdx = existingPauses.length - 1;
            const last = existingPauses[lastIdx];
            const pausedAt = last.pausado_em ?? last.paused_at;
            if (pausedAt && !last.retomado_em && !last.resumed_at) {
              const pauseDur = Math.max(
                0,
                Math.floor((now.getTime() - new Date(pausedAt).getTime()) / 1000)
              );
              existingPauses[lastIdx] = {
                ...last,
                retomado_em: nowIso,
                resumed_at: nowIso,
                duracao_segundos: pauseDur,
                duration_seconds: pauseDur,
              };
            }
          }

          const updatedTracker: RastreadorTempoTarefa = {
            ...tracker,
            em_execucao: true,
            is_running: true,
            iniciado_em: nowIso,
            started_at: nowIso,
            ultima_acao_em: nowIso,
            last_action_at: nowIso,
            tempo_total_segundos:
              tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0,
            total_spent_seconds:
              tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0,
            pausas: existingPauses,
            pauses: existingPauses,
          };

          metaMap[cId] = {
            ...currentMeta,
            time_tracker: updatedTracker,
          };
          saveSupabaseMetadata(metaMap);

          // Atualização otimista instantânea no cache do React Query
          updateTrackerQueryCache(queryClient, cId, updatedTracker);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
          toast.success("Cronômetro retomado");
        },
        isPending: false,
      };
    },

    useStopTaskTimer: () => {
      const queryClient = useQueryClient();
      return {
        mutate: (cardId: string) => {
          const cId = String(cardId);
          const metaMap = loadSupabaseMetadata();
          const currentMeta = metaMap[cId] ?? {};
          const tracker = currentMeta.time_tracker ?? {
            em_execucao: false,
            tempo_total_segundos: 0,
            pausas: [],
          };
          const now = new Date();
          const nowIso = now.toISOString();
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
          const totalSpent =
            (tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0) +
            elapsed;

          const updatedTracker: RastreadorTempoTarefa = {
            ...tracker,
            em_execucao: false,
            is_running: false,
            iniciado_em: null,
            started_at: null,
            tempo_total_segundos: totalSpent,
            total_spent_seconds: totalSpent,
            ultima_acao_em: nowIso,
            last_action_at: nowIso,
            pausas: tracker.pausas ?? tracker.pauses ?? [],
            pauses: tracker.pausas ?? tracker.pauses ?? [],
          };

          metaMap[cId] = {
            ...currentMeta,
            time_tracker: updatedTracker,
          };
          saveSupabaseMetadata(metaMap);

          // Atualização otimista instantânea no cache do React Query
          updateTrackerQueryCache(queryClient, cId, updatedTracker);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
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
