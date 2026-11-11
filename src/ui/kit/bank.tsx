import { AlertCircle, Check, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { spring } from '../../lib/motion';
import { useSimulatedBank } from '../mode';
import { Button, Pill, Spinner, type Tone } from './core';

/**
 * Every bank moment looks the same: shield, "Bank sandbox", a monospace
 * reference and a status pill.
 */
export function BankCard({
  title,
  reference,
  status,
  tone = 'neutral',
  children,
  className = '',
}: {
  title: string;
  reference?: string;
  status?: string;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}) {
  const simulated = useSimulatedBank();
  return (
    <div className={`rounded-[16px] bg-white p-4 ring-1 ${simulated ? 'ring-amber' : 'ring-hairline'} ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          {simulated ? (
            <p className="t-12 font-semibold tracking-[0.06em] text-amber-ink uppercase">Simulated bank · demo mode · not a real transfer</p>
          ) : (
            <p className="t-12 font-semibold tracking-[0.06em] text-slate uppercase">Bank sandbox</p>
          )}
          <p className="truncate text-[1rem] leading-6 font-semibold text-ink">{title}</p>
          {reference && <p className="mono mt-0.5 truncate text-slate">{reference}</p>}
        </div>
        {status && <Pill tone={tone}>{status}</Pill>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export interface ProcessStep {
  label: string;
}

/**
 * Stepped progress for anything the bank does that takes over 400 ms.
 * `current` = index of the step running now; steps before it are done.
 * `current >= steps.length` means all done.
 */
export function BankProcess({ steps, current, error, onRetry }: { steps: ProcessStep[]; current: number; error?: string | null; onRetry?: () => void }) {
  return (
    <div>
      <ol className="space-y-3" aria-live="polite">
        {steps.map((s, i) => {
          const done = i < current;
          const now = i === current && !error;
          const failed = i === current && !!error;
          return (
            <li key={s.label} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  {done ? (
                    <motion.span key="d" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.3 }} className="flex size-7 items-center justify-center rounded-full bg-leaf text-white">
                      <Check className="size-4" strokeWidth={3} />
                    </motion.span>
                  ) : failed ? (
                    <motion.span key="f" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={spring} className="text-coral">
                      <AlertCircle className="size-7" />
                    </motion.span>
                  ) : now ? (
                    <motion.span key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-forest">
                      <Spinner className="size-6" />
                    </motion.span>
                  ) : (
                    <motion.span key="t" className="size-2.5 rounded-full bg-hairline" />
                  )}
                </AnimatePresence>
              </span>
              <span className={`text-[1rem] leading-6 ${done ? 'text-ink' : now ? 'font-semibold text-ink' : failed ? 'font-semibold text-coral-ink' : 'text-slate/70'}`}>{s.label}</span>
            </li>
          );
        })}
      </ol>
      {error && (
        <div className="mt-4 rounded-[14px] bg-coral-tint p-3" role="alert">
          <p className="t-14 font-medium text-coral-ink">{error}</p>
          {onRetry && (
            <Button size="sm" variant="secondary" className="mt-2" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
