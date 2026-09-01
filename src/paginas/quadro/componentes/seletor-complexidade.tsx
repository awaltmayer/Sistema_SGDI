import { useState } from "react";
import { IconGauge, IconCheck } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/componentes/ui/painel-flutuante";
import { configuracaoComplexidade, complexityConfig, type Complexity } from "@/dados/dados-iniciais";

export interface PropsSeletorComplexidade {
  complexidade?: Complexity;
  aoSelecionar?: (complexidade: Complexity) => void;
  children?: React.ReactNode;
  alinhamento?: "start" | "center" | "end";
  // Aliases compatibilidade
  complexity?: Complexity;
  onSelect?: (complexity: Complexity) => void;
  align?: "start" | "center" | "end";
}
export type ComplexityPopoverProps = PropsSeletorComplexidade;

const complexidades: Complexity[] = ["low", "medium", "high", "very-high"];

export function SeletorComplexidade({
  complexidade,
  aoSelecionar,
  children,
  alinhamento,
  complexity,
  onSelect,
  align,
}: PropsSeletorComplexidade) {
  const [aberto, setAberto] = useState(false);
  const complexidadeAtual = complexidade ?? complexity ?? "medium";
  const selecionar = aoSelecionar ?? onSelect ?? (() => {});
  const alinhar = alinhamento ?? align ?? "start";

  const atual = configuracaoComplexidade[complexidadeAtual] ?? configuracaoComplexidade.medium;

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        {children ?? (
          <button
            type="button"
            aria-label={`Complexidade: ${atual.label}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/80 px-2 py-0.5 text-xs font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <span className={`size-2 rounded-full ${atual.dot}`} />
            <span>{atual.label}</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align={alinhar}
        className="w-56 p-1.5"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Nível de Complexidade
        </div>
        <div className="space-y-1">
          {complexidades.map((chaveComp) => {
            const conf = configuracaoComplexidade[chaveComp];
            const estaSelecionado = complexidadeAtual === chaveComp;
            return (
              <button
                key={chaveComp}
                type="button"
                onClick={() => {
                  selecionar(chaveComp);
                  setAberto(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                  estaSelecionado ? "bg-accent font-medium text-foreground" : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${conf.dot}`} />
                  <div>
                    <div className="font-medium">{conf.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Estimativa: ~{conf.estimatedHours}h
                    </div>
                  </div>
                </div>
                {estaSelecionado && <IconCheck className="size-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const ComplexityPopover = SeletorComplexidade;

