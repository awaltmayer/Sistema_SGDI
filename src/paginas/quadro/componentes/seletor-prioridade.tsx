import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/componentes/ui/painel-flutuante';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from '@/componentes/ui/comando';
import type { BadgeColor } from '@/componentes/base/distintivo';
import type { Prioridade } from '@/dados/dados-iniciais';
import { cn } from '@/lib/utilitarios';

export const configuracaoPrioridades: Record<
  Prioridade,
  { label: string; color: BadgeColor; dot: string; classeSolida: string }
> = {
  high: {
    label: 'Alta',
    color: 'red',
    dot: 'bg-red-600',
    classeSolida: 'bg-red-600 text-white font-medium rounded-sm border-0 shadow-none px-2 py-0.5 text-xs',
  },
  medium: {
    label: 'Média',
    color: 'amber',
    dot: 'bg-amber-500',
    classeSolida: 'bg-amber-500 text-white font-medium rounded-sm border-0 shadow-none px-2 py-0.5 text-xs',
  },
  low: {
    label: 'Baixa',
    color: 'gray',
    dot: 'bg-slate-500',
    classeSolida: 'bg-slate-500 text-white font-medium rounded-sm border-0 shadow-none px-2 py-0.5 text-xs',
  },
};
export const priorityConfig = configuracaoPrioridades;

export interface PropsSeletorPrioridade {
  prioridade?: Prioridade;
  aoSelecionar?: (prioridade: Prioridade) => void;
  // Aliases compatibilidade
  priority?: Prioridade;
  onSelect?: (priority: Prioridade) => void;
}
export type PriorityPopoverProps = PropsSeletorPrioridade;

export function SeletorPrioridade({
  prioridade,
  aoSelecionar,
  priority,
  onSelect,
}: PropsSeletorPrioridade) {
  const [aberto, setAberto] = useState(false);
  const prioridadeAtual = prioridade ?? priority ?? 'medium';
  const selecionarPrioridade = aoSelecionar ?? onSelect ?? (() => {});
  const config = configuracaoPrioridades[prioridadeAtual] ?? configuracaoPrioridades.medium;

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAberto(!aberto);
          }}
          className={cn(
            'cursor-pointer inline-flex items-center justify-center transition-opacity hover:opacity-90',
            config.classeSolida
          )}
        >
          {config.label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-44 p-1"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Buscar prioridade…" />
          <CommandList>
            <CommandGroup heading="Prioridade">
              {(['high', 'medium', 'low'] as Prioridade[]).map((p) => {
                const cfg = configuracaoPrioridades[p];
                return (
                  <CommandItem
                    key={p}
                    onSelect={() => {
                      selecionarPrioridade(p);
                      setAberto(false);
                    }}
                    className="flex items-center gap-2 cursor-pointer py-1.5"
                  >
                    <span className={`size-2.5 rounded-sm ${cfg.dot}`} />
                    <span className="font-medium text-xs text-foreground">{cfg.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const PriorityPopover = SeletorPrioridade;
