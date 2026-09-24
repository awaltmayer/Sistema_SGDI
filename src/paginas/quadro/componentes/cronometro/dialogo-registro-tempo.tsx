import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialogo";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconPlayerPause,
  IconHistory,
  IconCalendar,
  IconUser,
  IconClock,
} from "@tabler/icons-react";
import type { RastreadorTempoTarefa } from "@/dados/dados-iniciais";
import "./dialogo-registro-tempo.css";

export interface PropsDialogoRegistroTempo {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardTitle: string;
  timeTracker?: RastreadorTempoTarefa;
  // Aliases compatibilidade
  aberto?: boolean;
  aoMudarAberto?: (aberto: boolean) => void;
  tituloCartao?: string;
  rastreadorTempo?: RastreadorTempoTarefa;
}
export type TimeLogDialogProps = PropsDialogoRegistroTempo;

export function formatarSegundosParaTempo(totalSegundos: number): string {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  if (horas > 0) {
    return `${horas}h ${minutos.toString().padStart(2, "0")}m ${segundos
      .toString()
      .padStart(2, "0")}s`;
  }
  return `${minutos}m ${segundos.toString().padStart(2, "0")}s`;
}
export const formatSecondsToTime = formatarSegundosParaTempo;

export function formatarSegundosParaCurto(totalSegundos: number): string {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  }
  return `${minutos}m`;
}
export const formatSecondsToShort = formatarSegundosParaCurto;

export function DialogoRegistroTempo({
  open,
  onOpenChange,
  cardTitle,
  timeTracker,
  aberto,
  aoMudarAberto,
  tituloCartao,
  rastreadorTempo,
}: PropsDialogoRegistroTempo) {
  const estaAberto = aberto ?? open;
  const mudarAberto = aoMudarAberto ?? onOpenChange;
  const titulo = tituloCartao ?? cardTitle;
  const rastreador = rastreadorTempo ?? timeTracker;

  const pausas = rastreador?.pausas ?? rastreador?.pauses ?? [];
  const totalSegundosGastos =
    rastreador?.tempo_total_segundos ?? rastreador?.total_spent_seconds ?? 0;
  const totalSegundosPausa = pausas.reduce(
    (acc, p: any) => acc + (p.duracao_segundos ?? p.duration_seconds ?? 0),
    0
  );

  return (
    <Dialog open={estaAberto} onOpenChange={mudarAberto}>
      <DialogContent
        className="max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <IconHistory className="size-5 text-primary" />
            <DialogTitle>Histórico de Tempo e Justificativas de Pausas</DialogTitle>
          </div>
          <DialogDescription className="line-clamp-1">
            Auditoria da tarefa:{" "}
            <span className="font-semibold text-foreground">{titulo}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Resumo dos Indicadores */}
        <div className="sgdi-log-tempo-resumo-grid">
          <div className="text-center">
            <span className="text-[11px] text-muted-foreground block">
              Tempo Ativo
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {formatarSegundosParaTempo(totalSegundosGastos)}
            </span>
          </div>
          <div className="text-center border-x border-border">
            <span className="text-[11px] text-muted-foreground block">
              Pausas
            </span>
            <span className="text-base font-bold text-foreground">
              {pausas.length}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-muted-foreground block">
              Tempo em Pausa
            </span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              {formatarSegundosParaCurto(totalSegundosPausa)}
            </span>
          </div>
        </div>

        {/* Linha do tempo de pausas */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Registro de Pausas e Justificativas
          </h4>

          {pausas.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
              Nenhuma pausa registrada para esta tarefa até o momento.
            </div>
          ) : (
            <div className="sgdi-log-timeline">
              {pausas.map((p: any, idx: number) => {
                const pausadoEmStr = p.pausado_em ?? p.paused_at;
                const pausedDate = pausadoEmStr ? parseISO(pausadoEmStr) : new Date();
                const retomadoEmStr = p.retomado_em ?? p.resumed_at;
                const resumedDate = retomadoEmStr ? parseISO(retomadoEmStr) : null;
                const duracao = p.duracao_segundos ?? p.duration_seconds ?? 0;
                const motivo = p.motivo ?? p.reason ?? "Pausa";
                const usuario = p.usuario_nome ?? p.user_name ?? "Usuário";

                return (
                  <div key={p.id || idx} className="relative group">
                    {/* Indicador no dot */}
                    <div className="sgdi-log-timeline-dot" />

                    <div className="rounded-lg border bg-card p-3 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <IconPlayerPause className="size-3.5" />
                          Pausa #{pausas.length - idx}
                        </span>
                        {duracao > 0 && (
                          <span className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Duração: {formatarSegundosParaTempo(duracao)}
                          </span>
                        )}
                      </div>

                      {/* Motivo da Pausa */}
                      <div className="rounded bg-accent/50 p-2 border border-border/50">
                        <span className="text-[11px] font-semibold text-muted-foreground block mb-0.5">
                          Justificativa / Motivo:
                        </span>
                        <p className="text-sm font-medium text-foreground whitespace-pre-wrap">
                          &ldquo;{motivo}&rdquo;
                        </p>
                      </div>

                      {/* Data, Horário e Usuário */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        <div className="flex items-center gap-1.5">
                          <IconUser className="size-3.5 text-primary" />
                          <span className="font-medium text-foreground">
                            {usuario}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <IconCalendar className="size-3" />
                            {format(pausedDate, "dd/MM/yyyy 'às' HH:mm:ss", {
                              locale: ptBR,
                            })}
                          </span>
                          {resumedDate && (
                            <span className="flex items-center gap-1">
                              <IconClock className="size-3" />
                              Retorno:{" "}
                              {format(resumedDate, "HH:mm:ss", {
                                locale: ptBR,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const TimeLogDialog = DialogoRegistroTempo;
