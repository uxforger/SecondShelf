import { AlertCircle, Bell, CheckCircle2, CircleDollarSign, HandCoins, PackageCheck, Tag, Truck } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { spring } from '../../lib/motion';
import { dismissBanner, dismissToast, useBanners, useToasts, type Banner } from '../../lib/store';

const BANNER_ICON: Record<Banner['icon'], ReactNode> = {
  alert: <Bell className="size-5 text-amber" />,
  listed: <Tag className="size-5 text-leaf" />,
  paid: <CircleDollarSign className="size-5 text-forest" />,
  handed_over: <PackageCheck className="size-5 text-leaf" />,
  pickup: <Truck className="size-5 text-leaf" />,
};

/**
 * One place for every notice: our own confirmations and what happens on
 * other devices. Bottom-centre above the tab bar on phones, bottom-right on
 * desktop. Never over the header or the navigation. Auto-dismiss.
 */
export function Toasts({ tabBar }: { tabBar: boolean }) {
  const toasts = useToasts();
  const banners = useBanners();
  const reduced = useReducedMotion();

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end lg:px-0 ${
        tabBar ? 'bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+12px)]' : 'bottom-[max(16px,calc(var(--safe-bottom)+12px))]'
      }`}
    >
      <AnimatePresence initial={false}>
        {banners.map((b) => (
          <Item
            key={`b${b.id}`}
            reduced={!!reduced}
            onDismiss={() => dismissBanner(b.id)}
            onTap={
              b.open
                ? () => {
                    dismissBanner(b.id);
                    b.open!();
                  }
                : undefined
            }
            icon={BANNER_ICON[b.icon]}
            text={b.title}
            detail={b.detail}
            tone="live"
          />
        ))}
        {toasts.map((t) => (
          <Item
            key={`t${t.id}`}
            reduced={!!reduced}
            onDismiss={() => dismissToast(t.id)}
            icon={t.tone === 'success' ? <CheckCircle2 className="size-5 text-lime" /> : t.tone === 'error' ? <AlertCircle className="size-5 text-coral" /> : <HandCoins className="size-5 text-lime" />}
            text={t.text}
            tone={t.tone === 'error' ? 'error' : 'plain'}
            action={
              t.action && {
                label: t.action.label,
                run: () => {
                  dismissToast(t.id);
                  t.action!.run();
                },
              }
            }
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Item({
  icon,
  text,
  detail,
  tone,
  onTap,
  onDismiss,
  action,
  reduced,
}: {
  icon: ReactNode;
  text: string;
  detail?: string;
  tone: 'live' | 'plain' | 'error';
  onTap?: () => void;
  onDismiss: () => void;
  action?: { label: string; run: () => void };
  reduced: boolean;
}) {
  const live = tone === 'live';
  const body = (
    <>
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${live ? 'bg-paper' : 'bg-white/10'}`}>{icon}</span>
      <span className="min-w-0 flex-1 text-left">
        <span className={`block truncate text-[0.9375rem] leading-5 font-semibold ${live ? 'text-ink' : 'text-white'}`}>{text}</span>
        {detail && <span className={`num block truncate text-[0.8125rem] leading-5 ${live ? 'text-slate' : 'text-white/70'}`}>{detail}</span>}
      </span>
    </>
  );
  return (
    <motion.div
      layout
      role={tone === 'error' ? 'alert' : 'status'}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={(_, i) => Math.abs(i.offset.x) + Math.abs(i.velocity.x) * 0.2 > 120 && onDismiss()}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.18 } }}
      transition={spring}
      className={`pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-[18px] p-2.5 pr-3 shadow-lift lg:w-[380px] ${live ? 'bg-white ring-1 ring-hairline' : 'bg-forest'}`}
    >
      {onTap ? (
        <button type="button" onClick={onTap} className="flex min-w-0 flex-1 items-center gap-3">
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
      {action && (
        <button type="button" onClick={action.run} className="h-9 shrink-0 rounded-full bg-white/12 px-3 text-[0.875rem] font-semibold text-lime">
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
