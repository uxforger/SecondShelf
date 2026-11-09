import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { homeFor } from './components/layout/nav';
import { Sidebar } from './components/layout/Sidebar';
import { TabBar } from './components/layout/TabBar';
import { Toasts } from './components/ui/Feedback';
import type { Session } from './lib/api';
import { pageVariants, spring } from './lib/motion';
import { match, navigate, useRoute } from './lib/router';
import { useSession } from './lib/store';
import { useDesktop } from './lib/useMedia';
import { Login } from './screens/Login';
import { Orders } from './screens/buyer/Orders';
import { ProductDetail } from './screens/buyer/ProductDetail';
import { Shop } from './screens/buyer/Shop';
import { Handover } from './screens/distributor/Handover';
import { Overview } from './screens/distributor/Overview';
import { Passport } from './screens/distributor/Passport';
import { Sales } from './screens/distributor/Sales';
import { Scan } from './screens/distributor/Scan';
import { Stock } from './screens/distributor/Stock';
import { Pickups } from './screens/foodbank/Pickups';
import { Profile } from './screens/shared/Profile';

interface Resolved {
  key: string;
  el: ReactNode;
  /** Full-screen task: hide the tab bar. */
  focus?: boolean;
}

function resolve(session: Session, path: string): Resolved | null {
  const clean = path.split('?')[0];
  const common: Record<string, () => Resolved> = {
    '/profile': () => ({ key: '/profile', el: <Profile session={session} /> }),
  };
  if (common[clean]) return common[clean]();

  if (session.role === 'distributor') {
    switch (clean) {
      case '/overview':
        return { key: clean, el: <Overview session={session} /> };
      case '/stock':
        return { key: clean, el: <Stock session={session} /> };
      case '/scan':
        return { key: clean, el: <Scan session={session} />, focus: true };
      case '/sales':
        return { key: clean, el: <Sales session={session} /> };
      case '/handover':
        return { key: clean, el: <Handover />, focus: true };
      case '/passport':
        return { key: clean, el: <Passport session={session} /> };
    }
  }

  if (session.role === 'buyer') {
    if (clean === '/shop') return { key: clean, el: <Shop /> };
    const detail = match('/shop/:id', clean);
    if (detail) return { key: clean, el: <ProductDetail id={detail.id} session={session} />, focus: true };
    if (clean === '/orders') return { key: '/orders', el: <Orders session={session} /> };
    const order = match('/orders/:id', clean);
    if (order) return { key: '/orders', el: <Orders session={session} openId={order.id} /> };
  }

  if (session.role === 'foodbank' && clean === '/pickups') return { key: clean, el: <Pickups session={session} /> };

  return null;
}

function AppShell({ session }: { session: Session }) {
  const route = useRoute();
  const desktop = useDesktop();
  const resolved = resolve(session, route.path);

  useEffect(() => {
    if (!resolved) navigate(homeFor(session.role, desktop), { replace: true });
  }, [resolved, session.role, desktop]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [resolved?.key]);

  if (!resolved) return null;

  return (
    <div className="min-h-dvh">
      <Sidebar session={session} path={route.path} />
      <div className="relative lg:pl-[248px]">
        <LayoutGroup>
          <AnimatePresence mode="popLayout" initial={false} custom={route.dir}>
            <motion.div
              key={resolved.key}
              custom={route.dir}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={spring}
              className="w-full"
            >
              {resolved.el}
            </motion.div>
          </AnimatePresence>
        </LayoutGroup>
      </div>
      {!resolved.focus && <TabBar role={session.role} path={route.path} />}
      <Toasts aboveTabBar={!desktop && !resolved.focus} />
    </div>
  );
}

export default function App() {
  const session = useSession();
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <AnimatePresence mode="wait" initial={false}>
        {session ? (
          <motion.div key={`app-${session.role}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={spring}>
            <AppShell session={session} />
          </motion.div>
        ) : (
          <motion.div key="login" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={spring}>
            <Login />
            <Toasts aboveTabBar={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
