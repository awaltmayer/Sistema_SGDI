import { useMemo } from 'react';
import {
  IconClipboardList,
  IconCalendar,
  IconUsers,
  IconArrowsExchange,
} from '@tabler/icons-react';
import type { LogAuditoria } from '@/tipos/auditoria';

interface PropsMetricasLogs {
  logs: LogAuditoria[];
}

export function MetricasLogs({ logs }: PropsMetricasLogs) {
  const metricas = useMemo(() => {
    const total = logs.length;

    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);
    const hojeMs = hojeInicio.getTime();

    let hojeQtd = 0;
    let movimentacoesQtd = 0;
    const usuariosSet = new Set<string>();

    for (const log of logs) {
      if (new Date(log.criado_em).getTime() >= hojeMs) {
        hojeQtd++;
      }
      if (log.acao === 'MOVIMENTACAO' || log.acao === 'STATUS' || log.acao === 'EXCLUSAO') {
        movimentacoesQtd++;
      }
      if (log.usuario_nome) {
        usuariosSet.add(log.usuario_nome);
      }
    }

    return {
      total,
      hoje: hojeQtd,
      usuarios: usuariosSet.size,
      movimentacoes: movimentacoesQtd,
    };
  }, [logs]);

  return (
    <div className="sgdi-logs-kpis-grid">
      <div className="sgdi-logs-kpi-card">
        <div>
          <div className="sgdi-logs-kpi-valor">{metricas.total}</div>
          <div className="sgdi-logs-kpi-rotulo">Eventos Registrados</div>
        </div>
        <div className="sgdi-logs-kpi-icone">
          <IconClipboardList className="size-5" />
        </div>
      </div>

      <div className="sgdi-logs-kpi-card">
        <div>
          <div className="sgdi-logs-kpi-valor">{metricas.hoje}</div>
          <div className="sgdi-logs-kpi-rotulo">Ações Hoje</div>
        </div>
        <div className="sgdi-logs-kpi-icone">
          <IconCalendar className="size-5" />
        </div>
      </div>

      <div className="sgdi-logs-kpi-card">
        <div>
          <div className="sgdi-logs-kpi-valor">{metricas.usuarios}</div>
          <div className="sgdi-logs-kpi-rotulo">Usuários Ativos</div>
        </div>
        <div className="sgdi-logs-kpi-icone">
          <IconUsers className="size-5" />
        </div>
      </div>

      <div className="sgdi-logs-kpi-card">
        <div>
          <div className="sgdi-logs-kpi-valor">{metricas.movimentacoes}</div>
          <div className="sgdi-logs-kpi-rotulo">Transições de Estado</div>
        </div>
        <div className="sgdi-logs-kpi-icone">
          <IconArrowsExchange className="size-5" />
        </div>
      </div>
    </div>
  );
}
