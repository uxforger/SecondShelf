import { Landmark, MapPin, Truck } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { api, ApiError, type Fulfilment, type Session } from '../../../lib/api';
import { today } from '../../../lib/dates';
import { naira, shortDate } from '../../../lib/format';
import { navigate } from '../../../lib/router';
import { business, viewOf } from '../../../lib/selectors';
import { useDb } from '../../../lib/store';
import { expiryWords } from '../../data';
import { BankProcess } from '../../kit/bank';
import { Button, Card, Pill } from '../../kit/core';
import { Segmented, Stepper } from '../../kit/fields';
import { ProductPhoto } from '../../kit/media';
import { Sheet } from '../../kit/sheet';
import { Page } from '../../shell';

/** Same as the server's delivery fee (src/server/flows.ts). */
const DELIVERY_FEE = 1500;
export const PAY_STEPS = [{ label: 'Opening secure checkout' }, { label: 'Bank page' }, { label: 'Confirming with bank' }, { label: 'Paid' }];

export function Product({ id, session }: { id: string; session: Session }) {
  const db = useDb();
  const v = useMemo(() => {
    const b = db.batches.find((x) => x.id === id);
    return b ? viewOf(db, b, today()) : null;
  }, [db, id]);
  const [qty, setQty] = useState(10);
  const [ful, setFul] = useState<Fulfilment>('pickup');
  const [checkout, setCheckout] = useState(false);

  if (!v || !v.batch.listing || v.batch.quantity <= 0 || v.days <= 0) {
    return (
      <Page title="Offer" back="/shop" session={session}>
        <p className="t-16 text-slate">This offer has ended.</p>
        <Button className="mt-4" onClick={() => navigate('/shop', { tab: true })}>
          See other offers
        </Button>
      </Page>
    );
  }
  const l = v.batch.listing;
  const q = Math.min(qty, v.batch.quantity);
  const fee = ful === 'delivery' ? DELIVERY_FEE : 0;
  const total = l.unitPrice * q + fee;
  const saved = (v.product.price - l.unitPrice) * q;
  const seller = business(db, v.batch.sellerId);

  return (
    <Page title={v.product.name} back="/shop" session={session}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden lg:col-span-7">
          <div className="relative">
            <ProductPhoto product={v.product} layoutId={`offer-${v.batch.id}`} rounded="rounded-none" className="h-64 w-full sm:h-80 lg:h-[420px]" eager />
            <span className="absolute top-4 left-4 rounded-full bg-lime px-3 py-1.5 text-[1rem] font-bold text-forest">{l.discountPct}% off</span>
          </div>
          <div className="p-5 lg:p-6">
            <p className="num">
              <span className="t-32 text-ink">{naira(l.unitPrice)}</span> <span className="t-16 text-slate line-through">{naira(v.product.price)}</span>
              <span className="t-14 ml-2 text-slate">a carton</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone="amber">{expiryWords(v.days)}</Pill>
              <Pill dot={false}>Use by {shortDate(v.batch.expiry)}</Pill>
            </div>
            <p className="t-14 mt-4 flex items-center gap-1.5 text-slate">
              <MapPin className="size-4" /> {seller?.name} · {seller?.area} · {v.product.pack}
            </p>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-5 lg:p-6">
          <Stepper label="Cartons" value={q} onChange={setQty} min={1} max={v.batch.quantity} unit={`of ${v.batch.quantity}`} />
          <p className="t-14 mb-1.5 font-medium text-ink">How you get it</p>
          <Segmented
            label="How you get it"
            value={ful}
            onChange={setFul}
            options={[
              { value: 'pickup', label: 'Pick up' },
              { value: 'delivery', label: `Delivery ${naira(DELIVERY_FEE)}` },
            ]}
          />
          <dl className="t-16 mt-5 space-y-2 border-t border-hairline pt-4">
            <div className="flex justify-between">
              <dt className="text-slate">
                {q} × {naira(l.unitPrice)}
              </dt>
              <dd className="num text-ink">{naira(l.unitPrice * q)}</dd>
            </div>
            {fee > 0 && (
              <div className="flex justify-between">
                <dt className="flex items-center gap-1.5 text-slate">
                  <Truck className="size-4" /> Delivery
                </dt>
                <dd className="num text-ink">{naira(fee)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-hairline pt-3">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="num t-24 text-ink">{naira(total)}</dd>
            </div>
            <p className="t-14 text-right">
              <span className="num rounded-md bg-lime px-1.5 font-semibold text-forest">You save {naira(saved)}</span>
            </p>
          </dl>
          <Button size="lg" block className="mt-5" onClick={() => setCheckout(true)}>
            Buy
          </Button>
        </Card>
      </div>

      <Checkout open={checkout} onClose={() => setCheckout(false)} batchId={v.batch.id} qty={q} fulfilment={ful} total={total} name={v.product.name} />
    </Page>
  );
}

function Checkout({ open, onClose, batchId, qty, fulfilment, total, name }: { open: boolean; onClose: () => void; batchId: string; qty: number; fulfilment: Fulfilment; total: number; name: string }) {
  const [step, setStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  const pay = async () => {
    cancelled.current = false;
    setError(null);
    setStep(0);
    try {
      const started = Date.now();
      const c = await api.startCheckout({ batchId, qty, fulfilment });
      const spent = Date.now() - started;
      if (spent < 500) await new Promise((r) => setTimeout(r, 500 - spent));
      if (cancelled.current) return;
      setStep(1);
      try {
        sessionStorage.setItem('secondshelf_pending_payment', JSON.stringify({ reference: c.reference, batchId }));
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, 400));
      if (!cancelled.current) window.location.assign(c.paymentUrl);
    } catch (e) {
      if (!cancelled.current) setError(e instanceof ApiError ? e.message : 'Could not reach the bank.');
    }
  };

  const close = () => {
    cancelled.current = true;
    setStep(-1);
    setError(null);
    onClose();
  };

  return (
    <Sheet open={open} onClose={close} title="Checkout" locked={step === 1}>
      <p className="t-14 text-slate">
        {name} · {qty} cartons · {fulfilment === 'pickup' ? 'pick up' : 'delivery'}
      </p>
      <p className="num t-32 mt-1 text-ink">{naira(total)}</p>
      {step < 0 ? (
        <>
          <p className="t-14 mt-4 text-slate">You pay on the bank's secure page. Nothing is charged here.</p>
          <Button size="lg" variant="dark" block className="mt-6" icon={<Landmark className="size-5" />} onClick={pay}>
            Pay with bank
          </Button>
        </>
      ) : (
        <div className="mt-6">
          <BankProcess steps={PAY_STEPS} current={step} error={error} onRetry={pay} />
        </div>
      )}
    </Sheet>
  );
}
