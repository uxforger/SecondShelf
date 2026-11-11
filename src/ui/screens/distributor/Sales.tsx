import { ScanLine } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { Order, Session } from '../../../lib/api';
import { naira } from '../../../lib/format';
import { spring } from '../../../lib/motion';
import { navigate } from '../../../lib/router';
import { business, product } from '../../../lib/selectors';
import { useDb } from '../../../lib/store';
import { PayoutSheet } from '../../actions';
import { SELLER, when } from '../../data';
import { Button, Card, Pill, SectionTitle } from '../../kit/core';
import { ProductPhoto } from '../../kit/media';
import { Page } from '../../shell';

export function Sales({ session }: { session: Session }) {
  const db = useDb();
  const mine = useMemo(() => db.orders.filter((o) => o.sellerId === SELLER).sort((a, b) => b.paidAt.localeCompare(a.paidAt)), [db]);
  const waiting = mine.filter((o) => o.status === 'paid');
  const toPay = mine.filter((o) => o.status === 'handed_over' && o.payout?.status !== 'successful');
  const done = mine.filter((o) => o.status === 'handed_over' && o.payout?.status === 'successful').slice(0, 8);
  const [paying, setPaying] = useState<Order | null>(null);

  const row = (o: Order, action?: React.ReactNode, pill?: React.ReactNode) => {
    const p = product(db, o.productId);
    return (
      <motion.li key={o.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
        <div className="flex items-center gap-3 rounded-[12px] px-2 py-2.5 hover:bg-paper">
          <button type="button" onClick={() => navigate(`/batch/${o.batchId}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
            {p && <ProductPhoto product={p} className="size-12" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[1rem] font-semibold text-ink">{business(db, o.buyerId)?.name}</span>
              <span className="mono block truncate text-slate">
                {o.ref} · {o.qty} × {p?.name}
              </span>
            </span>
            <span className="num t-16 font-semibold text-ink max-sm:hidden">{naira(o.total)}</span>
            {pill}
          </button>
          {action}
        </div>
      </motion.li>
    );
  };

  return (
    <Page title="Sales" session={session}>
      <Card dark className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <p className="t-14 font-semibold tracking-[0.06em] text-white/60 uppercase">Handover</p>
          <p className="t-24 mt-1">{waiting.length ? `${waiting.length} paid ${waiting.length === 1 ? 'order' : 'orders'} to hand over` : 'No orders waiting'}</p>
        </div>
        <Button variant="lime" size="lg" icon={<ScanLine className="size-5" />} onClick={() => navigate('/handover')}>
          Scan buyer's code
        </Button>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5 lg:p-6">
          <SectionTitle title="Paid · hand over" count={waiting.length} />
          {waiting.length ? (
            <ul className="-mx-2 mt-2">
              <AnimatePresence initial={false}>
                {waiting.map((o) =>
                  row(
                    o,
                    <Button size="sm" variant="dark" onClick={() => navigate(`/handover/${encodeURIComponent(o.ref)}`)}>
                      Hand over
                    </Button>,
                  ),
                )}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="t-14 mt-2 text-slate">Paid orders show here at once.</p>
          )}
        </Card>
        <Card className="p-5 lg:p-6">
          <SectionTitle title="Handed over · pay out" count={toPay.length} />
          {toPay.length ? (
            <ul className="-mx-2 mt-2">
              <AnimatePresence initial={false}>
                {toPay.map((o) =>
                  row(
                    o,
                    o.payout && o.payout.status !== 'failed' ? (
                      <Pill tone="amber">With the bank</Pill>
                    ) : (
                      <Button size="sm" variant="dark" onClick={() => setPaying(o)}>
                        Pay out
                      </Button>
                    ),
                  ),
                )}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="t-14 mt-2 text-slate">Nothing to pay out.</p>
          )}
        </Card>
        <Card className="p-5 lg:col-span-2 lg:p-6">
          <SectionTitle title="Paid out" />
          <ul className="-mx-2 mt-2 lg:grid lg:grid-cols-2 lg:gap-x-4">
            {done.map((o) =>
              row(
                o,
                undefined,
                <span className="t-12 text-slate max-sm:hidden">{when(o.payout?.at)}</span>,
              ),
            )}
          </ul>
        </Card>
      </div>

      <PayoutSheet order={paying} open={!!paying} onClose={() => setPaying(null)} />
    </Page>
  );
}
