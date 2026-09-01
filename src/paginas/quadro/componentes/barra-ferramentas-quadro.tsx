import {
  IconLayoutKanban,
  IconList,
  IconArrowsSort,
  IconUser,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/componentes/ui/grupo-alternadores';
import { Checkbox } from '@/componentes/ui/caixa-selecao';
import { Label } from '@/componentes/ui/rotulo';
import { Input } from '@/componentes/ui/campo-texto';
import { Button } from '@/componentes/base/botao';
import './barra-ferramentas-quadro.css';

export type SortBy = 'manual' | 'priority' | 'due_date' | 'assignee' | 'title' | 'created_at';
export type ViewMode = 'board' | 'list';
export type TipoOrdenacao = SortBy;
export type ModoVisualizacao = ViewMode;

export interface PropsBarraFerramentasQuadro {
  sortBy?: SortBy;
  onSortByChange?: (s: SortBy) => void;
  view?: ViewMode;
  onViewChange?: (v: ViewMode) => void;
  onlyMyTasks?: boolean;
  onOnlyMyTasksChange?: (val: boolean) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (p: string) => void;
  complexityFilter?: string;
  onComplexityFilterChange?: (c: string) => void;
  // Aliases compatibilidade
  ordenarPor?: SortBy;
  aoMudarOrdenacao?: (s: SortBy) => void;
  visualizacao?: ViewMode;
  aoMudarVisualizacao?: (v: ViewMode) => void;
  apenasMinhasTarefas?: boolean;
  aoMudarApenasMinhasTarefas?: (val: boolean) => void;
  busca?: string;
  aoMudarBusca?: (query: string) => void;
  filtroPrioridade?: string;
  aoMudarFiltroPrioridade?: (p: string) => void;
  filtroComplexidade?: string;
  aoMudarFiltroComplexidade?: (c: string) => void;
}
export type BoardToolbarProps = PropsBarraFerramentasQuadro;

const rotulosOrdenacao: Record<SortBy, string> = {
  manual: 'Manual',
  priority: 'Prioridade',
  due_date: 'Data de vencimento',
  assignee: 'Responsável',
  title: 'Título',
  created_at: 'Criados',
};
export const sortLabels = rotulosOrdenacao;

export function BarraFerramentasQuadro({
  sortBy,
  onSortByChange,
  view,
  onViewChange,
  onlyMyTasks,
  onOnlyMyTasksChange,
  searchQuery = '',
  onSearchQueryChange,
  priorityFilter = 'all',
  onPriorityFilterChange,
  complexityFilter = 'all',
  onComplexityFilterChange,
  ordenarPor,
  aoMudarOrdenacao,
  visualizacao,
  aoMudarVisualizacao,
  apenasMinhasTarefas,
  aoMudarApenasMinhasTarefas,
  busca,
  aoMudarBusca,
  filtroPrioridade,
  aoMudarFiltroPrioridade,
  filtroComplexidade,
  aoMudarFiltroComplexidade,
}: PropsBarraFerramentasQuadro) {
  const ordenacaoAtual = ordenarPor ?? sortBy ?? 'manual';
  const mudarOrdenacao = aoMudarOrdenacao ?? onSortByChange ?? (() => {});
  const modoVisao = visualizacao ?? view ?? 'board';
  const mudarVisao = aoMudarVisualizacao ?? onViewChange ?? (() => {});
  const minhasTarefas = apenasMinhasTarefas !== undefined ? apenasMinhasTarefas : onlyMyTasks ?? false;
  const mudarMinhasTarefas = aoMudarApenasMinhasTarefas ?? onOnlyMyTasksChange ?? (() => {});
  const termoBusca = busca !== undefined ? busca : searchQuery;
  const mudarBusca = aoMudarBusca ?? onSearchQueryChange;
  const prioFiltro = filtroPrioridade !== undefined ? filtroPrioridade : priorityFilter;
  const mudarPrioFiltro = aoMudarFiltroPrioridade ?? onPriorityFilterChange;
  const compFiltro = filtroComplexidade !== undefined ? filtroComplexidade : complexityFilter;
  const mudarCompFiltro = aoMudarFiltroComplexidade ?? onComplexityFilterChange;

  const temFiltrosAtivos =
    termoBusca.trim().length > 0 ||
    prioFiltro !== 'all' ||
    compFiltro !== 'all' ||
    minhasTarefas;

  const limparFiltros = () => {
    mudarBusca?.('');
    mudarPrioFiltro?.('all');
    mudarCompFiltro?.('all');
    mudarMinhasTarefas(false);
  };

  return (
    <div className="sgdi-barra-ferramentas-container">
      {/* Linha Superior: Busca e Controles Principais */}
      <div className="sgdi-ferramentas-linha-superior">
        <div className="sgdi-ferramentas-filtros-grupo">
          {/* Campo de Busca de Tarefas */}
          <div className="sgdi-busca-wrapper">
            <IconSearch className="sgdi-busca-icone" />
            <Input
              type="text"
              placeholder="Buscar tarefa por título..."
              value={termoBusca}
              onChange={(e) => mudarBusca?.(e.target.value)}
              className="sgdi-busca-input"
            />
            {termoBusca && (
              <button
                type="button"
                onClick={() => mudarBusca?.('')}
                className="sgdi-busca-limpar-btn"
                aria-label="Limpar busca"
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>

          {/* Ordenar por */}
          <div className="sgdi-ordenar-grupo">
            <IconArrowsSort className="size-3.5 text-muted-foreground hidden sm:inline" />
            <span className="text-xs text-muted-foreground hidden md:inline">Ordenar:</span>
            <Select value={ordenacaoAtual} onValueChange={(v) => mudarOrdenacao(v as SortBy)}>
              <SelectTrigger aria-label="Ordenar cartões por" className="h-8 w-[130px] text-xs">
                <SelectValue>{rotulosOrdenacao[ordenacaoAtual]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(rotulosOrdenacao) as SortBy[]).map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {rotulosOrdenacao[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Prioridade */}
          <div className="sgdi-ordenar-grupo">
            <Select
              value={prioFiltro}
              onValueChange={(val) => mudarPrioFiltro?.(val)}
            >
              <SelectTrigger className="h-8 w-[125px] text-xs">
                <span className="truncate">
                  {prioFiltro === 'all'
                    ? 'Prioridade'
                    : prioFiltro === 'high'
                    ? '🔴 Alta'
                    : prioFiltro === 'medium'
                    ? '🟡 Média'
                    : '🟢 Baixa'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Todas as Prioridades</SelectItem>
                <SelectItem value="high" className="text-xs text-rose-600 font-medium">🔴 Alta</SelectItem>
                <SelectItem value="medium" className="text-xs text-amber-600 font-medium">🟡 Média</SelectItem>
                <SelectItem value="low" className="text-xs text-emerald-600 font-medium">🟢 Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Complexidade */}
          <div className="sgdi-ordenar-grupo hidden lg:flex">
            <Select
              value={compFiltro}
              onValueChange={(val) => mudarCompFiltro?.(val)}
            >
              <SelectTrigger className="h-8 w-[135px] text-xs">
                <span className="truncate">
                  {compFiltro === 'all'
                    ? 'Complexidade'
                    : compFiltro === 'low'
                    ? 'Baixa (~2h)'
                    : compFiltro === 'medium'
                    ? 'Média (~4h)'
                    : compFiltro === 'high'
                    ? 'Alta (~8h)'
                    : 'Muito Alta (~16h)'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Todas as Complexidades</SelectItem>
                <SelectItem value="low" className="text-xs">Baixa (~2h)</SelectItem>
                <SelectItem value="medium" className="text-xs">Média (~4h)</SelectItem>
                <SelectItem value="high" className="text-xs">Alta (~8h)</SelectItem>
                <SelectItem value="very-high" className="text-xs">Muito Alta (~16h)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox Apenas Minhas Tarefas */}
          <div className="flex items-center gap-1.5 pl-1">
            <Checkbox
              id="only-my-tasks"
              checked={minhasTarefas}
              onCheckedChange={(checked) => mudarMinhasTarefas(Boolean(checked))}
            />
            <Label
              htmlFor="only-my-tasks"
              className="sgdi-minhas-tarefas-label"
            >
              <IconUser className="size-3 text-muted-foreground" />
              <span>Minhas</span>
            </Label>
          </div>

          {/* Botão de Limpar Filtros */}
          {temFiltrosAtivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="sgdi-btn-limpar-filtros"
            >
              <IconX className="size-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          )}
        </div>

        {/* Alternador de Visualização (Quadro / Lista) */}
        <ToggleGroup
          type="single"
          value={modoVisao}
          onValueChange={(v) => v && mudarVisao(v as ViewMode)}
          size="sm"
        >
          <ToggleGroupItem value="board" className="gap-1.5 px-2.5 sm:px-3 font-medium text-xs">
            <IconLayoutKanban className="size-4 text-primary" />
            <span className="hidden sm:inline">Quadro</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="list" className="gap-1.5 px-2.5 sm:px-3 font-medium text-xs">
            <IconList className="size-4 text-primary" />
            <span className="hidden sm:inline">Lista</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

export const BoardToolbar = BarraFerramentasQuadro;
