import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  IconCalendar,
  IconMessage,
  IconChevronDown,
  IconChevronRight,
  IconSquareCheck,
} from '@tabler/icons-react';
import { Card } from '@/componentes/ui/cartao';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { useDataProvider, type CardWithAssignee } from '@/lib/provedor-dados';
import { SeletorPrioridade } from './seletor-prioridade';
import { SeletorResponsavel } from './seletor-responsavel';
import { SeletorDataVencimento, calcularStatusPrazo } from './seletor-data-vencimento';

import { CardTimerWidget } from './cronometro/widget-cronometro-cartao';
import { CardQuickMenu } from './menu-rapido-cartao';
import type { Prioridade } from '@/dados/dados-iniciais';
import { toast } from 'sonner';
import { cn } from '@/lib/utilitarios';
import './cartao-item.css';

export interface PropsCartaoItem {
  cartao: CardWithAssignee;
  contagemComentarios?: number;
  colapsado?: boolean;
  aoAlternarColapso?: () => void;
  aoAbrirDetalhes?: (cartao: CardWithAssignee) => void;
  arrastoDesabilitado?: boolean;
  // Aliases compatibilidade
  card?: CardWithAssignee;
  commentCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenDetail?: (card: CardWithAssignee) => void;
  dragDisabled?: boolean;
}
export type CardTileProps = PropsCartaoItem;

export function CartaoItem({
  cartao,
  contagemComentarios = 0,
  colapsado = false,
  aoAlternarColapso,
  aoAbrirDetalhes,
  arrastoDesabilitado = false,
  card,
  commentCount,
  collapsed,
  onToggleCollapse,
  onOpenDetail,
  dragDisabled,
}: PropsCartaoItem) {
  const itemCartao = cartao ?? card;
  const idCartao = itemCartao?.id ?? "";
  const arrastoBloqueado = arrastoDesabilitado ?? dragDisabled ?? false;

  const { useUpdateCard, useCurrentUser, useTeamMembers } = useDataProvider();
  const { mutate: updateCard } = useUpdateCard();
  const { data: usuarioAtual } = useCurrentUser();
  const { data: membros = [] } = useTeamMembers();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idCartao, disabled: arrastoBloqueado || !itemCartao });

  const contagem = contagemComentarios ?? commentCount ?? 0;
  const estaColapsado = colapsado ?? collapsed ?? false;
  const alternarColapso = aoAlternarColapso ?? onToggleCollapse ?? (() => {});
  const abrirDetalhes = aoAbrirDetalhes ?? onOpenDetail ?? (() => {});

  const estilo = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const selecionarPrioridade = (prioridade: Prioridade) =>
    updateCard(itemCartao.id, { prioridade });

  const selecionarResponsavel = (idResponsavel: string | null) =>
    updateCard(itemCartao.id, {
      id_responsavel: idResponsavel,
      ids_responsaveis: idResponsavel ? [idResponsavel] : [],
    });

  const selecionarResponsaveis = (novosIds: string[]) =>
    updateCard(itemCartao.id, {
      ids_responsaveis: novosIds,
      assignee_ids: novosIds,
    });

  const selecionarDataVencimento = (data: string | null) =>
    updateCard(itemCartao.id, { data_vencimento: data });

  const dataVenc = itemCartao.data_vencimento ?? itemCartao.due_date;
  const colCartao = itemCartao.coluna ?? itemCartao.column;
  const titCartao = itemCartao.titulo ?? itemCartao.title;
  const prioCartao = itemCartao.prioridade ?? itemCartao.priority;
  const respCartao = itemCartao.responsavel ?? itemCartao.assignee;
  const responsaveisCartao = (itemCartao.responsaveis ?? itemCartao.assignees ?? (respCartao ? [respCartao] : [])) as any[];
  const idsResponsaveisCartao = (itemCartao.ids_responsaveis ?? itemCartao.assignee_ids ?? (respCartao?.id ? [respCartao.id] : [])) as string[];
  const listasCartao = itemCartao.listas_verificacao ?? itemCartao.checklists ?? [];
  const rastreadorCartao = itemCartao.rastreador_tempo ?? itemCartao.time_tracker;

  // Checagem de prazo de vencimento (Azul: > 7d, Amarelo: 0-7d, Vermelho: < 0d)
  const infoPrazo = calcularStatusPrazo(dataVenc);

  // Permissão de alteração de prazo: apenas criador ou responsáveis
  const podeEditarPrazo = (() => {
    if (!usuarioAtual || !itemCartao) return false;
    const uId = String(usuarioAtual.id);
    const uAuthId = (usuarioAtual as any)?.id_usuario ? String((usuarioAtual as any).id_usuario) : null;
    const criadorId = itemCartao.id_usuario ?? (itemCartao as any).user_id;
    if (criadorId && (String(criadorId) === uId || (uAuthId && String(criadorId) === uAuthId))) return true;
    if (idsResponsaveisCartao.map(String).includes(uId)) return true;
    if (uAuthId && idsResponsaveisCartao.map(String).includes(uAuthId)) return true;
    if (usuarioAtual.email) {
      const emailLower = usuarioAtual.email.toLowerCase();
      if (responsaveisCartao.some((r: any) => r?.email && r.email.toLowerCase() === emailLower)) {
        return true;
      }
    }
    return false;
  })();

  const criadorId = itemCartao.id_usuario ?? (itemCartao as any).user_id;

  const nomeCriador = useMemo(() => {
    if (!criadorId) return null;
    const sCriadorId = String(criadorId);

    const membro = membros.find(
      (m: any) =>
        String(m.id) === sCriadorId ||
        (m.id_usuario && String(m.id_usuario) === sCriadorId) ||
        (m.id_usuario_membro && String(m.id_usuario_membro) === sCriadorId)
    );
    if (membro?.nome_completo) return membro.nome_completo;
    if ((membro as any)?.full_name) return (membro as any).full_name;
    if (membro?.email) return membro.email;

    if (
      usuarioAtual &&
      (String(usuarioAtual.id) === sCriadorId ||
        ((usuarioAtual as any).id_usuario && String((usuarioAtual as any).id_usuario) === sCriadorId))
    ) {
      return usuarioAtual.nome_completo || (usuarioAtual as any).full_name || usuarioAtual.email || 'Você';
    }

    return null;
  }, [criadorId, membros, usuarioAtual]);

  const dataCriacao = itemCartao.criado_em ?? (itemCartao as any).created_at;
  let dataHoraCriacaoFormatada = '';
  if (dataCriacao) {
    try {
      const dataObj = typeof dataCriacao === 'string' ? parseISO(dataCriacao) : new Date(dataCriacao);
      if (!isNaN(dataObj.getTime())) {
        dataHoraCriacaoFormatada = format(dataObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      }
    } catch {
      dataHoraCriacaoFormatada = '';
    }
  }

  const todosItens = listasCartao.flatMap((c) => c.itens ?? c.items ?? []);
  const totalItensLista = todosItens.length;
  const itensListaConcluidos = todosItens.filter((i) => i.esta_concluido ?? i.is_completed).length;
  const temListas = totalItensLista > 0;
  const listaCompleta =
    totalItensLista > 0 && itensListaConcluidos === totalItensLista;

  if (!itemCartao) return null;

  return (
    <Card
      ref={setNodeRef}
      style={estilo}
      {...attributes}
      {...(arrastoBloqueado ? {} : listeners)}
      className={cn(
        'group sgdi-cartao-tile bg-card border-border hover:border-primary/40 transition-all duration-150',
        !arrastoBloqueado && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-25 border-2 border-dashed border-primary/60 bg-primary/10 shadow-none pointer-events-none'
      )}
      onClick={() => abrirDetalhes(itemCartao)}
    >
      <div className="sgdi-cartao-cabecalho">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold line-clamp-2 text-foreground">
            <span className="mr-1.5 text-xs font-mono font-bold text-muted-foreground">
              #{itemCartao.id}
            </span>
            {titCartao}
          </p>
          {(nomeCriador || dataHoraCriacaoFormatada) && (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground mt-1 font-normal leading-tight">
              {nomeCriador && (
                <span className="truncate max-w-[130px] font-medium text-foreground/80" title={nomeCriador}>
                  {nomeCriador}
                </span>
              )}
              {nomeCriador && dataHoraCriacaoFormatada && <span>•</span>}
              {dataHoraCriacaoFormatada && <span>{dataHoraCriacaoFormatada}</span>}
            </div>
          )}
        </div>
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
          <div className="flex items-center gap-1.5 flex-wrap">
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
            {dataVenc && (
              <span
                className={cn(
                  'flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium transition-colors border-0 shadow-none',
                  infoPrazo.classeBadge
                )}
                title={`Vencimento: ${infoPrazo.textoFormatado} (${infoPrazo.textoRelativo})`}
              >
                <IconCalendar className="size-3 shrink-0" />
                <span>{infoPrazo.textoFormatado}</span>
              </span>
            )}
          </div>
          <CardTimerWidget
            cardId={itemCartao.id}
            cardTitle={titCartao}
            timeTracker={rastreadorCartao}
            responsaveis={responsaveisCartao}
            idsResponsaveis={idsResponsaveisCartao}
            idResponsavel={itemCartao.id_responsavel}
            compact
          />
        </div>
      )}

      {!estaColapsado && (
        <>
          <div className="sgdi-cartao-grid-campos">
            <div>
              <span className="sgdi-cartao-campo-rotulo text-muted-foreground">Prioridade</span>
              <SeletorPrioridade
                prioridade={prioCartao}
                aoSelecionar={selecionarPrioridade}
              />
            </div>
            <div>
              <span className="sgdi-cartao-campo-rotulo text-muted-foreground">Responsáveis</span>
              <SeletorResponsavel
                responsaveis={responsaveisCartao}
                idsResponsaveis={idsResponsaveisCartao}
                aoSelecionarMultiplo={selecionarResponsaveis}
              >
                <span className="flex items-center gap-1.5 rounded px-1 py-0.5 text-muted-foreground hover:text-foreground hover:bg-accent max-w-full">
                  {responsaveisCartao.length > 0 ? (
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                        {responsaveisCartao.slice(0, 3).map((r) => (
                          <Avatar key={r.id} className="size-4 ring-1 ring-background">
                            {(r.url_avatar || r.avatar_url) && (
                              <AvatarImage src={r.url_avatar || r.avatar_url!} alt={r.nome_completo || r.full_name} />
                            )}
                            <AvatarFallback className="text-[9px]">
                              {r.iniciais || r.initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="truncate text-foreground text-xs">
                        {responsaveisCartao.length === 1
                          ? (responsaveisCartao[0].nome_completo || responsaveisCartao[0].full_name)
                          : `${responsaveisCartao.length} responsáveis`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">Não atribuído</span>
                  )}
                </span>
              </SeletorResponsavel>
            </div>
            <div>
              <span className="sgdi-cartao-campo-rotulo text-muted-foreground">Vencimento</span>
              {podeEditarPrazo ? (
                <SeletorDataVencimento
                  dataVencimento={dataVenc}
                  aoSelecionar={selecionarDataVencimento}
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium transition-colors max-w-full truncate border-0 shadow-none cursor-pointer',
                      dataVenc
                        ? infoPrazo.classeBadge
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                    title={dataVenc ? `Vencimento: ${infoPrazo.textoFormatado} (${infoPrazo.textoRelativo})` : 'Definir vencimento'}
                  >
                    <IconCalendar className="size-3.5 shrink-0" />
                    <span className="truncate">{dataVenc ? infoPrazo.textoFormatado : 'Sem data'}</span>
                  </span>
                </SeletorDataVencimento>
              ) : (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.error('Apenas o criador ou responsáveis podem alterar a data de vencimento.');
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium transition-colors max-w-full truncate border-0 shadow-none cursor-not-allowed select-none opacity-85',
                    dataVenc
                      ? infoPrazo.classeBadge
                      : 'border-transparent text-muted-foreground'
                  )}
                  title="Apenas o criador ou responsáveis podem alterar a data de vencimento"
                >
                  <IconCalendar className="size-3.5 shrink-0" />
                  <span className="truncate">{dataVenc ? infoPrazo.textoFormatado : 'Sem data'}</span>
                </span>
              )}
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
                cardTitle={titCartao}
                timeTracker={rastreadorCartao}
                responsaveis={responsaveisCartao}
                idsResponsaveis={idsResponsaveisCartao}
                idResponsavel={itemCartao.id_responsavel}
                compact
              />
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
