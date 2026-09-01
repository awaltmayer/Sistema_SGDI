import {
  IconCircleDashed,
  IconProgress,
  IconCircleCheck,
  type Icon as TablerIcon,
} from '@tabler/icons-react';
import type { ColumnIcon as ColumnIconKey } from '@/dados/dados-iniciais';

const map: Record<ColumnIconKey, TablerIcon> = {
  'circle-dashed': IconCircleDashed,
  'progress': IconProgress,
  'circle-check': IconCircleCheck,
};

interface ColumnIconProps {
  name: ColumnIconKey;
  className?: string;
}

export function ColumnIcon({ name, className }: ColumnIconProps) {
  const Icon = (name && map[name]) ? map[name] : IconCircleDashed;
  return <Icon className={className} />;
}

export const IconeColuna = ColumnIcon;





