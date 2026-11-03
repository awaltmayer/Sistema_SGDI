import type { CSSProperties } from 'react';
import {
  formatarNumero,
  formatarSegundosEmHoras,
  type MetricasTempoPorPrioridade,
  type MetricasTempoResolucao,
} from '../calculos-dashboard';
import { PainelDashboard } from './painel-dashboard';

const COR_BARRA_TEMPO = '#0ea5e9';

const LABEL_CURTO: Record<MetricasTempoPorPrioridade['prioridade'], string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

interface PropsTempoMedioPrioridade {
  metricasTempo: MetricasTempoResolucao;
  tempoPorPrioridade: MetricasTempoPorPrioridade[];
  className?: string;
}

/**
 * Tempo médio de resolução (dias corridos) por prioridade.
 * O cronômetro ativo aparece no tooltip de cada linha.
 */
export function TempoMedioPrioridade({
  metricasTempo,
  tempoPorPrioridade,
  className,
}: PropsTempoMedioPrioridade) {
  const escala = Math.max(1, ...tempoPorPrioridade.map((p) => p.calendarioMedioDias));
  const geral =
    metricasTempo.totalConcluidas > 0 ? `${formatarNumero(metricasTempo.calendarioMedioDias, 1)} d` : '—';

  return (
    <PainelDashboard
      titulo="Tempo médio"
      className={className}
      extra={
        <b
          className="text-sm tabular-nums text-foreground"
          title={`${metricasTempo.totalConcluidas} concluídas · cronômetro ${metricasTempo.cronometroTextoFormatado}`}
        >
          {geral}
        </b>
      }
    >
      <div className="flex flex-col gap-3">
        {tempoPorPrioridade.map((p) => (
          <div
            key={p.prioridade}
            className="sgdi-dash-linha-barra"
            style={{ '--sgdi-col-rotulo': '56px', '--sgdi-col-valor': '48px' } as CSSProperties}
            title={`${LABEL_CURTO[p.prioridade]} · ${p.totalConcluidas} concluídas · cronômetro ${formatarSegundosEmHoras(
              Math.round(p.cronometroMedioDias * 86400)
            )}`}
          >
            <span className="text-muted-foreground">{LABEL_CURTO[p.prioridade]}</span>
            <div className="sgdi-dash-trilho">
              <div
                style={{ width: `${(p.calendarioMedioDias / escala) * 100}%`, backgroundColor: COR_BARRA_TEMPO }}
              />
            </div>
            <b className="tabular-nums text-foreground">
              {p.totalConcluidas > 0 ? `${formatarNumero(p.calendarioMedioDias, 1)} d` : '—'}
            </b>
          </div>
        ))}
      </div>
    </PainelDashboard>
  );
}
