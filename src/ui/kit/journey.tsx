import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { spring } from '../../lib/motion';

export type StepState = 'done' | 'current' | 'todo';

export interface JourneyStep {
  key: string;
  label: string;
  state: StepState;
  /** "14:05" or "8 Dec". */
  time?: string;
  /** "₦129,500", "3.2 kg". Lime when it is money. */
  value?: string;
  money?: boolean;
  detail?: ReactNode;
}

/**
 * Vertical timeline. Done: solid, with time and amount. Current: lit.
 * Future: faint. Changes animate in place (layout), so after an action the
 * next stage visibly lights up.
 */
export function Journey({ steps, dark }: { steps: JourneyStep[]; dark?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const doneLine = s.state === 'done' && steps[i + 1]?.state !== 'todo';
        return (
          <motion.li key={s.key} layout={!reduced} transition={spring} className="relative flex gap-4 pb-6 last:pb-0" aria-current={s.state === 'current' ? 'step' : undefined}>
            {!last && (
              <span aria-hidden="true" className={`absolute top-8 bottom-0 left-[15px] w-0.5 rounded-full ${doneLine ? (dark ? 'bg-lime/70' : 'bg-leaf') : dark ? 'bg-white/12' : 'bg-hairline'}`} />
            )}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center">
              {s.state === 'done' ? (
                <motion.span initial={reduced ? false : { scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.3 }} className={`flex size-8 items-center justify-center rounded-full ${dark ? 'bg-lime text-forest' : 'bg-leaf text-white'}`}>
                  <Check className="size-4" strokeWidth={3} />
                </motion.span>
              ) : s.state === 'current' ? (
                <span className={`relative flex size-8 items-center justify-center rounded-full ${dark ? 'bg-white' : 'bg-forest'}`}>
                  {!reduced && <motion.span aria-hidden="true" className={`absolute inset-0 rounded-full ${dark ? 'bg-white' : 'bg-forest'}`} animate={{ scale: [1, 1.6], opacity: [0.35, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />}
                  <span className={`size-2.5 rounded-full ${dark ? 'bg-forest' : 'bg-lime'}`} />
                </span>
              ) : (
                <span className={`size-3 rounded-full ring-2 ${dark ? 'ring-white/25' : 'ring-hairline bg-white'}`} />
              )}
            </span>
            <div className={`min-w-0 flex-1 pt-1 ${s.state === 'todo' ? 'opacity-45' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className={`text-[1rem] leading-6 ${s.state === 'current' ? 'font-semibold' : 'font-medium'} ${dark ? 'text-white' : 'text-ink'}`}>{s.label}</p>
                {(s.value || s.time) && (
                  <p className="num t-14 flex items-center gap-2">
                    {s.value && <span className={s.money ? `rounded-md px-1.5 font-semibold ${dark ? 'bg-lime text-forest' : 'bg-lime text-forest'}` : `font-semibold ${dark ? 'text-white' : 'text-ink'}`}>{s.value}</span>}
                    {s.time && <span className={dark ? 'text-white/60' : 'text-slate'}>{s.time}</span>}
                  </p>
                )}
              </div>
              {s.detail && <div className={`t-14 mt-0.5 ${dark ? 'text-white/70' : 'text-slate'}`}>{s.detail}</div>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

/** Compact horizontal progress for dashboard cards: dots and labels on one line. */
export function MiniJourney({ steps, tone = 'leaf' }: { steps: { key: string; label: string; state: StepState; value?: string }[]; tone?: 'leaf' | 'teal' }) {
  const on = tone === 'teal' ? 'bg-teal' : 'bg-leaf';
  return (
    <ol className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => (
        <li key={s.key} className="relative flex flex-col items-center text-center" aria-current={s.state === 'current' ? 'step' : undefined}>
          {i > 0 && <span aria-hidden="true" className={`absolute top-[11px] right-1/2 left-[-50%] h-0.5 ${s.state !== 'todo' ? on : 'bg-hairline'}`} />}
          <span className={`relative z-10 flex size-6 items-center justify-center rounded-full ${s.state === 'done' ? `${on} text-white` : s.state === 'current' ? 'bg-white ring-2 ring-forest' : 'bg-white ring-2 ring-hairline'}`}>
            {s.state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : s.state === 'current' ? <span className="size-2 rounded-full bg-forest" /> : null}
          </span>
          <span className={`mt-1.5 px-0.5 text-[0.6875rem] leading-4 font-medium sm:text-[0.75rem] ${s.state === 'todo' ? 'text-slate/70' : 'text-ink'}`}>{s.label}</span>
          <span className="t-12 num min-h-4 font-semibold text-slate">{s.value ?? ''}</span>
        </li>
      ))}
    </ol>
  );
}
