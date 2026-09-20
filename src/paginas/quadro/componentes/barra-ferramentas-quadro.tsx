import { useState, useMemo } from 'react';
import {
  IconArrowsSort,
  IconUser,
  IconSearch,
  IconX,
  IconUserCheck,
  IconChartBar,
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
import { useDataProvider } from '@/lib/provedor-dados';
import { DialogoRelatorioDemandas } from './dialogo-relatorio-demandas';
import './barra-ferramentas-quadro.css';

export type SortBy = 'manual' | 'priority' | 'due_date' | 'assignee' | 'title' | 'created_at';
export type TipoOrdenacao = SortBy;

export interface PropsBarraFerramentasQuadro {
  sortBy?: SortBy;
  onSortByChange?: (s: SortBy) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (p: string) => void;
  requesterFilter?: string;
  onRequesterFilterChange?: (r: string) => void;
  onlyMyTasks?: boolean;
  onOnlyMyTasksChange?: (onlyMy: boolean) => void;
  // Aliases compatibilidade
  ordenarPor?: SortBy;
  aoMudarOrdenacao?: (s: SortBy) => void;
  busca?: string;
  aoMudarBusca?: (query: string) => void;
  filtroPrioridade?: string;
  aoMudarFiltroPrioridade?: (p: string) => void;
  filtroSolicitante?: string;
  aoMudarFiltroSolicitante?: (r: string) => void;
  apenasMinhas?: boolean;
  aoMudarApenasMinhas?: (onlyMy: boolean) => void;
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
  searchQuery = '',
  onSearchQueryChange,
  priorityFilter = 'all',
  onPriorityFilterChange,
  requesterFilter = 'all',
  onRequesterFilterChange,
  onlyMyTasks = false,
  onOnlyMyTasksChange,
  ordenarPor,
  aoMudarOrdenacao,
  busca,
  aoMudarBusca,
  filtroPrioridade,
  aoMudarFiltroPrioridade,
  filtroSolicitante,
  aoMudarFiltroSolicitante,
  apenasMinhas,
  aoMudarApenasMinhas,
}: PropsBarraFerramentasQuadro) {
  const ordenacaoAtual = ordenarPor ?? sortBy ?? 'manual';
  const mudarOrdenacao = aoMudarOrdenacao ?? onSortByChange ?? (() => { });

  const termoBusca = busca !== undefined ? busca : searchQuery;
  const mudarBusca = aoMudarBusca ?? onSearchQueryChange;

  const prioFiltro = filtroPrioridade !== undefined ? filtroPrioridade : priorityFilter;
  const mudarPrioFiltro = aoMudarFiltroPrioridade ?? onPriorityFilterChange;

  const solFiltro = filtroSolicitante !== undefined ? filtroSolicitante : requesterFilter;
  const mudarSolFiltro = aoMudarFiltroSolicitante ?? onRequesterFilterChange;

  const estadoMinhas = apenasMinhas !== undefined ? apenasMinhas : onlyMyTasks;
  const mudarMinhas = aoMudarApenasMinhas ?? onOnlyMyTasksChange;

  const [relatorioAberto, setRelatorioAberto] = useState(false);

  const { useCards, useTeamMembers } = useDataProvider();
  const { data: cartoes = [] } = useCards();
  const { data: membros = [] } = useTeamMembers();

  // Consolida lista de solicitantes únicos para o seletor de filtro
  const listaSolicitantes = useMemo(() => {
    const mapa = new Map<string, { id: string; nome: string }>();

    for (const m of membros) {
      const id = m.id_usuario_membro || m.id;
      mapa.set(id, { id, nome: m.full_name || m.nome_completo });
    }

    for (const c of cartoes) {
      const id = c.id_solicitante || c.solicitante_id || c.id_usuario;
      if (id && !mapa.has(id)) {
        const nome =
          c.solicitante?.nome_completo ||
          c.solicitante?.full_name ||
          `Usuário (${id.slice(0, 6)})`;
        mapa.set(id, { id, nome });
      }
    }

    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [membros, cartoes]);

  const temFiltrosAtivos =
    termoBusca.trim().length > 0 ||
    prioFiltro !== 'all' ||
    solFiltro !== 'all' ||
    estadoMinhas;

  const limparFiltros = () => {
    mudarBusca?.('');
    mudarPrioFiltro?.('all');
    mudarSolFiltro?.('all');
    mudarMinhas?.(false);
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

          {/* Filtro por Solicitante */}
          <div className="sgdi-ordenar-grupo">
            <Select
              value={solFiltro}
              onValueChange={(val) => mudarSolFiltro?.(val)}
            >
              <SelectTrigger className="h-8 w-[145px] text-xs">
                <IconUserCheck className="size-3 text-muted-foreground mr-1" />
                <span className="truncate">
                  {solFiltro === 'all'
                    ? 'Solicitante'
                    : listaSolicitantes.find((s) => s.id === solFiltro)?.nome || 'Solicitante'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Todos os Solicitantes</SelectItem>
                {listaSolicitantes.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox Apenas Minhas Tarefas */}
          <div className="flex items-center gap-1.5 pl-1">
            <Checkbox
              id="only-my-tasks"
              checked={estadoMinhas}
              onCheckedChange={(checked) => mudarMinhas?.(Boolean(checked))}
            />
            <Label
              htmlFor="only-my-tasks"
              className="sgdi-minhas-tarefas-label"
            >
              <IconUser className="size-3 text-muted-foreground" />
              <span>Minhas</span>
            </Label>
          </div>

          {/* Botão de Relatório / Visão por Solicitante */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRelatorioAberto(true)}
            className="h-8 text-xs gap-1.5 font-medium hover:text-primary"
            title="Abrir painel de rastreabilidade e relatórios por solicitante"
          >
            <IconChartBar className="size-3.5 text-primary" />
            <span className="hidden xl:inline">Visão por Solicitante</span>
            <span className="xl:hidden">Relatório</span>
          </Button>

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

      {/* Diálogo de Relatório e Rastreabilidade */}
      <DialogoRelatorioDemandas
        open={relatorioAberto}
        onOpenChange={setRelatorioAberto}
        cartoes={cartoes}
        membros={membros}
        aoFiltrarPorSolicitante={(id) => mudarSolFiltro?.(id)}
      />
    </div>
  );
}

export const BoardToolbar = BarraFerramentasQuadro;
<<<<<<< HEAD
=======

>>>>>>> ec99f6c (Atrelação a ID e complemento a tabela para verificações)
