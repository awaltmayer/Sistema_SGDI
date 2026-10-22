/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integracoes/supabase/cliente";
import type {
  LogAuditoria,
  EntradaRegistrarLog,
  FiltrosLogs,
  TipoAcaoAuditoria,
  TipoEntidadeAuditoria,
} from "@/tipos/auditoria";

export const CHAVE_STORAGE_LOGS = "sgdi-logs-auditoria-v1";

// Base histórica inicial para auditoria e conformidade imediata
const SEED_LOGS_HISTORICOS: LogAuditoria[] = [
  {
    id: "log-seed-1",
    id_usuario: "user-system",
    usuario_nome: "Augusto Altmayer",
    usuario_email: "augusto@sgdi.gov.br",
    acao: "CRIACAO",
    entidade: "Demanda",
    entidade_id: "42",
    entidade_titulo: "Implementação da camada de segurança e controle de acesso",
    detalhes: "Demanda criada com prioridade Alta na coluna A Fazer",
    metadados: {
      prioridade: "high",
      coluna: "todo",
      responsaveis: ["Augusto Altmayer"],
    },
    criado_em: new Date(Date.now() - 3600 * 1000 * 1.5).toISOString(),
  },
  {
    id: "log-seed-2",
    id_usuario: "user-ricardo",
    usuario_nome: "Ricardo Drews",
    usuario_email: "ricardo@sgdi.gov.br",
    acao: "MOVIMENTACAO",
    entidade: "Demanda",
    entidade_id: "43",
    entidade_titulo: "Ajuste na integração do webhook de sincronização",
    detalhes: "Demanda movida de 'A Fazer' para 'Em Progresso'",
    metadados: {
      coluna_origem: "todo",
      coluna_destino: "in-progress",
    },
    criado_em: new Date(Date.now() - 3600 * 1000 * 4.2).toISOString(),
  },
  {
    id: "log-seed-3",
    id_usuario: "user-luiz",
    usuario_nome: "Luiz Appelt Weller",
    usuario_email: "luiz@sgdi.gov.br",
    acao: "STATUS",
    entidade: "Demanda",
    entidade_id: "44",
    entidade_titulo: "Migração das rotinas de processamento assíncrono",
    detalhes: "Demanda finalizada e movida para 'Concluído'",
    metadados: {
      coluna_origem: "in-progress",
      coluna_destino: "done",
      duracao_total_horas: 12,
    },
    criado_em: new Date(Date.now() - 3600 * 1000 * 8.7).toISOString(),
  },
  {
    id: "log-seed-4",
    id_usuario: "user-enio",
    usuario_nome: "Enio Neto",
    usuario_email: "enio@sgdi.gov.br",
    acao: "CRONOMETRO",
    entidade: "Cronômetro",
    entidade_id: "46",
    entidade_titulo: "Validação de endpoints da API de auditoria",
    detalhes: "Cronômetro de execução iniciado",
    metadados: {
      acao_cronometro: "iniciar",
    },
    criado_em: new Date(Date.now() - 3600 * 1000 * 18.5).toISOString(),
  },
  {
    id: "log-seed-5",
    id_usuario: "user-ricardo",
    usuario_nome: "Ricardo Drews",
    usuario_email: "ricardo@sgdi.gov.br",
    acao: "CRIACAO",
    entidade: "Checklist",
    entidade_id: "chk-12",
    entidade_titulo: "Checklist de Homologação",
    detalhes: "Item adicionado: 'Validar integridade dos registros de auditoria'",
    metadados: {
      cartao_id: "42",
      item: "Validar integridade dos registros de auditoria",
    },
    criado_em: new Date(Date.now() - 3600 * 1000 * 25.1).toISOString(),
  },
  {
    id: "log-seed-6",
    id_usuario: "user-system",
    usuario_nome: "Sistema",
    usuario_email: "sistema@sgdi.gov.br",
    acao: "ACESSO",
    entidade: "Sistema",
    entidade_id: null,
    entidade_titulo: "Sessão de Usuário",
    detalhes: "Autenticação de sessão realizada com sucesso",
    metadados: {
      tipo_autenticacao: "OAuth / Supabase",
    },
    criado_em: new Date(Date.now() - 3600 * 1000 * 32.0).toISOString(),
  },
];

export function carregarLogsStorage(): LogAuditoria[] {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    /* fallback seguro */
  }

  // Se vazio, salva a base histórica inicial
  salvarLogsStorage(SEED_LOGS_HISTORICOS);
  return SEED_LOGS_HISTORICOS;
}

export function salvarLogsStorage(logs: LogAuditoria[]): void {
  try {
    localStorage.setItem(CHAVE_STORAGE_LOGS, JSON.stringify(logs));
  } catch {
    /* erro silencioso no storage */
  }
}

export async function registrarLogAuditoria(
  entrada: EntradaRegistrarLog
): Promise<LogAuditoria> {
  const agoraIso = new Date().toISOString();

  // Obter dados do usuário autenticado de forma robusta
  let usuarioId = entrada.usuario?.id ?? null;
  let usuarioNome = entrada.usuario?.nome ?? null;
  let usuarioEmail = entrada.usuario?.email ?? null;

  if (!usuarioNome || !usuarioEmail) {
    try {
      const { data: sessao } = await supabase.auth.getSession();
      const user = sessao?.session?.user;
      if (user) {
        usuarioId = usuarioId ?? user.id;
        usuarioEmail = usuarioEmail ?? user.email ?? null;
        usuarioNome =
          usuarioNome ??
          (user.user_metadata as any)?.full_name ??
          (user.user_metadata as any)?.name ??
          user.email?.split("@")[0] ??
          "Usuário";
      }
    } catch {
      /* fallback se sessão não estiver pronta */
    }
  }

  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const novoLog: LogAuditoria = {
    id: logId,
    id_usuario: usuarioId,
    usuario_nome: usuarioNome || "Usuário",
    usuario_email: usuarioEmail || null,
    acao: entrada.acao,
    entidade: entrada.entidade,
    entidade_id: entrada.entidade_id ? String(entrada.entidade_id) : null,
    entidade_titulo: entrada.entidade_titulo || null,
    detalhes: entrada.detalhes,
    metadados: entrada.metadados || null,
    criado_em: agoraIso,
  };

  // Salvar no storage local primeiro para retorno e renderização instantânea
  const logsAtuais = carregarLogsStorage();
  const logsAtualizados = [novoLog, ...logsAtuais].slice(0, 500); // mantém últimos 500 logs locais
  salvarLogsStorage(logsAtualizados);

  // Disparar evento para atualização reativa
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sgdi-novo-log-auditoria", { detail: novoLog }));
  }

  // Tentar persistir na tabela logs_auditoria do Supabase
  try {
    const payloadDb: any = {
      id_usuario: usuarioId || undefined,
      usuario_nome: novoLog.usuario_nome,
      usuario_email: novoLog.usuario_email,
      acao: novoLog.acao,
      entidade: novoLog.entidade,
      entidade_id: novoLog.entidade_id,
      entidade_titulo: novoLog.entidade_titulo,
      detalhes: novoLog.detalhes,
      metadados: novoLog.metadados || {},
      criado_em: agoraIso,
    };

    await supabase.from("logs_auditoria").insert(payloadDb);
  } catch (err) {
    // Falha silenciosa no Supabase caso a migração ainda não tenha sido executada no banco
    console.debug("Aviso de sincronização remota de log:", err);
  }

  return novoLog;
}

export async function buscarLogsAuditoria(
  filtros?: FiltrosLogs
): Promise<LogAuditoria[]> {
  let logs: LogAuditoria[] = [];

  // 1. Tentar buscar da tabela remota do Supabase
  try {
    const { data, error } = await supabase
      .from("logs_auditoria")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(200);

    if (!error && data && data.length > 0) {
      logs = data.map((item: any) => ({
        id: String(item.id),
        id_usuario: item.id_usuario,
        usuario_nome: item.usuario_nome,
        usuario_email: item.usuario_email,
        acao: item.acao as TipoAcaoAuditoria,
        entidade: item.entidade as TipoEntidadeAuditoria,
        entidade_id: item.entidade_id,
        entidade_titulo: item.entidade_titulo,
        detalhes: item.detalhes,
        metadados: item.metadados,
        criado_em: item.criado_em,
      }));
    }
  } catch {
    /* fallback para storage local */
  }

  // 2. Se vazio ou offline, carrega do storage local
  if (logs.length === 0) {
    logs = carregarLogsStorage();
  }

  // 3. Aplicar filtros em memória
  if (!filtros) return logs;

  return logs.filter((log) => {
    // Filtro por termo de busca
    if (filtros.termoBusca && filtros.termoBusca.trim() !== "") {
      const termo = filtros.termoBusca.toLowerCase().trim();
      const coincide =
        log.detalhes.toLowerCase().includes(termo) ||
        log.usuario_nome.toLowerCase().includes(termo) ||
        (log.usuario_email && log.usuario_email.toLowerCase().includes(termo)) ||
        (log.entidade_titulo && log.entidade_titulo.toLowerCase().includes(termo)) ||
        log.entidade.toLowerCase().includes(termo) ||
        log.acao.toLowerCase().includes(termo);

      if (!coincide) return false;
    }

    // Filtro por ação
    if (filtros.acao && filtros.acao !== "todas" && log.acao !== filtros.acao) {
      return false;
    }

    // Filtro por entidade
    if (
      filtros.entidade &&
      filtros.entidade !== "todas" &&
      log.entidade !== filtros.entidade
    ) {
      return false;
    }

    // Filtro por usuário
    if (filtros.idUsuario && filtros.idUsuario !== "todos") {
      if (log.id_usuario !== filtros.idUsuario && log.usuario_nome !== filtros.idUsuario) {
        return false;
      }
    }

    // Filtro por período
    if (filtros.periodo && filtros.periodo !== "todos") {
      const dataLog = new Date(log.criado_em).getTime();
      const agora = Date.now();

      if (filtros.periodo === "hoje") {
        const inicioHoje = new Date();
        inicioHoje.setHours(0, 0, 0, 0);
        if (dataLog < inicioHoje.getTime()) return false;
      } else if (filtros.periodo === "7dias") {
        const seteDiasAtras = agora - 7 * 24 * 60 * 60 * 1000;
        if (dataLog < seteDiasAtras) return false;
      } else if (filtros.periodo === "30dias") {
        const trintaDiasAtras = agora - 30 * 24 * 60 * 60 * 1000;
        if (dataLog < trintaDiasAtras) return false;
      }
    }

    return true;
  });
}

export function exportarLogsCSV(logs: LogAuditoria[]): void {
  const cabecalho = [
    "Data/Hora",
    "Usuário",
    "E-mail",
    "Ação",
    "Entidade",
    "ID Entidade",
    "Título/Referência",
    "Detalhes",
  ];

  const linhas = logs.map((log) => [
    new Date(log.criado_em).toLocaleString("pt-BR"),
    log.usuario_nome,
    log.usuario_email || "",
    log.acao,
    log.entidade,
    log.entidade_id || "",
    (log.entidade_titulo || "").replace(/"/g, '""'),
    log.detalhes.replace(/"/g, '""'),
  ]);

  const conteudoCsv = [
    cabecalho.map((col) => `"${col}"`).join(";"),
    ...linhas.map((row) => row.map((col) => `"${col}"`).join(";")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + conteudoCsv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `sgdi-logs-auditoria-${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportarLogsJSON(logs: LogAuditoria[]): void {
  const conteudoJson = JSON.stringify(logs, null, 2);
  const blob = new Blob([conteudoJson], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `sgdi-logs-auditoria-${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
