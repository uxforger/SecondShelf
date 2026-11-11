import { X } from 'lucide-react';
import { AnimatePresence, animate, motion, useDragControls, useIsPresent, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { exitSpring, project, sheetSpring, spring } from '../../lib/motion';
import { useDesktop } from '../../lib/useMedia';
import { IconButton } from './core';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Hide the title visually (still read by screen readers). */
  hideTitle?: boolean;
  children: ReactNode;
  /** While a bank step runs, don't let a stray drag or scrim tap cancel it. */
  locked?: boolean;
  wide?: boolean;
}

/**
 * Phone: a bottom sheet that tracks the finger 1:1, rubber-bands at the top,
 * and uses projected momentum to decide close vs. stay. Desktop: a centred
 * dialog. Both enter and leave along the same path.
 */
export function Sheet(props: SheetProps) {
  return createPortal(<AnimatePresence>{props.open && <SheetBody key="sheet" {...props} />}</AnimatePresence>, document.body);
}

function SheetBody({ onClose, title, hideTitle, children, locked, wide }: SheetProps) {
  const desktop = useDesktop();
  const reduced = useReducedMotion();
  const present = useIsPresent();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const y = useMotionValue(0);
  const scrim = useTransform(y, [0, 400], [1, 0.2]);
  const drag = useDragControls();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  // Focus in, Escape out, focus back where it came from, no page scroll behind.
  useEffect(() => {
    restore.current = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const first = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el;
    window.setTimeout(() => first?.focus({ preventScroll: true }), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !lockedRef.current) closeRef.current();
      if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href],select,textarea,[tabindex]:not([tabindex="-1"])')];
        if (!items.length) return;
        const [a, b] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      restore.current?.focus?.({ preventScroll: true });
    };
  }, []);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const h = panel.current?.offsetHeight ?? 600;
    const landing = y.get() + project(info.velocity.y);
    if (!locked && landing > h * 0.45) closeRef.current();
    else animate(y, 0, { ...sheetSpring, velocity: info.velocity.y });
  };

  const header = (
    <div className="flex items-center gap-2 px-5 pt-2 pb-1 lg:px-6 lg:pt-5">
      <h2 id={id} className={`t-20 flex-1 text-ink ${hideTitle ? 'sr-only' : ''}`}>
        {title}
      </h2>
      {!locked && (
        <IconButton label="Close" onClick={onClose} className="-mr-2">
          <X className="size-5" />
        </IconButton>
      )}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[60] ${present ? '' : 'pointer-events-none'}`}>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/40"
        style={desktop ? undefined : { opacity: scrim }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        onClick={() => !locked && onClose()}
      />
      {desktop ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            tabIndex={-1}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 8, transition: { ...exitSpring, opacity: { duration: 0.15 } } }}
            transition={spring}
            className={`pointer-events-auto max-h-[min(88dvh,820px)] w-full overflow-y-auto rounded-[24px] bg-paper shadow-lift outline-none ${wide ? 'max-w-[640px]' : 'max-w-[480px]'}`}
          >
            {header}
            <div className="px-6 pt-2 pb-6">{children}</div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={id}
          tabIndex={-1}
          style={{ y }}
          drag={reduced ? false : 'y'}
          dragListener={false}
          dragControls={drag}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.06, bottom: 1 }}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          initial={reduced ? { opacity: 0 } : { y: '100%' }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: '100%', transition: exitSpring }}
          transition={spring}
          className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[24px] bg-paper shadow-sheet outline-none"
        >
          <div className="cursor-grab touch-none pt-2.5 active:cursor-grabbing" onPointerDown={(e) => drag.start(e)}>
            <div aria-hidden="true" className="mx-auto h-1.5 w-10 rounded-full bg-ink/15" />
            {header}
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 pt-1 pb-[max(20px,calc(var(--safe-bottom)+12px))]">{children}</div>
        </motion.div>
      )}
    </div>
  );
}
