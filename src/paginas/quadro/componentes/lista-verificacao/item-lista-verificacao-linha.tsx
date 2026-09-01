import { useState, useRef, useEffect } from "react";
import { IconTrash, IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { Checkbox } from "@/componentes/ui/caixa-selecao";
import { Button } from "@/componentes/base/botao";
import { Input } from "@/componentes/ui/campo-texto";
import type { ChecklistItem } from "@/dados/dados-iniciais";
import "./item-lista-verificacao-linha.css";

export interface PropsItemListaVerificacaoLinha {
  cardId: string;
  checklistId: string;
  item: ChecklistItem;
  aoAlternar?: (itemId: string) => void;
  aoAtualizarTitulo?: (itemId: string, titulo: string) => void;
  aoExcluir?: (itemId: string) => void;
  // Aliases compatibilidade
  onToggle?: (itemId: string) => void;
  onUpdateTitle?: (itemId: string, title: string) => void;
  onDelete?: (itemId: string) => void;
}
export type ChecklistItemRowProps = PropsItemListaVerificacaoLinha;

export function ItemListaVerificacaoLinha({
  cardId: _cardId,
  checklistId: _checklistId,
  item,
  aoAlternar: _aoAlternar,
  aoAtualizarTitulo: _aoAtualizarTitulo,
  aoExcluir: _aoExcluir,
  onToggle: _onToggle,
  onUpdateTitle: _onUpdateTitle,
  onDelete: _onDelete,
}: PropsItemListaVerificacaoLinha) {
  const [estaEditando, setEstaEditando] = useState(false);
  const [textoEdicao, setTextoEdicao] = useState(item.title);
  const refInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTextoEdicao(item.title);
  }, [item.title]);

  useEffect(() => {
    if (estaEditando) {
      refInput.current?.focus();
      refInput.current?.select();
    }
  }, [estaEditando]);

  // TODO: salvar item
  const salvarEdicao = () => {
    setEstaEditando(false);
  };

  const aoPressionarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      salvarEdicao();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTextoEdicao(item.title);
      setEstaEditando(false);
    }
  };

  if (estaEditando) {
    return (
      <div className="flex items-center gap-2 py-1 pl-7 pr-1">
        <Input
          ref={refInput}
          value={textoEdicao}
          onChange={(e) => setTextoEdicao(e.target.value)}
          onKeyDown={aoPressionarTecla}
          onBlur={salvarEdicao}
          className="h-8 text-sm flex-1 bg-background"
        />
        <Button
          size="sm"
          type="button"
          onClick={salvarEdicao}
          className="h-8 px-2.5"
        >
          <IconCheck className="size-3.5 mr-1" />
          Salvar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => {
            setTextoEdicao(item.title);
            setEstaEditando(false);
          }}
          className="h-8 px-2 text-muted-foreground"
        >
          <IconX className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group/item flex items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/60">
      <div className="pt-0.5">
        <Checkbox
          id={`chk-item-${item.id}`}
          checked={item.is_completed}
          onCheckedChange={() => {
            // TODO: alternar item
          }}
          className="size-4 rounded transition-transform active:scale-95"
        />
      </div>

      <label
        htmlFor={`chk-item-${item.id}`}
        onClick={(e) => {
          // Duplo clique para editar
          if (e.detail === 2) {
            e.preventDefault();
            setEstaEditando(true);
          }
        }}
        className={`flex-1 text-sm select-none leading-relaxed cursor-pointer transition-all ${
          item.is_completed
            ? "line-through text-muted-foreground/80 opacity-80"
            : "text-foreground"
        }`}
      >
        {item.title}
      </label>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
        <button
          type="button"
          title="Editar item"
          onClick={() => setEstaEditando(true)}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <IconPencil className="size-3.5" />
        </button>
        <button
          type="button"
          title="Excluir item"
          onClick={() => {
            // TODO: excluir item
          }}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <IconTrash className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export const ChecklistItemRow = ItemListaVerificacaoLinha;

