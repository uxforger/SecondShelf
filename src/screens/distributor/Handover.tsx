import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Scanner } from '../../components/scanner/Scanner';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { ProgressSteps, SuccessMark } from '../../components/ui/Feedback';
import { api, ApiError, type Order } from '../../lib/api';
import { naira } from '../../lib/format';
import { haptic } from '../../lib/haptics';
import { spring } from '../../lib/motion';
import { goBack, navigate } from '../../lib/router';
import { parseHandoverRef } from '../../lib/scanner';
import { business, product } from '../../lib/selectors';
import { useDb } from '../../lib/store';

type State = { s: 'confirming'; ref: string } | { s: 'done'; order: Order } | { s: 'error'; message: string };

/** Distributor scans the buyer's QR to confirm the goods changed hands. */
export function Handover() {
  const db = useDb();
  const [state, setState] = useState<State | null>(null);
  const run = useRef(0);

  const onDetect = async (value: string) => {
    const id = ++run.current;
    const ref = parseHandoverRef(value);
    if (!ref) return setState({ s: 'error', message: "That isn't a SecondShelf code." });
    setState({ s: 'confirming', ref });
    try {
      const order = await api.confirmHandover(ref);
      if (run.current !== id) return;
      haptic();
      setState({ s: 'done', order });
    } catch (e) {
      if (run.current !== id) return;
      setState({ s: 'error', message: e instanceof ApiError ? e.message : 'Could not confirm.' });
    }
  };

  const retry = () => {
    run.current++;
    setState(null);
  };

  const finish = () => {
    setState(null);
    window.setTimeout(() => navigate('/sales', { tab: true }), 240);
  };

  const done = state?.s === 'done' ? state.order : null;

  return (
    <>
      <Scanner kind="qr" title="Scan buyer's code" paused={!!state} onDetect={onDetect} onClose={() => goBack('/sales')} />
      <BottomSheet
        open={!!state}
        onClose={state?.s === 'done' ? finish : retry}
        locked={state?.s === 'confirming'}
        label="Handover"
        title={state?.s === 'done' ? undefined : state?.s === 'error' ? 'Not confirmed' : 'Confirming'}
        footer={
          state?.s === 'done' ? (
            <Button size="lg" block onClick={finish} data-autofocus>
              Done
            </Button>
          ) : state?.s === 'error' ? (
            <Button size="lg" block onClick={retry}>
              Try again
            </Button>
          ) : null
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {state?.s === 'confirming' && (
            <motion.div key="c" exit={{ opacity: 0 }} transition={spring} className="py-2">
              <p className="num t-label mb-3 text-muted">{state.ref}</p>
              <ProgressSteps steps={[{ label: 'Checking code' }, { label: 'Handed over' }]} current={0} />
            </motion.div>
          )}
          {done && (
            <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="flex flex-col items-center py-6 text-center">
              <SuccessMark size={88} />
              <p className="t-title mt-5 text-deep">Handed over</p>
              <p className="num mt-1 text-[1.75rem] font-semibold leading-9 text-deep">{naira(done.total)}</p>
              <p className="t-label num mt-1 text-muted">
                {business(db, done.buyerId)?.name} · {product(db, done.productId)?.name} · {done.qty}
              </p>
            </motion.div>
          )}
          {state?.s === 'error' && (
            <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="flex items-center gap-2 py-3 t-body text-danger" role="alert">
              <AlertCircle className="size-5 shrink-0" />
              {state.message}
            </motion.p>
          )}
        </AnimatePresence>
      </BottomSheet>
    </>
  );
}
