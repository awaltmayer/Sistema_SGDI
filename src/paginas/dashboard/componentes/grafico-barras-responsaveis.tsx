import { useState } from 'react';
import {
  IconUsers,
  IconUserExclamation,
} from '@tabler/icons-react';
import type { CargaResponsavelItem } from '../calculos-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/cartao';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { cn } from '@/lib/utilitarios';

// Cores Flat e Sólidas (100% opacas, sem transparência, sem bordas)
const COR_ANDAMENTO = '#2563eb'; // Azul Real Sólido
const COR_A_FAZER = '#64748b';   // Slate Sólido
const COR_ATRASADAS = '#dc2626'; // Vermelho Sólido
const COR_SEM_RESP = '#d97706';  // Âmbar Sólido

interface PropsGraficoBarrasResponsaveis {
  responsaveis: CargaResponsavelItem[];
  totalDemandasAbertas: number;
  totalNaoAtribuidas: number;
}

export function GraficoBarrasResponsaveis({
  responsaveis,
  totalDemandasAbertas,
  totalNaoAtribuidas,
}: PropsGraficoBarrasResponsaveis) {
  const [itemHover, setItemHover] = useState<string | null>(null);

  // Inclui o grupo de não atribuídas caso haja
  const itens = [...responsaveis.filter((r) => r.totalAbertas > 0)];

  if (totalNaoAtribuidas > 0) {
    itens.push({
      id: 'sem-responsavel',
      nome: 'Sem Responsável (Fora do SLA)',
      iniciais: 'SR',
      avatarUrl: null,
      email: null,
      totalAbertas: totalNaoAtribuidas,
      aFazer: totalNaoAtribuidas,
      emAndamento: 0,
      atrasadas: 0,
      emAndamentoNoPrazo: 0,
      aFazerNoPrazo: totalNaoAtribuidas,
      percentualDoTotal:
        totalDemandasAbertas > 0
          ? Number(((totalNaoAtribuidas / totalDemandasAbertas) * 100).toFixed(1))
          : 0,
      foraDoSla: true,
    });
  }

  const maxTotal = Math.max(1, ...itens.map((i) => i.totalAbertas));

  return (
    <Card className="sgdi-dashboard-card-barras shadow-xs rounded-md border-0 bg-card">
      <CardHeader className="pb-2 pt-3 px-3 border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <IconUsers className="size-4 text-primary" />
            Carga por Membro
          </CardTitle>

          {/* Legenda com Cores Lisas, Flat e 100% Opacas */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className="flex items-center gap-1 text-foreground text-[11px] font-medium">
              <span className="size-2.5 rounded-xs" style={{ backgroundColor: COR_ANDAMENTO }} />
              <span>Andamento</span>
            </span>
            <span className="flex items-center gap-1 text-foreground text-[11px] font-medium">
              <span className="size-2.5 rounded-xs" style={{ backgroundColor: COR_A_FAZER }} />
              <span>A Fazer</span>
            </span>
            <span className="flex items-center gap-1 text-foreground text-[11px] font-bold">
              <span className="size-2.5 rounded-xs" style={{ backgroundColor: COR_ATRASADAS }} />
              <span className="text-red-600 dark:text-red-400">Atrasadas</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 border-0">
        {itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center text-xs text-muted-foreground bg-muted rounded-sm border-0">
            Nenhum membro selecionado ou sem demandas em aberto para exibir.
          </div>
        ) : (
          <div className="space-y-2">
            {itens.map((item) => {
              const estaHover = itemHover === item.id;
              const larguraTotal = Math.round((item.totalAbertas / maxTotal) * 100);

              // Segmentos mutuamente exclusivos (soma exata = 100% da carga do membro)
              const atrasadas = item.atrasadas;
              const emAndamentoNoPrazo = item.emAndamentoNoPrazo ?? Math.max(0, item.emAndamento - atrasadas);
              const aFazerNoPrazo = item.aFazerNoPrazo ?? Math.max(0, item.totalAbertas - atrasadas - emAndamentoNoPrazo);

              const pAndamento = item.totalAbertas > 0 ? (emAndamentoNoPrazo / item.totalAbertas) * larguraTotal : 0;
              const pAFazer = item.totalAbertas > 0 ? (aFazerNoPrazo / item.totalAbertas) * larguraTotal : 0;
              const pAtrasadas = item.totalAbertas > 0 ? (atrasadas / item.totalAbertas) * larguraTotal : 0;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'p-2.5 rounded-sm transition-all border-0',
                    item.foraDoSla ? 'bg-amber-500/10' : 'bg-muted/40 hover:bg-muted/60',
                    estaHover && 'ring-1 ring-primary'
                  )}
                  onMouseEnter={() => setItemHover(item.id)}
                  onMouseLeave={() => setItemHover(null)}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.foraDoSla ? (
                        <div
                          className="size-6 rounded-sm text-white flex items-center justify-center shrink-0 font-bold"
                          style={{ backgroundColor: COR_SEM_RESP }}
                        >
                          <IconUserExclamation className="size-3.5" />
                        </div>
                      ) : (
                        <Avatar className="size-6 rounded-sm text-[10px] shrink-0 border-0">
                          {item.avatarUrl && <AvatarImage src={item.avatarUrl} alt={item.nome} className="rounded-sm" />}
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold rounded-sm border-0">
                            {item.iniciais}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.nome}
                        </span>
                        {item.foraDoSla && (
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded-xs text-white font-bold"
                            style={{ backgroundColor: COR_SEM_RESP }}
                          >
                            Fora SLA
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Badges de Contagem Flat e Sólidas */}
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        {emAndamentoNoPrazo > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-xs text-white font-bold"
                            style={{ backgroundColor: COR_ANDAMENTO }}
                            title={`${emAndamentoNoPrazo} em andamento`}
                          >
                            {emAndamentoNoPrazo} andamento
                          </span>
                        )}
                        {aFazerNoPrazo > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-xs text-white font-bold"
                            style={{ backgroundColor: COR_A_FAZER }}
                            title={`${aFazerNoPrazo} a fazer`}
                          >
                            {aFazerNoPrazo} a fazer
                          </span>
                        )}
                        {atrasadas > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-xs text-white font-bold"
                            style={{ backgroundColor: COR_ATRASADAS }}
                            title={`${atrasadas} atrasadas`}
                          >
                            {atrasadas} atrasada{atrasadas > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono font-bold text-foreground">
                        {item.totalAbertas}
                        <span className="text-[10px] font-normal text-muted-foreground ml-1">
                          ({item.percentualDoTotal}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra Gráfica Segmentada com Cores Lisas, Sólidas e 100% Visíveis */}
                  <div className="w-full h-2.5 rounded-xs bg-muted overflow-hidden flex border-0">
                    {/* 1. Em Andamento (Azul Real Sólido) */}
                    {pAndamento > 0 && (
                      <div
                        style={{
                          width: `${pAndamento}%`,
                          backgroundColor: COR_ANDAMENTO,
                        }}
                        className="transition-all duration-300"
                        title={`${emAndamentoNoPrazo} em andamento`}
                      />
                    )}
                    {/* 2. A Fazer (Slate Sólido) */}
                    {pAFazer > 0 && (
                      <div
                        style={{
                          width: `${pAFazer}%`,
                          backgroundColor: COR_A_FAZER,
                        }}
                        className="transition-all duration-300"
                        title={`${aFazerNoPrazo} a fazer`}
                      />
                    )}
                    {/* 3. Atrasadas (Vermelho Sólido) */}
                    {pAtrasadas > 0 && (
                      <div
                        style={{
                          width: `${pAtrasadas}%`,
                          backgroundColor: COR_ATRASADAS,
                        }}
                        className="transition-all duration-300"
                        title={`${atrasadas} atrasadas`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
