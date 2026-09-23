import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
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

export interface PropsSeletorResponsavel {
  responsavel?: { id: string; initials: string; full_name: string; avatar_url?: string | null } | null;
  aoSelecionar?: (idResponsavel: string | null) => void;
  children?: React.ReactNode;
  // Aliases compatibilidade
  assignee?: { id: string; initials: string; full_name: string; avatar_url?: string | null } | null;
  onSelect?: (assigneeId: string | null) => void;
}
export type AssigneePopoverProps = PropsSeletorResponsavel;

export function SeletorResponsavel({
  responsavel,
  aoSelecionar,
  children,
  assignee,
  onSelect,
}: PropsSeletorResponsavel) {
  const [aberto, setAberto] = useState(false);
  const { useTeamMembers } = useDataProvider();
  const { data: membros = [] } = useTeamMembers();

  const responsavelAtual = responsavel !== undefined ? responsavel : assignee;
  const selecionar = aoSelecionar ?? onSelect ?? (() => {});

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAberto((prev) => !prev);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="cursor-pointer text-left focus:outline-none"
        >
          {children ?? (
            responsavelAtual ? (
              <Avatar className="size-6">
                {responsavelAtual.avatar_url && (
                  <AvatarImage src={responsavelAtual.avatar_url} alt={responsavelAtual.full_name} />
                )}
                <AvatarFallback className="text-[10px]">
                  {responsavelAtual.initials}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px] text-muted-foreground">
                  ?
                </AvatarFallback>
              </Avatar>
            )
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-60 p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Buscar membro da equipe…" className="h-8 text-xs" />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty className="py-2.5 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado.
            </CommandEmpty>
            <CommandGroup heading="Responsável">
              {(membros ?? []).map((member) => {
                const estaSelecionado = responsavelAtual?.id === member.id;
                return (
                  <CommandItem
                    key={member.id}
                    value={`${member.full_name || member.nome_completo} ${member.email || ''}`}
                    onSelect={() => {
                      selecionar(member.id);
                      setAberto(false);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selecionar(member.id);
                      setAberto(false);
                    }}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Avatar className="size-5 shrink-0">
                      {member.avatar_url && (
                        <AvatarImage src={member.avatar_url} alt={member.full_name} />
                      )}
                      <AvatarFallback className="text-[9px]">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate flex-1">{member.full_name}</span>
                    {estaSelecionado && (
                      <IconCheck className="ml-auto size-3.5 shrink-0 text-primary" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="unassigned nao atribuido sem responsavel"
                onSelect={() => {
                  selecionar(null);
                  setAberto(false);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selecionar(null);
                  setAberto(false);
                }}
                className="cursor-pointer gap-2 text-xs"
              >
                <span className="flex-1">Não atribuído</span>
                {!responsavelAtual && (
                  <IconCheck className="ml-auto size-3.5 shrink-0 text-primary" />
                )}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const AssigneePopover = SeletorResponsavel;

