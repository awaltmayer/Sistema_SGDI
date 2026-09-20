import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integracoes/supabase/cliente';
import type { User, Session } from '@supabase/supabase-js';

interface ContextoAutenticacao {
  usuario: User | null;
  sessao: Session | null;
  carregando: boolean;
  desconectar: () => Promise<void>;
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const ContextoAuth = createContext<ContextoAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((evento, sessaoAtual) => {
        if (!ativo) return;
        setSessao(sessaoAtual);
        setUsuario(sessaoAtual?.user ?? null);
        setCarregando(false);

        if (evento === 'SIGNED_IN' && sessaoAtual?.user) {
          const u = sessaoAtual.user;
          const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
          const avatar =
            (meta.avatar_url as string | undefined) ?? (meta.picture as string | undefined) ?? null;
          const nomeCompleto =
            (meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? null;
          if (avatar || nomeCompleto) {
            setTimeout(() => {
              supabase
                .from('perfis')
                .select('url_avatar, nome_completo')
                .eq('id', u.id)
                .maybeSingle()
                .then(({ data }) => {
                  const patch: { url_avatar?: string; nome_completo?: string } = {};
                  if (avatar && !data?.url_avatar) patch.url_avatar = avatar;
                  if (nomeCompleto && !data?.nome_completo) patch.nome_completo = nomeCompleto;
                  if (Object.keys(patch).length > 0) {
                    void supabase.from('perfis').update(patch).eq('id', u.id);
                  }
                  const tmPatch: { url_avatar?: string; nome_completo?: string } = {};
                  if (avatar) tmPatch.url_avatar = avatar;
                  if (nomeCompleto) tmPatch.nome_completo = nomeCompleto;
                  if (Object.keys(tmPatch).length > 0) {
                    void supabase
                      .from('membros_equipe')
                      .update(tmPatch)
                      .eq('id_usuario', u.id)
                      .eq('id_usuario_membro', u.id);
                  }
                })
                .catch(() => {});
            }, 0);
          }
        }
      });

      supabase.auth
        .getSession()
        .then(({ data: { session: sessaoAtual } }) => {
          if (!ativo) return;
          setSessao(sessaoAtual);
          setUsuario(sessaoAtual?.user ?? null);
          setCarregando(false);
        })
        .catch((erro) => {
          console.warn("Não foi possível carregar a sessão do Supabase:", erro);
          if (ativo) setCarregando(false);
        });

      return () => {
        ativo = false;
        subscription?.unsubscribe();
      };
    } catch (erro) {
      console.warn("Erro ao inicializar autenticação Supabase:", erro);
      setCarregando(false);
    }
  }, []);

  const desconectar = async () => {
    await supabase.auth.signOut();
  };

  const valorContexto: ContextoAutenticacao = {
    usuario,
    sessao,
    carregando,
    desconectar,
    user: usuario,
    session: sessao,
    loading: carregando,
    signOut: desconectar,
  };

  return (
    <ContextoAuth.Provider value={valorContexto}>
      {children}
    </ContextoAuth.Provider>
  );
}

export const AuthProvider = ProvedorAutenticacao;

export function usarAutenticacao() {
  const ctx = useContext(ContextoAuth);
  if (!ctx) throw new Error('usarAutenticacao deve ser usado dentro de ProvedorAutenticacao');
  return ctx;
}

export const useAuth = usarAutenticacao;
