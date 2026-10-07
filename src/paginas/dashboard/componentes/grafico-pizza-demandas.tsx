import { useState } from 'react';
import {
  IconLayersSubtract,
} from '@tabler/icons-react';
import type { MetricasDemandas } from '../calculos-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/cartao';
import { cn } from '@/lib/utilitarios';

const COR_CONCLUIDAS = '#16a34a'; // Verde Sólido
const COR_ABERTAS = '#2563eb';    // Azul Real Sólido
const COR_ATRASADAS = '#dc2626';  // Vermelho Sólido

interface PropsGraficoPizzaDemandas {
  metricas: MetricasDemandas;
}

interface SegmentoPizza {
  id: string;
  label: string;
  valor: number;
  percentual: number;
  cor: string;
}

export function GraficoPizzaDemandas({ metricas }: PropsGraficoPizzaDemandas) {
  const [segmentoAtivo, setSegmentoAtivo] = useState<string | null>(null);

  const segmentos: SegmentoPizza[] = [
    {
      id: 'concluidas',
      label: 'Concluídas',
      valor: metricas.concluidas,
      percentual: metricas.percentualConcluidas,
      cor: COR_CONCLUIDAS,
    },
    {
      id: 'abertas-no-prazo',
      label: 'Abertas no Prazo',
      valor: metricas.abertasNoPrazo,
      percentual: metricas.percentualAbertasNoPrazo,
      cor: COR_ABERTAS,
    },
    {
      id: 'atrasadas',
      label: 'Atrasadas',
      valor: metricas.atrasadas,
      percentual: metricas.percentualAtrasadas,
      cor: COR_ATRASADAS,
    },
  ];

  const totalDemandas = metricas.total;

  const tamanho = 220;
  const raioExterno = 95;
  const raioInterno = 60;
  const centro = tamanho / 2;

  let anguloAcumulado = -90;

  const arcos = segmentos.map((seg) => {
    const fracao = totalDemandas > 0 ? seg.valor / totalDemandas : 0;
    const angulo = fracao * 360;
    const inicioAngulo = anguloAcumulado;
    const fimAngulo = anguloAcumulado + angulo;
    anguloAcumulado = fimAngulo;

    if (fracao === 0) return null;

    const radInicio = (inicioAngulo * Math.PI) / 180;
    const radFim = (fimAngulo * Math.PI) / 180;

    const x1 = centro + raioExterno * Math.cos(radInicio);
    const y1 = centro + raioExterno * Math.sin(radInicio);
    const x2 = centro + raioExterno * Math.cos(radFim);
    const y2 = centro + raioExterno * Math.sin(radFim);

    const x3 = centro + raioInterno * Math.cos(radFim);
    const y3 = centro + raioInterno * Math.sin(radFim);
    const x4 = centro + raioInterno * Math.cos(radInicio);
    const y4 = centro + raioInterno * Math.sin(radInicio);

    const arcoGrande = angulo > 180 ? 1 : 0;

    let d = '';
    if (fracao >= 0.999) {
      d = `
        M ${centro - raioExterno} ${centro}
        A ${raioExterno} ${raioExterno} 0 1 0 ${centro + raioExterno} ${centro}
        A ${raioExterno} ${raioExterno} 0 1 0 ${centro - raioExterno} ${centro}
        M ${centro - raioInterno} ${centro}
        A ${raioInterno} ${raioInterno} 0 1 1 ${centro + raioInterno} ${centro}
        A ${raioInterno} ${raioInterno} 0 1 1 ${centro - raioInterno} ${centro}
        Z
      `;
    } else {
      d = `
        M ${x1} ${y1}
        A ${raioExterno} ${raioExterno} 0 ${arcoGrande} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${raioInterno} ${raioInterno} 0 ${arcoGrande} 0 ${x4} ${y4}
        Z
      `;
    }

    return {
      ...seg,
      path: d,
    };
  }).filter(Boolean);

  const itemSelecionado = segmentos.find((s) => s.id === segmentoAtivo);

  return (
    <Card className="border-0 shadow-xs bg-card rounded-md">
      <CardHeader className="pb-2 pt-3 px-3 border-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <IconLayersSubtract className="size-4 text-primary" />
            Demandas
          </CardTitle>
          <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-muted text-foreground font-bold">
            {metricas.total}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 border-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Gráfico Donut SVG */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <svg
              width={tamanho}
              height={tamanho}
              viewBox={`0 0 ${tamanho} ${tamanho}`}
              className="overflow-visible select-none"
            >
              {totalDemandas === 0 ? (
                <circle
                  cx={centro}
                  cy={centro}
                  r={raioExterno}
                  fill="none"
                  stroke="var(--color-muted)"
                  strokeWidth={raioExterno - raioInterno}
                />
              ) : (
                arcos.map((arco) => {
                  if (!arco) return null;
                  const isHover = segmentoAtivo === arco.id;

                  return (
                    <path
                      key={arco.id}
                      d={arco.path}
                      fill={arco.cor}
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        transformOrigin: `${centro}px ${centro}px`,
                        transform: isHover ? 'scale(1.04)' : 'scale(1)',
                        filter: isHover ? 'brightness(1.1)' : 'none',
                      }}
                      onMouseEnter={() => setSegmentoAtivo(arco.id)}
                      onMouseLeave={() => setSegmentoAtivo(null)}
                    />
                  );
                })
              )}
            </svg>

            {/* Centro do Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {itemSelecionado ? (
                <div>
                  <div
                    className="text-2xl font-bold font-mono"
                    style={{ color: itemSelecionado.cor }}
                  >
                    {itemSelecionado.valor}
                  </div>
                  <div className="text-[11px] font-semibold text-foreground">
                    {itemSelecionado.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {itemSelecionado.percentual}%
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {totalDemandas}
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">
                    Total
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel Numérico Limpo, Flat e Sem Bordas */}
          <div className="md:col-span-7 space-y-1.5">
            {/* Abertas */}
            <div
              className={cn(
                'flex items-center justify-between p-2 rounded-sm text-xs transition-colors cursor-pointer border-0',
                segmentoAtivo === 'abertas-no-prazo'
                  ? 'bg-muted/80 ring-1 ring-primary'
                  : 'bg-muted/40 hover:bg-muted/60'
              )}
              onMouseEnter={() => setSegmentoAtivo('abertas-no-prazo')}
              onMouseLeave={() => setSegmentoAtivo(null)}
            >
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-xs" style={{ backgroundColor: COR_ABERTAS }} />
                <span className="font-medium text-foreground">Abertas</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-foreground mr-1.5">{metricas.totalAbertas}</span>
                <span className="text-[11px] text-muted-foreground">({metricas.percentualAbertas}%)</span>
              </div>
            </div>

            {/* Concluídas */}
            <div
              className={cn(
                'flex items-center justify-between p-2 rounded-sm text-xs transition-colors cursor-pointer border-0',
                segmentoAtivo === 'concluidas'
                  ? 'bg-muted/80 ring-1 ring-primary'
                  : 'bg-muted/40 hover:bg-muted/60'
              )}
              onMouseEnter={() => setSegmentoAtivo('concluidas')}
              onMouseLeave={() => setSegmentoAtivo(null)}
            >
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-xs" style={{ backgroundColor: COR_CONCLUIDAS }} />
                <span className="font-medium text-foreground">Concluídas</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold mr-1.5" style={{ color: COR_CONCLUIDAS }}>
                  {metricas.concluidas}
                </span>
                <span className="text-[11px] text-muted-foreground">({metricas.percentualConcluidas}%)</span>
              </div>
            </div>

            {/* Atrasadas */}
            <div
              className={cn(
                'flex items-center justify-between p-2 rounded-sm text-xs transition-colors cursor-pointer border-0',
                segmentoAtivo === 'atrasadas'
                  ? 'bg-red-500/20 ring-1 ring-red-500'
                  : 'bg-red-500/10 hover:bg-red-500/15'
              )}
              onMouseEnter={() => setSegmentoAtivo('atrasadas')}
              onMouseLeave={() => setSegmentoAtivo(null)}
            >
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-xs" style={{ backgroundColor: COR_ATRASADAS }} />
                <span className="font-bold text-red-600 dark:text-red-400">Atrasadas</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-red-600 dark:text-red-400 mr-1.5">
                  {metricas.atrasadas}
                </span>
                <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                  ({metricas.percentualAtrasadas}%)
                </span>
              </div>
            </div>

            {/* Stacked bar minimalista flat com cores 100% visíveis */}
            <div className="pt-0.5">
              <div className="h-2 w-full rounded-xs bg-muted overflow-hidden flex border-0">
                <div
                  style={{
                    width: `${metricas.percentualConcluidas}%`,
                    backgroundColor: COR_CONCLUIDAS,
                  }}
                  className="transition-all duration-300"
                  title={`Concluídas: ${metricas.concluidas}`}
                />
                <div
                  style={{
                    width: `${metricas.percentualAbertasNoPrazo}%`,
                    backgroundColor: COR_ABERTAS,
                  }}
                  className="transition-all duration-300"
                  title={`Abertas no Prazo: ${metricas.abertasNoPrazo}`}
                />
                <div
                  style={{
                    width: `${metricas.percentualAtrasadas}%`,
                    backgroundColor: COR_ATRASADAS,
                  }}
                  className="transition-all duration-300"
                  title={`Atrasadas: ${metricas.atrasadas}`}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
