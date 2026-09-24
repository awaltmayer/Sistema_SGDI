import { useState, useRef, useEffect } from "react";
import {
  IconSquareCheck,
  IconTrash,
  IconPlus,
  IconPencil,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Progress } from "@/componentes/ui/barra-progresso";
import { Button } from "@/componentes/base/botao";
import { Input } from "@/componentes/ui/campo-texto";
import { Textarea } from "@/componentes/ui/area-texto";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/componentes/ui/dialogo-alerta";
import { ChecklistItemRow } from "./item-lista-verificacao-linha";
import { useDataProvider } from "@/lib/provedor-dados";
import type { ListaVerificacao } from "@/dados/dados-iniciais";
import "./bloco-lista-verificacao.css";

export interface PropsBlocoListaVerificacao {
  cardId: string;
  listaVerificacao?: ListaVerificacao;
  podeEditar?: boolean;
  canEdit?: boolean;
  // alias compatibilidade
  checklist?: ListaVerificacao;
}
export type ChecklistBlockProps = PropsBlocoListaVerificacao;

export function BlocoListaVerificacao({
  cardId,
  listaVerificacao,
  checklist,
  podeEditar = true,
  canEdit,
}: PropsBlocoListaVerificacao) {
  const permissaoEdicao = canEdit !== undefined ? canEdit : podeEditar;
  const lista = listaVerificacao ?? checklist!;

  const {
    useUpdateChecklist,
    useDeleteChecklist,
    useCreateChecklistItem,
    useUpdateChecklistItem,
    useDeleteChecklistItem,
    useToggleChecklistItem,
  } = useDataProvider();

  const { mutate: updateChecklist } = useUpdateChecklist();
  const { mutate: deleteChecklist } = useDeleteChecklist();
  const { mutate: createItem } = useCreateChecklistItem();
  const { mutate: updateItem } = useUpdateChecklistItem();
  const { mutate: deleteItem } = useDeleteChecklistItem();
  const { mutate: toggleItem } = useToggleChecklistItem();

  const titLista = lista.titulo ?? lista.title ?? 'Checklist';
  const itensLista = lista.itens ?? lista.items ?? [];

  // Estado de edição do título
  const [estaEditandoTitulo, setEstaEditandoTitulo] = useState(false);
  const [valorTitulo, setValorTitulo] = useState(titLista);
  const refInputTitulo = useRef<HTMLInputElement>(null);

  // Estado do formulário de novo item
  const [estaAdicionandoItem, setEstaAdicionandoItem] = useState(false);
  const [textoNovoItem, setTextoNovoItem] = useState("");
  const refInputItem = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValorTitulo(titLista);
  }, [titLista]);

  useEffect(() => {
    if (estaEditandoTitulo) {
      refInputTitulo.current?.focus();
      refInputTitulo.current?.select();
    }
  }, [estaEditandoTitulo]);

  useEffect(() => {
    if (estaAdicionandoItem) {
      refInputItem.current?.focus();
    }
  }, [estaAdicionandoItem]);

  // Cálculos de progresso
  const totalItens = itensLista.length;
  const itensConcluidos = itensLista.filter((i) => i.esta_concluido ?? i.is_completed).length;
  const porcentagemProgresso =
    totalItens === 0 ? 0 : Math.round((itensConcluidos / totalItens) * 100);
  const todosConcluidos = totalItens > 0 && itensConcluidos === totalItens;

  const salvarTitulo = () => {
    const limpo = valorTitulo.trim();
    if (limpo && limpo !== titLista) {
      updateChecklist({
        cardId,
        checklistId: lista.id,
        titulo: limpo,
      });
    }
    setEstaEditandoTitulo(false);
  };

  const aoPressionarTeclaTitulo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      salvarTitulo();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValorTitulo(titLista);
      setEstaEditandoTitulo(false);
    }
  };

  const adicionarItem = () => {
    const limpo = textoNovoItem.trim();
    if (limpo) {
      createItem({
        cardId,
        checklistId: lista.id,
        titulo: limpo,
      });
    }
    setTextoNovoItem("");
    setEstaAdicionandoItem(false);
  };

  const aoPressionarTeclaItem = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      adicionarItem();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEstaAdicionandoItem(false);
      setTextoNovoItem("");
    }
  };

  const excluirListaVerificacao = () => {
    deleteChecklist({
      cardId,
      checklistId: lista.id,
    });
  };

  return (
    <div className="space-y-2.5 rounded-lg border border-border/60 bg-card/60 p-4 transition-all hover:border-border">
      {/* Cabeçalho do Checklist */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <IconSquareCheck
            className={`size-5 shrink-0 transition-colors ${
              todosConcluidos
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-primary"
            }`}
          />

          {estaEditandoTitulo && permissaoEdicao ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Input
                ref={refInputTitulo}
                value={valorTitulo}
                onChange={(e) => setValorTitulo(e.target.value)}
                onKeyDown={aoPressionarTeclaTitulo}
                onBlur={salvarTitulo}
                className="h-8 font-semibold text-base flex-1 bg-background"
              />
              <Button
                size="sm"
                type="button"
                onClick={salvarTitulo}
                className="h-8 px-2"
              >
                <IconCheck className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => {
                  setValorTitulo(titLista);
                  setEstaEditandoTitulo(false);
                }}
                className="h-8 px-2 text-muted-foreground"
              >
                <IconX className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`group/title flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors truncate ${
                  permissaoEdicao ? "cursor-pointer hover:bg-accent" : "cursor-default"
                }`}
                onClick={() => {
                  if (permissaoEdicao) setEstaEditandoTitulo(true);
                }}
                title={permissaoEdicao ? "Clique para renomear checklist" : titLista}
              >
                <h3 className="font-semibold text-base text-foreground truncate">
                  {titLista}
                </h3>
                {permissaoEdicao && (
                  <IconPencil className="size-3.5 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ação de Excluir Checklist */}
        {permissaoEdicao && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <IconTrash className="size-3.5 mr-1" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir "{titLista}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  A exclusão deste checklist é definitiva e removerá todos os seus
                  itens associados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={excluirListaVerificacao}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir checklist
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Barra de Progresso Minimalista e Indicador de % */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-semibold tabular-nums text-xs ${
              todosConcluidos
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            {porcentagemProgresso}%
          </span>
          {totalItens > 0 && (
            <span className="text-[11px] text-muted-foreground tabular-nums font-medium">
              {itensConcluidos}/{totalItens} concluídos
            </span>
          )}
        </div>

        <Progress
          value={porcentagemProgresso}
          className="h-1.5 bg-secondary/80 rounded-full overflow-hidden"
          indicatorClassName={`transition-all duration-300 rounded-full ${
            todosConcluidos
              ? "bg-emerald-500 dark:bg-emerald-500 shadow-sm shadow-emerald-500/20"
              : "bg-primary"
          }`}
        />
      </div>

      {/* Lista de Itens do Checklist */}
      <div className="space-y-0.5 pt-1">
        {itensLista.map((item) => (
          <ChecklistItemRow
            key={item.id}
            cardId={cardId}
            checklistId={lista.id}
            item={item}
            podeEditar={permissaoEdicao}
            onToggle={(itemId) => {
              toggleItem({
                cardId,
                checklistId: lista.id,
                itemId,
              });
            }}
            onUpdateTitle={(itemId, title) => {
              updateItem({
                cardId,
                checklistId: lista.id,
                itemId,
                titulo: title,
              });
            }}
            onDelete={(itemId) => {
              deleteItem({
                cardId,
                checklistId: lista.id,
                itemId,
              });
            }}
          />
        ))}
      </div>

      {/* Formulário / Botão de Adicionar Item */}
      {permissaoEdicao && (
        <div className="pt-0.5">
          {estaAdicionandoItem ? (
            <div className="space-y-2 rounded-md bg-accent/40 p-2.5">
              <Textarea
                ref={refInputItem}
                value={textoNovoItem}
                onChange={(e) => setTextoNovoItem(e.target.value)}
                onKeyDown={aoPressionarTeclaItem}
                placeholder="Digite o nome do item e pressione Enter…"
                className="min-h-[64px] resize-y text-sm bg-background"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={adicionarItem}
                    disabled={!textoNovoItem.trim()}
                    className="h-8 text-xs"
                  >
                    Adicionar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEstaAdicionandoItem(false);
                      setTextoNovoItem("");
                    }}
                    className="h-8 text-xs text-muted-foreground"
                  >
                    Cancelar
                  </Button>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Enter para adicionar • Esc para cancelar
                </span>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEstaAdicionandoItem(true)}
              className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
            >
              <IconPlus className="size-3.5 mr-1.5" />
              Adicionar um item
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export const ChecklistBlock = BlocoListaVerificacao;
