import { BadgeCheck, LayoutGrid, Package, Presentation, ReceiptText, ScanLine, Store, Truck, UserRound, type LucideIcon } from 'lucide-react';
import type { Role } from '../../lib/api/types';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Centre tab, filled circle. */
  emphasis?: boolean;
  desktopOnly?: boolean;
  mobileOnly?: boolean;
}

export const NAV: Record<Role, NavItem[]> = {
  distributor: [
    { path: '/overview', label: 'Overview', icon: LayoutGrid, desktopOnly: true },
    { path: '/stock', label: 'Stock', icon: Package },
    { path: '/scan', label: 'Scan', icon: ScanLine, emphasis: true },
    { path: '/sales', label: 'Sales', icon: ReceiptText },
    { path: '/passport', label: 'Passport', icon: BadgeCheck },
    { path: '/live', label: 'Live', icon: Presentation, desktopOnly: true },
  ],
  buyer: [
    { path: '/shop', label: 'Shop', icon: Store },
    { path: '/orders', label: 'Orders', icon: ReceiptText },
    { path: '/profile', label: 'Profile', icon: UserRound },
  ],
  foodbank: [
    { path: '/pickups', label: 'Pickups', icon: Truck },
    { path: '/profile', label: 'Profile', icon: UserRound },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  distributor: 'Distributor',
  buyer: 'Buyer',
  foodbank: 'Food bank',
};

export function homeFor(role: Role, desktop: boolean): string {
  if (role === 'distributor') return desktop ? '/overview' : '/stock';
  if (role === 'buyer') return '/shop';
  return '/pickups';
}

/** Which nav item a path belongs to (for highlighting nested routes). */
export function activeFor(role: Role, path: string): string | undefined {
  const items = NAV[role];
  return items.find((i) => path === i.path || path.startsWith(`${i.path}/`))?.path;
}
