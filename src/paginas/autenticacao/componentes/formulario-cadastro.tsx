import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/componentes/ui/botao-ui';
import { Input } from '@/componentes/ui/campo-texto';
import { Label } from '@/componentes/ui/rotulo';
import { IconLoader2 } from '@tabler/icons-react';
import { supabase } from '@/integracoes/supabase/cliente';
import { SucessoCadastro } from './sucesso-cadastro';
import './formulario-cadastro.css';

interface PropsFormularioCadastro {
  aoAlternarAba: () => void;
}

export function FormularioCadastro({ aoAlternarAba }: PropsFormularioCadastro) {
  const navigate = useNavigate();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [emailSucesso, setEmailSucesso] = useState<string | null>(null);

  const enviarFormulario = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const { data, error: erroAuth } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: nomeCompleto },
      },
    });

    if (erroAuth) {
      setErro(erroAuth.message);
      setEnviando(false);
      return;
    }

    if (data.session) {
      navigate('/board', { replace: true });
      return;
    }

    setEmailSucesso(email);
    setEnviando(false);
  };

  if (emailSucesso) {
    return <SucessoCadastro email={emailSucesso} />;
  }

  return (
    <form onSubmit={enviarFormulario} className="sgdi-formulario-cadastro">
      <div className="sgdi-cadastro-campo-grupo">
        <Label htmlFor="signup-fullname">Nome completo</Label>
        <Input
          id="signup-fullname"
          type="text"
          placeholder="Seu Nome Completo"
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
          required
        />
      </div>
      <div className="sgdi-cadastro-campo-grupo">
        <Label htmlFor="signup-email">E-mail</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="seu.email@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="sgdi-cadastro-campo-grupo">
        <Label htmlFor="signup-password">Senha</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </div>
      {erro && (
        <p className="sgdi-cadastro-erro">{erro}</p>
      )}
      <Button type="submit" disabled={enviando}>
        {enviando ? (
          <>
            <IconLoader2 className="animate-spin" />
            Criando conta…
          </>
        ) : (
          'Criar conta →'
        )}
      </Button>
      <p className="sgdi-cadastro-rodape-texto">
        Já tem uma conta?{' '}
        <button
          type="button"
          className="sgdi-cadastro-link-botao"
          onClick={aoAlternarAba}
        >
          Ir para login
        </button>
      </p>
    </form>
  );
}

export const SignUpForm = FormularioCadastro;
