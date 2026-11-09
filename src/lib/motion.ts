import type { Transition } from 'motion/react';

/** Default for anything that moves: critically damped, interruptible. */
export const spring: Transition = { type: 'spring', visualDuration: 0.35, bounce: 0 };

/** Sheets and drawers after a drag or flick: a little life, still calm. */
export const sheetSpring: Transition = { type: 'spring', visualDuration: 0.4, bounce: 0.15 };

/** Press feedback on pointer-down. */
export const pressSpring: Transition = { type: 'spring', visualDuration: 0.1, bounce: 0 };

export const PRESS_SCALE = 0.97;

/** Shared-axis page transition. `dir` 1 = forward, -1 = back, 0 = tab switch. */
export const pageVariants = {
  enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -24, opacity: 0 }),
};

/** Project where a flick would come to rest (UIScrollView "normal" rate). */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** iOS-style rubber band: resistance grows the further you pull. */
export function rubberBand(offset: number, dimension: number, constant = 0.55): number {
  const sign = Math.sign(offset);
  const x = Math.abs(offset);
  return sign * (1 - 1 / ((x * constant) / dimension + 1)) * dimension;
}
