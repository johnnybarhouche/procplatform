'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function PageLayout({ 
  title, 
  description, 
  children, 
  className,
  actions 
}: PageLayoutProps) {
  return (
    <div className={cn('space-y-5', className)}>
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-text">{title}</h1>
            {description && (
              <p className="text-brand-text/70">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
