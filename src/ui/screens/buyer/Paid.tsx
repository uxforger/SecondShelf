import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { api, ApiError, type Order } from '../../../lib/api';
import { naira } from '../../../lib/format';
import { haptic } from '../../../lib/haptics';
import { spring } from '../../../lib/motion';
import { navigate } from '../../../lib/router';
import { BankCard, BankProcess } from '../../kit/bank';
import { Button, Logo, SuccessCheck } from '../../kit/core';
import { QrCode } from '../../kit/qr';
import { PAY_STEPS } from './Product';

type State = { s: 'verifying'; step: number } | { s: 'paid'; order: Order } | { s: 'failed'; reason: string };

/** Back from the bank. Never shows "Paid" until the bank confirms it. */
export function Paid({ reference }: { reference: string }) {
  const [st, setSt] = useState<State>({ s: 'verifying', step: 2 });
  const alive = useRef(true);

  const verify = async () => {
    setSt({ s: 'verifying', step: 2 });
    const started = Date.now();
    for (let i = 0; i < 20 && alive.current; i++) {
      try {
        const r = await api.verifyPayment(reference);
        if (!alive.current) return;
        if (r.status === 'paid' && r.order) {
          const spent = Date.now() - started;
          if (spent < 700) await new Promise((res) => setTimeout(res, 700 - spent));
          setSt({ s: 'verifying', step: 4 });
          await new Promise((res) => setTimeout(res, 400));
          haptic();
          setSt({ s: 'paid', order: r.order });
          return;
        }
        if (r.status === 'failed') return setSt({ s: 'failed', reason: r.message ?? 'The bank declined this payment.' });
      } catch (e) {
        return setSt({ s: 'failed', reason: e instanceof ApiError ? e.message : 'Could not reach the bank.' });
      }
      await new Promise((res) => setTimeout(res, 2000));
    }
    if (alive.current) setSt({ s: 'failed', reason: 'The bank has not confirmed yet. Check Orders in a minute.' });
  };

  useEffect(() => {
    alive.current = true;
    void verify();
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  return (
    <div className="min-h-dvh bg-paper">
      <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-5 pt-[max(16px,var(--safe-top))] pb-[max(20px,var(--safe-bottom))]">
        <Logo />
        <AnimatePresence mode="popLayout" initial={false}>
          {st.s === 'verifying' && (
            <motion.div key="v" exit={{ opacity: 0, y: -12 }} transition={spring} className="flex flex-1 flex-col justify-center pb-16">
              <p className="t-14 text-slate">Payment</p>
              <p className="mono t-24 mt-1 text-ink">{reference}</p>
              <div className="mt-8">
                <BankProcess steps={PAY_STEPS} current={st.step} />
              </div>
            </motion.div>
          )}
          {st.s === 'paid' && (
            <motion.div key="p" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-1 flex-col items-center pt-8 text-center">
              <SuccessCheck size={84} />
              <h1 className="t-32 mt-4 text-ink">Paid</h1>
              <p className="num t-24 text-forest">{naira(st.order.total)}</p>
              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.25 }} className="mt-6 flex flex-col items-center rounded-[24px] bg-white p-5 shadow-card ring-1 ring-hairline">
                <QrCode value={st.order.ref} size={200} label={`Handover code ${st.order.ref}`} />
                <p className="t-16 mt-3 font-semibold text-ink">Show this at {st.order.fulfilment === 'pickup' ? 'pickup' : 'delivery'}</p>
              </motion.div>
              <BankCard className="mt-4 w-full text-left" title="Payment verified" reference={st.order.ref} status="Paid" tone="lime" />
              <Button size="lg" block className="mt-auto" onClick={() => navigate(`/orders/${st.order.id}`, { replace: true, tab: true })}>
                See order
              </Button>
            </motion.div>
          )}
          {st.s === 'failed' && (
            <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="flex flex-1 flex-col justify-center pb-16">
              <h1 className="t-32 text-ink">Not paid</h1>
              <div className="mt-6">
                <BankProcess steps={PAY_STEPS} current={2} error={st.reason} onRetry={verify} />
              </div>
              <Button variant="secondary" size="lg" block className="mt-6" onClick={() => navigate('/shop', { replace: true, tab: true })}>
                Back to offers
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
