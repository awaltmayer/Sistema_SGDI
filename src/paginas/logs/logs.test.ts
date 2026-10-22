// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  carregarLogsStorage,
  salvarLogsStorage,
  registrarLogAuditoria,
  buscarLogsAuditoria,
} from '@/lib/auditoria/servico-auditoria';
import type { LogAuditoria } from '@/tipos/auditoria';
import { navItems } from '@/paginas/quadro/componentes/barra-superior-quadro';

// Garante compatibilidade robusta com mock de localStorage no ambiente de teste
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    length: 0,
  };
}

describe('Módulo de Logs de Auditoria - Sistema SGDI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Navegação Superior - Botão de Logs ao lado de Dashboard', () => {
    it('deve incluir o botão Logs na barra de navegação superior logo após o Dashboard', () => {
      expect(navItems).toBeDefined();
      expect(navItems.length).toBeGreaterThanOrEqual(3);

      const dashboardIndex = navItems.findIndex((item) => item.path === '/dashboard');
      const logsIndex = navItems.findIndex((item) => item.path === '/logs');

      expect(dashboardIndex).toBeGreaterThanOrEqual(0);
      expect(logsIndex).toBeGreaterThanOrEqual(0);

      // O botão Logs deve estar exatamente ao lado do Dashboard
      expect(logsIndex).toBe(dashboardIndex + 1);

      const logsItem = navItems[logsIndex];
      expect(logsItem.label).toBe('Logs');
      expect(logsItem.path).toBe('/logs');
      expect(logsItem.icon).toBeDefined();
    });
  });

  describe('Serviço de Registro e Histórico de Logs', () => {
    it('deve carregar a base histórica inicial quando o storage estiver vazio', () => {
      const logs = carregarLogsStorage();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some((l) => l.acao === 'CRIACAO')).toBe(true);
      expect(logs.some((l) => l.acao === 'MOVIMENTACAO')).toBe(true);
    });

    it('deve registrar um novo evento de auditoria e persistir no storage', async () => {
      const novoLog = await registrarLogAuditoria({
        acao: 'CRIACAO',
        entidade: 'Demanda',
        entidade_id: '99',
        entidade_titulo: 'Auditoria de Sistema SGDI',
        detalhes: 'Demanda criada na coluna A Fazer',
        metadados: { prioridade: 'high', coluna: 'todo' },
        usuario: {
          id: 'user-teste-1',
          nome: 'Auditor Fiscal',
          email: 'auditor@sgdi.gov.br',
        },
      });

      expect(novoLog).toBeDefined();
      expect(novoLog.id).toBeDefined();
      expect(novoLog.usuario_nome).toBe('Auditor Fiscal');
      expect(novoLog.acao).toBe('CRIACAO');
      expect(novoLog.entidade).toBe('Demanda');
      expect(novoLog.entidade_id).toBe('99');

      const logsRecuperados = carregarLogsStorage();
      expect(logsRecuperados[0].id).toBe(novoLog.id);
      expect(logsRecuperados[0].detalhes).toBe('Demanda criada na coluna A Fazer');
    });

    it('deve filtrar logs por termo de busca no título, detalhe ou usuário', async () => {
      const logsExemplo: LogAuditoria[] = [
        {
          id: '1',
          usuario_nome: 'Carlos Auditor',
          usuario_email: 'carlos@sgdi.gov.br',
          acao: 'CRIACAO',
          entidade: 'Demanda',
          entidade_id: '1',
          entidade_titulo: 'Relatório Contábil',
          detalhes: 'Demanda criada na coluna A Fazer',
          criado_em: new Date().toISOString(),
        },
        {
          id: '2',
          usuario_nome: 'Mariana Engenharia',
          usuario_email: 'mariana@sgdi.gov.br',
          acao: 'MOVIMENTACAO',
          entidade: 'Demanda',
          entidade_id: '2',
          entidade_titulo: 'Ajuste de Servidor',
          detalhes: 'Demanda movida para Em Progresso',
          criado_em: new Date().toISOString(),
        },
      ];
      salvarLogsStorage(logsExemplo);

      const resultadoBusca = await buscarLogsAuditoria({ termoBusca: 'Contábil' });
      expect(resultadoBusca).toHaveLength(1);
      expect(resultadoBusca[0].id).toBe('1');

      const resultadoPorUsuario = await buscarLogsAuditoria({ termoBusca: 'Mariana' });
      expect(resultadoPorUsuario).toHaveLength(1);
      expect(resultadoPorUsuario[0].id).toBe('2');
    });

    it('deve filtrar logs por tipo de ação', async () => {
      const logsExemplo: LogAuditoria[] = [
        {
          id: '1',
          usuario_nome: 'Usuário 1',
          acao: 'CRIACAO',
          entidade: 'Demanda',
          detalhes: 'Criada',
          criado_em: new Date().toISOString(),
        },
        {
          id: '2',
          usuario_nome: 'Usuário 2',
          acao: 'MOVIMENTACAO',
          entidade: 'Demanda',
          detalhes: 'Movida',
          criado_em: new Date().toISOString(),
        },
        {
          id: '3',
          usuario_nome: 'Usuário 3',
          acao: 'EXCLUSAO',
          entidade: 'Demanda',
          detalhes: 'Excluída',
          criado_em: new Date().toISOString(),
        },
      ];
      salvarLogsStorage(logsExemplo);

      const criacoes = await buscarLogsAuditoria({ acao: 'CRIACAO' });
      expect(criacoes).toHaveLength(1);
      expect(criacoes[0].id).toBe('1');

      const exclusao = await buscarLogsAuditoria({ acao: 'EXCLUSAO' });
      expect(exclusao).toHaveLength(1);
      expect(exclusao[0].id).toBe('3');
    });

    it('deve garantir que os registros não contenham emojis e mantenham formato minimalista', async () => {
      const logs = carregarLogsStorage();
      const regexEmojis = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

      for (const log of logs) {
        expect(regexEmojis.test(log.detalhes)).toBe(false);
        expect(regexEmojis.test(log.acao)).toBe(false);
        expect(regexEmojis.test(log.entidade)).toBe(false);
        if (log.entidade_titulo) {
          expect(regexEmojis.test(log.entidade_titulo)).toBe(false);
        }
      }
    });
  });
});
