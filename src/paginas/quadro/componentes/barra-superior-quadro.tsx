import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  IconLayoutKanban,
  IconSettings2,
  IconLogout,
  IconPlus,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { Button } from '@/componentes/base/botao';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/componentes/ui/menu-suspenso';
import { useDataProvider } from '@/lib/provedor-dados';
import { useAuth } from '@/lib/autenticacao/provedor-autenticacao';
import { cn } from '@/lib/utilitarios';
import { DialogoNovaDemanda } from './dialogo-nova-demanda';
import type { Tema } from '@/dados/dados-iniciais';
import './barra-superior-quadro.css';

const itensNavegacao = [
  { icon: IconLayoutKanban, label: 'Quadro', path: '/board' },
];
export const navItems = itensNavegacao;

export function BarraSuperiorQuadro() {
  const localizacao = useLocation();
  const navegar = useNavigate();
  const { signOut } = useAuth();
  const clienteConsulta = useQueryClient();
  const { useCurrentUser, useUpdateTheme } = useDataProvider();
  const { data: usuarioAtual } = useCurrentUser();
  const { mutate: updateTheme } = useUpdateTheme();

  const [novaDemandaAberta, setNovaDemandaAberta] = useState(false);
  const linkConfiguracoes = '/settings';

  const temaAtual: Tema = usuarioAtual?.theme ?? 'system';

  const lidarComDesconectar = async () => {
    await signOut();
    clienteConsulta.clear();
    window.location.href = '/auth';
  };

  const lidarComMudancaTema = (t: Tema) => {
    updateTheme(t);
  };

  return (
    <>
      <header className="sgdi-barra-superior-header">
        {/* Navegação Principal */}
        <nav className="sgdi-barra-superior-nav">
          {itensNavegacao.map((item) => {
            const href = item.path;
            const estaAtivo = localizacao.pathname === href;
            return (
              <Link key={item.path} to={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={item.label}
                  className={cn(
                    'sgdi-nav-item-btn',
                    estaAtivo && 'ativo'
                  )}
                >
                  <item.icon className="size-4 text-primary" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Ações da Direita */}
        <div className="sgdi-barra-superior-acoes">
          {/* Botão de Criação Rápida de Demanda */}
          <Button
            size="sm"
            onClick={() => setNovaDemandaAberta(true)}
            className="sgdi-btn-nova-demanda"
          >
            <IconPlus className="size-4" />
            <span className="hidden sm:inline">Nova Demanda</span>
          </Button>

          {/* Alternador Rápido de Tema */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="sgdi-btn-tema-trigger"
                title="Alterar tema de aparência"
              >
                {temaAtual === 'dark' ? (
                  <IconMoon className="size-4 text-sky-400" />
                ) : temaAtual === 'light' ? (
                  <IconSun className="size-4 text-amber-500" />
                ) : (
                  <IconDeviceDesktop className="size-4 text-muted-foreground" />
                )}
                <span className="sr-only">Alternar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => lidarComMudancaTema('light')}
                className={cn('gap-2 font-medium', temaAtual === 'light' && 'text-primary font-semibold')}
              >
                <IconSun className="size-4 text-amber-500" />
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => lidarComMudancaTema('dark')}
                className={cn('gap-2 font-medium', temaAtual === 'dark' && 'text-sky-400 font-semibold')}
              >
                <IconMoon className="size-4 text-sky-400" />
                Escuro
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => lidarComMudancaTema('system')}
                className={cn('gap-2 font-medium', temaAtual === 'system' && 'text-primary font-semibold')}
              >
                <IconDeviceDesktop className="size-4 text-muted-foreground" />
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu do Usuário */}
          {usuarioAtual && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu da conta"
                  className="sgdi-avatar-trigger"
                >
                  <Avatar className="sgdi-avatar-usuario">
                    {usuarioAtual.avatar_url && (
                      <AvatarImage src={usuarioAtual.avatar_url} alt={usuarioAtual.full_name} />
                    )}
                    <AvatarFallback className="sgdi-avatar-fallback-custom">
                      {usuarioAtual.initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {usuarioAtual.full_name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {usuarioAtual.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navegar(linkConfiguracoes)} className="font-medium">
                  <IconSettings2 className="size-4 text-primary" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={lidarComDesconectar}
                  className="font-medium text-destructive focus:text-destructive"
                >
                  <IconLogout className="size-4 text-destructive" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Modal de Criação de Nova Demanda */}
      <DialogoNovaDemanda
        open={novaDemandaAberta}
        onOpenChange={setNovaDemandaAberta}
      />
    </>
  );
}

export const BoardTopBar = BarraSuperiorQuadro;
