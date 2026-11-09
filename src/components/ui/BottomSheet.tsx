import { X } from 'lucide-react';
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { project, rubberBand, sheetSpring, spring } from '../../lib/motion';
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
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={spring}
      onClick={() => !locked && onClose()}
      className="fixed inset-0 z-50 bg-deep/30"
    />
  );
}

function MobileSheet({ onClose, title, label, children, footer, locked }: SheetProps) {
  const titleId = useId();
  const ref = useDialog(onClose, locked);
  const reduced = useReducedMotion();
  const offscreen = typeof window !== 'undefined' ? window.innerHeight : 900;

  // y is ours: the drag writes to it, springs read from it, so every
  // animation starts from where the sheet actually is.
  const y = useMotionValue(offscreen);
  const backdrop = useTransform(y, [0, offscreen], [1, 0]);
  const drag = useRef<{ start: number; from: number; id: number } | null>(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const c = animate(y, 0, reduced ? { duration: 0 } : spring);
    return () => c.stop();
  }, [y, reduced]);

  const height = () => ref.current?.offsetHeight ?? 500;

  const dismiss = (velocity = 0) => {
    if (closing.current) return;
    closing.current = true;
    animate(y, height() + 40, reduced ? { duration: 0 } : { ...sheetSpring, velocity }).then(onClose);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (locked || e.button !== 0) return;
    y.stop(); // interrupt any running spring: start from the current value
    drag.current = { start: e.clientY, from: y.get(), id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const raw = d.from + (e.clientY - d.start);
    y.set(raw < 0 ? rubberBand(raw, height()) : raw);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const velocity = y.getVelocity();
    const projected = y.get() + project(velocity);
    if (projected > height() * 0.5) dismiss(velocity);
    else animate(y, 0, reduced ? { duration: 0 } : { ...sheetSpring, velocity });
  };

  return (
    <>
      <motion.div aria-hidden="true" style={{ opacity: backdrop }} onClick={() => !locked && dismiss()} className="fixed inset-0 z-50 bg-deep/30" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        style={{ y }}
        exit={{ y: offscreen, transition: reduced ? { duration: 0 } : spring }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-[720px] flex-col rounded-t-[28px] bg-offwhite shadow-sheet outline-none"
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
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={spring}
        className="fixed inset-y-0 right-0 z-50 flex w-[440px] max-w-full flex-col bg-offwhite shadow-sheet outline-none"
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
