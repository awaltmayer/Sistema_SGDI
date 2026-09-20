import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { MoreHorizontalIcon } from 'lucide-react';
import { IconSquareCheck, IconAlertTriangle, IconUserCheck } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/componentes/ui/tabela';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/componentes/ui/menu-suspenso';
import { useDataProvider } from '@/lib/provedor-dados';
import { useAuth } from '@/lib/autenticacao/provedor-autenticacao';
import { colunas as columnDefs } from '@/dados/dados-iniciais';
import type { IdColuna, Prioridade } from '@/dados/dados-iniciais';
import { PriorityPopover } from './seletor-prioridade';
import { CardTimerWidget } from './cronometro/widget-cronometro-cartao';
import { AssigneePopover } from './seletor-responsavel';
import { DueDatePopover } from './seletor-data-vencimento';
import { ColumnIcon } from './icone-coluna';
import { sortCards } from './ordenar-cartoes';
import type { SortBy } from './barra-ferramentas-quadro';
import { Badge } from '@/componentes/base/distintivo';
import { cn } from '@/lib/utilitarios';
import './lista-quadro.css';

export interface PropsListaQuadro {
  sortBy?: SortBy;
  basePath?: string;
  searchQuery?: string;
  priorityFilter?: string;
  requesterFilter?: string;
  onlyMyTasks?: boolean;
  // Aliases compatibilidade
  ordenarPor?: SortBy;
  caminhoBase?: string;
  busca?: string;
  filtroPrioridade?: string;
  filtroSolicitante?: string;
  apenasMinhas?: boolean;
}
export type BoardListProps = PropsListaQuadro;

export function ListaQuadro({
  sortBy,
  basePath,
  searchQuery: _searchQuery = '',
  priorityFilter: _priorityFilter = 'all',
  requesterFilter: _requesterFilter = 'all',
  onlyMyTasks: _onlyMyTasks = false,
  ordenarPor,
  caminhoBase,
  busca,
  filtroPrioridade,
  filtroSolicitante,
  apenasMinhas,
}: PropsListaQuadro) {
  const ordenar = ordenarPor ?? sortBy ?? 'manual';
  const rotaBase = caminhoBase ?? basePath ?? '';

  const { usuario } = useAuth();
  const { useCards, useUpdateCard } = useDataProvider();
  const { data: cartoes = [] } = useCards();
  const { mutate: updateCard } = useUpdateCard();

  const termoBusca = (busca ?? _searchQuery ?? '').trim().toLowerCase();
  const prioridadeFiltro = filtroPrioridade ?? _priorityFilter ?? 'all';
  const solFiltro = filtroSolicitante ?? _requesterFilter ?? 'all';
  const somenteMinhas = apenasMinhas ?? _onlyMyTasks ?? false;

  const cartoesFiltrados = useMemo(() => {
    return (cartoes ?? []).filter((c) => {
      if (termoBusca && !c.title.toLowerCase().includes(termoBusca)) {
        return false;
      }
      if (prioridadeFiltro !== 'all' && c.priority !== prioridadeFiltro) {
        return false;
      }
      if (solFiltro !== 'all') {
        const idSol = c.id_solicitante || c.solicitante_id || c.id_usuario;
        if (idSol !== solFiltro && c.solicitante?.id !== solFiltro) {
          return false;
        }
      }
      if (somenteMinhas && usuario) {
        const idSol = c.id_solicitante || c.solicitante_id || c.id_usuario;
        const ehSolicitante = idSol === usuario.id;
        const ehResponsavel = c.assignee_id === usuario.id || c.id_responsavel === usuario.id;
        if (!ehSolicitante && !ehResponsavel) {
          return false;
        }
      }
      return true;
    });
  }, [cartoes, termoBusca, prioridadeFiltro, solFiltro, somenteMinhas, usuario]);

  const ordenados = useMemo(() => sortCards(cartoesFiltrados ?? [], ordenar), [cartoesFiltrados, ordenar]);

  const colunaPorId = useMemo(() => {
    const mapa: Record<ColumnId, (typeof columnDefs)[number]> = {} as never;
    for (const c of columnDefs) mapa[c.id] = c;
    return mapa;
  }, []);

  return (
    <div className="sgdi-lista-quadro-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Tempo</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="sgdi-lista-quadro-vazio">
                Nenhuma tarefa encontrada com os filtros selecionados.
              </TableCell>
            </TableRow>
          ) : (
            ordenados.map((card) => {
              const col = colunaPorId[card.column];

              let estaAtrasado = false;
              let venceHoje = false;
              let diasAtraso = 0;

              if (card.due_date && card.column !== 'done') {
                const diff = differenceInDays(parseISO(card.due_date), new Date());
                if (diff < 0) {
                  estaAtrasado = true;
                  diasAtraso = Math.abs(diff);
                } else if (diff === 0) {
                  venceHoje = true;
                }
              }

              return (
                <TableRow
                  key={card.id}
                  className={cn(estaAtrasado && 'sgdi-lista-linha-atrasada')}
                >
                  <TableCell className="font-medium">
                    <div className="sgdi-lista-titulo-col">
                      <Link
                        to={`${rotaBase}/${card.id}`}
                        className="text-foreground hover:underline truncate"
                      >
                        {card.title}
                      </Link>
                      {estaAtrasado && (
                        <Badge color="red" className="gap-1 text-[11px] px-1.5 py-0">
                          <IconAlertTriangle className="size-3" />
                          Atrasada ({diasAtraso}d)
                        </Badge>
                      )}
                      {(() => {
                        const todosItens = (card.checklists ?? []).flatMap((c) => c.items);
                        if (todosItens.length === 0) return null;
                        const concluidos = todosItens.filter((i) => i.is_completed).length;
                        return (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconSquareCheck className="size-3.5 text-primary" />
                            {concluidos}/{todosItens.length}
                          </span>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="sgdi-lista-btn-status"
                      onClick={() => {
                        const ordem: ColumnId[] = ['todo', 'in-progress', 'done'];
                        const proxima = ordem[(ordem.indexOf(card.column) + 1) % ordem.length];
                        updateCard(card.id, { column: proxima });
                      }}
                    >
                      <ColumnIcon name={col.icon} className="size-3.5 text-primary" />
                      {col.label}
                    </button>
                  </TableCell>
                  <TableCell>
                    <PriorityPopover
                      priority={card.priority}
                      onSelect={(p: Priority) => updateCard(card.id, { priority: p })}
                    />
                  </TableCell>
                  <TableCell>
                    <CardTimerWidget
                      cardId={card.id}
                      cardTitle={card.title}
                      timeTracker={card.time_tracker}
                      compact
                    />
                  </TableCell>
                  <TableCell>
                    <span className="sgdi-lista-responsavel-tag">
                      {card.solicitante ? (
                        <>
                          <Avatar className="size-5">
                            {card.solicitante.avatar_url && (
                              <AvatarImage src={card.solicitante.avatar_url} alt={card.solicitante.full_name} />
                            )}
                            <AvatarFallback className="text-[9px]">
                              {card.solicitante.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[120px]">{card.solicitante.full_name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">Automático</span>
                      )}
                    </span>
                  </TableCell>
                    {/* TODO: atribuir responsavel */}
                    <AssigneePopover
                      assignee={card.assignee ?? null}
                      onSelect={(_id) => { }}
                    >
                      <span className="sgdi-lista-responsavel-tag">
                        {card.assignee ? (
                          <>
                            <Avatar className="size-5">
                              {card.assignee.avatar_url && (
                                <AvatarImage src={card.assignee.avatar_url} alt={card.assignee.full_name} />
                              )}
                              <AvatarFallback className="text-[9px]">
                                {card.assignee.initials}
                              </AvatarFallback>
                            </Avatar>
                            {card.assignee.full_name}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Não atribuído</span>
                        )}
                      </span>
                    </AssigneePopover>
                  </TableCell>
                  <TableCell>
                    {/* TODO: data de vencimento */}
                    <DueDatePopover
                      dueDate={card.due_date}
                      onSelect={(_d) => { }}
                    >
                      <span
                        className={cn(
                          'sgdi-lista-vencimento-tag',
                          estaAtrasado && 'sgdi-lista-vencimento-atrasado',
                          venceHoje && 'sgdi-lista-vencimento-hoje',
                          !estaAtrasado && !venceHoje && 'text-foreground'
                        )}
                      >
                        {card.due_date ? (
                          format(parseISO(card.due_date), 'dd/MM/yyyy')
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </span>
                    </DueDatePopover>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex size-7 items-center justify-center rounded text-primary hover:bg-accent"
                        aria-label="Ações do cartão"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* TODO: deletar card */}
                        <DropdownMenuItem
                          className="font-medium text-destructive focus:text-destructive"
                          onSelect={() => { }}
                        >
                          Excluir cartão
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const BoardList = ListaQuadro;
