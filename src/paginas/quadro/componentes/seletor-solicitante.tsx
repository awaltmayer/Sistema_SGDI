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
  totalDemandas?: number;
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
    // 1. Identifica IDs de solicitantes e conta quantidade de demandas
    const contagemPorCriador = new Map<string, number>();
    for (const c of cartoes) {
      const idCriador = c.id_usuario ?? c.user_id;
      if (idCriador) {
        const sId = String(idCriador);
        contagemPorCriador.set(sId, (contagemPorCriador.get(sId) ?? 0) + 1);
      }
    }

    if (contagemPorCriador.size === 0) {
      return [];
    }

    const mapa = new Map<string, SolicitanteOpcao>();

    // 2. Preenche os dados dos solicitantes que possuem cartões
    for (const idCriador of contagemPorCriador.keys()) {
      const qtdDemandas = contagemPorCriador.get(idCriador) ?? 0;

      // Tenta encontrar em perfis/usuarios
      const perfil = perfis.find((p: any) => String(p.id) === idCriador || (p.id_usuario && String(p.id_usuario) === idCriador));
      if (perfil) {
        mapa.set(idCriador, {
          id: idCriador,
          nome_completo: perfil.nome_completo || perfil.email || 'Usuário',
          iniciais: perfil.iniciais || perfil.nome_completo?.slice(0, 2).toUpperCase() || 'U',
          email: perfil.email,
          url_avatar: perfil.url_avatar,
          totalDemandas: qtdDemandas,
        });
        continue;
      }

      // Tenta verificar se é o usuário atual logado
      if (usuarioAtual?.id && String(usuarioAtual.id) === idCriador) {
        mapa.set(idCriador, {
          id: idCriador,
          nome_completo: usuarioAtual.nome_completo || usuarioAtual.email || 'Você',
          iniciais: usuarioAtual.iniciais || 'EU',
          email: usuarioAtual.email,
          url_avatar: usuarioAtual.url_avatar,
          totalDemandas: qtdDemandas,
        });
        continue;
      }

      // Tenta encontrar em membros/usuários
      const membro = membros.find(
        (m) =>
          String(m.id) === idCriador ||
          (m.id_usuario && String(m.id_usuario) === idCriador) ||
          (m.id_usuario_membro && String(m.id_usuario_membro) === idCriador)
      );
      if (membro) {
        mapa.set(idCriador, {
          id: idCriador,
          nome_completo: membro.nome_completo || membro.email || 'Usuário',
          iniciais: membro.iniciais || membro.nome_completo?.slice(0, 2).toUpperCase() || 'US',
          email: membro.email,
          url_avatar: membro.url_avatar,
          totalDemandas: qtdDemandas,
        });
        continue;
      }

      // Fallback para criador sem perfil carregado
      mapa.set(idCriador, {
        id: idCriador,
        nome_completo: `Usuário (${idCriador.slice(0, 6)})`,
        iniciais: 'US',
        email: undefined,
        url_avatar: null,
        totalDemandas: qtdDemandas,
      });
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
              {solicitanteAtivo ? `${solicitanteAtivo.nome_completo} (${solicitanteAtivo.totalDemandas ?? 0})` : 'Solicitante'}
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

            {solicitantes.length > 0 && <CommandSeparator />}

            {solicitantes.length > 0 && (
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
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-medium">{s.nome_completo}</span>
                          {s.totalDemandas != null && (
                            <span className="text-[10px] text-muted-foreground font-semibold px-1.5 py-0.5 bg-muted rounded-full shrink-0">
                              {s.totalDemandas} {s.totalDemandas === 1 ? 'demanda' : 'demandas'}
                            </span>
                          )}
                        </div>
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
