import { Badge as ShadcnBadge, type BadgeProps as ShadcnBadgeProps } from '@/componentes/ui/emblema';
import { cn } from '@/lib/utilitarios';
import './distintivo.css';

export type CorDistintivo = 'gray' | 'blue' | 'amber' | 'red' | 'green' | 'purple';
export type BadgeColor = CorDistintivo;

const estilosCor: Record<CorDistintivo, string> = {
  gray: 'sgdi-distintivo-gray',
  blue: 'sgdi-distintivo-blue',
  amber: 'sgdi-distintivo-amber',
  red: 'sgdi-distintivo-red',
  green: 'sgdi-distintivo-green',
  purple: 'sgdi-distintivo-purple',
};
export const colorStyles = estilosCor;

export interface PropsDistintivo extends Omit<ShadcnBadgeProps, 'variant'> {
  color?: CorDistintivo;
  cor?: CorDistintivo;
}
export type BadgeProps = PropsDistintivo;

function Badge({ color, cor = 'gray', className, ...props }: PropsDistintivo) {
  const corFinal = color ?? cor;
  return (
    <ShadcnBadge
      variant="outline"
      className={cn(estilosCor[corFinal], className)}
      {...props}
    />
  );
}

export { Badge };
export const Distintivo = Badge;
