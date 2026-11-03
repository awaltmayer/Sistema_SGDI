import type { ReactNode } from 'react';
import { IconUsers } from '@tabler/icons-react';
import { CORES_DASHBOARD, type CargaResponsavelItem } from '../calculos-dashboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { BarraEmpilhada, PainelDashboard } from './painel-dashboard';

interface PropsCargaResponsaveis {
  responsaveis: CargaResponsavelItem[];
  totalNaoAtribuidas: number;
  /** Seletor de usuários exibido no cabeçalho */
  seletor?: ReactNode;
  className?: string;
}

export function CargaResponsaveis({
  responsaveis,
  totalNaoAtribuidas,
  seletor,
  className,
}: PropsCargaResponsaveis) {
  const escala = Math.max(1, totalNaoAtribuidas, ...responsaveis.map((r) => r.totalAbertas));
  const vazio = responsaveis.length === 0 && totalNaoAtribuidas === 0;

  return (
    <PainelDashboard titulo="Por responsável" extra={seletor} className={className}>
      {vazio ? (
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <IconUsers className="size-5" />
          <span className="text-xs">Nenhum usuário selecionado</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {responsaveis.map((r) => (
            <div key={r.id} className="sgdi-dash-linha-barra">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="size-6 text-xs shrink-0">
                  {r.avatarUrl && <AvatarImage src={r.avatarUrl} alt={r.nome} />}
                  <AvatarFallback className="bg-muted text-foreground font-semibold">
                    {r.iniciais}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-foreground" title={r.nome}>
                  {r.nome}
                </span>
              </div>
              <BarraEmpilhada
                escala={escala}
                segmentos={[
                  { label: 'No prazo', valor: r.totalAbertas - r.atrasadas, cor: CORES_DASHBOARD.aberto },
                  { label: 'Atrasadas', valor: r.atrasadas, cor: CORES_DASHBOARD.atrasado },
                ]}
              />
              <b className="tabular-nums text-foreground">{r.totalAbertas}</b>
            </div>
          ))}

          {totalNaoAtribuidas > 0 && (
            <div className="sgdi-dash-linha-barra">
              <span className="truncate text-muted-foreground">Sem responsável</span>
              <BarraEmpilhada
                escala={escala}
                segmentos={[
                  { label: 'Fora do SLA', valor: totalNaoAtribuidas, cor: CORES_DASHBOARD.foraDoSla },
                ]}
              />
              <b className="tabular-nums text-foreground">{totalNaoAtribuidas}</b>
            </div>
          )}
        </div>
      )}
    </PainelDashboard>
  );
}
