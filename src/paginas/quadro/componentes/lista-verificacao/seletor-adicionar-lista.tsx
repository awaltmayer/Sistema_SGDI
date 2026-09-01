import { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/componentes/ui/painel-flutuante";
import { Button } from "@/componentes/base/botao";
import { Input } from "@/componentes/ui/campo-texto";
import { Label } from "@/componentes/ui/rotulo";
import { IconSquareCheck, IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/provedor-dados";
import type { Checklist } from "@/dados/dados-iniciais";
import { toast } from "sonner";
import "./seletor-adicionar-lista.css";

export interface PropsSeletorAdicionarLista {
  cardId: string;
  listasVerificacao?: Checklist[];
  gatilho?: React.ReactNode;
  alinhamento?: "start" | "center" | "end";
  // Aliases compatibilidade
  checklists?: Checklist[];
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
}
export type AddChecklistPopoverProps = PropsSeletorAdicionarLista;

export const LIMITE_MAXIMO_LISTAS = 5;
export const MAX_CHECKLISTS = LIMITE_MAXIMO_LISTAS;

export function SeletorAdicionarLista({
  cardId,
  listasVerificacao,
  gatilho,
  alinhamento,
  checklists,
  trigger,
  align,
}: PropsSeletorAdicionarLista) {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("Checklist");
  const refInput = useRef<HTMLInputElement>(null);

  const { useCreateChecklist } = useDataProvider();
  const { mutate: createChecklist } = useCreateChecklist();

  const listas = listasVerificacao ?? checklists ?? [];
  const elementoGatilho = gatilho ?? trigger;
  const alinhar = alinhamento ?? align ?? "start";

  const contagem = listas.length;
  const atingiuLimite = contagem >= LIMITE_MAXIMO_LISTAS;

  useEffect(() => {
    if (aberto) {
      setTitulo("Checklist");
      setTimeout(() => {
        refInput.current?.focus();
        refInput.current?.select();
      }, 50);
    }
  }, [aberto]);

  // TODO: criar checklist
  const criarLista = (e: React.FormEvent) => {
    e.preventDefault();
    setAberto(false);
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        {elementoGatilho ? (
          elementoGatilho
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={atingiuLimite}
            className="h-8 gap-2 font-medium"
          >
            <IconSquareCheck className="size-4 text-primary" />
            <span>Checklist</span>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {contagem}/{LIMITE_MAXIMO_LISTAS}
            </span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3.5" align={alinhar}>
        <form onSubmit={criarLista} className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <IconSquareCheck className="size-4 text-primary" />
              Adicionar checklist
            </h4>
            <span className="text-xs text-muted-foreground tabular-nums">
              {contagem}/{LIMITE_MAXIMO_LISTAS}
            </span>
          </div>

          {atingiuLimite ? (
            <div className="flex items-start gap-2 rounded-md bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
              <IconAlertCircle className="size-4 shrink-0 mt-0.5" />
              <p>
                Limite de <strong>{LIMITE_MAXIMO_LISTAS} checklists</strong> por cartão atingido. Exclua um checklist existente para criar um novo.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="checklist-title-input" className="text-xs text-muted-foreground">
                  Título
                </Label>
                <Input
                  id="checklist-title-input"
                  ref={refInput}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="ex.: Checklist de Design, Revisão…"
                  className="h-8 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAberto(false)}
                  className="h-8 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!titulo.trim()}
                  className="h-8 text-xs gap-1"
                >
                  <IconPlus className="size-3.5" />
                  Adicionar
                </Button>
              </div>
            </>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}

export const AddChecklistPopover = SeletorAdicionarLista;

