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
import { Handover } from './screens/distributor/Handover';
import { Sales } from './screens/distributor/Sales';
import { Carbon } from './screens/distributor/Carbon';
import { Certificate } from './screens/distributor/Certificate';
import { Money } from './screens/distributor/Money';
import { Passport } from './screens/distributor/Passport';
import { BuyerHome } from './screens/buyer/BuyerHome';
import { OrderDetail, Orders } from './screens/buyer/Orders';
import { Paid } from './screens/buyer/Paid';
import { Product } from './screens/buyer/Product';
import { Shop } from './screens/buyer/Shop';
import { Pickups } from './screens/foodbank/Pickups';
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
      case '/sales':
        return { key: clean, el: <Sales session={session} /> };
      case '/handover':
        return { key: clean, el: <Handover />, bare: true };
      case '/money':
        return { key: clean, el: <Money session={session} /> };
      case '/passport':
        return { key: clean, el: <Passport session={session} /> };
      case '/carbon':
        return { key: clean, el: <Carbon session={session} /> };
    }
    const paid = match('/carbon/paid/:ref', clean);
    if (paid) return { key: '/carbon', el: <Carbon session={session} paidRef={paid.ref} /> };
    const cert = match('/carbon/certificate/:id', clean);
    if (cert) return { key: clean, el: <Certificate id={cert.id} />, bare: true };
    const batch = match('/batch/:id', clean);
    if (batch) return { key: clean, el: <BatchJourney id={batch.id} session={session} /> };
    const ho = match('/handover/:ref', clean);
    if (ho) return { key: '/handover', el: <Handover expected={ho.ref} />, bare: true };
  }

  if (session.role === 'buyer') {
    if (clean === '/buy') return { key: clean, el: <BuyerHome session={session} /> };
    if (clean === '/shop') return { key: clean, el: <Shop session={session} /> };
    if (clean === '/orders') return { key: clean, el: <Orders session={session} /> };
    const prod = match('/shop/:id', clean);
    if (prod) return { key: clean, el: <Product id={prod.id} session={session} /> };
    const order = match('/orders/:id', clean);
    if (order) return { key: clean, el: <OrderDetail id={order.id} session={session} /> };
    const pay = match('/pay/:ref', clean);
    if (pay) return { key: clean, el: <Paid reference={pay.ref} />, bare: true };
  }

  if (session.role === 'foodbank' && clean === '/pickups') return { key: clean, el: <Pickups session={session} /> };
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
