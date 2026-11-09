import { MapPin, RefreshCw, Store } from 'lucide-react';
import { AnimatePresence, motion, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import { Page } from '../../components/layout/Page';
import { ExpiryBadge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/Feedback';
import { Photo } from '../../components/ui/Photo';
import { api } from '../../lib/api';
import { BUYER } from '../../lib/mock/catalogue';
import { today } from '../../lib/dates';
import { naira } from '../../lib/format';
import { pressSpring, spring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { offers, type BatchView } from '../../lib/selectors';
import { useDb } from '../../lib/store';
import { usePullToRefresh } from '../../lib/usePullToRefresh';

let firstVisit = true;

export function Shop() {
  const db = useDb();
  const list = offers(db, today());
  const [loading, setLoading] = useState(firstVisit);

  // First visit: fetch fresh offers behind skeletons that match the cards.
  useEffect(() => {
    if (!firstVisit) return;
    firstVisit = false;
    api.refresh().finally(() => setLoading(false));
  }, []);

  const { y, refreshing, trigger } = usePullToRefresh(() => api.refresh());
  const indicatorOpacity = useTransform(y, [0, trigger * 0.6, trigger], [0, 0.4, 1]);
  const indicatorRotate = useTransform(y, [0, trigger], [0, 270]);

  return (
    <Page title="Shop">
      <motion.div style={{ opacity: indicatorOpacity }} className="pointer-events-none absolute inset-x-0 top-[calc(var(--safe-top)+64px)] flex justify-center lg:hidden" aria-hidden="true">
        <span className="flex size-9 items-center justify-center rounded-full bg-surface text-deep shadow-card">
          {refreshing ? (
            <Spinner className="size-5" />
          ) : (
            <motion.span style={{ rotate: indicatorRotate }}>
              <RefreshCw className="size-5" />
            </motion.span>
          )}
        </span>
      </motion.div>
      <p className="sr-only" aria-live="polite">
        {refreshing ? 'Refreshing offers' : ''}
      </p>

      <motion.div style={{ y }}>
        <p className="t-label mb-4 flex items-center gap-1.5 text-muted">
          <MapPin className="size-4" /> Near {BUYER.area}
        </p>
        {loading ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading offers">
            {[0, 1, 2].map((i) => (
              <li key={i} className="overflow-hidden rounded-[20px] bg-surface ring-1 ring-hairline">
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </li>
            ))}
          </ul>
        ) : list.length === 0 ? (
          <EmptyState icon={<Store className="size-7" />} title="No offers right now" line="New stock shows up here first." />
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {list.map((v) => (
                <OfferCard key={v.batch.id} v={v} distance={BUYER.distanceKm} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>
    </Page>
  );
}

function OfferCard({ v, distance }: { v: BatchView; distance: number }) {
  const { batch: b, product: p } = v;
  const listing = b.listing!;
  return (
    <motion.li layout="position" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={spring}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        transition={pressSpring}
        onClick={() => navigate(`/shop/${b.id}`)}
        className="block w-full overflow-hidden rounded-[20px] bg-surface text-left shadow-card ring-1 ring-hairline"
        aria-label={`${p.name}, ${naira(listing.unitPrice)}, was ${naira(p.price)}`}
      >
        <motion.div layoutId={`offer-img-${b.id}`} transition={spring} className="relative aspect-[16/10] overflow-hidden bg-sunken">
          <Photo image={p.image} focus={p.focus} zoom={p.zoom} sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" className="h-full w-full" alt="" />
          <span className="num t-caption absolute top-3 left-3 rounded-full bg-amber px-2.5 py-1 font-semibold text-deep">{listing.discountPct}% off</span>
        </motion.div>
        <div className="p-4">
          <p className="truncate text-[17px] font-semibold leading-6 text-deep">{p.name}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="num text-[20px] font-semibold leading-7 text-deep">{naira(listing.unitPrice)}</span>
            <span className="num t-label text-muted">
              <span className="sr-only">was </span>
              <s>{naira(p.price)}</s>
            </span>
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="t-caption num text-muted">
              {distance.toFixed(1)} km · {b.quantity} left
            </span>
            <ExpiryBadge days={v.days} />
          </div>
        </div>
      </motion.button>
    </motion.li>
  );
}
