import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as credenciais do Supabase foram efetivamente configuradas
export const supabaseConfigurado = Boolean(
  SUPABASE_URL &&
    SUPABASE_URL.startsWith("http") &&
    !SUPABASE_URL.includes("seu-projeto.supabase.co") &&
    SUPABASE_PUBLISHABLE_KEY &&
    !SUPABASE_PUBLISHABLE_KEY.includes("sua-chave")
);

// Fallbacks seguros para evitar que o createClient dispare um erro fatal no carregamento do módulo
const urlFinal =
  SUPABASE_URL && SUPABASE_URL.startsWith("http")
    ? SUPABASE_URL
    : "https://placeholder-projeto.supabase.co";

const chaveFinal =
  SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder-chave-supabase";

function ehNovaChaveApiSupabase(valor?: string): boolean {
  if (!valor || typeof valor !== "string") return false;
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
      chaveSupabase &&
      ehNovaChaveApiSupabase(chaveSupabase) &&
      cabecalhos.get("Authorization") === `Bearer ${chaveSupabase}`
    ) {
      cabecalhos.delete("Authorization");
    }

    if (chaveSupabase) {
      cabecalhos.set("apikey", chaveSupabase);
    }
    return fetch(input, { ...init, headers: cabecalhos });
  };
}

export const supabase = createClient<Database>(
  urlFinal,
  chaveFinal,
  {
    global: {
      fetch: criarFetchSupabase(chaveFinal),
    },
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

