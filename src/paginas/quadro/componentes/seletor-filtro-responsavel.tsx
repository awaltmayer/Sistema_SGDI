import { useState } from 'react';
import { IconUser, IconChevronDown, IconCheck, IconUsers, IconUserX } from '@tabler/icons-react';
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
import { useDataProvider } from '@/lib/provedor-dados';
import { cn } from '@/lib/utilitarios';

export interface PropsSeletorFiltroResponsavel {
  responsavelSelecionadoId?: string;
  aoMudarResponsavel?: (id: string) => void;
  className?: string;
}

export function SeletorFiltroResponsavel({
  responsavelSelecionadoId = 'all',
  aoMudarResponsavel,
  className,
}: PropsSeletorFiltroResponsavel) {
  const [aberto, setAberto] = useState(false);
  const { useTeamMembers } = useDataProvider();
  const { data: membros = [] } = useTeamMembers();

  const membroAtivo =
    responsavelSelecionadoId !== 'all' && responsavelSelecionadoId !== 'unassigned'
      ? membros.find((m) => m.id === responsavelSelecionadoId)
      : null;

  const obterTextoExibicao = () => {
    if (responsavelSelecionadoId === 'all') return 'Responsável';
    if (responsavelSelecionadoId === 'unassigned') return 'Sem responsável';
    return membroAtivo ? (membroAtivo.full_name || membroAtivo.nome_completo) : 'Responsável';
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filtrar por responsável"
          className={cn(
            'inline-flex h-8 w-[145px] items-center justify-between gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-normal shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            className
          )}
        >
          <div className="flex items-center gap-1.5 truncate">
            <IconUser className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{obterTextoExibicao()}</span>
          </div>
          <IconChevronDown className="size-3 shrink-0 text-muted-foreground opacity-60" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar responsável por nome..." className="h-8 text-xs" />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
              Nenhum responsável encontrado.
            </CommandEmpty>

            <CommandGroup>
              <CommandItem
                value="all todos todos os responsaveis qualquer"
                onSelect={() => {
                  aoMudarResponsavel?.('all');
                  setAberto(false);
                }}
                className="gap-2 text-xs cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <IconUsers className="size-3" />
                </div>
                <span>Todos os Responsáveis</span>
                {responsavelSelecionadoId === 'all' && (
                  <IconCheck className="ml-auto size-3.5 text-primary" />
                )}
              </CommandItem>

              <CommandItem
                value="unassigned nao atribuido sem responsavel nenhum"
                onSelect={() => {
                  aoMudarResponsavel?.('unassigned');
                  setAberto(false);
                }}
                className="gap-2 text-xs cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <IconUserX className="size-3" />
                </div>
                <span>Não atribuído</span>
                {responsavelSelecionadoId === 'unassigned' && (
                  <IconCheck className="ml-auto size-3.5 text-primary" />
                )}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Membros da Equipe">
              {(membros ?? []).map((m) => {
                const estaSelecionado = responsavelSelecionadoId === m.id;
                const nomeExibicao = m.full_name || m.nome_completo;
                return (
                  <CommandItem
                    key={m.id}
                    value={`${nomeExibicao} ${m.email || ''}`}
                    onSelect={() => {
                      aoMudarResponsavel?.(m.id);
                      setAberto(false);
                    }}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <Avatar className="size-5 shrink-0">
                      {m.avatar_url && <AvatarImage src={m.avatar_url} alt={nomeExibicao} />}
                      <AvatarFallback className="text-[9px]">{m.initials || m.iniciais}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate font-medium">{nomeExibicao}</span>
                      {m.email && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {m.email}
                        </span>
                      )}
                    </div>
                    {estaSelecionado && (
                      <IconCheck className="ml-auto size-3.5 shrink-0 text-primary" />
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
