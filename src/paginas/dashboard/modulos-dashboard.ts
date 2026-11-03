// Seções do dashboard que podem ser exibidas/ocultadas pela aba lateral

export interface ModulosVisiveisDashboard {
  // Visão geral
  indicadores: boolean;
  situacao: boolean;
  sla: boolean;
  responsaveis: boolean;
  tempoMedio: boolean;
  criticas: boolean;
  // Tendências
  fluxoSemanal: boolean;
  backlog: boolean;
  slaSemanal: boolean;
  idadeAbertas: boolean;
}

export const MODULOS_PADRAO: ModulosVisiveisDashboard = {
  indicadores: true,
  situacao: true,
  sla: true,
  responsaveis: true,
  tempoMedio: true,
  criticas: true,
  fluxoSemanal: true,
  backlog: true,
  slaSemanal: true,
  idadeAbertas: true,
};

export const GRUPOS_MODULOS: Array<{
  titulo: string;
  itens: Array<{ chave: keyof ModulosVisiveisDashboard; label: string }>;
}> = [
  {
    titulo: 'Visão geral',
    itens: [
      { chave: 'indicadores', label: 'Indicadores' },
      { chave: 'situacao', label: 'Situação' },
      { chave: 'sla', label: 'SLA' },
      { chave: 'responsaveis', label: 'Por responsável' },
      { chave: 'tempoMedio', label: 'Tempo médio' },
      { chave: 'criticas', label: 'Críticas' },
    ],
  },
  {
    titulo: 'Tendências',
    itens: [
      { chave: 'fluxoSemanal', label: 'Criadas × concluídas' },
      { chave: 'backlog', label: 'Backlog' },
      { chave: 'slaSemanal', label: 'SLA por semana' },
      { chave: 'idadeAbertas', label: 'Idade das abertas' },
    ],
  },
];
