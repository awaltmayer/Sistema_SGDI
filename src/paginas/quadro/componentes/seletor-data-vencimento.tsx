import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/componentes/ui/painel-flutuante';
import { Calendar } from '@/componentes/ui/calendario';
import { Button } from '@/componentes/base/botao';
import { Badge } from '@/componentes/base/distintivo';
import { IconCalendarDue } from '@tabler/icons-react';

export interface PropsSeletorDataVencimento {
  dataVencimento?: string | null;
  aoSelecionar?: (data: string | null) => void;
  children?: React.ReactNode;
  // Aliases compatibilidade
  dueDate?: string | null;
  onSelect?: (date: string | null) => void;
}
export type DueDatePopoverProps = PropsSeletorDataVencimento;

export function SeletorDataVencimento({
  dataVencimento,
  aoSelecionar,
  children,
  dueDate,
  onSelect,
}: PropsSeletorDataVencimento) {
  const [aberto, setAberto] = useState(false);
  const dataAtual = dataVencimento !== undefined ? dataVencimento : dueDate ?? null;
  const dataSelecionada = dataAtual ? parseISO(dataAtual) : undefined;
  const acaoSelecionar = aoSelecionar ?? onSelect;

  const formatarDataVencimento = (strData: string) => {
    return format(parseISO(strData), 'MMM d');
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
        >
          {children ?? (
            dataAtual ? (
              <Badge color="gray" className="text-xs">
                {formatarDataVencimento(dataAtual)}
              </Badge>
            ) : (
              <Badge color="gray" className="text-xs text-muted-foreground">
                <IconCalendarDue className="size-3" />
              </Badge>
            )
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2">
          <p className="px-3 py-2 text-sm font-medium">Data de vencimento</p>
          <Calendar
            mode="single"
            selected={dataSelecionada}
            onSelect={(date) => {
              if (date) {
                const isoDate = date.toISOString().split('T')[0];
                acaoSelecionar?.(isoDate);
              }
              setAberto(false);
            }}
            defaultMonth={dataSelecionada}
          />
          <div className="border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                acaoSelecionar?.(null);
                setAberto(false);
              }}
            >
              Limpar data
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const DueDatePopover = SeletorDataVencimento;

