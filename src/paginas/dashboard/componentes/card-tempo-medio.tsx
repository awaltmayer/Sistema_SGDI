import {
  IconHourglassEmpty,
  IconCalendarStats,
} from '@tabler/icons-react';
import type { MetricasTempoResolucao } from '../calculos-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/cartao';

interface PropsCardTempoMedio {
  metricasTempo: MetricasTempoResolucao;
}

export function CardTempoMedio({ metricasTempo }: PropsCardTempoMedio) {
  const {
    totalConcluidas,
    cronometroMedioDias,
    cronometroTextoFormatado,
    calendarioMedioDias,
  } = metricasTempo;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* 1. Tempo Médio em Atividade (Cronômetro) */}
      <Card className="border-0 shadow-xs bg-card rounded-md">
        <CardHeader className="pb-1.5 pt-3 px-3 border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className="size-6 rounded-sm text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: '#2563eb' }}
              >
                <IconHourglassEmpty className="size-3.5" />
              </div>
              <CardTitle className="text-xs font-semibold">
                Tempo Ativo (Cronômetro)
              </CardTitle>
            </div>
            <span
              className="font-mono text-[10px] px-1.5 py-0.2 rounded-xs text-white font-bold"
              style={{ backgroundColor: '#2563eb' }}
            >
              Ativo
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-3 pb-3 space-y-0.5 border-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-foreground">
              {cronometroMedioDias}
            </span>
            <span className="text-xs text-muted-foreground">
              {cronometroMedioDias === 1 ? 'dia ativo' : 'dias ativos'}
            </span>
            <span className="text-xs text-muted-foreground font-mono ml-auto">
              ≈ {cronometroTextoFormatado}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Tempo Médio em Dias Brutos do Calendário */}
      <Card className="border-0 shadow-xs bg-card rounded-md">
        <CardHeader className="pb-1.5 pt-3 px-3 border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className="size-6 rounded-sm text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: '#16a34a' }}
              >
                <IconCalendarStats className="size-3.5" />
              </div>
              <CardTitle className="text-xs font-semibold">
                Tempo Corrido (Calendário)
              </CardTitle>
            </div>
            <span
              className="font-mono text-[10px] px-1.5 py-0.2 rounded-xs text-white font-bold"
              style={{ backgroundColor: '#16a34a' }}
            >
              Calendário
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-3 pb-3 space-y-0.5 border-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-foreground">
              {calendarioMedioDias}
            </span>
            <span className="text-xs text-muted-foreground">
              {calendarioMedioDias === 1 ? 'dia corrido' : 'dias corridos'}
            </span>
            <span className="text-xs text-muted-foreground font-mono ml-auto">
              {totalConcluidas} concluídas
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
