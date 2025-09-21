import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  soft?: boolean;
};

const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';

const solidVariants: Record<BadgeVariant, string> = {
  primary: 'bg-brand-primary text-brand-on-primary',
  success: 'bg-status-success text-brand-on-primary',
  warning: 'bg-status-warning text-brand-on-primary',
  danger: 'bg-status-danger text-brand-on-primary',
  neutral: 'bg-status-neutral text-brand-on-primary',
};

const softVariants: Record<BadgeVariant, string> = {
  primary: 'bg-brand-primary/10 text-brand-primary',
  success: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/10 text-status-warning',
  danger: 'bg-status-danger/10 text-status-danger',
  neutral: 'bg-status-neutral/10 text-status-neutral',
};

export function Badge({ variant = 'neutral', soft = true, className, children, ...props }: BadgeProps) {
  const palette = soft ? softVariants : solidVariants;
  return (
    <span className={cn(baseClasses, palette[variant], className)} {...props}>
      {children}
    </span>
  );
}
