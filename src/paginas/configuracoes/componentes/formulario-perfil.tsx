import { useState, useRef, useMemo, useEffect } from 'react';
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

  const [nome, setNome] = useState(usuarioAtual?.full_name ?? '');
  const [previaAvatar, setPreviaAvatar] = useState<string | null>(null);
  const refInputArquivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (usuarioAtual?.full_name) setNome(usuarioAtual.full_name);
  }, [usuarioAtual?.full_name]);

  const iniciais = usuarioAtual?.initials ?? '';
  const email = usuarioAtual?.email ?? '';

  const houveAlteracao = useMemo(() => {
    if (!usuarioAtual) return false;
    return nome !== usuarioAtual.full_name || previaAvatar !== null;
  }, [nome, previaAvatar, usuarioAtual]);

  const salvarPerfil = () => {
    if (!usuarioAtual) return;
    const partes = nome.trim().split(' ');
    const novasIniciais =
      partes.length >= 2
        ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
        : nome.trim().slice(0, 2).toUpperCase();

    atualizarPerfil({
      fullName: nome.trim(),
      initials: novasIniciais,
      email: usuarioAtual.email,
    });
    toast.success('Perfil salvo');
  };

  const carregarImagem = () => {
    refInputArquivo.current?.click();
  };

  const lidarComArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const url = URL.createObjectURL(arquivo);
    setPreviaAvatar(url);
  };

  const removerAvatar = () => {
    setPreviaAvatar(null);
    if (refInputArquivo.current) refInputArquivo.current.value = '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Perfil</h2>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Avatar</Label>
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            {(previaAvatar || usuarioAtual?.avatar_url) && (
              <AvatarImage
                src={previaAvatar ?? usuarioAtual?.avatar_url ?? undefined}
                alt={usuarioAtual?.full_name ?? 'Avatar do perfil'}
              />
            )}
            <AvatarFallback>{iniciais}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" onClick={carregarImagem} className="font-medium text-primary">
            Enviar nova imagem
          </Button>
          <Button variant="ghost" size="sm" onClick={removerAvatar} className="font-medium text-primary">
            Remover
          </Button>
          <input
            ref={refInputArquivo}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={lidarComArquivo}
          />
        </div>
        <p className="text-sm text-muted-foreground">PNG ou JPG, até 2MB.</p>
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
        {estaPendente && <IconLoader2 className="size-4 animate-spin" />}
        Salvar alterações
      </Button>
    </div>
  );
}

export const ProfileForm = FormularioPerfil;




