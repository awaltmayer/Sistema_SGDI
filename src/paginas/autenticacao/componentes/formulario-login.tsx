import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/componentes/ui/botao-ui';
import { Input } from '@/componentes/ui/campo-texto';
import { Label } from '@/componentes/ui/rotulo';
import { IconLoader2 } from '@tabler/icons-react';
import { supabase } from '@/integracoes/supabase/cliente';
import './formulario-login.css';

interface PropsFormularioLogin {
  aoAlternarAba: () => void;
}

export function FormularioLogin({ aoAlternarAba }: PropsFormularioLogin) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const rotaOrigem = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/board';

  const enviarFormulario = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const { error: erroAuth } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (erroAuth) {
      setErro(erroAuth.message);
      setEnviando(false);
      return;
    }

    navigate(rotaOrigem, { replace: true });
  };

  return (
    <form onSubmit={enviarFormulario} className="sgdi-formulario-login">
      <div className="sgdi-campo-grupo">
        <Label htmlFor="signin-email">E-mail</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="seu.email@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="sgdi-campo-grupo">
        <Label htmlFor="signin-password">Senha</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </div>
      {erro && (
        <p className="sgdi-erro-form">{erro}</p>
      )}
      <Button type="submit" disabled={enviando}>
        {enviando ? (
          <>
            <IconLoader2 className="animate-spin" />
            Entrando…
          </>
        ) : (
          'Entrar →'
        )}
      </Button>
      <p className="sgdi-texto-troca-aba">
        Não tem conta?{' '}
        <button
          type="button"
          className="sgdi-botao-link"
          onClick={aoAlternarAba}
        >
          Ir para cadastro
        </button>
      </p>
    </form>
  );
}

export const SignInForm = FormularioLogin;
