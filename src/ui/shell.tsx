import { ArrowLeft, Boxes, HandCoins, Home, Landmark, Leaf, MonitorPlay, Package, ReceiptText, ScanLine, ShieldCheck, ShoppingBasket, Store, Truck, UserRound } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useState, type ReactNode } from 'react';
import type { Role, Session } from '../lib/api';
import { spring } from '../lib/motion';
import { goBack, navigate, useRoute } from '../lib/router';
import { IconButton, Logo } from './kit/core';

export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  /** Also lit on these route prefixes. */
  also?: string[];
  desktopOnly?: boolean;
}

const I = 'size-[22px]';

export const NAV: Record<Role, NavItem[]> = {
  distributor: [
    { path: '/home', label: 'Home', icon: <Home className={I} /> },
    { path: '/stock', label: 'Stock', icon: <Boxes className={I} />, also: ['/batch'] },
    { path: '/scan', label: 'Scan', icon: <ScanLine className={I} /> },
    { path: '/sales', label: 'Sales', icon: <ReceiptText className={I} />, also: ['/handover'] },
    { path: '/money', label: 'Money', icon: <Landmark className={I} /> },
    { path: '/passport', label: 'Passport', icon: <ShieldCheck className={I} />, desktopOnly: true },
    { path: '/carbon', label: 'Carbon', icon: <Leaf className={I} />, desktopOnly: true },
    { path: '/live', label: 'Live board', icon: <MonitorPlay className={I} />, desktopOnly: true },
  ],
  buyer: [
    { path: '/buy', label: 'Home', icon: <Home className={I} /> },
    { path: '/shop', label: 'Offers', icon: <Store className={I} /> },
    { path: '/orders', label: 'Orders', icon: <ShoppingBasket className={I} /> },
  ],
  foodbank: [{ path: '/pickups', label: 'Pickups', icon: <Truck className={I} /> }],
};

export const HOME: Record<Role, string> = { distributor: '/home', buyer: '/buy', foodbank: '/pickups' };

function isOn(item: NavItem, path: string) {
  return path === item.path || path.startsWith(`${item.path}/`) || !!item.also?.some((p) => path.startsWith(p));
}

/** Desktop sidebar + phone tab bar around the page. */
export function AppShell({ session, children, tabBar }: { session: Session; children: ReactNode; tabBar: boolean }) {
  const { path } = useRoute();
  const items = NAV[session.role];
  return (
    <div className="min-h-dvh bg-paper lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-hairline bg-white/80 px-4 pt-6 pb-5 backdrop-blur-xl lg:flex">
        <button type="button" onClick={() => navigate(HOME[session.role], { tab: true })} className="mb-8 self-start rounded-full px-2 py-1">
          <Logo />
        </button>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {items.map((it) => {
            const on = isOn(it, path);
            return (
              <button
                key={it.path}
                type="button"
                aria-current={on ? 'page' : undefined}
                onClick={() => navigate(it.path, { tab: true })}
                className={`relative flex h-11 items-center gap-3 rounded-[12px] px-3 text-[0.9375rem] font-medium transition-colors ${on ? 'text-forest' : 'text-slate hover:bg-paper hover:text-ink'}`}
              >
                {on && <motion.span layoutId="side-on" transition={spring} className="absolute inset-0 rounded-[12px] bg-leaf-tint" />}
                <span className="relative">{it.icon}</span>
                <span className="relative">{it.label}</span>
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={() => navigate('/profile')} className="mt-auto flex items-center gap-3 rounded-[12px] px-2 py-2 text-left hover:bg-paper">
          <span className="flex size-9 items-center justify-center rounded-full bg-forest text-[0.875rem] font-semibold text-lime">{initials(session.name)}</span>
          <span className="min-w-0">
            <span className="block truncate text-[0.9375rem] font-semibold text-ink">{session.name}</span>
            <span className="t-12 block text-slate">Profile · Reset demo</span>
          </span>
        </button>
      </aside>

      <div className={tabBar ? 'pb-[calc(var(--tabbar-h)+var(--safe-bottom))] lg:pb-0' : ''}>{children}</div>

      {tabBar && (
        <nav aria-label="Main" className="material fixed inset-x-0 bottom-0 z-40 border-t border-ink/[0.06] pb-[var(--safe-bottom)] lg:hidden">
          <div className="mx-auto flex h-[var(--tabbar-h)] max-w-[560px] items-stretch">
            {items
              .filter((i) => !i.desktopOnly)
              .map((it) => {
                const on = isOn(it, path);
                return (
                  <motion.button
                    key={it.path}
                    type="button"
                    aria-current={on ? 'page' : undefined}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', visualDuration: 0.12, bounce: 0 }}
                    onClick={() => navigate(it.path, { tab: true })}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold tracking-[0.01em] ${on ? 'text-forest' : 'text-slate'}`}
                  >
                    <span className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${on ? 'bg-leaf-tint' : ''}`}>{it.icon}</span>
                    {it.label}
                  </motion.button>
                );
              })}
          </div>
        </nav>
      )}
    </div>
  );
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/**
 * A screen: translucent header that gains its material once content
 * scrolls under it, a large title, and a 12-column-ready content area.
 */
export function Page({
  title,
  back,
  actions,
  children,
  session,
  wide = true,
  eyebrow,
}: {
  title: string;
  /** Fallback route for the back button. */
  back?: string;
  actions?: ReactNode;
  children: ReactNode;
  session?: Session;
  wide?: boolean;
  eyebrow?: ReactNode;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 8));
  return (
    <div>
      <header className={`sticky top-0 z-30 transition-[background,box-shadow] duration-200 ${scrolled ? 'material shadow-[0_1px_0_rgba(15,31,26,0.06)]' : ''}`}>
        <div className={`mx-auto flex h-14 items-center gap-2 px-4 pt-[var(--safe-top)] sm:px-6 lg:h-16 ${wide ? 'max-w-[1248px]' : 'max-w-[768px]'}`}>
          {back ? (
            <IconButton label="Back" onClick={() => goBack(back)} className="-ml-2">
              <ArrowLeft className="size-6" />
            </IconButton>
          ) : (
            <span className="lg:hidden">
              <Logo />
            </span>
          )}
          <motion.span initial={false} animate={{ opacity: scrolled || back ? 1 : 0 }} className="t-16 min-w-0 flex-1 truncate font-semibold text-ink">
            {back || scrolled ? title : ''}
          </motion.span>
          {actions}
          {session && (
            <button type="button" aria-label="Profile" onClick={() => navigate('/profile')} className="flex size-10 items-center justify-center rounded-full bg-forest text-[0.8125rem] font-semibold text-lime lg:hidden">
              {initials(session.name)}
            </button>
          )}
        </div>
      </header>
      <main className={`mx-auto px-4 pb-10 sm:px-6 ${wide ? 'max-w-[1248px]' : 'max-w-[768px]'}`}>
        {eyebrow}
        {!back && <h1 className="t-32 mt-1 mb-5 text-ink lg:t-40 lg:mt-4 lg:mb-6">{title}</h1>}
        {back && <h1 className="t-24 mt-1 mb-5 text-ink lg:t-32 lg:mt-3">{title}</h1>}
        {children}
      </main>
    </div>
  );
}

export const ICONS = { Package, HandCoins, UserRound };
