import type { CSSProperties } from 'react';
import {
  CORES_DASHBOARD,
  formatarNumero,
  META_SLA,
  type FaixaIdadeAbertas,
  type PontoTendenciaSemanal,
} from '../calculos-dashboard';
import { ItemLegenda, PainelDashboard } from './painel-dashboard';

// ── Gráfico de Linha (SVG) ─────────────────────────────────────────────

const LARGURA = 620;
const ALTURA = 210;
const X_INICIO = 44;
const X_FIM = 600;
const Y_TOPO = 20;
const Y_BASE = 180;

interface PontoLinha {
  label: string;
  valor: number | null;
}

interface PropsGraficoLinha {
  pontos: PontoLinha[];
  min: number;
  max: number;
  marcas: number[];
  cor: string;
  formatar: (valor: number) => string;
  descricao: string;
  meta?: number;
  area?: boolean;
}

function GraficoLinha({ pontos, min, max, marcas, cor, formatar, descricao, meta, area }: PropsGraficoLinha) {
  const passo = pontos.length > 1 ? (X_FIM - X_INICIO) / (pontos.length - 1) : 0;
  const x = (i: number) => X_INICIO + i * passo;
  const y = (v: number) => Y_BASE - ((Math.min(max, Math.max(min, v)) - min) / (max - min || 1)) * (Y_BASE - Y_TOPO);

  const validos = pontos
    .map((p, i) => ({ ...p, i }))
    .filter((p): p is { label: string; valor: number; i: number } => p.valor !== null);
  const linha = validos.map((p) => `${x(p.i)},${y(p.valor)}`).join(' ');
  const ultimo = validos[validos.length - 1];
  const passoRotulo = Math.max(1, Math.ceil(pontos.length / 4));

  return (
    <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="w-full h-auto" role="img" aria-label={descricao}>
      {marcas.map((m) => (
        <g key={m}>
          <line x1={X_INICIO} x2={X_FIM} y1={y(m)} y2={y(m)} stroke="var(--color-border)" strokeWidth="1" />
          <text x={X_INICIO - 10} y={y(m) + 4} textAnchor="end" fontSize="12" fill="var(--color-muted-foreground)">
            {formatar(m)}
          </text>
        </g>
      ))}

      {meta !== undefined && (
        <line
          x1={X_INICIO}
          x2={X_FIM}
          y1={y(meta)}
          y2={y(meta)}
          stroke="var(--color-foreground)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          opacity="0.7"
        >
          <title>{`Meta ${formatar(meta)}`}</title>
        </line>
      )}

      {area && validos.length > 1 && (
        <path
          d={`M${x(validos[0].i)} ${Y_BASE} L${linha.split(' ').join(' L')} L${x(ultimo.i)} ${Y_BASE} Z`}
          fill={cor}
          opacity="0.12"
        />
      )}

      {validos.length > 1 && (
        <polyline points={linha} fill="none" stroke={cor} strokeWidth="2" strokeLinejoin="round" />
      )}

      {validos.map((p) => (
        <circle key={p.i} cx={x(p.i)} cy={y(p.valor)} r="4" fill={cor} stroke="var(--color-card)" strokeWidth="2">
          <title>{`${p.label}: ${formatar(p.valor)}`}</title>
        </circle>
      ))}

      {ultimo && (
        <text
          x={x(ultimo.i)}
          y={y(ultimo.valor) - 12}
          textAnchor="end"
          fontSize="13"
          fontWeight="600"
          fill="var(--color-foreground)"
        >
          {formatar(ultimo.valor)}
        </text>
      )}

      {pontos.map((p, i) =>
        i % passoRotulo === 0 ? (
          <text key={p.label} x={x(i)} y={ALTURA - 6} textAnchor="middle" fontSize="11" fill="var(--color-muted-foreground)">
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

function marcasAte(maximo: number): number[] {
  const topo = Math.max(4, Math.ceil(maximo / 4) * 4);
  return [0, topo / 4, topo / 2, (topo * 3) / 4, topo];
}

// ── Seções de Tendência ────────────────────────────────────────────────

interface PropsTendencia {
  semanas: PontoTendenciaSemanal[];
  className?: string;
}

export function GraficoFluxoSemanal({ semanas, className }: PropsTendencia) {
  const escala = Math.max(1, ...semanas.flatMap((s) => [s.criadas, s.concluidas]));

  return (
    <PainelDashboard
      titulo="Criadas × concluídas"
      className={className}
      extra={
        <div className="flex gap-4">
          <ItemLegenda cor={CORES_DASHBOARD.aberto} label="Criadas" />
          <ItemLegenda cor={CORES_DASHBOARD.concluido} label="Concluídas" />
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <div className="sgdi-dash-colunas">
          {semanas.map((s) => (
            <div
              key={s.label}
              title={`${s.label} · criadas ${s.criadas} · concluídas ${s.concluidas}`}
              className="sgdi-dash-coluna"
            >
              <div style={{ height: `${(s.criadas / escala) * 100}%`, backgroundColor: CORES_DASHBOARD.aberto }}
              />
              <div style={{ height: `${(s.concluidas / escala) * 100}%`, backgroundColor: CORES_DASHBOARD.concluido }}
              />
            </div>
          ))}
        </div>
        <div className="sgdi-dash-rotulos">
          {semanas.map((s) => (
            <span key={s.label}>{s.label}</span>
          ))}
        </div>
      </div>
    </PainelDashboard>
  );
}

export function GraficoBacklog({ semanas, className }: PropsTendencia) {
  const marcas = marcasAte(Math.max(...semanas.map((s) => s.backlog), 0));

  return (
    <PainelDashboard titulo="Backlog aberto" className={className}>
      <GraficoLinha
        pontos={semanas.map((s) => ({ label: s.label, valor: s.backlog }))}
        min={0}
        max={marcas[marcas.length - 1]}
        marcas={marcas}
        cor={CORES_DASHBOARD.aberto}
        formatar={(v) => formatarNumero(v)}
        descricao="Demandas abertas ao fim de cada semana"
        area
      />
    </PainelDashboard>
  );
}

export function GraficoSlaSemanal({ semanas, className }: PropsTendencia) {
  const taxas = semanas.map((s) => s.taxaSla).filter((t): t is number => t !== null);
  const min = Math.max(0, Math.floor(Math.min(META_SLA, ...taxas) / 20) * 20);

  return (
    <PainelDashboard titulo="SLA por semana" className={className}>
      {taxas.length === 0 ? (
        <div className="py-10 text-center text-xs text-muted-foreground">Sem entregas no período</div>
      ) : (
        <GraficoLinha
          pontos={semanas.map((s) => ({ label: s.label, valor: s.taxaSla }))}
          min={min}
          max={100}
          marcas={[min, (min + 100) / 2, 100]}
          cor={CORES_DASHBOARD.atencao}
          formatar={(v) => `${formatarNumero(v)}%`}
          descricao={`Concluídas no prazo por semana; meta de ${META_SLA}%`}
          meta={META_SLA}
        />
      )}
    </PainelDashboard>
  );
}

// Tons de azul do mais claro (recente) ao mais escuro (antigo)
const CORES_IDADE = ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'];

interface PropsGraficoIdade {
  faixas: FaixaIdadeAbertas[];
  className?: string;
}

export function GraficoIdadeAbertas({ faixas, className }: PropsGraficoIdade) {
  const escala = Math.max(1, ...faixas.map((f) => f.quantidade));

  return (
    <PainelDashboard titulo="Idade das abertas" className={className}>
      <div className="flex flex-col gap-3">
        {faixas.map((f, i) => (
          <div
            key={f.label}
            title={`${f.label}: ${f.quantidade}`}
            className="sgdi-dash-linha-barra"
            style={{ '--sgdi-col-rotulo': '64px' } as CSSProperties}
          >
            <span className="text-muted-foreground">{f.label}</span>
            <div className="sgdi-dash-trilho" style={{ height: 20 }}>
              <div style={{ width: `${(f.quantidade / escala) * 100}%`, backgroundColor: CORES_IDADE[i] }}
              />
            </div>
            <b className="tabular-nums text-foreground">{f.quantidade}</b>
          </div>
        ))}
      </div>
    </PainelDashboard>
  );
}
