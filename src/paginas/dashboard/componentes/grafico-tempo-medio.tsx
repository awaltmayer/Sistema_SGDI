import {
  IconCalendarStats,
} from '@tabler/icons-react';
import type { MetricasTempoResolucao, MetricasTempoPorPrioridade } from '../calculos-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/cartao';

const COR_CRONOMETRO = '#2563eb'; // Azul Real Sólido
const COR_CALENDARIO = '#16a34a'; // Verde Esmeralda Sólido

interface PropsGraficoTempoMedio {
  metricasTempo: MetricasTempoResolucao;
  tempoPorPrioridade: MetricasTempoPorPrioridade[];
}

export function GraficoTempoMedio({
  metricasTempo,
  tempoPorPrioridade,
}: PropsGraficoTempoMedio) {
  const { totalConcluidas, cronometroMedioDias, calendarioMedioDias } = metricasTempo;

  const maxValor = Math.max(
    1,
    calendarioMedioDias,
    cronometroMedioDias,
    ...tempoPorPrioridade.map((p) => Math.max(p.calendarioMedioDias, p.cronometroMedioDias))
  );

  return (
    <Card className="border-0 shadow-xs bg-card rounded-md">
      <CardHeader className="pb-1.5 pt-3 px-3 border-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <IconCalendarStats className="size-4 text-primary" />
            Comparativo de Resolução
          </CardTitle>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-foreground text-[11px] font-medium">
              <span className="size-2.5 rounded-xs" style={{ backgroundColor: COR_CRONOMETRO }} />
              <span>Cronômetro</span>
            </span>
            <span className="flex items-center gap-1 text-foreground text-[11px] font-medium">
              <span className="size-2.5 rounded-xs" style={{ backgroundColor: COR_CALENDARIO }} />
              <span>Calendário</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              (Canceladas fora)
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-2.5 border-0">
        {totalConcluidas === 0 ? (
          <div className="p-3 text-center text-xs text-muted-foreground bg-muted rounded-sm border-0">
            Sem demandas concluídas com os filtros atuais.
          </div>
        ) : (
          <>
            {/* Comparativo Segmentado por Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {tempoPorPrioridade.map((item) => {
                const percCron = Math.round((item.cronometroMedioDias / maxValor) * 100);
                const percCal = Math.round((item.calendarioMedioDias / maxValor) * 100);

                return (
                  <div
                    key={item.prioridade}
                    className="p-2 rounded-sm bg-muted/40 space-y-1 text-xs border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="size-2.5 rounded-xs" style={{ backgroundColor: item.cor }} />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.totalConcluidas} conc.
                      </span>
                    </div>

                    {item.totalConcluidas === 0 ? (
                      <span className="text-[10px] text-muted-foreground italic">Nenhuma</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground">Foco: {item.cronometroMedioDias}d</span>
                          <span className="text-muted-foreground">Total: {item.calendarioMedioDias}d</span>
                        </div>
                        <div className="w-full h-2 rounded-xs bg-muted overflow-hidden flex gap-0.5 border-0">
                          <div
                            className="h-full rounded-xs transition-all duration-300"
                            style={{ width: `${percCron}%`, backgroundColor: COR_CRONOMETRO }}
                            title={`Cronômetro: ${item.cronometroMedioDias} dias`}
                          />
                          <div
                            className="h-full rounded-xs transition-all duration-300"
                            style={{ width: `${percCal}%`, backgroundColor: COR_CALENDARIO }}
                            title={`Calendário: ${item.calendarioMedioDias} dias`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
