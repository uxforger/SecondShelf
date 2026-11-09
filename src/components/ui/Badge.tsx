import type { ReactNode } from 'react';
import { timeLeftLabel, urgencyFor } from '../../lib/expiry';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'deep';

const TONES: Record<Tone, string> = {
  neutral: 'bg-mint text-deep',
  success: 'bg-[#dcefdc] text-success-ink',
  warning: 'bg-warning-tint text-warning-ink',
  danger: 'bg-danger-tint text-danger',
  deep: 'bg-deep text-white',
};

const DOTS: Record<Tone, string> = {
  neutral: 'bg-deep/40',
  success: 'bg-green',
  warning: 'bg-amber',
  danger: 'bg-danger',
  deep: 'bg-amber',
};

/** Status always carries words; the dot only reinforces them. */
export function Badge({ tone = 'neutral', children, dot = true, className = '' }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={`num t-caption inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 ${TONES[tone]} ${className}`}>
      {dot && <span aria-hidden="true" className={`size-1.5 rounded-full ${DOTS[tone]}`} />}
      {children}
    </span>
  );
}

export function ExpiryBadge({ days }: { days: number }) {
  const u = urgencyFor(days);
  const tone: Tone = u === 'expired' ? 'danger' : u === 'urgent' ? 'danger' : u === 'soon' ? 'warning' : 'neutral';
  const label = timeLeftLabel(days);
  return (
    <Badge tone={tone}>
      <span className="sr-only">Expires in </span>
      {u === 'expired' ? 'Expired' : `${label} left`}
    </Badge>
  );
}
