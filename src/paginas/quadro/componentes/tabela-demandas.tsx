import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCalendar,
  IconUser,
  IconArrowRight,
  IconClock,
  IconAlertCircle,
  IconInbox,
} from '@tabler/icons-react';
import { Badge } from '@/componentes/base/distintivo';
import { Button } from '@/componentes/base/botao';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { useDataProvider, type CardWithAssignee } from '@/lib/provedor-dados';
import { calcularStatusPrazo } from './seletor-data-vencimento';
import { cn } from '@/lib/utilitarios';

export interface PropsTabelaDemandas {
  cartoes: CardWithAssignee[];
  caminhoBase?: string;
  aoAbrirDetalhes?: (cartao: CardWithAssignee) => void;
}

const ITENS_POR_PAGINA = 10;

export function TabelaDemandas({
  cartoes,
  caminhoBase = '/board',
  aoAbrirDetalhes,
}: PropsTabelaDemandas) {
  const navegar = useNavigate();
  const { useTeamMembers } = useDataProvider();
  const { data: membros = [] } = useTeamMembers();

  const [pagina, setPagina] = useState(1);

  const totalDemandas = cartoes.length;
  const totalPaginas = Math.max(1, Math.ceil(totalDemandas / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);

  const indiceInicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFim = Math.min(indiceInicio + ITENS_POR_PAGINA, totalDemandas);
  const cartoesPaginados = cartoes.slice(indiceInicio, indiceFim);

  const abrirCartao = (cartao: CardWithAssignee) => {
    if (aoAbrirDetalhes) {
      aoAbrirDetalhes(cartao);
    } else {
      navegar(`${caminhoBase}/${cartao.id}`);
    }
  };

  const obterNomeSolicitante = (cartao: CardWithAssignee) => {
    const criadorId = cartao.id_usuario ?? (cartao as any).user_id;
    if (!criadorId) return 'Sistema';
    const sId = String(criadorId);
    const m = membros.find(
      (item: any) =>
        String(item.id) === sId ||
        (item.id_usuario && String(item.id_usuario) === sId) ||
        (item.id_usuario_membro && String(item.id_usuario_membro) === sId)
    );
    return m?.nome_completo || (m as any)?.full_name || m?.email || 'Usuário';
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden shadow-xs">
      {/* Tabela de Demandas */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
              <th className="py-3 px-4 w-16">ID</th>
              <th className="py-3 px-4">Demanda</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 w-28">Prioridade</th>
              <th className="py-3 px-4 w-40">Solicitante</th>
              <th className="py-3 px-4 w-44">Responsáveis</th>
              <th className="py-3 px-4 w-36">Vencimento</th>
              <th className="py-3 px-4 w-16 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {cartoesPaginados.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <IconInbox className="size-8 text-muted-foreground/50" />
                    <p className="font-medium text-sm">Nenhuma demanda encontrada</p>
                    <p className="text-xs text-muted-foreground">
                      Tente ajustar os filtros ou os termos de busca para localizar registros.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              cartoesPaginados.map((c) => {
                const col = c.coluna ?? c.column;
                const prio = c.prioridade ?? c.priority;
                const dataVenc = c.data_vencimento ?? c.due_date;
                const infoPrazo = calcularStatusPrazo(dataVenc);
                const nomeSolicitante = obterNomeSolicitante(c);
                const responsaveis = (c.responsaveis ?? c.assignees ?? (c.responsavel ? [c.responsavel] : [])) as any[];

                let dataVencFormatada = '-';
                if (dataVenc) {
                  try {
                    const parsed = parseISO(dataVenc);
                    if (!isNaN(parsed.getTime())) {
                      dataVencFormatada = format(parsed, 'dd/MM/yyyy', { locale: ptBR });
                    }
                  } catch {
                    dataVencFormatada = String(dataVenc);
                  }
                }

                return (
                  <tr
                    key={c.id}
                    onClick={() => abrirCartao(c)}
                    className="hover:bg-accent/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-xs text-muted-foreground">
                      #{c.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {c.titulo ?? c.title}
                        </span>
                        {(c.descricao ?? c.description) && (
                          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {c.descricao ?? c.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {col === 'todo' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20">
                          📋 A Fazer
                        </span>
                      )}
                      {col === 'in-progress' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          ⚡ Em Andamento
                        </span>
                      )}
                      {col === 'done' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ✅ Concluído
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {prio === 'high' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                          🔴 Alta
                        </span>
                      )}
                      {prio === 'medium' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          🟡 Média
                        </span>
                      )}
                      {prio === 'low' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          🟢 Baixa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <span className="truncate max-w-[140px] block font-medium text-foreground/80">
                        {nomeSolicitante}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {responsaveis.length === 0 ? (
                        <span className="text-xs text-muted-foreground/60 italic">Não atribuído</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {responsaveis.slice(0, 3).map((r, i) => (
                              <Avatar key={i} className="size-5 border-2 border-background">
                                {(r.url_avatar || r.avatar_url) && (
                                  <AvatarImage src={r.url_avatar || r.avatar_url} alt={r.nome_completo || r.full_name} />
                                )}
                                <AvatarFallback className="text-[9px]">
                                  {r.iniciais || r.initials || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-xs text-foreground/80 truncate max-w-[120px]">
                            {responsaveis.map((r) => r.nome_completo || r.full_name).filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {dataVenc ? (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 font-medium',
                            infoPrazo.status === 'atrasado' && 'text-rose-600 font-semibold',
                            infoPrazo.status === 'hoje' && 'text-amber-600 font-semibold',
                            infoPrazo.status === 'normal' && 'text-muted-foreground'
                          )}
                        >
                          <IconCalendar className="size-3.5" />
                          {dataVencFormatada}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirCartao(c);
                        }}
                        className="size-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <IconArrowRight className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginação da Listagem de Demandas */}
      <div className="p-3 px-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="text-muted-foreground">
          {totalDemandas > 0 ? (
            <span>
              Mostrando <strong className="text-foreground">{indiceInicio + 1}</strong> a{' '}
              <strong className="text-foreground">{indiceFim}</strong> de{' '}
              <strong className="text-foreground">{totalDemandas}</strong> demandas
            </span>
          ) : (
            <span>0 demandas</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground mr-1">
            Página <strong className="text-foreground">{paginaAtual}</strong> de{' '}
            <strong className="text-foreground">{totalPaginas}</strong>
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina(1)}
              disabled={paginaAtual <= 1}
              className="size-7 p-0"
              title="Primeira página"
            >
              <IconChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual <= 1}
              className="size-7 p-0"
              title="Página anterior"
            >
              <IconChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual >= totalPaginas}
              className="size-7 p-0"
              title="Próxima página"
            >
              <IconChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina(totalPaginas)}
              disabled={paginaAtual >= totalPaginas}
              className="size-7 p-0"
              title="Última página"
            >
              <IconChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
