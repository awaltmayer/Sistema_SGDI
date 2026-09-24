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
        if (avatar || nomeCompleto || u.email) {
          setTimeout(() => {
            supabase
              .from('usuarios')
              .select('id, id_usuario, url_avatar, nome_completo, email')
              .or(`id_usuario.eq.${u.id},email.eq.${u.email}`)
              .maybeSingle()
              .then(({ data }) => {
                const patch: { url_avatar?: string; nome_completo?: string; id_usuario?: string } = {};
                if (!data?.id_usuario) patch.id_usuario = u.id;
                if (avatar && !data?.url_avatar) patch.url_avatar = avatar;
                if (nomeCompleto && !data?.nome_completo) patch.nome_completo = nomeCompleto;
                if (Object.keys(patch).length > 0 && data?.id) {
                  void supabase.from('usuarios').update(patch).eq('id', data.id);
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

export function useAutenticacao() {
  const ctx = useContext(ContextoAuth);
  if (!ctx) throw new Error('useAutenticacao deve ser usado dentro de ProvedorAutenticacao');
  return ctx;
}

export const useAuth = useAutenticacao;
export const usarAutenticacao = useAutenticacao;
