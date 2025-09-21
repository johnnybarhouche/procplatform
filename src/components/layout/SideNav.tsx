'use client';

import { NavItem } from './navConfig';
import { cn } from '@/lib/cn';

interface SideNavProps {
  navItems: NavItem[];
  activeNavId: string;
  onNavigate?: (item: NavItem) => void;
}

export function SideNav({ navItems, activeNavId, onNavigate }: SideNavProps) {
  return (
    <nav aria-label="Primary navigation" className="w-full px-1">
      <div className="flex w-full flex-col gap-1.5 pb-8">
        {navItems.map((item) => {
          const isActive = item.id === activeNavId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item)}
              className={cn(
                'relative flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary',
                isActive
                  ? 'bg-brand-primary/10 font-semibold text-brand-primary'
                  : 'text-brand-text/70 hover:bg-brand-primary/5 hover:text-brand-primary'
              )}
            >
              <span className="text-xl" aria-hidden="true">
                {item.icon ?? '•'}
              </span>
              <span className="truncate leading-tight">{item.label}</span>
              {isActive && (
                <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-brand-primary" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
