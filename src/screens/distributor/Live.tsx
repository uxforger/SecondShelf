import { BadgeCheck, Check, Leaf, ReceiptText, ScanLine, Tag, X, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { IconButton } from '../../components/ui/Button';
import { Figure } from '../../components/ui/Feedback';
import { Logo } from '../../components/ui/Logo';
import { api, type Activity, type Session } from '../../lib/api';
import { today } from '../../lib/dates';
import { ago, naira, nairaShort, tonnes } from '../../lib/format';
import { spring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { atRisk, business, metrics } from '../../lib/selectors';
import { useDb } from '../../lib/store';


type StageKey = 'scan' | 'sell' | 'prove';

const STAGES: { key: StageKey; n: number; label: string; icon: LucideIcon; waiting: string; kinds: Activity['kind'][] }[] = [
  { key: 'scan', n: 1, label: 'Scan', icon: ScanLine, waiting: 'Waiting for a carton', kinds: ['added'] },
  { key: 'sell', n: 2, label: 'Sell', icon: Tag, waiting: 'Waiting for a listing', kinds: ['listed', 'paid', 'donated'] },
  { key: 'prove', n: 3, label: 'Prove', icon: BadgeCheck, waiting: 'Waiting for a handover', kinds: ['handed_over', 'collected', 'shared'] },
];

/**
 * Projector view. Everything on it is caused by the phones on stage:
 * the three stages fill in as they happen, money at risk falls,
 * money recovered rises, and the record grows.
 */
export function Live({ session }: { session: Session }) {
  const db = useDb();
  const [, tick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => tick((n) => n + 1), 15000);
    return () => window.clearInterval(t);
  }, []);

  const mine = useMemo(() => db.activity.filter((a) => a.businessIds.includes(session.businessId)), [db, session.businessId]);
  // Only what happened since the demo started counts as live; history stays in the record.
  const since = db.startedAt ?? new Date(Date.now() - 12 * 3600_000).toISOString();
  const live = mine.filter((a) => a.at >= since && !a.title.startsWith('Unlisted'));
  const latest = (kinds: Activity['kind'][]) => live.find((a) => kinds.includes(a.kind));
  const newest = live[0];
  const activeStage = newest ? STAGES.find((s) => s.kinds.includes(newest.kind))?.key : undefined;

  const m = useMemo(() => metrics(db, session.businessId), [db, session.businessId]);
  const risk = useMemo(() => atRisk(db, session.businessId, today()), [db, session.businessId]);
  const biz = business(db, session.businessId);
  const connected = api.connection() === 'live';

  return (
    <div className="min-h-dvh bg-deep px-5 pt-[max(20px,var(--safe-top))] pb-8 text-white md:px-10 lg:px-14">
      {/* Header */}
      <header className="flex items-center gap-4">
        <span className="rounded-full bg-offwhite px-3 py-1.5">
          <Logo size="sm" />
        </span>
        <span className="hidden text-[1.0625rem] font-medium text-white/70 md:inline">
          {biz?.name}, {biz?.area}
        </span>
        <span className="ml-auto flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[0.875rem] font-semibold">
          <span className="relative flex size-2.5">
            {connected && <span className="absolute inline-flex size-full rounded-full bg-amber opacity-70 motion-safe:animate-ping" />}
            <span className={`relative inline-flex size-2.5 rounded-full ${connected ? 'bg-amber' : 'bg-white/40'}`} />
          </span>
          {connected ? 'Live' : 'This device'}
        </span>
        <IconButton label="Exit live view" tone="dark" onClick={() => navigate('/overview', { tab: true })}>
          <X className="size-5" />
        </IconButton>
      </header>

      {/* Scan → Sell → Prove */}
      <section aria-label="Scan, sell, prove" className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        {STAGES.map((s) => (
          <StageCard key={s.key} stage={s} event={latest(s.kinds)} active={activeStage === s.key} done={!!latest(s.kinds)} />
        ))}
      </section>

      {/* Figures */}
      <section aria-label="Figures" className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        <Stat label="At risk · next 6 weeks" tone="amber">
          <Figure value={risk.value} format={naira} delta={nairaShort} className={big} />
        </Stat>
        <Stat label="Recovered">
          <Figure value={m.moneyRecovered} format={naira} delta={nairaShort} className={big} />
        </Stat>
        <Stat label="CO₂e avoided" note={m.co2ePending > 0.0005 ? 'Estimate until handover' : 'Verified · VM0046'}>
          <Figure value={m.co2eVerified} format={(n) => tonnes(n, 2)} delta={(n) => tonnes(n, 2)} className={big} />
        </Stat>
        <Stat label="Passport · 90 days">
          <Figure value={m.verifiedSales90} format={naira} delta={nairaShort} className={big} />
        </Stat>
      </section>

      {/* Record */}
      <section aria-label="Record" className="mt-5 rounded-[28px] bg-white/[0.06] p-5 ring-1 ring-white/10 lg:p-6">
        <h2 className="text-[0.875rem] font-semibold uppercase tracking-[0.08em] text-white/60">Record</h2>
        <ul className="mt-2" aria-live="polite">
          <AnimatePresence initial={false}>
            {mine.slice(0, 5).map((a) => (
              <motion.li
                key={a.id}
                layout="position"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="flex items-center gap-4 border-b border-white/10 py-3 last:border-0"
              >
                <span className="min-w-0 flex-1 truncate text-[1.0625rem] font-medium">
                  {a.title}
                  {a.detail && <span className="text-white/60"> · {a.detail}</span>}
                </span>
                {a.amount !== undefined && <span className="num text-[1.0625rem] font-semibold text-amber">{naira(a.amount)}</span>}
                <span className="num w-20 shrink-0 text-right text-[0.875rem] text-white/50">{ago(a.at)}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </div>
  );
}

const big = 'text-[2rem] font-semibold leading-[2.5rem] tracking-[-0.02em] lg:text-[2.75rem] lg:leading-[3.25rem]';

function Stat({ label, note, tone, children }: { label: string; note?: string; tone?: 'amber'; children: React.ReactNode }) {
  return (
    <div className={`rounded-[28px] p-5 ring-1 lg:p-6 ${tone === 'amber' ? 'bg-amber/12 ring-amber/30' : 'bg-white/[0.06] ring-white/10'}`}>
      <p className={`text-[0.9375rem] font-medium ${tone === 'amber' ? 'text-amber' : 'text-white/70'}`}>{label}</p>
      <div className="mt-1">{children}</div>
      {note && <p className="mt-1 text-[0.8125rem] text-white/50">{note}</p>}
    </div>
  );
}

const KIND_ICON: Partial<Record<Activity['kind'], LucideIcon>> = { paid: ReceiptText, collected: Leaf };

function StageCard({ stage, event, active, done }: { stage: (typeof STAGES)[number]; event?: Activity; active: boolean; done: boolean }) {
  const Icon = (event && KIND_ICON[event.kind]) || stage.icon;
  return (
    <motion.div
      animate={{ opacity: done ? 1 : 0.55 }}
      transition={spring}
      className={`relative min-h-[188px] overflow-hidden rounded-[28px] p-5 ring-1 transition-shadow duration-300 lg:p-6 ${
        active ? 'bg-white/[0.1] ring-2 ring-amber shadow-[0_0_0_6px_rgba(245,181,40,0.12)]' : 'bg-white/[0.06] ring-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`flex size-11 items-center justify-center rounded-full ${done ? 'bg-amber text-deep' : 'bg-white/10 text-white/70'}`}>
          <AnimatePresence mode="popLayout" initial={false}>
            {done ? (
              <motion.span key="done" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
                <Check className="size-6" />
              </motion.span>
            ) : (
              <motion.span key="n" className="text-[1.125rem] font-semibold">
                {stage.n}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="text-[1.25rem] font-semibold">{stage.label}</span>
        {active && (
          <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={spring} className="ml-auto rounded-full bg-amber px-3 py-1 text-[0.8125rem] font-semibold text-deep">
            Now
          </motion.span>
        )}
      </div>

      <div className="mt-5">
        <AnimatePresence mode="popLayout" initial={false}>
          {event ? (
            <motion.div key={event.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={spring}>
              <p className="flex items-start gap-2 text-[1.5rem] font-semibold leading-8 tracking-[-0.01em] lg:text-[1.75rem] lg:leading-9">
                <Icon className="mt-1 size-6 shrink-0 text-amber" aria-hidden="true" />
                <span className="line-clamp-2 min-w-0">{event.title}</span>
              </p>
              {event.detail && <p className="num mt-1 truncate text-[1.0625rem] text-white/70">{event.detail}</p>}
              <p className="num mt-2 flex items-center gap-3 text-[0.9375rem] text-white/50">
                {event.amount !== undefined && <span className="font-semibold text-amber">{naira(event.amount)}</span>}
                {ago(event.at)}
              </p>
            </motion.div>
          ) : (
            <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[1.25rem] text-white/50">
              {stage.waiting}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
