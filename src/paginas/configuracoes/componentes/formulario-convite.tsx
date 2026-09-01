import { useState } from 'react';
import { Button } from '@/componentes/base/botao';
import { Input } from '@/componentes/ui/campo-texto';
import { Label } from '@/componentes/ui/rotulo';
import { useDataProvider } from '@/lib/provedor-dados';
import { IconLoader2, IconCheck } from '@tabler/icons-react';

export function FormularioConvite() {
  const { useInviteTeamMember } = useDataProvider();
  const { mutate: convidarMembro, isPending: estaPendente } = useInviteTeamMember();

  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [emailSucesso, setEmailSucesso] = useState('');

  const enviarConvite = (e: React.FormEvent) => {
    e.preventDefault();

    const emailLimpo = email.trim();
    if (!emailLimpo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setErro('Digite um endereço de e-mail válido');
      return;
    }

    setErro('');
    convidarMembro(emailLimpo);
    setEmailSucesso(emailLimpo);
    setEmail('');

    setTimeout(() => setEmailSucesso(''), 3000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Convidar membro da equipe
      </h2>

      <form onSubmit={enviarConvite} className="flex items-end gap-4">
        <div className="flex-1 max-w-md space-y-2">
          <Label htmlFor="invite-email">Endereço de e-mail</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colega@atitus.edu.br"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErro('');
            }}
          />
          {erro && <p className="text-sm text-destructive">{erro}</p>}
        </div>
        <Button type="submit" disabled={estaPendente}>
          {estaPendente && <IconLoader2 className="size-4 animate-spin" />}
          Enviar convite
        </Button>
      </form>

      {emailSucesso && (
        <p className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
          <IconCheck className="size-4" />
          Convite enviado para {emailSucesso}
        </p>
      )}

      <p className="text-sm text-muted-foreground">
        Membros convidados recebem um e-mail para entrar no seu quadro.
      </p>
    </div>
  );
}

export const InviteForm = FormularioConvite;

