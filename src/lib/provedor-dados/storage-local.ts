import type { Checklist, Complexity, TaskTimeTracker } from "./tipos";

const SUPABASE_CHECKLISTS_KEY = "supabase-card-checklists-v1";

export function loadSupabaseChecklists(): Record<string, Checklist[]> {
  try {
    const raw = localStorage.getItem(SUPABASE_CHECKLISTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fallback para objeto vazio em caso de erro no storage */
  }
  return {};
}

export function saveSupabaseChecklists(map: Record<string, Checklist[]>): void {
  try {
    localStorage.setItem(SUPABASE_CHECKLISTS_KEY, JSON.stringify(map));
  } catch {
    /* erro silencioso no storage */
  }
}

const SUPABASE_METADATA_KEY = "supabase-card-metadata-v1";

export interface SupabaseCardMeta {
  complexity?: Complexity;
  time_tracker?: TaskTimeTracker;
}

export const DEFAULT_DEMO_METADATA: Record<string, SupabaseCardMeta> = {
  "19": {
    complexity: "high",
    time_tracker: {
      em_execucao: false,
      tempo_total_segundos: 6320,
      pausas: [
        {
          id: "pause-k8s-1",
          pausado_em: "2026-09-28T08:15:00.000Z",
          retomado_em: "2026-09-28T08:50:00.000Z",
          duracao_segundos: 2100,
          motivo: "Aguardando janela de manutenção autorizada pelo NOC",
          usuario_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
          usuario_nome: "ENIO NETO",
          usuario_email: "1138165@atitus.edu.br",
          tipo: "pausa",
        },
        {
          id: "pause-k8s-2",
          pausado_em: "2026-09-28T09:30:00.000Z",
          retomado_em: "2026-09-28T09:50:00.000Z",
          duracao_segundos: 1200,
          motivo: "Alinhamento técnico em call com a equipe de DevOps",
          usuario_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
          usuario_nome: "ENIO NETO",
          usuario_email: "1138165@atitus.edu.br",
          tipo: "pausa",
        },
      ],
    },
  },
  "20": {
    complexity: "high",
    time_tracker: {
      em_execucao: false,
      tempo_total_segundos: 8110,
      pausas: [
        {
          id: "pause-auth-1",
          pausado_em: "2026-09-28T12:00:00.000Z",
          retomado_em: "2026-09-28T13:00:00.000Z",
          duracao_segundos: 3600,
          motivo: "Intervalo de almoço da equipe de desenvolvimento",
          usuario_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
          usuario_nome: "ENIO NETO",
          usuario_email: "1138165@atitus.edu.br",
          tipo: "pausa",
        },
        {
          id: "pause-auth-2",
          pausado_em: "2026-09-28T14:15:00.000Z",
          retomado_em: "2026-09-28T15:00:00.000Z",
          duracao_segundos: 2700,
          motivo: "Aguardando liberação de credenciais no console da Google Cloud",
          usuario_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
          usuario_nome: "ENIO NETO",
          usuario_email: "1138165@atitus.edu.br",
          tipo: "pausa",
        },
      ],
    },
  },
  "21": {
    complexity: "high",
    time_tracker: {
      em_execucao: false,
      tempo_total_segundos: 3150,
      concluido_em: "2026-09-28T09:40:00.000Z",
      concluido_por_nome: "ENIO NETO",
      concluido_por_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
      concluido_por_email: "1138165@atitus.edu.br",
      pausas: [
        {
          id: "pause-ssl-1",
          pausado_em: "2026-09-28T08:50:00.000Z",
          retomado_em: "2026-09-28T09:05:00.000Z",
          duracao_segundos: 900,
          motivo: "Aguardando propagação dos registros DNS TXT para validação ACME",
          usuario_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
          usuario_nome: "ENIO NETO",
          usuario_email: "1138165@atitus.edu.br",
          tipo: "pausa",
        },
        {
          id: "conclusao-ssl",
          pausado_em: "2026-09-28T09:40:00.000Z",
          duracao_segundos: 0,
          motivo: "Demanda concluída (movida para a coluna Concluído)",
          usuario_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
          usuario_nome: "ENIO NETO",
          usuario_email: "1138165@atitus.edu.br",
          tipo: "conclusao",
        },
      ],
    },
  },
  "22": {
    complexity: "medium",
    time_tracker: {
      em_execucao: false,
      tempo_total_segundos: 11400,
      concluido_em: "2026-09-27T17:30:00.000Z",
      concluido_por_nome: "ENIO NETO",
      concluido_por_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
      concluido_por_email: "1138165@atitus.edu.br",
      pausas: [
        {
          id: "pause-cicd-1",
          pausado_em: "2026-09-27T14:00:00.000Z",
          retomado_em: "2026-09-27T14:40:00.000Z",
          duracao_segundos: 2400,
          motivo: "Configuração dos secrets e tokens de acesso no repositório GitHub",
          usuario_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
          usuario_nome: "ENIO NETO",
          usuario_email: "1138165@atitus.edu.br",
          tipo: "pausa",
        },
        {
          id: "conclusao-cicd",
          pausado_em: "2026-09-27T17:30:00.000Z",
          duracao_segundos: 0,
          motivo: "Demanda concluída (movida para a coluna Concluído)",
          usuario_id: "db2cb34a-708b-4a37-b760-800b4ec3e642",
          usuario_nome: "ENIO NETO",
          usuario_email: "1138165@atitus.edu.br",
          tipo: "conclusao",
        },
      ],
    },
  },
};

export function loadSupabaseMetadata(): Record<string, SupabaseCardMeta> {
  let map: Record<string, SupabaseCardMeta> = {};
  try {
    const raw = localStorage.getItem(SUPABASE_METADATA_KEY);
    if (raw) map = JSON.parse(raw);
  } catch {
    map = {};
  }

  // Preenche dados padrão dos cartões de demonstração se não existirem
  let alterou = false;
  for (const [id, defaultMeta] of Object.entries(DEFAULT_DEMO_METADATA)) {
    if (!map[id]) {
      map[id] = defaultMeta;
      alterou = true;
    }
  }
  if (alterou) {
    try {
      localStorage.setItem(SUPABASE_METADATA_KEY, JSON.stringify(map));
    } catch {
      /* erro silencioso */
    }
  }

  return map;
}

export function saveSupabaseMetadata(map: Record<string, SupabaseCardMeta>): void {
  try {
    localStorage.setItem(SUPABASE_METADATA_KEY, JSON.stringify(map));
  } catch {
    /* erro silencioso no storage */
  }
}
