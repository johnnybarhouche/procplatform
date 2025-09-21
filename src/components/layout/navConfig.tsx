import { ReactNode } from 'react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  mobile?: boolean;
  roles?: Array<'requester' | 'procurement' | 'approver' | 'admin'>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'mr-form', label: 'MRs', href: '/?view=mr-form', mobile: true, icon: '📄' },
  { id: 'procurement-dashboard', label: 'RFQs', href: '/?view=procurement-dashboard', mobile: true, icon: '📬' },
  { id: 'quote-approval', label: 'Quotes', href: '/?view=quote-approval', mobile: true, icon: '✅' },
  { id: 'pr-dashboard', label: 'PRs', href: '/?view=pr-dashboard', mobile: true, icon: '📝' },
  { id: 'po-dashboard', label: 'POs', href: '/?view=po-dashboard', mobile: true, icon: '📦' },
  { id: 'supplier-dashboard', label: 'Suppliers', href: '/?view=supplier-dashboard', mobile: true, icon: '🏢' },
  { id: 'item-database', label: 'Items', href: '/?view=item-database', icon: '📚' },
  { id: 'analytics', label: 'Analytics', href: '/?view=analytics', icon: '📊' },
  { id: 'admin', label: 'Admin', href: '/?view=admin', icon: '⚙️', roles: ['admin'] },
  { id: 'ui-kit', label: 'UI Kit', href: '/ui-kit', icon: '🎨' },
];

export const MOBILE_NAV_IDS = NAV_ITEMS.filter((item) => item.mobile).map((item) => item.id);
