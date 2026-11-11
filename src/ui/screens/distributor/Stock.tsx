import { ChevronRight, ScanLine } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import type { Session } from '../../../lib/api';
import { ALERT_DAYS } from '../../../lib/expiry';
import { naira, shortDate } from '../../../lib/format';
import { spring } from '../../../lib/motion';
import { navigate } from '../../../lib/router';
import { useDb, useHighlight } from '../../../lib/store';
import { allBatches, expiryWords, type BatchInfo } from '../../data';
import { Button, Card, Pill, Tap, type Tone } from '../../kit/core';
import { ProductPhoto } from '../../kit/media';
import { Page } from '../../shell';

interface Group {
  key: string;
  title: string;
  items: BatchInfo[];
}

export function Stock({ session }: { session: Session }) {
  const db = useDb();
  const groups = useMemo<Group[]>(() => {
    const all = allBatches(db);
    const g: Record<string, BatchInfo[]> = { soon: [], listed: [], stock: [], sold: [], expired: [] };
    for (const b of all) {
      if (b.expired) g.expired.push(b);
      else if (b.batch.quantity <= 0) {
        if (b.orders.length) g.sold.push(b);
      } else if (b.batch.listing) g.listed.push(b);
      else if (b.batch.donation) continue;
      else if (b.days <= ALERT_DAYS) g.soon.push(b);
      else g.stock.push(b);
    }
    // A listed batch that has already sold some stock also shows its sale journey under Sold.
    for (const b of g.listed) if (b.orders.length) g.sold.push(b);
    g.soon.sort((a, b) => a.days - b.days);
    g.listed.sort((a, b) => a.days - b.days);
    g.stock.sort((a, b) => a.days - b.days);
    g.sold.sort((a, b) => (b.latest?.paidAt ?? '').localeCompare(a.latest?.paidAt ?? ''));
    return [
      { key: 'soon', title: 'Expiring soon', items: g.soon },
      { key: 'listed', title: 'Listed', items: g.listed },
      { key: 'stock', title: 'In stock', items: g.stock },
      { key: 'sold', title: 'Sold', items: g.sold },
      { key: 'expired', title: 'Expired', items: g.expired },
    ];
  }, [db]);

  return (
    <Page
      title="Stock"
      session={session}
      actions={
        <Button size="sm" className="max-lg:hidden" icon={<ScanLine className="size-4" />} onClick={() => navigate('/scan', { tab: true })}>
          Scan stock
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.key} className={`p-5 lg:p-6 ${g.key === 'sold' ? 'lg:col-span-2' : ''}`}>
            <h2 className="t-20 text-ink">
              {g.title}
              <span className="num ml-2 font-sans text-[0.9375rem] font-medium text-slate">{g.items.length}</span>
            </h2>
            {g.items.length ? (
              <motion.ul layout transition={spring} className={`-mx-2 mt-2 ${g.key === 'sold' ? 'lg:grid lg:grid-cols-2 lg:gap-x-4' : ''}`}>
                <AnimatePresence initial={false}>
                  {g.items.map((b) => (
                    <motion.li key={`${g.key}-${b.batch.id}`} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
                      <Row info={b} group={g.key} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <p className="t-14 mt-2 text-slate">{EMPTY[g.key]}</p>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}

const EMPTY: Record<string, string> = {
  soon: 'Nothing inside six weeks.',
  listed: 'Nothing listed right now.',
  stock: 'Scan stock as it arrives.',
  sold: 'Sales show here after payment.',
  expired: 'Nothing expired.',
};

function Row({ info, group }: { info: BatchInfo; group: string }) {
  const hl = useHighlight();
  const { product, batch, days } = info;
  const [tone, label]: [Tone, string] =
    group === 'sold'
      ? [info.latest?.payout?.status === 'successful' ? 'leaf' : 'lime', info.status]
      : group === 'expired'
        ? ['coral', 'Expired']
        : group === 'listed'
          ? ['leaf', `${batch.listing!.discountPct}% off`]
          : [days <= ALERT_DAYS ? 'amber' : 'neutral', expiryWords(days)];
  const line =
    group === 'sold' && info.latest
      ? `${info.latest.qty} cartons · ${naira(info.latest.total)}`
      : group === 'listed'
        ? `${batch.quantity} cartons · ${naira(batch.listing!.unitPrice)}`
        : group === 'expired'
          ? `${batch.quantity} cartons · ${shortDate(batch.expiry)}`
          : `${batch.quantity} cartons`;
  return (
    <Tap onClick={() => navigate(`/batch/${batch.id}`)} className={`flex items-center gap-3 rounded-[12px] px-2 py-2.5 transition-colors hover:bg-paper ${hl === batch.id ? 'bg-lime-tint' : ''}`}>
      <ProductPhoto product={product} layoutId={`photo-${batch.id}`} className="size-12" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[1rem] font-semibold text-ink">{product.name}</span>
        <span className="t-14 num block truncate text-slate">{line}</span>
      </span>
      <Pill tone={tone}>{label}</Pill>
      <ChevronRight className="size-5 shrink-0 text-slate max-sm:hidden" />
    </Tap>
  );
}
