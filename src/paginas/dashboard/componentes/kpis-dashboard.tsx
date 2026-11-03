import type { ReactNode } from 'react';
import {
  CORES_DASHBOARD,
  formatarNumero,
  META_SLA,
  type MetricasDemandas,
  type MetricasSLA,
} from '../calculos-dashboard';

interface PropsKpi {
  label: string;
  valor: ReactNode;
  cor?: string;
  destaque?: boolean;
  children?: ReactNode;
}

function Kpi({ label, valor, cor, destaque, children }: PropsKpi) {
  return (
    <div
      className="sgdi-dashboard-kpi-card sgdi-dash-kpi flex flex-col gap-1"
      style={
        destaque
          ? { outline: `1px solid ${CORES_DASHBOARD.atrasadoBorda}`, outlineOffset: -1 }
          : undefined
      }
    >
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {cor && <span className="sgdi-dash-ponto" style={{ backgroundColor: cor }} />}
        {label}
      </span>
      <span className="text-2xl font-bold tabular-nums text-foreground">{valor}</span>
      {children}
    </div>
  );
}

interface PropsKpisDashboard {
  metricas: MetricasDemandas;
  metricasSla: MetricasSLA;
}

export function KpisDashboard({ metricas, metricasSla }: PropsKpisDashboard) {
  const taxa = metricasSla.taxaAderenciaSla;
  const corSla = taxa >= META_SLA ? CORES_DASHBOARD.concluido : CORES_DASHBOARD.atencao;

  return (
    <div className="sgdi-dash-linha">
      <Kpi label="Total" valor={metricas.total} />
      <Kpi label="Abertas" valor={metricas.totalAbertas} cor={CORES_DASHBOARD.aberto} />
      <Kpi label="Concluídas" valor={metricas.concluidas} cor={CORES_DASHBOARD.concluido} />
      <Kpi
        label="Atrasadas"
        valor={metricas.atrasadas}
        cor={CORES_DASHBOARD.atrasado}
        destaque={metricas.atrasadas > 0}
      />
      <Kpi label="SLA" valor={`${formatarNumero(taxa)}%`}>
        <div className="sgdi-dash-meta" title={`${formatarNumero(taxa, 1)}% · meta ${META_SLA}%`}>
          <div style={{ width: `${Math.min(100, taxa)}%`, backgroundColor: corSla }} />
          <span style={{ left: `${META_SLA}%` }} />
        </div>
      </Kpi>
    </div>
  );
}
