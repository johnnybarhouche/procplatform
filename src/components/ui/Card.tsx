import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: string;
  actions?: ReactNode;
}

export function Card({ className, header, actions, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border border-brand-text/10 bg-brand-surface p-5 shadow-sm', className)}
      {...props}
    >
      {(header || actions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {header && <h3 className="text-lg font-semibold text-brand-text">{header}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
