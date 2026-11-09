import { ReceiptText } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { Page } from '../../components/layout/Page';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/Card';
import { EmptyState, SuccessMark } from '../../components/ui/Feedback';
import { QrCode } from '../../components/ui/QrCode';
import type { Order, Session } from '../../lib/api';
import { clock, naira } from '../../lib/format';
import { haptic } from '../../lib/haptics';
import { spring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { business, ordersFor, product } from '../../lib/selectors';
import { toast, useDb } from '../../lib/store';
import { Thumb } from '../distributor/parts';

export function Orders({ session, openId }: { session: Session; openId?: string }) {
  const db = useDb();
  const orders = useMemo(() => ordersFor(db, session.businessId).filter((o) => o.buyerId === session.businessId), [db, session.businessId]);
  const active = orders.filter((o) => o.status === 'paid');
  const done = orders.filter((o) => o.status === 'handed_over');
  const open = openId ? orders.find((o) => o.id === openId) ?? null : null;

  // Live: tell the buyer the moment the distributor confirms.
  const prev = useRef<Map<string, Order['status']> | null>(null);
  useEffect(() => {
    const now = new Map(orders.map((o) => [o.id, o.status]));
    if (prev.current) {
      for (const o of orders) {
        if (prev.current.get(o.id) === 'paid' && o.status === 'handed_over') {
          haptic();
          if (o.id !== openId) toast('Handed over', 'success');
        }
      }
    }
    prev.current = now;
  }, [orders, openId]);

  const row = (o: Order) => {
    const p = product(db, o.productId);
    return (
      <motion.li key={o.id} layout="position" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => navigate(`/orders/${o.id}`, { tab: true })}
          className="flex min-h-[72px] w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left hover:bg-deep/[0.03]"
        >
          {p && <Thumb image={p.image} focus={p.focus} zoom={p.zoom} />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-medium leading-6 text-deep">{p?.name}</p>
            <p className="t-caption num truncate text-muted">
              {o.qty} cartons · {o.ref}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="num text-[15px] font-semibold text-deep">{naira(o.total)}</span>
            {o.status === 'paid' ? <Badge tone="warning">Paid</Badge> : <Badge tone="success">Handed over</Badge>}
          </div>
        </motion.button>
      </motion.li>
    );
  };

  return (
    <Page title="Orders">
      {orders.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="size-7" />}
          title="No orders yet"
          line="Paid orders and their pickup codes show here."
          action={<Button onClick={() => navigate('/shop', { tab: true })}>Shop</Button>}
        />
      ) : (
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          <section aria-label="Ready for pickup">
            <SectionHeader title="Ready for pickup" count={active.length} />
            {active.length === 0 ? (
              <p className="t-label px-1 py-3 text-muted">Nothing waiting.</p>
            ) : (
              <ul className="-mx-3">
                <AnimatePresence initial={false}>{active.map(row)}</AnimatePresence>
              </ul>
            )}
          </section>
          <section aria-label="Handed over">
            <SectionHeader title="Handed over" count={done.length} />
            <ul className="-mx-3">
              <AnimatePresence initial={false}>{done.map(row)}</AnimatePresence>
            </ul>
          </section>
        </div>
      )}

      <OrderSheet order={open} onClose={() => navigate('/orders', { tab: true })} />
    </Page>
  );
}

function OrderSheet({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const db = useDb();
  const last = useRef<Order | null>(order);
  if (order) last.current = order;
  const o = order ?? last.current;
  const p = o ? product(db, o.productId) : undefined;
  const seller = o ? business(db, o.sellerId) : undefined;

  return (
    <BottomSheet open={!!order} onClose={onClose} title={p?.name ?? 'Order'}>
      {o && (
        <AnimatePresence mode="popLayout" initial={false}>
          {o.status === 'paid' ? (
            <motion.div key="qr" exit={{ opacity: 0, scale: 0.96 }} transition={spring} className="flex flex-col items-center pb-2 text-center">
              <div className="rounded-[28px] bg-surface p-4 shadow-card ring-1 ring-hairline">
                <QrCode value={o.ref} size={220} label={`Handover code ${o.ref}`} />
              </div>
              <p className="num mt-4 text-[22px] font-semibold tracking-[0.04em] text-deep">{o.ref}</p>
              <p className="t-label mt-1 text-muted">
                Show at {o.fulfilment} · {seller?.name}, {seller?.area}
              </p>
              <p className="t-label mt-4 flex items-center gap-2 text-muted" aria-live="polite">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-amber opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-amber" />
                </span>
                Waiting for handover
              </p>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="flex flex-col items-center py-6 text-center" aria-live="polite">
              <SuccessMark size={88} />
              <p className="t-title mt-5 text-deep">Handed over</p>
              <p className="t-label num mt-1 text-muted">
                {o.ref} · {o.handedOverAt ? clock(o.handedOverAt) : ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {o && (
        <dl className="mt-4 divide-y divide-hairline border-t border-hairline">
          <div className="flex min-h-12 items-center justify-between">
            <dt className="t-label text-muted">Cartons</dt>
            <dd className="num font-medium text-deep">{o.qty}</dd>
          </div>
          <div className="flex min-h-12 items-center justify-between">
            <dt className="t-label text-muted">Paid</dt>
            <dd className="num font-medium text-deep">{naira(o.total)}</dd>
          </div>
        </dl>
      )}
    </BottomSheet>
  );
}
