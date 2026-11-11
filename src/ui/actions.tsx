import { Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { api, ApiError, type Order, type Payout, type PayoutPreview } from '../lib/api';
import { discountedPrice, FIRE_SALE_SHARE, suggestedDiscount } from '../lib/expiry';
import { naira } from '../lib/format';
import { haptic } from '../lib/haptics';
import { spring } from '../lib/motion';
import { toast } from '../lib/store';
import type { BatchInfo } from './data';
import { expiryWords } from './data';
import { BankCard, BankProcess } from './kit/bank';
import { Button, Pill, SuccessCheck } from './kit/core';
import { Slider } from './kit/fields';
import { ProductPhoto } from './kit/media';
import { Sheet } from './kit/sheet';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* List: discount slider with the live price                            */
/* ------------------------------------------------------------------ */

export function ListSheet({ info, open, onClose, onDone }: { info: BatchInfo | null; open: boolean; onClose: () => void; onDone?: () => void }) {
  return (
    <Sheet open={open && !!info} onClose={onClose} title={info?.batch.listing ? 'Change price' : 'List it'}>
      {info && <ListBody info={info} onClose={onClose} onDone={onDone} />}
    </Sheet>
  );
}

function ListBody({ info, onClose, onDone }: { info: BatchInfo; onClose: () => void; onDone?: () => void }) {
  const { product, batch, days } = info;
  const [pct, setPct] = useState(batch.listing?.discountPct ?? suggestedDiscount(days));
  const [step, setStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const price = discountedPrice(product.price, pct);
  const total = price * batch.quantity;
  const fire = Math.round(product.price * FIRE_SALE_SHARE) * batch.quantity;

  const go = async () => {
    setError(null);
    setStep(0);
    try {
      await api.listBatch(batch.id, pct, (s) => setStep(s === 'saving' ? 0 : s === 'notifying' ? 1 : 2));
      setStep(2);
      haptic();
      await wait(450);
      toast(`Listed · ${batch.quantity} cartons at ${naira(price)}`, 'success');
      onClose();
      onDone?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not list. Try again.');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <ProductPhoto product={product} className="size-16" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1.0625rem] font-semibold text-ink">{product.name}</p>
          <p className="t-14 num text-slate">
            {batch.quantity} cartons · full price {naira(product.price)}
          </p>
        </div>
        <Pill tone="amber">{expiryWords(days)}</Pill>
      </div>

      {step < 0 ? (
        <>
          <div className="mt-6">
            <Slider label="Discount" value={pct} onChange={setPct} min={10} max={60} format={(v) => `${v}% off`} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[14px] bg-white p-3 ring-1 ring-hairline">
              <p className="t-12 font-medium text-slate">Buyers pay</p>
              <p className="num t-24 text-ink">{naira(price)}</p>
              <p className="t-12 num text-slate line-through">{naira(product.price)}</p>
            </div>
            <div className="rounded-[14px] bg-lime-tint p-3 ring-1 ring-lime">
              <p className="t-12 font-medium text-forest">You recover</p>
              <p className="num t-24 text-forest">{naira(total)}</p>
              <p className="t-12 num text-forest/70">Fire sale: {naira(fire)}</p>
            </div>
          </div>
          <Button size="lg" block className="mt-6" icon={<Tag className="size-5" />} onClick={go}>
            {batch.listing ? 'Update price' : 'List now'}
          </Button>
        </>
      ) : (
        <div className="mt-6">
          <BankProcess steps={[{ label: 'Saving the price' }, { label: 'Telling buyers nearby' }, { label: 'Listed' }]} current={step} error={error} onRetry={go} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Payout: bank-resolved name → Pay out → Sending → Sent                */
/* ------------------------------------------------------------------ */

type PayState = { s: 'resolving' } | { s: 'ready'; preview: PayoutPreview } | { s: 'sending'; preview: PayoutPreview } | { s: 'sent'; payout: Payout } | { s: 'error'; message: string; preview?: PayoutPreview };

/** Generic transfer sheet: order payouts and the carbon share use the same flow. */
export function TransferSheet({
  open,
  onClose,
  title,
  enquire,
  send,
  existing,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  enquire: () => Promise<PayoutPreview>;
  send: () => Promise<Payout>;
  existing?: Payout;
  onDone?: (p: Payout) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <TransferBody enquire={enquire} send={send} existing={existing} onClose={onClose} onDone={onDone} />
    </Sheet>
  );
}

function TransferBody({ enquire, send, existing, onClose, onDone }: { enquire: () => Promise<PayoutPreview>; send: () => Promise<Payout>; existing?: Payout; onClose: () => void; onDone?: (p: Payout) => void }) {
  const [st, setSt] = useState<PayState>(existing?.status === 'successful' ? { s: 'sent', payout: existing } : { s: 'resolving' });
  const alive = useRef(true);
  const started = useRef(false);

  const resolve = async () => {
    setSt({ s: 'resolving' });
    try {
      const p = await enquire();
      if (alive.current) setSt({ s: 'ready', preview: p });
    } catch (e) {
      if (alive.current) setSt({ s: 'error', message: e instanceof ApiError ? e.message : 'Could not reach the bank.' });
    }
  };

  useEffect(() => {
    alive.current = true;
    // One enquiry per sheet, even when React mounts the effect twice.
    if (st.s === 'resolving' && !started.current) {
      started.current = true;
      void resolve();
    }
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = async (preview: PayoutPreview) => {
    setSt({ s: 'sending', preview });
    try {
      const p = await send();
      if (!alive.current) return;
      if (p.status === 'successful') {
        haptic();
        setSt({ s: 'sent', payout: p });
        onDone?.(p);
      } else if (p.status === 'failed') setSt({ s: 'error', message: 'The bank did not complete this transfer.', preview });
      // Pending/unknown: never resend. Show it as sending; the webhook finishes it.
      else setSt({ s: 'sent', payout: p });
    } catch (e) {
      if (alive.current) setSt({ s: 'error', message: e instanceof ApiError ? e.message : 'Could not reach the bank.', preview });
    }
  };

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {st.s === 'resolving' && (
        <motion.div key="r" exit={{ opacity: 0 }} transition={spring}>
          <BankProcess steps={[{ label: 'Checking the account name' }, { label: 'Ready to pay' }]} current={0} />
        </motion.div>
      )}
      {(st.s === 'ready' || st.s === 'sending' || (st.s === 'error' && st.preview)) && (
        <motion.div key="p" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          {(() => {
            const preview = st.s === 'error' ? st.preview! : st.preview;
            return (
              <>
                <p className="t-12 font-semibold tracking-[0.06em] text-slate uppercase">Pay to · bank-resolved name</p>
                <p className="t-24 mt-1 break-words text-ink">{preview.accountName}</p>
                <p className="mono mt-1 text-slate">
                  {preview.bankName} · {preview.accountNumber}
                </p>
                <div className="mt-5 rounded-[16px] bg-lime-tint p-4 ring-1 ring-lime">
                  <p className="t-12 font-medium text-forest">Amount</p>
                  <p className="num t-32 text-forest">{naira(preview.amount)}</p>
                  <p className="t-12 text-forest/70">Fees come from the bank and show after sending.</p>
                </div>
                <div className="mt-5">
                  {st.s === 'sending' ? (
                    <BankProcess steps={[{ label: 'Sending to the bank' }, { label: 'Sent' }]} current={0} />
                  ) : st.s === 'error' ? (
                    <BankProcess steps={[{ label: 'Sending to the bank' }]} current={0} error={st.message} onRetry={() => go(preview)} />
                  ) : (
                    <Button size="lg" variant="dark" block onClick={() => go(preview)}>
                      Pay out {naira(preview.amount)}
                    </Button>
                  )}
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
      {st.s === 'error' && !st.preview && (
        <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BankProcess steps={[{ label: 'Checking the account name' }]} current={0} error={st.message} onRetry={resolve} />
        </motion.div>
      )}
      {st.s === 'sent' && (
        <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-col items-center text-center">
          <SuccessCheck size={72} />
          <p className="t-24 mt-4 text-ink">{st.payout.status === 'successful' ? 'Sent' : 'Sending'}</p>
          <p className="num t-32 text-forest">{naira(st.payout.amount)}</p>
          <BankCard
            className="mt-5 w-full text-left"
            title={st.payout.accountName}
            reference={st.payout.reference}
            status={st.payout.status === 'successful' ? 'Sent' : 'With the bank'}
            tone={st.payout.status === 'successful' ? 'leaf' : 'amber'}
          >
            <p className="t-14 num text-slate">
              Fee {naira(st.payout.fee ?? 0)} · VAT {naira(st.payout.vat ?? 0)} · stamp duty {naira(st.payout.stampDuty ?? 0)}
            </p>
            {st.payout.totalDebit !== undefined && <p className="t-14 num text-slate">Total debit {naira(st.payout.totalDebit)}</p>}
          </BankCard>
          <Button size="lg" block className="mt-5" onClick={onClose}>
            Done
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PayoutSheet({ order, open, onClose }: { order: Order | null; open: boolean; onClose: () => void }) {
  if (!order) return null;
  return (
    <TransferSheet
      open={open}
      onClose={onClose}
      title="Pay out"
      existing={order.payout}
      enquire={() => api.enquirePayout(order.id)}
      send={() => api.sendPayout(order.id)}
      onDone={(p) => toast(`${naira(p.amount)} paid out to you`, 'success')}
    />
  );
}
