import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import type { Db, Order } from '../../../lib/api';
import { naira } from '../../../lib/format';
import { pressSpring } from '../../../lib/motion';
import { navigate } from '../../../lib/router';
import type { BatchView } from '../../../lib/selectors';
import { business } from '../../../lib/selectors';
import { expiryWords } from '../../data';
import { Pill } from '../../kit/core';
import { ProductPhoto } from '../../kit/media';

/** Big offer card: photo, price with the old price struck through, % off, days left. */
export function OfferCard({ v, db, big }: { v: BatchView; db: Db; big?: boolean }) {
  const l = v.batch.listing!;
  const seller = business(db, v.batch.sellerId);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      transition={pressSpring}
      onClick={() => navigate(`/shop/${v.batch.id}`)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[16px] bg-white text-left shadow-card ring-1 ring-hairline"
    >
      <div className="relative">
        <ProductPhoto product={v.product} layoutId={`offer-${v.batch.id}`} rounded="rounded-none" className={`w-full ${big ? 'h-48 sm:h-52' : 'h-40'}`} />
        <span className="absolute top-3 left-3 rounded-full bg-lime px-2.5 py-1 text-[0.875rem] font-bold text-forest">{l.discountPct}% off</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="t-16 truncate font-semibold text-ink">{v.product.name}</p>
        <p className="t-14 text-slate">{v.product.pack}</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="num">
            <span className="t-24 text-ink">{naira(l.unitPrice)}</span> <span className="t-14 text-slate line-through">{naira(v.product.price)}</span>
          </p>
          <Pill tone="amber">{expiryWords(v.days)}</Pill>
        </div>
        <p className="t-12 mt-2 flex items-center gap-1 text-slate">
          <MapPin className="size-3.5" /> {seller?.name} · {v.batch.quantity} cartons left
        </p>
      </div>
    </motion.button>
  );
}

export function orderStatus(o: Order): { label: string; tone: 'lime' | 'leaf' } {
  return o.status === 'handed_over' ? { label: 'Collected', tone: 'leaf' } : { label: 'Paid · ready', tone: 'lime' };
}
