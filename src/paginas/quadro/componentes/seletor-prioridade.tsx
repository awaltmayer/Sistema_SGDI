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
import { Badge } from '@/componentes/base/distintivo';
import type { BadgeColor } from '@/componentes/base/distintivo';
import type { Priority } from '@/dados/dados-iniciais';

export const priorityConfig: Record<Priority, { label: string; color: BadgeColor; dot: string }> = {
  high: { label: 'Alta', color: 'red', dot: 'bg-red-500' },
  medium: { label: 'Média', color: 'amber', dot: 'bg-amber-500' },
  low: { label: 'Baixa', color: 'gray', dot: 'bg-gray-400' },
};
export const configuracaoPrioridades = priorityConfig;

export interface PropsSeletorPrioridade {
  prioridade?: Priority;
  aoSelecionar?: (prioridade: Priority) => void;
  // Aliases compatibilidade
  priority?: Priority;
  onSelect?: (priority: Priority) => void;
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
  const config = configuracaoPrioridades[prioridadeAtual];

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
        >
          <Badge color={config.color} className="text-xs">
            {config.label}
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Buscar prioridade…" />
          <CommandList>
            <CommandGroup heading="Prioridade">
              {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                const cfg = configuracaoPrioridades[p];
                return (
                  <CommandItem
                    key={p}
                    onSelect={() => {
                      selecionarPrioridade(p);
                      setAberto(false);
                    }}
                  >
                    <span className={`size-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
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
