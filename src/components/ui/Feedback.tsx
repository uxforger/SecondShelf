import { AlertCircle, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { spring } from '../../lib/motion';
import { dismissToast, useToasts } from '../../lib/store';
import { Spinner } from './Button';

/* ---------------- Toasts ---------------- */

export function Toasts({ aboveTabBar }: { aboveTabBar: boolean }) {
  const toasts = useToasts();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end ${
        aboveTabBar ? 'bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+12px)]' : 'bottom-[calc(var(--safe-bottom)+16px)]'
      }`}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={spring}
            onClick={() => dismissToast(t.id)}
            className={`pointer-events-auto flex max-w-[420px] cursor-default items-center gap-2.5 rounded-full bg-deep py-2.5 pl-3 text-left text-[0.9375rem] font-medium leading-5 text-white shadow-sheet ${t.action ? 'pr-2' : 'pr-5'}`}
          >
            <span
              aria-hidden="true"
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${t.tone === 'error' ? 'bg-[#e8774a]' : 'bg-green'}`}
            >
              {t.tone === 'error' ? <AlertCircle className="size-4" /> : <Check className="size-4" />}
            </span>
            {t.text}
            {t.action && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(t.id);
                  t.action!.run();
                }}
                className="ml-1 h-9 rounded-full bg-white/12 px-4 font-semibold text-amber hover:bg-white/20"
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Skeleton ---------------- */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-[12px] bg-sunken ${className}`} />;
}

/* ---------------- Progress steps ---------------- */

export interface Step {
  label: string;
}

/**
 * Vertical list of stages. `current` is the index in progress;
 * `current === steps.length` means all done.
 */
export function ProgressSteps({ steps, current, failed }: { steps: Step[]; current: number; failed?: boolean }) {
  const live = current >= steps.length ? steps[steps.length - 1].label : steps[current]?.label;
  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {failed ? 'Failed' : live}
      </p>
      <ol className="space-y-1">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const state = failed && active ? 'failed' : done ? 'done' : active ? 'active' : 'waiting';
          return (
            <motion.li
              key={s.label}
              initial={false}
              animate={{ opacity: state === 'waiting' ? 0.45 : 1 }}
              transition={spring}
              className="flex h-12 items-center gap-3"
            >
              <span className="relative flex size-7 items-center justify-center">
                <AnimatePresence initial={false} mode="popLayout">
                  {state === 'done' ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={spring}
                      className="flex size-7 items-center justify-center rounded-full bg-green text-white"
                    >
                      <DrawnCheck className="size-4" />
                    </motion.span>
                  ) : state === 'active' ? (
                    <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-deep">
                      <Spinner className="size-6" />
                    </motion.span>
                  ) : state === 'failed' ? (
                    <motion.span key="failed" initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="flex size-7 items-center justify-center rounded-full bg-danger text-white">
                      <AlertCircle className="size-4" />
                    </motion.span>
                  ) : (
                    <motion.span key="wait" className="size-6 rounded-full ring-2 ring-inset ring-deep/15" />
                  )}
                </AnimatePresence>
              </span>
              <span className={`text-[1rem] leading-6 ${state === 'waiting' ? 'text-muted' : 'font-medium text-deep'}`}>{s.label}</span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- Checks ---------------- */

export function DrawnCheck({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1], delay }}
      />
    </svg>
  );
}

/** Large success mark: the circle settles with a spring, then the check draws on. */
export function SuccessMark({ size = 96 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', visualDuration: 0.4, bounce: 0 }}
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-green text-white shadow-card"
    >
      <DrawnCheck className="size-1/2" delay={0.18} />
    </motion.div>
  );
}

/* ---------------- Empty state ---------------- */

export function EmptyState({ icon, title, line, action }: { icon: ReactNode; title: string; line?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-mint text-deep">{icon}</div>
      <p className="t-heading text-deep">{title}</p>
      {line && <p className="t-body mt-1 max-w-[280px] text-muted">{line}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- Figure ---------------- */

/**
 * A number shown exactly as it is. No counting. When it changes live,
 * it swaps instantly and (optionally) shows a small "+₦19,500" chip for a
 * few seconds so people looking at the screen notice what moved.
 */
export function Figure({
  value,
  format,
  className = '',
  delta,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  /** Show the change as a chip, formatted with this (e.g. naira). */
  delta?: (n: number) => string;
}) {
  const prev = useRef(value);
  const [change, setChange] = useState<{ id: number; by: number } | null>(null);

  useEffect(() => {
    const by = value - prev.current;
    prev.current = value;
    if (!delta || Math.abs(by) < 1e-6) return;
    const id = Date.now();
    setChange({ id, by });
    const t = window.setTimeout(() => setChange((c) => (c?.id === id ? null : c)), 4000);
    return () => window.clearTimeout(t);
  }, [value, delta]);

  return (
    <span className="relative inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`num ${className}`}>{format(value)}</span>
      <AnimatePresence>
        {change && delta && (
          <motion.span
            key={change.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className={`num self-center whitespace-nowrap rounded-full px-2 py-0.5 text-[0.8125rem] font-semibold leading-5 ${
              change.by > 0 ? 'bg-amber text-deep' : 'bg-mint text-deep'
            }`}
          >
            {change.by > 0 ? '+' : '−'}
            {delta(Math.abs(change.by))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
