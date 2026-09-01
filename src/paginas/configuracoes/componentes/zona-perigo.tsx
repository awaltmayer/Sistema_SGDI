import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/componentes/ui/cartao';
import { Button } from '@/componentes/base/botao';
import { Input } from '@/componentes/ui/campo-texto';
import { Label } from '@/componentes/ui/rotulo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/componentes/ui/dialogo-alerta';
import { useDataProvider } from '@/lib/provedor-dados';
import { useAuth } from '@/lib/autenticacao/provedor-autenticacao';
import { toast } from 'sonner';
import { IconLoader2 } from '@tabler/icons-react';

export function ZonaPerigo() {
  const navigate = useNavigate();
  const { signOut: desconectar } = useAuth();
  const { useCurrentUser, useDeleteBoardData } = useDataProvider();
  const { data: usuarioAtual } = useCurrentUser();
  const { mutate: excluirDadosQuadro, isPending: estaPendente } = useDeleteBoardData();

  const [aberto, setAberto] = useState(false);
  const [emailConfirmacao, setEmailConfirmacao] = useState('');

  const podeExcluir = emailConfirmacao === usuarioAtual?.email;

  const executarExclusao = () => {
    excluirDadosQuadro();
    desconectar();
    toast.success('Sua conta foi excluída com sucesso');
    navigate('/');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Zona de perigo</h2>

      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Excluir conta</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Exclua permanentemente sua conta, seu quadro e todos os cartões. Isso
                não pode ser desfeito.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setAberto(true)}
            >
              Excluir conta
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta definitivamente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. Todos os seus dados — conta, quadro e cartões
              — serão excluídos e não poderão ser recuperados. Digite seu endereço de
              e-mail para confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-delete-email">
              Digite{' '}
              <span className="font-semibold">{usuarioAtual?.email}</span> para
              confirmar
            </Label>
            <Input
              id="confirm-delete-email"
              value={emailConfirmacao}
              onChange={(e) => setEmailConfirmacao(e.target.value)}
              placeholder={usuarioAtual?.email}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmailConfirmacao('')}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!podeExcluir || estaPendente}
              onClick={executarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {estaPendente && <IconLoader2 className="size-4 animate-spin" />}
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const DangerZone = ZonaPerigo;

