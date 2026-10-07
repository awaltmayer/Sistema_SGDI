import {
  differenceInCalendarDays,
  startOfToday,
  subDays,
  isToday,
  startOfMonth,
} from 'date-fns';
import type { CartaoComResponsavel, MembroEquipe, PerfilUsuario } from '@/lib/provedor-dados';
import { calcularStatusPrazo } from '@/paginas/quadro/componentes/seletor-data-vencimento';

// ── Constantes Globais de Cores do Dashboard ──────────────────────────
export const CORES_DASHBOARD = {
  atrasado: '#ef4444', // Vermelho vibrante obrigatório para atrasados
  atrasadoBg: 'rgba(239, 68, 68, 0.12)',
  atrasadoBorda: 'rgba(239, 68, 68, 0.4)',
  concluido: '#10b981', // Verde esmeralda para concluídos
  concluidoBg: 'rgba(16, 185, 129, 0.12)',
  concluidoBorda: 'rgba(16, 185, 129, 0.4)',
  aberto: '#3b82f6', // Azul para abertas no prazo
  abertoBg: 'rgba(59, 130, 246, 0.12)',
  abertoBorda: 'rgba(59, 130, 246, 0.4)',
  atencao: '#f59e0b', // Âmbar para atenção/urgência
  foraDoSla: '#94a3b8', // Cinza slate para demandas sem responsável (fora do SLA)
  foraDoSlaBg: 'rgba(148, 163, 184, 0.15)',
};

// ── Interfaces ────────────────────────────────────────────────────────

export type TipoPeriodoFiltro = 'todos' | 'hoje' | '7dias' | '15dias' | '30dias' | 'mes';
export type TipoStatusFiltro = 'todos' | 'todo' | 'in-progress' | 'done' | 'atrasadas';
export type TipoPrioridadeFiltro = 'todas' | 'high' | 'medium' | 'low';

export interface FiltrosDashboard {
  periodo: TipoPeriodoFiltro;
  responsavel: string; // 'todos' | 'sem-responsavel' | id_do_membro
  prioridade: TipoPrioridadeFiltro;
  status: TipoStatusFiltro;
  busca?: string;
}

export interface MetricasDemandas {
  total: number;
  concluidas: number;
  percentualConcluidas: number;
  totalAbertas: number;
  percentualAbertas: number;
  abertasNoPrazo: number;
  percentualAbertasNoPrazo: number;
  abertasEmAndamento: number;
  percentualAbertasEmAndamento: number;
  abertasAFazer: number;
  percentualAbertasAFazer: number;
  atrasadas: number; // Sempre em vermelho
  percentualAtrasadas: number;
}

export interface DemandaCriticaItem {
  cartao: CartaoComResponsavel;
  diasRestantes: number;
  textoPrazo: string;
  tipoUrgencia: 'hoje' | 'amanha' | 'proximos-dias' | 'atrasada';
  nomeCriador: string;
  avatarCriador?: string | null;
  iniciaisCriador: string;
  emailCriador?: string | null;
  semResponsavelForaDoSla: boolean; // Indica se está fora do SLA por falta de responsável
}

export interface CargaResponsavelItem {
  id: string;
  nome: string;
  iniciais: string;
  avatarUrl?: string | null;
  email?: string | null;
  totalAbertas: number;
  aFazer: number;
  emAndamento: number;
  atrasadas: number; // Em vermelho
  emAndamentoNoPrazo?: number;
  aFazerNoPrazo?: number;
  percentualDoTotal: number;
  foraDoSla?: boolean; // Para o grupo "Sem responsável"
}

export interface MetricasTempoResolucao {
  totalConcluidas: number;
  // Tempo do Cronômetro Ativo (apenas tarefas concluídas, canceladas fora)
  cronometroTotalSegundos: number;
  cronometroMedioSegundos: number;
  cronometroMedioDias: number;
  cronometroTextoFormatado: string;
  // Dias Brutos de Calendário (apenas tarefas concluídas, canceladas fora)
  calendarioMedioDias: number;
  calendarioTotalDias: number;
}

export interface MetricasTempoPorPrioridade {
  prioridade: 'high' | 'medium' | 'low';
  label: string;
  totalConcluidas: number;
  cronometroMedioDias: number;
  calendarioMedioDias: number;
  cor: string;
}

export interface MetricasSLA {
  totalDemandasComResponsavel: number;
  noPrazoComResponsavel: number;
  atrasadasComResponsavel: number; // Em vermelho
  taxaAderenciaSla: number; // % no prazo dentro do SLA
  totalSemResponsavelForaDoSla: number; // Demandas não atribuídas (fora do SLA)
}

// ── Verificações Básicas ───────────────────────────────────────────────

/**
 * Verifica se um cartão está cancelado (por coluna ou tag/título).
 * Demandas canceladas ficam FORA do tempo médio de conclusão.
 */
export function isDemandaCancelada(cartao: CartaoComResponsavel): boolean {
  const col = String(cartao.coluna || (cartao as unknown as { column?: string }).column || '').toLowerCase().trim();
  const titulo = String(cartao.titulo || (cartao as unknown as { title?: string }).title || '').toLowerCase().trim();

  return (
    col === 'canceled' ||
    col === 'cancelada' ||
    col === 'cancelado' ||
    titulo.startsWith('[cancelada]') ||
    titulo.startsWith('[cancelado]')
  );
}

/**
 * Verifica se o cartão tem responsável atribuído.
 * Sem responsável => Fora do SLA.
 */
export function temResponsavelAtribuido(cartao: CartaoComResponsavel): boolean {
  const rawIds =
    cartao.ids_responsaveis && cartao.ids_responsaveis.length > 0
      ? cartao.ids_responsaveis
      : (cartao as unknown as { assignee_ids?: string[] }).assignee_ids &&
        (cartao as unknown as { assignee_ids?: string[] }).assignee_ids!.length > 0
      ? (cartao as unknown as { assignee_ids?: string[] }).assignee_ids!
      : cartao.id_responsavel
      ? [cartao.id_responsavel]
      : (cartao as unknown as { assignee_id?: string }).assignee_id
      ? [(cartao as unknown as { assignee_id?: string }).assignee_id!]
      : [];

  return rawIds.length > 0 && rawIds.some((id) => id !== null && String(id).trim() !== '');
}

/**
 * Verifica se o cartão está concluído.
 */
export function isDemandaConcluida(cartao: CartaoComResponsavel): boolean {
  if (isDemandaCancelada(cartao)) return false;
  const col = String(cartao.coluna || (cartao as unknown as { column?: string }).column || '').toLowerCase().trim();
  return col === 'done';
}

/**
 * Verifica se a demanda está aberta e atrasada em relação à data limite.
 */
export function isDemandaAtrasada(cartao: CartaoComResponsavel): boolean {
  if (isDemandaCancelada(cartao) || isDemandaConcluida(cartao)) return false;
  const dueDate = cartao.data_vencimento || (cartao as unknown as { due_date?: string }).due_date;
  if (!dueDate) return false;
  const statusPrazo = calcularStatusPrazo(dueDate);
  return (
    statusPrazo.status === 'atrasado' ||
    (statusPrazo.diasRestantes !== null && statusPrazo.diasRestantes < 0)
  );
}

/**
 * Formata segundos em texto amigável (ex: "2d 4h 30m" ou "4h 15m")
 */
export function formatarSegundosEmHoras(totalSegundos: number): string {
  if (!totalSegundos || totalSegundos <= 0) return '0 min';
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);

  if (horas >= 24) {
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    return `${dias}d ${horasRestantes}h ${minutos}m`;
  }

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  }

  return `${Math.max(1, minutos)} min`;
}

// ── Filtros Consolidados ───────────────────────────────────────────────

/**
 * Aplica os filtros selecionados de Período, Responsável, Prioridade, Status e Busca.
 */
export function aplicarFiltrosDashboard(
  cartoes: CartaoComResponsavel[],
  filtros: FiltrosDashboard,
  membros: MembroEquipe[] = [],
  hoje: Date = new Date()
): CartaoComResponsavel[] {
  return cartoes.filter((cartao) => {
    // 1. Filtro de Busca
    if (filtros.busca && filtros.busca.trim().length > 0) {
      const termo = filtros.busca.toLowerCase().trim();
      const titulo = (cartao.titulo || '').toLowerCase();
      const descricao = (cartao.descricao || '').toLowerCase();
      if (!titulo.includes(termo) && !descricao.includes(termo)) {
        return false;
      }
    }

    // 2. Filtro de Prioridade
    if (filtros.prioridade !== 'todas') {
      const prio = cartao.prioridade || (cartao as unknown as { priority?: string }).priority;
      if (prio !== filtros.prioridade) {
        return false;
      }
    }

    // 3. Filtro de Responsável
    if (filtros.responsavel !== 'todos') {
      const temResp = temResponsavelAtribuido(cartao);
      if (filtros.responsavel === 'sem-responsavel') {
        if (temResp) return false;
      } else {
        // Filtrar por ID específico do responsável
        const alvoId = String(filtros.responsavel);
        const rawIds =
          cartao.ids_responsaveis && cartao.ids_responsaveis.length > 0
            ? cartao.ids_responsaveis
            : (cartao as unknown as { assignee_ids?: string[] }).assignee_ids &&
              (cartao as unknown as { assignee_ids?: string[] }).assignee_ids!.length > 0
            ? (cartao as unknown as { assignee_ids?: string[] }).assignee_ids!
            : cartao.id_responsavel
            ? [cartao.id_responsavel]
            : [];

        const pertence = rawIds.some((rId) => {
          const sId = String(rId);
          if (sId === alvoId) return true;
          const m = membros.find(
            (mem) =>
              String(mem.id) === sId ||
              (mem.id_usuario && String(mem.id_usuario) === sId) ||
              (mem.id_usuario_membro && String(mem.id_usuario_membro) === sId)
          );
          if (m && String(m.id) === alvoId) return true;
          return false;
        });

        if (!pertence) return false;
      }
    }

    // 4. Filtro de Status
    if (filtros.status !== 'todos') {
      const col = String(cartao.coluna || (cartao as unknown as { column?: string }).column || '');
      const dueDate = cartao.data_vencimento || (cartao as unknown as { due_date?: string }).due_date;
      const statusPrazo = calcularStatusPrazo(dueDate);
      const estaAtrasada =
        col !== 'done' &&
        (statusPrazo.status === 'atrasado' ||
          (statusPrazo.diasRestantes !== null && statusPrazo.diasRestantes < 0));

      if (filtros.status === 'atrasadas') {
        if (!estaAtrasada) return false;
      } else if (filtros.status === 'done') {
        if (col !== 'done') return false;
      } else if (filtros.status === 'in-progress') {
        if (col !== 'in-progress') return false;
      } else if (filtros.status === 'todo') {
        if (col !== 'todo') return false;
      }
    }

    // 5. Filtro de Período (baseado na data de criação)
    if (filtros.periodo !== 'todos') {
      const dataCriacaoStr = cartao.criado_em || (cartao as unknown as { created_at?: string }).created_at;
      if (!dataCriacaoStr) return false;
      const dataCriacao = new Date(dataCriacaoStr);

      if (filtros.periodo === 'hoje') {
        if (!isToday(dataCriacao)) return false;
      } else if (filtros.periodo === '7dias') {
        const limite = subDays(hoje, 7);
        if (dataCriacao < limite) return false;
      } else if (filtros.periodo === '15dias') {
        const limite = subDays(hoje, 15);
        if (dataCriacao < limite) return false;
      } else if (filtros.periodo === '30dias') {
        const limite = subDays(hoje, 30);
        if (dataCriacao < limite) return false;
      } else if (filtros.periodo === 'mes') {
        const inicioMes = startOfMonth(hoje);
        if (dataCriacao < inicioMes) return false;
      }
    }

    return true;
  });
}

// ── Métricas de Demandas (Pizza e KPIs) ────────────────────────────────

export function calcularMetricasDemandas(
  cartoes: CartaoComResponsavel[],
  hoje: Date = startOfToday()
): MetricasDemandas {
  const validos = cartoes.filter((c) => !isDemandaCancelada(c));
  const total = validos.length;

  if (total === 0) {
    return {
      total: 0,
      concluidas: 0,
      percentualConcluidas: 0,
      totalAbertas: 0,
      percentualAbertas: 0,
      abertasNoPrazo: 0,
      percentualAbertasNoPrazo: 0,
      abertasEmAndamento: 0,
      percentualAbertasEmAndamento: 0,
      abertasAFazer: 0,
      percentualAbertasAFazer: 0,
      atrasadas: 0,
      percentualAtrasadas: 0,
    };
  }

  let concluidas = 0;
  let atrasadas = 0;
  let abertasNoPrazo = 0;
  let abertasEmAndamento = 0;
  let abertasAFazer = 0;

  for (const c of validos) {
    if (isDemandaConcluida(c)) {
      concluidas++;
    } else {
      const col = String(c.coluna || (c as unknown as { column?: string }).column || '');
      if (col === 'in-progress') abertasEmAndamento++;
      else abertasAFazer++;

      const dueDate = c.data_vencimento || (c as unknown as { due_date?: string }).due_date;
      const statusPrazo = calcularStatusPrazo(dueDate);

      if (statusPrazo.status === 'atrasado' || (statusPrazo.diasRestantes !== null && statusPrazo.diasRestantes < 0)) {
        atrasadas++;
      } else {
        abertasNoPrazo++;
      }
    }
  }

  const totalAbertas = total - concluidas;

  return {
    total,
    concluidas,
    percentualConcluidas: Number(((concluidas / total) * 100).toFixed(1)),
    totalAbertas,
    percentualAbertas: Number(((totalAbertas / total) * 100).toFixed(1)),
    abertasNoPrazo,
    percentualAbertasNoPrazo: Number(((abertasNoPrazo / total) * 100).toFixed(1)),
    abertasEmAndamento,
    percentualAbertasEmAndamento: Number(((abertasEmAndamento / total) * 100).toFixed(1)),
    abertasAFazer,
    percentualAbertasAFazer: Number(((abertasAFazer / total) * 100).toFixed(1)),
    atrasadas,
    percentualAtrasadas: Number(((atrasadas / total) * 100).toFixed(1)),
  };
}

// ── SLA: Sem Responsável Fora do SLA ───────────────────────────────────

/**
 * Calcula a aderência ao SLA.
 * Regra: "Sem responsável fora do SLA". Demandas sem responsável NÃO entram no cálculo de SLA
 * e são contabilizadas em categoria separada "Fora do SLA".
 */
export function calcularMetricasSla(
  cartoes: CartaoComResponsavel[]
): MetricasSLA {
  const abertasValidas = cartoes.filter((c) => !isDemandaCancelada(c) && !isDemandaConcluida(c));

  let totalDemandasComResponsavel = 0;
  let noPrazoComResponsavel = 0;
  let atrasadasComResponsavel = 0;
  let totalSemResponsavelForaDoSla = 0;

  for (const c of abertasValidas) {
    const temResp = temResponsavelAtribuido(c);
    if (!temResp) {
      // Fora do SLA por não possuir responsável
      totalSemResponsavelForaDoSla++;
      continue;
    }

    totalDemandasComResponsavel++;
    const dueDate = c.data_vencimento || (c as unknown as { due_date?: string }).due_date;
    const statusPrazo = calcularStatusPrazo(dueDate);

    if (statusPrazo.status === 'atrasado' || (statusPrazo.diasRestantes !== null && statusPrazo.diasRestantes < 0)) {
      atrasadasComResponsavel++;
    } else {
      noPrazoComResponsavel++;
    }
  }

  const taxaAderenciaSla =
    totalDemandasComResponsavel > 0
      ? Number(((noPrazoComResponsavel / totalDemandasComResponsavel) * 100).toFixed(1))
      : 100;

  return {
    totalDemandasComResponsavel,
    noPrazoComResponsavel,
    atrasadasComResponsavel,
    taxaAderenciaSla,
    totalSemResponsavelForaDoSla,
  };
}

// ── Criador da Demanda ─────────────────────────────────────────────────

export function obterDadosCriador(
  cartao: CartaoComResponsavel,
  membros: MembroEquipe[] = [],
  usuarioAtual?: PerfilUsuario | null
): { nome: string; avatarUrl?: string | null; iniciais: string; email?: string | null } {
  const criadorId = cartao.id_usuario ?? (cartao as unknown as { user_id?: string }).user_id;

  if (criadorId) {
    const sId = String(criadorId);
    const membro = membros.find(
      (m) =>
        String(m.id) === sId ||
        (m.id_usuario && String(m.id_usuario) === sId) ||
        (m.id_usuario_membro && String(m.id_usuario_membro) === sId)
    );

    if (membro) {
      const nome = membro.nome_completo || membro.full_name || membro.email || 'Membro da Equipe';
      const iniciais = membro.iniciais || membro.initials || nome.slice(0, 2).toUpperCase();
      return {
        nome,
        avatarUrl: membro.url_avatar || membro.avatar_url,
        iniciais,
        email: membro.email,
      };
    }

    if (
      usuarioAtual &&
      (String(usuarioAtual.id) === sId ||
        ((usuarioAtual as unknown as { id_usuario?: string }).id_usuario &&
          String((usuarioAtual as unknown as { id_usuario?: string }).id_usuario) === sId))
    ) {
      const nome = usuarioAtual.nome_completo || (usuarioAtual as unknown as { full_name?: string }).full_name || 'Você';
      const iniciais = usuarioAtual.iniciais || (usuarioAtual as unknown as { initials?: string }).initials || nome.slice(0, 2).toUpperCase();
      return {
        nome,
        avatarUrl: usuarioAtual.url_avatar || (usuarioAtual as unknown as { avatar_url?: string }).avatar_url,
        iniciais,
        email: usuarioAtual.email,
      };
    }
  }

  return {
    nome: 'Não informado',
    avatarUrl: null,
    iniciais: 'NI',
    email: null,
  };
}

// ── Demandas Críticas ──────────────────────────────────────────────────

export function obterDemandasCriticas(
  cartoes: CartaoComResponsavel[],
  membros: MembroEquipe[] = [],
  usuarioAtual?: PerfilUsuario | null,
  limiteDias: number = 3
): DemandaCriticaItem[] {
  const itensCriticos: DemandaCriticaItem[] = [];

  for (const c of cartoes) {
    if (isDemandaCancelada(c) || isDemandaConcluida(c)) continue;

    const dueDate = c.data_vencimento || (c as unknown as { due_date?: string }).due_date;
    if (!dueDate) continue;

    const statusPrazo = calcularStatusPrazo(dueDate);
    if (statusPrazo.diasRestantes === null) continue;

    const dias = statusPrazo.diasRestantes;

    if (dias <= limiteDias) {
      let tipoUrgencia: DemandaCriticaItem['tipoUrgencia'] = 'proximos-dias';
      let textoPrazo = '';

      if (dias < 0) {
        tipoUrgencia = 'atrasada';
        const absDias = Math.abs(dias);
        textoPrazo = absDias === 1 ? 'Atrasada há 1 dia' : `Atrasada há ${absDias} dias`;
      } else if (dias === 0) {
        tipoUrgencia = 'hoje';
        textoPrazo = 'Vence hoje!';
      } else if (dias === 1) {
        tipoUrgencia = 'amanha';
        textoPrazo = 'Vence amanhã (1 dia)';
      } else {
        tipoUrgencia = 'proximos-dias';
        textoPrazo = `Faltam ${dias} dias`;
      }

      const criadorInfo = obterDadosCriador(c, membros, usuarioAtual);
      const semResp = !temResponsavelAtribuido(c);

      itensCriticos.push({
        cartao: c,
        diasRestantes: dias,
        textoPrazo,
        tipoUrgencia,
        nomeCriador: criadorInfo.nome,
        avatarCriador: criadorInfo.avatarUrl,
        iniciaisCriador: criadorInfo.iniciais,
        emailCriador: criadorInfo.email,
        semResponsavelForaDoSla: semResp,
      });
    }
  }

  // Ordena por maior urgência (menor diasRestantes vem primeiro)
  return itensCriticos.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

// ── Carga por Responsável ──────────────────────────────────────────────

export function calcularDemandasPorResponsavel(
  cartoes: CartaoComResponsavel[],
  membros: MembroEquipe[]
): {
  responsaveis: CargaResponsavelItem[];
  totalDemandasAbertas: number;
  totalNaoAtribuidas: number;
} {
  const abertas = cartoes.filter((c) => !isDemandaCancelada(c) && !isDemandaConcluida(c));
  const totalDemandasAbertas = abertas.length;

  const mapaResponsaveis = new Map<
    string,
    {
      membro: MembroEquipe;
      totalAbertas: number;
      aFazer: number;
      emAndamento: number;
      atrasadas: number;
    }
  >();

  for (const m of membros) {
    mapaResponsaveis.set(String(m.id), {
      membro: m,
      totalAbertas: 0,
      aFazer: 0,
      emAndamento: 0,
      atrasadas: 0,
    });
  }

  let totalNaoAtribuidas = 0;

  for (const c of abertas) {
    const col = String(c.coluna || (c as unknown as { column?: string }).column || '');
    const dueDate = c.data_vencimento || (c as unknown as { due_date?: string }).due_date;
    const statusPrazo = calcularStatusPrazo(dueDate);
    const estaAtrasada = statusPrazo.status === 'atrasado';

    const rawIds =
      c.ids_responsaveis && c.ids_responsaveis.length > 0
        ? c.ids_responsaveis
        : (c as unknown as { assignee_ids?: string[] }).assignee_ids && (c as unknown as { assignee_ids?: string[] }).assignee_ids!.length > 0
        ? (c as unknown as { assignee_ids?: string[] }).assignee_ids!
        : c.id_responsavel
        ? [c.id_responsavel]
        : (c as unknown as { assignee_id?: string }).assignee_id
        ? [(c as unknown as { assignee_id?: string }).assignee_id!]
        : [];

    if (rawIds.length === 0) {
      totalNaoAtribuidas++;
      continue;
    }

    const processadosNoCartao = new Set<string>();

    for (const rId of rawIds) {
      const sId = String(rId);
      const m = membros.find(
        (mem) =>
          String(mem.id) === sId ||
          (mem.id_usuario && String(mem.id_usuario) === sId) ||
          (mem.id_usuario_membro && String(mem.id_usuario_membro) === sId)
      );

      const chaveMembro = m ? String(m.id) : sId;
      if (processadosNoCartao.has(chaveMembro)) continue;
      processadosNoCartao.add(chaveMembro);

      if (!mapaResponsaveis.has(chaveMembro)) {
        mapaResponsaveis.set(chaveMembro, {
          membro: m || {
            id: chaveMembro,
            nome_completo: 'Membro',
            iniciais: 'M',
            email: '',
            funcao: 'member',
            status: 'active',
          },
          totalAbertas: 0,
          aFazer: 0,
          emAndamento: 0,
          atrasadas: 0,
        });
      }

      const item = mapaResponsaveis.get(chaveMembro)!;
      item.totalAbertas++;
      if (estaAtrasada) {
        item.atrasadas++;
      }
      if (col === 'in-progress') {
        item.emAndamento++;
      } else {
        item.aFazer++;
      }
    }
  }

  const lista: CargaResponsavelItem[] = [];

  for (const [, val] of mapaResponsaveis.entries()) {
    const totalResp = val.totalAbertas;
    const perc = totalDemandasAbertas > 0 ? Number(((totalResp / totalDemandasAbertas) * 100).toFixed(1)) : 0;
    const nome = val.membro.nome_completo || val.membro.full_name || val.membro.email || 'Membro';
    const iniciais = val.membro.iniciais || val.membro.initials || nome.slice(0, 2).toUpperCase();

    // No prazo: tarefas que não estão atrasadas
    const atrasadasVal = val.atrasadas;
    const emAndamentoNoPrazo = Math.max(0, val.emAndamento - Math.min(val.emAndamento, Math.max(0, atrasadasVal - val.aFazer)));
    const aFazerNoPrazo = Math.max(0, totalResp - atrasadasVal - emAndamentoNoPrazo);

    lista.push({
      id: String(val.membro.id),
      nome,
      iniciais,
      avatarUrl: val.membro.url_avatar || val.membro.avatar_url,
      email: val.membro.email,
      totalAbertas: totalResp,
      aFazer: val.aFazer,
      emAndamento: val.emAndamento,
      atrasadas: val.atrasadas,
      emAndamentoNoPrazo,
      aFazerNoPrazo,
      percentualDoTotal: perc,
    });
  }

  lista.sort((a, b) => b.totalAbertas - a.totalAbertas);

  return {
    responsaveis: lista,
    totalDemandasAbertas,
    totalNaoAtribuidas,
  };
}

// ── Tempo Médio de Resolução (Canceladas FORA) ─────────────────────────

export function calcularTempoMedioResolucao(
  cartoes: CartaoComResponsavel[]
): MetricasTempoResolucao {
  // Canceladas estritamente fora do cálculo
  const concluidasValidas = cartoes.filter(
    (c) => isDemandaConcluida(c) && !isDemandaCancelada(c)
  );

  const totalConcluidas = concluidasValidas.length;

  if (totalConcluidas === 0) {
    return {
      totalConcluidas: 0,
      cronometroTotalSegundos: 0,
      cronometroMedioSegundos: 0,
      cronometroMedioDias: 0,
      cronometroTextoFormatado: '0 min',
      calendarioMedioDias: 0,
      calendarioTotalDias: 0,
    };
  }

  let cronometroTotalSegundos = 0;
  let calendarioTotalDias = 0;

  for (const c of concluidasValidas) {
    // 1) Cronômetro ativo
    const tracker = c.rastreador_tempo ?? (c as unknown as { time_tracker?: CartaoComResponsavel['rastreador_tempo'] }).time_tracker;
    const segs =
      tracker?.tempo_total_segundos ??
      (tracker as unknown as { total_spent_seconds?: number })?.total_spent_seconds ??
      0;
    cronometroTotalSegundos += Math.max(0, segs);

    // 2) Dias brutos do calendário
    const criadoEmStr = c.criado_em || (c as unknown as { created_at?: string }).created_at;
    const criadoEm = criadoEmStr ? new Date(criadoEmStr) : new Date();

    const trackerConcluido = tracker?.concluido_em || (tracker as unknown as { completed_at?: string })?.completed_at;
    let dataFim = trackerConcluido ? new Date(trackerConcluido) : null;

    if (!dataFim || isNaN(dataFim.getTime())) {
      const pausas = tracker?.pausas || (tracker as unknown as { pauses?: Array<{ tipo?: string; type?: string; pausado_em?: string; paused_at?: string }> }).pauses || [];
      const logConclusao = pausas.find((p) => p.tipo === 'conclusao' || p.type === 'conclusao');
      const logData = logConclusao?.pausado_em || logConclusao?.paused_at;
      if (logData) {
        dataFim = new Date(logData);
      }
    }

    if (!dataFim || isNaN(dataFim.getTime())) {
      if (tracker?.ultima_acao_em) {
        dataFim = new Date(tracker.ultima_acao_em);
      } else {
        dataFim = new Date();
      }
    }

    const diffMs = Math.max(0, dataFim.getTime() - criadoEm.getTime());
    const diasFracionados = diffMs / (1000 * 60 * 60 * 24);
    calendarioTotalDias += diasFracionados;
  }

  const cronometroMedioSegundos = Math.round(cronometroTotalSegundos / totalConcluidas);
  const cronometroMedioDias = Number((cronometroMedioSegundos / 86400).toFixed(2));
  const cronometroTextoFormatado = formatarSegundosEmHoras(cronometroMedioSegundos);
  const calendarioMedioDias = Number((calendarioTotalDias / totalConcluidas).toFixed(1));

  return {
    totalConcluidas,
    cronometroTotalSegundos,
    cronometroMedioSegundos,
    cronometroMedioDias,
    cronometroTextoFormatado,
    calendarioMedioDias,
    calendarioTotalDias: Number(calendarioTotalDias.toFixed(1)),
  };
}

/**
 * Calcula o tempo médio de resolução segmentado por nível de prioridade (Alta, Média, Baixa),
 * sempre excluindo canceladas.
 */
export function calcularTempoMedioPorPrioridade(
  cartoes: CartaoComResponsavel[]
): MetricasTempoPorPrioridade[] {
  const configs: Array<{ prioridade: 'high' | 'medium' | 'low'; label: string; cor: string }> = [
    { prioridade: 'high', label: 'Alta Prioridade', cor: '#ef4444' },
    { prioridade: 'medium', label: 'Média Prioridade', cor: '#f59e0b' },
    { prioridade: 'low', label: 'Baixa Prioridade', cor: '#10b981' },
  ];

  return configs.map(({ prioridade, label, cor }) => {
    const doNivel = cartoes.filter(
      (c) =>
        (c.prioridade === prioridade || (c as unknown as { priority?: string }).priority === prioridade) &&
        isDemandaConcluida(c) &&
        !isDemandaCancelada(c)
    );

    const metrics = calcularTempoMedioResolucao(doNivel);

    return {
      prioridade,
      label,
      totalConcluidas: metrics.totalConcluidas,
      cronometroMedioDias: metrics.cronometroMedioDias,
      calendarioMedioDias: metrics.calendarioMedioDias,
      cor,
    };
  });
}
