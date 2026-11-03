import { CORES_DASHBOARD, META_SLA, formatarNumero, type MetricasSLA } from '../calculos-dashboard';
import { PainelDashboard } from './painel-dashboard';

const RAIO = 50;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

interface PropsCardSla {
  metricasSla: MetricasSLA;
  className?: string;
}

export function CardSla({ metricasSla, className }: PropsCardSla) {
  const taxa = metricasSla.taxaAderenciaSla;
  const cor = taxa >= META_SLA ? CORES_DASHBOARD.concluido : CORES_DASHBOARD.atencao;
  const linhas = [
    { label: 'No prazo', valor: metricasSla.noPrazoComResponsavel },
    { label: 'Atrasadas', valor: metricasSla.atrasadasComResponsavel },
    { label: 'Sem resp.', valor: metricasSla.totalSemResponsavelForaDoSla },
  ];

  return (
    <PainelDashboard titulo="SLA" className={className}>
      <div className="flex flex-wrap items-center gap-4">
        <svg
          width="110"
          height="110"
          viewBox="0 0 120 120"
          role="img"
          aria-label={`Aderência ao SLA de ${formatarNumero(taxa, 1)}%, meta ${META_SLA}%`}
        >
          <circle cx="60" cy="60" r={RAIO} fill="none" stroke="var(--color-muted)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={RAIO}
            fill="none"
            stroke={cor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(Math.min(100, taxa) / 100) * CIRCUNFERENCIA} ${CIRCUNFERENCIA}`}
            transform="rotate(-90 60 60)"
          />
          <text
            x="60"
            y="67"
            textAnchor="middle"
            fill="var(--color-foreground)"
            fontSize="22"
            fontWeight="700"
          >
            {formatarNumero(taxa)}%
          </text>
        </svg>

        <div className="flex flex-col gap-2 text-xs" style={{ flex: '1 1 110px' }}>
          {linhas.map((l) => (
            <div key={l.label} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{l.label}</span>
              <b className="tabular-nums text-foreground">{l.valor}</b>
            </div>
          ))}
        </div>
      </div>
    </PainelDashboard>
  );
}
