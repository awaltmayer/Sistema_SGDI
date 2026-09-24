import { useState, useRef, useEffect } from "react";
import { IconTrash, IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { Checkbox } from "@/componentes/ui/caixa-selecao";
import { Button } from "@/componentes/base/botao";
import { Input } from "@/componentes/ui/campo-texto";
import { toast } from "sonner";
import type { ItemListaVerificacao } from "@/dados/dados-iniciais";
import "./item-lista-verificacao-linha.css";

export interface PropsItemListaVerificacaoLinha {
  cardId: string;
  checklistId: string;
  item: ItemListaVerificacao;
  podeEditar?: boolean;
  aoAlternar?: (itemId: string) => void;
  aoAtualizarTitulo?: (itemId: string, titulo: string) => void;
  aoExcluir?: (itemId: string) => void;
  // Aliases compatibilidade
  canEdit?: boolean;
  onToggle?: (itemId: string) => void;
  onUpdateTitle?: (itemId: string, title: string) => void;
  onDelete?: (itemId: string) => void;
}
export type ChecklistItemRowProps = PropsItemListaVerificacaoLinha;

export function ItemListaVerificacaoLinha({
  cardId: _cardId,
  checklistId: _checklistId,
  item,
  podeEditar = true,
  canEdit,
  aoAlternar,
  aoAtualizarTitulo,
  aoExcluir,
  onToggle,
  onUpdateTitle,
  onDelete,
}: PropsItemListaVerificacaoLinha) {
  const permissaoEdicao = canEdit !== undefined ? canEdit : podeEditar;
  const alternar = aoAlternar ?? onToggle;
  const atualizarTitulo = aoAtualizarTitulo ?? onUpdateTitle;
  const excluir = aoExcluir ?? onDelete;

  const titItem = item.titulo ?? item.title ?? "";
  const estaItemConcluido = item.esta_concluido ?? item.is_completed ?? false;

  // Estado otimista local para resposta visual imediata no frontend (0ms)
  const [concluidoLocal, setConcluidoLocal] = useState(estaItemConcluido);
  const [estaEditando, setEstaEditando] = useState(false);
  const [textoEdicao, setTextoEdicao] = useState(titItem);
  const refInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConcluidoLocal(estaItemConcluido);
  }, [estaItemConcluido]);

  useEffect(() => {
    setTextoEdicao(titItem);
  }, [titItem]);

  useEffect(() => {
    if (estaEditando) {
      refInput.current?.focus();
      refInput.current?.select();
    }
  }, [estaEditando]);

  const lidarComAlternancia = () => {
    if (!permissaoEdicao) {
      toast.error('Apenas o criador ou responsáveis podem alterar os itens do checklist.');
      return;
    }
    const proximoValor = !concluidoLocal;
    setConcluidoLocal(proximoValor); // Resposta visual imediata sem esperar rede
    alternar?.(item.id);
  };

  const salvarEdicao = () => {
    if (!permissaoEdicao) return;
    const t = textoEdicao.trim();
    if (t && t !== titItem) {
      atualizarTitulo?.(item.id, t);
    }
    setEstaEditando(false);
  };

  const aoPressionarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      salvarEdicao();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTextoEdicao(titItem);
      setEstaEditando(false);
    }
  };

  if (estaEditando && permissaoEdicao) {
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
            setTextoEdicao(titItem);
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
          checked={concluidoLocal}
          disabled={!permissaoEdicao}
          onCheckedChange={lidarComAlternancia}
          className={`size-4 rounded transition-transform active:scale-95 ${
            !permissaoEdicao ? "cursor-not-allowed opacity-75" : ""
          } ${
            concluidoLocal
              ? "border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 data-[state=checked]:text-white"
              : ""
          }`}
        />
      </div>

      <label
        htmlFor={`chk-item-${item.id}`}
        onClick={(e) => {
          if (!permissaoEdicao) {
            e.preventDefault();
            toast.error('Apenas o criador ou responsáveis podem alterar os itens do checklist.');
            return;
          }
          // Duplo clique para editar
          if (e.detail === 2) {
            e.preventDefault();
            setEstaEditando(true);
          }
        }}
        className={`flex-1 text-sm select-none leading-relaxed transition-all ${
          !permissaoEdicao ? "cursor-not-allowed" : "cursor-pointer"
        } ${
          concluidoLocal
            ? "line-through text-emerald-600 dark:text-emerald-400 font-medium opacity-90"
            : "text-foreground"
        }`}
      >
        {titItem}
      </label>

      {permissaoEdicao && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
          <button
            type="button"
            title="Editar item"
            onClick={() => setEstaEditando(true)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
          >
            <IconPencil className="size-3.5" />
          </button>
          <button
            type="button"
            title="Excluir item"
            onClick={() => {
              excluir?.(item.id);
            }}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <IconTrash className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export const ChecklistItemRow = ItemListaVerificacaoLinha;
