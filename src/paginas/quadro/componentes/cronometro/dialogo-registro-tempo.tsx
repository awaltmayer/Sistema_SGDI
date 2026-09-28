import { useMemo } from "react";
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
  IconCircleCheck,
} from "@tabler/icons-react";
import type { RastreadorTempoTarefa } from "@/tipos/quadro";
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
    (acc, p: any) =>
      p.tipo === "conclusao" || p.type === "conclusao"
        ? acc
        : acc + (p.duracao_segundos ?? p.duration_seconds ?? 0),
    0
  );

  const totalApenasPausas = pausas.filter(
    (p: any) => p.tipo !== "conclusao" && p.type !== "conclusao"
  ).length;

  const concluidoEmStr =
    rastreador?.concluido_em ??
    rastreador?.completed_at ??
    pausas.find((p: any) => p.tipo === "conclusao" || p.type === "conclusao")?.pausado_em ??
    pausas.find((p: any) => p.tipo === "conclusao" || p.type === "conclusao")?.paused_at;

  const concluidoPorStr =
    rastreador?.concluido_por_nome ??
    rastreador?.completed_by_name ??
    pausas.find((p: any) => p.tipo === "conclusao" || p.type === "conclusao")?.usuario_nome ??
    pausas.find((p: any) => p.tipo === "conclusao" || p.type === "conclusao")?.user_name;

  const itensLinhaTempo = useMemo(() => {
    let numPausa = 1;
    const mapeados = pausas.map((p: any) => {
      const isConclusao = p.tipo === "conclusao" || p.type === "conclusao";
      return {
        ...p,
        isConclusao,
        numeroPausa: isConclusao ? null : numPausa++,
      };
    });

    if (concluidoEmStr && !mapeados.some((it: any) => it.isConclusao)) {
      mapeados.push({
        id: "conclusao-sintetica",
        pausado_em: concluidoEmStr,
        motivo: "Demanda concluída (movida para a coluna Concluído)",
        usuario_nome: concluidoPorStr ?? "Usuário",
        isConclusao: true,
        duracao_segundos: 0,
      });
    }

    return [...mapeados].reverse();
  }, [pausas, concluidoEmStr, concluidoPorStr]);

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
            <DialogTitle>Histórico de Tempo e Auditoria da Tarefa</DialogTitle>
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
              {totalApenasPausas}
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

        {/* Notificação destacada de conclusão, se a demanda foi movida para Concluído */}
        {concluidoEmStr && (
          <div className="flex items-start gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-900 dark:text-emerald-200">
            <IconCircleCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Demanda Concluída
                </span>
                <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Status: Concluído
                </span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Movida para a coluna <strong>Concluído</strong> em{" "}
                <span className="font-medium text-foreground">
                  {format(parseISO(concluidoEmStr), "dd/MM/yyyy 'às' HH:mm:ss", {
                    locale: ptBR,
                  })}
                </span>
                {concluidoPorStr && (
                  <> por <span className="font-medium text-foreground">{concluidoPorStr}</span></>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Linha do tempo de pausas e eventos */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Registro de Eventos, Pausas e Auditoria
          </h4>

          {itensLinhaTempo.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
              Nenhum registro de pausa ou conclusão para esta tarefa até o momento.
            </div>
          ) : (
            <div className="sgdi-log-timeline">
              {itensLinhaTempo.map((p: any, idx: number) => {
                const pausadoEmStr = p.pausado_em ?? p.paused_at;
                const pausedDate = pausadoEmStr ? parseISO(pausadoEmStr) : new Date();
                const retomadoEmStr = p.retomado_em ?? p.resumed_at;
                const resumedDate = retomadoEmStr ? parseISO(retomadoEmStr) : null;
                const duracao = p.duracao_segundos ?? p.duration_seconds ?? 0;
                const motivo = p.motivo ?? p.reason ?? (p.isConclusao ? "Demanda concluída" : "Pausa");
                const usuario = p.usuario_nome ?? p.user_name ?? "Usuário";

                if (p.isConclusao) {
                  return (
                    <div key={p.id || `conclusao-${idx}`} className="relative group">
                      {/* Indicador no dot verde de conclusão */}
                      <div className="sgdi-log-timeline-dot is-conclusao" />

                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-3 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <IconCircleCheck className="size-4" />
                            Demanda Concluída
                          </span>
                          <span className="font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                            Movida para Concluído
                          </span>
                        </div>

                        {/* Detalhes da Ação */}
                        <div className="rounded bg-background/80 p-2 border border-emerald-500/20">
                          <span className="text-[11px] font-semibold text-muted-foreground block mb-0.5">
                            Ação Registrada no Sistema:
                          </span>
                          <p className="text-sm font-medium text-foreground">
                            &ldquo;{motivo}&rdquo;
                          </p>
                        </div>

                        {/* Data, Horário e Usuário */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                          <div className="flex items-center gap-1.5">
                            <IconUser className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-medium text-foreground">
                              {usuario}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <IconCalendar className="size-3" />
                            {format(pausedDate, "dd/MM/yyyy 'às' HH:mm:ss", {
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={p.id || p.numeroPausa} className="relative group">
                    {/* Indicador no dot âmbar de pausa */}
                    <div className="sgdi-log-timeline-dot" />

                    <div className="rounded-lg border bg-card p-3 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <IconPlayerPause className="size-3.5" />
                          Pausa #{p.numeroPausa}
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
