import { Eye, EyeOff, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { forwardRef, useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { pressSpring, spring } from '../../lib/motion';

/* ------------------------------------------------------------------ */
/* Text fields: label above, inline error below (validated on blur).    */
/* ------------------------------------------------------------------ */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: ReactNode;
  trailing?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField({ label, error, hint, trailing, className = '', id, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  const msg = `${fid}-msg`;
  return (
    <div className={`pb-4 ${className}`}>
      <label htmlFor={fid} className="t-14 mb-1.5 block font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={fid}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? msg : undefined}
          className={`h-13 w-full rounded-[14px] bg-white px-4 text-[1.0625rem] text-ink ring-1 transition-shadow outline-none placeholder:text-slate/60 focus:ring-2 ${
            error ? 'ring-coral focus:ring-coral' : 'ring-hairline focus:ring-leaf'
          } ${trailing ? 'pr-12' : ''}`}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {(error || hint) && (
        <p id={msg} className={`t-14 mt-1.5 ${error ? 'text-coral-ink' : 'text-slate'}`} role={error ? 'alert' : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, 'type' | 'trailing'>>(function PasswordField(props, ref) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      ref={ref}
      type={show ? 'text' : 'password'}
      trailing={
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="flex size-11 items-center justify-center rounded-full text-slate hover:text-ink">
          {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      }
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Stepper                                                              */
/* ------------------------------------------------------------------ */

export function Stepper({ label, value, onChange, min = 1, max = 999, unit }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; unit?: string }) {
  const id = useId();
  const set = (n: number) => onChange(Math.min(max, Math.max(min, Math.round(n || min))));
  const timer = useRef<number>(0);
  // Hold to repeat, like a real stepper.
  const hold = (d: number) => {
    let v = value;
    const tick = (wait: number) => {
      v = Math.min(max, Math.max(min, v + d));
      onChange(v);
      timer.current = window.setTimeout(() => tick(Math.max(40, wait * 0.8)), wait);
    };
    tick(380);
  };
  const stop = () => window.clearTimeout(timer.current);
  const btn = 'flex size-12 items-center justify-center rounded-full bg-white text-forest ring-1 ring-hairline disabled:opacity-40';
  return (
    <div className="pb-4">
      <label htmlFor={id} className="t-14 mb-1.5 block font-medium text-ink">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <motion.button type="button" aria-label="One less" className={btn} disabled={value <= min} whileTap={{ scale: 0.9 }} transition={pressSpring} onPointerDown={() => hold(-1)} onPointerUp={stop} onPointerLeave={stop} onKeyDown={(e) => e.key === 'Enter' && set(value - 1)}>
          <Minus className="size-5" />
        </motion.button>
        <div className="relative flex-1">
          <input
            id={id}
            inputMode="numeric"
            value={value}
            onChange={(e) => set(parseInt(e.target.value.replace(/\D/g, ''), 10))}
            className="num h-12 w-full rounded-[14px] bg-white text-center text-[1.25rem] font-semibold text-ink ring-1 ring-hairline outline-none focus:ring-2 focus:ring-leaf"
          />
          {unit && <span className="t-14 pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate">{unit}</span>}
        </div>
        <motion.button type="button" aria-label="One more" className={btn} disabled={value >= max} whileTap={{ scale: 0.9 }} transition={pressSpring} onPointerDown={() => hold(1)} onPointerUp={stop} onPointerLeave={stop} onKeyDown={(e) => e.key === 'Enter' && set(value + 1)}>
          <Plus className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slider (1:1 with the thumb; value shown live)                        */
/* ------------------------------------------------------------------ */

export function Slider({ label, value, onChange, min, max, step = 5, format }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number; step?: number; format: (n: number) => string }) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="t-14 font-medium text-ink">
          {label}
        </label>
        <span className="num t-20 text-forest">{format(value)}</span>
      </div>
      <input id={id} type="range" className="range mt-1" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ['--fill' as string]: `${fill}%` }} aria-valuetext={format(value)} />
      <div className="t-12 num flex justify-between text-slate">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented control                                                    */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({ label, options, value, onChange, className = '' }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  const group = useId();
  return (
    <div role="radiogroup" aria-label={label} className={`flex rounded-full bg-sunken p-1 ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`relative h-10 flex-1 rounded-full px-3 text-[0.9375rem] font-semibold transition-colors ${on ? 'text-ink' : 'text-slate hover:text-ink'}`}
          >
            {on && <motion.span layoutId={`seg-${group}`} transition={spring} className="absolute inset-0 rounded-full bg-white shadow-soft" />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6-box OTP                                                            */
/* ------------------------------------------------------------------ */

export function OtpBoxes({ value, onChange, disabled, error, label = 'One-time code' }: { value: string; onChange: (v: string) => void; disabled?: boolean; error?: boolean; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');
  // Ready to type the moment the code step appears (opens the phone keyboard).
  useEffect(() => {
    const t = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="relative" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        aria-label={label}
        data-autofocus
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        disabled={disabled}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
      <div aria-hidden="true" className="grid grid-cols-6 gap-2">
        {digits.map((d, i) => {
          const active = focused && i === Math.min(value.length, 5);
          return (
            <motion.div
              key={i}
              animate={{ scale: d.trim() ? [1.08, 1] : 1 }}
              transition={spring}
              className={`num flex h-14 items-center justify-center rounded-[14px] bg-white text-[1.5rem] font-semibold text-ink ring-1 ${error ? 'ring-coral' : active ? 'ring-2 ring-leaf' : 'ring-hairline'}`}
            >
              {d.trim()}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
