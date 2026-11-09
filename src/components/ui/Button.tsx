import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef, type ReactNode } from 'react';
import { PRESS_SCALE, pressSpring } from '../../lib/motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'cta' | 'quiet';
type Size = 'md' | 'lg' | 'sm';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-deep text-white shadow-soft disabled:bg-[#7f938a]',
  secondary: 'bg-mint text-deep disabled:opacity-50',
  ghost: 'bg-transparent text-deep hover:bg-deep/5 disabled:opacity-40',
  cta: 'bg-amber text-deep shadow-soft disabled:opacity-50',
  quiet: 'bg-surface text-deep shadow-soft ring-1 ring-hairline disabled:opacity-50',
};

const SIZES: Record<Size, string> = {
  sm: 'h-11 px-4 t-label rounded-full',
  md: 'h-12 px-5 text-[1rem] leading-6 font-semibold rounded-full',
  lg: 'h-14 px-6 text-[1.0625rem] leading-6 font-semibold rounded-full',
};

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`spinner ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Read out while loading, e.g. "Signing in". */
  loadingLabel?: string;
  icon?: ReactNode;
  block?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, loadingLabel, icon, block, className = '', disabled, children, type = 'button', ...rest },
  ref,
) {
  const inert = disabled || loading;
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={inert || undefined}
      whileTap={inert ? undefined : { scale: PRESS_SCALE }}
      transition={pressSpring}
      className={`relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap ${SIZES[size]} ${VARIANTS[variant]} ${block ? 'w-full' : ''} ${loading ? 'pointer-events-none' : ''} ${className}`}
      {...rest}
    >
      <span className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}>
        {icon}
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
          <span className="sr-only">{loadingLabel ?? 'Working'}</span>
        </span>
      )}
    </motion.button>
  );
});

/** Round icon button with a 44px target. */
export const IconButton = forwardRef<HTMLButtonElement, Omit<HTMLMotionProps<'button'>, 'children'> & { label: string; children: ReactNode; tone?: 'plain' | 'filled' | 'dark' }>(
  function IconButton({ label, children, className = '', tone = 'plain', type = 'button', ...rest }, ref) {
    const tones = {
      plain: 'text-deep hover:bg-deep/5',
      filled: 'bg-surface text-deep shadow-soft ring-1 ring-hairline',
      dark: 'bg-black/45 text-white backdrop-blur-md',
    };
    return (
      <motion.button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        whileTap={{ scale: 0.92 }}
        transition={pressSpring}
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full ${tones[tone]} ${className}`}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);

/** Any tappable surface (cards, rows) with pointer-down feedback. */
export const Pressable = forwardRef<HTMLButtonElement, HTMLMotionProps<'button'>>(function Pressable(
  { className = '', type = 'button', ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.985 }}
      transition={pressSpring}
      className={`block w-full text-left ${className}`}
      {...rest}
    />
  );
});
