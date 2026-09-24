import {
  IconArrowsSort,
  IconSearch,
  IconX,
  IconDownload,
} from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import { Input } from '@/componentes/ui/campo-texto';
import { Button } from '@/componentes/base/botao';
import { SeletorSolicitante } from './seletor-solicitante';
import { SeletorFiltroResponsavel } from './seletor-filtro-responsavel';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
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
  assigneeFilter?: string;
  onAssigneeFilterChange?: (a: string) => void;
  cartoesVisiveis?: any[];
  // Aliases compatibilidade
  ordenarPor?: SortBy;
  aoMudarOrdenacao?: (s: SortBy) => void;
  busca?: string;
  aoMudarBusca?: (query: string) => void;
  filtroPrioridade?: string;
  aoMudarFiltroPrioridade?: (p: string) => void;
  filtroSolicitante?: string;
  aoMudarFiltroSolicitante?: (r: string) => void;
  filtroResponsavel?: string;
  aoMudarFiltroResponsavel?: (a: string) => void;
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
  ordenarPor,
  aoMudarOrdenacao,
  busca,
  aoMudarBusca,
  filtroPrioridade,
  aoMudarFiltroPrioridade,
  filtroSolicitante,
  aoMudarFiltroSolicitante,
  assigneeFilter = 'all',
  onAssigneeFilterChange,
  filtroResponsavel,
  aoMudarFiltroResponsavel,
  cartoesVisiveis,
}: PropsBarraFerramentasQuadro) {
  const ordenacaoAtual = ordenarPor ?? sortBy ?? 'manual';
  const mudarOrdenacao = aoMudarOrdenacao ?? onSortByChange ?? (() => { });
  const termoBusca = busca !== undefined ? busca : searchQuery;
  const mudarBusca = aoMudarBusca ?? onSearchQueryChange;
  const prioFiltro = filtroPrioridade !== undefined ? filtroPrioridade : priorityFilter;
  const mudarPrioFiltro = aoMudarFiltroPrioridade ?? onPriorityFilterChange;
  const solicitanteFiltro = filtroSolicitante !== undefined ? filtroSolicitante : requesterFilter;
  const mudarSolicitanteFiltro = aoMudarFiltroSolicitante ?? onRequesterFilterChange;
  const responsavelFiltro = filtroResponsavel !== undefined ? filtroResponsavel : assigneeFilter;
  const mudarResponsavelFiltro = aoMudarFiltroResponsavel ?? onAssigneeFilterChange;

  const temFiltrosAtivos =
    termoBusca.trim().length > 0 ||
    prioFiltro !== 'all' ||
    solicitanteFiltro !== 'all' ||
    responsavelFiltro !== 'all';

  const limparFiltros = () => {
    mudarBusca?.('');
    mudarPrioFiltro?.('all');
    mudarSolicitanteFiltro?.('all');
    mudarResponsavelFiltro?.('all');
  };

  const exportarCSV = () => {
    const lista = cartoesVisiveis ?? [];
    if (lista.length === 0) {
      toast.info('Não há tarefas visíveis para exportar com os filtros atuais.');
      return;
    }

    const escaparCsv = (valor: any): string => {
      if (valor == null) return '""';
      const str = String(valor).replace(/"/g, '""');
      return `"${str}"`;
    };

    const cabecalho = [
      'ID',
      'Título',
      'Descrição',
      'Coluna / Status',
      'Prioridade',
      'Responsáveis',
      'Data de Vencimento',
      'Data de Criação',
      'Progresso Checklists',
      'Tempo Total Gasto',
    ];

    const linhas = lista.map((c) => {
      const col = c.coluna ?? c.column;
      const colNome =
        col === 'todo'
          ? 'A Fazer'
          : col === 'in-progress'
          ? 'Em Andamento'
          : col === 'done'
          ? 'Concluído'
          : (col ?? '');

      const prio = c.prioridade ?? c.priority;
      const prioNome =
        prio === 'high'
          ? 'Alta'
          : prio === 'medium'
          ? 'Média'
          : prio === 'low'
          ? 'Baixa'
          : (prio ?? '');

      const nomesResponsaveis = (c.responsaveis ?? c.assignees ?? [])
        .map((r: any) => r.nome_completo || r.full_name || r.name)
        .filter(Boolean)
        .join(', ') || (c.responsavel?.nome_completo || c.assignee?.full_name || '');

      let dataVencFormatada = '';
      const rawVenc = c.data_vencimento ?? c.due_date;
      if (rawVenc) {
        try {
          dataVencFormatada = format(new Date(rawVenc), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
          dataVencFormatada = String(rawVenc);
        }
      }

      let criadoEmFormatado = '';
      const rawCriado = c.criado_em ?? c.created_at;
      if (rawCriado) {
        try {
          criadoEmFormatado = format(new Date(rawCriado), 'dd/MM/yyyy HH:mm', { locale: ptBR });
        } catch {
          criadoEmFormatado = String(rawCriado);
        }
      }

      const listas = c.listas_verificacao ?? c.checklists ?? [];
      const todosItens = listas.flatMap((l: any) => l.itens ?? l.items ?? []);
      const itensConcluidos = todosItens.filter((i: any) => i.esta_concluido ?? i.is_completed).length;
      const progressoChecklists = todosItens.length > 0
        ? `${itensConcluidos}/${todosItens.length} concluídos`
        : 'Sem checklists';

      const seg = c.rastreador_tempo?.tempo_total_segundos ?? c.time_tracker?.total_spent_seconds ?? 0;
      const h = Math.floor(seg / 3600);
      const m = Math.floor((seg % 3600) / 60);
      const s = seg % 60;
      const tempoGasto = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      return [
        escaparCsv(c.id),
        escaparCsv(c.titulo ?? c.title ?? ''),
        escaparCsv(c.descricao ?? c.description ?? ''),
        escaparCsv(colNome),
        escaparCsv(prioNome),
        escaparCsv(nomesResponsaveis),
        escaparCsv(dataVencFormatada),
        escaparCsv(criadoEmFormatado),
        escaparCsv(progressoChecklists),
        escaparCsv(tempoGasto),
      ].join(';');
    });

    const csvFinal = '\uFEFF' + [cabecalho.map(escaparCsv).join(';'), ...linhas].join('\r\n');
    const blob = new Blob([csvFinal], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tarefas_sgdi_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${lista.length} tarefa(s) exportada(s) para CSV com sucesso!`);
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
            <SeletorSolicitante
              solicitanteSelecionadoId={solicitanteFiltro}
              aoMudarSolicitante={(id) => mudarSolicitanteFiltro?.(id)}
            />
          </div>

          {/* Filtro por Responsável */}
          <div className="sgdi-ordenar-grupo">
            <SeletorFiltroResponsavel
              responsavelSelecionadoId={responsavelFiltro}
              aoMudarResponsavel={(id) => mudarResponsavelFiltro?.(id)}
            />
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

        {/* BEM NO CANTO DIREITO: Botão Exportar CSV */}
        <div className="flex items-center ml-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="h-8 gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-normal text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer shadow-xs transition-colors"
          >
            <IconDownload className="size-3.5 text-muted-foreground shrink-0" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const BoardToolbar = BarraFerramentasQuadro;
