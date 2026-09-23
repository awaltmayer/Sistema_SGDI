import { useState, useMemo } from 'react';
import { IconUserCheck, IconChevronDown, IconCheck, IconUsers } from '@tabler/icons-react';
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

export interface SolicitanteOpcao {
  id: string;
  nome_completo: string;
  iniciais: string;
  email?: string;
  url_avatar?: string | null;
}

export interface PropsSeletorSolicitante {
  solicitanteSelecionadoId?: string;
  aoMudarSolicitante?: (id: string) => void;
  className?: string;
}

export function SeletorSolicitante({
  solicitanteSelecionadoId = 'all',
  aoMudarSolicitante,
  className,
}: PropsSeletorSolicitante) {
  const [aberto, setAberto] = useState(false);
  const { useProfiles, useTeamMembers, useCurrentUser, useCards } = useDataProvider();

  const { data: perfis = [] } = useProfiles();
  const { data: membros = [] } = useTeamMembers();
  const { data: usuarioAtual } = useCurrentUser();
  const { data: cartoes = [] } = useCards();

  const solicitantes = useMemo(() => {
    const mapa = new Map<string, SolicitanteOpcao>();

    // 1. Adiciona perfis de banco
    for (const p of perfis) {
      if (p.id) {
        mapa.set(p.id, {
          id: p.id,
          nome_completo: p.nome_completo || p.email || 'Usuário',
          iniciais: p.iniciais || p.nome_completo?.slice(0, 2).toUpperCase() || 'U',
          email: p.email,
          url_avatar: p.url_avatar,
        });
      }
    }

    // 2. Adiciona usuário logado atual se não estiver presente
    if (usuarioAtual?.id && !mapa.has(usuarioAtual.id)) {
      mapa.set(usuarioAtual.id, {
        id: usuarioAtual.id,
        nome_completo: usuarioAtual.nome_completo || usuarioAtual.email || 'Você',
        iniciais: usuarioAtual.iniciais || 'EU',
        email: usuarioAtual.email,
        url_avatar: usuarioAtual.url_avatar,
      });
    }

    // 3. Adiciona membros da equipe por id_usuario_membro ou id
    for (const m of membros) {
      const idChave = m.id_usuario_membro || m.id;
      if (idChave && !mapa.has(idChave)) {
        mapa.set(idChave, {
          id: idChave,
          nome_completo: m.nome_completo || m.email || 'Membro',
          iniciais: m.iniciais || m.nome_completo?.slice(0, 2).toUpperCase() || 'MB',
          email: m.email,
          url_avatar: m.url_avatar,
        });
      }
    }

    // 4. Mapeia IDs de criadores existentes nos cartões
    for (const c of cartoes) {
      const idCriador = c.id_usuario || c.user_id;
      if (idCriador && !mapa.has(idCriador)) {
        // Tenta encontrar nome por correspondência de membro
        const membroRelacionado = membros.find(
          (m) => m.id === idCriador || m.id_usuario === idCriador || m.id_usuario_membro === idCriador
        );

        mapa.set(idCriador, {
          id: idCriador,
          nome_completo: membroRelacionado?.nome_completo || `Usuário (${idCriador.slice(0, 6)})`,
          iniciais: membroRelacionado?.iniciais || 'US',
          email: membroRelacionado?.email,
          url_avatar: membroRelacionado?.url_avatar,
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) =>
      a.nome_completo.localeCompare(b.nome_completo, 'pt-BR')
    );
  }, [perfis, usuarioAtual, membros, cartoes]);

  const solicitanteAtivo =
    solicitanteSelecionadoId !== 'all'
      ? solicitantes.find((s) => s.id === solicitanteSelecionadoId)
      : null;

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filtrar por solicitante"
          className={cn(
            'inline-flex h-8 w-[140px] items-center justify-between gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-normal shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            className
          )}
        >
          <div className="flex items-center gap-1.5 truncate">
            <IconUserCheck className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {solicitanteAtivo ? solicitanteAtivo.nome_completo : 'Solicitante'}
            </span>
          </div>
          <IconChevronDown className="size-3 shrink-0 text-muted-foreground opacity-60" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar solicitante por nome..." className="h-8 text-xs" />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
              Nenhum solicitante encontrado.
            </CommandEmpty>

            <CommandGroup>
              <CommandItem
                value="all todos todos os solicitantes qualquer"
                onSelect={() => {
                  aoMudarSolicitante?.('all');
                  setAberto(false);
                }}
                className="gap-2 text-xs cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <IconUsers className="size-3" />
                </div>
                <span>Todos os Solicitantes</span>
                {solicitanteSelecionadoId === 'all' && (
                  <IconCheck className="ml-auto size-3.5 text-primary" />
                )}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Solicitantes">
              {solicitantes.map((s) => {
                const estaSelecionado = solicitanteSelecionadoId === s.id;
                return (
                  <CommandItem
                    key={s.id}
                    value={`${s.nome_completo} ${s.email ?? ''}`}
                    onSelect={() => {
                      aoMudarSolicitante?.(s.id);
                      setAberto(false);
                    }}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <Avatar className="size-5 shrink-0">
                      {s.url_avatar && <AvatarImage src={s.url_avatar} alt={s.nome_completo} />}
                      <AvatarFallback className="text-[9px]">{s.iniciais}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate font-medium">{s.nome_completo}</span>
                      {s.email && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {s.email}
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
