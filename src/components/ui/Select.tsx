'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, required, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <label className="flex w-full flex-col space-y-1 text-sm text-brand-text/80" htmlFor={selectId}>
        {label && (
          <span className="font-medium text-brand-text">
            {label}
            {required ? ' *' : ''}
          </span>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full rounded-md border border-brand-text/20 bg-brand-surface px-3 py-2 text-brand-text shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary',
            error && 'border-status-danger focus:ring-status-danger',
            className
          )}
          required={required}
          aria-invalid={!!error}
          aria-describedby={hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {children}
        </select>
        {hint && !error && (
          <span id={`${selectId}-hint`} className="text-xs text-brand-text/60">
            {hint}
          </span>
        )}
        {error && <span className="text-xs text-status-danger">{error}</span>}
      </label>
    );
  }
);

Select.displayName = 'Select';
