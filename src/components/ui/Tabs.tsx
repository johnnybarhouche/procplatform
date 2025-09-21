'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTabId, className }: TabsProps) {
  const initialTab = defaultTabId ?? tabs[0]?.id;
  const [activeTab, setActiveTab] = useState<string | undefined>(initialTab);

  return (
    <div className={cn('w-full', className)}>
      <div role="tablist" className="flex flex-wrap gap-2 border-b border-brand-text/10 pb-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-primary',
                isActive
                  ? 'bg-brand-primary text-brand-on-primary'
                  : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20',
                tab.disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`${tab.id}-panel`}
            role="tabpanel"
            hidden={tab.id !== activeTab}
            className="focus:outline-none"
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
