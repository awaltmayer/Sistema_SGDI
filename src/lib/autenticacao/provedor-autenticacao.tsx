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

  const sincronizarUsuario = async (u: User) => {
    if (!u.email) return;
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
    const avatar =
      (meta.avatar_url as string | undefined) ?? (meta.picture as string | undefined) ?? null;
    const nomeCompleto =
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      u.email.split('@')[0];
    const iniciais = nomeCompleto.slice(0, 2).toUpperCase() || 'U';

    try {
      const { data } = await supabase
        .from('usuarios')
        .select('id, id_usuario, url_avatar, nome_completo, email')
        .or(`id_usuario.eq.${u.id},email.eq.${u.email}`)
        .maybeSingle();

      if (!data) {
        // Cria automaticamente se ainda não existir
        await supabase.from('usuarios').insert({
          id_usuario: u.id,
          nome_completo: nomeCompleto,
          iniciais,
          email: u.email,
          url_avatar: avatar,
          funcao: 'Membro',
          status: 'active',
          tema: 'dark',
        });
      } else {
        const patch: Record<string, any> = {};
        if (!data.id_usuario) patch.id_usuario = u.id;
        if (avatar && !data.url_avatar) patch.url_avatar = avatar;
        if (nomeCompleto && !data.nome_completo) patch.nome_completo = nomeCompleto;
        if (Object.keys(patch).length > 0) {
          await supabase.from('usuarios').update(patch).eq('id', data.id);
        }
      }
    } catch (err) {
      console.warn('Aviso ao sincronizar usuário com banco:', err);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sessaoAtual) => {
      setSessao(sessaoAtual);
      setUsuario(sessaoAtual?.user ?? null);
      setCarregando(false);

      if ((evento === 'SIGNED_IN' || evento === 'TOKEN_REFRESHED' || evento === 'INITIAL_SESSION') && sessaoAtual?.user) {
        void sincronizarUsuario(sessaoAtual.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sessaoAtual } }) => {
      setSessao(sessaoAtual);
      setUsuario(sessaoAtual?.user ?? null);
      setCarregando(false);

      if (sessaoAtual?.user) {
        void sincronizarUsuario(sessaoAtual.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const desconectar = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUsuario(null);
      setSessao(null);
    }
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
