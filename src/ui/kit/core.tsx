import { animate, motion, useMotionValue, useReducedMotion, useTransform, type HTMLMotionProps } from 'motion/react';
import { forwardRef, useEffect, useRef, type ReactNode } from 'react';
import { pressSpring, spring } from '../../lib/motion';

/* ------------------------------------------------------------------ */
/* Button                                                               */
/* ------------------------------------------------------------------ */

export type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'quiet' | 'lime' | 'onDark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-leaf-strong text-white shadow-[0_1px_2px_rgba(15,31,26,0.2)] hover:bg-[#157a44] disabled:bg-sunken disabled:text-slate disabled:shadow-none',
  dark: 'bg-forest text-white hover:bg-[#0e4636] disabled:bg-sunken disabled:text-slate',
  secondary: 'bg-white text-ink ring-1 ring-hairline shadow-soft hover:bg-paper disabled:text-slate',
  quiet: 'bg-transparent text-forest hover:bg-forest/[0.05] disabled:text-slate',
  lime: 'bg-lime text-forest hover:bg-[#bde65a] disabled:bg-sunken disabled:text-slate',
  onDark: 'bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18 disabled:text-white/50',
};
const SIZE: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-[0.9375rem] gap-1.5 rounded-full',
  md: 'h-12 px-5 text-[1rem] gap-2 rounded-full',
  lg: 'h-14 px-6 text-[1.0625rem] gap-2 rounded-full',
};

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  /** Shown next to the spinner while loading, so the button never goes blank. */
  loadingLabel?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, loading, loadingLabel, icon, children, className = '', disabled, type = 'button', ...rest },
  ref,
) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      whileTap={disabled || loading || reduced ? undefined : { scale: 0.97 }}
      transition={pressSpring}
      className={`inline-flex shrink-0 select-none items-center justify-center font-semibold leading-none whitespace-nowrap transition-colors duration-150 ${VARIANT[variant]} ${SIZE[size]} ${block ? 'w-full' : ''} ${loading ? 'cursor-progress' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Spinner className="size-5" /> : icon}
      {loading ? (loadingLabel ?? children) : children}
    </motion.button>
  );
});

export function IconButton({
  label,
  children,
  className = '',
  tone = 'light',
  ...rest
}: { label: string; children: ReactNode; tone?: 'light' | 'dark' } & Omit<HTMLMotionProps<'button'>, 'children'>) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.92 }}
      transition={pressSpring}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors ${tone === 'dark' ? 'bg-black/35 text-white backdrop-blur-md hover:bg-black/45' : 'text-forest hover:bg-forest/[0.06]'} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/** A full-row tappable surface (list rows, ledger rows). Feedback on pointer-down. */
export function Tap({ children, className = '', ...rest }: Omit<HTMLMotionProps<'button'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.985 }} transition={pressSpring} className={`w-full text-left ${className}`} {...rest}>
      {children}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces and labels                                                  */
/* ------------------------------------------------------------------ */

export function Card({ children, className = '', dark, as: As = 'section', ...rest }: { children: ReactNode; className?: string; dark?: boolean; as?: 'section' | 'div' | 'article' | 'li' } & React.HTMLAttributes<HTMLElement>) {
  return (
    <As className={`rounded-[16px] ${dark ? 'bg-forest text-white' : 'bg-white shadow-card ring-1 ring-hairline'} ${className}`} {...rest}>
      {children}
    </As>
  );
}

export function SectionTitle({ title, count, action, className = '' }: { title: string; count?: number; action?: ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-10 items-center justify-between gap-3 ${className}`}>
      <h2 className="t-20 text-ink">
        {title}
        {count !== undefined && <span className="num ml-2 font-sans text-[0.9375rem] font-medium text-slate">{count}</span>}
      </h2>
      {action}
    </div>
  );
}

export type Tone = 'neutral' | 'leaf' | 'lime' | 'teal' | 'amber' | 'coral' | 'forest' | 'night';

const PILL: Record<Tone, string> = {
  neutral: 'bg-sunken text-slate',
  leaf: 'bg-leaf-tint text-[#146b3b]',
  lime: 'bg-lime text-forest',
  teal: 'bg-teal-tint text-teal-ink',
  amber: 'bg-amber-tint text-amber-ink',
  coral: 'bg-coral-tint text-coral-ink',
  forest: 'bg-forest text-white',
  night: 'bg-white/10 text-white ring-1 ring-white/15',
};
const DOT: Record<Tone, string> = {
  neutral: 'bg-slate',
  leaf: 'bg-leaf',
  lime: 'bg-forest',
  teal: 'bg-teal',
  amber: 'bg-amber',
  coral: 'bg-coral',
  forest: 'bg-lime',
  night: 'bg-lime',
};

export function Pill({ tone = 'neutral', children, dot = true, className = '' }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-semibold leading-none whitespace-nowrap ${PILL[tone]} ${className}`}>
      {dot && <span aria-hidden="true" className={`size-1.5 rounded-full ${DOT[tone]}`} />}
      {children}
    </span>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-[12px] ${className}`} />;
}

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`spinner ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Success mark: the circle fills, then the check draws itself. */
export function SuccessCheck({ size = 88, tone = 'leaf' }: { size?: number; tone?: 'leaf' | 'lime' }) {
  const reduced = useReducedMotion();
  const bg = tone === 'lime' ? '#C8F169' : '#1F9D55';
  const fg = tone === 'lime' ? '#0B3B2E' : '#FFFFFF';
  return (
    <motion.svg width={size} height={size} viewBox="0 0 88 88" role="img" aria-label="Done" initial={reduced ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.25 }}>
      <circle cx="44" cy="44" r="44" fill={bg} />
      <motion.path
        d="M26 45.5 38.5 58 63 32"
        fill="none"
        stroke={fg}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.38, delay: 0.16, ease: [0.65, 0, 0.35, 1] }}
      />
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/* Numbers                                                              */
/* ------------------------------------------------------------------ */

/**
 * Counts from the value on screen to the new value. First render shows
 * the value at once unless `from` is given (the Live board counts up).
 */
export function CountUp({ value, format, from, className = '' }: { value: number; format: (n: number) => string; from?: number; className?: string }) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(from ?? value);
  const text = useTransform(mv, (n) => format(n));
  const first = useRef(true);
  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    if (first.current && from === undefined) {
      first.current = false;
      mv.set(value);
      return;
    }
    first.current = false;
    const c = animate(mv, value, { type: 'spring', visualDuration: 1.1, bounce: 0 });
    return () => c.stop();
  }, [value, reduced, mv, from]);
  return (
    <motion.span className={`num ${className}`} aria-label={format(value)}>
      {text}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Brand                                                                */
/* ------------------------------------------------------------------ */

export function LogoMark({ className = 'h-8 w-7' }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M15 35L48 18V75L15 90V35Z" fill="#0B3E2E" />
      <path d="M52 75L85 58V38L52 54V75Z" fill="#F97316" />
      <path d="M50 15C50 15 72 20 82 42C68 44 54 36 50 15Z" fill="#22C55E" />
      <path d="M32 42C32 42 48 34 65 42C56 52 42 54 32 42Z" fill="#16A34A" />
    </svg>
  );
}

export function Logo({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`} aria-label="SecondShelf" role="img">
      <span className={tone === 'light' ? 'rounded-full bg-white p-1' : ''}>
        <LogoMark className={tone === 'light' ? 'h-6 w-5' : 'h-7 w-6'} />
      </span>
      <span aria-hidden="true" className="font-display text-[1.1875rem] leading-none font-bold tracking-[-0.03em]">
        <span className={tone === 'dark' ? 'text-forest' : 'text-white'}>Second</span>
        <span className={tone === 'dark' ? 'text-leaf' : 'text-lime'}>Shelf</span>
      </span>
    </span>
  );
}

/** Fades and rises into view once. Reduced motion: plain fade. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}
