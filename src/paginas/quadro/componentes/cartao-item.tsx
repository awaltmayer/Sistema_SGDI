import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  IconCalendar,
  IconMessage,
  IconClock,
  IconChevronDown,
  IconChevronRight,
  IconSquareCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { Card } from '@/componentes/ui/cartao';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { useDataProvider, type CardWithAssignee } from '@/lib/provedor-dados';
import { PriorityPopover, priorityConfig } from './seletor-prioridade';
import { AssigneePopover } from './seletor-responsavel';
import { DueDatePopover } from './seletor-data-vencimento';

import { CardTimerWidget } from './cronometro/widget-cronometro-cartao';
import { CardQuickMenu } from './menu-rapido-cartao';
import type { Priority } from '@/dados/dados-iniciais';
import { cn } from '@/lib/utilitarios';
import './cartao-item.css';

export interface PropsCartaoItem {
  card?: CardWithAssignee;
  commentCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenDetail?: (card: CardWithAssignee) => void;
  dragDisabled?: boolean;
  // Aliases compatibilidade
  cartao?: CardWithAssignee;
  contagemComentarios?: number;
  colapsado?: boolean;
  aoAlternarColapso?: () => void;
  aoAbrirDetalhes?: (cartao: CardWithAssignee) => void;
  arrastoDesabilitado?: boolean;
}
export type CardTileProps = PropsCartaoItem;

export function CartaoItem({
  card,
  commentCount,
  collapsed,
  onToggleCollapse,
  onOpenDetail,
  dragDisabled,
  cartao,
  contagemComentarios,
  colapsado,
  aoAlternarColapso,
  aoAbrirDetalhes,
  arrastoDesabilitado,
}: PropsCartaoItem) {
  const itemCartao = cartao ?? card;
  if (!itemCartao) return null;

  const contagem = contagemComentarios ?? commentCount ?? 0;
  const estaColapsado = colapsado ?? collapsed ?? false;
  const alternarColapso = aoAlternarColapso ?? onToggleCollapse ?? (() => { });
  const abrirDetalhes = aoAbrirDetalhes ?? onOpenDetail ?? (() => { });
  const desabilitarArrasto = arrastoDesabilitado ?? dragDisabled ?? false;

  const { useUpdateCard } = useDataProvider();
  const { mutate: updateCard } = useUpdateCard();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemCartao.id, disabled: desabilitarArrasto });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const selecionarPrioridade = (prioridade: Priority) =>
    updateCard(itemCartao.id, { priority: prioridade });


  // TODO: atribuicao de usuario
  const selecionarResponsavel = (_idResponsavel: string | null) => { };

  // TODO: data de vencimento
  const selecionarDataVencimento = (_data: string | null) => { };

  // Checagem de prazo de vencimento
  const diferencaDias = itemCartao.due_date ? differenceInDays(parseISO(itemCartao.due_date), new Date()) : null;
  const estaAtrasado = diferencaDias !== null && diferencaDias < 0 && itemCartao.column !== 'done';
  const venceHoje = diferencaDias !== null && diferencaDias === 0 && itemCartao.column !== 'done';
  const relativoVencimento = itemCartao.due_date ? vencimentoRelativo(itemCartao.due_date) : null;

  const todosItens = (itemCartao.checklists ?? []).flatMap((c) => c.items);
  const totalItensLista = todosItens.length;
  const itensListaConcluidos = todosItens.filter((i) => i.is_completed).length;
  const temListas = totalItensLista > 0;
  const listaCompleta =
    totalItensLista > 0 && itensListaConcluidos === totalItensLista;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(desabilitarArrasto ? {} : listeners)}
      className={cn(
        'group sgdi-cartao-tile bg-card border-border hover:border-primary/40',
        estaAtrasado && 'sgdi-cartao-atrasado',
        !desabilitarArrasto && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40'
      )}
      onClick={() => abrirDetalhes(itemCartao)}
    >
      {/* Alerta em destaque de Vencimento no topo do cartão */}
      {estaAtrasado && (
        <div className="sgdi-cartao-alerta-vencido">
          <IconAlertTriangle className="size-3.5 stroke-[2.5]" />
          <span>Vencida há {Math.abs(diferencaDias!)} dia{Math.abs(diferencaDias!) > 1 ? 's' : ''}</span>
        </div>
      )}

      {venceHoje && (
        <div className="sgdi-cartao-alerta-hoje">
          <IconClock className="size-3.5 stroke-[2.5]" />
          <span>Vence hoje!</span>
        </div>
      )}

      <div className="sgdi-cartao-cabecalho">
        <p className="flex-1 text-sm font-semibold line-clamp-2 text-foreground">
          {itemCartao.title}
        </p>
        <div className="sgdi-cartao-acoes-cabecalho">
          <CardQuickMenu
            card={itemCartao}
            onOpenDetail={() => abrirDetalhes(itemCartao)}
            triggerClassName="text-muted-foreground hover:text-foreground hover:bg-accent"
          />
          <button
            type="button"
            aria-label={estaColapsado ? 'Expand card' : 'Collapse card'}
            onClick={(e) => {
              e.stopPropagation();
              alternarColapso();
            }}
            className="sgdi-cartao-btn-collapse text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {estaColapsado ? (
              <IconChevronRight className="size-4" />
            ) : (
              <IconChevronDown className="size-4" />
            )}
          </button>
        </div>
      </div>

      {estaColapsado && (
        <div className="sgdi-cartao-linha-colapsada">
          <div className="flex items-center gap-2">
            {temListas && (
              <span
                className={cn(
                  'flex items-center gap-1 tabular-nums rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors',
                  listaCompleta
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <IconSquareCheck className="size-3.5" />
                {itensListaConcluidos}/{totalItensLista}
              </span>
            )}
          </div>
          <CardTimerWidget
            cardId={itemCartao.id}
            cardTitle={itemCartao.title}
            timeTracker={itemCartao.time_tracker}
            compact
          />
        </div>
      )}

      {!estaColapsado && (
        <>
          <div className="sgdi-cartao-grid-campos">
            <div>
              <span className="sgdi-cartao-campo-rotulo text-muted-foreground">Prioridade</span>
              <PriorityPopover
                priority={itemCartao.priority}
                onSelect={selecionarPrioridade}
              />
            </div>
            <div>
              <span className="sgdi-cartao-campo-rotulo text-muted-foreground">Responsável</span>
              <AssigneePopover
                assignee={itemCartao.assignee ?? null}
                onSelect={selecionarResponsavel}
              >
                <span className="flex items-center gap-1.5 rounded px-1 py-0.5 text-muted-foreground hover:text-foreground hover:bg-accent">
                  {itemCartao.assignee ? (
                    <>
                      <Avatar className="size-4">
                        {itemCartao.assignee.avatar_url && (
                          <AvatarImage src={itemCartao.assignee.avatar_url} alt={itemCartao.assignee.full_name} />
                        )}
                        <AvatarFallback className="text-[9px]">
                          {itemCartao.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-foreground">{itemCartao.assignee.full_name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Não atribuído</span>
                  )}
                </span>
              </AssigneePopover>
            </div>
            <div>
              <span className="sgdi-cartao-campo-rotulo text-muted-foreground">Vencimento</span>
              <DueDatePopover
                dueDate={itemCartao.due_date}
                onSelect={selecionarDataVencimento}
              >
                <span className={cn(
                  'flex items-center gap-1.5 rounded px-1 py-0.5',
                  estaAtrasado
                    ? 'text-rose-600 font-semibold dark:text-rose-400'
                    : venceHoje
                      ? 'text-amber-600 font-semibold dark:text-amber-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}>
                  <IconCalendar className="size-3.5" />
                  {itemCartao.due_date
                    ? format(parseISO(itemCartao.due_date), 'dd/MM/yyyy')
                    : <span className="text-muted-foreground">Sem data</span>}
                </span>
              </DueDatePopover>
            </div>
          </div>

          <div className="sgdi-cartao-rodape border-border text-muted-foreground">
            <div className="sgdi-cartao-rodape-esquerda">
              <span className="flex items-center gap-1.5 tabular-nums">
                <IconMessage className="size-4" />
                {contagem}
              </span>
              {temListas && (
                <span
                  className={cn(
                    'flex items-center gap-1 tabular-nums rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors',
                    listaCompleta
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  )}
                  title={`${itensListaConcluidos} de ${totalItensLista} itens concluídos`}
                >
                  <IconSquareCheck className="size-3.5" />
                  {itensListaConcluidos}/{totalItensLista}
                </span>
              )}
            </div>

            <div className="sgdi-cartao-rodape-direita">
              <CardTimerWidget
                cardId={itemCartao.id}
                cardTitle={itemCartao.title}
                timeTracker={itemCartao.time_tracker}
                compact
              />
              {relativoVencimento && (
                <span className={cn(
                  'flex items-center gap-1 tabular-nums',
                  estaAtrasado && 'text-rose-600 font-semibold dark:text-rose-400'
                )}>
                  <IconClock className="size-3.5" />
                  {relativoVencimento}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

function vencimentoRelativo(iso: string): string {
  const dias = differenceInDays(parseISO(iso), new Date());
  if (dias === 0) return 'Hoje';
  if (dias > 0) return `${dias}d restante${dias > 1 ? 's' : ''}`;
  return `${Math.abs(dias)}d atrás`;
}

export const CardTile = CartaoItem;
export const relativeDue = vencimentoRelativo;
