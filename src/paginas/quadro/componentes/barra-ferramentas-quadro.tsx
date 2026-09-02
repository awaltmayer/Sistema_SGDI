import {
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
import { Checkbox } from '@/componentes/ui/caixa-selecao';
import { Label } from '@/componentes/ui/rotulo';
import { Input } from '@/componentes/ui/campo-texto';
import { Button } from '@/componentes/base/botao';
import './barra-ferramentas-quadro.css';

export type SortBy = 'manual' | 'priority' | 'due_date' | 'assignee' | 'title' | 'created_at';
export type TipoOrdenacao = SortBy;

export interface PropsBarraFerramentasQuadro {
  sortBy?: SortBy;
  onSortByChange?: (s: SortBy) => void;
  onlyMyTasks?: boolean;
  onOnlyMyTasksChange?: (val: boolean) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (p: string) => void;
  // Aliases compatibilidade
  ordenarPor?: SortBy;
  aoMudarOrdenacao?: (s: SortBy) => void;
  apenasMinhasTarefas?: boolean;
  aoMudarApenasMinhasTarefas?: (val: boolean) => void;
  busca?: string;
  aoMudarBusca?: (query: string) => void;
  filtroPrioridade?: string;
  aoMudarFiltroPrioridade?: (p: string) => void;
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
  onlyMyTasks,
  onOnlyMyTasksChange,
  searchQuery = '',
  onSearchQueryChange,
  priorityFilter = 'all',
  onPriorityFilterChange,
  ordenarPor,
  aoMudarOrdenacao,
  apenasMinhasTarefas,
  aoMudarApenasMinhasTarefas,
  busca,
  aoMudarBusca,
  filtroPrioridade,
  aoMudarFiltroPrioridade,
}: PropsBarraFerramentasQuadro) {
  const ordenacaoAtual = ordenarPor ?? sortBy ?? 'manual';
  const mudarOrdenacao = aoMudarOrdenacao ?? onSortByChange ?? (() => { });
  const minhasTarefas = apenasMinhasTarefas !== undefined ? apenasMinhasTarefas : onlyMyTasks ?? false;
  const mudarMinhasTarefas = aoMudarApenasMinhasTarefas ?? onOnlyMyTasksChange ?? (() => { });
  const termoBusca = busca !== undefined ? busca : searchQuery;
  const mudarBusca = aoMudarBusca ?? onSearchQueryChange;
  const prioFiltro = filtroPrioridade !== undefined ? filtroPrioridade : priorityFilter;
  const mudarPrioFiltro = aoMudarFiltroPrioridade ?? onPriorityFilterChange;

  const temFiltrosAtivos =
    termoBusca.trim().length > 0 ||
    prioFiltro !== 'all' ||
    minhasTarefas;

  const limparFiltros = () => {
    mudarBusca?.('');
    mudarPrioFiltro?.('all');
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
              className="sgdi-busca-input pl-[35px]"
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
      </div>
    </div>
  );
}

export const BoardToolbar = BarraFerramentasQuadro;
