import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import type { Session } from '../lib/api';
import { spring } from '../lib/motion';
import { match, navigate, useRoute } from '../lib/router';
import { useSession } from '../lib/store';
import { useLiveAlerts } from '../lib/useLiveAlerts';
import { Toasts } from './kit/toasts';
import { Kit } from './screens/Kit';
import { Landing } from './screens/Landing';
import { Profile } from './screens/Profile';
import { SignIn } from './screens/SignIn';
import { BatchJourney } from './screens/distributor/Batch';
import { Home } from './screens/distributor/Home';
import { Scan } from './screens/distributor/Scan';
import { Stock } from './screens/distributor/Stock';
import { AppShell, HOME } from './shell';

interface Resolved {
  key: string;
  el: ReactNode;
  /** Full screen: no tab bar or sidebar (camera, payment, live board). */
  bare?: boolean;
}

function resolve(path: string, session: Session): Resolved | null {
  const clean = path.split('?')[0];
  if (clean === '/profile') return { key: clean, el: <Profile session={session} /> };

  if (session.role === 'distributor') {
    switch (clean) {
      case '/home':
        return { key: clean, el: <Home session={session} /> };
      case '/stock':
        return { key: clean, el: <Stock session={session} /> };
      case '/scan':
        return { key: clean, el: <Scan />, bare: true };
    }
    const batch = match('/batch/:id', clean);
    if (batch) return { key: clean, el: <BatchJourney id={batch.id} session={session} /> };
  }
  return null;
}

export default function App() {
  const session = useSession();
  const { path } = useRoute();
  const clean = path.split('?')[0];

  if (clean.startsWith('/kit')) return <Kit />;
  if (!session) {
    if (clean === '/signin') return <SignIn />;
    return <Landing />;
  }
  return <SignedIn session={session} path={path} />;
}

function SignedIn({ session, path }: { session: Session; path: string }) {
  useLiveAlerts(session);
  const { dir } = useRoute();
  const reduced = useReducedMotion();
  const r = resolve(path, session);

  // Unknown or public route while signed in: go home.
  useEffect(() => {
    if (!r) navigate(HOME[session.role], { replace: true });
  }, [r, session.role]);
  if (!r) return null;

  const page = (
    <AnimatePresence mode="popLayout" initial={false} custom={dir}>
      <motion.div
        key={r.key}
        custom={dir}
        variants={{
          enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 28 }),
          center: { opacity: 1, x: 0 },
          exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -28 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ x: spring, opacity: { duration: 0.18 } }}
      >
        {r.el}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <LayoutGroup>
      {r.bare ? (
        page
      ) : (
        <AppShell session={session} tabBar>
          {page}
        </AppShell>
      )}
      <Toasts tabBar={!r.bare} />
    </LayoutGroup>
  );
}
