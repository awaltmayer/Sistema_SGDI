import { useState } from 'react';
import {
  IconArrowsSort,
  IconSearch,
  IconX,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconLayoutKanban,
  IconList,
  IconCircleDashed,
  IconProgress,
  IconCircleCheck,
} from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/componentes/ui/painel-flutuante';
import { Input } from '@/componentes/ui/campo-texto';
import { Button } from '@/componentes/base/botao';
import { SeletorSolicitante } from './seletor-solicitante';
import { SeletorFiltroResponsavel } from './seletor-filtro-responsavel';
import { useDataProvider } from '@/lib/provedor-dados';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import './barra-ferramentas-quadro.css';

export type SortBy = 'manual' | 'priority' | 'due_date' | 'assignee' | 'title' | 'created_at';
export type TipoOrdenacao = SortBy;

export interface PropsBarraFerramentasQuadro {
  sortBy?: SortBy;
  onSortByChange?: (s: SortBy) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (p: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (s: string) => void;
  requesterFilter?: string;
  onRequesterFilterChange?: (r: string) => void;
  assigneeFilter?: string;
  onAssigneeFilterChange?: (a: string) => void;
  cartoesVisiveis?: any[];
  modoExibicao?: 'quadro' | 'lista';
  aoMudarModoExibicao?: (m: 'quadro' | 'lista') => void;
  // Aliases compatibilidade
  ordenarPor?: SortBy;
  aoMudarOrdenacao?: (s: SortBy) => void;
  busca?: string;
  aoMudarBusca?: (query: string) => void;
  filtroPrioridade?: string;
  aoMudarFiltroPrioridade?: (p: string) => void;
  filtroStatus?: string;
  aoMudarFiltroStatus?: (s: string) => void;
  filtroSolicitante?: string;
  aoMudarFiltroSolicitante?: (r: string) => void;
  filtroResponsavel?: string;
  aoMudarFiltroResponsavel?: (a: string) => void;
}
export type BoardToolbarProps = PropsBarraFerramentasQuadro;

const rotulosOrdenacao: Record<SortBy, string> = {
  manual: 'Manual',
  priority: 'Prioridade',
  due_date: 'Data de vencimento',
  assignee: 'Responsável',
  title: 'Título',
  created_at: 'Criados',
};
export const sortLabels = rotulosOrdenacao;

export function BarraFerramentasQuadro({
  sortBy,
  onSortByChange,
  searchQuery = '',
  onSearchQueryChange,
  priorityFilter = 'all',
  onPriorityFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  requesterFilter = 'all',
  onRequesterFilterChange,
  ordenarPor,
  aoMudarOrdenacao,
  busca,
  aoMudarBusca,
  filtroPrioridade,
  aoMudarFiltroPrioridade,
  filtroStatus,
  aoMudarFiltroStatus,
  filtroSolicitante,
  aoMudarFiltroSolicitante,
  assigneeFilter = 'all',
  onAssigneeFilterChange,
  filtroResponsavel,
  aoMudarFiltroResponsavel,
  cartoesVisiveis,
  modoExibicao = 'quadro',
  aoMudarModoExibicao,
}: PropsBarraFerramentasQuadro) {
  const { useTeamMembers } = useDataProvider();
  const { data: membros = [] } = useTeamMembers();

  const ordenacaoAtual = ordenarPor ?? sortBy ?? 'manual';
  const mudarOrdenacao = aoMudarOrdenacao ?? onSortByChange ?? (() => { });
  const termoBusca = busca !== undefined ? busca : searchQuery;
  const mudarBusca = aoMudarBusca ?? onSearchQueryChange;
  const prioFiltro = filtroPrioridade !== undefined ? filtroPrioridade : priorityFilter;
  const mudarPrioFiltro = aoMudarFiltroPrioridade ?? onPriorityFilterChange;
  const statFiltro = filtroStatus !== undefined ? filtroStatus : statusFilter;
  const mudarStatFiltro = aoMudarFiltroStatus ?? onStatusFilterChange;
  const solicitanteFiltro = filtroSolicitante !== undefined ? filtroSolicitante : requesterFilter;
  const mudarSolicitanteFiltro = aoMudarFiltroSolicitante ?? onRequesterFilterChange;
  const responsavelFiltro = filtroResponsavel !== undefined ? filtroResponsavel : assigneeFilter;
  const mudarResponsavelFiltro = aoMudarFiltroResponsavel ?? onAssigneeFilterChange;

  const temFiltrosAtivos =
    termoBusca.trim().length > 0 ||
    prioFiltro !== 'all' ||
    statFiltro !== 'all' ||
    solicitanteFiltro !== 'all' ||
    responsavelFiltro !== 'all';

  const limparFiltros = () => {
    mudarBusca?.('');
    mudarPrioFiltro?.('all');
    mudarStatFiltro?.('all');
    mudarSolicitanteFiltro?.('all');
    mudarResponsavelFiltro?.('all');
  };

  const [popoverExportarAberto, setPopoverExportarAberto] = useState(false);

  const exportarCSV = () => {
    const lista = cartoesVisiveis ?? [];
    if (lista.length === 0) {
      toast.info('Não há tarefas visíveis para exportar com os filtros atuais.');
      return;
    }

    const escaparCsv = (valor: any): string => {
      if (valor == null) return '""';
      const str = String(valor).replace(/"/g, '""');
      return `"${str}"`;
    };

    const cabecalho = [
      'ID',
      'Título',
      'Descrição',
      'Coluna / Status',
      'Prioridade',
      'Solicitante',
      'Responsáveis',
      'Data de Vencimento',
      'Data de Criação',
      'Progresso Checklists',
      'Tempo Total Gasto',
    ];

    const linhas = lista.map((c) => {
      const col = c.coluna ?? c.column;
      const colNome =
        col === 'todo'
          ? 'A Fazer'
          : col === 'in-progress'
            ? 'Em Andamento'
            : col === 'done'
              ? 'Concluído'
              : (col ?? '');

      const prio = c.prioridade ?? c.priority;
      const prioNome =
        prio === 'high'
          ? 'Alta'
          : prio === 'medium'
            ? 'Média'
            : prio === 'low'
              ? 'Baixa'
              : (prio ?? '');

      const idCriador = c.id_usuario ?? c.user_id;
      const membroCriador = idCriador
        ? membros.find((m: any) => String(m.id) === String(idCriador) || (m.id_usuario && String(m.id_usuario) === String(idCriador)))
        : null;
      const nomeSolicitante = membroCriador?.nome_completo || (membroCriador as any)?.full_name || (idCriador ? 'Usuário' : 'Sistema');

      const nomesResponsaveis = (c.responsaveis ?? c.assignees ?? [])
        .map((r: any) => r.nome_completo || r.full_name || r.name)
        .filter(Boolean)
        .join(', ') || (c.responsavel?.nome_completo || c.assignee?.full_name || '');

      let dataVencFormatada = '';
      const rawVenc = c.data_vencimento ?? c.due_date;
      if (rawVenc) {
        try {
          dataVencFormatada = format(new Date(rawVenc), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
          dataVencFormatada = String(rawVenc);
        }
      }

      let criadoEmFormatado = '';
      const rawCriado = c.criado_em ?? c.created_at;
      if (rawCriado) {
        try {
          criadoEmFormatado = format(new Date(rawCriado), 'dd/MM/yyyy HH:mm', { locale: ptBR });
        } catch {
          criadoEmFormatado = String(rawCriado);
        }
      }

      const listas = c.listas_verificacao ?? c.checklists ?? [];
      const todosItens = listas.flatMap((l: any) => l.itens ?? l.items ?? []);
      const itensConcluidos = todosItens.filter((i: any) => i.esta_concluido ?? i.is_completed).length;
      const progressoChecklists = todosItens.length > 0
        ? `${itensConcluidos}/${todosItens.length} concluídos`
        : 'Sem checklists';

      const seg = c.rastreador_tempo?.tempo_total_segundos ?? c.time_tracker?.total_spent_seconds ?? 0;
      const h = Math.floor(seg / 3600);
      const m = Math.floor((seg % 3600) / 60);
      const s = seg % 60;
      const tempoGasto = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      return [
        escaparCsv(c.id),
        escaparCsv(c.titulo ?? c.title ?? ''),
        escaparCsv(c.descricao ?? c.description ?? ''),
        escaparCsv(colNome),
        escaparCsv(prioNome),
        escaparCsv(nomeSolicitante),
        escaparCsv(nomesResponsaveis),
        escaparCsv(dataVencFormatada),
        escaparCsv(criadoEmFormatado),
        escaparCsv(progressoChecklists),
        escaparCsv(tempoGasto),
      ].join(';');
    });

    const csvFinal = '\uFEFF' + [cabecalho.map(escaparCsv).join(';'), ...linhas].join('\r\n');
    const blob = new Blob([csvFinal], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tarefas_sgdi_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${lista.length} tarefa(s) exportada(s) para CSV com sucesso!`);
  };

  const exportarPDF = () => {
    const lista = cartoesVisiveis ?? [];
    if (lista.length === 0) {
      toast.info('Não há tarefas visíveis para exportar com os filtros atuais.');
      return;
    }

    const dataGeracao = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });

    const statusNome =
      statFiltro === 'todo'
        ? 'A Fazer'
        : statFiltro === 'in-progress'
          ? 'Em Andamento'
          : statFiltro === 'done'
            ? 'Concluído'
            : 'Todos os Status';

    const prioNome =
      prioFiltro === 'high'
        ? 'Alta'
        : prioFiltro === 'medium'
          ? 'Média'
          : prioFiltro === 'low'
            ? 'Baixa'
            : 'Todas as Prioridades';

    let solicitanteNome = 'Todos os Solicitantes';
    if (solicitanteFiltro && solicitanteFiltro !== 'all') {
      const m = membros.find(
        (u: any) =>
          String(u.id) === String(solicitanteFiltro) ||
          (u.id_usuario && String(u.id_usuario) === String(solicitanteFiltro))
      );
      solicitanteNome = m?.nome_completo || (m as any)?.full_name || 'Usuário Selecionado';
    }

    let responsavelNome = 'Todos os Responsáveis';
    if (responsavelFiltro === 'unassigned') {
      responsavelNome = 'Não Atribuído';
    } else if (responsavelFiltro && responsavelFiltro !== 'all') {
      const m = membros.find(
        (u: any) =>
          String(u.id) === String(responsavelFiltro) ||
          (u.id_usuario && String(u.id_usuario) === String(responsavelFiltro))
      );
      responsavelNome = m?.nome_completo || (m as any)?.full_name || 'Membro Selecionado';
    }

    const buscaTexto = termoBusca?.trim() ? `"${termoBusca.trim()}"` : 'Nenhum filtro por texto';

    const totalTodo = lista.filter((c) => (c.coluna ?? c.column) === 'todo').length;
    const totalInProgress = lista.filter((c) => (c.coluna ?? c.column) === 'in-progress').length;
    const totalDone = lista.filter((c) => (c.coluna ?? c.column) === 'done').length;

    const linhasHtml = lista
      .map((c) => {
        const col = c.coluna ?? c.column;
        const colBadge =
          col === 'todo'
            ? '<span class="badge badge-todo">A Fazer</span>'
            : col === 'in-progress'
              ? '<span class="badge badge-prog">Em Andamento</span>'
              : '<span class="badge badge-done">Concluído</span>';

        const prio = c.prioridade ?? c.priority;
        const prioBadge =
          prio === 'high'
            ? '<span class="prio-tag prio-high">🔴 Alta</span>'
            : prio === 'medium'
              ? '<span class="prio-tag prio-med">🟡 Média</span>'
              : '<span class="prio-tag prio-low">🟢 Baixa</span>';

        const idCriador = c.id_usuario ?? c.user_id;
        const membroCriador = idCriador
          ? membros.find(
            (m: any) =>
              String(m.id) === String(idCriador) ||
              (m.id_usuario && String(m.id_usuario) === String(idCriador))
          )
          : null;
        const nomeSolic =
          membroCriador?.nome_completo ||
          (membroCriador as any)?.full_name ||
          (idCriador ? 'Usuário' : 'Sistema');

        const nomesResp =
          (c.responsaveis ?? c.assignees ?? [])
            .map((r: any) => r.nome_completo || r.full_name || r.name)
            .filter(Boolean)
            .join(', ') ||
          (c.responsavel?.nome_completo || c.assignee?.full_name || 'Não atribuído');

        let dataVencFormatada = 'Sem prazo';
        const rawVenc = c.data_vencimento ?? c.due_date;
        if (rawVenc) {
          try {
            dataVencFormatada = format(new Date(rawVenc), 'dd/MM/yyyy', { locale: ptBR });
          } catch {
            dataVencFormatada = String(rawVenc);
          }
        }

        const listas = c.listas_verificacao ?? c.checklists ?? [];
        const todosItens = listas.flatMap((l: any) => l.itens ?? l.items ?? []);
        const itensConcluidos = todosItens.filter((i: any) => i.esta_concluido ?? i.is_completed).length;
        const progressoChecklists =
          todosItens.length > 0 ? `${itensConcluidos}/${todosItens.length}` : '—';

        const seg =
          c.rastreador_tempo?.tempo_total_segundos ??
          c.time_tracker?.total_spent_seconds ??
          0;
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        const s = seg % 60;
        const tempoGasto =
          seg > 0
            ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : '00:00:00';

        const tituloEscapado = (c.titulo ?? c.title ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const descEscapada = (c.descricao ?? c.description ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        return `
          <tr>
            <td style="font-weight:700; color:#475569; text-align:center;">#${c.id}</td>
            <td>
              <div style="font-weight:600; color:#0f172a; margin-bottom:2px;">${tituloEscapado}</div>
              ${descEscapada ? `<div style="font-size:8.5px; color:#64748b; max-height:24px; overflow:hidden;">${descEscapada}</div>` : ''}
            </td>
            <td>${colBadge}</td>
            <td>${prioBadge}</td>
            <td style="color:#1e293b;">${nomeSolic}</td>
            <td style="color:#334155;">${nomesResp}</td>
            <td style="white-space:nowrap; color:#475569;">${dataVencFormatada}</td>
            <td style="text-align:center; color:#475569;">${progressoChecklists}</td>
            <td style="font-family:monospace; text-align:center; color:#0f172a; font-weight:600;">${tempoGasto}</td>
          </tr>
        `;
      })
      .join('');

    const htmlCompleto = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>SGDI - Relatório Gerencial de Demandas (${format(new Date(), 'yyyy-MM-dd')})</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm 12mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0;
            padding: 10px;
            color: #0f172a;
            background: #ffffff;
            font-size: 10px;
            line-height: 1.35;
          }
          .relatorio-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .brand-title {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
            margin: 0 0 2px 0;
          }
          .brand-sub {
            font-size: 10px;
            color: #64748b;
            margin: 0;
          }
          .meta-info {
            text-align: right;
            font-size: 9.5px;
            color: #475569;
          }
          .meta-info strong {
            color: #0f172a;
          }
          .filtros-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 9.5px;
          }
          .filtro-item {
            display: flex;
            gap: 4px;
          }
          .filtro-rotulo {
            font-weight: 600;
            color: #64748b;
          }
          .filtro-valor {
            font-weight: 700;
            color: #0f172a;
          }
          .resumo-metricas {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
          }
          .metrica-chip {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 600;
          }
          .chip-total { background: #0f172a; color: #ffffff; }
          .chip-todo { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
          .chip-prog { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
          .chip-done { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 6px 8px;
            text-align: left;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
            font-size: 9.5px;
          }
          tr:nth-child(even) td {
            background-color: #f8fafc;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 9999px;
            font-size: 8.5px;
            font-weight: 700;
            white-space: nowrap;
          }
          .badge-todo { background: #f1f5f9; color: #475569; }
          .badge-prog { background: #dbeafe; color: #1e40af; }
          .badge-done { background: #d1fae5; color: #065f46; }
          
          .prio-tag { font-size: 9px; font-weight: 600; white-space: nowrap; }
          .prio-high { color: #dc2626; }
          .prio-med { color: #d97706; }
          .prio-low { color: #16a34a; }

          .relatorio-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 8.5px;
            color: #94a3b8;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="relatorio-header">
          <div class="brand">
            <h1 class="brand-title">SGDI • Sistema de Gestão de Demandas de TI</h1>
            <p class="brand-sub">Relatório de Governança, Rastreamento e Auditoria de Tarefas</p>
          </div>
          <div class="meta-info">
            <div>Data de Emissão: <strong>${dataGeracao}</strong></div>
            <div>Total Exportado: <strong>${lista.length} de ${cartoesVisiveis?.length ?? lista.length} demanda(s)</strong></div>
          </div>
        </div>

        <div class="filtros-box">
          <div class="filtro-item">
            <span class="filtro-rotulo">Filtro de Status:</span>
            <span class="filtro-valor">${statusNome}</span>
          </div>
          <div class="filtro-item">
            <span class="filtro-rotulo">Filtro de Prioridade:</span>
            <span class="filtro-valor">${prioNome}</span>
          </div>
          <div class="filtro-item">
            <span class="filtro-rotulo">Solicitante:</span>
            <span class="filtro-valor">${solicitanteNome}</span>
          </div>
          <div class="filtro-item">
            <span class="filtro-rotulo">Responsável:</span>
            <span class="filtro-valor">${responsavelNome}</span>
          </div>
          <div class="filtro-item">
            <span class="filtro-rotulo">Busca Textual:</span>
            <span class="filtro-valor">${buscaTexto}</span>
          </div>
        </div>

        <div class="resumo-metricas">
          <div class="metrica-chip chip-total">Total: ${lista.length}</div>
          <div class="metrica-chip chip-todo">📋 A Fazer: ${totalTodo}</div>
          <div class="metrica-chip chip-prog">⚡ Em Andamento: ${totalInProgress}</div>
          <div class="metrica-chip chip-done">✅ Concluído: ${totalDone}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">ID</th>
              <th>Título e Descrição</th>
              <th style="width:90px;">Status</th>
              <th style="width:75px;">Prioridade</th>
              <th style="width:120px;">Solicitante</th>
              <th style="width:140px;">Responsáveis</th>
              <th style="width:80px;">Prazo</th>
              <th style="width:70px; text-align:center;">Checklist</th>
              <th style="width:80px; text-align:center;">Tempo Gasto</th>
            </tr>
          </thead>
          <tbody>
            ${linhasHtml}
          </tbody>
        </table>

        <div class="relatorio-footer">
          <span>SGDI - Sistema de Gestão de Demandas de TI • Documento para fins gerenciais e auditoria de TI</span>
          <span>Página 1 de 1 • Gerado automaticamente pelo sistema</span>
        </div>
      </body>
      </html>
    `;

    // Dispara via iframe isolado para não ser barrado por bloqueador de pop-ups
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
      doc.write(htmlCompleto);
      doc.close();

      let executado = false;
      const limparIframe = () => {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      };

      const dispararImpressao = () => {
        if (executado) return;
        executado = true;
        try {
          win.focus();
          win.print();
        } catch {
          /* fallback silencioso */
        }
        limparIframe();
      };

      win.onafterprint = () => {
        limparIframe();
      };

      // Dispara a impressão apenas uma única vez após a montagem do documento
      setTimeout(dispararImpressao, 250);
      toast.success('Relatório PDF formatado pronto para impressão ou download!');
    } else {
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(htmlCompleto);
        w.document.close();
        setTimeout(() => {
          w.focus();
          w.print();
        }, 250);
      }
    }
  };

  return (
    <div className="sgdi-barra-ferramentas-container">
      {/* Linha Superior: Busca e Controles Principais */}
      <div className="sgdi-ferramentas-linha-superior">
        <div className="sgdi-ferramentas-filtros-grupo">
          {/* Campo de Busca de Tarefas */}
          <div className="sgdi-busca-wrapper">
            <IconSearch className="sgdi-busca-icone" />
            <Input
              type="text"
              placeholder="Buscar tarefa por título..."
              value={termoBusca}
              onChange={(e) => mudarBusca?.(e.target.value)}
              className="sgdi-busca-input pl-[35px]"
            />
            {termoBusca && (
              <button
                type="button"
                onClick={() => mudarBusca?.('')}
                className="sgdi-busca-limpar-btn"
                aria-label="Limpar busca"
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>

          {/* Ordenar por */}
          <div className="sgdi-ordenar-grupo">
            <IconArrowsSort className="size-3.5 text-muted-foreground hidden sm:inline" />
            <span className="text-xs text-muted-foreground hidden md:inline">Ordenar:</span>
            <Select value={ordenacaoAtual} onValueChange={(v) => mudarOrdenacao(v as SortBy)}>
              <SelectTrigger aria-label="Ordenar cartões por" className="h-8 w-[130px] text-xs">
                <SelectValue>{rotulosOrdenacao[ordenacaoAtual]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(rotulosOrdenacao) as SortBy[]).map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {rotulosOrdenacao[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Prioridade */}
          <div className="sgdi-ordenar-grupo">
            <Select
              value={prioFiltro}
              onValueChange={(val) => mudarPrioFiltro?.(val)}
            >
              <SelectTrigger className="h-8 w-[125px] text-xs">
                <span className="truncate">
                  {prioFiltro === 'all'
                    ? 'Prioridade'
                    : prioFiltro === 'high'
                      ? '🔴 Alta'
                      : prioFiltro === 'medium'
                        ? '🟡 Média'
                        : '🟢 Baixa'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Todas as Prioridades</SelectItem>
                <SelectItem value="high" className="text-xs text-rose-600 font-medium">🔴 Alta</SelectItem>
                <SelectItem value="medium" className="text-xs text-amber-600 font-medium">🟡 Média</SelectItem>
                <SelectItem value="low" className="text-xs text-emerald-600 font-medium">🟢 Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Status */}
          <div className="sgdi-ordenar-grupo">
            <Select
              value={statFiltro}
              onValueChange={(val) => mudarStatFiltro?.(val)}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <span className="truncate flex items-center gap-1.5">
                  {statFiltro === 'all' && 'Status'}
                  {statFiltro === 'todo' && (
                    <>
                      <IconCircleDashed className="size-3.5 text-muted-foreground shrink-0" />
                      <span>A Fazer</span>
                    </>
                  )}
                  {statFiltro === 'in-progress' && (
                    <>
                      <IconProgress className="size-3.5 text-blue-500 shrink-0" />
                      <span>Em Andamento</span>
                    </>
                  )}
                  {statFiltro === 'done' && (
                    <>
                      <IconCircleCheck className="size-3.5 text-emerald-500 shrink-0" />
                      <span>Concluído</span>
                    </>
                  )}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Todos os Status</SelectItem>
                <SelectItem value="todo" className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <IconCircleDashed className="size-3.5 text-muted-foreground shrink-0" />
                    <span>A Fazer</span>
                  </div>
                </SelectItem>
                <SelectItem value="in-progress" className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <IconProgress className="size-3.5 text-blue-500 shrink-0" />
                    <span>Em Andamento</span>
                  </div>
                </SelectItem>
                <SelectItem value="done" className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <IconCircleCheck className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Concluído</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Solicitante */}
          <div className="sgdi-ordenar-grupo">
            <SeletorSolicitante
              solicitanteSelecionadoId={solicitanteFiltro}
              aoMudarSolicitante={(id) => mudarSolicitanteFiltro?.(id)}
            />
          </div>

          {/* Filtro por Responsável */}
          <div className="sgdi-ordenar-grupo">
            <SeletorFiltroResponsavel
              responsavelSelecionadoId={responsavelFiltro}
              aoMudarResponsavel={(id) => mudarResponsavelFiltro?.(id)}
            />
          </div>

          {/* Botão de Limpar Filtros */}
          {temFiltrosAtivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="sgdi-btn-limpar-filtros"
            >
              <IconX className="size-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          )}
        </div>

        {/* BEM NO CANTO DIREITO: Toggle de Modo de Exibição e Botão Exportar CSV */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {aoMudarModoExibicao && (
            <div className="flex items-center rounded-md border border-input p-0.5 bg-background">
              <Button
                variant={modoExibicao === 'quadro' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => aoMudarModoExibicao('quadro')}
                className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer font-medium"
                title="Visualização em Quadro Kanban"
              >
                <IconLayoutKanban className="size-3.5" />
                <span className="hidden md:inline">Quadro</span>
              </Button>
              <Button
                variant={modoExibicao === 'lista' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => aoMudarModoExibicao('lista')}
                className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer font-medium"
                title="Visualização em Lista / Tabela Paginada"
              >
                <IconList className="size-3.5" />
                <span className="hidden md:inline">Lista</span>
              </Button>
            </div>
          )}

          <Popover open={popoverExportarAberto} onOpenChange={setPopoverExportarAberto}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-normal text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer shadow-xs transition-colors"
                title="Exportar demandas nos formatos CSV ou PDF"
              >
                <IconDownload className="size-3.5 text-muted-foreground shrink-0" />
                <span>Exportar</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="bottom"
              sideOffset={6}
              className="w-72 p-3 bg-popover border border-border shadow-lg rounded-lg text-popover-foreground space-y-2.5 z-50"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <IconDownload className="size-3.5 text-primary" />
                  Opções de Exportação
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {cartoesVisiveis?.length ?? 0} demanda(s) visíveis:
                </p>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPopoverExportarAberto(false);
                    exportarCSV();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-md border border-border/70 hover:bg-accent hover:border-primary/40 text-left transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20">
                    <IconFileSpreadsheet className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">Planilha CSV (.csv)</div>

                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPopoverExportarAberto(false);
                    exportarPDF();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-md border border-border/70 hover:bg-accent hover:border-primary/40 text-left transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20">
                    <IconFileTypePdf className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">Documento PDF (.pdf)</div>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

export const BoardToolbar = BarraFerramentasQuadro;
