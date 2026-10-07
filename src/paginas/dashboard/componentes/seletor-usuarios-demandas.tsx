import { useState, useMemo } from 'react';
import {
  IconUserCheck,
  IconChevronDown,
  IconCheck,
  IconUsers,
  IconUserExclamation,
} from '@tabler/icons-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/componentes/ui/painel-flutuante';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/componentes/ui/comando';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import type { CargaResponsavelItem } from '../calculos-dashboard';
import { cn } from '@/lib/utilitarios';

export interface PropsSeletorUsuariosDemandas {
  todosItens: CargaResponsavelItem[];
  totalNaoAtribuidas: number;
  selecionados: string[];
  aoMudarSelecao: (novosSelecionados: string[]) => void;
  className?: string;
}

export function SeletorUsuariosDemandas({
  todosItens,
  totalNaoAtribuidas,
  selecionados,
  aoMudarSelecao,
  className,
}: PropsSeletorUsuariosDemandas) {
  const [aberto, setAberto] = useState(false);

  // Lista com todos os IDs válidos
  const todosIds = useMemo(() => {
    const ids = todosItens.map((item) => item.id);
    if (totalNaoAtribuidas > 0) {
      ids.push('sem-responsavel');
    }
    return ids;
  }, [todosItens, totalNaoAtribuidas]);

  const totalGeralDemandas = useMemo(() => {
    return todosItens.reduce((acc, item) => acc + item.totalAbertas, 0) + totalNaoAtribuidas;
  }, [todosItens, totalNaoAtribuidas]);

  const todosEstaoSelecionados = todosIds.length > 0 && selecionados.length === todosIds.length;

  const alternarUsuario = (id: string) => {
    if (selecionados.includes(id)) {
      aoMudarSelecao(selecionados.filter((uId) => uId !== id));
    } else {
      aoMudarSelecao([...selecionados, id]);
    }
  };

  const selecionarTodos = () => {
    aoMudarSelecao(todosIds);
  };

  const limparSelecao = () => {
    aoMudarSelecao([]);
  };

  // Texto do label do botão Trigger
  const textoRotulo = useMemo(() => {
    if (selecionados.length === 0) {
      return 'Selecione o usuário...';
    }
    if (todosEstaoSelecionados) {
      return `Todos os Usuários (${totalGeralDemandas})`;
    }
    if (selecionados.length === 1) {
      const id = selecionados[0];
      if (id === 'sem-responsavel') {
        return `Sem Responsável (${totalNaoAtribuidas})`;
      }
      const membro = todosItens.find((m) => m.id === id);
      if (membro) {
        return `${membro.nome} (${membro.totalAbertas})`;
      }
    }
    return `${selecionados.length} usuários selecionados`;
  }, [selecionados, todosEstaoSelecionados, totalGeralDemandas, totalNaoAtribuidas, todosItens]);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filtrar por usuário"
          className={cn(
            'inline-flex h-8 min-w-[190px] max-w-[280px] items-center justify-between gap-2 rounded-sm border border-input bg-card px-2.5 text-xs font-normal shadow-xs transition-colors hover:bg-muted text-foreground focus-visible:outline-none cursor-pointer',
            className
          )}
        >
          <div className="flex items-center gap-1.5 truncate">
            <IconUserCheck className="size-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium">
              {textoRotulo}
            </span>
          </div>
          <IconChevronDown className="size-3 shrink-0 text-muted-foreground opacity-70" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0 rounded-md border border-border bg-popover shadow-xl" align="start">
        <Command>
          <CommandInput placeholder="Buscar usuário por nome..." className="h-8 text-xs" />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
              Nenhum usuário encontrado.
            </CommandEmpty>

            <CommandGroup>
              {/* Opção Todos os Usuários */}
              <CommandItem
                value="all todos todos os usuarios qualquer equipe"
                onSelect={() => {
                  if (todosEstaoSelecionados) {
                    limparSelecao();
                  } else {
                    selecionarTodos();
                  }
                }}
                className="gap-2 text-xs cursor-pointer py-1.5"
              >
                <div className="flex size-5 items-center justify-center rounded-xs bg-muted text-muted-foreground shrink-0">
                  <IconUsers className="size-3" />
                </div>
                <div className="flex-1 min-w-0 font-medium">Todos os Usuários</div>
                <span className="text-[10px] font-mono text-muted-foreground font-semibold px-1 py-0.2 bg-muted rounded-xs shrink-0">
                  {totalGeralDemandas}
                </span>
                {todosEstaoSelecionados && (
                  <IconCheck className="ml-1 size-3.5 shrink-0 text-primary" />
                )}
              </CommandItem>

              {/* Opção Sem Responsável */}
              {totalNaoAtribuidas > 0 && (
                <CommandItem
                  value="sem-responsavel sem responsavel fora do sla"
                  onSelect={() => {
                    alternarUsuario('sem-responsavel');
                  }}
                  className="gap-2 text-xs cursor-pointer py-1.5"
                >
                  <div className="flex size-5 items-center justify-center rounded-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <IconUserExclamation className="size-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">Sem Responsável</div>
                    <div className="text-[10px] text-muted-foreground">Fora do SLA</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 font-semibold px-1 py-0.2 bg-muted rounded-xs shrink-0">
                    {totalNaoAtribuidas}
                  </span>
                  {selecionados.includes('sem-responsavel') && (
                    <IconCheck className="ml-1 size-3.5 shrink-0 text-primary" />
                  )}
                </CommandItem>
              )}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Membros da Equipe">
              {todosItens.map((m) => {
                const estaSelecionado = selecionados.includes(m.id);
                return (
                  <CommandItem
                    key={m.id}
                    value={`${m.nome} ${m.email ?? ''}`}
                    onSelect={() => {
                      alternarUsuario(m.id);
                    }}
                    className="gap-2 text-xs cursor-pointer py-1.5"
                  >
                    <Avatar className="size-5 shrink-0 rounded-xs text-[9px]">
                      {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.nome} className="rounded-xs" />}
                      <AvatarFallback className="rounded-xs bg-muted text-foreground font-semibold">
                        {m.iniciais}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-medium">{m.nome}</span>
                        <span className="text-[10px] font-mono text-muted-foreground font-semibold px-1.5 py-0.2 bg-muted rounded-xs shrink-0">
                          {m.totalAbertas} {m.totalAbertas === 1 ? 'demanda' : 'demandas'}
                        </span>
                      </div>
                      {m.email && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {m.email}
                        </span>
                      )}
                    </div>

                    {estaSelecionado && (
                      <IconCheck className="ml-1 size-3.5 shrink-0 text-primary" />
                    )}
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
