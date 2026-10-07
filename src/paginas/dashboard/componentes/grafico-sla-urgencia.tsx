import {
  IconTarget,
  IconShieldCheck,
  IconAlertTriangle,
  IconUserExclamation,
} from '@tabler/icons-react';
import type { MetricasSLA } from '../calculos-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/cartao';

const COR_NO_PRAZO = '#16a34a';   // Verde Sólido
const COR_ATRASADAS = '#dc2626';  // Vermelho Sólido
const COR_SEM_RESP = '#d97706';   // Âmbar Sólido

interface PropsGraficoSlaUrgencia {
  metricasSla: MetricasSLA;
}

export function GraficoSlaUrgencia({ metricasSla }: PropsGraficoSlaUrgencia) {
  const {
    totalDemandasComResponsavel,
    noPrazoComResponsavel,
    atrasadasComResponsavel,
    taxaAderenciaSla,
    totalSemResponsavelForaDoSla,
  } = metricasSla;

  const tamanho = 150;
  const raio = 55;
  const espessura = 12;
  const centro = tamanho / 2;
  const circunferencia = 2 * Math.PI * raio;

  const percNoPrazo = totalDemandasComResponsavel > 0 ? (noPrazoComResponsavel / totalDemandasComResponsavel) * 100 : 100;
  const percAtrasadas = totalDemandasComResponsavel > 0 ? (atrasadasComResponsavel / totalDemandasComResponsavel) * 100 : 0;

  const strokeNoPrazo = (percNoPrazo / 100) * circunferencia;
  const strokeAtrasadas = (percAtrasadas / 100) * circunferencia;

  return (
    <Card className="border-0 shadow-xs bg-card rounded-md">
      <CardHeader className="pb-2 pt-3 px-3 border-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <IconTarget className="size-4 text-primary" />
            Aderência SLA
          </CardTitle>

          <span
            className="font-mono text-xs px-2 py-0.5 font-bold rounded-sm text-white"
            style={{
              backgroundColor:
                taxaAderenciaSla >= 85
                  ? COR_NO_PRAZO
                  : taxaAderenciaSla >= 60
                  ? COR_SEM_RESP
                  : COR_ATRASADAS,
            }}
          >
            {taxaAderenciaSla}% SLA
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 border-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Donut de SLA SVG */}
          <div className="md:col-span-4 flex flex-col items-center justify-center relative">
            <svg
              width={tamanho}
              height={tamanho}
              viewBox={`0 0 ${tamanho} ${tamanho}`}
              className="rotate-[-90deg] overflow-visible"
            >
              <circle
                cx={centro}
                cy={centro}
                r={raio}
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth={espessura}
              />
              {totalDemandasComResponsavel > 0 && (
                <circle
                  cx={centro}
                  cy={centro}
                  r={raio}
                  fill="none"
                  stroke={COR_NO_PRAZO}
                  strokeWidth={espessura}
                  strokeDasharray={`${strokeNoPrazo} ${circunferencia}`}
                  strokeLinecap="butt"
                  className="transition-all duration-500"
                />
              )}
              {atrasadasComResponsavel > 0 && (
                <circle
                  cx={centro}
                  cy={centro}
                  r={raio}
                  fill="none"
                  stroke={COR_ATRASADAS}
                  strokeWidth={espessura}
                  strokeDasharray={`${strokeAtrasadas} ${circunferencia}`}
                  strokeDashoffset={-strokeNoPrazo}
                  strokeLinecap="butt"
                  className="transition-all duration-500"
                />
              )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-mono text-foreground">
                {taxaAderenciaSla}%
              </span>
              <span className="text-[10px] uppercase font-medium text-muted-foreground">
                Conforme
              </span>
            </div>
          </div>

          {/* Indicadores Detalhados de SLA Flat e Sem Bordas */}
          <div className="md:col-span-8 space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-sm bg-muted/40 border-0">
              <div className="flex items-center gap-1.5">
                <IconShieldCheck className="size-3.5" style={{ color: COR_NO_PRAZO }} />
                <span className="font-medium">No Prazo</span>
              </div>
              <span className="font-bold font-mono" style={{ color: COR_NO_PRAZO }}>
                {noPrazoComResponsavel}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-sm bg-red-500/10 border-0">
              <div className="flex items-center gap-1.5">
                <IconAlertTriangle className="size-3.5 text-red-600 dark:text-red-400" />
                <span className="font-bold text-red-600 dark:text-red-400">
                  Atrasadas
                </span>
              </div>
              <span className="font-bold font-mono text-red-600 dark:text-red-400">
                {atrasadasComResponsavel}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-sm bg-amber-500/10 border-0">
              <div className="flex items-center gap-1.5">
                <IconUserExclamation className="size-3.5" style={{ color: COR_SEM_RESP }} />
                <span className="text-muted-foreground">Sem Responsável (Fora SLA)</span>
              </div>
              <span className="font-bold font-mono" style={{ color: COR_SEM_RESP }}>
                {totalSemResponsavelForaDoSla}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
