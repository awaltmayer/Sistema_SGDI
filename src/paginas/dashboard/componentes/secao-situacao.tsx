import { CORES_DASHBOARD, type MetricasDemandas } from '../calculos-dashboard';
import { BarraEmpilhada, ItemLegenda, PainelDashboard } from './painel-dashboard';

const COR_A_FAZER = '#64748b';

interface PropsSecaoSituacao {
  metricas: MetricasDemandas;
  className?: string;
}

/**
 * Situação das demandas em categorias que somam 100%
 * (concluídas / abertas no prazo / atrasadas) e abertas por etapa.
 */
export function SecaoSituacao({ metricas, className }: PropsSecaoSituacao) {
  const situacao = [
    { label: 'Concluídas', valor: metricas.concluidas, cor: CORES_DASHBOARD.concluido },
    { label: 'No prazo', valor: metricas.abertasNoPrazo, cor: CORES_DASHBOARD.aberto },
    { label: 'Atrasadas', valor: metricas.atrasadas, cor: CORES_DASHBOARD.atrasado },
  ];
  const etapas = [
    { label: 'A fazer', valor: metricas.abertasAFazer, cor: COR_A_FAZER },
    { label: 'Em andamento', valor: metricas.abertasEmAndamento, cor: CORES_DASHBOARD.aberto },
  ];

  return (
    <PainelDashboard titulo="Situação" className={className}>
      <div className="flex flex-col gap-3">
        <BarraEmpilhada segmentos={situacao} altura={28} />
        <div className="sgdi-dash-legenda">
          {situacao.map((s) => (
            <ItemLegenda key={s.label} cor={s.cor} label={s.label} valor={s.valor} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <BarraEmpilhada segmentos={etapas} altura={12} />
        <div className="sgdi-dash-legenda">
          {etapas.map((s) => (
            <ItemLegenda key={s.label} cor={s.cor} label={s.label} valor={s.valor} />
          ))}
        </div>
      </div>
    </PainelDashboard>
  );
}
