import {
  IconSearch,
  IconX,
  IconFilter,
  IconRotateClockwise,
} from '@tabler/icons-react';
import type { FiltrosLogs } from '@/tipos/auditoria';
import { Input } from '@/componentes/ui/campo-texto';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import { Button } from '@/componentes/base/botao';

interface PropsFiltrosLogs {
  filtros: FiltrosLogs;
  aoMudarFiltros: (novos: FiltrosLogs) => void;
  aoLimparFiltros: () => void;
  temFiltrosAtivos: boolean;
}

export function FiltrosLogs({
  filtros,
  aoMudarFiltros,
  aoLimparFiltros,
  temFiltrosAtivos,
}: PropsFiltrosLogs) {
  return (
    <div className="sgdi-logs-filtros-card">
      {/* Campo de Busca Rápida */}
      <div className="sgdi-logs-busca-wrapper">
        <IconSearch className="size-4 sgdi-logs-busca-icone" />
        <Input
          type="text"
          placeholder="Filtrar por detalhe, título, usuário ou ID..."
          value={filtros.termoBusca || ''}
          onChange={(e) =>
            aoMudarFiltros({ ...filtros, termoBusca: e.target.value })
          }
          className="sgdi-logs-busca-input"
        />
        {filtros.termoBusca && (
          <button
            type="button"
            onClick={() => aoMudarFiltros({ ...filtros, termoBusca: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            title="Limpar busca"
          >
            <IconX className="size-3.5" />
          </button>
        )}
      </div>

      {/* Controles de Seleção */}
      <div className="sgdi-logs-filtros-controles">
        {/* Filtro por Tipo de Ação */}
        <div className="w-[145px]">
          <Select
            value={filtros.acao || 'todas'}
            onValueChange={(val) =>
              aoMudarFiltros({
                ...filtros,
                acao: val === 'todas' ? undefined : val,
              })
            }
          >
            <SelectTrigger size="sm" className="h-9 text-xs">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as ações</SelectItem>
              <SelectItem value="CRIACAO">Criação</SelectItem>
              <SelectItem value="ATUALIZACAO">Atualização</SelectItem>
              <SelectItem value="MOVIMENTACAO">Movimentação</SelectItem>
              <SelectItem value="STATUS">Mudança de Status</SelectItem>
              <SelectItem value="CRONOMETRO">Cronômetro</SelectItem>
              <SelectItem value="EXCLUSAO">Exclusão</SelectItem>
              <SelectItem value="CONFIGURACAO">Configuração</SelectItem>
              <SelectItem value="ACESSO">Acesso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Entidade */}
        <div className="w-[135px]">
          <Select
            value={filtros.entidade || 'todas'}
            onValueChange={(val) =>
              aoMudarFiltros({
                ...filtros,
                entidade: val === 'todas' ? undefined : val,
              })
            }
          >
            <SelectTrigger size="sm" className="h-9 text-xs">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas entidades</SelectItem>
              <SelectItem value="Demanda">Demanda</SelectItem>
              <SelectItem value="Checklist">Checklist</SelectItem>
              <SelectItem value="Comentário">Comentário</SelectItem>
              <SelectItem value="Cronômetro">Cronômetro</SelectItem>
              <SelectItem value="Sistema">Sistema</SelectItem>
              <SelectItem value="Perfil">Perfil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Período */}
        <div className="w-[135px]">
          <Select
            value={filtros.periodo || 'todos'}
            onValueChange={(val) =>
              aoMudarFiltros({
                ...filtros,
                periodo: val as any,
              })
            }
          >
            <SelectTrigger size="sm" className="h-9 text-xs">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Qualquer data</SelectItem>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botão de Redefinir Filtros */}
        {temFiltrosAtivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={aoLimparFiltros}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            title="Redefinir todos os filtros"
          >
            <IconRotateClockwise className="size-3.5 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
