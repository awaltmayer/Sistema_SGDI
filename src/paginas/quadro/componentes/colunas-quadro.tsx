import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle } from '@/componentes/ui/cartao';
import { Badge } from '@/componentes/ui/emblema';
import { Skeleton } from '@/componentes/ui/esquema-carregamento';
import { Button } from '@/componentes/base/botao';
import {
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';
import {
  useDataProvider,
  type CardWithAssignee,
  type ReorderInput,
} from '@/lib/provedor-dados';
import { colunas as columnDefs } from '@/dados/dados-iniciais';
import type { IdColuna } from '@/dados/dados-iniciais';
import { CartaoItem, CardTile } from './cartao-item';
import { AddCardInput } from './entrada-novo-cartao';
import { ColumnIcon } from './icone-coluna';
import { MenuRapidoColuna } from './menu-rapido-coluna';
import { getColumnColorStyle } from './configuracao-cores-coluna';
import type { SortBy } from './barra-ferramentas-quadro';
import { sortCards } from './ordenar-cartoes';
import { cn } from '@/lib/utilitarios';
import './colunas-quadro.css';

export interface PropsColunasQuadro {
  sortBy?: SortBy;
  basePath?: string;
  searchQuery?: string;
  priorityFilter?: string;
  requesterFilter?: string;
  assigneeFilter?: string;
  // Aliases compatibilidade
  ordenarPor?: SortBy;
  caminhoBase?: string;
  busca?: string;
  filtroPrioridade?: string;
  filtroSolicitante?: string;
  filtroResponsavel?: string;
}
export type BoardColumnsProps = PropsColunasQuadro;

const LOCAL_STORAGE_CHAVE_CORES_COLUNAS = 'sgdi-cores-colunas-v1';

function carregarCoresColunasSalvas(): Record<string, string> {
  try {
    const salvo = localStorage.getItem(LOCAL_STORAGE_CHAVE_CORES_COLUNAS);
    if (salvo) return JSON.parse(salvo);
  } catch {
    /* fallback para objeto vazio */
  }
  return {};
}

function salvarCoresColunas(cores: Record<string, string>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHAVE_CORES_COLUNAS, JSON.stringify(cores));
  } catch {
    /* erro silencioso ao persistir cores no cache */
  }
}

export function ColunasQuadro({
  sortBy,
  basePath,
  searchQuery: _searchQuery = '',
  priorityFilter: _priorityFilter = 'all',
  requesterFilter: _requesterFilter = 'all',
  assigneeFilter: _assigneeFilter = 'all',
  ordenarPor,
  caminhoBase,
  busca,
  filtroPrioridade,
  filtroSolicitante,
  filtroResponsavel,
}: PropsColunasQuadro) {
  const ordenar = ordenarPor ?? sortBy ?? 'manual';
  const rotaBase = caminhoBase ?? basePath ?? '';

  const navegar = useNavigate();
  const { useCards, useCommentCounts, useReorderCards } = useDataProvider();
  const { data: todosCartoes = [], isLoading: carregando } = useCards();
  const { data: contagensComentarios = {} } = useCommentCounts();
  const { mutate: reorderCards } = useReorderCards();

  const [cartaoAtivo, setCartaoAtivo] = useState<CardWithAssignee | null>(null);
  const [cartoesLocais, setCartoesLocais] = useState<CardWithAssignee[] | null>(null);
  const [idsColapsados, setIdsColapsados] = useState<Set<string>>(new Set());
  const [adicionandoEmAFazer, setAdicionandoEmAFazer] = useState(false);
  const [coresColunas, setCoresColunas] = useState<Record<string, string>>(() => carregarCoresColunasSalvas());

  const lidarComMudancaCorColuna = (colunaId: string, corId: string) => {
    setCoresColunas((prev) => {
      const atualizado = { ...prev, [colunaId]: corId };
      salvarCoresColunas(atualizado);
      return atualizado;
    });
  };

  const cartoes = useMemo(() => cartoesLocais ?? todosCartoes ?? [], [cartoesLocais, todosCartoes]);
  const arrastoDesabilitado = ordenar !== 'manual';

  const termoBusca = (busca ?? _searchQuery ?? '').trim().toLowerCase();
  const prioridadeFiltro = filtroPrioridade ?? _priorityFilter ?? 'all';
  const solicitanteFiltro = filtroSolicitante ?? _requesterFilter ?? 'all';
  const responsavelFiltro = filtroResponsavel ?? _assigneeFilter ?? 'all';

  const cartoesFiltrados = useMemo(() => {
    return (cartoes ?? []).filter((c) => {
      const tit = (c.titulo ?? c.title ?? '').toLowerCase();
      if (termoBusca && !tit.includes(termoBusca)) {
        return false;
      }
      const prio = c.prioridade ?? c.priority;
      if (prioridadeFiltro !== 'all' && prio !== prioridadeFiltro) {
        return false;
      }
      if (solicitanteFiltro !== 'all') {
        const idCriador = c.id_usuario ?? c.user_id;
        if (idCriador !== solicitanteFiltro) {
          return false;
        }
      }
      if (responsavelFiltro !== 'all') {
        const idResp = c.id_responsavel ?? c.assignee_id;
        if (responsavelFiltro === 'unassigned') {
          if (idResp) return false;
        } else {
          if (idResp !== responsavelFiltro) return false;
        }
      }
      return true;
    });
  }, [cartoes, termoBusca, prioridadeFiltro, solicitanteFiltro, responsavelFiltro]);

  const cartoesPorColuna = useMemo(() => {
    const agrupados: Record<IdColuna, CardWithAssignee[]> = {
      'todo': [],
      'in-progress': [],
      'done': [],
    };
    for (const item of (cartoesFiltrados ?? [])) {
      const col = (item.coluna ?? item.column) as IdColuna;
      agrupados[col]?.push(item);
    }
    for (const col of Object.keys(agrupados) as IdColuna[]) {
      agrupados[col] = sortCards(agrupados[col] ?? [], ordenar);
    }
    return agrupados;
  }, [cartoesFiltrados, ordenar]);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const alternarColapso = (id: string) => {
    setIdsColapsados((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(id)) {
        proximo.delete(id);
      } else {
        proximo.add(id);
      }
      return proximo;
    });
  };

  const alternarColapsoTodos = (columnId: IdColuna) => {
    const ids = cartoesPorColuna[columnId].map((c) => c.id);
    setIdsColapsados((prev) => {
      const proximo = new Set(prev);
      const todosEstaoColapsados = ids.every((id) => proximo.has(id));
      if (todosEstaoColapsados) ids.forEach((id) => proximo.delete(id));
      else ids.forEach((id) => proximo.add(id));
      return proximo;
    });
  };

  const lidarComInicioArrasto = (evento: DragStartEvent) => {
    if (arrastoDesabilitado) return;
    const item = cartoes.find((c) => c.id === evento.active.id);
    setCartaoAtivo(item ?? null);
    setCartoesLocais([...cartoes]);
  };

  const lidarComSobreposicaoArrasto = (evento: DragOverEvent) => {
    const { active, over } = evento;
    if (!over || !cartoesLocais) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const colAtiva = encontrarColunaDoLocal(cartoesLocais, activeId);
    let colSobre = encontrarColunaDoLocal(cartoesLocais, overId);
    if (!colAtiva) return;
    if (!colSobre) {
      if (columnDefs.some((c) => c.id === overId)) colSobre = overId as IdColuna;
      else return;
    }
    if (colAtiva === colSobre) return;
    setCartoesLocais((prev) =>
      prev?.map((c) => (c.id === activeId ? { ...c, column: colSobre } : c)) ?? prev
    );
  };

  const lidarComFimArrasto = (evento: DragEndEvent) => {
    const { active, over } = evento;
    setCartaoAtivo(null);
    if (!over || !cartoesLocais) {
      setCartoesLocais(null);
      return;
    }
    const activeId = active.id as string;
    const overId = over.id as string;
    let colSobre = encontrarColunaDoLocal(cartoesLocais, overId);
    if (!colSobre && columnDefs.some((c) => c.id === overId)) colSobre = overId as IdColuna;
    if (!colSobre) {
      setCartoesLocais(null);
      return;
    }

    let cartoesFinais = cartoesLocais.map((c) =>
      c.id === activeId ? { ...c, coluna: colSobre, column: colSobre } : c
    );
    const cartoesDaCol = cartoesFinais
      .filter((c) => (c.coluna ?? c.column) === colSobre)
      .sort((a, b) => (a.posicao ?? a.position ?? 0) - (b.posicao ?? b.position ?? 0));
    const indiceAtivo = cartoesDaCol.findIndex((c) => c.id === activeId);
    const indiceSobre = cartoesDaCol.findIndex((c) => c.id === overId);
    if (indiceAtivo !== -1 && indiceSobre !== -1 && indiceAtivo !== indiceSobre) {
      const reordenados = arrayMove(cartoesDaCol, indiceAtivo, indiceSobre);
      const ids = new Set(reordenados.map((c) => c.id));
      cartoesFinais = [
        ...cartoesFinais.filter((c) => !ids.has(c.id)),
        ...reordenados.map((c, i) => ({ ...c, posicao: i, position: i })),
      ];
    } else {
      for (const colId of ['todo', 'in-progress', 'done'] as IdColuna[]) {
        const ordenados = cartoesFinais
          .filter((c) => (c.coluna ?? c.column) === colId)
          .sort((a, b) => (a.posicao ?? a.position ?? 0) - (b.posicao ?? b.position ?? 0));
        cartoesFinais = cartoesFinais.map((c) => {
          if ((c.coluna ?? c.column) === colId) {
            const idx = ordenados.findIndex((s) => s.id === c.id);
            const novaPos = idx >= 0 ? idx : (c.posicao ?? c.position ?? 0);
            return { ...c, posicao: novaPos, position: novaPos };
          }
          return c;
        });
      }
    }

    const alterados: ReorderInput[] = [];
    for (const card of cartoesFinais) {
      const original = todosCartoes.find((c) => c.id === card.id);
      const cardCol = card.coluna ?? card.column;
      const origCol = original?.coluna ?? original?.column;
      const cardPos = card.posicao ?? card.position;
      const origPos = original?.posicao ?? original?.position;
      if (original && (origCol !== cardCol || origPos !== cardPos)) {
        alterados.push({ id: card.id, coluna: cardCol, column: cardCol, posicao: cardPos, position: cardPos });
      }
    }
    if (alterados.length > 0) reorderCards(alterados);
    setCartoesLocais(null);
  };

  const lidarComAbrirDetalhes = (card: CardWithAssignee) =>
    navegar(`${rotaBase}/${card.id}`);

  const estaVazio = todosCartoes.length === 0 && !carregando;

  return (
    <>
      <DndContext
        sensors={sensores}
        collisionDetection={closestCorners}
        onDragStart={lidarComInicioArrasto}
        onDragOver={lidarComSobreposicaoArrasto}
        onDragEnd={lidarComFimArrasto}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto bg-background p-6">
          {columnDefs.map((col) => {
            const cartoesColuna = cartoesPorColuna[col.id] ?? [];
            const todosColapsados =
              cartoesColuna.length > 0 && cartoesColuna.every((c) => idsColapsados.has(c.id));
            return (
              <ColunaQuadro
                key={col.id}
                columnId={col.id}
                label={col.label}
                iconName={col.icon}
                cards={cartoesColuna}
                commentCounts={contagensComentarios}
                collapsedIds={idsColapsados}
                allCollapsed={todosColapsados}
                onToggleCollapse={alternarColapso}
                onToggleCollapseAll={() => alternarColapsoTodos(col.id)}
                onOpenDetail={lidarComAbrirDetalhes}
                dragDisabled={arrastoDesabilitado}
                forceAdd={col.id === 'todo' ? adicionandoEmAFazer : false}
                onForceAddDone={() => setAdicionandoEmAFazer(false)}
                colorId={coresColunas[col.id]}
                onSelectColor={(cor) => lidarComMudancaCorColuna(col.id, cor)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {cartaoAtivo ? (
            <Card className="sgdi-drag-overlay-card">
              <p className="text-sm font-semibold text-foreground line-clamp-2">
                {cartaoAtivo.titulo ?? cartaoAtivo.title}
              </p>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {estaVazio && <EstadoVazio onAddFirst={() => setAdicionandoEmAFazer(true)} />}
    </>
  );
}

interface PropsColunaQuadro {
  columnId: IdColuna;
  label: string;
  iconName: 'circle-dashed' | 'progress' | 'circle-check';
  cards?: CardWithAssignee[];
  commentCounts?: Record<string, number>;
  collapsedIds: Set<string>;
  allCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
  onToggleCollapseAll: () => void;
  onOpenDetail: (card: CardWithAssignee) => void;
  dragDisabled: boolean;
  forceAdd?: boolean;
  onForceAddDone?: () => void;
  colorId?: string;
  onSelectColor?: (colorId: string) => void;
}

function ColunaQuadro({
  columnId,
  label,
  iconName,
  cards = [],
  commentCounts = {},
  collapsedIds,
  allCollapsed,
  onToggleCollapse,
  onToggleCollapseAll,
  onOpenDetail,
  dragDisabled,
  forceAdd,
  onForceAddDone,
  colorId,
  onSelectColor,
}: PropsColunaQuadro) {
  const { setNodeRef } = useDroppable({ id: columnId });
  const idsCartoes = (cards ?? []).map((c) => c.id);
  const estiloCor = getColumnColorStyle(colorId);

  return (
    <div className="sgdi-coluna-container">
      <Card className={cn("sgdi-coluna-card transition-all duration-200", estiloCor.bgClass, estiloCor.borderClass)}>
        <div className="sgdi-coluna-header">
          <div className="sgdi-coluna-header-esquerda">
            <ColumnIcon name={iconName} className={cn("size-4", estiloCor.iconClass)} />
            <h3 className={cn("sgdi-coluna-titulo", estiloCor.headerClass)}>
              {label}
            </h3>
            <Badge variant="secondary" className={cn("text-xs font-medium", estiloCor.badgeClass)}>
              {(cards ?? []).length}
            </Badge>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label={allCollapsed ? 'Expand all cards' : 'Collapse all cards'}
              onClick={onToggleCollapseAll}
              className={cn("sgdi-coluna-collapse-btn", estiloCor.btnClass)}
            >
              {allCollapsed ? (
                <IconChevronRight className="size-4" />
              ) : (
                <IconChevronDown className="size-4" />
              )}
            </button>
            <MenuRapidoColuna
              columnId={columnId}
              columnLabel={label}
              currentColor={colorId}
              onSelectColor={(cor) => onSelectColor?.(cor)}
              triggerClassName={estiloCor.btnClass}
            />
          </div>
        </div>
        <AddCardInput
          column={columnId}
          cardCount={(cards ?? []).length}
          forceAdd={forceAdd}
          onForceAddDone={onForceAddDone}
          buttonClassName={estiloCor.addBtnClass}
        />
        <SortableContext
          id={columnId}
          items={idsCartoes}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="sgdi-coluna-cards-area">
            {(cards ?? []).map((card) => (
              <CartaoItem
                key={card.id}
                cartao={card}
                contagemComentarios={commentCounts?.[card.id] ?? 0}
                colapsado={collapsedIds.has(card.id)}
                aoAlternarColapso={() => onToggleCollapse(card.id)}
                aoAbrirDetalhes={onOpenDetail}
                arrastoDesabilitado={dragDisabled}
              />
            ))}
          </div>
        </SortableContext>
      </Card>
    </div>
  );
}

function EstadoVazio({ onAddFirst }: { onAddFirst: () => void }) {
  return (
    <div className="sgdi-estado-vazio-wrapper">
      <div className="sgdi-estado-vazio-esqueletos">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex w-80 shrink-0 flex-col gap-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        ))}
      </div>
      <Card className="sgdi-estado-vazio-card">
        <h3 className="text-lg font-semibold">Adicione seu primeiro cartão</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite o nome da tarefa e pressione Enter para adicioná-la à coluna A fazer.
        </p>
        <Button variant="default" className="mt-4" onClick={onAddFirst}>
          Adicionar cartão
        </Button>
      </Card>
    </div>
  );
}

function encontrarColunaDoLocal(cards: CardWithAssignee[], id: string): IdColuna | null {
  const card = cards.find((c) => c.id === id);
  return card ? ((card.coluna ?? card.column) as IdColuna) : null;
}

export const BoardColumns = ColunasQuadro;
