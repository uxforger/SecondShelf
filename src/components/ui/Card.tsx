import type { ReactNode } from 'react';

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
        {count !== undefined && <span className="num ml-1.5">{count}</span>}
      </h2>
      {action}
    </div>
  );
}
