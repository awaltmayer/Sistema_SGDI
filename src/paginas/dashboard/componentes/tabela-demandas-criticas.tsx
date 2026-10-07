import { Link } from 'react-router-dom';
import {
  IconArrowRight,
  IconCalendarEvent,
  IconShieldExclamation,
} from '@tabler/icons-react';
import type { DemandaCriticaItem } from '../calculos-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/cartao';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';

const COR_ATRASADA = '#dc2626'; // Vermelho Sólido
const COR_HOJE = '#ea580c';      // Laranja-Vermelho Sólido
const COR_AMANHA = '#d97706';    // Âmbar Sólido
const COR_PROXIMOS = '#64748b';  // Slate Sólido

interface PropsTabelaDemandasCriticas {
  demandasCriticas: DemandaCriticaItem[];
}

export function TabelaDemandasCriticas({ demandasCriticas }: PropsTabelaDemandasCriticas) {
  const total = demandasCriticas.length;

  return (
    <Card className="sgdi-dashboard-card-criticas shadow-xs rounded-md border-0 bg-card">
      <CardHeader className="pb-2 pt-3 px-3 border-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="size-6 rounded-sm text-white flex items-center justify-center font-bold"
              style={{ backgroundColor: total > 0 ? COR_ATRASADA : '#16a34a' }}
            >
              <IconShieldExclamation className="size-3.5" />
            </div>
            <CardTitle className="text-sm font-semibold">
              Críticas (≤ 3d)
            </CardTitle>
          </div>

          <span
            className="font-mono text-xs px-2 py-0.5 font-bold rounded-sm text-white"
            style={{ backgroundColor: total > 0 ? COR_ATRASADA : '#16a34a' }}
          >
            {total}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 border-0">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-sm bg-muted border-0">
            <div
              className="size-8 rounded-sm text-white flex items-center justify-center mb-2"
              style={{ backgroundColor: '#16a34a' }}
            >
              <IconCalendarEvent className="size-4" />
            </div>
            <h4 className="text-xs font-semibold text-foreground">
              Nenhuma demanda crítica no momento
            </h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-0">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted border-0">
                  <th className="py-2.5 px-3 rounded-l-xs">Título</th>
                  <th className="py-2.5 px-3">Quem Fez</th>
                  <th className="py-2.5 px-3">Prazo Limite</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xs">Ação</th>
                </tr>
              </thead>
              <tbody>
                {demandasCriticas.map((item) => {
                  const cartao = item.cartao;
                  const isAtrasada = item.tipoUrgencia === 'atrasada';
                  const isHoje = item.tipoUrgencia === 'hoje';
                  const isAmanha = item.tipoUrgencia === 'amanha';

                  const corBadgeUrgencia = isAtrasada
                    ? COR_ATRASADA
                    : isHoje
                    ? COR_HOJE
                    : isAmanha
                    ? COR_AMANHA
                    : COR_PROXIMOS;

                  return (
                    <tr
                      key={cartao.id}
                      className="hover:bg-muted/40 transition-colors group border-0"
                    >
                      {/* 1. Título Resumido */}
                      <td className="py-2.5 px-3 max-w-[280px]">
                        <Link
                          to={`/board/${cartao.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors block truncate"
                          title={cartao.titulo}
                        >
                          {cartao.titulo}
                        </Link>
                      </td>

                      {/* 2. Quem Fez */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5 rounded-sm text-[9px] border-0 shrink-0">
                            {item.avatarCriador && (
                              <AvatarImage src={item.avatarCriador} alt={item.nomeCriador} className="rounded-sm" />
                            )}
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold rounded-sm border-0">
                              {item.iniciaisCriador}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground truncate max-w-[150px]">
                            {item.nomeCriador}
                          </span>
                        </div>
                      </td>

                      {/* 3. Prazo Limite */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs text-white"
                          style={{ backgroundColor: corBadgeUrgencia }}
                        >
                          {item.textoPrazo}
                        </span>
                      </td>

                      {/* 4. Botão Para Ver */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <Link
                          to={`/board/${cartao.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          <span>Ver</span>
                          <IconArrowRight className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
