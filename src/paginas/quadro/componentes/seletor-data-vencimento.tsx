import { useState } from 'react';
import { format, parseISO, differenceInCalendarDays, startOfToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/componentes/ui/painel-flutuante';
import { Calendar } from '@/componentes/ui/calendario';
import { Button } from '@/componentes/base/botao';
import { IconCalendar, IconCalendarDue, IconClock, IconX } from '@tabler/icons-react';

export type StatusPrazoVencimento = 'dentro-do-prazo' | 'atencao' | 'atrasado';

export interface InformacaoPrazoVencimento {
  status: StatusPrazoVencimento | null;
  diasRestantes: number | null;
  cor: 'blue' | 'yellow' | 'red' | 'gray';
  textoFormatado: string;
  textoRelativo: string;
  classeTexto: string;
  classeBadge: string;
  classeBorda: string;
}

/**
 * Calcula o status do prazo de vencimento conforme a regra:
 * - Azul: Dentro do prazo (mais de 7 dias)
 * - Amarelo: Faltar 7 dias ou menos para o prazo (0 a 7 dias)
 * - Vermelho: Atrasado (dias < 0)
 */
export function calcularStatusPrazo(isoDate: string | null | undefined): InformacaoPrazoVencimento {
  if (!isoDate) {
    return {
      status: null,
      diasRestantes: null,
      cor: 'gray',
      textoFormatado: 'Sem data',
      textoRelativo: 'Sem data definida',
      classeTexto: 'text-muted-foreground',
      classeBadge: 'bg-slate-500 text-white font-medium rounded-sm border-0 shadow-none hover:bg-slate-600',
      classeBorda: 'border-0',
    };
  }

  try {
    const limpo = String(isoDate).split('T')[0];
    const partes = limpo.split('-').map(Number);
    if (partes.length !== 3 || isNaN(partes[0]) || isNaN(partes[1]) || isNaN(partes[2])) {
      return {
        status: null,
        diasRestantes: null,
        cor: 'gray',
        textoFormatado: 'Data inválida',
        textoRelativo: 'Data inválida',
        classeTexto: 'text-muted-foreground',
        classeBadge: 'bg-slate-500 text-white font-medium rounded-sm border-0 shadow-none',
        classeBorda: 'border-0',
      };
    }

    const dataAlvo = new Date(partes[0], partes[1] - 1, partes[2]);
    const hoje = startOfToday();
    const dias = differenceInCalendarDays(dataAlvo, hoje);
    const dataFormatada = format(dataAlvo, 'dd/MM/yyyy');

    if (dias < 0) {
      // Vermelho: Atrasado (flat sólido sem transparência, sem borda, sem efeitos)
      const diasAtraso = Math.abs(dias);
      const txt = diasAtraso === 1 ? 'Vencido ontem' : `${diasAtraso}d de atraso`;
      return {
        status: 'atrasado',
        diasRestantes: dias,
        cor: 'red',
        textoFormatado: dataFormatada,
        textoRelativo: txt,
        classeTexto: 'text-white font-medium',
        classeBadge: 'bg-red-600 text-white font-medium rounded-sm border-0 shadow-none hover:bg-red-700',
        classeBorda: 'border-0',
      };
    } else if (dias <= 7) {
      // Amarelo: Faltar 7 dias ou menos para o prazo (flat sólido sem transparência, sem borda, sem efeitos)
      let txt = '';
      if (dias === 0) txt = 'Vence hoje';
      else if (dias === 1) txt = 'Vence amanhã';
      else txt = `${dias}d restantes`;

      return {
        status: 'atencao',
        diasRestantes: dias,
        cor: 'yellow',
        textoFormatado: dataFormatada,
        textoRelativo: txt,
        classeTexto: 'text-white font-medium',
        classeBadge: 'bg-amber-500 text-white font-medium rounded-sm border-0 shadow-none hover:bg-amber-600',
        classeBorda: 'border-0',
      };
    } else {
      // Azul: Dentro do prazo (mais de 7 dias) (flat sólido sem transparência, sem borda, sem efeitos)
      return {
        status: 'dentro-do-prazo',
        diasRestantes: dias,
        cor: 'blue',
        textoFormatado: dataFormatada,
        textoRelativo: `${dias}d restantes`,
        classeTexto: 'text-white font-medium',
        classeBadge: 'bg-blue-600 text-white font-medium rounded-sm border-0 shadow-none hover:bg-blue-700',
        classeBorda: 'border-0',
      };
    }
  } catch {
    return {
      status: null,
      diasRestantes: null,
      cor: 'gray',
      textoFormatado: 'Sem data',
      textoRelativo: 'Sem data definida',
      classeTexto: 'text-muted-foreground',
      classeBadge: 'bg-slate-500 text-white font-medium rounded-sm border-0 shadow-none',
      classeBorda: 'border-0',
    };
  }
}

export interface PropsSeletorDataVencimento {
  dataVencimento?: string | null;
  aoSelecionar?: (data: string | null) => void;
  children?: React.ReactNode;
  alinhamento?: 'start' | 'center' | 'end';
  // Aliases compatibilidade
  dueDate?: string | null;
  onSelect?: (date: string | null) => void;
  align?: 'start' | 'center' | 'end';
}
export type DueDatePopoverProps = PropsSeletorDataVencimento;

export function SeletorDataVencimento({
  dataVencimento,
  aoSelecionar,
  children,
  alinhamento,
  dueDate,
  onSelect,
  align,
}: PropsSeletorDataVencimento) {
  const [aberto, setAberto] = useState(false);
  const dataAtual = dataVencimento !== undefined ? dataVencimento : dueDate ?? null;
  const infoPrazo = calcularStatusPrazo(dataAtual);
  const acaoSelecionar = aoSelecionar ?? onSelect;
  const alinhar = alinhamento ?? align ?? 'start';

  const dataSelecionada = dataAtual
    ? (() => {
        try {
          const partes = dataAtual.split('T')[0].split('-').map(Number);
          return new Date(partes[0], partes[1] - 1, partes[2]);
        } catch {
          return undefined;
        }
      })()
    : undefined;

  const aplicarData = (d: Date | null) => {
    if (d) {
      // Formata como YYYY-MM-DD local sem perda de fuso horário
      const isoStr = format(d, 'yyyy-MM-dd');
      acaoSelecionar?.(isoStr);
    } else {
      acaoSelecionar?.(null);
    }
    setAberto(false);
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        {children ? (
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setAberto(!aberto);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="cursor-pointer text-left focus:outline-none"
          >
            {children}
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAberto(!aberto);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1.5 rounded-sm border-0 shadow-none px-2 py-1 text-xs cursor-pointer transition-colors ${infoPrazo.classeBadge}`}
          >
            <IconCalendar className="size-3.5" />
            <span>{infoPrazo.textoFormatado}</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={alinhar}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between border-b pb-2 px-1">
            <div className="flex items-center gap-1.5">
              <IconCalendarDue className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Data de vencimento
              </span>
            </div>
            {dataAtual && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-sm border-0 shadow-none ${infoPrazo.classeBadge}`}>
                {infoPrazo.textoRelativo}
              </span>
            )}
          </div>

          {/* Atalhos rápidos de data */}
          <div className="grid grid-cols-4 gap-1 px-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => aplicarData(startOfToday())}
              className="h-7 text-[11px] px-1.5"
            >
              Hoje
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => aplicarData(addDays(startOfToday(), 1))}
              className="h-7 text-[11px] px-1.5"
            >
              Amanhã
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => aplicarData(addDays(startOfToday(), 7))}
              className="h-7 text-[11px] px-1.5"
            >
              +7 dias
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => aplicarData(addDays(startOfToday(), 15))}
              className="h-7 text-[11px] px-1.5"
            >
              +15 dias
            </Button>
          </div>

          <div className="rounded-md border p-1 bg-card">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={dataSelecionada}
              onSelect={(date) => {
                if (date) {
                  aplicarData(date);
                }
              }}
              defaultMonth={dataSelecionada ?? startOfToday()}
            />
          </div>

          <div className="border-t pt-2 flex items-center justify-between px-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => aplicarData(null)}
            >
              <IconX className="size-3.5 mr-1" />
              Limpar data
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setAberto(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const DueDatePopover = SeletorDataVencimento;
