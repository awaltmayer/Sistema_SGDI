import {
  IconCalendar,
  IconUser,
  IconFlame,
  IconChecklist,
  IconX,
  IconFilter,
  IconAlertTriangle,
  IconUserExclamation,
} from '@tabler/icons-react';
import type {
  FiltrosDashboard,
  TipoPeriodoFiltro,
  TipoPrioridadeFiltro,
  TipoStatusFiltro,
} from '../calculos-dashboard';
import type { MembroEquipe } from '@/lib/provedor-dados';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import { Button } from '@/componentes/base/botao';
import { Badge } from '@/componentes/ui/emblema';
import { cn } from '@/lib/utilitarios';

interface PropsFiltrosDashboard {
  filtros: FiltrosDashboard;
  aoMudarFiltros: (novos: FiltrosDashboard) => void;
  membros: MembroEquipe[];
  totalFiltrado: number;
  totalGeral: number;
}

export function FiltrosDashboardBar({
  filtros,
  aoMudarFiltros,
  membros,
  totalFiltrado,
  totalGeral,
}: PropsFiltrosDashboard) {
  const temFiltroAtivo =
    filtros.periodo !== 'todos' ||
    filtros.responsavel !== 'todos' ||
    filtros.prioridade !== 'todas' ||
    filtros.status !== 'todos' ||
    (filtros.busca && filtros.busca.trim().length > 0);

  const limparFiltros = () => {
    aoMudarFiltros({
      periodo: 'todos',
      responsavel: 'todos',
      prioridade: 'todas',
      status: 'todos',
      busca: '',
    });
  };

  return (
    <div className="p-3 rounded-lg border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold">
            <IconFilter className="size-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filtros do Painel
          </span>
          <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 ml-1">
            {totalFiltrado} de {totalGeral} {totalGeral === 1 ? 'demanda' : 'demandas'}
          </Badge>
        </div>

        {temFiltroAtivo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltros}
            className="h-7 px-2.5 text-xs font-medium gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 self-start md:self-auto"
          >
            <IconX className="size-3.5" />
            <span>Limpar filtros</span>
          </Button>
        )}
      </div>

      {/* Grid de Controles de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 1. Filtro de Período */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <IconCalendar className="size-3" />
            Período
          </label>
          <Select
            value={filtros.periodo}
            onValueChange={(val) =>
              aoMudarFiltros({ ...filtros, periodo: val as TipoPeriodoFiltro })
            }
          >
            <SelectTrigger size="sm" className="bg-background text-xs h-8">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os períodos</SelectItem>
              <SelectItem value="hoje">Criadas Hoje</SelectItem>
              <SelectItem value="7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="15dias">Últimos 15 dias</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 2. Filtro de Responsável */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <IconUser className="size-3" />
            Responsável
          </label>
          <Select
            value={filtros.responsavel}
            onValueChange={(val) =>
              aoMudarFiltros({ ...filtros, responsavel: val })
            }
          >
            <SelectTrigger size="sm" className="bg-background text-xs h-8">
              <SelectValue placeholder="Todos os responsáveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os responsáveis</SelectItem>
              <SelectItem value="sem-responsavel" className="text-amber-600 dark:text-amber-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <IconUserExclamation className="size-3.5" />
                  <span>Sem responsável (Fora do SLA)</span>
                </div>
              </SelectItem>
              {membros.map((m) => {
                const nome = m.nome_completo || m.full_name || m.email || 'Membro';
                return (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {nome}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Filtro de Prioridade / Propriedade */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <IconFlame className="size-3" />
            Prioridade
          </label>
          <Select
            value={filtros.prioridade}
            onValueChange={(val) =>
              aoMudarFiltros({ ...filtros, prioridade: val as TipoPrioridadeFiltro })
            }
          >
            <SelectTrigger size="sm" className="bg-background text-xs h-8">
              <SelectValue placeholder="Todas as prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as prioridades</SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-500" />
                  <span>Alta Prioridade</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <span>Média Prioridade</span>
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Baixa Prioridade</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 4. Filtro de Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <IconChecklist className="size-3" />
            Status
          </label>
          <Select
            value={filtros.status}
            onValueChange={(val) =>
              aoMudarFiltros({ ...filtros, status: val as TipoStatusFiltro })
            }
          >
            <SelectTrigger
              size="sm"
              className={cn(
                'bg-background text-xs h-8',
                filtros.status === 'atrasadas' && 'border-rose-500 text-rose-600 font-semibold'
              )}
            >
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="todo">A Fazer</SelectItem>
              <SelectItem value="in-progress">Em Andamento</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
              {/* Atrasados estritamente em vermelho */}
              <SelectItem value="atrasadas" className="text-rose-600 dark:text-rose-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <IconAlertTriangle className="size-3.5 text-rose-500" />
                  <span>Atrasadas (em vermelho)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
