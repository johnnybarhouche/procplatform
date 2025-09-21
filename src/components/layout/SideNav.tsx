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
    <nav className="hidden w-56 flex-shrink-0 flex-col gap-1 lg:flex">
      {navItems.map((item) => {
        const isActive = item.id === activeNavId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate?.(item)}
            className={cn(
              'relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-primary',
              isActive
                ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                : 'text-brand-text/70 hover:bg-brand-primary/5 hover:text-brand-primary'
            )}
          >
            <span className="text-lg" aria-hidden="true">
              {item.icon ?? '•'}
            </span>
            <span>{item.label}</span>
            {isActive && <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-brand-primary" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}
