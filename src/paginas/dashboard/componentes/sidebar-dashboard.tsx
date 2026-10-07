import { useState } from 'react';
import {
  IconChartPie,
  IconClock,
  IconUsers,
  IconShieldExclamation,
  IconTarget,
  IconCheck,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
} from '@tabler/icons-react';
import type {
  FiltrosDashboard,
  TipoPeriodoFiltro,
  TipoPrioridadeFiltro,
  TipoStatusFiltro,
  MetricasDemandas,
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
import { cn } from '@/lib/utilitarios';

export interface ModulosVisiveisDashboard {
  visaoGeral: boolean;
  sla: boolean;
  tempoMedio: boolean;
  responsaveis: boolean;
  criticas: boolean;
}

interface PropsSidebarDashboard {
  modulos: ModulosVisiveisDashboard;
  aoMudarModulos: (novos: ModulosVisiveisDashboard) => void;
  filtros: FiltrosDashboard;
  aoMudarFiltros: (novos: FiltrosDashboard) => void;
  membros: MembroEquipe[];
  metricas: MetricasDemandas;
  totalGeral: number;
}

export function SidebarDashboard({
  modulos,
  aoMudarModulos,
  filtros,
  aoMudarFiltros,
  membros,
  metricas,
  totalGeral,
}: PropsSidebarDashboard) {
  const [colapsado, setColapsado] = useState(false);

  // Estados para recolher/expandir individualmente as seções da barra lateral
  const [modulosAberto, setModulosAberto] = useState(true);
  const [filtrosAberto, setFiltrosAberto] = useState(true);

  const alternarModulo = (chave: keyof ModulosVisiveisDashboard) => {
    aoMudarModulos({
      ...modulos,
      [chave]: !modulos[chave],
    });
  };

  const selecionarTodos = () => {
    aoMudarModulos({
      visaoGeral: true,
      sla: true,
      tempoMedio: true,
      responsaveis: true,
      criticas: true,
    });
  };

  const temFiltroAtivo =
    filtros.periodo !== 'todos' ||
    filtros.responsavel !== 'todos' ||
    filtros.prioridade !== 'todas' ||
    filtros.status !== 'todos';

  const limparFiltros = () => {
    aoMudarFiltros({
      periodo: 'todos',
      responsavel: 'todos',
      prioridade: 'todas',
      status: 'todos',
      busca: '',
    });
  };

  if (colapsado) {
    return (
      <aside className="w-11 shrink-0 bg-card p-1.5 flex flex-col items-center justify-between transition-all border-0">
        <Button
          variant="ghost"
          size="sm"
          className="size-7 p-0 rounded-md border-0"
          onClick={() => setColapsado(false)}
          title="Expandir barra lateral"
        >
          <IconChevronRight className="size-4" />
        </Button>

        <div className="flex flex-col gap-2.5 items-center text-xs text-muted-foreground">
          <IconChartPie className="size-3.5 text-primary" />
          <IconTarget className="size-3.5 text-emerald-500" />
          <IconClock className="size-3.5 text-blue-500" />
          <IconUsers className="size-3.5 text-amber-500" />
        </div>

        <div />
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 bg-card p-3 flex flex-col justify-between overflow-y-auto space-y-3 transition-all text-xs border-0">
      <div className="space-y-3">
        {/* Cabeçalho da Sidebar */}
        <div className="flex items-center justify-between pb-1.5 border-0">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
            Aba Lateral
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="size-6 p-0 text-muted-foreground hover:text-foreground rounded-md border-0"
            onClick={() => setColapsado(true)}
            title="Recolher toda a barra lateral"
          >
            <IconChevronLeft className="size-3.5" />
          </Button>
        </div>

        {/* 1. SEÇÃO RECOLHÍVEL: MÓDULOS (O que quero ver) */}
        <div className="rounded-md bg-muted/40 overflow-hidden border-0">
          <div
            className="flex items-center justify-between p-2 bg-muted/70 cursor-pointer select-none hover:bg-muted transition-colors border-0"
            onClick={() => setModulosAberto(!modulosAberto)}
            title="Clique para recolher/expandir módulos"
          >
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              {modulosAberto ? (
                <IconChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <IconChevronRight className="size-3.5 text-muted-foreground" />
              )}
              Módulos
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                selecionarTodos();
              }}
              className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
            >
              Todos
            </button>
          </div>

          {modulosAberto && (
            <div className="p-2 space-y-1">
              {/* Visão Geral */}
              <button
                type="button"
                onClick={() => alternarModulo('visaoGeral')}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-sm transition-all text-left cursor-pointer border-0 text-xs',
                  modulos.visaoGeral
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <IconChartPie className="size-3.5" />
                  <span>Demandas</span>
                </div>
                {modulos.visaoGeral && <IconCheck className="size-3" />}
              </button>

              {/* SLA */}
              <button
                type="button"
                onClick={() => alternarModulo('sla')}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-sm transition-all text-left cursor-pointer border-0 text-xs',
                  modulos.sla
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <IconTarget className="size-3.5" />
                  <span>SLA</span>
                </div>
                {modulos.sla && <IconCheck className="size-3" />}
              </button>

              {/* Tempo de Resolução */}
              <button
                type="button"
                onClick={() => alternarModulo('tempoMedio')}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-sm transition-all text-left cursor-pointer border-0 text-xs',
                  modulos.tempoMedio
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <IconClock className="size-3.5" />
                  <span>Tempo Médio</span>
                </div>
                {modulos.tempoMedio && <IconCheck className="size-3" />}
              </button>

              {/* Por Responsável */}
              <button
                type="button"
                onClick={() => alternarModulo('responsaveis')}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-sm transition-all text-left cursor-pointer border-0 text-xs',
                  modulos.responsaveis
                    ? 'bg-slate-700 text-white font-medium'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <IconUsers className="size-3.5" />
                  <span>Por Responsável</span>
                </div>
                {modulos.responsaveis && <IconCheck className="size-3" />}
              </button>

              {/* Demandas Críticas */}
              <button
                type="button"
                onClick={() => alternarModulo('criticas')}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-sm transition-all text-left cursor-pointer border-0 text-xs',
                  modulos.criticas
                    ? 'bg-red-600 text-white font-medium'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <IconShieldExclamation className="size-3.5" />
                  <span>Críticas (≤ 3d)</span>
                </div>
                {modulos.criticas && <IconCheck className="size-3" />}
              </button>
            </div>
          )}
        </div>

        {/* 2. SEÇÃO RECOLHÍVEL: FILTROS */}
        <div className="rounded-md bg-muted/40 overflow-hidden border-0">
          <div
            className="flex items-center justify-between p-2 bg-muted/70 cursor-pointer select-none hover:bg-muted transition-colors border-0"
            onClick={() => setFiltrosAberto(!filtrosAberto)}
            title="Clique para recolher/expandir filtros"
          >
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              {filtrosAberto ? (
                <IconChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <IconChevronRight className="size-3.5 text-muted-foreground" />
              )}
              Filtros
            </span>
            {temFiltroAtivo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  limparFiltros();
                }}
                className="text-[10px] text-destructive hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
              >
                <IconX className="size-2.5" />
                Limpar
              </button>
            )}
          </div>

          {filtrosAberto && (
            <div className="p-2 space-y-2">
              {/* Período */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-medium text-muted-foreground">Período</label>
                <Select
                  value={filtros.periodo}
                  onValueChange={(val) =>
                    aoMudarFiltros({ ...filtros, periodo: val as TipoPeriodoFiltro })
                  }
                >
                  <SelectTrigger size="sm" className="bg-background text-xs h-7 rounded-sm border-0">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-0 bg-popover">
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="7dias">7 dias</SelectItem>
                    <SelectItem value="15dias">15 dias</SelectItem>
                    <SelectItem value="30dias">30 dias</SelectItem>
                    <SelectItem value="mes">Este mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Responsável */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-medium text-muted-foreground">Responsável</label>
                <Select
                  value={filtros.responsavel}
                  onValueChange={(val) => aoMudarFiltros({ ...filtros, responsavel: val })}
                >
                  <SelectTrigger size="sm" className="bg-background text-xs h-7 rounded-sm border-0">
                    <SelectValue placeholder="Responsável" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-0 bg-popover">
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="sem-responsavel" className="text-amber-600 font-medium">
                      Sem responsável (Fora do SLA)
                    </SelectItem>
                    {membros.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nome_completo || m.full_name || m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-medium text-muted-foreground">Prioridade</label>
                <Select
                  value={filtros.prioridade}
                  onValueChange={(val) =>
                    aoMudarFiltros({ ...filtros, prioridade: val as TipoPrioridadeFiltro })
                  }
                >
                  <SelectTrigger size="sm" className="bg-background text-xs h-7 rounded-sm border-0">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-0 bg-popover">
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-medium text-muted-foreground">Status</label>
                <Select
                  value={filtros.status}
                  onValueChange={(val) =>
                    aoMudarFiltros({ ...filtros, status: val as TipoStatusFiltro })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className={cn(
                      'bg-background text-xs h-7 rounded-sm border-0',
                      filtros.status === 'atrasadas' && 'text-red-600 font-bold'
                    )}
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-0 bg-popover">
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                    <SelectItem value="atrasadas" className="text-red-600 font-semibold">
                      Atrasadas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
