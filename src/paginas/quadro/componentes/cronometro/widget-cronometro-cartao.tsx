import { useState, useEffect } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconHistory,
  IconClock,
} from "@tabler/icons-react";
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
import type { TaskTimeTracker } from "@/dados/dados-iniciais";
import { cn } from "@/lib/utilitarios";
import "./widget-cronometro-cartao.css";

export interface PropsWidgetCronometroCartao {
  cardId: string;
  cardTitle: string;
  timeTracker?: TaskTimeTracker;
  compact?: boolean;
  // Aliases compatibilidade
  tituloCartao?: string;
  rastreadorTempo?: TaskTimeTracker;
  compacto?: boolean;
}
export type CardTimerWidgetProps = PropsWidgetCronometroCartao;

export function WidgetCronometroCartao({
  cardId,
  cardTitle,
  timeTracker,
  compact = false,
  tituloCartao,
  rastreadorTempo,
  compacto,
}: PropsWidgetCronometroCartao) {
  const titulo = tituloCartao ?? cardTitle;
  const rastreador = rastreadorTempo ?? timeTracker;
  const modoCompacto = compacto !== undefined ? compacto : compact;

  const {
    useStartTaskTimer,
    usePauseTaskTimer,
    useResumeTaskTimer,
    useStopTaskTimer,
  } = useDataProvider();

  const { mutate: startTimer } = useStartTaskTimer();
  const { mutate: pauseTimer } = usePauseTaskTimer();
  const { mutate: resumeTimer } = useResumeTaskTimer();
  const { mutate: stopTimer } = useStopTaskTimer();

  const [dialogoPausaAberto, setDialogoPausaAberto] = useState(false);
  const [dialogoLogAberto, setDialogoLogAberto] = useState(false);
  const [segundosAtuais, setSegundosAtuais] = useState(
    rastreador?.total_spent_seconds ?? 0
  );

  const estaExecutando = rastreador?.is_running ?? false;
  const iniciadoEm = rastreador?.started_at;
  const segundosBase = rastreador?.total_spent_seconds ?? 0;

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
    if (segundosBase > 0 || (rastreador?.pauses && rastreador.pauses.length > 0)) {
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
            title={estaExecutando ? "Pausar tarefa" : "Iniciar/Retomar tarefa"}
            aria-label={estaExecutando ? "Pausar tarefa" : "Iniciar tarefa"}
            onClick={estaExecutando ? clicarPausar : iniciarOuRetomar}
            className={cn(
              'sgdi-cronometro-btn-trigger',
              estaExecutando ? 'ativo' : segundosAtuais > 0 ? 'inativo' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
                className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={iniciarOuRetomar}
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
