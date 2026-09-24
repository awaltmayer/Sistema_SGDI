import { useMemo, useState } from 'react';
import { IconCheck, IconUsers, IconX } from '@tabler/icons-react';
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
import { Badge } from '@/componentes/ui/emblema';
import { cn } from '@/lib/utilitarios';

export interface PropsSeletorResponsavel {
  responsavel?: {
    id: string;
    initials?: string;
    full_name?: string;
    avatar_url?: string | null;
    nome_completo?: string;
    iniciais?: string;
    url_avatar?: string | null;
  } | null;
  responsaveis?: Array<{
    id: string;
    initials?: string;
    full_name?: string;
    avatar_url?: string | null;
    nome_completo?: string;
    iniciais?: string;
    url_avatar?: string | null;
  }>;
  idsResponsaveis?: string[];
  aoSelecionar?: (idResponsavel: string | null) => void;
  aoSelecionarMultiplo?: (idsResponsaveis: string[]) => void;
  children?: React.ReactNode;
  // Aliases compatibilidade
  assignee?: any;
  assignees?: any[];
  assigneeIds?: string[];
  onSelect?: (assigneeId: string | null) => void;
  onSelectMultiple?: (assigneeIds: string[]) => void;
}
export type AssigneePopoverProps = PropsSeletorResponsavel;

export function SeletorResponsavel({
  responsavel,
  responsaveis,
  idsResponsaveis,
  aoSelecionar,
  aoSelecionarMultiplo,
  children,
  assignee,
  assignees,
  assigneeIds,
  onSelect,
  onSelectMultiple,
}: PropsSeletorResponsavel) {
  const [aberto, setAberto] = useState(false);
  const { useTeamMembers } = useDataProvider();
  const { data: membros = [] } = useTeamMembers();

  // Consolidação dos responsáveis selecionados
  const listaSelecionados = useMemo(() => {
    const list: string[] = [];
    if (idsResponsaveis && idsResponsaveis.length > 0) {
      list.push(...idsResponsaveis.map(String));
    } else if (assigneeIds && assigneeIds.length > 0) {
      list.push(...assigneeIds.map(String));
    } else if (responsaveis && responsaveis.length > 0) {
      list.push(...responsaveis.map((r) => String(r.id)));
    } else if (assignees && assignees.length > 0) {
      list.push(...assignees.map((r) => String(r.id)));
    } else if (responsavel?.id) {
      list.push(String(responsavel.id));
    } else if (assignee?.id) {
      list.push(String(assignee.id));
    }
    return Array.from(new Set(list));
  }, [idsResponsaveis, assigneeIds, responsaveis, assignees, responsavel, assignee]);

  const selecionarMultiplo = aoSelecionarMultiplo ?? onSelectMultiple;
  const selecionarSimples = aoSelecionar ?? onSelect;

  const alternarMembro = (idMembro: string) => {
    const idStr = String(idMembro);
    let novaLista: string[];
    if (listaSelecionados.includes(idStr)) {
      novaLista = listaSelecionados.filter((id) => id !== idStr);
    } else {
      novaLista = [...listaSelecionados, idStr];
    }

    selecionarMultiplo?.(novaLista);
    selecionarSimples?.(novaLista[0] ?? null);
  };

  const limparTodos = () => {
    selecionarMultiplo?.([]);
    selecionarSimples?.(null);
  };

  // Objetos dos membros selecionados para renderização
  const membrosSelecionados = useMemo(() => {
    return membros.filter((m) => listaSelecionados.includes(String(m.id)));
  }, [membros, listaSelecionados]);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setAberto((prev) => !prev);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="cursor-pointer text-left focus:outline-none"
        >
          {children ?? (
            membrosSelecionados.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                  {membrosSelecionados.slice(0, 3).map((m) => (
                    <Avatar key={m.id} className="size-5 ring-1 ring-background">
                      {(m.url_avatar || m.avatar_url) && (
                        <AvatarImage src={m.url_avatar || m.avatar_url!} alt={m.nome_completo || m.full_name} />
                      )}
                      <AvatarFallback className="text-[9px]">
                        {m.iniciais || m.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-foreground font-medium truncate max-w-[120px]">
                  {membrosSelecionados.length === 1
                    ? (membrosSelecionados[0].nome_completo || membrosSelecionados[0].full_name)
                    : `${membrosSelecionados.length} responsáveis`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[10px] text-muted-foreground">
                    ?
                  </AvatarFallback>
                </Avatar>
                <span>Não atribuído</span>
              </div>
            )
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 shadow-lg"
        align="start"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-1.5">
            <IconUsers className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Responsáveis pela tarefa
            </span>
          </div>
          {listaSelecionados.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {listaSelecionados.length}
            </Badge>
          )}
        </div>

        <Command>
          <CommandInput placeholder="Buscar responsável…" className="h-8 text-xs" />
          <CommandList className="max-h-60 overflow-y-auto p-1">
            <CommandEmpty className="py-2.5 text-center text-xs text-muted-foreground">
              Nenhum responsável encontrado.
            </CommandEmpty>
            <CommandGroup>
              {(membros ?? []).map((member) => {
                const estaSelecionado = listaSelecionados.includes(String(member.id));
                const nomeMembro = member.nome_completo || member.full_name || 'Responsável';
                return (
                  <CommandItem
                    key={member.id}
                    value={`${nomeMembro} ${member.email || ''}`}
                    onSelect={() => alternarMembro(member.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      alternarMembro(member.id);
                    }}
                    className={cn(
                      "cursor-pointer gap-2 text-xs py-1.5 px-2 rounded-sm transition-colors",
                      estaSelecionado && "bg-accent/60 font-medium"
                    )}
                  >
                    <Avatar className="size-5 shrink-0">
                      {(member.url_avatar || member.avatar_url) && (
                        <AvatarImage src={member.url_avatar || member.avatar_url!} alt={nomeMembro} />
                      )}
                      <AvatarFallback className="text-[9px]">
                        {member.iniciais || member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{nomeMembro}</span>
                      {member.email && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {member.email}
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "size-4 rounded-xs border flex items-center justify-center shrink-0 transition-colors",
                        estaSelecionado
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {estaSelecionado && <IconCheck className="size-3 stroke-[3]" />}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {listaSelecionados.length > 0 && (
              <>
                <CommandSeparator className="my-1" />
                <CommandGroup>
                  <CommandItem
                    value="limpar remover desmarcar desatribuir"
                    onSelect={limparTodos}
                    onClick={(e) => {
                      e.stopPropagation();
                      limparTodos();
                    }}
                    className="cursor-pointer gap-2 text-xs text-muted-foreground hover:text-destructive py-1.5 px-2"
                  >
                    <IconX className="size-3.5" />
                    <span>Remover todos os responsáveis</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const AssigneePopover = SeletorResponsavel;
