import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/componentes/ui/dialogo';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/componentes/ui/tabela';
import { Button } from '@/componentes/base/botao';
import { Badge } from '@/componentes/base/distintivo';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { Input } from '@/componentes/ui/campo-texto';
import { Progress } from '@/componentes/ui/barra-progresso';
import {
  IconDownload,
  IconSearch,
  IconFilter,
  IconUserCheck,
  IconListCheck,
  IconClock,
  IconCheck,
  IconUsers,
} from '@tabler/icons-react';
import type { CardWithAssignee } from '@/lib/provedor-dados';
import type { MembroEquipe } from '@/dados/dados-iniciais';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import './dialogo-relatorio-demandas.css';

export interface PropsDialogoRelatorioDemandas {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartoes: CardWithAssignee[];
  membros: MembroEquipe[];
  aoFiltrarPorSolicitante: (idSolicitante: string) => void;
}

interface EstatisticasSolicitante {
  id: string;
  nome: string;
  email: string;
  iniciais: string;
  url_avatar: string | null;
  total: number;
  abertas: number;
  concluidas: number;
  taxaConclusao: number;
}

export function DialogoRelatorioDemandas({
  open,
  onOpenChange,
  cartoes,
  membros,
  aoFiltrarPorSolicitante,
}: PropsDialogoRelatorioDemandas) {
  const [buscaSolicitante, setBuscaSolicitante] = useState('');

  // Agrupar e consolidar estatísticas por solicitante
  const estatisticas = useMemo(() => {
    const mapa = new Map<string, EstatisticasSolicitante>();

    // Inicializa membros da equipe no mapa
    for (const m of membros) {
      const idChave = m.id_usuario_membro || m.id;
      mapa.set(idChave, {
        id: idChave,
        nome: m.full_name || m.nome_completo || 'Sem Nome',
        email: m.email || '',
        iniciais: m.initials || m.iniciais || '?',
        url_avatar: m.avatar_url || m.url_avatar || null,
        total: 0,
        abertas: 0,
        concluidas: 0,
        taxaConclusao: 0,
      });
    }

    // Processa os cartões e atribui aos solicitantes
    for (const c of cartoes) {
      const idSol = c.id_solicitante || c.solicitante_id || c.id_usuario || 'desconhecido';
      const solObj = c.solicitante;

      let est = mapa.get(idSol);
      if (!est) {
        // Solicitante não estava na lista de membros, cria registro com os dados do cartão
        const nome = solObj?.nome_completo || solObj?.full_name || `Usuário (${idSol.slice(0, 8)})`;
        const email = solObj?.email || '';
        const iniciais = solObj?.iniciais || solObj?.initials || nome.slice(0, 2).toUpperCase();
        const avatar = solObj?.url_avatar || solObj?.avatar_url || null;

        est = {
          id: idSol,
          nome,
          email,
          iniciais,
          url_avatar: avatar,
          total: 0,
          abertas: 0,
          concluidas: 0,
          taxaConclusao: 0,
        };
        mapa.set(idSol, est);
      }

      est.total += 1;
      if (c.column === 'done') {
        est.concluidas += 1;
      } else {
        est.abertas += 1;
      }
    }

    // Calcula porcentagens de conclusão e ordena por demandas abertas desc
    const lista = Array.from(mapa.values())
      .filter((item) => item.total > 0 || item.email.length > 0)
      .map((item) => ({
        ...item,
        taxaConclusao: item.total > 0 ? Math.round((item.concluidas / item.total) * 100) : 0,
      }))
      .sort((a, b) => b.abertas - a.abertas || b.total - a.total);

    return lista;
  }, [cartoes, membros]);

  // Filtragem por busca
  const estatisticasFiltradas = useMemo(() => {
    const termo = buscaSolicitante.trim().toLowerCase();
    if (!termo) return estatisticas;
    return estatisticas.filter(
      (e) =>
        e.nome.toLowerCase().includes(termo) ||
        e.email.toLowerCase().includes(termo) ||
        e.id.toLowerCase().includes(termo)
    );
  }, [estatisticas, buscaSolicitante]);

  // KPIs Totais
  const kpis = useMemo(() => {
    const total = cartoes.length;
    const concluidas = cartoes.filter((c) => c.column === 'done').length;
    const abertas = total - concluidas;
    const solicitantesAtivos = new Set(
      cartoes.map((c) => c.id_solicitante || c.solicitante_id || c.id_usuario).filter(Boolean)
    ).size;
    const taxaGeral = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { total, abertas, concluidas, solicitantesAtivos, taxaGeral };
  }, [cartoes]);

  // Exportação em formato CSV
  const exportarCSV = () => {
    try {
      const colunasCSV = [
        'ID da Demanda',
        'Título',
        'Status (Coluna)',
        'Prioridade',
        'ID Solicitante',
        'Nome Solicitante',
        'Email Solicitante',
        'ID Responsável',
        'Nome Responsável',
        'Data de Vencimento',
        'Data de Criação',
      ];

      const linhas = cartoes.map((c) => {
        const idDemanda = `"${c.id}"`;
        const titulo = `"${(c.title || c.titulo || '').replace(/"/g, '""')}"`;
        const status = `"${c.column === 'done' ? 'Concluído' : c.column === 'in-progress' ? 'Em Andamento' : 'A Fazer'}"`;
        const prioridade = `"${c.priority === 'high' ? 'Alta' : c.priority === 'medium' ? 'Média' : 'Baixa'}"`;
        const idSol = `"${c.id_solicitante || c.solicitante_id || c.id_usuario || ''}"`;
        const nomeSol = `"${(c.solicitante?.nome_completo || c.solicitante?.full_name || '').replace(/"/g, '""')}"`;
        const emailSol = `"${(c.solicitante?.email || '').replace(/"/g, '""')}"`;
        const idResp = `"${c.id_responsavel || c.assignee_id || ''}"`;
        const nomeResp = `"${(c.responsavel?.nome_completo || c.assignee?.full_name || '').replace(/"/g, '""')}"`;

        let vencimento = '';
        if (c.due_date) {
          try {
            vencimento = format(parseISO(c.due_date), 'dd/MM/yyyy');
          } catch {
            vencimento = c.due_date;
          }
        }
        const dataVenc = `"${vencimento}"`;

        let criacao = '';
        if (c.created_at || c.criado_em) {
          try {
            criacao = format(parseISO(c.created_at || c.criado_em), 'dd/MM/yyyy HH:mm');
          } catch {
            criacao = c.created_at || c.criado_em;
          }
        }
        const dataCriacao = `"${criacao}"`;

        return [
          idDemanda,
          titulo,
          status,
          prioridade,
          idSol,
          nomeSol,
          emailSol,
          idResp,
          nomeResp,
          dataVenc,
          dataCriacao,
        ].join(';');
      });

      const conteudoCSV = '\uFEFF' + [colunasCSV.join(';'), ...linhas].join('\r\n');
      const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dataAtual = format(new Date(), 'yyyy-MM-dd_HHmm');
      link.href = url;
      link.download = `relatorio-demandas-por-solicitante-${dataAtual}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Relatório CSV exportado com sucesso!');
    } catch {
      toast.error('Falha ao exportar relatório CSV');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <IconUserCheck className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Painel de Rastreabilidade e Relatórios por Solicitante
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Acompanhe o total de demandas ativas e concluídas vinculadas a cada usuário.
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportarCSV}
              className="gap-1.5 text-xs font-medium"
            >
              <IconDownload className="size-3.5" />
              Exportar CSV
            </Button>
          </div>
        </DialogHeader>

        {/* KPIs Resumidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
          <div className="sgdi-kpi-card">
            <div className="sgdi-kpi-icon-wrapper text-primary bg-primary/10">
              <IconListCheck className="size-4" />
            </div>
            <div>
              <span className="sgdi-kpi-valor">{kpis.total}</span>
              <span className="sgdi-kpi-rotulo">Total de Demandas</span>
            </div>
          </div>

          <div className="sgdi-kpi-card">
            <div className="sgdi-kpi-icon-wrapper text-amber-500 bg-amber-500/10">
              <IconClock className="size-4" />
            </div>
            <div>
              <span className="sgdi-kpi-valor text-amber-600 dark:text-amber-400">
                {kpis.abertas}
              </span>
              <span className="sgdi-kpi-rotulo">Demandas Abertas</span>
            </div>
          </div>

          <div className="sgdi-kpi-card">
            <div className="sgdi-kpi-icon-wrapper text-emerald-500 bg-emerald-500/10">
              <IconCheck className="size-4" />
            </div>
            <div>
              <span className="sgdi-kpi-valor text-emerald-600 dark:text-emerald-400">
                {kpis.concluidas}
              </span>
              <span className="sgdi-kpi-rotulo">Demandas Concluídas</span>
            </div>
          </div>

          <div className="sgdi-kpi-card">
            <div className="sgdi-kpi-icon-wrapper text-indigo-500 bg-indigo-500/10">
              <IconUsers className="size-4" />
            </div>
            <div>
              <span className="sgdi-kpi-valor text-indigo-600 dark:text-indigo-400">
                {kpis.solicitantesAtivos}
              </span>
              <span className="sgdi-kpi-rotulo">Solicitantes Ativos</span>
            </div>
          </div>
        </div>

        {/* Barra de Busca de Solicitante */}
        <div className="relative my-2">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, e-mail ou ID do solicitante..."
            value={buscaSolicitante}
            onChange={(e) => setBuscaSolicitante(e.target.value)}
            className="pl-9 h-8 text-xs"
          />
        </div>

        {/* Tabela de Solicitantes */}
        <div className="flex-1 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="text-xs font-semibold">Solicitante</TableHead>
                <TableHead className="text-xs font-semibold text-center w-24">Abertas</TableHead>
                <TableHead className="text-xs font-semibold text-center w-24">Concluídas</TableHead>
                <TableHead className="text-xs font-semibold text-center w-24">Total</TableHead>
                <TableHead className="text-xs font-semibold w-36">Conclusão (%)</TableHead>
                <TableHead className="text-xs font-semibold text-right w-28">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estatisticasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    Nenhum solicitante encontrado para os critérios informados.
                  </TableCell>
                </TableRow>
              ) : (
                estatisticasFiltradas.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          {item.url_avatar && <AvatarImage src={item.url_avatar} />}
                          <AvatarFallback className="text-[10px]">{item.iniciais}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-xs text-foreground truncate">
                            {item.nome}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {item.email || `ID: ${item.id.slice(0, 8)}...`}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        color={item.abertas > 0 ? 'amber' : 'gray'}
                        className="tabular-nums font-semibold text-xs px-2 py-0.5"
                      >
                        {item.abertas}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        color={item.concluidas > 0 ? 'green' : 'gray'}
                        className="tabular-nums font-semibold text-xs px-2 py-0.5"
                      >
                        {item.concluidas}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="text-xs font-bold tabular-nums text-foreground">
                        {item.total}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
                          <span>{item.taxaConclusao}%</span>
                        </div>
                        <Progress value={item.taxaConclusao} className="h-1.5" />
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          aoFiltrarPorSolicitante(item.id);
                          onOpenChange(false);
                        }}
                        className="h-7 text-xs gap-1 hover:text-primary"
                        title="Filtrar demandas deste solicitante no quadro"
                      >
                        <IconFilter className="size-3" />
                        <span>Filtrar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
