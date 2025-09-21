'use client';

import { ReactNode, useMemo } from 'react';
import { TopBar } from './TopBar';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { MOBILE_NAV_IDS, NavItem } from './navConfig';

interface AppLayoutProps {
  navItems: NavItem[];
  activeNavId: string;
  onNavigate?: (item: NavItem) => void;
  projects: Array<{ id: string; name: string }>;
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
  onRoleChange: (role: 'requester' | 'procurement' | 'approver' | 'admin') => void;
  children: ReactNode;
}

export function AppLayout({
  navItems,
  activeNavId,
  onNavigate,
  projects,
  selectedProjectId,
  onProjectChange,
  userRole,
  onRoleChange,
  children,
}: AppLayoutProps) {
  const mobileNavItems = useMemo(
    () => navItems.filter((item) => MOBILE_NAV_IDS.includes(item.id)),
    [navItems]
  );

  return (
    <div className="min-h-screen bg-brand-surface">
     <TopBar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={onProjectChange}
        userRole={userRole}
        onRoleChange={onRoleChange}
      />

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-5 pb-20 sm:px-6 lg:px-6 lg:pb-10">
        <SideNav navItems={navItems} activeNavId={activeNavId} onNavigate={onNavigate} />
        <main className="flex-1 space-y-5 lg:pb-0">
          {children}
        </main>
      </div>

      <BottomNav navItems={mobileNavItems} activeNavId={activeNavId} onNavigate={onNavigate} />
    </div>
  );
}
