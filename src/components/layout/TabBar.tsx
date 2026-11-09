import { motion } from 'motion/react';
import type { Role } from '../../lib/api/types';
import { pressSpring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { useScrollEdges } from '../../lib/useScrollEdges';
import { activeFor, NAV } from './nav';

/** Translucent bottom tab bar. Highlights on press, switches on release (drag away to cancel). */
export function TabBar({ role, path }: { role: Role; path: string }) {
  const items = NAV[role].filter((i) => !i.desktopOnly);
  const active = activeFor(role, path);
  const { bottom } = useScrollEdges();

  const go = (to: string) => navigate(to, { tab: true });

  return (
    <nav aria-label="Main" className="material fixed inset-x-0 bottom-0 z-40 pb-safe lg:hidden">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-hairline transition-opacity duration-200 ${bottom ? 'opacity-100' : 'opacity-0'}`}
      />
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
                onClick={() => go(item.path)}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${on ? 'text-deep' : 'text-muted'}`}
              >
                {item.emphasis ? (
                  <span className="flex size-10 items-center justify-center rounded-full bg-green text-white shadow-soft">
                    <Icon className="size-[22px]" />
                  </span>
                ) : (
                  <Icon className="size-6" />
                )}
                <span className={`text-[0.6875rem] leading-[0.875rem] tracking-[0.02em] ${on ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
