import { useState } from "react";
import {
  IconDots,
  IconEye,
  IconPalette,
  IconTrash,
  IconCheck,
  IconRotate,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { CARD_COLORS } from "./configuracao-cores-cartao";
import { toast } from "sonner";
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
  const { useUpdateCard, useDeleteCard } = useDataProvider();
  const { mutate: updateCard } = useUpdateCard();
  const { mutate: deleteCard } = useDeleteCard();

  // TODO: alterar cor
  const selecionarCor = (_idCor: string) => {};

  // TODO: deletar card
  const excluirCartao = () => {
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

          {/* Opção 2: Alterar cor */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              <IconPalette className="size-4 text-primary" />
              <span>Alterar cor</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64 p-3" sideOffset={8}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    Paleta de Cores
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Contraste automático
                  </span>
                </div>

                {/* Grid de círculos coloridos */}
                <div className="sgdi-paleta-grid">
                  {CARD_COLORS.map((col) => {
                    const estaSelecionado =
                      (itemCartao.color ?? "default") === col.id ||
                      (!itemCartao.color && col.id === "default");

                    return (
                      <button
                        key={col.id}
                        type="button"
                        title={col.name}
                        aria-label={`Cor ${col.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selecionarCor(col.id);
                        }}
                        className={cn(
                          'sgdi-cor-circulo-btn',
                          estaSelecionado
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "border border-border/80 shadow-xs"
                        )}
                        style={{
                          background: col.swatchBg,
                        }}
                      >
                        {estaSelecionado && (
                          <IconCheck
                            className={`size-4 stroke-[3] ${
                              col.isDark ? "text-white" : "text-slate-900"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {itemCartao.color && itemCartao.color !== "default" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selecionarCor("default");
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border/60 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground mt-1 cursor-pointer"
                  >
                    <IconRotate className="size-3.5" />
                    Restaurar cor padrão
                  </button>
                )}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Opção 3: Excluir card */}
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
            <AlertDialogTitle>Excluir &ldquo;{itemCartao.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este cartão? Esta ação é definitiva e removerá todos os checklists e comentários associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogoExclusaoAberto(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={excluirCartao}
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
