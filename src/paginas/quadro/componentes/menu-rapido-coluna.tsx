import {
  IconDots,
  IconPalette,
  IconCheck,
  IconRotate,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/componentes/ui/menu-suspenso";
import { COLUMN_COLORS } from "./configuracao-cores-coluna";
import { cn } from "@/lib/utilitarios";
import "./menu-rapido-coluna.css";

export interface PropsMenuRapidoColuna {
  columnId: string;
  columnLabel: string;
  currentColor?: string;
  onSelectColor: (colorId: string) => void;
  triggerClassName?: string;
}

export function MenuRapidoColuna({
  columnLabel,
  currentColor = "default",
  onSelectColor,
  triggerClassName,
}: PropsMenuRapidoColuna) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Opções da coluna ${columnLabel}`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            'sgdi-coluna-menu-btn',
            triggerClassName ?? 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <IconDots className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Alterar cor da coluna */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
            <IconPalette className="size-4 text-primary" />
            <span>Mudar cor da coluna</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64 p-3" sideOffset={8}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b pb-1.5">
                <span className="text-xs font-semibold text-foreground">
                  Cor da Coluna
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Tema da coluna
                </span>
              </div>

              {/* Grid de círculos coloridos */}
              <div className="sgdi-paleta-grid">
                {COLUMN_COLORS.map((col) => {
                  const estaSelecionado =
                    currentColor === col.id || (!currentColor && col.id === "default");

                  return (
                    <button
                      key={col.id}
                      type="button"
                      title={col.name}
                      aria-label={`Cor ${col.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectColor(col.id);
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
                          className="size-4 stroke-[3] text-slate-900 dark:text-white"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {currentColor && currentColor !== "default" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectColor("default");
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ColumnQuickMenu = MenuRapidoColuna;
