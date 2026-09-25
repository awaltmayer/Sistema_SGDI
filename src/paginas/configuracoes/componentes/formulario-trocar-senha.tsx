import { useState, useMemo } from 'react';
import { Button } from '@/componentes/base/botao';
import { Input } from '@/componentes/ui/campo-texto';
import { Label } from '@/componentes/ui/rotulo';
import { useDataProvider } from '@/lib/provedor-dados';
import { IconLoader2 } from '@tabler/icons-react';

export function FormularioTrocarSenha() {
  const { useUpdatePassword } = useDataProvider();
  const { mutate: atualizarSenha, isPending: estaPendente } = useUpdatePassword();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  const podeEnviar = useMemo(() => {
    return (
      senhaAtual.length > 0 &&
      novaSenha.length > 0 &&
      confirmarSenha.length > 0 &&
      novaSenha === confirmarSenha
    );
  }, [senhaAtual, novaSenha, confirmarSenha]);

  const salvarSenha = () => {
    const novosErros: Record<string, string> = {};

    if (novaSenha.length < 6) {
      novosErros.novaSenha = 'A senha deve ter pelo menos 6 caracteres';
    }
    if (novaSenha !== confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    atualizarSenha({ currentPassword: senhaAtual, newPassword: novaSenha });
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Alterar senha</h2>

      <div className="space-y-2">
        <Label htmlFor="current-password">Senha atual</Label>
        <Input
          id="current-password"
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">Nova senha</Label>
        <Input
          id="new-password"
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          className="max-w-md"
        />
        {erros.novaSenha && (
          <p className="text-sm text-destructive">{erros.novaSenha}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="max-w-md"
        />
        {erros.confirmarSenha && (
          <p className="text-sm text-destructive">{erros.confirmarSenha}</p>
        )}
      </div>

      <Button disabled={!podeEnviar || estaPendente} onClick={salvarSenha}>
        {estaPendente && <IconLoader2 className="size-4 animate-spin" />}
        Atualizar senha
      </Button>
    </div>
  );
}

export const ChangePasswordForm = FormularioTrocarSenha;

