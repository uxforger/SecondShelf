import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { rubberBand, sheetSpring, spring } from './motion';

const TRIGGER = 72;
const HOLD = 56;
const SLOP = 10;

/**
 * Pull down at the top of the page to refresh. The content follows the
 * finger with rubber-band resistance and springs back with the release
 * velocity. Touch only; desktop users have nothing to pull.
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const y = useMotionValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const busy = useRef(false);
  const reduced = useReducedMotion();
  const cb = useRef(onRefresh);
  cb.current = onRefresh;

  useEffect(() => {
    let startY: number | null = null;
    let startX = 0;
    let pulling = false;

    const onStart = (e: TouchEvent) => {
      if (busy.current || window.scrollY > 0 || e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      y.stop();
    };
    const onMove = (e: TouchEvent) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      const dx = e.touches[0].clientX - startX;
      if (!pulling) {
        // Hysteresis: commit only after ~10px of clearly vertical, downward travel.
        if (Math.abs(dx) > SLOP && Math.abs(dx) > Math.abs(dy)) {
          startY = null;
          return;
        }
        if (dy < SLOP || window.scrollY > 0) return;
        pulling = true;
        startY += SLOP; // track 1:1 from here, no jump
      }
      const travel = e.touches[0].clientY - startY;
      if (e.cancelable) e.preventDefault();
      y.set(travel > 0 ? rubberBand(travel, window.innerHeight * 0.6) : 0);
    };
    const onEnd = async () => {
      if (startY === null) return;
      startY = null;
      if (!pulling) return;
      pulling = false;
      const velocity = y.getVelocity();
      if (y.get() >= TRIGGER) {
        busy.current = true;
        setRefreshing(true);
        animate(y, HOLD, reduced ? { duration: 0 } : { ...sheetSpring, velocity });
        try {
          await cb.current();
        } finally {
          busy.current = false;
          setRefreshing(false);
          animate(y, 0, reduced ? { duration: 0 } : spring);
        }
      } else {
        animate(y, 0, reduced ? { duration: 0 } : { ...sheetSpring, velocity });
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [y, reduced]);

  return { y, refreshing, trigger: TRIGGER };
}
