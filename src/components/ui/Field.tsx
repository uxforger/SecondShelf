import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { spring } from '../../lib/motion';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string | null;
  hint?: string;
  trailing?: ReactNode;
}

export function FieldMessage({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  return (
    <div className="min-h-5" id={id}>
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={spring}
            className="t-caption mt-1.5 text-danger"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="t-caption mt-1.5 text-muted">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const inputClass =
  'h-12 w-full rounded-[12px] bg-surface px-4 text-[1rem] leading-6 text-deep ring-1 ring-hairline outline-none placeholder:text-muted/70 transition-shadow focus:ring-2 focus:ring-green aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger disabled:bg-sunken';

export const Input = forwardRef<HTMLInputElement, FieldProps>(function Input(
  { label, error, hint, trailing, className = '', id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const msgId = `${inputId}-msg`;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="t-label mb-1.5 block text-deep">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={msgId}
          className={`${inputClass} ${trailing ? 'pr-12' : ''}`}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-0.5 flex items-center">{trailing}</div>}
      </div>
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, Omit<FieldProps, 'type' | 'trailing'>>(function PasswordInput(props, ref) {
  const [shown, setShown] = useState(false);
  return (
    <Input
      ref={ref}
      type={shown ? 'text' : 'password'}
      autoComplete="current-password"
      trailing={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          className="flex size-11 items-center justify-center rounded-full text-muted hover:text-deep"
        >
          {shown ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      }
      {...props}
    />
  );
});

/** Native date picker: fast on phones, keyboard friendly on desktop. */
export const DateField = forwardRef<HTMLInputElement, Omit<FieldProps, 'type'>>(function DateField(props, ref) {
  return <Input ref={ref} type="date" {...props} />;
});
