import { QrCode, ReceiptText } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { Page } from '../../components/layout/Page';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, SectionHeader } from '../../components/ui/Card';
import { CountUp, EmptyState } from '../../components/ui/Feedback';
import type { Order, Session } from '../../lib/api';
import { today } from '../../lib/dates';
import { ago, naira } from '../../lib/format';
import { spring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { business, metrics, offers, ordersFor, product } from '../../lib/selectors';
import { toast, useDb } from '../../lib/store';
import { Thumb } from './parts';

export function Sales({ session }: { session: Session }) {
  const db = useDb();
  const m = useMemo(() => metrics(db, session.businessId), [db, session.businessId]);
  const orders = useMemo(() => ordersFor(db, session.businessId), [db, session.businessId]);
  const waiting = orders.filter((o) => o.status === 'paid');
  const done = orders.filter((o) => o.status === 'handed_over').slice(0, 8);
  const listed = offers(db, today()).filter((v) => v.batch.sellerId === session.businessId);

  // Announce new paid orders as they arrive from the buyer's phone.
  const seen = useRef<Set<string> | null>(null);
  const waitingKey = waiting.map((o) => o.id).join();
  useEffect(() => {
    const ids = new Set(waiting.map((o) => o.id));
    if (seen.current) {
      for (const o of waiting) if (!seen.current.has(o.id)) toast(`New order · ${naira(o.total)}`, 'success');
    }
    seen.current = ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingKey]);

  return (
    <Page title="Sales">
      <Card dark className="overflow-hidden p-5 lg:p-6">
        <p className="t-label text-white/70">Recovered</p>
        <CountUp value={m.moneyRecovered} format={naira} className="mt-1 block text-[2.125rem] font-semibold leading-10 tracking-[-0.02em] lg:text-[2.5rem] lg:leading-[2.75rem]" />
        <motion.p
          initial={false}
          animate={{ opacity: m.moneyPending > 0 ? 1 : 0, y: m.moneyPending > 0 ? 0 : -4 }}
          transition={spring}
          aria-hidden={m.moneyPending <= 0}
          className="num t-label min-h-6 pt-1 text-amber"
        >
          {m.moneyPending > 0 ? `${naira(m.moneyPending)} waiting for handover` : ' '}
        </motion.p>
      </Card>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        <section aria-label="Waiting for handover">
          <SectionHeader title="Waiting for handover" count={waiting.length} />
          {waiting.length === 0 ? (
            <p className="t-label px-1 py-3 text-muted">No orders waiting.</p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {waiting.map((o) => (
                  <WaitingRow key={o.id} o={o} />
                ))}
              </AnimatePresence>
            </ul>
          )}

          <SectionHeader title="Listed" count={listed.length} />
          {listed.length === 0 ? (
            <p className="t-label px-1 py-3 text-muted">Nothing listed.</p>
          ) : (
            <ul className="-mx-3">
              {listed.map((v) => (
                <motion.li layout="position" key={v.batch.id} transition={spring} className="flex min-h-16 items-center gap-3 px-3 py-2">
                  <Thumb image={v.product.image} focus={v.product.focus} zoom={v.product.zoom} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9375rem] font-medium leading-5 text-deep">{v.product.name}</p>
                    <p className="t-caption num text-muted">{v.batch.quantity} left</p>
                  </div>
                  <span className="num text-[0.9375rem] font-semibold text-deep">{naira(v.batch.listing!.unitPrice)}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Handed over">
          <SectionHeader title="Handed over" />
          {done.length === 0 ? (
            <EmptyState icon={<ReceiptText className="size-7" />} title="No sales yet" line="Handed-over orders show here." />
          ) : (
            <ul className="-mx-3">
              <AnimatePresence initial={false}>
                {done.map((o) => (
                  <motion.li
                    key={o.id}
                    layout="position"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring}
                    className="flex min-h-16 items-center gap-3 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.9375rem] font-medium leading-5 text-deep">{business(db, o.buyerId)?.name}</p>
                      <p className="t-caption num truncate text-muted">
                        {product(db, o.productId)?.name} · {o.qty} · {ago(o.handedOverAt ?? o.paidAt)}
                      </p>
                    </div>
                    <span className="num text-[0.9375rem] font-semibold text-deep">{naira(o.total)}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </section>
      </div>
    </Page>
  );
}

function WaitingRow({ o }: { o: Order }) {
  const db = useDb();
  const p = product(db, o.productId);
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={spring}
    >
      <Card className="flex items-center gap-3 p-3 pl-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1rem] font-semibold leading-6 text-deep">{business(db, o.buyerId)?.name}</p>
          <p className="t-caption num truncate text-muted">
            {p?.name} · {o.qty} · {o.ref}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="num text-[0.9375rem] font-semibold text-deep">{naira(o.total)}</span>
            <Badge tone="warning">Paid</Badge>
          </div>
        </div>
        <Button size="sm" icon={<QrCode className="size-[18px]" />} onClick={() => navigate('/handover')}>
          Confirm
        </Button>
      </Card>
    </motion.li>
  );
}
