import { ArrowDownLeft, ArrowUpRight, Leaf, Package, ScanLine, ShieldCheck, Tag, Truck, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Activity, ActivityKind, Db } from '../../../lib/api';
import { clock, naira } from '../../../lib/format';
import { spring } from '../../../lib/motion';
import { goBack } from '../../../lib/router';
import { useDb } from '../../../lib/store';
import { batchInfo, expiryWords, journeyOf, kpis, nextAction, SELLER } from '../../data';
import { CountUp, IconButton, LogoMark, Pill } from '../../kit/core';
import { Journey } from '../../kit/journey';
import { ProductPhoto } from '../../kit/media';

const ICON: Record<ActivityKind, ReactNode> = {
  added: <ScanLine className="size-6" />,
  listed: <Tag className="size-6" />,
  paid: <ArrowDownLeft className="size-6" />,
  handed_over: <Package className="size-6" />,
  donated: <Truck className="size-6" />,
  collected: <Truck className="size-6" />,
  shared: <ShieldCheck className="size-6" />,
  paid_out: <ArrowUpRight className="size-6" />,
  carbon: <Leaf className="size-6" />,
  loan: <ArrowDownLeft className="size-6" />,
};

/** The batch the room is watching: whatever the phones touched last. */
function currentBatch(db: Db) {
  for (const a of db.activity) {
    const id = a.batchId ?? (a.orderId ? db.orders.find((o) => o.id === a.orderId)?.batchId : undefined);
    const b = id && db.batches.find((x) => x.id === id && x.sellerId === SELLER);
    if (b) return batchInfo(db, b);
  }
  return nextAction(db) ?? null;
}

/** Same source and scope as the dashboard, so the room and the phones agree. */
function totals(db: Db) {
  const k = kpis(db);
  return { sold: k.recoveredThisMonth, paid: k.paidOutThisMonth, carbon: k.carbonAvoidedT, score: db.loan?.creditScore };
}

export function Live() {
  const db = useDb();
  const reduced = useReducedMotion();
  const info = useMemo(() => currentBatch(db), [db]);
  const steps = useMemo(() => (info ? journeyOf(db, info) : []), [db, info]);
  const t = useMemo(() => totals(db), [db]);
  const events = db.activity.slice(0, 7);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const i = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(i);
  }, []);

  return (
    <div className="min-h-dvh bg-night text-white">
      <div className="mx-auto flex min-h-dvh max-w-[1840px] flex-col px-6 py-6 lg:px-10 lg:py-8">
        <header className="flex items-center gap-4">
          <span className="rounded-full bg-white p-1.5">
            <LogoMark className="h-7 w-6" />
          </span>
          <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.01em]">SecondShelf · Live</h1>
          <span className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[0.9375rem] font-medium text-white/80">
            <motion.span aria-hidden="true" className="size-2 rounded-full bg-lime" animate={reduced ? undefined : { opacity: [1, 0.35, 1] }} transition={{ duration: 2.4, repeat: Infinity }} />
            Bank sandbox
          </span>
          <span className="num ml-auto text-[1.25rem] text-white/60">{clock(now.toISOString())}</span>
          <IconButton label="Close live board" tone="dark" onClick={() => goBack('/home')}>
            <X className="size-5" />
          </IconButton>
        </header>

        <div className="mt-8 grid flex-1 grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          {/* Left: the batch journey lighting up */}
          <section aria-label="Current batch" className="rounded-[24px] bg-night-2 p-6 ring-1 ring-white/8 xl:col-span-6 xl:p-8">
            {info ? (
              <>
                <div className="flex items-center gap-5">
                  <ProductPhoto product={info.product} className="size-20 xl:size-24" rounded="rounded-[18px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[1rem] font-semibold tracking-[0.08em] text-white/55 uppercase">Now</p>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p key={info.batch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={spring} className="truncate font-display text-[2.25rem] leading-tight font-semibold tracking-[-0.02em] xl:text-[2.75rem]">
                        {info.product.name}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-[1.125rem] text-white/70">
                      {info.batch.quantity} cartons · {info.status}
                    </p>
                  </div>
                  {info.batch.quantity > 0 && <Pill tone="amber">{expiryWords(info.days)}</Pill>}
                </div>
                <div className="mt-8 text-[1.125rem] [&_p]:text-[1.125rem]">
                  <Journey steps={steps} dark />
                </div>
              </>
            ) : (
              <p className="font-display text-[2rem] text-white/60">Scan a carton to start.</p>
            )}
          </section>

          {/* Right: counters + stream */}
          <div className="flex flex-col gap-6 xl:col-span-6 xl:gap-8">
            <div className="grid grid-cols-2 gap-4 xl:gap-6">
              <Counter label="Recovered this month" tone="lime" value={t.sold} format={naira} />
              <Counter label="Paid out to Ade Foods" tone="lime" value={t.paid} format={naira} />
              <Counter label="Carbon avoided" tone="teal" value={t.carbon} format={(n) => `${n.toFixed(2)} t CO₂e`} />
              <Counter label="Passport score" tone="white" value={t.score} format={(n) => String(Math.round(n))} />
            </div>

            <section aria-label="Live events" className="flex-1 rounded-[24px] bg-night-2 p-6 ring-1 ring-white/8 xl:p-8">
              <h2 className="text-[1rem] font-semibold tracking-[0.08em] text-white/55 uppercase">Happening now</h2>
              <ul className="mt-4 space-y-3" aria-live="polite">
                <AnimatePresence initial={false}>
                  {events.map((a, i) => (
                    <Event key={a.id} a={a} fresh={i === 0} />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Counter({ label, value, format, tone }: { label: string; value: number | undefined; format: (n: number) => string; tone: 'lime' | 'teal' | 'white' }) {
  const color = tone === 'lime' ? 'text-lime' : tone === 'teal' ? 'text-teal' : 'text-white';
  return (
    <div className="rounded-[24px] bg-night-2 p-6 ring-1 ring-white/8 xl:p-7">
      <p className="text-[1.0625rem] font-medium text-white/65">{label}</p>
      <p className={`num mt-3 font-display text-[2.5rem] leading-none font-semibold tracking-[-0.03em] xl:text-[3.5rem] ${color}`}>
        {value !== undefined && value > 0 ? <CountUp value={value} from={0} format={format} /> : '—'}
      </p>
    </div>
  );
}

function Event({ a, fresh }: { a: Activity; fresh: boolean }) {
  const money = a.kind === 'paid' || a.kind === 'paid_out' || a.kind === 'loan';
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={spring}
      className={`flex items-center gap-4 rounded-[18px] p-3 ${fresh ? 'bg-white/8 ring-1 ring-lime/40' : ''}`}
    >
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${a.kind === 'carbon' ? 'bg-teal/20 text-teal' : money ? 'bg-lime/15 text-lime' : 'bg-white/10 text-white'}`}>{ICON[a.kind]}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[1.25rem] leading-7 font-semibold">{a.title}</span>
        {a.detail && <span className="block truncate text-[1rem] text-white/60">{a.detail}</span>}
      </span>
      {a.amount !== undefined && <span className={`num text-[1.375rem] font-semibold ${money ? 'text-lime' : 'text-white'}`}>{naira(a.amount)}</span>}
      <span className="num w-14 text-right text-[0.9375rem] text-white/45">{clock(a.at)}</span>
    </motion.li>
  );
}
