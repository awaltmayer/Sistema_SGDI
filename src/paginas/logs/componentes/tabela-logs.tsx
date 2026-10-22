import { useState, useMemo } from 'react';
import {
  IconPlus,
  IconEdit,
  IconArrowsExchange,
  IconCheck,
  IconClock,
  IconTrash,
  IconSettings,
  IconLogin,
  IconEye,
  IconChevronLeft,
  IconChevronRight,
  IconFileSearch,
} from '@tabler/icons-react';
import type { LogAuditoria, TipoAcaoAuditoria } from '@/tipos/auditoria';
import { Avatar, AvatarFallback } from '@/componentes/ui/avatar';
import { Button } from '@/componentes/base/botao';

interface PropsTabelaLogs {
  logs: LogAuditoria[];
  aoSelecionarLog: (log: LogAuditoria) => void;
  aoLimparFiltros?: () => void;
}

const ITENS_POR_PAGINA = 20;

function BadgeAcao({ acao }: { acao: TipoAcaoAuditoria }) {
  switch (acao) {
    case 'CRIACAO':
      return (
        <span className="sgdi-badge-acao sgdi-badge-criacao">
          <IconPlus className="size-3" />
          Criação
        </span>
      );
    case 'ATUALIZACAO':
      return (
        <span className="sgdi-badge-acao sgdi-badge-atualizacao">
          <IconEdit className="size-3" />
          Atualização
        </span>
      );
    case 'MOVIMENTACAO':
      return (
        <span className="sgdi-badge-acao sgdi-badge-movimentacao">
          <IconArrowsExchange className="size-3" />
          Movimentação
        </span>
      );
    case 'STATUS':
      return (
        <span className="sgdi-badge-acao sgdi-badge-status">
          <IconCheck className="size-3" />
          Status
        </span>
      );
    case 'CRONOMETRO':
      return (
        <span className="sgdi-badge-acao sgdi-badge-cronometro">
          <IconClock className="size-3" />
          Cronômetro
        </span>
      );
    case 'EXCLUSAO':
      return (
        <span className="sgdi-badge-acao sgdi-badge-exclusao">
          <IconTrash className="size-3" />
          Exclusão
        </span>
      );
    case 'CONFIGURACAO':
      return (
        <span className="sgdi-badge-acao sgdi-badge-configuracao">
          <IconSettings className="size-3" />
          Configuração
        </span>
      );
    case 'ACESSO':
      return (
        <span className="sgdi-badge-acao sgdi-badge-acesso">
          <IconLogin className="size-3" />
          Acesso
        </span>
      );
    default:
      return (
        <span className="sgdi-badge-acao sgdi-badge-configuracao">
          {acao}
        </span>
      );
  }
}

function formatarDataHora(isoStr: string): string {
  try {
    const data = new Date(isoStr);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export function TabelaLogs({
  logs,
  aoSelecionarLog,
  aoLimparFiltros,
}: PropsTabelaLogs) {
  const [paginaAtual, setPaginaAtual] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(logs.length / ITENS_POR_PAGINA));

  // Ajusta a página caso a filtragem reduza a lista
  const paginaAjustada = Math.min(paginaAtual, totalPaginas);

  const logsPaginados = useMemo(() => {
    const inicio = (paginaAjustada - 1) * ITENS_POR_PAGINA;
    return logs.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [logs, paginaAjustada]);

  if (logs.length === 0) {
    return (
      <div className="sgdi-logs-tabela-card">
        <div className="sgdi-logs-vazio">
          <IconFileSearch className="size-8 sgdi-logs-vazio-icone" />
          <p className="text-sm font-medium text-foreground">
            Nenhum evento localizado
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Não há registros correspondentes aos filtros selecionados.
          </p>
          {aoLimparFiltros && (
            <Button
              variant="outline"
              size="sm"
              onClick={aoLimparFiltros}
              className="mt-4 text-xs h-8"
            >
              Redefinir Filtros
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sgdi-logs-tabela-card">
      <div className="sgdi-logs-tabela-scroll">
        <table className="sgdi-logs-tabela">
          <thead>
            <tr>
              <th style={{ width: '170px' }}>Data e Hora</th>
              <th style={{ width: '220px' }}>Usuário</th>
              <th style={{ width: '130px' }}>Ação</th>
              <th style={{ width: '180px' }}>Entidade</th>
              <th>Detalhes</th>
              <th style={{ width: '60px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {logsPaginados.map((log) => {
              const iniciais = (log.usuario_nome || 'U')
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')
                .toUpperCase();

              return (
                <tr
                  key={log.id}
                  className="cursor-pointer"
                  onClick={() => aoSelecionarLog(log)}
                >
                  {/* Data e Hora */}
                  <td className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                    {formatarDataHora(log.criado_em)}
                  </td>

                  {/* Usuário */}
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 text-[10px]">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {iniciais}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight truncate max-w-[170px]">
                        <span className="font-medium text-foreground block truncate">
                          {log.usuario_nome}
                        </span>
                        {log.usuario_email && (
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {log.usuario_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Ação */}
                  <td>
                    <BadgeAcao acao={log.acao} />
                  </td>

                  {/* Entidade / Referência */}
                  <td>
                    <div className="leading-tight truncate max-w-[200px]">
                      <span className="font-medium text-foreground block truncate">
                        {log.entidade}
                        {log.entidade_id ? ` #${log.entidade_id}` : ''}
                      </span>
                      {log.entidade_titulo && (
                        <span className="text-[11px] text-muted-foreground block truncate" title={log.entidade_titulo}>
                          {log.entidade_titulo}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Detalhes */}
                  <td className="text-muted-foreground">
                    <span className="line-clamp-1" title={log.detalhes}>
                      {log.detalhes}
                    </span>
                  </td>

                  {/* Botão de Inspeção */}
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        aoSelecionarLog(log);
                      }}
                      className="size-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Ver metadados do evento"
                    >
                      <IconEye className="size-3.5" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação Minimalista */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-foreground bg-muted/20">
        <div>
          Exibindo{' '}
          <span className="font-medium text-foreground">
            {(paginaAjustada - 1) * ITENS_POR_PAGINA + 1}
          </span>{' '}
          a{' '}
          <span className="font-medium text-foreground">
            {Math.min(paginaAjustada * ITENS_POR_PAGINA, logs.length)}
          </span>{' '}
          de <span className="font-medium text-foreground">{logs.length}</span>{' '}
          registros
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAjustada <= 1}
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              className="size-7 p-0"
              title="Página anterior"
            >
              <IconChevronLeft className="size-3.5" />
            </Button>
            <span className="px-2 text-xs">
              {paginaAjustada} / {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAjustada >= totalPaginas}
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              className="size-7 p-0"
              title="Próxima página"
            >
              <IconChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
