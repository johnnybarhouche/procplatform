'use client';

import { ReactNode, useMemo } from 'react';
import { TopBar } from './TopBar';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { MOBILE_NAV_IDS, NavItem } from './navConfig';
import { cn } from '@/lib/cn';

interface AppLayoutProps {
  navItems: NavItem[];
  activeNavId: string;
  onNavigate?: (item: NavItem) => void;
  projects: Array<{ id: string; name: string; logo?: string }>;
  selectedProjectId: string;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    designation: string;
    role: string;
    project: string;
  };
  onUserUpdate: (user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    designation: string;
    role: string;
    project: string;
  }) => void;
  children: ReactNode;
}

export function AppLayout({
  navItems,
  activeNavId,
  onNavigate,
  projects,
  selectedProjectId,
  userRole,
  user,
  onUserUpdate,
  children,
}: AppLayoutProps) {
  const mobileNavItems = useMemo(
    () => navItems.filter((item) => MOBILE_NAV_IDS.includes(item.id)),
    [navItems]
  );

  const widthClass = 'w-full';

  const horizontalPaddingClass = 'px-2 min-[1281px]:px-3 min-[1441px]:px-4';

  const contentWrapperClass = cn(
    'mx-auto flex w-full items-start gap-4 pb-16 pt-2 transition-[padding,width] duration-200 ease-out min-[1281px]:gap-5 min-[1281px]:pt-3 min-[1441px]:gap-6 min-[1441px]:pt-4 lg:pb-10',
    horizontalPaddingClass,
    widthClass
  );

  const topBarInnerClass = cn(
    'mx-auto flex w-full items-center justify-between gap-4 py-2.5',
    horizontalPaddingClass,
    widthClass
  );

  const bottomNavInnerClass = cn(
    'mx-auto flex w-full items-center justify-around px-2 py-2 min-[1281px]:px-3 min-[1441px]:px-4',
    widthClass
  );

  return (
    <div className="min-h-screen bg-brand-surface [--app-topbar-height:4.5rem]">
      <TopBar
        projects={projects}
        selectedProjectId={selectedProjectId}
        userRole={userRole}
        user={user}
        onUserUpdate={onUserUpdate}
        innerClassName={topBarInnerClass}
      />

      <div className={contentWrapperClass}>
        <aside
          className={cn(
            'hidden lg:block lg:w-[176px] lg:flex-shrink-0',
            'lg:sticky lg:top-[calc(var(--app-topbar-height)+0.75rem)] lg:max-h-[calc(100vh-var(--app-topbar-height)-0.75rem)] lg:overflow-y-auto'
          )}
        >
          <SideNav
            navItems={navItems}
            activeNavId={activeNavId}
            onNavigate={onNavigate}
          />
        </aside>
        <main className="min-w-0 flex-1 space-y-5 lg:pb-0">
          {children}
        </main>
      </div>

      <BottomNav
        navItems={mobileNavItems}
        activeNavId={activeNavId}
        onNavigate={onNavigate}
        innerClassName={bottomNavInnerClass}
      />
    </div>
  );
}
