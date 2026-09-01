import type { CardWithAssignee } from '@/lib/provedor-dados';
import type { SortBy } from './barra-ferramentas-quadro';

const rankingPrioridade: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function ordenarCartoes(cartoes: CardWithAssignee[], ordenarPor: SortBy): CardWithAssignee[] {
  const lista = [...cartoes];
  switch (ordenarPor) {
    case 'priority':
      lista.sort((a, b) => rankingPrioridade[a.priority] - rankingPrioridade[b.priority]);
      break;
    case 'due_date':
      lista.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
      break;
    case 'assignee':
      lista.sort((a, b) =>
        (a.assignee?.full_name ?? 'zzz').localeCompare(b.assignee?.full_name ?? 'zzz')
      );
      break;
    case 'title':
      lista.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'created_at':
      lista.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    case 'manual':
    default:
      lista.sort((a, b) => a.position - b.position);
  }
  return lista;
}

export const sortCards = ordenarCartoes;




