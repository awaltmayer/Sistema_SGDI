import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integracoes/supabase/cliente";
import { ROTA_PADRAO_AUTENTICADA, ROTA_DESCONECTADO } from "@/lib/rotas-autenticacao";
import "./retorno-oauth.css";

export default function RetornoOAuth() {
  const navigate = useNavigate();
  const executou = useRef(false);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (executou.current) return;
    executou.current = true;

    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = url.searchParams.get("code");

      try {
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(url.href);
        }
      } catch {
        // Ignora e deixa a checagem da sessão decidir
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate(ROTA_PADRAO_AUTENTICADA, { replace: true });
      } else {
        setFalhou(true);
      }
    })();
  }, [navigate]);

  if (falhou) {
    return (
      <div className="sgdi-retorno-oauth-falha">
        <p className="sgdi-retorno-oauth-texto">
          Não foi possível concluir seu login. Por favor, tente novamente.
        </p>
        <button
          onClick={() => navigate(ROTA_DESCONECTADO, { replace: true })}
          className="sgdi-retorno-oauth-botao"
        >
          Voltar para login
        </button>
      </div>
    );
  }

  return (
    <div className="sgdi-retorno-oauth-loading">
      <div className="sgdi-spinner-oauth" />
    </div>
  );
}
