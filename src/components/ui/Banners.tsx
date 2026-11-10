import { AlarmClock, ChevronRight, HandHeart, ReceiptText, Store, Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { exitSpring, spring } from '../../lib/motion';
import { dismissBanner, useBanners, type Banner } from '../../lib/store';

const ICON: Record<Banner['icon'], ReactNode> = {
  alert: <AlarmClock className="size-5" />,
  listed: <Store className="size-5" />,
  paid: <ReceiptText className="size-5" />,
  handed_over: <HandHeart className="size-5" />,
  pickup: <Truck className="size-5" />,
};

const TINT: Record<Banner['icon'], string> = {
  alert: 'bg-amber text-deep',
  listed: 'bg-green text-white',
  paid: 'bg-deep text-white',
  handed_over: 'bg-green text-white',
  pickup: 'bg-deep text-white',
};

/**
 * Live alerts that arrive from other devices. They drop in from the top,
 * leave the same way, can be flicked up to dismiss, and act on tap.
 */
export function Banners() {
  const banners = useBanners();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex flex-col items-center gap-2 px-3 pt-[max(10px,var(--safe-top))] lg:inset-x-auto lg:right-6 lg:items-end lg:pt-6"
    >
      <AnimatePresence initial={false}>
        {banners.map((b) => (
          <motion.div
            key={b.id}
            layout
            initial={{ y: -96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -96, opacity: 0, transition: { y: exitSpring, opacity: { duration: 0.2 } } }}
            transition={spring}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.9, bottom: 0.08 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -24 || info.velocity.y < -300) dismissBanner(b.id);
            }}
            className="pointer-events-auto w-full max-w-[420px] touch-none"
          >
            <button
              type="button"
              onClick={() => {
                dismissBanner(b.id);
                b.open?.();
              }}
              className="material flex w-full items-center gap-3 rounded-[20px] p-3 pr-2 text-left shadow-sheet ring-1 ring-hairline"
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${TINT[b.icon]}`}>{ICON[b.icon]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.9375rem] font-semibold leading-5 text-deep">{b.title}</span>
                {b.detail && <span className="num block truncate text-[0.8125rem] leading-[1.125rem] text-body">{b.detail}</span>}
              </span>
              {b.open && <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden="true" />}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
