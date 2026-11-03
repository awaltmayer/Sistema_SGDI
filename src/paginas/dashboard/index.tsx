import { useMemo, useState } from 'react';
import { IconChartPie, IconRefresh, IconSearch } from '@tabler/icons-react';
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
  calcularTendenciaSemanal,
  calcularIdadeAbertas,
} from './calculos-dashboard';
import { MODULOS_PADRAO, type ModulosVisiveisDashboard } from './modulos-dashboard';
import { SidebarDashboard } from './componentes/sidebar-dashboard';
import { KpisDashboard } from './componentes/kpis-dashboard';
import { SecaoSituacao } from './componentes/secao-situacao';
import { CardSla } from './componentes/card-sla';
import { CargaResponsaveis } from './componentes/carga-responsaveis';
import { TempoMedioPrioridade } from './componentes/tempo-medio-prioridade';
import { ListaCriticas } from './componentes/lista-criticas';
import {
  GraficoFluxoSemanal,
  GraficoBacklog,
  GraficoSlaSemanal,
  GraficoIdadeAbertas,
} from './componentes/graficos-tendencia';
import { SeletorUsuariosDemandas } from './componentes/seletor-usuarios-demandas';
import { BotaoExportarDashboard } from './componentes/botao-exportar-dashboard';
import { Button } from '@/componentes/base/botao';
import { Input } from '@/componentes/ui/campo-texto';
import './dashboard.css';

const CHAVE_STORAGE_USUARIOS_SELECIONADOS = 'sgdi-dashboard-usuarios-selecionados-v2';
const CHAVE_STORAGE_MODULOS = 'sgdi-dashboard-modulos-v1';
const SEMANAS_TENDENCIA = 8;

// Cartões que dividem uma linha (ver .sgdi-dash-* em dashboard.css): o largo ocupa o que sobra
const CLASSE_PAINEL_LARGO = 'sgdi-dash-painel-largo';
const CLASSE_PAINEL = 'sgdi-dash-painel';

export default function PaginaDashboard() {
  const queryClient = useQueryClient();
  const { useCards, useTeamMembers, useCurrentUser } = useDataProvider();

  const { data: cartoes = [], isLoading: carregandoCartoes } = useCards();
  const { data: membros = [], isLoading: carregandoMembros } = useTeamMembers();
  const { data: usuarioAtual } = useCurrentUser();

  const [atualizando, setAtualizando] = useState(false);

  // Seções visíveis selecionadas na barra lateral esquerda (O que quero ver)
  const [modulos, setModulos] = useState<ModulosVisiveisDashboard>(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE_MODULOS);
      if (salvo) return { ...MODULOS_PADRAO, ...JSON.parse(salvo) };
    } catch {
      /* ignore */
    }
    return MODULOS_PADRAO;
  });

  const lidarComMudarModulos = (novos: ModulosVisiveisDashboard) => {
    setModulos(novos);
    try {
      localStorage.setItem(CHAVE_STORAGE_MODULOS, JSON.stringify(novos));
    } catch {
      /* ignore */
    }
  };

  // Filtros centralizados
  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    periodo: 'todos',
    responsavel: 'todos',
    prioridade: 'todas',
    status: 'todos',
    busca: '',
  });

  // Usuários selecionados para visualização na seção "Por responsável"
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

  // As tendências já têm sua própria janela de semanas, então ignoram o filtro de período
  const cartoesTendencia = useMemo(() => {
    return aplicarFiltrosDashboard(cartoes, { ...filtros, periodo: 'todos' }, membros);
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
    return cargaResponsaveis.responsaveis.filter(
      (r) => usuariosAtivos.includes(r.id) && r.totalAbertas > 0
    );
  }, [cargaResponsaveis.responsaveis, usuariosAtivos]);

  const totalNaoAtribuidasFiltradas = useMemo(() => {
    return usuariosAtivos.includes('sem-responsavel')
      ? cargaResponsaveis.totalNaoAtribuidas
      : 0;
  }, [cargaResponsaveis.totalNaoAtribuidas, usuariosAtivos]);

  const metricasTempo = useMemo(
    () => calcularTempoMedioResolucao(cartoesFiltrados),
    [cartoesFiltrados]
  );

  const tempoPorPrioridade = useMemo(
    () => calcularTempoMedioPorPrioridade(cartoesFiltrados),
    [cartoesFiltrados]
  );

  const tendenciaSemanal = useMemo(
    () => calcularTendenciaSemanal(cartoesTendencia, SEMANAS_TENDENCIA),
    [cartoesTendencia]
  );

  const idadeAbertas = useMemo(
    () => calcularIdadeAbertas(cartoesFiltrados),
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
  const temTendencia =
    modulos.fluxoSemanal || modulos.backlog || modulos.slaSemanal || modulos.idadeAbertas;
  const nenhumModulo = !Object.values(modulos).some(Boolean);

  return (
    <div className="sgdi-dashboard-container">
      {/* Barra superior de navegação com as abas "Quadro" e "Dashboard" */}
      <BarraSuperiorQuadro />

      {/* Corpo com Aba Lateral Esquerda e Área Principal */}
      <div className="sgdi-dashboard-corpo">
        <SidebarDashboard
          modulos={modulos}
          aoMudarModulos={lidarComMudarModulos}
          filtros={filtros}
          aoMudarFiltros={setFiltros}
          membros={membros}
        />

        <main className="sgdi-dashboard-main">
          {/* Cabeçalho com Busca Rápida, Atualização e Exportação */}
          <div className="sgdi-dashboard-cabecalho">
            <h1 className="sgdi-dashboard-titulo flex items-center gap-2">
              <IconChartPie className="size-5" />
              Dashboard
            </h1>

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
                    aria-label="Limpar busca"
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
                aria-label="Atualizar"
              >
                <IconRefresh className={`size-3.5 ${atualizando ? 'animate-spin' : ''}`} />
              </Button>

              <BotaoExportarDashboard
                cartoes={cartoesFiltrados}
                filtros={filtros}
                membros={membros}
                totalGeral={cartoes.length}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* ── Visão geral ── */}
            {modulos.indicadores && <KpisDashboard metricas={metricas} metricasSla={metricasSla} />}

            {(modulos.situacao || modulos.sla) && (
              <div className="sgdi-dash-linha">
                {modulos.situacao && <SecaoSituacao metricas={metricas} className={CLASSE_PAINEL_LARGO} />}
                {modulos.sla && <CardSla metricasSla={metricasSla} className={CLASSE_PAINEL} />}
              </div>
            )}

            {(modulos.responsaveis || modulos.tempoMedio) && (
              <div className="sgdi-dash-linha">
                {modulos.responsaveis && (
                  <CargaResponsaveis
                    className={CLASSE_PAINEL_LARGO}
                    responsaveis={responsaveisFiltrados}
                    totalNaoAtribuidas={totalNaoAtribuidasFiltradas}
                    seletor={
                      <SeletorUsuariosDemandas
                        todosItens={cargaResponsaveis.responsaveis}
                        totalNaoAtribuidas={cargaResponsaveis.totalNaoAtribuidas}
                        selecionados={usuariosAtivos}
                        aoMudarSelecao={lidarComMudarUsuariosSelecionados}
                      />
                    }
                  />
                )}
                {modulos.tempoMedio && (
                  <TempoMedioPrioridade
                    className={CLASSE_PAINEL}
                    metricasTempo={metricasTempo}
                    tempoPorPrioridade={tempoPorPrioridade}
                  />
                )}
              </div>
            )}

            {modulos.criticas && <ListaCriticas demandasCriticas={demandasCriticas} />}

            {/* ── Tendências ── */}
            {temTendencia && (
              <div className="sgdi-dash-secao-titulo">
                <h2 className="sgdi-dashboard-modulo-titulo">Tendências · {SEMANAS_TENDENCIA} semanas</h2>
                <div />
              </div>
            )}

            {(modulos.fluxoSemanal || modulos.backlog) && (
              <div className="sgdi-dash-linha">
                {modulos.fluxoSemanal && (
                  <GraficoFluxoSemanal semanas={tendenciaSemanal} className={CLASSE_PAINEL} />
                )}
                {modulos.backlog && <GraficoBacklog semanas={tendenciaSemanal} className={CLASSE_PAINEL} />}
              </div>
            )}

            {(modulos.slaSemanal || modulos.idadeAbertas) && (
              <div className="sgdi-dash-linha">
                {modulos.slaSemanal && (
                  <GraficoSlaSemanal semanas={tendenciaSemanal} className={CLASSE_PAINEL} />
                )}
                {modulos.idadeAbertas && (
                  <GraficoIdadeAbertas faixas={idadeAbertas} className={CLASSE_PAINEL} />
                )}
              </div>
            )}

            {nenhumModulo && (
              <div className="p-6 text-center text-xs text-muted-foreground bg-card rounded-md">
                Nenhuma seção selecionada.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export const DashboardPage = PaginaDashboard;
