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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sessaoAtual) => {
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
              .from('profiles')
              .select('avatar_url, full_name')
              .eq('id', u.id)
              .maybeSingle()
              .then(({ data }) => {
                const patch: { avatar_url?: string; full_name?: string } = {};
                if (avatar && !data?.avatar_url) patch.avatar_url = avatar;
                if (nomeCompleto && !data?.full_name) patch.full_name = nomeCompleto;
                if (Object.keys(patch).length > 0) {
                  void supabase.from('profiles').update(patch).eq('id', u.id);
                }
                const tmPatch: { avatar_url?: string; full_name?: string } = {};
                if (avatar) tmPatch.avatar_url = avatar;
                if (nomeCompleto) tmPatch.full_name = nomeCompleto;
                if (Object.keys(tmPatch).length > 0) {
                  void supabase
                    .from('team_members')
                    .update(tmPatch)
                    .eq('user_id', u.id)
                    .eq('member_user_id', u.id);
                }
              });
          }, 0);
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session: sessaoAtual } }) => {
      setSessao(sessaoAtual);
      setUsuario(sessaoAtual?.user ?? null);
      setCarregando(false);
    });

    return () => subscription.unsubscribe();
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




