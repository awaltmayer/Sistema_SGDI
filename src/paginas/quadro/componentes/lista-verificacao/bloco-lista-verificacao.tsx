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
import { toast } from "sonner";
import "./bloco-lista-verificacao.css";

export interface PropsBlocoListaVerificacao {
  cardId: string;
  listaVerificacao?: ListaVerificacao;
  // alias compatibilidade
  checklist?: ListaVerificacao;
}
export type ChecklistBlockProps = PropsBlocoListaVerificacao;

export function BlocoListaVerificacao({ cardId, listaVerificacao, checklist }: PropsBlocoListaVerificacao) {
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

  const titLista = lista.titulo ?? lista.title ?? '';
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

  // TODO: salvar titulo
  const salvarTitulo = () => {
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

  // TODO: adicionar item
  const adicionarItem = () => {
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

  // TODO: deletar checklist
  const excluirListaVerificacao = () => {};

  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-border">
      {/* Cabeçalho do Checklist */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <IconSquareCheck
            className={`size-5 shrink-0 ${
              todosConcluidos
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-primary"
            }`}
          />

          {estaEditandoTitulo ? (
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
            <div
              className="group/title flex items-center gap-2 cursor-pointer rounded px-1.5 py-0.5 transition-colors hover:bg-accent flex-1 min-w-0"
              onClick={() => setEstaEditandoTitulo(true)}
              title="Clique para renomear checklist"
            >
              <h3 className="font-semibold text-base text-foreground truncate">
                {titLista}
              </h3>
              <IconPencil className="size-3.5 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Ação de Excluir Checklist */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <IconTrash className="size-3.5 mr-1" />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {titLista}?</AlertDialogTitle>
              <AlertDialogDescription>
                A exclusão de um checklist é permanente e removerá todos os seus
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
      </div>

      {/* Barra de Progresso e Porcentagem */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-medium tabular-nums ${
              todosConcluidos
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {porcentagemProgresso}%
          </span>
          {totalItens > 0 && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {itensConcluidos}/{totalItens} concluídos
            </span>
          )}
        </div>

        <Progress
          value={porcentagemProgresso}
          className="h-2 bg-secondary/80"
          indicatorClassName={`transition-all duration-300 ${
            todosConcluidos
              ? "bg-emerald-500 dark:bg-emerald-500 shadow-sm shadow-emerald-500/20"
              : "bg-primary"
          }`}
        />
      </div>

      {/* Lista de Itens do Checklist */}
      <div className="space-y-1 pt-1">
        {itensLista.map((item) => (
          <ChecklistItemRow
            key={item.id}
            cardId={cardId}
            checklistId={lista.id}
            item={item}
            onToggle={(_itemId) => {
              // TODO: alternar item
            }}
            onUpdateTitle={(_itemId, _title) => {
              // TODO: atualizar item
            }}
            onDelete={(_itemId) => {
              // TODO: excluir item
            }}
          />
        ))}
      </div>

      {/* Formulário / Botão de Adicionar Item */}
      <div className="pt-1">
        {estaAdicionandoItem ? (
          <div className="space-y-2 rounded-md bg-accent/40 p-2.5">
            <Textarea
              ref={refInputItem}
              value={textoNovoItem}
              onChange={(e) => setTextoNovoItem(e.target.value)}
              onKeyDown={aoPressionarTeclaItem}
              placeholder="Adicionar um item…"
              className="min-h-[64px] resize-y text-sm bg-background"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={adicionarItem}
                  disabled={!textoNovoItem.trim()}
                  className="h-8"
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
                  className="h-8 text-muted-foreground"
                >
                  Cancelar
                </Button>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Pressione Enter para adicionar
              </span>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEstaAdicionandoItem(true)}
            className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <IconPlus className="size-3.5 mr-1.5" />
            Adicionar um item
          </Button>
        )}
      </div>
    </div>
  );
}

export const ChecklistBlock = BlocoListaVerificacao;

