import {
  IconUsers,
  IconUserExclamation,
  IconClock,
  IconAlertTriangle,
} from '@tabler/icons-react';
import type { CargaResponsavelItem } from '../calculos-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/cartao';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { cn } from '@/lib/utilitarios';

const COR_ANDAMENTO = '#2563eb'; // Azul Real Sólido
const COR_A_FAZER = '#64748b';   // Slate Sólido
const COR_ATRASADAS = '#dc2626'; // Vermelho Sólido
const COR_SEM_RESP = '#d97706';  // Âmbar Sólido

interface PropsPainelPorResponsavel {
  responsaveis: CargaResponsavelItem[];
  totalDemandasAbertas: number;
  totalNaoAtribuidas: number;
}

export function PainelPorResponsavel({
  responsaveis,
  totalDemandasAbertas,
  totalNaoAtribuidas,
}: PropsPainelPorResponsavel) {
  const responsaveisComDemandas = responsaveis.filter((r) => r.totalAbertas > 0);
  const maiorCarga = Math.max(1, ...responsaveis.map((r) => r.totalAbertas), totalNaoAtribuidas);

  return (
    <Card className="sgdi-dashboard-card-responsaveis shadow-xs rounded-md border-0 bg-card">
      <CardHeader className="pb-2 pt-3 px-3 border-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <IconUsers className="size-4 text-primary" />
            Detalhamento por Membro
          </CardTitle>

          <div className="flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-sm bg-muted text-foreground border-0">
            <IconClock className="size-3" style={{ color: COR_ANDAMENTO }} />
            {totalDemandasAbertas} abertas
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-2.5 border-0">
        {totalDemandasAbertas === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-sm bg-muted border-0">
            <div
              className="size-8 rounded-sm text-white flex items-center justify-center mb-2"
              style={{ backgroundColor: '#16a34a' }}
            >
              <IconUsers className="size-4" />
            </div>
            <h4 className="text-xs font-semibold text-foreground">
              Nenhuma demanda em aberto para os membros selecionados
            </h4>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Lista dos responsáveis com tarefas atribuídas */}
            {responsaveisComDemandas.map((item) => {
              const larguraBarra = Math.round((item.totalAbertas / maiorCarga) * 100);

              const atrasadas = item.atrasadas;
              const emAndamentoNoPrazo = item.emAndamentoNoPrazo ?? Math.max(0, item.emAndamento - atrasadas);
              const aFazerNoPrazo = item.aFazerNoPrazo ?? Math.max(0, item.totalAbertas - atrasadas - emAndamentoNoPrazo);

              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-sm bg-muted/40 hover:bg-muted/60 transition-all space-y-1.5 border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-7 rounded-sm text-xs shrink-0 border-0">
                        {item.avatarUrl && <AvatarImage src={item.avatarUrl} alt={item.nome} className="rounded-sm" />}
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold rounded-sm border-0">
                          {item.iniciais}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {item.nome}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Detalhes de status em cores flat e sólidas */}
                      <div className="hidden sm:flex items-center gap-1.5 text-xs">
                        {emAndamentoNoPrazo > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-xs text-white font-mono text-[10px] font-bold"
                            style={{ backgroundColor: COR_ANDAMENTO }}
                          >
                            {emAndamentoNoPrazo} andamento
                          </span>
                        )}
                        {aFazerNoPrazo > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-xs text-white font-mono text-[10px] font-bold"
                            style={{ backgroundColor: COR_A_FAZER }}
                          >
                            {aFazerNoPrazo} a fazer
                          </span>
                        )}
                        {atrasadas > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-xs text-white font-mono text-[10px] font-bold flex items-center gap-0.5"
                            style={{ backgroundColor: COR_ATRASADAS }}
                          >
                            <IconAlertTriangle className="size-2.5" />
                            {atrasadas} atrasada{atrasadas > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Contador Principal */}
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-foreground">
                          {item.totalAbertas}
                          <span className="text-[10px] font-normal text-muted-foreground ml-1">
                            ({item.percentualDoTotal}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Proporção Visual da Carga Flat (Sem Gradiente, Sem Bordas) */}
                  <div className="w-full h-1.5 rounded-xs bg-muted overflow-hidden flex border-0">
                    <div
                      className="h-full rounded-xs transition-all duration-300"
                      style={{
                        width: `${larguraBarra}%`,
                        backgroundColor: atrasadas > 0 ? COR_ATRASADAS : COR_ANDAMENTO,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Caso haja demandas sem atribuição */}
            {totalNaoAtribuidas > 0 && (
              <div className="p-2.5 rounded-sm bg-amber-500/10 transition-all space-y-1.5 border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-7 rounded-sm text-white flex items-center justify-center shrink-0 font-bold"
                      style={{ backgroundColor: COR_SEM_RESP }}
                    >
                      <IconUserExclamation className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        Não Atribuídas
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Sem responsável (Fora do SLA)
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-sm font-bold font-mono"
                      style={{ color: COR_SEM_RESP }}
                    >
                      {totalNaoAtribuidas}
                    </div>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-xs bg-muted overflow-hidden border-0">
                  <div
                    className="h-full rounded-xs transition-all duration-300"
                    style={{
                      width: `${Math.round((totalNaoAtribuidas / maiorCarga) * 100)}%`,
                      backgroundColor: COR_SEM_RESP,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
