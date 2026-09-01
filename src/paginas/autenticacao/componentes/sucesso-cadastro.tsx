import { IconMail } from '@tabler/icons-react';
import './sucesso-cadastro.css';

interface PropsSucessoCadastro {
  email: string;
}

export function SucessoCadastro({ email }: PropsSucessoCadastro) {
  return (
    <div className="sgdi-sucesso-cadastro">
      <IconMail className="sgdi-sucesso-icone" />
      <h2 className="sgdi-sucesso-titulo">Verifique seu e-mail</h2>
      <p className="sgdi-sucesso-texto">
        Enviamos um link de confirmação para{' '}
        <span className="sgdi-sucesso-email-destaque">{email}</span>
      </p>
      <p className="sgdi-sucesso-texto">
        Clique no link do e-mail para ativar sua conta.
      </p>
      <p className="sgdi-sucesso-aviso-spam">
        Não recebeu? Verifique sua pasta de spam.
      </p>
    </div>
  );
}

export const SignUpSuccess = SucessoCadastro;
