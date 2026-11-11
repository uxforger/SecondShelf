import { ArrowDownLeft, ArrowUpRight, ChevronRight, Landmark, Leaf, ScanLine, ShieldCheck } from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { Session } from '../../../lib/api';
import { naira, tonnes } from '../../../lib/format';
import { spring } from '../../../lib/motion';
import { navigate } from '../../../lib/router';
import { useDb } from '../../../lib/store';
import { ListSheet, PayoutSheet } from '../../actions';
import { carbonJourney, expiryWords, kpis, ledger, needsAction, nextAction, passport, when, type BatchInfo, type LedgerEvent } from '../../data';
import { Button, Card, Pill, SectionTitle, Tap } from '../../kit/core';
import { MiniJourney } from '../../kit/journey';
import { ProductPhoto } from '../../kit/media';
import { Page } from '../../shell';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function Home({ session }: { session: Session }) {
  const db = useDb();
  const hero = useMemo(() => nextAction(db), [db]);
  // The hero batch is not repeated in the list below it.
  const todo = useMemo(() => needsAction(db).filter((b) => b.batch.id !== hero?.batch.id), [db, hero]);
  const k = useMemo(() => kpis(db), [db]);
  const events = useMemo(() => ledger(db).slice(0, 4), [db]);
  const pass = useMemo(() => passport(db), [db]);
  const carbon = useMemo(() => carbonJourney(db), [db]);
  const [listing, setListing] = useState<BatchInfo | null>(null);
  const [paying, setPaying] = useState<BatchInfo | null>(null);

  const act = (b: BatchInfo) => {
    if (b.next.kind === 'list') return setListing(b);
    if (b.next.kind === 'payout') return setPaying(b);
    if (b.next.kind === 'handover') return navigate(`/handover/${encodeURIComponent(b.next.order.ref)}`);
    navigate(`/batch/${b.batch.id}`);
  };

  return (
    <Page title={`${greeting()}, ${session.name}`} session={session}>
      <LayoutGroup>
        {/* Row 1: the one next action */}
        <motion.div layout transition={spring}>
          {hero ? (
            <Card dark className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]">
                <div className="p-5 sm:p-6 lg:p-8">
                  <Pill tone="amber">{expiryWords(hero.days)}</Pill>
                  <p className="t-14 mt-4 font-semibold tracking-[0.06em] text-white/60 uppercase">Next action</p>
                  <button type="button" onClick={() => navigate(`/batch/${hero.batch.id}`)} className="t-32 mt-1 text-left text-white underline-offset-4 hover:underline lg:t-40">
                    {hero.product.name}
                  </button>
                  <p className="t-16 num mt-1 text-white/75">
                    {hero.batch.quantity} cartons · <span className="rounded-md bg-lime px-1.5 font-semibold text-forest">{naira(hero.value)}</span> at risk
                  </p>
                  <Button variant="lime" size="lg" className="mt-6" onClick={() => setListing(hero)}>
                    List it
                  </Button>
                </div>
                <ProductPhoto product={hero.product} layoutId={`photo-${hero.batch.id}`} rounded="rounded-none" className="h-28 w-full sm:h-40 md:h-full" eager />
              </div>
            </Card>
          ) : (
            <Card dark className="p-6 lg:p-8">
              <p className="t-14 font-semibold tracking-[0.06em] text-white/60 uppercase">Next action</p>
              <p className="t-32 mt-1 text-white">All short-dated stock is listed</p>
              <Button variant="lime" size="lg" className="mt-6" icon={<ScanLine className="size-5" />} onClick={() => navigate('/scan', { tab: true })}>
                Scan new stock
              </Button>
            </Card>
          )}
        </motion.div>

        {/* Row 2: three KPIs */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
          <Kpi label="Recovered this month" value={k.recoveredThisMonth > 0 ? naira(k.recoveredThisMonth) : null} hint="List a batch to start" money />
          <Kpi label="Sold before expiry" value={k.soldBeforeExpiryPct > 0 ? `${Math.round(k.soldBeforeExpiryPct)}%` : null} hint="Sell one batch to see this" />
          <Kpi label="Carbon avoided" value={k.carbonAvoidedT > 0 ? `${tonnes(k.carbonAvoidedT, 2)} CO₂e` : null} hint="Hand over a sale to count it" carbon />
        </div>

        {/* Row 3: needs action + money */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <Card className="p-5 lg:col-span-2 lg:p-6">
            <SectionTitle title="Needs action" count={todo.length} action={<LinkButton onClick={() => navigate('/stock', { tab: true })}>All stock</LinkButton>} />
            {todo.length ? (
              <ul className="-mx-2 mt-2">
                {todo.map((b) => (
                  <motion.li key={b.batch.id} layout transition={spring}>
                    <div className="flex items-center gap-3 rounded-[12px] px-2 py-2.5 hover:bg-paper">
                      <button type="button" onClick={() => navigate(`/batch/${b.batch.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <ProductPhoto product={b.product} layoutId={`photo-${b.batch.id}`} className="size-12" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[1rem] font-semibold text-ink">{b.product.name}</span>
                          <span className="t-14 num block truncate text-slate">
                            {b.next.kind === 'handover' || b.next.kind === 'payout' ? `${b.next.order.qty} cartons · ${b.next.order.ref}` : `${b.batch.quantity} cartons`}
                          </span>
                        </span>
                        {b.next.kind === 'list' ? <Pill tone="amber" className="max-sm:hidden">{expiryWords(b.days)}</Pill> : <Pill tone="lime" className="max-sm:hidden">{b.next.kind === 'handover' ? 'Paid' : 'Handed over'}</Pill>}
                      </button>
                      <Button size="sm" variant={b.next.kind === 'list' ? 'primary' : 'dark'} onClick={() => act(b)}>
                        {b.next.kind === 'payout' ? 'Pay out' : b.next.kind === 'handover' ? 'Hand over' : b.next.label}
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="t-16 mt-3 text-slate">Nothing waiting. Scan new stock when it arrives.</p>
            )}
          </Card>

          <Card className="p-5 lg:p-6">
            <SectionTitle title="Money" action={<LinkButton onClick={() => navigate('/money', { tab: true })}>Ledger</LinkButton>} />
            {events.length ? (
              <ul className="-mx-2 mt-2">
                {events.map((e) => (
                  <li key={e.id}>
                    <LedgerRow e={e} compact />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="t-16 mt-3 text-slate">— No bank events yet</p>
            )}
          </Card>
        </div>

        {/* Row 4: passport + carbon */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
          <Card className="flex flex-col p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="t-20 flex items-center gap-2 text-ink">
                <ShieldCheck className="size-5 text-leaf" /> Passport
              </h2>
              {pass.shared ? <Pill tone="leaf">Bank-verified</Pill> : <Pill>Not shared</Pill>}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="t-14 text-slate">Verified sales · 90 days</dt>
                <dd className="num t-24 mt-0.5 text-ink">{pass.verifiedSales90 > 0 ? naira(pass.verifiedSales90) : '—'}</dd>
              </div>
              <div>
                <dt className="t-14 text-slate">Credit score</dt>
                <dd className="num t-24 mt-0.5 text-ink">{pass.score ?? '—'}</dd>
                {!pass.score && <p className="t-12 text-slate">Shown after a loan check</p>}
              </div>
            </dl>
            <Button className="mt-auto self-start" variant="secondary" icon={<Landmark className="size-5" />} onClick={() => navigate('/passport')}>
              {pass.loan?.status === 'disbursed' ? 'See loan' : 'See loan offer'}
            </Button>
          </Card>

          <Card className="flex flex-col p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="t-20 flex items-center gap-2 text-ink">
                <Leaf className="size-5 text-teal" /> Carbon
              </h2>
              {carbon.sub ? (
                <Pill tone={carbon.paid ? 'leaf' : carbon.sub.status === 'verified' ? 'teal' : 'amber'}>{carbon.paid ? 'Paid' : carbon.ret ? 'Retired' : carbon.sub.status === 'verified' ? 'Verified' : 'Under review'}</Pill>
              ) : (
                <Pill>Not reported</Pill>
              )}
            </div>
            <div className="mt-5">
              <MiniJourney tone="teal" steps={carbon.steps} />
            </div>
            <p className="t-14 mt-3 text-slate">Forge Carbon Registry · sandbox</p>
            <Button className="mt-4 self-start" variant="secondary" icon={<Leaf className="size-5" />} onClick={() => navigate('/carbon')}>
              {carbon.sub ? 'Open carbon' : 'Report carbon'}
            </Button>
          </Card>
        </div>
      </LayoutGroup>

      <ListSheet info={listing} open={!!listing} onClose={() => setListing(null)} onDone={() => listing && navigate(`/batch/${listing.batch.id}`)} />
      <PayoutSheet order={paying?.next.kind === 'payout' ? paying.next.order : null} open={!!paying} onClose={() => setPaying(null)} />
    </Page>
  );
}

function Kpi({ label, value, hint, money, carbon }: { label: string; value: string | null; hint: string; money?: boolean; carbon?: boolean }) {
  return (
    <Card className="flex h-full flex-col p-5 lg:p-6">
      <p className="t-14 font-medium text-slate">{label}</p>
      {value ? (
        <p className="num mt-2 font-display text-[2rem] leading-none font-semibold tracking-[-0.025em] text-ink">
          <span className={money ? 'rounded-lg bg-lime px-1.5' : carbon ? 'text-teal-ink' : ''}>{value}</span>
        </p>
      ) : (
        <>
          <p className="t-32 mt-2 text-slate/60">—</p>
          <p className="t-14 mt-1 text-slate">{hint}</p>
        </>
      )}
    </Card>
  );
}

export function LedgerRow({ e, compact }: { e: LedgerEvent; compact?: boolean }) {
  const inflow = e.kind === 'in' || e.kind === 'loan';
  return (
    <Tap onClick={() => navigate(e.to)} className="flex items-center gap-3 rounded-[12px] px-2 py-2.5 hover:bg-paper">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${e.kind === 'carbon' ? 'bg-teal-tint text-teal-ink' : inflow ? 'bg-lime-tint text-forest' : e.kind === 'consent' ? 'bg-sunken text-forest' : 'bg-leaf-tint text-forest'}`}>
        {e.kind === 'consent' ? <ShieldCheck className="size-5" /> : e.kind === 'carbon' ? <Leaf className="size-5" /> : inflow ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[0.9375rem] font-semibold text-ink">{e.title}</span>
          {e.note && <Pill tone={e.note === 'Paid out' ? 'leaf' : 'lime'} dot={false} className="!h-6 !px-2 !text-[0.75rem]">{e.note}</Pill>}
        </span>
        <span className="mono block truncate text-slate">
          {e.reference}
          {!compact && ` · ${when(e.at)}`}
        </span>
      </span>
      <span className="text-right">
        {e.amount !== undefined && <span className="num block text-[0.9375rem] font-semibold text-ink">{naira(e.amount)}</span>}
        {compact && <span className="t-12 block text-slate">{when(e.at)}</span>}
      </span>
      {!compact && <ChevronRight className="size-5 text-slate" />}
    </Tap>
  );
}

function LinkButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="t-14 flex h-10 items-center gap-0.5 rounded-full px-2 font-semibold text-forest hover:bg-forest/[0.05]">
      {children}
      <ChevronRight className="size-4" />
    </button>
  );
}
