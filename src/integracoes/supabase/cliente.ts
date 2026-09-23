import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function ehNovaChaveApiSupabase(valor: string): boolean {
  return valor.startsWith("sb_publishable_") || valor.startsWith("sb_secret_");
}

function criarFetchSupabase(chaveSupabase: string): typeof fetch {
  return (input, init) => {
    const cabecalhos = new Headers(
      typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((valor, chave) =>
        cabecalhos.set(chave, valor),
      );
    }

    if (
      ehNovaChaveApiSupabase(chaveSupabase) &&
      cabecalhos.get("Authorization") === `Bearer ${chaveSupabase}`
    ) {
      cabecalhos.delete("Authorization");
    }

    cabecalhos.set("apikey", chaveSupabase);
    return fetch(input, { ...init, headers: cabecalhos });
  };
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    global: {
      fetch: criarFetchSupabase(SUPABASE_PUBLISHABLE_KEY),
    },
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);




