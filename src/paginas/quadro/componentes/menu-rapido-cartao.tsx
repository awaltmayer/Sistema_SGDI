import { useState } from "react";
import {
  IconDots,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/componentes/ui/menu-suspenso";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/componentes/ui/dialogo-alerta";
import { useDataProvider, type CardWithAssignee } from "@/lib/provedor-dados";
import { cn } from "@/lib/utilitarios";
import "./menu-rapido-cartao.css";

export interface PropsMenuRapidoCartao {
  card?: CardWithAssignee;
  onOpenDetail?: () => void;
  triggerClassName?: string;
  // Aliases compatibilidade
  cartao?: CardWithAssignee;
  aoAbrirDetalhes?: () => void;
  classeGatilho?: string;
}
export type CardQuickMenuProps = PropsMenuRapidoCartao;

export function MenuRapidoCartao({
  card,
  onOpenDetail,
  triggerClassName,
  cartao,
  aoAbrirDetalhes,
  classeGatilho,
}: PropsMenuRapidoCartao) {
  const itemCartao = cartao ?? card!;
  const abrirDetalhes = aoAbrirDetalhes ?? onOpenDetail ?? (() => {});
  const estiloGatilho = classeGatilho ?? triggerClassName;

  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false);
  const { useDeleteCard } = useDataProvider();
  const { mutate: deleteCard } = useDeleteCard();

  const excluirCartao = () => {
    if (itemCartao?.id) {
      deleteCard(itemCartao.id);
    }
    setDialogoExclusaoAberto(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Ações do cartão"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              'sgdi-btn-dots-trigger',
              estiloGatilho ?? 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <IconDots className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Opção 1: Ver detalhes */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              abrirDetalhes();
            }}
            className="gap-2 cursor-pointer"
          >
            <IconEye className="size-4 text-muted-foreground" />
            <span>Ver detalhes</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Opção 2: Excluir card */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDialogoExclusaoAberto(true);
            }}
            className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-medium"
          >
            <IconTrash className="size-4" />
            <span>Excluir card</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmação de exclusão */}
      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir #{itemCartao.id} &ldquo;{itemCartao.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este cartão? Esta ação é definitiva e removerá todos os checklists e comentários associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
                setDialogoExclusaoAberto(false);
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                excluirCartao();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir cartão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const CardQuickMenu = MenuRapidoCartao;
