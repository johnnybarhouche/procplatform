'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  labelClassName?: string;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, required, labelClassName, hideLabel, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label
        className={cn('flex w-full flex-col space-y-1 text-sm text-brand-text/80', labelClassName)}
        htmlFor={inputId}
      >
        {label && (
          <span className={cn('font-medium text-brand-text', hideLabel && 'sr-only')}>
            {label}
            {required ? ' *' : ''}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-md border border-brand-text/20 bg-brand-surface px-3 py-2 text-brand-text shadow-sm transition',
            'placeholder:text-brand-text/40 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary',
            error && 'border-status-danger focus:ring-status-danger',
            className
          )}
          required={required}
          aria-invalid={!!error}
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-xs text-brand-text/60">
            {hint}
          </span>
        )}
        {error && <span className="text-xs text-status-danger">{error}</span>}
      </label>
    );
  }
);

Input.displayName = 'Input';
