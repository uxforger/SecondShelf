import { motion } from 'motion/react';
import type { Role } from '../../lib/api/types';
import { pressSpring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { activeFor, NAV } from './nav';

/** Translucent bottom tab bar. Tabs switch on pointer-down. */
export function TabBar({ role, path }: { role: Role; path: string }) {
  const items = NAV[role].filter((i) => !i.desktopOnly);
  const active = activeFor(role, path);

  const go = (to: string) => navigate(to, { tab: true });

  return (
    <nav aria-label="Main" className="material fixed inset-x-0 bottom-0 z-40 border-t border-hairline pb-safe lg:hidden">
      <ul className="mx-auto grid h-[var(--tabbar-h)] max-w-[720px]" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const on = item.path === active;
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex">
              <motion.button
                type="button"
                aria-current={on ? 'page' : undefined}
                whileTap={{ scale: 0.92 }}
                transition={pressSpring}
                onPointerDown={(e) => {
                  if (e.pointerType !== 'mouse' || e.button === 0) go(item.path);
                }}
                onClick={(e) => {
                  if (e.detail === 0) go(item.path); // keyboard
                }}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${on ? 'text-deep' : 'text-muted'}`}
              >
                {item.emphasis ? (
                  <span className="flex size-10 items-center justify-center rounded-full bg-green text-white shadow-soft">
                    <Icon className="size-[22px]" />
                  </span>
                ) : (
                  <Icon className="size-6" />
                )}
                <span className={`text-[11px] leading-[14px] tracking-[0.02em] ${on ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
