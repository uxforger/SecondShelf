import { Landmark } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ProgressSteps, Skeleton } from '../../components/ui/Feedback';
import { api, ApiError, type Order, type PayoutPreview } from '../../lib/api';
import { naira } from '../../lib/format';
import { spring } from '../../lib/motion';

type State =
  | { s: 'enquiring' }
  | { s: 'ready'; preview: PayoutPreview }
  | { s: 'sending'; preview: PayoutPreview; step: number }
  | { s: 'error'; message: string };

/**
 * Pay the distributor after handover: name enquiry first (show who gets
 * paid), then one tap to send. Fees come from the bank's response.
 */
export function PayoutCard({ order }: { order: Order }) {
  const done = order.payout?.status === 'successful';
  const waiting = order.payout && ['pending', 'unknown'].includes(order.payout.status);
  const [state, setState] = useState<State>({ s: 'enquiring' });

  const enquire = async () => {
    setState({ s: 'enquiring' });
    try {
      setState({ s: 'ready', preview: await api.enquirePayout(order.id) });
    } catch (e) {
      setState({ s: 'error', message: e instanceof ApiError ? e.message : 'Could not reach the bank.' });
    }
  };

  useEffect(() => {
    if (!done && !waiting) void enquire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const send = async (preview: PayoutPreview) => {
    setState({ s: 'sending', preview, step: 1 });
    try {
      await api.sendPayout(order.id);
    } catch (e) {
      setState({ s: 'error', message: e instanceof ApiError ? e.message : 'Could not reach the bank.' });
    }
  };

  const check = async () => {
    try {
      await api.sendPayout(order.id); // polls the transfer, never resends
    } catch (e) {
      setState({ s: 'error', message: e instanceof ApiError ? e.message : 'Could not reach the bank.' });
    }
  };

  if (done) {
    const p = order.payout!;
    const charges = (p.fee ?? 0) + (p.vat ?? 0) + (p.stampDuty ?? 0);
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="rounded-[20px] bg-[#dcefdc] p-4 text-left">
        <p className="t-label flex items-center gap-2 text-success-ink">
          <Landmark className="size-5" /> Paid out
        </p>
        <p className="num mt-1 text-[1.375rem] font-semibold leading-7 text-deep">{naira(p.amount)}</p>
        <p className="t-caption num mt-0.5 text-success-ink">
          {p.accountName} ···{p.accountNumber.slice(-4)} · charges {naira(charges)}
          {p.sessionId ? ` · session ${p.sessionId.slice(-8)}` : ''}
        </p>
      </motion.div>
    );
  }

  if (waiting) {
    return (
      <div className="rounded-[20px] bg-warning-tint p-4 text-left">
        <p className="t-label text-warning-ink">Payout waiting for the bank</p>
        <p className="t-caption mt-0.5 text-warning-ink">We check the result. We never send twice.</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={check}>
          Check now
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-surface p-4 text-left shadow-soft ring-1 ring-hairline">
      <AnimatePresence mode="popLayout" initial={false}>
        {state.s === 'enquiring' && (
          <motion.div key="e" exit={{ opacity: 0 }} aria-busy="true">
            <p className="t-label text-muted">Checking payout account…</p>
            <Skeleton className="mt-2 h-6 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </motion.div>
        )}
        {state.s === 'ready' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring}>
            <p className="t-label text-muted">Pay out to</p>
            <p className="mt-0.5 text-[1.0625rem] font-semibold leading-6 text-deep">{state.preview.accountName}</p>
            <p className="t-caption num text-muted">
              {state.preview.bankName} · {state.preview.accountNumber}
            </p>
            <Button block size="lg" className="mt-3" icon={<Landmark className="size-5" />} onClick={() => send(state.preview)}>
              Pay out {naira(state.preview.amount)}
            </Button>
          </motion.div>
        )}
        {state.s === 'sending' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring}>
            <ProgressSteps steps={[{ label: `Account: ${state.preview.accountName}` }, { label: `Sending ${naira(state.preview.amount)}` }, { label: 'Paid out' }]} current={state.step} />
          </motion.div>
        )}
        {state.s === 'error' && (
          <motion.div key="x" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
            <p className="t-label text-danger" role="alert">
              {state.message}
            </p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={enquire}>
              Try again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
