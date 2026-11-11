import { Banknote, Landmark, Leaf, ScanLine, ShieldCheck, ShoppingBasket, Store, Tag } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { spring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { Button, Logo, Reveal } from '../kit/core';
import { MarketPhoto } from '../kit/media';

const STEPS: { icon: ReactNode; title: string; line: string }[] = [
  { icon: <ScanLine className="size-6" />, title: 'Scan', line: 'Scan a carton. We track its expiry date.' },
  { icon: <Tag className="size-6" />, title: 'Sell', line: 'List it at a fair discount. Buyers nearby pay by bank.' },
  { icon: <ShieldCheck className="size-6" />, title: 'Prove', line: 'Every sale builds a bank-verified record and carbon credits.' },
];

const AUDIENCES: { icon: ReactNode; who: string; what: string; line: string }[] = [
  { icon: <Store className="size-6" />, who: 'Distributors', what: 'Recover money', line: 'Sell short-dated stock before it turns to waste.' },
  { icon: <ShoppingBasket className="size-6" />, who: 'Buyers', what: 'Save on food', line: 'Canteens and shops buy good food for less.' },
  { icon: <Landmark className="size-6" />, who: 'Banks', what: 'Verified trading records', line: 'Lend on sales the bank has already seen.' },
];

const IMPACT: { value: ReactNode; label: string; source: string }[] = [
  {
    value: (
      <>
        ₦2,600 <span className="text-white/50">→</span> ₦800
      </>
    ),
    label: 'A carton at a market fire sale',
    source: 'Pitch research · Lagos market, cream crackers',
  },
  { value: '34.4%', label: 'Lagos food inflation', source: 'NBS state CPI · September 2026' },
  { value: '~1.9 t', label: 'CO₂e avoided per tonne saved', source: 'VM0046 method · dry packaged food' },
];

export function Landing() {
  const reduced = useReducedMotion();
  const hero = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '12%']);

  return (
    <div className="min-h-dvh bg-paper">
      {/* Hero */}
      <div ref={hero} className="relative isolate flex min-h-[min(92dvh,860px)] flex-col overflow-hidden bg-forest text-white">
        <motion.div className="absolute inset-0 -z-10" style={{ y: photoY }}>
          <MarketPhoto which="vendor" eager alt="A vendor at a Lagos street market" className="h-[112%] w-full" focus="60% 50%" />
        </motion.div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,35,27,0.55)_0%,rgba(7,35,27,0.25)_35%,rgba(7,35,27,0.88)_100%)]" />

        <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 pt-[max(16px,var(--safe-top))] sm:px-6">
          <Logo tone="light" />
          <Button variant="onDark" size="sm" onClick={() => navigate('/signin')}>
            Sign in
          </Button>
        </header>

        <div className="mx-auto mt-auto w-full max-w-[1200px] px-4 pb-14 sm:px-6 lg:pb-20">
          <motion.h1
            initial={{ opacity: 0, y: reduced ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.05 }}
            className="font-display text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.035em] sm:text-[4rem] lg:text-[5.25rem]"
          >
            Sell it before
            <br />
            it expires.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.15 }} className="mt-4 max-w-[30ch] text-[1.125rem] leading-7 text-white/85 sm:text-[1.25rem]">
            Lagos distributors sell short-dated food to nearby buyers, paid by bank.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.25 }} className="mt-8 flex flex-wrap gap-3">
            <Button variant="lime" size="lg" onClick={() => navigate('/signin?new=1')}>
              Get started
            </Button>
            <Button variant="onDark" size="lg" onClick={() => navigate('/signin')}>
              Sign in
            </Button>
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <section aria-labelledby="how" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <p className="t-14 font-semibold tracking-[0.08em] text-leaf uppercase">How it works</p>
          <h2 id="how" className="t-32 mt-2 text-ink lg:t-40">
            Scan. Sell. Prove.
          </h2>
        </Reveal>
        <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.08} className="h-full">
                <div className="flex h-full flex-col rounded-[16px] bg-white p-6 shadow-card ring-1 ring-hairline">
                  <span className="flex size-12 items-center justify-center rounded-full bg-leaf-tint text-forest">{s.icon}</span>
                  <p className="t-12 num mt-6 font-semibold text-slate">0{i + 1}</p>
                  <h3 className="t-24 text-ink">{s.title}</h3>
                  <p className="t-16 mt-1 text-slate">{s.line}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Audiences */}
      <section aria-labelledby="who" className="bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <h2 id="who" className="t-32 text-ink lg:t-40">
              One sale. Three wins.
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {AUDIENCES.map((a, i) => (
              <Reveal key={a.who} delay={i * 0.08} className="h-full">
                <div className="flex h-full flex-col rounded-[16px] bg-paper p-6 ring-1 ring-hairline">
                  <span className="flex size-12 items-center justify-center rounded-full bg-forest text-lime">{a.icon}</span>
                  <p className="t-14 mt-6 font-semibold text-slate">{a.who}</p>
                  <h3 className="t-24 text-ink">{a.what}</h3>
                  <p className="t-16 mt-1 text-slate">{a.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section aria-labelledby="impact" className="bg-forest text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="impact" className="sr-only">
            Why it matters
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
            {IMPACT.map((m, i) => (
              <Reveal key={m.label} delay={i * 0.08}>
                <p className="num font-display text-[2.5rem] leading-none font-semibold tracking-[-0.03em] text-lime lg:text-[3.25rem]">{m.value}</p>
                <p className="t-16 mt-3 font-medium text-white">{m.label}</p>
                <p className="t-12 mt-1 text-white/55">{m.source}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
            <span className="flex items-center gap-2 text-[0.9375rem] text-white/75">
              <Banknote className="size-5 text-lime" /> Bank-verified payments
            </span>
            <span className="text-white/25">·</span>
            <span className="flex items-center gap-2 text-[0.9375rem] text-white/75">
              <Leaf className="size-5 text-teal" /> Registry carbon credits
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-10 pb-[max(40px,var(--safe-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="t-14 mt-2 text-slate">Sell it before it expires.</p>
        </div>
        <div className="t-14 flex flex-wrap items-center gap-x-4 gap-y-2 text-slate">
          <span className="rounded-full bg-sunken px-3 py-1 font-medium">Bank sandbox demo</span>
          <button type="button" onClick={() => navigate('/credits')} className="min-h-10 underline underline-offset-4 hover:text-ink">
            Photo credits
          </button>
        </div>
      </footer>
    </div>
  );
}
