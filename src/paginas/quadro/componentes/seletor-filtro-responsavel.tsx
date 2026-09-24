import { useState, useMemo } from 'react';
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
  const { useTeamMembers, useCards } = useDataProvider();
  const { data: membros = [] } = useTeamMembers();
  const { data: cartoes = [] } = useCards();

  // Coleta IDs de responsáveis com tarefas associadas e verifica se há tarefas sem responsável
  const { idsResponsaveisComTarefas, temNaoAtribuido } = useMemo(() => {
    const ids = new Set<string>();
    let semResp = false;
    for (const c of cartoes) {
      const respIds = (c.ids_responsaveis ?? c.assignee_ids ?? (c.id_responsavel ? [String(c.id_responsavel)] : [])).map(String);
      if (respIds.length > 0) {
        respIds.forEach((id) => ids.add(id));
      } else {
        semResp = true;
      }
    }
    return { idsResponsaveisComTarefas: ids, temNaoAtribuido: semResp };
  }, [cartoes]);

  // Lista exclusivamente os usuários que realmente possuem cartões atribuídos a eles
  const responsaveisAtivos = useMemo(() => {
    const mapa = new Map<string, {
      id: string;
      nome_completo: string;
      iniciais: string;
      email?: string;
      url_avatar?: string | null;
    }>();

    for (const m of membros) {
      const idStr = String(m.id);
      const idUser = m.id_usuario ? String(m.id_usuario) : null;
      const idMemberUser = m.id_usuario_membro ? String(m.id_usuario_membro) : null;

      const coincideComCartao =
        idsResponsaveisComTarefas.has(idStr) ||
        (idUser && idsResponsaveisComTarefas.has(idUser)) ||
        (idMemberUser && idsResponsaveisComTarefas.has(idMemberUser));

      if (coincideComCartao) {
        const chave = idsResponsaveisComTarefas.has(idStr)
          ? idStr
          : (idUser && idsResponsaveisComTarefas.has(idUser) ? idUser : idMemberUser!);

        mapa.set(chave, {
          id: chave,
          nome_completo: m.nome_completo || m.full_name || 'Responsável',
          iniciais: m.iniciais || m.initials || 'R',
          email: m.email,
          url_avatar: m.url_avatar || m.avatar_url,
        });
      }
    }

    // Se houver algum responsável presente no cartão mas ausente na lista de membros
    for (const c of cartoes) {
      const respId = c.id_responsavel ?? c.assignee_id;
      if (respId && !mapa.has(String(respId))) {
        const respObj = c.responsavel ?? c.assignee;
        mapa.set(String(respId), {
          id: String(respId),
          nome_completo: respObj?.full_name || respObj?.nome_completo || `Usuário (${String(respId).slice(0, 6)})`,
          iniciais: respObj?.initials || respObj?.iniciais || 'R',
          email: '',
          url_avatar: respObj?.avatar_url || respObj?.url_avatar,
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) =>
      a.nome_completo.localeCompare(b.nome_completo, 'pt-BR')
    );
  }, [membros, cartoes, idsResponsaveisComTarefas]);

  const membroAtivo =
    responsavelSelecionadoId !== 'all' && responsavelSelecionadoId !== 'unassigned'
      ? responsaveisAtivos.find((m) => m.id === responsavelSelecionadoId) ||
        membros.find((m) => String(m.id) === String(responsavelSelecionadoId))
      : null;

  const obterTextoExibicao = () => {
    if (responsavelSelecionadoId === 'all') return 'Responsável';
    if (responsavelSelecionadoId === 'unassigned') return 'Sem responsável';
    return membroAtivo
      ? (membroAtivo.nome_completo || membroAtivo.full_name || 'Responsável')
      : 'Responsável';
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

              {temNaoAtribuido && (
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
              )}
            </CommandGroup>

            {responsaveisAtivos.length > 0 && <CommandSeparator />}

            {responsaveisAtivos.length > 0 && (
              <CommandGroup heading="Responsáveis">
                {responsaveisAtivos.map((m) => {
                  const estaSelecionado = responsavelSelecionadoId === m.id;
                  const nomeExibicao = m.nome_completo;
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
                        {m.url_avatar && <AvatarImage src={m.url_avatar} alt={nomeExibicao} />}
                        <AvatarFallback className="text-[9px]">{m.iniciais}</AvatarFallback>
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
