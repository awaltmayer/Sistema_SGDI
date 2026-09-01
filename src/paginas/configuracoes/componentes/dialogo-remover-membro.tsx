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
import type { TeamMember } from '@/dados/dados-iniciais';

interface PropsDialogoRemoverMembro {
  membro: TeamMember | null;
  aoFechar: () => void;
  // alias compatibilidade
  member?: TeamMember | null;
  onClose?: () => void;
}

export function DialogoRemoverMembro({ membro, aoFechar, member, onClose }: PropsDialogoRemoverMembro) {
  const membroAlvo = membro ?? member ?? null;
  const fecharDialogo = aoFechar ?? onClose ?? (() => {});

  const { useRemoveTeamMember } = useDataProvider();
  const { mutate: removerMembro } = useRemoveTeamMember();

  const executarRemocao = () => {
    if (!membroAlvo) return;
    removerMembro(membroAlvo.id);
    fecharDialogo();
  };

  return (
    <AlertDialog open={!!membroAlvo} onOpenChange={(aberto) => !aberto && fecharDialogo()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover membro da equipe</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja remover {membroAlvo?.full_name}? Ele perderá
            o acesso ao quadro imediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={executarRemocao}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remover membro
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const RemoveMemberDialog = DialogoRemoverMembro;

