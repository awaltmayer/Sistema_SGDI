import type { ReactNode } from 'react';
import { cn } from '@/lib/utilitarios';

interface PropsPainelDashboard {
  titulo: string;
  extra?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Cartão base de cada seção do dashboard: título curto + conteúdo.
 */
export function PainelDashboard({ titulo, extra, className, children }: PropsPainelDashboard) {
  return (
    <section className={cn('bg-card rounded-md p-4 flex flex-col gap-4 min-w-0', className)}>
      <div className="sgdi-dash-painel-cabecalho">
        <h2 className="text-sm font-semibold text-foreground">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

interface PropsItemLegenda {
  cor: string;
  label: string;
  valor?: number;
}

export function ItemLegenda({ cor, label, valor }: PropsItemLegenda) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="sgdi-dash-amostra" style={{ backgroundColor: cor }} />
      {label}
      {valor !== undefined && <b className="text-foreground font-semibold">{valor}</b>}
    </span>
  );
}

export interface SegmentoBarra {
  label: string;
  valor: number;
  cor: string;
}

interface PropsBarraEmpilhada {
  segmentos: SegmentoBarra[];
  /** Valor que representa 100% da largura (padrão: soma dos segmentos) */
  escala?: number;
  altura?: number;
}

/**
 * Barra horizontal empilhada com 2px de respiro entre os segmentos.
 */
export function BarraEmpilhada({ segmentos, escala, altura = 14 }: PropsBarraEmpilhada) {
  const visiveis = segmentos.filter((s) => s.valor > 0);
  const total = escala ?? visiveis.reduce((acc, s) => acc + s.valor, 0);

  return (
    <div className="sgdi-dash-barra" style={{ height: altura }}>
      {total === 0 || visiveis.length === 0 ? (
        <div className="bg-muted" style={{ width: '100%' }} />
      ) : (
        visiveis.map((s) => (
          <div
            key={s.label}
            title={`${s.label}: ${s.valor}`}
            style={{ width: `${(s.valor / total) * 100}%`, backgroundColor: s.cor }}
          />
        ))
      )}
    </div>
  );
}
