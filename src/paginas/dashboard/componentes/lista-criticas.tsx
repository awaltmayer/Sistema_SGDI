import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconCalendarCheck } from '@tabler/icons-react';
import { CORES_DASHBOARD, type DemandaCriticaItem } from '../calculos-dashboard';
import { PainelDashboard } from './painel-dashboard';

const LIMITE_INICIAL = 5;

const ESTILO_URGENCIA: Record<DemandaCriticaItem['tipoUrgencia'], { cor: string; fundo: string }> = {
  atrasada: { cor: CORES_DASHBOARD.atrasado, fundo: CORES_DASHBOARD.atrasadoBg },
  hoje: { cor: CORES_DASHBOARD.atencao, fundo: 'rgba(245, 158, 11, 0.14)' },
  amanha: { cor: CORES_DASHBOARD.aberto, fundo: CORES_DASHBOARD.abertoBg },
  'proximos-dias': { cor: CORES_DASHBOARD.aberto, fundo: CORES_DASHBOARD.abertoBg },
};

function textoPrazoCurto(item: DemandaCriticaItem): string {
  if (item.diasRestantes < 0) return `−${Math.abs(item.diasRestantes)} d`;
  if (item.diasRestantes === 0) return 'Hoje';
  if (item.diasRestantes === 1) return 'Amanhã';
  return `${item.diasRestantes} d`;
}

function nomeResponsavel(item: DemandaCriticaItem): string {
  if (item.semResponsavelForaDoSla) return 'Sem responsável';
  const resp = item.cartao.responsavel ?? item.cartao.assignee;
  return resp?.nome_completo || resp?.full_name || '—';
}

interface PropsListaCriticas {
  demandasCriticas: DemandaCriticaItem[];
}

export function ListaCriticas({ demandasCriticas }: PropsListaCriticas) {
  const [expandida, setExpandida] = useState(false);
  const total = demandasCriticas.length;
  const visiveis = expandida ? demandasCriticas : demandasCriticas.slice(0, LIMITE_INICIAL);

  return (
    <PainelDashboard
      titulo="Críticas"
      extra={
        total > LIMITE_INICIAL && (
          <button
            type="button"
            onClick={() => setExpandida(!expandida)}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {expandida ? 'Ver menos' : `Ver todas (${total})`}
          </button>
        )
      }
    >
      {total === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <IconCalendarCheck className="size-5" />
          <span className="text-xs">Nada crítico agora</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {visiveis.map((item, i) => {
            const estilo = ESTILO_URGENCIA[item.tipoUrgencia];
            return (
              <div key={item.cartao.id}>
                {i > 0 && <div className="h-px bg-border" />}
                <Link
                  to={`/board/${item.cartao.id}`}
                  className="sgdi-dash-critica"
                  title={item.textoPrazo}
                >
                  <span className="flex-1 min-w-0 truncate font-medium text-foreground">
                    {item.cartao.titulo}
                  </span>
                  <span className="sgdi-dash-critica-resp truncate text-muted-foreground">
                    {nomeResponsavel(item)}
                  </span>
                  <span
                    className="sgdi-dash-chip tabular-nums text-foreground"
                    style={{ backgroundColor: estilo.fundo }}
                  >
                    <span className="sgdi-dash-ponto" style={{ backgroundColor: estilo.cor }} />
                    {textoPrazoCurto(item)}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </PainelDashboard>
  );
}
