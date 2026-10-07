import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { CartaoComResponsavel, MembroEquipe } from '@/lib/provedor-dados';
import {
  isDemandaAtrasada,
  type FiltrosDashboard,
} from './calculos-dashboard';
import { calcularStatusPrazo } from '@/paginas/quadro/componentes/seletor-data-vencimento';

export interface ParametrosExportacaoDashboard {
  cartoes: CartaoComResponsavel[];
  filtros: FiltrosDashboard;
  membros: MembroEquipe[];
  totalGeral?: number;
}

// ── SVG do Favicon Original Embutido para Garantia de Renderização sem Dependências ──
const FAVICON_SVG_INLINE = `
<svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="#F4F0FF"/>
  <rect x="12" y="16" width="40" height="8" rx="4" fill="#7C3AED" opacity="0.9"/>
  <rect x="12" y="28" width="28" height="8" rx="4" fill="#A78BFA" opacity="0.9"/>
  <rect x="12" y="40" width="18" height="8" rx="4" fill="#C4B5FD" opacity="0.9"/>
  <circle cx="47" cy="44" r="7" fill="#1F2937"/>
</svg>
`;

/**
 * Utilitário para escapar caracteres no formato CSV compatível com Excel.
 */
function escaparCsv(valor: any): string {
  if (valor == null) return '""';
  const str = String(valor).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Sanitiza texto para inserção segura em HTML.
 */
function escaparHtml(valor: any): string {
  if (valor == null) return '';
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formata segundos no formato legível HH:MM:SS.
 */
function formatarSegundos(seg: number): string {
  if (!seg || seg <= 0) return '00:00:00';
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Obtém o nome amigável do criador/solicitante da demanda.
 */
function obterNomeCriador(cartao: CartaoComResponsavel, membros: MembroEquipe[]): string {
  const idCriador = cartao.id_usuario ?? (cartao as any).user_id;
  if (!idCriador) return 'Sistema';
  const membro = membros.find(
    (m) => String(m.id) === String(idCriador) || (m.id_usuario && String(m.id_usuario) === String(idCriador))
  );
  return membro?.nome_completo || (membro as any)?.full_name || 'Usuário';
}

/**
 * Obtém os nomes dos responsáveis concatenados.
 */
function obterNomesResponsaveis(cartao: CartaoComResponsavel): string {
  const resps = cartao.responsaveis ?? (cartao as any).assignees ?? [];
  if (Array.isArray(resps) && resps.length > 0) {
    return resps.map((r: any) => r.nome_completo || r.full_name || r.name).filter(Boolean).join(', ');
  }
  const unico = cartao.responsavel?.nome_completo || (cartao as any).assignee?.full_name;
  return unico || 'Sem responsável (Fora do SLA)';
}

/**
 * Filtra estritamente as demandas atrasadas a partir de um conjunto de cartões.
 */
export function extrairDemandasAtrasadas(cartoes: CartaoComResponsavel[] = []): CartaoComResponsavel[] {
  return cartoes.filter(isDemandaAtrasada);
}

/**
 * Exporta apenas as demandas atrasadas do Dashboard para Excel (.csv com BOM UTF-8 e delimitador ';').
 */
export function exportarExcelDashboard(params: ParametrosExportacaoDashboard): void {
  const { cartoes, membros } = params;
  const atrasadas = extrairDemandasAtrasadas(cartoes);

  if (atrasadas.length === 0) {
    toast.info('Não há demandas atrasadas para exportar com os filtros atuais.');
    return;
  }

  const cabecalho = [
    'ID',
    'Título',
    'Descrição',
    'Status Atual',
    'Prioridade',
    'Solicitante',
    'Responsáveis',
    'Data Limite (Vencimento)',
    'Dias em Atraso',
    'Situação do SLA',
    'Data de Criação',
    'Tempo de Cronômetro Ativo',
    'Progresso Checklists',
  ];

  const linhas = atrasadas.map((c) => {
    const col = c.coluna ?? (c as any).column;
    const colNome =
      col === 'in-progress'
        ? 'Em Andamento'
        : col === 'todo'
          ? 'A Fazer'
          : String(col || '');

    const prio = c.prioridade ?? (c as any).priority;
    const prioNome =
      prio === 'high'
        ? 'Alta'
        : prio === 'medium'
          ? 'Média'
          : prio === 'low'
            ? 'Baixa'
            : String(prio || '');

    const solicitante = obterNomeCriador(c, membros);
    const responsaveis = obterNomesResponsaveis(c);

    let dataVenc = '';
    const rawVenc = c.data_vencimento ?? (c as any).due_date;
    if (rawVenc) {
      try {
        dataVenc = format(new Date(rawVenc), 'dd/MM/yyyy', { locale: ptBR });
      } catch {
        dataVenc = String(rawVenc);
      }
    }

    const situacaoPrazo = calcularStatusPrazo(c);
    const diasAtraso = Math.abs(situacaoPrazo.diasDiferenca || 0);

    const respsArray = c.responsaveis ?? (c as any).assignees ?? [];
    const situacaoSla =
      !respsArray || respsArray.length === 0
        ? 'Fora do SLA (Sem Responsável Atribuído)'
        : 'SLA Quebrado (Em Atraso)';

    let criadoEm = '';
    const rawCriado = c.criado_em ?? (c as any).created_at;
    if (rawCriado) {
      try {
        criadoEm = format(new Date(rawCriado), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      } catch {
        criadoEm = String(rawCriado);
      }
    }

    const seg = c.rastreador_tempo?.tempo_total_segundos ?? (c as any).time_tracker?.tempo_total_segundos ?? 0;
    const tempoCronometro = formatarSegundos(seg);

    const checklists = c.listas_verificacao ?? (c as any).checklists ?? [];
    const todosItens = checklists.flatMap((l: any) => l.itens ?? l.items ?? []);
    const itensConcluidos = todosItens.filter((i: any) => i.esta_concluido ?? i.is_completed).length;
    const progressoChecklists =
      todosItens.length > 0 ? `${itensConcluidos}/${todosItens.length}` : 'Sem itens';

    return [
      escaparCsv(c.id),
      escaparCsv(c.titulo ?? (c as any).title ?? ''),
      escaparCsv(c.descricao ?? (c as any).description ?? ''),
      escaparCsv(colNome),
      escaparCsv(prioNome),
      escaparCsv(solicitante),
      escaparCsv(responsaveis),
      escaparCsv(dataVenc),
      escaparCsv(`${diasAtraso} dia(s)`),
      escaparCsv(situacaoSla),
      escaparCsv(criadoEm),
      escaparCsv(tempoCronometro),
      escaparCsv(progressoChecklists),
    ].join(';');
  });

  const csvFinal = '\uFEFF' + [cabecalho.map(escaparCsv).join(';'), ...linhas].join('\r\n');
  const blob = new Blob([csvFinal], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
  link.setAttribute('download', `demandas_atrasadas_sgdi_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`${atrasadas.length} demanda(s) atrasada(s) exportada(s) para Excel/CSV com sucesso!`);
}

/**
 * Exporta apenas as demandas atrasadas em PDF de alta qualidade com cabeçalho fictício corporativo e logotipo favicon.svg.
 */
export function exportarPdfDashboard(params: ParametrosExportacaoDashboard): void {
  const { cartoes, filtros, membros } = params;
  const atrasadas = extrairDemandasAtrasadas(cartoes);

  if (atrasadas.length === 0) {
    toast.info('Não há demandas atrasadas para exportar com os filtros atuais.');
    return;
  }

  const dataGeracao = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  const protocoloFicticio = `SGDI-ATRASADAS-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Legenda de filtros ativos
  const periodoLabels: Record<string, string> = {
    todos: 'Todo o histórico',
    hoje: 'Hoje',
    '7dias': 'Últimos 7 dias',
    '15dias': 'Últimos 15 dias',
    '30dias': 'Últimos 30 dias',
    mes: 'Mês atual',
  };
  const filtroPeriodoTexto = periodoLabels[filtros.periodo] || 'Todos';

  let filtroResponsavelTexto = 'Todos os Responsáveis';
  if (filtros.responsavel === 'sem-responsavel') {
    filtroResponsavelTexto = 'Apenas Sem Responsável';
  } else if (filtros.responsavel && filtros.responsavel !== 'todos') {
    const m = membros.find((u) => String(u.id) === String(filtros.responsavel));
    filtroResponsavelTexto = m?.nome_completo || (m as any)?.full_name || 'Membro Selecionado';
  }

  const prioridadeLabels: Record<string, string> = {
    todas: 'Todas as Prioridades',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  };
  const filtroPrioridadeTexto = prioridadeLabels[filtros.prioridade] || 'Todas';

  const filtroBuscaTexto = filtros.busca?.trim() ? `"${filtros.busca.trim()}"` : 'Nenhum filtro de texto';

  // Métricas específicas das atrasadas
  const atrasadasAlta = atrasadas.filter((c) => (c.prioridade || (c as any).priority) === 'high').length;
  const atrasadasMedia = atrasadas.filter((c) => (c.prioridade || (c as any).priority) === 'medium').length;
  const atrasadasBaixa = atrasadas.filter((c) => (c.prioridade || (c as any).priority) === 'low').length;
  const atrasadasSemResp = atrasadas.filter((c) => {
    const resps = c.responsaveis ?? (c as any).assignees ?? [];
    return !resps || resps.length === 0;
  }).length;

  let somaDiasAtraso = 0;
  atrasadas.forEach((c) => {
    const st = calcularStatusPrazo(c);
    somaDiasAtraso += Math.abs(st.diasDiferenca || 0);
  });
  const mediaDiasAtraso = Number((somaDiasAtraso / atrasadas.length).toFixed(1));

  // Agrupamento por Responsável das Atrasadas
  const contagemPorMembro: Record<string, { nome: string; total: number; foraSla?: boolean }> = {};
  atrasadas.forEach((c) => {
    const resps = c.responsaveis ?? (c as any).assignees ?? [];
    if (!resps || resps.length === 0) {
      if (!contagemPorMembro['sem-resp']) {
        contagemPorMembro['sem-resp'] = { nome: 'Não Atribuído (Fora do SLA)', total: 0, foraSla: true };
      }
      contagemPorMembro['sem-resp'].total++;
    } else {
      resps.forEach((r: any) => {
        const idKey = String(r.id || r.id_usuario || 'outro');
        const nomeMembro = r.nome_completo || r.full_name || r.name || 'Membro';
        if (!contagemPorMembro[idKey]) {
          contagemPorMembro[idKey] = { nome: nomeMembro, total: 0 };
        }
        contagemPorMembro[idKey].total++;
      });
    }
  });

  const cargasAtrasadasHtml = Object.values(contagemPorMembro)
    .map((item) => `
      <div class="carga-card ${item.foraSla ? 'carga-card-fora-sla' : ''}">
        <span class="carga-nome">${escaparHtml(item.nome)}</span>
        <span class="carga-badge">${item.total} atrasada${item.total === 1 ? '' : 's'}</span>
      </div>
    `)
    .join('');

  // Linhas da Tabela (estritamente das atrasadas)
  const linhasHtml = atrasadas
    .map((c) => {
      const col = c.coluna ?? (c as any).column;
      const colBadge =
        col === 'in-progress'
          ? '<span class="badge badge-prog">⚡ Em Andamento</span>'
          : '<span class="badge badge-todo">📋 A Fazer</span>';

      const prio = c.prioridade ?? (c as any).priority;
      const prioBadge =
        prio === 'high'
          ? '<span class="prio-tag prio-high">🔴 Alta</span>'
          : prio === 'medium'
            ? '<span class="prio-tag prio-med">🟡 Média</span>'
            : '<span class="prio-tag prio-low">🟢 Baixa</span>';

      const solicitante = escaparHtml(obterNomeCriador(c, membros));
      const responsaveis = escaparHtml(obterNomesResponsaveis(c));

      const situacao = calcularStatusPrazo(c);
      const diasAtraso = Math.abs(situacao.diasDiferenca || 0);

      let dataVencFormatada = 'Data expirada';
      const rawVenc = c.data_vencimento ?? (c as any).due_date;
      if (rawVenc) {
        try {
          dataVencFormatada = format(new Date(rawVenc), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
          dataVencFormatada = String(rawVenc);
        }
      }

      const respsArray = c.responsaveis ?? (c as any).assignees ?? [];
      const semResponsavel = !respsArray || respsArray.length === 0;

      const seg = c.rastreador_tempo?.tempo_total_segundos ?? (c as any).time_tracker?.tempo_total_segundos ?? 0;
      const tempoFormatado = formatarSegundos(seg);

      const tituloEscapado = escaparHtml(c.titulo ?? (c as any).title ?? '');
      const descEscapada = escaparHtml(c.descricao ?? (c as any).description ?? '');

      return `
        <tr class="row-atrasado">
          <td style="font-weight:700; color:#b91c1c; text-align:center;">#${c.id}</td>
          <td>
            <div style="font-weight:700; color:#0f172a; margin-bottom:2px;">${tituloEscapado}</div>
            ${descEscapada ? `<div style="font-size:8.5px; color:#64748b; line-height:1.25; max-height:22px; overflow:hidden;">${descEscapada}</div>` : ''}
          </td>
          <td>${colBadge}</td>
          <td>${prioBadge}</td>
          <td style="color:#1e293b;">${solicitante}</td>
          <td>
            ${
              semResponsavel
                ? '<span style="color:#b45309; font-weight:700; font-size:8.5px;">⚠️ Não Atribuído <span style="font-size:7.5px; color:#94a3b8;">(Fora do SLA)</span></span>'
                : `<span style="color:#334155; font-weight:500;">${responsaveis}</span>`
            }
          </td>
          <td style="white-space:nowrap;">
            <div class="badge-atraso-alerta">⚠️ Atrasado há ${diasAtraso}d</div>
            <div style="font-size:8px; color:#78716c; margin-top:2px;">Limite: ${dataVencFormatada}</div>
          </td>
          <td style="font-family:monospace; text-align:center; color:#0f172a; font-weight:600;">${tempoFormatado}</td>
        </tr>
      `;
    })
    .join('');

  const htmlDocumento = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>SGDI - Relatório de Demandas Atrasadas (${format(new Date(), 'yyyy-MM-dd')})</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 8mm 10mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin: 0;
          padding: 8px;
          color: #0f172a;
          background: #ffffff;
          font-size: 9.5px;
          line-height: 1.3;
        }

        /* ── CABEÇALHO FICTÍCIO CORPORATIVO COM FAVICON.SVG ── */
        .ficticio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2.5px solid #dc2626;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo-container {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #faf5ff;
          border: 1px solid #e9d5ff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .brand-text h1 {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.3px;
          margin: 0;
          text-transform: uppercase;
        }
        .brand-text h2 {
          font-size: 11px;
          font-weight: 700;
          color: #dc2626;
          margin: 1px 0 0 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .brand-text p {
          font-size: 8.5px;
          color: #64748b;
          margin: 1px 0 0 0;
        }
        .header-meta {
          text-align: right;
          font-size: 8.5px;
          color: #475569;
          line-height: 1.35;
        }
        .header-meta .tag-alerta {
          display: inline-block;
          background: #dc2626;
          color: #ffffff;
          font-size: 8px;
          font-weight: 800;
          padding: 2.5px 8px;
          border-radius: 4px;
          margin-bottom: 3px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .header-meta strong {
          color: #0f172a;
        }

        /* ── BARRA DE FILTROS APLICADOS ── */
        .filtros-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 6px 10px;
          margin-bottom: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          font-size: 8.5px;
        }
        .filtro-item {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .filtro-rotulo {
          color: #991b1b;
          font-weight: 600;
        }
        .filtro-valor {
          color: #450a0a;
          font-weight: 700;
        }

        /* ── KPIS ESPECÍFICOS DAS ATRASADAS ── */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        .kpi-card {
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 6px 8px;
          background: #fff5f5;
          text-align: center;
          border-left: 3.5px solid #dc2626;
        }
        .kpi-rotulo {
          font-size: 7.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: #991b1b;
          letter-spacing: 0.4px;
          margin-bottom: 2px;
        }
        .kpi-valor {
          font-size: 15px;
          font-weight: 800;
          line-height: 1.1;
          color: #b91c1c;
        }
        .kpi-sub {
          font-size: 7.5px;
          color: #7f1d1d;
          margin-top: 1px;
        }

        /* ── SEÇÃO DE DISTRIBUIÇÃO DAS ATRASADAS ── */
        .secao-titulo {
          font-size: 10px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .carga-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 10px;
        }
        .carga-card {
          border: 1px solid #fecaca;
          background: #fff5f5;
          border-radius: 5px;
          padding: 5px 8px;
          font-size: 8.5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .carga-card-fora-sla {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        .carga-nome {
          font-weight: 700;
          color: #1e293b;
        }
        .carga-badge {
          font-weight: 800;
          background: #fee2e2;
          color: #dc2626;
          padding: 1.5px 6px;
          border-radius: 4px;
          font-size: 8px;
        }

        /* ── TABELA DAS DEMANDAS ATRASADAS ── */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        th {
          background-color: #991b1b;
          color: #ffffff;
          font-size: 8.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 5px 7px;
          text-align: left;
        }
        td {
          padding: 5px 7px;
          border-bottom: 1px solid #fecaca;
          vertical-align: middle;
          font-size: 8.5px;
        }
        tr.row-atrasado {
          background-color: #fffaf0;
        }
        tr.row-atrasado:nth-child(even) {
          background-color: #fff5f5;
        }

        /* ── BADGES & TAGS ── */
        .badge {
          display: inline-block;
          padding: 1.5px 5px;
          border-radius: 9999px;
          font-size: 7.5px;
          font-weight: 700;
          white-space: nowrap;
        }
        .badge-todo { background: #fee2e2; color: #991b1b; }
        .badge-prog { background: #dbeafe; color: #1e40af; }

        .prio-tag { font-size: 8px; font-weight: 700; white-space: nowrap; }
        .prio-high { color: #dc2626; }
        .prio-med { color: #d97706; }
        .prio-low { color: #16a34a; }

        .badge-atraso-alerta {
          display: inline-block;
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 8px;
        }

        /* ── RODAPÉ CORPORATIVO ── */
        .ficticio-footer {
          border-top: 1.5px solid #fca5a5;
          padding-top: 5px;
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 7.5px;
          color: #991b1b;
        }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .ficticio-footer { position: fixed; bottom: 0; left: 0; right: 0; }
        }
      </style>
    </head>
    <body>
      <!-- CABEÇALHO FICTÍCIO CORPORATIVO COM FAVICON.SVG -->
      <div class="ficticio-header">
        <div class="header-brand">
          <div class="brand-logo-container">
            ${FAVICON_SVG_INLINE}
          </div>
          <div class="brand-text">
            <h1>SGDI Tecnologia & Governança S.A.</h1>
            <h2>⚠️ Relatório de Demandas Atrasadas & Quebra de SLA</h2>
            <p>Diretoria de Tecnologia da Informação • Gerência de Governança, Infraestrutura & SLA</p>
          </div>
        </div>

        <div class="header-meta">
          <div><span class="tag-alerta">QUEBRA DE SLA</span></div>
          <div>Protocolo: <strong>${protocoloFicticio}</strong></div>
          <div>Classificação: <strong>Atenção Imediata / Uso Restrito</strong></div>
          <div>Emissão: <strong>${dataGeracao}</strong></div>
          <div>Total Atrasadas: <strong>${atrasadas.length} demanda(s)</strong></div>
        </div>
      </div>

      <!-- FILTROS APLICADOS -->
      <div class="filtros-box">
        <div class="filtro-item">
          <span class="filtro-rotulo">Filtro de Período:</span>
          <span class="filtro-valor">${filtroPeriodoTexto}</span>
        </div>
        <div class="filtro-item">
          <span class="filtro-rotulo">Responsável:</span>
          <span class="filtro-valor">${filtroResponsavelTexto}</span>
        </div>
        <div class="filtro-item">
          <span class="filtro-rotulo">Prioridade:</span>
          <span class="filtro-valor">${filtroPrioridadeTexto}</span>
        </div>
        <div class="filtro-item">
          <span class="filtro-rotulo">Busca:</span>
          <span class="filtro-valor">${filtroBuscaTexto}</span>
        </div>
      </div>

      <!-- KPIS ESPECÍFICOS DAS ATRASADAS -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-rotulo">Total Atrasadas</div>
          <div class="kpi-valor">${atrasadas.length}</div>
          <div class="kpi-sub">Demandas em atraso</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Alta Prioridade</div>
          <div class="kpi-valor">${atrasadasAlta}</div>
          <div class="kpi-sub">Risco crítico</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Média Prioridade</div>
          <div class="kpi-valor">${atrasadasMedia}</div>
          <div class="kpi-sub">Impacto moderado</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Baixa Prioridade</div>
          <div class="kpi-valor">${atrasadasBaixa}</div>
          <div class="kpi-sub">Baixo impacto</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Sem Responsável</div>
          <div class="kpi-valor">${atrasadasSemResp}</div>
          <div class="kpi-sub">Fora do SLA</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Média de Atraso</div>
          <div class="kpi-valor">${mediaDiasAtraso}d</div>
          <div class="kpi-sub">Dias corridos</div>
        </div>
      </div>

      <!-- DISTRIBUIÇÃO DAS ATRASADAS POR RESPONSÁVEL -->
      ${
        cargasAtrasadasHtml
          ? `
          <h3 class="secao-titulo">Demandas Atrasadas por Responsável</h3>
          <div class="carga-grid">
            ${cargasAtrasadasHtml}
          </div>
        `
          : ''
      }

      <!-- TABELA EXCLUSIVA DE DEMANDAS ATRASADAS -->
      <h3 class="secao-titulo">Detalhamento das Demandas Atrasadas (Apenas Atrasadas)</h3>
      <table>
        <thead>
          <tr>
            <th style="width:36px; text-align:center;">ID</th>
            <th>Título e Descrição da Demanda</th>
            <th style="width:90px;">Status</th>
            <th style="width:65px;">Prioridade</th>
            <th style="width:110px;">Solicitante</th>
            <th style="width:140px;">Responsáveis</th>
            <th style="width:130px;">Prazo & Situação</th>
            <th style="width:75px; text-align:center;">Cronômetro</th>
          </tr>
        </thead>
        <tbody>
          ${linhasHtml}
        </tbody>
      </table>

      <!-- RODAPÉ CORPORATIVO -->
      <div class="ficticio-footer">
        <span>SGDI Tecnologia & Governança S.A. • CNPJ Fictício: 00.123.456/0001-89 • Relatório exclusivo de demandas atrasadas</span>
        <span>Página 1 de 1 • Gerado em ${dataGeracao}</span>
      </div>
    </body>
    </html>
  `;

  // Disparo via iframe invisível para evitar bloqueador de pop-ups do navegador
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (doc && win) {
    doc.open();
    doc.write(htmlDocumento);
    doc.close();

    let disparado = false;
    const limparIframe = () => {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    };

    const dispararImpressao = () => {
      if (disparado) return;
      disparado = true;
      try {
        win.focus();
        win.print();
      } catch (err) {
        console.error('Erro ao acionar impressão:', err);
      } finally {
        limparIframe();
      }
    };

    if (doc.readyState === 'complete') {
      setTimeout(dispararImpressao, 300);
    } else {
      win.addEventListener('load', () => setTimeout(dispararImpressao, 300), { once: true });
      setTimeout(dispararImpressao, 800);
    }

    toast.success(`Relatório de ${atrasadas.length} demanda(s) atrasada(s) pronto! Janela de impressão aberta.`);
  } else {
    toast.error('Não foi possível gerar a janela de impressão do PDF.');
  }
}
