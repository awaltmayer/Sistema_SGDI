import { useState, useEffect, useMemo } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconHistory,
  IconClock,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/componentes/base/botao";
import { useDataProvider } from "@/lib/provedor-dados";
import { PauseReasonDialog } from "./dialogo-motivo-pausa";
import {
  TimeLogDialog,
  formatarSegundosParaTempo,
  formatarSegundosParaCurto,
  formatSecondsToTime,
  formatSecondsToShort,
} from "./dialogo-registro-tempo";
import type { RastreadorTempoTarefa } from "@/dados/dados-iniciais";
import { cn } from "@/lib/utilitarios";
import "./widget-cronometro-cartao.css";

export interface PropsWidgetCronometroCartao {
  cardId: string;
  cardTitle: string;
  timeTracker?: RastreadorTempoTarefa;
  compact?: boolean;
  responsaveis?: any[];
  idsResponsaveis?: string[];
  idResponsavel?: string | null;
  responsavel?: any;
  // Aliases compatibilidade
  tituloCartao?: string;
  rastreadorTempo?: RastreadorTempoTarefa;
  compacto?: boolean;
  assignees?: any[];
  assigneeIds?: string[];
  assigneeId?: string | null;
  assignee?: any;
}
export type CardTimerWidgetProps = PropsWidgetCronometroCartao;

export function WidgetCronometroCartao({
  cardId,
  cardTitle,
  timeTracker,
  compact = false,
  responsaveis,
  idsResponsaveis,
  idResponsavel,
  responsavel,
  tituloCartao,
  rastreadorTempo,
  compacto,
  assignees,
  assigneeIds,
  assigneeId,
  assignee,
}: PropsWidgetCronometroCartao) {
  const titulo = tituloCartao ?? cardTitle;
  const rastreador = rastreadorTempo ?? timeTracker;
  const modoCompacto = compacto !== undefined ? compacto : compact;

  const {
    useStartTaskTimer,
    usePauseTaskTimer,
    useResumeTaskTimer,
    useStopTaskTimer,
    useCurrentUser,
    useTeamMembers,
  } = useDataProvider();

  const { mutate: startTimer } = useStartTaskTimer();
  const { mutate: pauseTimer } = usePauseTaskTimer();
  const { mutate: resumeTimer } = useResumeTaskTimer();
  const { mutate: stopTimer } = useStopTaskTimer();
  const { data: usuarioAtual } = useCurrentUser();
  const { data: membros = [] } = useTeamMembers();

  // Consolidação de todos os IDs de responsáveis atribuídos a este cartão
  const listaIdsResponsaveis = useMemo(() => {
    const list: string[] = [];
    if (idsResponsaveis && idsResponsaveis.length > 0) list.push(...idsResponsaveis.map(String));
    if (assigneeIds && assigneeIds.length > 0) list.push(...assigneeIds.map(String));
    if (responsaveis && responsaveis.length > 0) list.push(...responsaveis.map((r: any) => String(r.id)));
    if (assignees && assignees.length > 0) list.push(...assignees.map((r: any) => String(r.id)));
    if (idResponsavel) list.push(String(idResponsavel));
    if (assigneeId) list.push(String(assigneeId));
    if (responsavel?.id) list.push(String(responsavel.id));
    if (assignee?.id) list.push(String(assignee.id));
    return Array.from(new Set(list));
  }, [idsResponsaveis, assigneeIds, responsaveis, assignees, idResponsavel, assigneeId, responsavel, assignee]);

  // Membro correspondente ao usuário logado
  const membroAtual = useMemo(() => {
    if (!usuarioAtual) return null;
    return (
      membros.find(
        (m: any) =>
          (m.email && m.email.toLowerCase() === (usuarioAtual.email ?? "").toLowerCase()) ||
          (m.id_usuario && String(m.id_usuario) === String(usuarioAtual.id)) ||
          (m.id_usuario_membro && String(m.id_usuario_membro) === String(usuarioAtual.id)) ||
          String(m.id) === String(usuarioAtual.id)
      ) ?? null
    );
  }, [usuarioAtual, membros]);

  // Validação: Somente quem for responsável pela tarefa poderá iniciar o cronômetro
  const podeIniciarCronometro = useMemo(() => {
    if (!usuarioAtual) return false;
    if (listaIdsResponsaveis.length === 0) return false;

    const uId = String(usuarioAtual.id);
    const uAuthId = (usuarioAtual as any)?.id_usuario ? String((usuarioAtual as any).id_usuario) : null;
    const mId = membroAtual ? String(membroAtual.id) : null;
    const uEmail = usuarioAtual.email?.toLowerCase();

    if (listaIdsResponsaveis.includes(uId)) return true;
    if (uAuthId && listaIdsResponsaveis.includes(uAuthId)) return true;
    if (mId && listaIdsResponsaveis.includes(mId)) return true;

    if (uEmail) {
      const respEmails = membros
        .filter((m: any) => listaIdsResponsaveis.includes(String(m.id)))
        .map((m: any) => m.email?.toLowerCase())
        .filter(Boolean);
      if (respEmails.includes(uEmail)) return true;
    }

    return false;
  }, [usuarioAtual, membroAtual, listaIdsResponsaveis, membros]);

  const estaExecutando = Boolean(rastreador?.em_execucao ?? rastreador?.is_running);
  const iniciadoEm = rastreador?.iniciado_em ?? rastreador?.started_at;
  const segundosBase =
    rastreador?.tempo_total_segundos ?? rastreador?.total_spent_seconds ?? 0;

  const [dialogoPausaAberto, setDialogoPausaAberto] = useState(false);
  const [dialogoLogAberto, setDialogoLogAberto] = useState(false);
  const [segundosAtuais, setSegundosAtuais] = useState(segundosBase);

  useEffect(() => {
    if (!estaExecutando || !iniciadoEm) {
      setSegundosAtuais(segundosBase);
      return;
    }

    const timestampInicio = new Date(iniciadoEm).getTime();

    const atualizarTempo = () => {
      const agora = Date.now();
      const segundosSessao = Math.max(
        0,
        Math.floor((agora - timestampInicio) / 1000)
      );
      setSegundosAtuais(segundosBase + segundosSessao);
    };

    atualizarTempo();
    const intervalo = setInterval(atualizarTempo, 1000);
    return () => clearInterval(intervalo);
  }, [estaExecutando, iniciadoEm, segundosBase]);

  const iniciarOuRetomar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!podeIniciarCronometro) {
      if (listaIdsResponsaveis.length === 0) {
        toast.error("Esta tarefa ainda não tem um responsável atribuído.");
      } else {
        toast.error("Apenas o responsável pela tarefa pode iniciar o cronômetro.");
      }
      return;
    }

    const pausas = rastreador?.pausas ?? rastreador?.pauses ?? [];
    if (segundosBase > 0 || pausas.length > 0) {
      resumeTimer(cardId);
    } else {
      startTimer(cardId);
    }
  };

  const clicarPausar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogoPausaAberto(true);
  };

  const clicarParar = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopTimer(cardId);
  };

  const abrirLog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogoLogAberto(true);
  };

  if (modoCompacto) {
    return (
      <>
        <div
          className="sgdi-cronometro-compacto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title={
              estaExecutando
                ? "Pausar tarefa"
                : !podeIniciarCronometro
                ? "Apenas os responsáveis pela tarefa podem iniciar o cronômetro"
                : "Iniciar/Retomar tarefa"
            }
            aria-label={estaExecutando ? "Pausar tarefa" : "Iniciar tarefa"}
            onClick={estaExecutando ? clicarPausar : iniciarOuRetomar}
            className={cn(
              'sgdi-cronometro-btn-trigger',
              estaExecutando ? 'ativo' : segundosAtuais > 0 ? 'inativo' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              !estaExecutando && !podeIniciarCronometro && 'opacity-60 cursor-not-allowed hover:bg-transparent'
            )}
          >
            {estaExecutando ? (
              <IconPlayerPause className="size-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <IconPlayerPlay className="size-3" />
            )}
            <span>
              {segundosAtuais > 0
                ? formatarSegundosParaCurto(segundosAtuais)
                : "Iniciar"}
            </span>
          </button>

          {segundosAtuais > 0 && (
            <button
              type="button"
              title="Histórico de tempo e pausas"
              aria-label="Ver histórico de tempo"
              onClick={abrirLog}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
            >
              <IconHistory className="size-3.5" />
            </button>
          )}
        </div>

        <PauseReasonDialog
          open={dialogoPausaAberto}
          onOpenChange={setDialogoPausaAberto}
          cardTitle={titulo}
          onConfirm={(reason) => pauseTimer({ cardId, reason })}
        />

        <TimeLogDialog
          open={dialogoLogAberto}
          onOpenChange={setDialogoLogAberto}
          cardTitle={titulo}
          timeTracker={rastreador}
        />
      </>
    );
  }

  // Modo completo
  return (
    <>
      <div
        className="sgdi-cronometro-card-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconClock className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Contador de Tempo
            </span>
          </div>
          {estaExecutando && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              Ativo
            </span>
          )}
        </div>

        {/* Display do tempo */}
        <div className="sgdi-cronometro-display-box">
          <div className="sgdi-cronometro-display-numeros">
            {formatarSegundosParaTempo(segundosAtuais)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Tempo total investido na tarefa
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          {estaExecutando ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 gap-1.5"
                onClick={clicarPausar}
              >
                <IconPlayerPause className="size-4" />
                Pausar (Justificar)
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={clicarParar}
              >
                <IconPlayerStop className="size-4" />
                Finalizar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                className={cn(
                  "flex-1 gap-1.5 text-white transition-colors",
                  !podeIniciarCronometro
                    ? "bg-slate-400 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-600 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}
                onClick={iniciarOuRetomar}
                title={
                  !podeIniciarCronometro
                    ? "Apenas os responsáveis pela tarefa podem iniciar o cronômetro"
                    : undefined
                }
              >
                <IconPlayerPlay className="size-4" />
                {segundosAtuais > 0 ? "Retomar Trabalho" : "Iniciar Tarefa"}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={abrirLog}
            title="Ver histórico de pausas e justificativas"
          >
            <IconHistory className="size-4" />
            Logs
          </Button>
        </div>
      </div>

      <PauseReasonDialog
        open={dialogoPausaAberto}
        onOpenChange={setDialogoPausaAberto}
        cardTitle={titulo}
        onConfirm={(reason) => pauseTimer({ cardId, reason })}
      />

      <TimeLogDialog
        open={dialogoLogAberto}
        onOpenChange={setDialogoLogAberto}
        cardTitle={titulo}
        timeTracker={rastreador}
      />
    </>
  );
}

export const CardTimerWidget = WidgetCronometroCartao;
