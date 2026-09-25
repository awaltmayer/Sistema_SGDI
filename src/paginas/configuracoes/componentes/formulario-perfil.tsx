import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { Button } from '@/componentes/base/botao';
import { Input } from '@/componentes/ui/campo-texto';
import { Label } from '@/componentes/ui/rotulo';
import { useDataProvider } from '@/lib/provedor-dados';
import { toast } from 'sonner';
import { IconLoader2 } from '@tabler/icons-react';

export function FormularioPerfil() {
  const { useCurrentUser, useUpdateProfile } = useDataProvider();
  const { data: usuarioAtual } = useCurrentUser();
  const { mutate: atualizarPerfil, isPending: estaPendente } = useUpdateProfile();

  const [nome, setNome] = useState(usuarioAtual?.nome_completo ?? usuarioAtual?.full_name ?? '');

  const nomeAtual = usuarioAtual?.nome_completo ?? usuarioAtual?.full_name ?? '';

  useEffect(() => {
    if (nomeAtual) setNome(nomeAtual);
  }, [nomeAtual]);

  const iniciais = usuarioAtual?.iniciais ?? usuarioAtual?.initials ?? '';
  const email = usuarioAtual?.email ?? '';

  const houveAlteracao = useMemo(() => {
    if (!usuarioAtual) return false;
    return nome.trim() !== nomeAtual.trim() && nome.trim().length > 0;
  }, [nome, nomeAtual, usuarioAtual]);

  const salvarPerfil = () => {
    if (!usuarioAtual) return;
    const partes = nome.trim().split(' ');
    const novasIniciais =
      partes.length >= 2
        ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
        : nome.trim().slice(0, 2).toUpperCase();

    atualizarPerfil({
      nomeCompleto: nome.trim(),
      fullName: nome.trim(),
      iniciais: novasIniciais,
      initials: novasIniciais,
      email: usuarioAtual.email,
    });
    toast.success('Perfil salvo');
  };

  const avatarUrl = usuarioAtual?.url_avatar ?? usuarioAtual?.avatar_url ?? undefined;
  const nomeDisplay = usuarioAtual?.nome_completo ?? usuarioAtual?.full_name ?? 'Avatar do perfil';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Perfil</h2>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Foto de perfil</Label>
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            {avatarUrl && (
              <AvatarImage
                src={avatarUrl}
                alt={nomeDisplay}
              />
            )}
            <AvatarFallback className="text-base font-semibold">{iniciais}</AvatarFallback>
          </Avatar>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{nomeDisplay}</p>
            <p>{email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-name">Nome</Label>
        <Input
          id="profile-name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-email">E-mail</Label>
        <Input
          id="profile-email"
          value={email}
          disabled
          readOnly
          className="max-w-md"
        />
      </div>

      <Button disabled={!houveAlteracao || estaPendente} onClick={salvarPerfil}>
        {estaPendente && <IconLoader2 className="size-4 animate-spin mr-2" />}
        Salvar alterações
      </Button>
    </div>
  );
}

export const ProfileForm = FormularioPerfil;




