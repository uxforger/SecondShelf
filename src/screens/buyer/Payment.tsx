import { AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, IconButton } from '../../components/ui/Button';
import { ProgressSteps, SuccessMark } from '../../components/ui/Feedback';
import { QrCode } from '../../components/ui/QrCode';
import { api, ApiError, type Order, type OrderInput, type PayStage } from '../../lib/api';
import { naira } from '../../lib/format';
import { haptic } from '../../lib/haptics';
import { exitSpring, spring } from '../../lib/motion';
import { navigate } from '../../lib/router';

const STEPS = [{ label: 'Connecting to Access Bank' }, { label: 'Authorising payment' }, { label: 'Confirmed' }];
const INDEX: Record<PayStage, number> = { connecting: 0, authorising: 1, confirmed: 3 };

type State = { s: 'paying'; step: number } | { s: 'paid'; order: Order } | { s: 'failed'; reason: string };

/** Full-screen payment process: stages, then a receipt with the handover QR. */
export function Payment({ open, input, total, onClose }: { open: boolean; input: OrderInput; total: number; onClose: () => void }) {
  return createPortal(<AnimatePresence>{open && <PaymentScreen key="pay" input={input} total={total} onClose={onClose} />}</AnimatePresence>, document.body);
}

function PaymentScreen({ input, total, onClose }: { input: OrderInput; total: number; onClose: () => void }) {
  const [state, setState] = useState<State>({ s: 'paying', step: 0 });
  const abort = useRef<AbortController | null>(null);

  const pay = async () => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setState({ s: 'paying', step: 0 });
    try {
      const order = await api.placeOrder(input, (st) => !ctrl.signal.aborted && setState({ s: 'paying', step: INDEX[st] }), ctrl.signal);
      if (ctrl.signal.aborted) return;
      await new Promise((r) => setTimeout(r, 450)); // let "Confirmed" land
      haptic();
      setState({ s: 'paid', order });
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setState({ s: 'failed', reason: e instanceof ApiError ? e.message : 'Payment did not go through.' });
    }
  };

  useEffect(() => {
    void pay();
    return () => abort.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    abort.current?.abort();
    onClose();
  };

  const canCancel = state.s === 'paying' && state.step === 0;
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
          {(canCancel || state.s === 'failed') && (
            <IconButton label="Cancel payment" onClick={cancel}>
              <X className="size-6" />
            </IconButton>
          )}
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {state.s === 'paying' && (
            <motion.div key="paying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={spring} className="flex flex-1 flex-col justify-center pb-16">
              <p className="t-label text-muted">Paying</p>
              <p className="num mt-1 text-[2.5rem] font-semibold leading-[2.75rem] tracking-[-0.02em] text-deep">{naira(total)}</p>
              <div className="mt-8">
                <ProgressSteps steps={STEPS} current={state.step} />
              </div>
              {canCancel && (
                <Button variant="ghost" className="mt-6 self-start" onClick={cancel}>
                  Cancel
                </Button>
              )}
            </motion.div>
          )}

          {state.s === 'paid' && (
            <motion.div key="paid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-1 flex-col items-center text-center">
              <SuccessMark size={88} />
              <h1 className="t-title mt-5 text-deep">Paid!</h1>
              <p className="num mt-1 text-[2rem] font-semibold leading-[2.375rem] text-deep">{naira(state.order.total)}</p>
              <p className="num t-label mt-1 text-muted">Ref {state.order.ref}</p>
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.25 }}
                className="mt-6 flex flex-col items-center rounded-[28px] bg-surface p-5 shadow-card ring-1 ring-hairline"
              >
                <QrCode value={state.order.ref} size={196} label={`Handover code ${state.order.ref}`} />
                <p className="t-label mt-3 text-deep">Show at {state.order.fulfilment === 'pickup' ? 'pickup' : 'delivery'}</p>
              </motion.div>
              <p className="t-caption mt-4 text-muted">Sandbox payment</p>
              <div className="mt-auto w-full pt-6">
                <Button
                  size="lg"
                  block
                  onClick={() => {
                    onClose();
                    navigate(`/orders/${state.order.id}`, { tab: true });
                  }}
                >
                  Done
                </Button>
              </div>
            </motion.div>
          )}

          {state.s === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="flex flex-1 flex-col justify-center pb-16">
              <span className="flex size-14 items-center justify-center rounded-full bg-danger-tint text-danger">
                <AlertCircle className="size-7" />
              </span>
              <h1 className="t-title mt-5 text-deep">Not paid</h1>
              <p className="t-body mt-1 text-body" role="alert">
                {state.reason}
              </p>
              <div className="mt-8 flex gap-2">
                <Button variant="secondary" size="lg" className="flex-1" onClick={cancel}>
                  Back
                </Button>
                <Button size="lg" className="flex-1" onClick={pay}>
                  Try again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
