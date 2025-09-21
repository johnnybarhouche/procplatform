'use client';

import { NavItem } from './navConfig';
import { cn } from '@/lib/cn';

interface BottomNavProps {
  navItems: NavItem[];
  activeNavId: string;
  onNavigate?: (item: NavItem) => void;
  innerClassName?: string;
}

export function BottomNav({ navItems, activeNavId, onNavigate, innerClassName }: BottomNavProps) {
  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-text/10 bg-brand-surface/95 backdrop-blur lg:hidden">
      <div className={cn('mx-auto flex w-full items-center justify-around px-4 py-2', innerClassName)}>
        {navItems.map((item) => {
          const isActive = item.id === activeNavId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-primary',
                isActive ? 'text-brand-primary' : 'text-brand-text/60 hover:text-brand-primary'
              )}
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon ?? '•'}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
