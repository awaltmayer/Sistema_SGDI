import { IconSquareCheck, IconPlus } from "@tabler/icons-react";
import { ChecklistBlock } from "./bloco-lista-verificacao";
import { AddChecklistPopover } from "./seletor-adicionar-lista";
import { Button } from "@/componentes/base/botao";
import { Badge } from "@/componentes/base/distintivo";
import type { ListaVerificacao } from "@/dados/dados-iniciais";
import "./container-listas-verificacao.css";

export interface PropsContainerListasVerificacao {
  cardId: string;
  listasVerificacao?: ListaVerificacao[];
  podeEditar?: boolean;
  canEdit?: boolean;
  // alias compatibilidade
  checklists?: ListaVerificacao[];
}
export type CardChecklistsContainerProps = PropsContainerListasVerificacao;

const LIMITE_MAXIMO_LISTAS = 5;

export function ContainerListasVerificacao({
  cardId,
  listasVerificacao,
  checklists,
  podeEditar = true,
  canEdit,
}: PropsContainerListasVerificacao) {
  const permissaoEdicao = canEdit !== undefined ? canEdit : podeEditar;
  const listas = listasVerificacao ?? checklists ?? [];
  const contagem = listas.length;
  const atingiuLimite = contagem >= LIMITE_MAXIMO_LISTAS;

  if (contagem === 0) {
    return (
      <div className="sgdi-checklists-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSquareCheck className="size-5 text-primary" />
            <p className="text-lg font-semibold text-foreground">Checklists</p>
            <Badge color="gray">0/{LIMITE_MAXIMO_LISTAS}</Badge>
          </div>
          {permissaoEdicao && (
            <AddChecklistPopover
              cardId={cardId}
              checklists={listas}
              align="end"
              trigger={
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-medium cursor-pointer">
                  <IconPlus className="size-3.5" />
                  Adicionar checklist
                </Button>
              }
            />
          )}
        </div>

        <div className="sgdi-checklists-vazio-card">
          <div className="sgdi-checklists-vazio-icone">
            <IconSquareCheck className="size-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhum checklist criado</p>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-3">
            {permissaoEdicao
              ? "Divida esta tarefa em etapas menores ou subtarefas e acompanhe o progresso com barras percentuais."
              : "Esta tarefa não possui checklists criados no momento."}
          </p>
          {permissaoEdicao && (
            <AddChecklistPopover
              cardId={cardId}
              checklists={listas}
              trigger={
                <Button size="sm" className="h-8 text-xs gap-1.5 cursor-pointer">
                  <IconPlus className="size-3.5" />
                  Criar primeiro checklist
                </Button>
              }
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sgdi-checklists-container">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconSquareCheck className="size-5 text-primary" />
          <p className="text-lg font-semibold text-foreground">Checklists</p>
          <Badge color="gray" className="tabular-nums">
            {contagem}/{LIMITE_MAXIMO_LISTAS}
          </Badge>
        </div>

        {permissaoEdicao && !atingiuLimite && (
          <AddChecklistPopover
            cardId={cardId}
            checklists={listas}
            align="end"
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <IconPlus className="size-3.5" />
                Novo checklist
              </Button>
            }
          />
        )}
      </div>

      {/* Lista de Checklists */}
      <div className="space-y-4">
        {listas.map((itemChecklist) => (
          <ChecklistBlock
            key={itemChecklist.id}
            cardId={cardId}
            checklist={itemChecklist}
            podeEditar={permissaoEdicao}
          />
        ))}
      </div>
    </div>
  );
}

export const CardChecklistsContainer = ContainerListasVerificacao;
