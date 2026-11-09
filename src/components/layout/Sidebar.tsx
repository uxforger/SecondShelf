import { LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import type { Session } from '../../lib/api/types';
import { spring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { setSession } from '../../lib/store';
import { IconButton } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { activeFor, NAV, ROLE_LABEL } from './nav';

export function Sidebar({ session, path }: { session: Session; path: string }) {
  const items = NAV[session.role].filter((i) => !i.mobileOnly && i.path !== '/profile');
  const active = activeFor(session.role, path);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-hairline bg-[#fbfcf9] lg:flex">
      <div className="px-6 pt-7 pb-6">
        <Logo size="sm" />
        <p className="t-caption mt-3 text-muted">{ROLE_LABEL[session.role]}</p>
      </div>
      <nav aria-label="Main" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const on = item.path === active;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <button
                  type="button"
                  aria-current={on ? 'page' : undefined}
                  onClick={() => navigate(item.path, { tab: true })}
                  className={`relative flex h-11 w-full items-center gap-3 rounded-[12px] px-3 text-[0.9375rem] leading-5 transition-colors duration-150 ${
                    on ? 'font-semibold text-deep' : 'font-medium text-muted hover:bg-deep/[0.04] hover:text-deep'
                  }`}
                >
                  {on && <motion.span layoutId="sidebar-active" transition={spring} className="absolute inset-0 rounded-[12px] bg-mint" />}
                  <Icon className="relative size-5" />
                  <span className="relative">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="m-3 flex items-center gap-3 rounded-[16px] p-2 pl-3 hover:bg-deep/[0.04]">
        <button type="button" onClick={() => navigate('/profile', { tab: true })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep text-[0.875rem] font-semibold text-white">
            {session.name.charAt(0)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.875rem] font-semibold leading-5 text-deep">{session.name}</span>
            <span className="t-caption block text-muted">Profile</span>
          </span>
        </button>
        <IconButton label="Sign out" onClick={() => setSession(null)}>
          <LogOut className="size-5 text-muted" />
        </IconButton>
      </div>
    </aside>
  );
}
