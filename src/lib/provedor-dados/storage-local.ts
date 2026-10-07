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
  "42": {
    "complexity": "high",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 172800,
      "concluido_em": "2026-10-03T23:26:30.151Z",
      "concluido_por_nome": "ENIO NETO",
      "pausas": []
    }
  },
  "43": {
    "complexity": "medium",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 86400,
      "concluido_em": "2026-10-05T23:26:30.151Z",
      "concluido_por_nome": "LUIZ APPELT WELLER",
      "pausas": []
    }
  },
  "44": {
    "complexity": "high",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 43200,
      "concluido_em": "2026-10-01T23:26:30.151Z",
      "concluido_por_nome": "Ricardo Drews",
      "pausas": []
    }
  },
  "45": {
    "complexity": "low",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 14400,
      "concluido_em": "2026-10-04T23:26:30.151Z",
      "concluido_por_nome": "Augusto Altmayer",
      "pausas": []
    }
  },
  "46": {
    "complexity": "high",
    "time_tracker": {
      "em_execucao": true,
      "tempo_total_segundos": 28800,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "47": {
    "complexity": "high",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 3600,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "48": {
    "complexity": "medium",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 21600,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "49": {
    "complexity": "medium",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 0,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "50": {
    "complexity": "high",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 50400,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "51": {
    "complexity": "medium",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 0,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "52": {
    "complexity": "high",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 0,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "53": {
    "complexity": "medium",
    "time_tracker": {
      "em_execucao": true,
      "tempo_total_segundos": 18000,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "54": {
    "complexity": "low",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 0,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "55": {
    "complexity": "low",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 0,
      "concluido_em": null,
      "concluido_por_nome": "Equipe de TI",
      "pausas": []
    }
  },
  "56": {
    "complexity": "low",
    "time_tracker": {
      "em_execucao": false,
      "tempo_total_segundos": 7200,
      "concluido_em": "2026-09-26T23:26:30.152Z",
      "concluido_por_nome": "Sistema",
      "pausas": []
    }
  }
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
