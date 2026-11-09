import { Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useId, useRef } from 'react';
import { pressSpring } from '../../lib/motion';

interface Props {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

/**
 * Tap to step by one. Press and hold to repeat, getting faster the longer
 * you hold (400 ms delay, then 140 ms → 35 ms).
 */
export function QuantityStepper({ label, value, onChange, min = 1, max = 9999, unit }: Props) {
  const id = useId();
  const valueRef = useRef(value);
  valueRef.current = value;
  const timer = useRef<number | null>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const start = (delta: number) => {
    stop();
    onChange(clamp(valueRef.current + delta));
    let interval = 140;
    let steps = 0;
    const tick = () => {
      const next = clamp(valueRef.current + delta * (steps > 20 ? 5 : 1));
      if (next === valueRef.current) return stop();
      onChange(next);
      steps++;
      interval = Math.max(35, interval * 0.9);
      timer.current = window.setTimeout(tick, interval);
    };
    timer.current = window.setTimeout(tick, 400);
  };

  const btn = (delta: number, disabled: boolean, name: string, icon: React.ReactNode) => (
    <motion.button
      type="button"
      aria-label={name}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={pressSpring}
      onPointerDown={(e) => {
        if (disabled || e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        start(delta);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange(clamp(value + delta));
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="flex size-11 items-center justify-center rounded-full bg-surface text-deep shadow-soft ring-1 ring-hairline disabled:opacity-35"
    >
      {icon}
    </motion.button>
  );

  return (
    <div>
      <label htmlFor={id} className="t-label mb-1.5 block text-deep">
        {label}
      </label>
      <div role="group" aria-label={label} className="flex h-14 items-center justify-between gap-3 rounded-[12px] bg-sunken px-1.5">
        {btn(-1, value <= min, 'Less', <Minus className="size-5" />)}
        <div className="flex min-w-0 items-baseline gap-1.5">
          <input
            id={id}
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => {
              const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
              onChange(Number.isFinite(n) ? clamp(n) : min);
            }}
            className="num w-16 bg-transparent text-center text-[22px] font-semibold leading-7 text-deep outline-none"
          />
          {unit && <span className="t-label text-muted">{unit}</span>}
        </div>
        {btn(1, value >= max, 'More', <Plus className="size-5" />)}
      </div>
    </div>
  );
}
