import { ChevronRight } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';
import { pressSpring } from '../../lib/motion';

export function Card({ className = '', dark, children, ...rest }: { className?: string; dark?: boolean; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  const tone = dark ? 'bg-deep text-white shadow-sheet' : 'bg-surface shadow-card ring-1 ring-hairline';
  return (
    <div className={`rounded-[20px] ${tone} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, count, action }: { title: string; count?: number; action?: ReactNode }) {
  return (
    <div className="mb-1 flex items-end justify-between px-1 pt-6">
      <h2 className="t-label uppercase tracking-[0.06em] text-muted">
        {title}
        {count !== undefined && <span className="num ml-1.5 text-muted/80">{count}</span>}
      </h2>
      {action}
    </div>
  );
}

interface ListRowProps extends Omit<HTMLMotionProps<'button'>, 'title'> {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  highlighted?: boolean;
}

/** A tappable row. 64px tall minimum, pointer-down feedback. */
export function ListRow({ leading, title, subtitle, trailing, chevron = true, highlighted, className = '', ...rest }: ListRowProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      transition={pressSpring}
      animate={{ backgroundColor: highlighted ? 'rgba(227,237,224,1)' : 'rgba(255,255,255,0)' }}
      className={`flex min-h-16 w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left hover:bg-deep/[0.03] ${className}`}
      {...rest}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[16px] font-medium leading-6 text-deep">{title}</div>
        {subtitle && <div className="t-caption num mt-0.5 truncate text-muted">{subtitle}</div>}
      </div>
      {trailing}
      {chevron && <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted/60" />}
    </motion.button>
  );
}
