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

export function loadSupabaseMetadata(): Record<string, SupabaseCardMeta> {
  try {
    const raw = localStorage.getItem(SUPABASE_METADATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fallback para objeto vazio em caso de erro no storage */
  }
  return {};
}

export function saveSupabaseMetadata(map: Record<string, SupabaseCardMeta>): void {
  try {
    localStorage.setItem(SUPABASE_METADATA_KEY, JSON.stringify(map));
  } catch {
    /* erro silencioso no storage */
  }
}
