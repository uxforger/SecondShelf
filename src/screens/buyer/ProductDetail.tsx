import { ChevronLeft, MapPin, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { contentWidth } from '../../components/layout/Page';
import { Badge, ExpiryBadge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button, IconButton } from '../../components/ui/Button';
import { Figure, EmptyState } from '../../components/ui/Feedback';
import { Photo } from '../../components/ui/Photo';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import type { Fulfilment, Session } from '../../lib/api';
import { BUYER } from '../../lib/mock/catalogue';
import { today } from '../../lib/dates';
import { naira, shortDate } from '../../lib/format';
import { spring } from '../../lib/motion';
import { goBack } from '../../lib/router';
import { business, viewOf } from '../../lib/selectors';
import { useDb } from '../../lib/store';
import { Payment } from './Payment';

const DELIVERY_FEE = 1500;

export function ProductDetail({ id }: { id: string; session: Session }) {
  const db = useDb();
  const batch = db.batches.find((b) => b.id === id);
  const v = useMemo(() => (batch ? viewOf(db, batch, today()) : null), [db, batch]);
  const [qty, setQty] = useState(10);
  const [checkout, setCheckout] = useState(false);
  const [fulfilment, setFulfilment] = useState<Fulfilment>('pickup');
  const [paying, setPaying] = useState(false);

  if (!v || !v.batch.listing) {
    return (
      <div className={`${contentWidth} pt-[max(16px,var(--safe-top))]`}>
        <IconButton label="Back" onClick={() => goBack('/shop')} className="-ml-3">
          <ChevronLeft className="size-6" />
        </IconButton>
        <EmptyState icon={<Store className="size-7" />} title="Offer ended" line="This stock has sold or been withdrawn." />
      </div>
    );
  }

  const { batch: b, product: p, days } = v;
  const listing = b.listing!;
  const seller = business(db, b.sellerId);
  const max = Math.max(1, b.quantity);
  const q = Math.min(qty, max);
  const subtotal = listing.unitPrice * q;
  const fee = fulfilment === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + fee;
  const soldOut = b.quantity <= 0 || days <= 0;

  return (
    <div className="min-h-dvh pb-[calc(96px+var(--safe-bottom))] lg:pb-16">
      <div className="lg:mx-auto lg:grid lg:max-w-[1200px] lg:grid-cols-2 lg:gap-10 lg:px-10 lg:pt-10">
        {/* Shared element: the card image grows into this header. */}
        <motion.div layoutId={`offer-img-${b.id}`} transition={spring} className="relative aspect-[4/3] overflow-hidden bg-sunken lg:rounded-[28px]">
          <Photo image={p.image} focus={p.focus} zoom={p.zoom} eager sizes="(min-width: 1024px) 600px, 100vw" className="h-full w-full" alt="" />
          <div className="absolute top-0 left-0 p-3 pt-[max(12px,var(--safe-top))]">
            <IconButton label="Back" tone="dark" onClick={() => goBack('/shop')}>
              <ChevronLeft className="size-6" />
            </IconButton>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.05 }} className="px-4 pt-5 md:px-6 lg:px-0 lg:pt-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="t-title text-deep">{p.name}</h1>
              <p className="t-label mt-1 text-muted">{p.pack}</p>
            </div>
            <ExpiryBadge days={days} />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="num text-[2rem] font-semibold leading-[2.375rem] tracking-[-0.01em] text-deep">{naira(listing.unitPrice)}</span>
            <span className="num t-body text-muted">
              <span className="sr-only">was </span>
              <s>{naira(p.price)}</s>
            </span>
            <Badge tone="warning" dot={false}>
              {listing.discountPct}% off
            </Badge>
          </div>

          <p className="t-label num mt-3 flex items-center gap-1.5 text-muted">
            <MapPin className="size-4" />
            {seller?.name}, {seller?.area} · {BUYER.distanceKm} km · use by {shortDate(b.expiry)}
          </p>

          <div className="mt-6">
            <QuantityStepper label="Cartons" value={q} onChange={setQty} min={1} max={max} unit={`of ${b.quantity}`} />
          </div>

          <div className="mt-5 hidden items-center justify-between lg:flex">
            <span className="t-label text-muted">Total</span>
            <Figure value={subtotal} format={naira} className="text-[1.5rem] font-semibold text-deep" />
          </div>
          <Button size="lg" block className="mt-4 max-lg:hidden" disabled={soldOut} onClick={() => setCheckout(true)}>
            Buy
          </Button>
        </motion.div>
      </div>

      {/* Phone: sticky buy bar */}
      <div className="material fixed inset-x-0 bottom-0 z-30 border-t border-hairline pb-safe lg:hidden">
        <div className={`${contentWidth} flex h-20 items-center gap-4`}>
          <div className="min-w-0 flex-1">
            <p className="t-caption text-muted">Total</p>
            <Figure value={subtotal} format={naira} className="text-[1.375rem] font-semibold leading-7 text-deep" />
          </div>
          <Button size="lg" className="w-40" disabled={soldOut} onClick={() => setCheckout(true)}>
            Buy
          </Button>
        </div>
      </div>

      <BottomSheet
        open={checkout}
        onClose={() => setCheckout(false)}
        title="Checkout"
        footer={
          <Button
            size="lg"
            block
            onClick={() => {
              setCheckout(false);
              setPaying(true);
            }}
            data-autofocus
          >
            Pay with Access Bank
          </Button>
        }
      >
        <dl className="divide-y divide-hairline">
          <div className="flex min-h-14 items-center justify-between gap-4 py-2">
            <dt className="min-w-0">
              <p className="truncate text-[1rem] font-medium text-deep">{p.name}</p>
              <p className="t-caption num text-muted">
                {q} × {naira(listing.unitPrice)}
              </p>
            </dt>
            <dd className="num text-[1rem] font-medium text-deep">{naira(subtotal)}</dd>
          </div>
          <div className="py-4">
            <dt className="sr-only">Fulfilment</dt>
            <dd>
              <SegmentedControl
                label="Fulfilment"
                value={fulfilment}
                onChange={setFulfilment}
                options={[
                  { value: 'pickup', label: 'Pickup' },
                  { value: 'delivery', label: `Delivery +${naira(DELIVERY_FEE)}` },
                ]}
              />
            </dd>
          </div>
          <div className="flex min-h-14 items-center justify-between py-2">
            <dt className="t-heading text-deep">Total</dt>
            <dd>
              <Figure value={total} format={naira} className="text-[1.5rem] font-semibold text-deep" />
            </dd>
          </div>
        </dl>
      </BottomSheet>

      <Payment
        open={paying}
        input={{ batchId: b.id, qty: q, fulfilment }}
        total={total}
        onClose={() => setPaying(false)}
      />
    </div>
  );
}
