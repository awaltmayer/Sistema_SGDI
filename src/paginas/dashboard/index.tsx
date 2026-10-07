import { useMemo, useState } from 'react';
import {
  IconChartPie,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconRefresh,
  IconLayersSubtract,
  IconSearch,
  IconUsers,
  IconTarget,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { BarraSuperiorQuadro } from '@/paginas/quadro/componentes/barra-superior-quadro';
import { useDataProvider } from '@/lib/provedor-dados';
import {
  type FiltrosDashboard,
  aplicarFiltrosDashboard,
  calcularMetricasDemandas,
  calcularMetricasSla,
  obterDemandasCriticas,
  calcularDemandasPorResponsavel,
  calcularTempoMedioResolucao,
  calcularTempoMedioPorPrioridade,
} from './calculos-dashboard';
import { SidebarDashboard, type ModulosVisiveisDashboard } from './componentes/sidebar-dashboard';
import { GraficoPizzaDemandas } from './componentes/grafico-pizza-demandas';
import { GraficoSlaUrgencia } from './componentes/grafico-sla-urgencia';
import { TabelaDemandasCriticas } from './componentes/tabela-demandas-criticas';
import { PainelPorResponsavel } from './componentes/painel-por-responsavel';
import { GraficoBarrasResponsaveis } from './componentes/grafico-barras-responsaveis';
import { SeletorUsuariosDemandas } from './componentes/seletor-usuarios-demandas';
import { CardTempoMedio } from './componentes/card-tempo-medio';
import { GraficoTempoMedio } from './componentes/grafico-tempo-medio';
import { BotaoExportarDashboard } from './componentes/botao-exportar-dashboard';
import { Button } from '@/componentes/base/botao';
import { Input } from '@/componentes/ui/campo-texto';
import './dashboard.css';

const CHAVE_STORAGE_USUARIOS_SELECIONADOS = 'sgdi-dashboard-usuarios-selecionados-v2';

export default function PaginaDashboard() {
  const queryClient = useQueryClient();
  const { useCards, useTeamMembers, useCurrentUser } = useDataProvider();

  const { data: cartoes = [], isLoading: carregandoCartoes } = useCards();
  const { data: membros = [], isLoading: carregandoMembros } = useTeamMembers();
  const { data: usuarioAtual } = useCurrentUser();

  const [atualizando, setAtualizando] = useState(false);

  // Módulos visíveis selecionados na barra lateral esquerda (O que quero ver)
  const [modulos, setModulos] = useState<ModulosVisiveisDashboard>({
    visaoGeral: true,
    sla: true,
    tempoMedio: true,
    responsaveis: true,
    criticas: true,
  });

  // Filtros centralizados
  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    periodo: 'todos',
    responsavel: 'todos',
    prioridade: 'todas',
    status: 'todos',
    busca: '',
  });

  // Usuários selecionados para visualização na seção "Demandas por Usuário"
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<string[] | null>(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE_USUARIOS_SELECIONADOS);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  const lidarComMudarUsuariosSelecionados = (novos: string[]) => {
    setUsuariosSelecionados(novos);
    try {
      localStorage.setItem(CHAVE_STORAGE_USUARIOS_SELECIONADOS, JSON.stringify(novos));
    } catch {
      /* ignore */
    }
  };

  // Aplicação reativa dos filtros
  const cartoesFiltrados = useMemo(() => {
    return aplicarFiltrosDashboard(cartoes, filtros, membros);
  }, [cartoes, filtros, membros]);

  // Métricas calculadas
  const metricas = useMemo(
    () => calcularMetricasDemandas(cartoesFiltrados),
    [cartoesFiltrados]
  );

  const metricasSla = useMemo(
    () => calcularMetricasSla(cartoesFiltrados),
    [cartoesFiltrados]
  );

  const demandasCriticas = useMemo(
    () => obterDemandasCriticas(cartoesFiltrados, membros, usuarioAtual, 3),
    [cartoesFiltrados, membros, usuarioAtual]
  );

  const cargaResponsaveis = useMemo(
    () => calcularDemandasPorResponsavel(cartoesFiltrados, membros),
    [cartoesFiltrados, membros]
  );

  // Todos os IDs disponíveis para o seletor
  const todosIdsResponsaveis = useMemo(() => {
    const ids = cargaResponsaveis.responsaveis.map((r) => r.id);
    if (cargaResponsaveis.totalNaoAtribuidas > 0) ids.push('sem-responsavel');
    return ids;
  }, [cargaResponsaveis]);

  // Se o usuário ainda não personalizou a seleção, todos aparecem selecionados
  const usuariosAtivos = useMemo(() => {
    if (usuariosSelecionados === null) {
      return todosIdsResponsaveis;
    }
    return usuariosSelecionados;
  }, [usuariosSelecionados, todosIdsResponsaveis]);

  // Filtragem estrita dos responsáveis selecionados pelo usuário
  const responsaveisFiltrados = useMemo(() => {
    if (usuariosAtivos.length === 0) return [];
    return cargaResponsaveis.responsaveis.filter((r) => usuariosAtivos.includes(r.id));
  }, [cargaResponsaveis.responsaveis, usuariosAtivos]);

  const totalNaoAtribuidasFiltradas = useMemo(() => {
    return usuariosAtivos.includes('sem-responsavel')
      ? cargaResponsaveis.totalNaoAtribuidas
      : 0;
  }, [cargaResponsaveis.totalNaoAtribuidas, usuariosAtivos]);

  const totalAbertasFiltradas = useMemo(() => {
    const totalMembros = responsaveisFiltrados.reduce((acc, r) => acc + r.totalAbertas, 0);
    return totalMembros + totalNaoAtribuidasFiltradas;
  }, [responsaveisFiltrados, totalNaoAtribuidasFiltradas]);

  const metricasTempo = useMemo(
    () => calcularTempoMedioResolucao(cartoesFiltrados),
    [cartoesFiltrados]
  );

  const tempoPorPrioridade = useMemo(
    () => calcularTempoMedioPorPrioridade(cartoesFiltrados),
    [cartoesFiltrados]
  );

  const lidarComAtualizar = async () => {
    setAtualizando(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards'] }),
        queryClient.invalidateQueries({ queryKey: ['team-members'] }),
      ]);
    } finally {
      setTimeout(() => setAtualizando(false), 400);
    }
  };

  const carregandoGeral = carregandoCartoes || carregandoMembros;

  return (
    <div className="sgdi-dashboard-container">
      {/* Barra superior de navegação com as abas "Quadro" e "Dashboard" */}
      <BarraSuperiorQuadro />

      {/* Corpo com Aba Lateral Esquerda e Área Principal Limpa */}
      <div className="sgdi-dashboard-corpo">
        {/* Aba Lateral Esquerda: Seletor de Módulos (O que quero ver) e Filtros Concentrados */}
        <SidebarDashboard
          modulos={modulos}
          aoMudarModulos={setModulos}
          filtros={filtros}
          aoMudarFiltros={setFiltros}
          membros={membros}
          metricas={metricas}
          totalGeral={cartoes.length}
        />

        {/* Área Principal de Exibição */}
        <main className="sgdi-dashboard-main">
          {/* Cabeçalho Minimalista com Busca Rápida e Atualização */}
          <div className="sgdi-dashboard-cabecalho">
            <div className="flex items-center gap-2">
              <h1 className="sgdi-dashboard-titulo flex items-center gap-2">
                <IconChartPie className="size-5 text-primary" />
                Dashboard
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-muted text-foreground font-bold border-0">
                {cartoesFiltrados.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-44 sm:w-56">
                <IconSearch className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar demandas..."
                  value={filtros.busca || ''}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-8 h-7 text-xs bg-card rounded-sm border-0"
                />
                {filtros.busca && (
                  <button
                    type="button"
                    onClick={() => setFiltros({ ...filtros, busca: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={lidarComAtualizar}
                disabled={atualizando || carregandoGeral}
                className="h-7 px-2.5 text-xs gap-1.5 rounded-sm border-0 bg-card hover:bg-muted"
                title="Recarregar dados"
              >
                <IconRefresh className={`size-3.5 ${atualizando ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>

              <BotaoExportarDashboard
                cartoes={cartoesFiltrados}
                filtros={filtros}
                membros={membros}
                totalGeral={cartoes.length}
              />
            </div>
          </div>

          {/* 4 KPIs Flat, Lisos e Sem Bordas no Topo */}
          <div className="sgdi-dashboard-kpis-grid">
            {/* Total */}
            <div className="sgdi-dashboard-kpi-card border-0">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Total</span>
                <IconLayersSubtract className="size-3.5 text-primary" />
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {metricas.total}
              </div>
            </div>

            {/* Abertas */}
            <div className="sgdi-dashboard-kpi-card border-0">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Abertas</span>
                <IconClock className="size-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {metricas.totalAbertas}{' '}
                <span className="text-[11px] font-normal text-muted-foreground font-sans">
                  ({metricas.percentualAbertas}%)
                </span>
              </div>
            </div>

            {/* Concluídas */}
            <div className="sgdi-dashboard-kpi-card border-0">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">Concluídas</span>
                <IconCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {metricas.concluidas}{' '}
                <span className="text-[11px] font-normal text-muted-foreground font-sans">
                  ({metricas.percentualConcluidas}%)
                </span>
              </div>
            </div>

            {/* Atrasadas (SEMPRE EM VERMELHO SÓLIDO) */}
            <div className="sgdi-dashboard-kpi-card border-0 bg-red-500/10">
              <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1">
                <span className="text-xs font-bold">Atrasadas</span>
                <IconAlertTriangle className="size-3.5 text-red-600" />
              </div>
              <div className="text-xl font-bold font-mono text-red-600 dark:text-red-400">
                {metricas.atrasadas}{' '}
                <span className="text-[11px] font-bold text-red-600/90 font-sans">
                  ({metricas.percentualAtrasadas}%)
                </span>
              </div>
            </div>
          </div>

          {/* Módulos Condicionalmente Renderizados com Divisões Claras */}
          <div className="space-y-6">
            {/* 1. Módulo: Visão Geral & SLA */}
            {(modulos.visaoGeral || modulos.sla) && (
              <section className="space-y-3">
                <div className="sgdi-dashboard-modulo-cabecalho">
                  <div className="sgdi-dashboard-modulo-titulo">
                    <IconChartPie className="size-3.5 text-primary" />
                    <span>Visão Geral & SLA</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {modulos.visaoGeral && (
                    <div className={modulos.sla ? 'lg:col-span-7' : 'lg:col-span-12'}>
                      <GraficoPizzaDemandas metricas={metricas} />
                    </div>
                  )}
                  {modulos.sla && (
                    <div className={modulos.visaoGeral ? 'lg:col-span-5' : 'lg:col-span-12'}>
                      <GraficoSlaUrgencia metricasSla={metricasSla} />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Separador visual claro se houver próximo módulo */}
            {(modulos.visaoGeral || modulos.sla) && (modulos.tempoMedio || modulos.responsaveis || modulos.criticas) && (
              <div className="sgdi-dashboard-modulo-divisor" />
            )}

            {/* 2. Módulo: Tempo Médio de Resolução */}
            {modulos.tempoMedio && (
              <section className="space-y-3">
                <div className="sgdi-dashboard-modulo-cabecalho">
                  <div className="sgdi-dashboard-modulo-titulo">
                    <IconClock className="size-3.5 text-blue-600" />
                    <span>Tempo Médio de Resolução</span>
                  </div>
                </div>

                <CardTempoMedio metricasTempo={metricasTempo} />
                <GraficoTempoMedio
                  metricasTempo={metricasTempo}
                  tempoPorPrioridade={tempoPorPrioridade}
                />
              </section>
            )}

            {/* Separador visual claro se houver próximo módulo */}
            {modulos.tempoMedio && (modulos.responsaveis || modulos.criticas) && (
              <div className="sgdi-dashboard-modulo-divisor" />
            )}

            {/* 3. Módulo: Demandas por Usuário (Com Seletor Vertical Pesquisável no Cabeçalho) */}
            {modulos.responsaveis && (
              <section className="space-y-3">
                <div className="sgdi-dashboard-modulo-cabecalho flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="sgdi-dashboard-modulo-titulo">
                    <IconUsers className="size-3.5 text-amber-600" />
                    <span>Demandas por Usuário</span>
                  </div>

                  {/* Seletor Vertical Pesquisável idêntico ao SeletorSolicitante do Quadro */}
                  <SeletorUsuariosDemandas
                    todosItens={cargaResponsaveis.responsaveis}
                    totalNaoAtribuidas={cargaResponsaveis.totalNaoAtribuidas}
                    selecionados={usuariosAtivos}
                    aoMudarSelecao={lidarComMudarUsuariosSelecionados}
                  />
                </div>

                {usuariosAtivos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground bg-card rounded-md border-0 space-y-2">
                    <div className="size-8 rounded-sm bg-primary text-primary-foreground mx-auto flex items-center justify-center font-bold">
                      <IconUsers className="size-4" />
                    </div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Nenhum usuário selecionado
                    </h4>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Clique no seletor acima para pesquisar e escolher os membros que deseja visualizar.
                    </p>
                  </div>
                ) : (
                  <>
                    <GraficoBarrasResponsaveis
                      responsaveis={responsaveisFiltrados}
                      totalDemandasAbertas={totalAbertasFiltradas}
                      totalNaoAtribuidas={totalNaoAtribuidasFiltradas}
                    />
                    <PainelPorResponsavel
                      responsaveis={responsaveisFiltrados}
                      totalDemandasAbertas={totalAbertasFiltradas}
                      totalNaoAtribuidas={totalNaoAtribuidasFiltradas}
                    />
                  </>
                )}
              </section>
            )}

            {/* Separador visual claro se houver próximo módulo */}
            {modulos.responsaveis && modulos.criticas && (
              <div className="sgdi-dashboard-modulo-divisor" />
            )}

            {/* 4. Módulo: Demandas Críticas */}
            {modulos.criticas && (
              <section className="space-y-3">
                <div className="sgdi-dashboard-modulo-cabecalho">
                  <div className="sgdi-dashboard-modulo-titulo">
                    <IconAlertTriangle className="size-3.5 text-red-600" />
                    <span>Demandas Críticas (≤ 3 dias)</span>
                  </div>
                </div>

                <TabelaDemandasCriticas demandasCriticas={demandasCriticas} />
              </section>
            )}

            {/* Mensagem se nenhum módulo estiver marcado */}
            {!modulos.visaoGeral &&
              !modulos.sla &&
              !modulos.tempoMedio &&
              !modulos.responsaveis &&
              !modulos.criticas && (
                <div className="p-8 text-center text-xs text-muted-foreground bg-card rounded-md border-0">
                  Nenhum módulo selecionado para visualização. Use a barra lateral esquerda para marcar o que deseja ver.
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

export const DashboardPage = PaginaDashboard;
