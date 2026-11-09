import { ArrowRight, Ban, ChevronLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ExpiryBadge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button, IconButton } from '../../components/ui/Button';
import { CountUp, ProgressSteps } from '../../components/ui/Feedback';
import { Photo } from '../../components/ui/Photo';
import { api, ApiError } from '../../lib/api';
import { FOOD_BANK } from '../../lib/mock/catalogue';
import { canTrade, discountedPrice, recoveredVsFireSale, suggestedDiscount, URGENT_DAYS } from '../../lib/expiry';
import { ago, naira, shortDate } from '../../lib/format';
import { spring } from '../../lib/motion';
import type { BatchView } from '../../lib/selectors';
import { highlight, toast } from '../../lib/store';

type Mode = 'detail' | 'list' | 'listing' | 'donate';

const LIST_STEPS = [{ label: 'Saving' }, { label: 'Notifying buyers nearby' }, { label: 'Listed' }];

export function BatchSheet({ view, onClose }: { view: BatchView | null; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>('detail');
  const [discount, setDiscount] = useState(25);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [frozen, setFrozen] = useState<BatchView | null>(view);

  // Keep showing the last batch while the sheet animates out.
  useEffect(() => {
    if (view) {
      setFrozen(view);
    }
  }, [view]);
  useEffect(() => {
    if (view) {
      setMode('detail');
      setStep(0);
      setBusy(false);
      setDiscount(suggestedDiscount(view.days));
    }
    // reset only when a different batch opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.batch.id]);

  const v = view ?? frozen;
  if (!v) return <BottomSheet open={false} onClose={onClose} children={null} />;

  const { batch: b, product: p, days } = v;
  const tradeable = canTrade(b.expiry);
  const price = discountedPrice(p.price, discount);
  const extra = recoveredVsFireSale(p.price, price, b.quantity);
  const canDonate = tradeable && days <= URGENT_DAYS && !b.donation;

  const list = async () => {
    setMode('listing');
    setStep(0);
    try {
      await api.listBatch(b.id, discount, (s) => setStep(s === 'saving' ? 0 : s === 'notifying' ? 1 : 3));
      await new Promise((r) => setTimeout(r, 650));
      onClose();
      highlight(b.id);
      toast('Listed', 'success');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not list.', 'error');
      setMode('list');
    }
  };

  const donate = async () => {
    setBusy(true);
    try {
      await api.donateBatch(b.id);
      onClose();
      highlight(b.id);
      toast('Offered to food bank', 'success');
    } catch (e) {
      setBusy(false);
      toast(e instanceof ApiError ? e.message : 'Could not offer.', 'error');
    }
  };

  const title = mode === 'list' || mode === 'listing' ? 'List for sale' : mode === 'donate' ? 'Donate' : p.name;

  const footer =
    mode === 'detail' ? (
      tradeable && !b.listing && !b.donation ? (
        <div className="flex gap-2">
          {canDonate && (
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setMode('donate')}>
              Donate
            </Button>
          )}
          <Button size="lg" className="flex-[2]" onClick={() => setMode('list')} data-autofocus>
            List for sale
          </Button>
        </div>
      ) : null
    ) : mode === 'list' ? (
      <Button size="lg" block onClick={list} disabled={!tradeable}>
        List now
      </Button>
    ) : mode === 'donate' ? (
      <div className="flex gap-2">
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => setMode('detail')} disabled={busy}>
          Cancel
        </Button>
        <Button size="lg" className="flex-1" loading={busy} loadingLabel="Offering" onClick={donate}>
          Offer
        </Button>
      </div>
    ) : null;

  return (
    <BottomSheet
      open={!!view}
      onClose={onClose}
      locked={mode === 'listing'}
      title={
        mode === 'list' || mode === 'donate' ? (
          <span className="-ml-2 flex items-center gap-1">
            <IconButton label="Back" onClick={() => setMode('detail')}>
              <ChevronLeft className="size-6" />
            </IconButton>
            {title}
          </span>
        ) : (
          title
        )
      }
      label={title}
      footer={footer}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {mode === 'detail' && (
          <motion.div key="detail" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={spring}>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] bg-sunken">
              <Photo image={p.image} focus={p.focus} zoom={p.zoom} sizes="(min-width: 1024px) 400px, 100vw" className="h-full w-full" alt="" />
            </div>
            <dl className="mt-4 divide-y divide-hairline">
              <Row label="Expires">
                <span className="flex items-center gap-2">
                  <span className="num">{shortDate(b.expiry)}</span>
                  <ExpiryBadge days={days} />
                </span>
              </Row>
              <Row label="Quantity">
                <span className="num">{b.quantity} cartons</span>
              </Row>
              <Row label="Pack">{p.pack}</Row>
              <Row label="Batch">{b.batchNo}</Row>
              <Row label="Price">
                <span className="num">{naira(p.price)}</span>
              </Row>
              {b.listing && (
                <Row label="Listed">
                  <span className="num">
                    {naira(b.listing.unitPrice)} · {b.listing.discountPct}% off · {ago(b.listing.listedAt)}
                  </span>
                </Row>
              )}
              {b.donation && <Row label="Food bank">{b.donation.status === 'offered' ? 'Waiting for pickup' : 'Collected'}</Row>}
            </dl>
            {!tradeable && (
              <p className="mt-4 flex items-center gap-2 rounded-[12px] bg-danger-tint px-4 py-3 t-label text-danger">
                <Ban className="size-5 shrink-0" />
                Expired stock can't be sold or donated.
              </p>
            )}
          </motion.div>
        )}

        {mode === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={spring}>
            <div className="rounded-[20px] bg-surface p-5 shadow-soft ring-1 ring-hairline">
              <p className="t-label text-muted">Price per carton</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="num text-[18px] leading-7 text-muted line-through decoration-1">{naira(p.price)}</span>
                <ArrowRight className="size-5 text-muted" aria-hidden="true" />
                <CountUp from="value" value={price} format={naira} className="text-[32px] font-semibold leading-[38px] tracking-[-0.01em] text-deep" />
              </div>
              <label htmlFor="discount" className="mt-5 flex items-baseline justify-between">
                <span className="t-label text-deep">Discount</span>
                <span className="num text-[20px] font-semibold leading-7 text-deep">{discount}%</span>
              </label>
              <input
                id="discount"
                type="range"
                min={10}
                max={50}
                step={5}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="range mt-1"
                style={{ ['--fill' as string]: `${((discount - 10) / 40) * 100}%` }}
                aria-valuetext={`${discount}% off, ${naira(price)}`}
              />
              <div className="t-caption flex justify-between text-muted" aria-hidden="true">
                <span>10%</span>
                <span>50%</span>
              </div>
            </div>
            <p className="t-label mt-4 text-center text-success-ink">
              You recover <CountUp from="value" value={extra} format={naira} className="font-semibold" /> more than a fire sale
            </p>
            {!tradeable && <p className="t-label mt-3 text-center text-danger">Expired stock can't be listed.</p>}
          </motion.div>
        )}

        {mode === 'listing' && (
          <motion.div key="listing" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={spring} className="py-4">
            <p className="num t-heading mb-4 text-deep">
              {b.quantity} cartons at {naira(price)}
            </p>
            <ProgressSteps steps={LIST_STEPS} current={step} />
          </motion.div>
        )}

        {mode === 'donate' && (
          <motion.div key="donate" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={spring} className="py-2">
            <p className="t-heading text-deep">
              Offer {b.quantity} cartons to {FOOD_BANK.name}?
            </p>
            <p className="t-label mt-2 text-muted">They collect before {shortDate(b.expiry)}.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 py-2">
      <dt className="t-label text-muted">{label}</dt>
      <dd className="text-right text-[15px] font-medium leading-6 text-deep">{children}</dd>
    </div>
  );
}
