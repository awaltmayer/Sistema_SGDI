import type { CardWithAssignee } from '@/lib/provedor-dados';
import type { SortBy } from './barra-ferramentas-quadro';

const rankingPrioridade: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function ordenarCartoes(cartoes: CardWithAssignee[], ordenarPor: SortBy): CardWithAssignee[] {
  const lista = [...cartoes];
  switch (ordenarPor) {
    case 'priority':
      lista.sort((a, b) => {
        const pA = a.prioridade ?? a.priority ?? 'low';
        const pB = b.prioridade ?? b.priority ?? 'low';
        return (rankingPrioridade[pA] ?? 2) - (rankingPrioridade[pB] ?? 2);
      });
      break;
    case 'due_date':
      lista.sort((a, b) => {
        const dA = a.data_vencimento ?? a.due_date;
        const dB = b.data_vencimento ?? b.due_date;
        if (!dA && !dB) return 0;
        if (!dA) return 1;
        if (!dB) return -1;
        return dA.localeCompare(dB);
      });
      break;
    case 'assignee':
      lista.sort((a, b) => {
        const nA = a.responsavel?.nome_completo ?? a.assignee?.full_name ?? 'zzz';
        const nB = b.responsavel?.nome_completo ?? b.assignee?.full_name ?? 'zzz';
        return nA.localeCompare(nB, 'pt-BR');
      });
      break;
    case 'title':
      lista.sort((a, b) => {
        const tA = a.titulo ?? a.title ?? '';
        const tB = b.titulo ?? b.title ?? '';
        return tA.localeCompare(tB, 'pt-BR');
      });
      break;
    case 'created_at':
      lista.sort((a, b) => {
        const cA = a.criado_em ?? a.created_at ?? '';
        const cB = b.criado_em ?? b.created_at ?? '';
        return cB.localeCompare(cA);
      });
      break;
    case 'manual':
    default:
      lista.sort((a, b) => {
        const posA = a.posicao ?? a.position ?? 0;
        const posB = b.posicao ?? b.position ?? 0;
        return posA - posB;
      });
  }
  return lista;
}

export const sortCards = ordenarCartoes;




