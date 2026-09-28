// ── Auxiliar: obter início da semana ISO (segunda-feira) ──────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RastreadorTempoTarefa, RegistroPausaTempo } from "@/tipos/quadro";
import { loadSupabaseMetadata, saveSupabaseMetadata } from "./storage-local";

export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().slice(0, 10);
}

// ── Sincronização e Atualização do Cronômetro / Log de Auditoria ───────

export function updateTrackerQueryCache(
  queryClient: any,
  cardId: string,
  updatedTracker: RastreadorTempoTarefa
) {
  if (!queryClient) return;
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

export function registrarConclusaoNoLog(
  cardId: string,
  user?: any,
  queryClient?: any
): RastreadorTempoTarefa | undefined {
  try {
    const cId = String(cardId);
    const metaMap = loadSupabaseMetadata();
    const currentMeta = metaMap[cId] ?? {};
    const tracker: RastreadorTempoTarefa = currentMeta.time_tracker ?? {
      em_execucao: false,
      tempo_total_segundos: 0,
      pausas: [],
    };

    const now = new Date();
    const nowIso = now.toISOString();

    // Se o cronômetro estiver em execução, encerra e acumula o tempo
    const isRunning = tracker.em_execucao || tracker.is_running;
    const started = tracker.iniciado_em ?? tracker.started_at;
    const elapsed =
      isRunning && started
        ? Math.max(
            0,
            Math.floor((now.getTime() - new Date(started).getTime()) / 1000)
          )
        : 0;
    const totalSpent =
      (tracker.tempo_total_segundos ?? tracker.total_spent_seconds ?? 0) +
      elapsed;

    const userName =
      (user?.user_metadata as any)?.full_name ??
      (user?.user_metadata as any)?.name ??
      user?.nome_completo ??
      user?.email?.split("@")[0] ??
      "Usuário";

    const userEmail = user?.email ?? null;
    const userId = user?.id ? String(user.id) : null;

    const existingPauses = tracker.pausas ?? tracker.pauses ?? [];
    const ultimoLog = existingPauses[existingPauses.length - 1];

    // Evita duplicar log se já foi acionado há menos de 3 segundos
    if (
      ultimoLog &&
      (ultimoLog.tipo === "conclusao" || ultimoLog.type === "conclusao") &&
      now.getTime() -
        new Date(ultimoLog.pausado_em || ultimoLog.paused_at || 0).getTime() <
        3000
    ) {
      return tracker;
    }

    const conclusaoLog: RegistroPausaTempo = {
      id: `conclusao-${Date.now()}`,
      pausado_em: nowIso,
      paused_at: nowIso,
      retomado_em: null,
      resumed_at: null,
      duracao_segundos: 0,
      duration_seconds: 0,
      motivo: "Demanda concluída (movida para a coluna Concluído)",
      reason: "Demanda concluída (movida para a coluna Concluído)",
      usuario_id: userId,
      usuario_nome: userName,
      usuario_email: userEmail,
      user_name: userName,
      tipo: "conclusao",
      type: "conclusao",
    };

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
      concluido_em: nowIso,
      completed_at: nowIso,
      concluido_por_nome: userName,
      completed_by_name: userName,
      concluido_por_id: userId,
      concluido_por_email: userEmail,
      pausas: [...existingPauses, conclusaoLog],
      pauses: [...existingPauses, conclusaoLog],
    };

    currentMeta.time_tracker = updatedTracker;
    metaMap[cId] = currentMeta;
    saveSupabaseMetadata(metaMap);

    if (queryClient) {
      updateTrackerQueryCache(queryClient, cId, updatedTracker);
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["card", cId] });
    }

    return updatedTracker;
  } catch (err) {
    console.error("Erro ao registrar conclusão no log:", err);
  }
}

export function desmarcarConclusao(
  cardId: string,
  queryClient?: any
): RastreadorTempoTarefa | undefined {
  try {
    const cId = String(cardId);
    const metaMap = loadSupabaseMetadata();
    const currentMeta = metaMap[cId];
    if (!currentMeta?.time_tracker) return;

    const tracker = currentMeta.time_tracker;
    const updatedTracker: RastreadorTempoTarefa = {
      ...tracker,
      concluido_em: null,
      completed_at: null,
      concluido_por_nome: null,
      completed_by_name: null,
      concluido_por_id: null,
      concluido_por_email: null,
    };

    currentMeta.time_tracker = updatedTracker;
    metaMap[cId] = currentMeta;
    saveSupabaseMetadata(metaMap);

    if (queryClient) {
      updateTrackerQueryCache(queryClient, cId, updatedTracker);
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["card", cId] });
    }

    return updatedTracker;
  } catch (err) {
    console.error("Erro ao desmarcar conclusão no log:", err);
  }
}
