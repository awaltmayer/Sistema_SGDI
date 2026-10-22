import { useState, useMemo } from 'react';
import {
  IconDownload,
  IconRefresh,
  IconFileSpreadsheet,
  IconCode,
} from '@tabler/icons-react';
import { BarraSuperiorQuadro } from '@/paginas/quadro/componentes/barra-superior-quadro';
import { useDataProvider } from '@/lib/provedor-dados';
import type { LogAuditoria, FiltrosLogs } from '@/tipos/auditoria';
import { exportarLogsCSV, exportarLogsJSON } from '@/lib/auditoria/servico-auditoria';
import { MetricasLogs } from './componentes/metricas-logs';
import { FiltrosLogs as PainelFiltros } from './componentes/filtros-logs';
import { TabelaLogs } from './componentes/tabela-logs';
import { ModalDetalhesLog } from './componentes/modal-detalhes-log';
import { Button } from '@/componentes/base/botao';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/componentes/ui/menu-suspenso';
import './logs.css';

export default function PaginaLogs() {
  const { useAuditLogs } = useDataProvider();

  const [filtros, setFiltros] = useState<FiltrosLogs>({
    termoBusca: '',
    acao: undefined,
    entidade: undefined,
    periodo: 'todos',
  });

  const [logSelecionado, setLogSelecionado] = useState<LogAuditoria | null>(null);

  // Consulta de logs com os filtros ativos
  const { data: logs = [], isLoading, refetch } = useAuditLogs(filtros);

  const temFiltrosAtivos = useMemo(() => {
    return Boolean(
      (filtros.termoBusca && filtros.termoBusca.trim() !== '') ||
      (filtros.acao && filtros.acao !== 'todas') ||
      (filtros.entidade && filtros.entidade !== 'todas') ||
      (filtros.periodo && filtros.periodo !== 'todos')
    );
  }, [filtros]);

  const lidarComLimparFiltros = () => {
    setFiltros({
      termoBusca: '',
      acao: undefined,
      entidade: undefined,
      periodo: 'todos',
    });
  };

  return (
    <div className="sgdi-logs-container">
      {/* Barra de Navegação Superior (Quadro, Dashboard, Logs) */}
      <BarraSuperiorQuadro />

      {/* Conteúdo Principal da Auditoria */}
      <main className="sgdi-logs-main">
        {/* Cabeçalho da Página com Ações de Exportação */}
        <div className="sgdi-logs-cabecalho">
          <div>
            <h1 className="sgdi-logs-titulo">Logs de Auditoria</h1>
            <p className="sgdi-logs-subtitulo">
              Histórico e rastreabilidade das operações executadas no sistema.
            </p>
          </div>

          <div className="sgdi-logs-acoes-cabecalho">
            {/* Botão de Atualizar Registros */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-8 gap-1.5 text-xs"
              title="Atualizar registros de log"
            >
              <IconRefresh className="size-3.5" />
              <span>Atualizar</span>
            </Button>

            {/* Menu de Exportação para Auditoria */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  title="Exportar logs para auditoria"
                >
                  <IconDownload className="size-3.5" />
                  <span>Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem
                  onClick={() => exportarLogsCSV(logs)}
                  className="gap-2 cursor-pointer"
                >
                  <IconFileSpreadsheet className="size-4 text-emerald-600" />
                  <span>Exportar Planilha (CSV)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportarLogsJSON(logs)}
                  className="gap-2 cursor-pointer"
                >
                  <IconCode className="size-4 text-blue-600" />
                  <span>Exportar Técnico (JSON)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Métricas e Contadores Resumidos */}
        <MetricasLogs logs={logs} />

        {/* Barra de Filtros e Busca */}
        <PainelFiltros
          filtros={filtros}
          aoMudarFiltros={setFiltros}
          aoLimparFiltros={lidarComLimparFiltros}
          temFiltrosAtivos={temFiltrosAtivos}
        />

        {/* Tabela de Eventos Auditados */}
        {isLoading ? (
          <div className="sgdi-logs-tabela-card p-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs">Carregando eventos de auditoria...</span>
          </div>
        ) : (
          <TabelaLogs
            logs={logs}
            aoSelecionarLog={setLogSelecionado}
            aoLimparFiltros={temFiltrosAtivos ? lidarComLimparFiltros : undefined}
          />
        )}

        {/* Modal de Detalhes Técnicos do Log */}
        <ModalDetalhesLog
          log={logSelecionado}
          aoFechar={() => setLogSelecionado(null)}
        />
      </main>
    </div>
  );
}

export const LogsPage = PaginaLogs;
