// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportarExcelDashboard, exportarPdfDashboard, extrairDemandasAtrasadas } from './exportador-dashboard';
import type { CartaoComResponsavel, MembroEquipe } from '@/lib/provedor-dados';
import { toast } from 'sonner';

if (typeof window !== 'undefined') {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = vi.fn();
  }
}

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Exportador Dashboard - Apenas Demandas Atrasadas', () => {
  const mockMembros: MembroEquipe[] = [
    {
      id: 14,
      id_usuario: 'user-14',
      nome_completo: 'Enio Neto',
      email: 'enio@exemplo.com',
      avatar_url: null,
      funcao: 'admin',
    },
    {
      id: 17,
      id_usuario: 'user-17',
      nome_completo: 'Augusto Altmayer',
      email: 'augusto@exemplo.com',
      avatar_url: null,
      funcao: 'member',
    },
  ];

  // Cartão 101 está no prazo (futuro)
  // Cartão 102 está atrasado (passado)
  const mockCartoes: CartaoComResponsavel[] = [
    {
      id: 101,
      titulo: 'Upgrade do Cluster Kubernetes EKS v1.30 (No Prazo)',
      descricao: 'Janela de manutenção programada com prazo futuro',
      coluna: 'in-progress',
      prioridade: 'high',
      data_vencimento: '2026-12-15', // No prazo
      posicao: 0,
      criado_em: '2026-10-01T10:00:00.000Z',
      id_usuario: 'user-14',
      ids_responsaveis: ['14', '17'],
      responsaveis: [mockMembros[0], mockMembros[1]],
      rastreador_tempo: {
        tempo_total_segundos: 7200,
        em_execucao: false,
      },
    },
    {
      id: 102,
      titulo: 'Correção de Falha de Buffer Overflow no WAF (Atrasada)',
      descricao: 'Ajuste urgente de regras no Cloudflare',
      coluna: 'todo',
      prioridade: 'medium',
      data_vencimento: '2026-10-01', // Atrasada em relação a hoje
      posicao: 1,
      criado_em: '2026-09-25T14:00:00.000Z',
      id_usuario: 'user-17',
      ids_responsaveis: [],
      responsaveis: [],
    },
  ];

  const mockParams = {
    cartoes: mockCartoes,
    filtros: {
      periodo: 'todos' as const,
      responsavel: 'todos',
      prioridade: 'todas' as const,
      status: 'todos' as const,
      busca: '',
    },
    membros: mockMembros,
    totalGeral: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extrairDemandasAtrasadas', () => {
    it('deve filtrar estritamente apenas os cartões atrasados', () => {
      const atrasadas = extrairDemandasAtrasadas(mockCartoes);
      expect(atrasadas.length).toBe(1);
      expect(atrasadas[0].id).toBe(102);
    });
  });

  describe('exportarExcelDashboard', () => {
    it('deve exibir aviso se não houver cartões atrasados para exportar', () => {
      const cartoesSemAtraso = [mockCartoes[0]]; // Apenas no prazo
      exportarExcelDashboard({ ...mockParams, cartoes: cartoesSemAtraso });
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('Não há demandas atrasadas para exportar')
      );
    });

    it('deve gerar arquivo CSV contendo apenas as demandas atrasadas', () => {
      const appendedLinks: HTMLAnchorElement[] = [];
      const clickSpy = vi.fn();

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          const el = originalCreateElement('a') as HTMLAnchorElement;
          el.click = clickSpy;
          appendedLinks.push(el);
          return el;
        }
        return originalCreateElement(tagName);
      });

      exportarExcelDashboard(mockParams);

      expect(clickSpy).toHaveBeenCalled();
      expect(appendedLinks.length).toBeGreaterThan(0);
      expect(appendedLinks[0].getAttribute('download')).toContain('demandas_atrasadas_sgdi_');
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('1 demanda(s) atrasada(s) exportada(s) para Excel/CSV')
      );
    });
  });

  describe('exportarPdfDashboard', () => {
    it('deve exibir aviso se não houver cartões atrasados para exportar PDF', () => {
      const cartoesSemAtraso = [mockCartoes[0]];
      exportarPdfDashboard({ ...mockParams, cartoes: cartoesSemAtraso });
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('Não há demandas atrasadas para exportar')
      );
    });

    it('deve criar iframe com cabeçalho corporativo, logo favicon.svg e apenas demandas atrasadas', () => {
      let writtenHtml = '';
      const printMock = vi.fn();
      const focusMock = vi.fn();

      const mockIframe = {
        style: {},
        setAttribute: vi.fn(),
        contentWindow: {
          document: {
            readyState: 'complete',
            open: vi.fn(),
            write: vi.fn((html: string) => {
              writtenHtml = html;
            }),
            close: vi.fn(),
          },
          focus: focusMock,
          print: printMock,
          addEventListener: vi.fn(),
        },
      } as unknown as HTMLIFrameElement;

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'iframe') {
          return mockIframe;
        }
        return document.createElement(tag);
      });

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockIframe);

      exportarPdfDashboard(mockParams);

      expect(writtenHtml).toContain('SGDI Tecnologia & Governança S.A.');
      expect(writtenHtml).toContain('Relatório de Demandas Atrasadas & Quebra de SLA');
      expect(writtenHtml).toContain('viewBox="0 0 64 64"'); // Logo favicon.svg
      // Deve conter o cartão atrasado
      expect(writtenHtml).toContain('Correção de Falha de Buffer Overflow no WAF (Atrasada)');
      // NÃO deve conter o cartão que estava no prazo
      expect(writtenHtml).not.toContain('Upgrade do Cluster Kubernetes EKS v1.30 (No Prazo)');
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Relatório de 1 demanda(s) atrasada(s) pronto!')
      );
    });
  });
});
