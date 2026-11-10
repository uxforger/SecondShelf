import { AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, IconButton } from '../../components/ui/Button';
import { ProgressSteps, SuccessMark } from '../../components/ui/Feedback';
import { QrCode } from '../../components/ui/QrCode';
import { api, ApiError, type Order, type OrderInput } from '../../lib/api';
import { naira } from '../../lib/format';
import { haptic } from '../../lib/haptics';
import { exitSpring, spring } from '../../lib/motion';
import { navigate } from '../../lib/router';

const OUT_STEPS = [{ label: 'Connecting to the bank' }, { label: 'Opening secure checkout' }];
const BACK_STEPS = [{ label: 'Back from the bank' }, { label: 'Verifying payment' }, { label: 'Confirmed' }];

/* ------------------------------------------------------------------ */
/* Leaving: create the bank checkout, then hand over to the bank page   */
/* ------------------------------------------------------------------ */

export function Payment({ open, input, total, onClose }: { open: boolean; input: OrderInput; total: number; onClose: () => void }) {
  return createPortal(<AnimatePresence>{open && <Checkout key="pay" input={input} total={total} onClose={onClose} />}</AnimatePresence>, document.body);
}

function Checkout({ input, total, onClose }: { input: OrderInput; total: number; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  const go = async () => {
    cancelled.current = false;
    setError(null);
    setStep(0);
    try {
      const started = Date.now();
      const c = await api.startCheckout(input);
      const spent = Date.now() - started;
      if (spent < 500) await new Promise((r) => setTimeout(r, 500 - spent));
      if (cancelled.current) return;
      setStep(1);
      try {
        sessionStorage.setItem('secondshelf_pending_payment', JSON.stringify({ reference: c.reference, batchId: input.batchId }));
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, 450));
      if (!cancelled.current) window.location.assign(c.paymentUrl);
    } catch (e) {
      if (!cancelled.current) setError(e instanceof ApiError ? e.message : 'Could not reach the bank.');
    }
  };

  useEffect(() => {
    void go();
    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    cancelled.current = true;
    onClose();
  };

  return (
    <Screen onClose={step === 0 || error ? cancel : undefined}>
      {error ? (
        <Failed reason={error} onRetry={go} onBack={cancel} />
      ) : (
        <div className="flex flex-1 flex-col justify-center pb-16">
          <p className="t-label text-muted">Paying</p>
          <p className="num mt-1 text-[2.5rem] font-semibold leading-[2.75rem] tracking-[-0.02em] text-deep">{naira(total)}</p>
          <div className="mt-8">
            <ProgressSteps steps={OUT_STEPS} current={step} />
          </div>
          <p className="t-caption mt-6 text-muted">You'll finish on the bank's secure page.</p>
          {step === 0 && (
            <Button variant="ghost" className="mt-4 self-start" onClick={cancel}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Returning: always verify with the bank before showing "Paid"         */
/* ------------------------------------------------------------------ */

type ReturnState = { s: 'verifying'; step: number } | { s: 'paid'; order: Order } | { s: 'failed'; reason: string };

export function PaymentReturn({ reference }: { reference: string }) {
  const [state, setState] = useState<ReturnState>({ s: 'verifying', step: 1 });
  const alive = useRef(true);

  const verify = async () => {
    setState({ s: 'verifying', step: 1 });
    const started = Date.now();
    // Pending can last a few seconds; keep asking for up to ~40 s.
    for (let i = 0; i < 20 && alive.current; i++) {
      try {
        const r = await api.verifyPayment(reference);
        if (!alive.current) return;
        if (r.status === 'paid' && r.order) {
          const spent = Date.now() - started;
          if (spent < 700) await new Promise((res) => setTimeout(res, 700 - spent));
          setState({ s: 'verifying', step: 3 });
          await new Promise((res) => setTimeout(res, 450));
          haptic();
          setState({ s: 'paid', order: r.order });
          return;
        }
        if (r.status === 'failed') {
          setState({ s: 'failed', reason: r.message ?? 'The bank declined this payment.' });
          return;
        }
      } catch (e) {
        setState({ s: 'failed', reason: e instanceof ApiError ? e.message : 'Could not reach the bank.' });
        return;
      }
      await new Promise((res) => setTimeout(res, 2000));
    }
    if (alive.current) setState({ s: 'failed', reason: 'The bank has not confirmed yet. Check Orders in a minute.' });
  };

  useEffect(() => {
    alive.current = true;
    void verify();
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const pending = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('secondshelf_pending_payment') || 'null') as { reference: string; batchId: string } | null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto bg-offwhite">
      <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-5 pt-[max(12px,var(--safe-top))] pb-[max(20px,var(--safe-bottom))]">
        <div className="h-14" />
        <AnimatePresence mode="popLayout" initial={false}>
          {state.s === 'verifying' && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={spring} className="flex flex-1 flex-col justify-center pb-16">
              <p className="t-label text-muted">Payment</p>
              <p className="num mt-1 text-[1.75rem] font-semibold leading-9 text-deep">{reference}</p>
              <div className="mt-8">
                <ProgressSteps steps={BACK_STEPS} current={state.step} />
              </div>
            </motion.div>
          )}
          {state.s === 'paid' && <Receipt key="p" order={state.order} />}
          {state.s === 'failed' && (
            <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="flex flex-1 flex-col">
              <Failed
                reason={state.reason}
                onRetry={pending?.batchId ? () => navigate(`/shop/${pending.batchId}`, { replace: true }) : verify}
                retryLabel={pending?.batchId ? 'Try again' : 'Check again'}
                onBack={() => navigate('/shop', { replace: true, tab: true })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Receipt({ order }: { order: Order }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-1 flex-col items-center text-center">
      <SuccessMark size={88} />
      <h1 className="t-title mt-5 text-deep">Paid!</h1>
      <p className="num mt-1 text-[2rem] font-semibold leading-[2.375rem] text-deep">{naira(order.total)}</p>
      <p className="num t-label mt-1 text-muted">Ref {order.ref}</p>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.25 }}
        className="mt-6 flex flex-col items-center rounded-[28px] bg-surface p-5 shadow-card ring-1 ring-hairline"
      >
        <QrCode value={order.ref} size={196} label={`Handover code ${order.ref}`} />
        <p className="t-label mt-3 text-deep">Show at {order.fulfilment === 'pickup' ? 'pickup' : 'delivery'}</p>
      </motion.div>
      <p className="t-caption mt-4 text-muted">Verified with the bank · sandbox</p>
      <div className="mt-auto w-full pt-6">
        <Button size="lg" block onClick={() => navigate(`/orders/${order.id}`, { replace: true, tab: true })}>
          Done
        </Button>
      </div>
    </motion.div>
  );
}

function Failed({ reason, onRetry, onBack, retryLabel = 'Try again' }: { reason: string; onRetry: () => void; onBack: () => void; retryLabel?: string }) {
  return (
    <div className="flex flex-1 flex-col justify-center pb-16">
      <span className="flex size-14 items-center justify-center rounded-full bg-danger-tint text-danger">
        <AlertCircle className="size-7" />
      </span>
      <h1 className="t-title mt-5 text-deep">Not paid</h1>
      <p className="t-body mt-1 text-body" role="alert">
        {reason}
      </p>
      <div className="mt-8 flex gap-2">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" className="flex-1" onClick={onRetry}>
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}

function Screen({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  const present = useIsPresent();
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24, transition: { x: exitSpring, opacity: { duration: 0.2 } } }}
      transition={spring}
      className={`fixed inset-0 z-[55] overflow-y-auto bg-offwhite ${present ? '' : 'pointer-events-none'}`}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-5 pt-[max(12px,var(--safe-top))] pb-[max(20px,var(--safe-bottom))]">
        <div className="flex h-14 items-center justify-end">
          {onClose && (
            <IconButton label="Cancel payment" onClick={onClose}>
              <X className="size-6" />
            </IconButton>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );
}
