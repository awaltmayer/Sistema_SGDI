import { describe, it, expect } from 'vitest';
import {
  calcularMetricasDemandas,
  obterDemandasCriticas,
  calcularDemandasPorResponsavel,
  calcularTempoMedioResolucao,
  calcularTempoMedioPorPrioridade,
  calcularMetricasSla,
  aplicarFiltrosDashboard,
  isDemandaCancelada,
  formatarSegundosEmHoras,
  calcularTendenciaSemanal,
  calcularIdadeAbertas,
  CORES_DASHBOARD,
} from './calculos-dashboard';
import type { CartaoComResponsavel, MembroEquipe } from '@/lib/provedor-dados';
import { addDays, format, subDays } from 'date-fns';

describe('Cálculos do Dashboard SGDI', () => {
  const hoje = new Date();
  const hojeStr = format(hoje, 'yyyy-MM-dd');
  const amanhaStr = format(addDays(hoje, 1), 'yyyy-MM-dd');
  const em3DiasStr = format(addDays(hoje, 3), 'yyyy-MM-dd');
  const em10DiasStr = format(addDays(hoje, 10), 'yyyy-MM-dd');
  const ontemStr = format(subDays(hoje, 1), 'yyyy-MM-dd');

  const membro1: MembroEquipe = {
    id: 'm-1',
    nome_completo: 'Carlos Silva',
    iniciais: 'CS',
    email: 'carlos@empresa.com',
    funcao: 'member',
    status: 'active',
  };

  const membro2: MembroEquipe = {
    id: 'm-2',
    nome_completo: 'Mariana Souza',
    iniciais: 'MS',
    email: 'mariana@empresa.com',
    funcao: 'admin',
    status: 'active',
  };

  const cartoesExemplo: CartaoComResponsavel[] = [
    // 1: Aberta a fazer, no prazo (10 dias)
    {
      id: 'c1',
      titulo: 'Criar documentação',
      descricao: '',
      coluna: 'todo',
      prioridade: 'medium',
      data_vencimento: em10DiasStr,
      posicao: 0,
      criado_em: subDays(hoje, 5).toISOString(),
      id_responsavel: 'm-1',
      id_usuario: 'm-2',
    },
    // 2: Aberta em andamento, crítica (vence amanhã)
    {
      id: 'c2',
      titulo: 'Corrigir bug crítico de login',
      descricao: '',
      coluna: 'in-progress',
      prioridade: 'high',
      data_vencimento: amanhaStr,
      posicao: 1,
      criado_em: subDays(hoje, 2).toISOString(),
      id_responsavel: 'm-1',
      id_usuario: 'm-1',
    },
    // 3: Aberta atrasada (venceu ontem)
    {
      id: 'c3',
      titulo: 'Homologar relatório financeiro',
      descricao: '',
      coluna: 'todo',
      prioridade: 'high',
      data_vencimento: ontemStr,
      posicao: 2,
      criado_em: subDays(hoje, 8).toISOString(),
      id_responsavel: 'm-2',
      id_usuario: 'm-1',
    },
    // 4: Concluída (3 dias de calendário, 86400s no cronômetro = 1 dia ativo)
    {
      id: 'c4',
      titulo: 'Implementar Webhook',
      descricao: '',
      coluna: 'done',
      prioridade: 'medium',
      data_vencimento: em3DiasStr,
      posicao: 3,
      criado_em: subDays(hoje, 3).toISOString(),
      id_responsavel: 'm-2',
      id_usuario: 'm-2',
      rastreador_tempo: {
        em_execucao: false,
        tempo_total_segundos: 86400, // 1 dia exato de cronômetro
        concluido_em: hoje.toISOString(),
        pausas: [],
      },
    },
    // 5: Concluída (1 dia de calendário, 43200s no cronômetro = 0.5 dia ativo)
    {
      id: 'c5',
      titulo: 'Ajustar layout mobile',
      descricao: '',
      coluna: 'done',
      prioridade: 'low',
      data_vencimento: null,
      posicao: 4,
      criado_em: subDays(hoje, 1).toISOString(),
      id_responsavel: 'm-1',
      id_usuario: 'm-2',
      rastreador_tempo: {
        em_execucao: false,
        tempo_total_segundos: 43200, // 12 horas = 0.5 dia
        concluido_em: hoje.toISOString(),
        pausas: [],
      },
    },
    // 6: Cancelada (deve ser desconsiderada em métricas e no cálculo de tempo)
    {
      id: 'c6',
      titulo: '[Cancelada] Teste descartado',
      descricao: '',
      coluna: 'done',
      prioridade: 'low',
      data_vencimento: null,
      posicao: 5,
      criado_em: subDays(hoje, 10).toISOString(),
      id_responsavel: null,
    },
    // 7: Aberta sem responsável (fora do SLA)
    {
      id: 'c7',
      titulo: 'Pesquisa de mercado inicial',
      descricao: '',
      coluna: 'todo',
      prioridade: 'low',
      data_vencimento: em10DiasStr,
      posicao: 6,
      criado_em: hoje.toISOString(),
      id_responsavel: null,
      ids_responsaveis: [],
      id_usuario: 'm-1',
    },
  ];

  describe('isDemandaCancelada', () => {
    it('deve identificar demandas canceladas corretamente', () => {
      expect(isDemandaCancelada(cartoesExemplo[5])).toBe(true);
      expect(isDemandaCancelada(cartoesExemplo[0])).toBe(false);
    });
  });

  describe('Regra de Negócio: Atrasados aparecem em vermelho', () => {
    it('deve garantir que a cor configurada para atrasados seja estritamente vermelho (#ef4444)', () => {
      expect(CORES_DASHBOARD.atrasado).toBe('#ef4444');
    });
  });

  describe('Regra de Negócio: Sem responsável fora do SLA', () => {
    it('deve excluir tarefas sem responsável do cálculo de conformidade de SLA e computar separadamente', () => {
      const sla = calcularMetricasSla(cartoesExemplo);

      // c7 não tem responsável => totalSemResponsavelForaDoSla = 1
      expect(sla.totalSemResponsavelForaDoSla).toBe(1);

      // Com responsável e abertas válidas: c1 (no prazo), c2 (no prazo), c3 (atrasada) => total = 3
      expect(sla.totalDemandasComResponsavel).toBe(3);
      expect(sla.noPrazoComResponsavel).toBe(2);
      expect(sla.atrasadasComResponsavel).toBe(1);

      // Taxa: 2 / 3 = 66.7%
      expect(sla.taxaAderenciaSla).toBe(66.7);
    });
  });

  describe('Regra de Negócio: Canceladas fora do tempo médio para concluir uma tarefa', () => {
    it('deve excluir tarefas canceladas do cálculo do tempo médio do cronômetro e do calendário', () => {
      const metricasTempo = calcularTempoMedioResolucao(cartoesExemplo);

      // Concluídas válidas apenas c4 e c5 (c6 cancelada fica fora)
      expect(metricasTempo.totalConcluidas).toBe(2);
      expect(metricasTempo.cronometroMedioDias).toBe(0.75);
    });

    it('deve calcular médias por prioridade excluindo canceladas', () => {
      const porPrioridade = calcularTempoMedioPorPrioridade(cartoesExemplo);
      expect(porPrioridade).toHaveLength(3);

      const media = porPrioridade.find((p) => p.prioridade === 'medium');
      expect(media?.totalConcluidas).toBe(1);
      expect(media?.cronometroMedioDias).toBe(1);
    });
  });

  describe('Filtros do Dashboard', () => {
    it('deve filtrar por prioridade', () => {
      const filtrados = aplicarFiltrosDashboard(
        cartoesExemplo,
        { periodo: 'todos', responsavel: 'todos', prioridade: 'high', status: 'todos' },
        [membro1, membro2]
      );

      expect(filtrados.length).toBe(2); // c2 e c3
      expect(filtrados.every((c) => c.prioridade === 'high')).toBe(true);
    });

    it('deve filtrar por status atrasadas', () => {
      const filtrados = aplicarFiltrosDashboard(
        cartoesExemplo,
        { periodo: 'todos', responsavel: 'todos', prioridade: 'todas', status: 'atrasadas' },
        [membro1, membro2]
      );

      expect(filtrados.length).toBe(1);
      expect(filtrados[0].id).toBe('c3');
    });

    it('deve filtrar por sem-responsavel', () => {
      const filtrados = aplicarFiltrosDashboard(
        cartoesExemplo,
        { periodo: 'todos', responsavel: 'sem-responsavel', prioridade: 'todas', status: 'todos' },
        [membro1, membro2]
      );

      // c6 (cancelada sem resp) e c7 (aberta sem resp)
      expect(filtrados.some((c) => c.id === 'c7')).toBe(true);
      expect(filtrados.every((c) => !c.id_responsavel)).toBe(true);
    });

    it('deve filtrar por responsável específico', () => {
      const filtrados = aplicarFiltrosDashboard(
        cartoesExemplo,
        { periodo: 'todos', responsavel: 'm-1', prioridade: 'todas', status: 'todos' },
        [membro1, membro2]
      );

      expect(filtrados.length).toBe(3); // c1, c2, c5
    });

    it('deve filtrar por período hoje', () => {
      const filtrados = aplicarFiltrosDashboard(
        cartoesExemplo,
        { periodo: 'hoje', responsavel: 'todos', prioridade: 'todas', status: 'todos' },
        [membro1, membro2]
      );

      expect(filtrados.length).toBe(1); // c7
      expect(filtrados[0].id).toBe('c7');
    });
  });

  describe('calcularMetricasDemandas (Pizza e Numéricas)', () => {
    it('deve calcular contagem e percentual corretos para abertas, concluidas e atrasadas', () => {
      const metricas = calcularMetricasDemandas(cartoesExemplo);

      // Total válido = 6 (c1, c2, c3, c4, c5, c7; c6 cancelada não entra)
      expect(metricas.total).toBe(6);
      expect(metricas.concluidas).toBe(2);
      expect(metricas.totalAbertas).toBe(4);
      expect(metricas.atrasadas).toBe(1);
    });
  });

  describe('obterDemandasCriticas', () => {
    it('deve identificar se a demanda crítica está sem responsável (fora do SLA)', () => {
      const criticas = obterDemandasCriticas(cartoesExemplo, [membro1, membro2], null, 3);

      expect(criticas.length).toBe(2); // c3 e c2
      expect(criticas[0].semResponsavelForaDoSla).toBe(false);
    });
  });

  describe('calcularTendenciaSemanal', () => {
    // Quarta-feira, para que as semanas (segunda a domingo) fiquem previsíveis
    const referencia = new Date(2026, 9, 28, 12);
    const rastreador = (concluidoEm: Date) => ({
      em_execucao: false,
      tempo_total_segundos: 3600,
      pausas: [],
      concluido_em: concluidoEm.toISOString(),
    });

    const cartoesTendencia: CartaoComResponsavel[] = [
      // Criada na semana anterior, concluída nesta semana dentro do prazo
      {
        id: 't1', titulo: 'T1', descricao: '', coluna: 'done', prioridade: 'high', posicao: 0,
        criado_em: new Date(2026, 9, 20, 9).toISOString(),
        data_vencimento: '2026-10-30',
        id_responsavel: 'm-1',
        rastreador_tempo: rastreador(new Date(2026, 9, 27, 10)),
      },
      // Criada nesta semana, concluída após o vencimento
      {
        id: 't2', titulo: 'T2', descricao: '', coluna: 'done', prioridade: 'low', posicao: 1,
        criado_em: new Date(2026, 9, 26, 9).toISOString(),
        data_vencimento: '2026-10-26',
        id_responsavel: 'm-1',
        rastreador_tempo: rastreador(new Date(2026, 9, 28, 10)),
      },
      // Aberta, criada na semana anterior
      {
        id: 't3', titulo: 'T3', descricao: '', coluna: 'todo', prioridade: 'medium', posicao: 2,
        criado_em: new Date(2026, 9, 21, 9).toISOString(),
        data_vencimento: null,
        id_responsavel: null,
      },
      // Cancelada: fora de todas as séries
      {
        id: 't4', titulo: '[Cancelada] T4', descricao: '', coluna: 'todo', prioridade: 'medium', posicao: 3,
        criado_em: new Date(2026, 9, 26, 9).toISOString(),
        data_vencimento: null,
        id_responsavel: null,
      },
    ];

    it('deve contar criadas, concluídas, backlog e SLA por semana', () => {
      const semanas = calcularTendenciaSemanal(cartoesTendencia, 2, referencia);

      expect(semanas.map((s) => s.label)).toEqual(['19/10', '26/10']);
      expect(semanas[0]).toMatchObject({ criadas: 2, concluidas: 0, backlog: 2, taxaSla: null });
      expect(semanas[1]).toMatchObject({ criadas: 1, concluidas: 2, backlog: 1, taxaSla: 50 });
    });
  });

  describe('calcularIdadeAbertas', () => {
    it('deve distribuir apenas as abertas pelas faixas de idade', () => {
      const faixas = calcularIdadeAbertas(cartoesExemplo, hoje);
      const totalFaixas = faixas.reduce((acc, f) => acc + f.quantidade, 0);

      expect(faixas.map((f) => f.label)).toEqual(['0–3 d', '4–7 d', '8–14 d', '15+ d']);
      expect(totalFaixas).toBe(calcularMetricasDemandas(cartoesExemplo).totalAbertas);
    });
  });

  describe('formatarSegundosEmHoras', () => {
    it('deve formatar durações corretamente', () => {
      expect(formatarSegundosEmHoras(0)).toBe('0 min');
      expect(formatarSegundosEmHoras(3600)).toBe('1h 0m');
      expect(formatarSegundosEmHoras(90000)).toBe('1d 1h 0m');
    });
  });
});
