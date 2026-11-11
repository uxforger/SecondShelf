import { ChevronRight, Store } from 'lucide-react';
import { useMemo } from 'react';
import type { Session } from '../../../lib/api';
import { today } from '../../../lib/dates';
import { naira } from '../../../lib/format';
import { navigate } from '../../../lib/router';
import { offers, product } from '../../../lib/selectors';
import { useDb } from '../../../lib/store';
import { buyerNumbers, when } from '../../data';
import { Button, Card, Pill, SectionTitle, Tap } from '../../kit/core';
import { ProductPhoto } from '../../kit/media';
import { Page } from '../../shell';
import { OfferCard, orderStatus } from './parts';

export function BuyerHome({ session }: { session: Session }) {
  const db = useDb();
  const n = useMemo(() => buyerNumbers(db), [db]);
  const list = useMemo(() => offers(db, today()), [db]);
  const recent = n.orders.slice(0, 4);

  return (
    <Page title={`Hello, ${session.name}`} session={session}>
      {/* Hero: savings */}
      <Card dark className="p-6 lg:p-8">
        <p className="t-14 font-semibold tracking-[0.06em] text-white/60 uppercase">This month</p>
        {n.saved > 0 ? (
          <p className="mt-2 font-display text-[2rem] leading-tight font-semibold tracking-[-0.02em] sm:text-[2.5rem]">
            You saved <span className="num rounded-lg bg-lime px-2 text-forest">{naira(n.saved)}</span>
          </p>
        ) : (
          <>
            <p className="t-32 mt-2">You saved —</p>
            <p className="t-16 mt-1 text-white/70">Buy an offer to start saving.</p>
          </>
        )}
        <p className="t-14 mt-2 text-white/60">Paid versus full shelf price</p>
        <Button variant="lime" size="lg" className="mt-6" icon={<Store className="size-5" />} onClick={() => navigate('/shop', { tab: true })}>
          See offers
        </Button>
      </Card>

      {/* Offers */}
      <div className="mt-8">
        <SectionTitle
          title="Offers near you"
          count={list.length}
          action={
            <button type="button" onClick={() => navigate('/shop', { tab: true })} className="t-14 flex h-10 items-center gap-0.5 rounded-full px-2 font-semibold text-forest hover:bg-forest/[0.05]">
              All offers <ChevronRight className="size-4" />
            </button>
          }
        />
        {list.length ? (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {list.slice(0, 3).map((v) => (
              <OfferCard key={v.batch.id} v={v} db={db} big />
            ))}
          </div>
        ) : (
          <p className="t-16 mt-2 text-slate">No offers right now. New ones show here first.</p>
        )}
      </div>

      {/* Orders + spend */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="p-5 lg:col-span-2 lg:p-6">
          <SectionTitle title="My orders" count={n.orders.length} />
          {recent.length ? (
            <ul className="-mx-2 mt-2">
              {recent.map((o) => {
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
                      <Pill tone={s.tone}>{s.label}</Pill>
                    </Tap>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="t-16 mt-2 text-slate">— No orders yet</p>
          )}
        </Card>
        <Card className="flex flex-col p-5 lg:p-6">
          <p className="t-14 font-medium text-slate">Spent this month</p>
          <p className="num mt-2 font-display text-[2rem] leading-none font-semibold tracking-[-0.025em] text-ink">{n.spent > 0 ? naira(n.spent) : '—'}</p>
          <p className="t-14 mt-2 text-slate">{n.spent > 0 ? 'Paid by bank, verified' : 'Your first order shows here'}</p>
        </Card>
      </div>
    </Page>
  );
}
