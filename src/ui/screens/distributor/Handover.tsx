import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { api, ApiError, type Order } from '../../../lib/api';
import { naira } from '../../../lib/format';
import { haptic } from '../../../lib/haptics';
import { spring } from '../../../lib/motion';
import { goBack, navigate } from '../../../lib/router';
import { product } from '../../../lib/selectors';
import { requestOpenBatch, toast, useDb } from '../../../lib/store';
import { BankProcess } from '../../kit/bank';
import { Button, SuccessCheck } from '../../kit/core';
import { Scanner } from '../../kit/scanner';
import { Sheet } from '../../kit/sheet';

/**
 * Scan the buyer's QR. On success, land back on the batch with
 * "Pay out" lit and its sheet already open (two taps to the money).
 */
export function Handover({ expected }: { expected?: string }) {
  const db = useDb();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ s: 'checking' } | { s: 'done'; order: Order } | { s: 'error'; message: string }>({ s: 'checking' });
  const last = useRef('');

  const onDetect = async (raw: string) => {
    const ref = raw.trim().toUpperCase();
    last.current = ref;
    setOpen(true);
    setState({ s: 'checking' });
    try {
      const order = await api.confirmHandover(ref);
      haptic();
      setState({ s: 'done', order });
    } catch (e) {
      setState({ s: 'error', message: e instanceof ApiError ? e.message : 'Could not confirm. Try again.' });
    }
  };

  const toBatch = (o: Order) => {
    setOpen(false);
    toast(`Handed over · ${o.ref}`, 'success');
    requestOpenBatch(o.batchId, 'detail');
    window.setTimeout(() => navigate(`/batch/${o.batchId}`, { replace: true }), 240);
  };

  const p = state.s === 'done' ? product(db, state.order.productId) : undefined;

  return (
    <>
      <Scanner kind="qr" title={expected ? `Scan ${expected}` : "Scan buyer's code"} paused={open} onDetect={onDetect} onClose={() => goBack('/sales')} />
      <Sheet open={open} onClose={() => setOpen(false)} title="Handover" locked={state.s === 'checking'}>
        <AnimatePresence mode="popLayout" initial={false}>
          {state.s === 'checking' && (
            <motion.div key="c" exit={{ opacity: 0 }}>
              <BankProcess steps={[{ label: `Checking ${last.current}` }, { label: 'Handed over' }]} current={0} />
            </motion.div>
          )}
          {state.s === 'error' && (
            <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BankProcess steps={[{ label: `Checking ${last.current}` }]} current={0} error={state.message} onRetry={() => onDetect(last.current)} />
              <Button variant="secondary" size="lg" block className="mt-4" onClick={() => setOpen(false)}>
                Scan again
              </Button>
            </motion.div>
          )}
          {state.s === 'done' && (
            <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-col items-center text-center">
              <SuccessCheck size={72} />
              <p className="t-24 mt-4 text-ink">Handed over</p>
              <p className="t-16 text-slate">
                {state.order.qty} × {p?.name} · <span className="mono">{state.order.ref}</span>
              </p>
              <Button size="lg" variant="dark" block className="mt-6" onClick={() => toBatch(state.order)}>
                Next: pay out {naira(state.order.total)}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
    </>
  );
}
