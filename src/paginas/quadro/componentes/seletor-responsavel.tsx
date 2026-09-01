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
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
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
        className="w-56 p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Buscar membro da equipe…" />
          <CommandList>
            <CommandGroup heading="Responsável">
              {(membros ?? []).map((member) => (
                <CommandItem
                  key={member.id}
                  onSelect={() => {
                    // TODO: selecionar responsavel
                    setAberto(false);
                  }}
                >
                  <Avatar className="size-5">
                    {member.avatar_url && (
                      <AvatarImage src={member.avatar_url} alt={member.full_name} />
                    )}
                    <AvatarFallback className="text-[9px]">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  {member.full_name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  // TODO: desatribuir responsavel
                  setAberto(false);
                }}
              >
                Não atribuído
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const AssigneePopover = SeletorResponsavel;

