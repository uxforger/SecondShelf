import { useMemo } from 'react';
import type { Session } from '../../../lib/api';
import { naira } from '../../../lib/format';
import { navigate } from '../../../lib/router';
import { business, product } from '../../../lib/selectors';
import { useDb } from '../../../lib/store';
import { buyerNumbers, when } from '../../data';
import { BankCard } from '../../kit/bank';
import { Button, Card, Pill, SectionTitle, Tap } from '../../kit/core';
import { Journey } from '../../kit/journey';
import { ProductPhoto } from '../../kit/media';
import { QrCode } from '../../kit/qr';
import { Page } from '../../shell';
import { orderStatus } from './parts';

export function Orders({ session }: { session: Session }) {
  const db = useDb();
  const { orders } = useMemo(() => buyerNumbers(db), [db]);
  const ready = orders.filter((o) => o.status === 'paid');
  const done = orders.filter((o) => o.status === 'handed_over');
  const group = (title: string, list: typeof orders, empty: string) => (
    <Card className="p-5 lg:p-6">
      <SectionTitle title={title} count={list.length} />
      {list.length ? (
        <ul className="-mx-2 mt-2">
          {list.map((o) => {
            const p = product(db, o.productId);
            const s = orderStatus(o);
            return (
              <li key={o.id}>
                <Tap onClick={() => navigate(`/orders/${o.id}`)} className="flex items-center gap-3 rounded-[12px] px-2 py-2.5 hover:bg-paper">
                  {p && <ProductPhoto product={p} className="size-12" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[1rem] font-semibold text-ink">{p?.name}</span>
                    <span className="mono block truncate text-slate">
                      {o.ref} · {when(o.paidAt)}
                    </span>
                  </span>
                  <span className="num t-16 font-semibold text-ink max-sm:hidden">{naira(o.total)}</span>
                  <Pill tone={s.tone}>{s.label}</Pill>
                </Tap>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="t-14 mt-2 text-slate">{empty}</p>
      )}
    </Card>
  );
  return (
    <Page title="Orders" session={session}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {group('Ready to collect', ready, 'Paid orders wait here.')}
        {group('Collected', done, 'Nothing collected yet.')}
      </div>
    </Page>
  );
}

export function OrderDetail({ id, session }: { id: string; session: Session }) {
  const db = useDb();
  const o = db.orders.find((x) => x.id === id);
  if (!o) {
    return (
      <Page title="Order" back="/orders" session={session}>
        <p className="t-16 text-slate">Order not found.</p>
      </Page>
    );
  }
  const p = product(db, o.productId);
  const seller = business(db, o.sellerId);
  const collected = o.status === 'handed_over';
  return (
    <Page title={p?.name ?? 'Order'} back="/orders" session={session}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          {!collected ? (
            <Card className="flex flex-col items-center p-6 text-center">
              <QrCode value={o.ref} size={220} label={`Handover code ${o.ref}`} />
              <p className="t-20 mt-4 text-ink">Show this at {o.fulfilment === 'pickup' ? 'pickup' : 'delivery'}</p>
              <p className="mono mt-1 text-slate">{o.ref}</p>
            </Card>
          ) : (
            <Card className="flex items-center gap-4 p-5">
              {p && <ProductPhoto product={p} className="size-16" />}
              <div>
                <p className="t-20 text-ink">Collected</p>
                <p className="t-14 text-slate">{when(o.handedOverAt)}</p>
              </div>
            </Card>
          )}
          <BankCard title="Payment verified" reference={o.ref} status="Paid" tone="lime">
            <p className="num t-24 text-ink">{naira(o.total)}</p>
            <p className="t-14 text-slate">
              {o.qty} cartons × {naira(o.unitPrice)}
              {o.deliveryFee > 0 && ` + delivery ${naira(o.deliveryFee)}`}
            </p>
          </BankCard>
        </div>
        <Card className="p-5 lg:col-span-7 lg:p-6">
          <h2 className="t-20 mb-5 text-ink">Journey</h2>
          <Journey
            steps={[
              { key: 'paid', label: 'Paid', state: 'done', time: when(o.paidAt), detail: 'Bank verified' },
              { key: 'ready', label: `Ready at ${seller?.name ?? 'seller'}`, state: 'done', detail: `${seller?.area ?? ''} · ${o.fulfilment === 'pickup' ? 'pick up' : 'delivery'}` },
              { key: 'collected', label: 'Collected', state: collected ? 'done' : 'current', time: when(o.handedOverAt), detail: collected ? 'QR code confirmed' : 'Show your code to the seller' },
            ]}
          />
          <Button variant="secondary" size="lg" block className="mt-6" onClick={() => navigate('/shop', { tab: true })}>
            More offers
          </Button>
        </Card>
      </div>
    </Page>
  );
}
