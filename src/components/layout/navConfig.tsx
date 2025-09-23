import { ReactNode } from 'react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  mobile?: boolean;
  roles?: Array<'requester' | 'procurement' | 'approver' | 'admin'>;
  adminOnly?: boolean; // New property for admin-only access
}

export const NAV_ITEMS: NavItem[] = [
  // MRs - Available to all roles
  { id: 'mr-form', label: 'MRs', href: '/?view=mr-form', mobile: true, icon: '📄', roles: ['requester', 'procurement', 'approver', 'admin'] },
  
  // RFQs - Available to procurement and admin
  { id: 'procurement-dashboard', label: 'RFQs', href: '/?view=procurement-dashboard', mobile: true, icon: '📬', roles: ['procurement', 'admin'] },
  
  // Quotes - Available to procurement and admin
  { id: 'quote-approval', label: 'Quotes', href: '/?view=quote-approval', mobile: true, icon: '✅', roles: ['procurement', 'admin'] },
  
  // PRs - Available to procurement and admin
  { id: 'pr-dashboard', label: 'PRs', href: '/?view=pr-dashboard', mobile: true, icon: '📝', roles: ['procurement', 'admin'] },
  
  // POs - Available to approver and admin
  { id: 'po-dashboard', label: 'POs', href: '/?view=po-dashboard', mobile: true, icon: '📦', roles: ['approver', 'admin'] },
  
  // Suppliers - Available to procurement and admin
  { id: 'supplier-dashboard', label: 'Suppliers', href: '/?view=supplier-dashboard', mobile: true, icon: '🏢', roles: ['procurement', 'admin'] },
  
  // Items - Available to procurement and admin
  { id: 'item-database', label: 'Items', href: '/?view=item-database', icon: '📚', roles: ['procurement', 'admin'] },
  
  // Analytics - Available to procurement and admin
  { id: 'analytics', label: 'Analytics', href: '/?view=analytics', icon: '📊', roles: ['procurement', 'admin'] },
  
  // Admin - Only for admin
  { id: 'admin', label: 'Admin', href: '/?view=admin', icon: '⚙️', roles: ['admin'] },
  
  // UI Kit - Only for admin
  { id: 'ui-kit', label: 'UI Kit', href: '/ui-kit', icon: '🎨', roles: ['admin'] },
];

export const MOBILE_NAV_IDS = NAV_ITEMS.filter((item) => item.mobile).map((item) => item.id);
