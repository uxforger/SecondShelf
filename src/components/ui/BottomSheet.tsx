import { X } from 'lucide-react';
import { animate, AnimatePresence, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { exitSpring, project, rubberBand, sheetSpring, spring } from '../../lib/motion';
import { useDesktop } from '../../lib/useMedia';
import { IconButton } from './Button';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Accessible name when the title is not plain text. */
  label?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Prevent dismissal while something is in flight. */
  locked?: boolean;
}

/**
 * Bottom sheet on phones and tablets; right-side panel on desktop.
 * Both enter and leave along the same path.
 */
export function BottomSheet(props: SheetProps) {
  const desktop = useDesktop();
  useScrollLock(props.open);
  return createPortal(
    <AnimatePresence>{props.open && (desktop ? <SidePanel key="panel" {...props} /> : <MobileSheet key="sheet" {...props} />)}</AnimatePresence>,
    document.body,
  );
}

function useScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

function useDialog(onCloseProp: () => void, lockedProp?: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef({ onClose: onCloseProp, locked: lockedProp });
  latest.current = { onClose: onCloseProp, locked: lockedProp };
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const el = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current;
      el?.focus({ preventScroll: true });
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !latest.current.locked) latest.current.onClose();
      if (e.key === 'Tab' && ref.current) {
        const items = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      before?.focus?.({ preventScroll: true });
    };
  }, []);
  return ref;
}

function Header({ title, titleId, onClose, locked }: { title?: ReactNode; titleId: string; onClose: () => void; locked?: boolean }) {
  return (
    <div className="flex min-h-14 items-center gap-2 px-5 pt-1">
      <h2 id={titleId} className="t-heading min-w-0 flex-1 truncate text-deep">
        {title}
      </h2>
      {!locked && (
        <IconButton label="Close" onClick={onClose} className="-mr-2">
          <X className="size-5" />
        </IconButton>
      )}
    </div>
  );
}

function Backdrop({ onClose, locked }: { onClose: () => void; locked?: boolean }) {
  const present = useIsPresent();
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={spring}
      onClick={() => !locked && onClose()}
      className={`fixed inset-0 z-50 bg-deep/30 ${present ? '' : 'pointer-events-none'}`}
    />
  );
}

function MobileSheet({ onClose, title, label, children, footer, locked }: SheetProps) {
  const titleId = useId();
  const ref = useDialog(onClose, locked);
  const reduced = useReducedMotion();
  // While leaving, the sheet must never swallow taps meant for the page.
  const present = useIsPresent();
  const offscreen = typeof window !== 'undefined' ? window.innerHeight : 900;

  // y is ours: the drag writes to it, springs read from it, so every
  // animation starts from where the sheet actually is.
  // Reduced motion: no travel, a short cross-fade instead.
  const y = useMotionValue(reduced ? 0 : offscreen);
  const fade = useMotionValue(reduced ? 0 : 1);
  const travel = useTransform(y, [0, offscreen], [1, 0]);
  const backdrop = useTransform([travel, fade], ([t, f]: number[]) => t * f);
  const drag = useRef<{ start: number; from: number; id: number } | null>(null);
  // Each dismissal gets a token; grabbing the sheet mid-close cancels it.
  const closeToken = useRef(0);
  const closing = useRef(false);
  // Mirrors `closing` for rendering: the scrim lets taps through while the sheet leaves.
  const [leaving, setLeaving] = useState(false);
  const stopWatch = useRef<(() => void) | null>(null);
  useEffect(() => () => stopWatch.current?.(), []);

  useLayoutEffect(() => {
    const c = reduced ? animate(fade, 1, { duration: 0.2 }) : animate(y, 0, spring);
    return () => c.stop();
  }, [y, fade, reduced]);

  const height = () => ref.current?.offsetHeight ?? 500;

  const dismiss = (velocity = 0) => {
    if (closing.current) return;
    closing.current = true;
    setLeaving(true);
    const token = ++closeToken.current;
    let fired = false;
    const done = () => {
      if (fired || token !== closeToken.current || !closing.current) return;
      fired = true;
      stopWatch.current?.();
      onClose();
    };
    if (reduced) {
      animate(fade, 0, { duration: 0.18 }).then(done);
      return;
    }
    // Hand over as soon as the sheet is off screen; don't wait for the
    // spring's tail to settle (that would leave an invisible sheet in place).
    const h = height();
    stopWatch.current?.();
    stopWatch.current = y.on('change', (v) => v >= h && done());
    animate(y, h + 40, { ...sheetSpring, velocity }).then(done);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (locked || e.button !== 0) return;
    // Let buttons in the header (Close, Back) receive their own click.
    if ((e.target as HTMLElement).closest('button')) return;
    // Interrupt any running spring, including a dismissal, and start
    // from where the sheet is right now.
    y.stop();
    stopWatch.current?.();
    stopWatch.current = null;
    closeToken.current++;
    closing.current = false;
    setLeaving(false);
    drag.current = { start: e.clientY, from: y.get(), id: e.pointerId };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* pointer already gone */
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const raw = d.from + (e.clientY - d.start);
    // Under reduced motion the sheet still follows the finger (that's
    // direct manipulation, not decoration), it just doesn't animate by itself.
    y.set(raw < 0 ? rubberBand(raw, height()) : raw);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const velocity = y.getVelocity();
    const projected = y.get() + project(velocity);
    if (projected > height() * 0.5) {
      dismiss(velocity);
    } else animate(y, 0, reduced ? { duration: 0.15 } : { ...sheetSpring, velocity });
  };

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ opacity: backdrop }}
        onClick={() => !locked && dismiss()}
        className={`fixed inset-0 z-50 bg-deep/30 ${present && !leaving ? '' : 'pointer-events-none'}`}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        style={{ y, opacity: fade, willChange: 'transform' }}
        exit={reduced ? { opacity: 0, transition: { duration: 0.18 } } : { y: offscreen, transition: exitSpring }}
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-[720px] flex-col rounded-t-[28px] bg-offwhite shadow-sheet outline-none ${present ? '' : 'pointer-events-none'}`}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
        >
          <div className="flex justify-center pt-2.5" aria-hidden="true">
            <div className="h-1.5 w-10 rounded-full bg-deep/20" />
          </div>
          {(title || !locked) && <Header title={title} titleId={titleId} onClose={() => dismiss()} locked={locked} />}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-hairline px-5 pt-3 pb-[max(16px,var(--safe-bottom))]">{footer}</div>}
        {!footer && <div className="shrink-0 pb-[max(8px,var(--safe-bottom))]" />}
      </motion.div>
    </>
  );
}

function SidePanel({ onClose, title, label, children, footer, locked }: SheetProps) {
  const titleId = useId();
  const ref = useDialog(onClose, locked);
  const present = useIsPresent();
  return (
    <>
      <Backdrop onClose={onClose} locked={locked} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0, transition: { x: exitSpring, opacity: { duration: 0.25 } } }}
        transition={spring}
        className={`fixed inset-y-0 right-0 z-50 flex w-[440px] max-w-full flex-col bg-offwhite shadow-sheet outline-none ${present ? '' : 'pointer-events-none'}`}
      >
        <div className="shrink-0 pt-4">
          <Header title={title} titleId={titleId} onClose={onClose} locked={locked} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        {footer && <div className="shrink-0 border-t border-hairline px-6 py-4">{footer}</div>}
      </motion.div>
    </>
  );
}
