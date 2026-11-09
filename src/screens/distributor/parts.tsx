import { HandHeart, Leaf, PackagePlus, ReceiptText, Share2, Tag, Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Badge, ExpiryBadge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { CountUp } from '../../components/ui/Feedback';
import { Photo } from '../../components/ui/Photo';
import type { Activity, ImageKey } from '../../lib/api';
import { ago, naira, nairaShort, tonnes, weight } from '../../lib/format';
import { spring } from '../../lib/motion';
import type { BatchView, Metrics } from '../../lib/selectors';

export function Thumb({ image, focus, zoom, className = 'size-12' }: { image: ImageKey; focus: string; zoom?: number; className?: string }) {
  return (
    <div className={`shrink-0 overflow-hidden rounded-[12px] bg-sunken ${className}`}>
      <Photo image={image} focus={focus} zoom={zoom} sizes="96px" className="h-full w-full" alt="" />
    </div>
  );
}

/** A stock row. Moves between sections with a shared layout animation. */
export function BatchRow({ v, onOpen, highlighted }: { v: BatchView; onOpen: () => void; highlighted: boolean }) {
  const { batch: b, product: p } = v;
  const subtitle = b.listing
    ? `${naira(b.listing.unitPrice)} · ${b.listing.discountPct}% off · ${b.quantity} left`
    : b.donation?.status === 'offered'
      ? `${b.donation.qty} cartons · waiting for pickup`
      : `${b.quantity} cartons · ${b.batchNo}`;
  return (
    <motion.li
      layout="position"
      layoutId={`batch-${b.id}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={spring}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={onOpen}
        animate={{ backgroundColor: highlighted ? 'rgba(227,237,224,1)' : 'rgba(227,237,224,0)' }}
        transition={{ backgroundColor: { duration: highlighted ? 0.2 : 1.2 } }}
        className="flex min-h-[72px] w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left"
      >
        <Thumb image={p.image} focus={p.focus} zoom={p.zoom} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-medium leading-6 text-deep">{p.name}</div>
          <div className="t-caption num mt-0.5 truncate text-muted">{subtitle}</div>
        </div>
        <ExpiryBadge days={v.days} />
      </motion.button>
    </motion.li>
  );
}

export function StatBlock({ label, children, note }: { label: string; children: ReactNode; note?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="t-label text-muted">{label}</p>
      <p className="mt-1 text-[28px] font-semibold leading-[34px] tracking-[-0.01em] text-deep lg:text-[32px] lg:leading-[38px]">{children}</p>
      {note && <div className="t-caption mt-1 text-muted">{note}</div>}
    </div>
  );
}

export function MoneyCard({ m }: { m: Metrics }) {
  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="t-heading text-deep">Money</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 2xl:grid-cols-3">
        <div className="col-span-2 2xl:col-span-1">
          <StatBlock
            label="Recovered"
            note={m.moneyPending > 0 ? <span className="num">+{naira(m.moneyPending)} waiting</span> : undefined}
          >
            <CountUp value={m.moneyRecovered} format={naira} />
          </StatBlock>
        </div>
        <StatBlock label="Sold before expiry">
          <CountUp value={m.soldBeforeExpiryPct} format={(n) => `${Math.round(n)}%`} />
        </StatBlock>
        <StatBlock label="Repeat buyers">
          <CountUp value={m.repeatBuyers} format={(n) => `${Math.round(n)}`} />
        </StatBlock>
      </div>
    </Card>
  );
}

export function CarbonCard({ m }: { m: Metrics }) {
  const pending = m.co2ePending > 0.0005;
  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="t-heading text-deep">Carbon</h2>
        {pending ? <Badge tone="warning">Estimate</Badge> : <Badge tone="success">Verified</Badge>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatBlock label="CO₂e avoided" note={pending ? <span className="num">+{tonnes(m.co2ePending, 2)} pending</span> : 'VM0046 method'}>
          <CountUp value={m.co2eVerified} format={(n) => tonnes(n, 2)} />
        </StatBlock>
        <StatBlock label="Food rescued">
          <CountUp value={m.foodRescuedKg} format={weight} />
        </StatBlock>
      </div>
    </Card>
  );
}

const ACTIVITY_ICON: Record<Activity['kind'], ReactNode> = {
  added: <PackagePlus className="size-[18px]" />,
  listed: <Tag className="size-[18px]" />,
  paid: <ReceiptText className="size-[18px]" />,
  handed_over: <HandHeart className="size-[18px]" />,
  donated: <Truck className="size-[18px]" />,
  collected: <Leaf className="size-[18px]" />,
  shared: <Share2 className="size-[18px]" />,
};

export function ActivityFeed({ items, limit = 8 }: { items: Activity[]; limit?: number }) {
  return (
    <ul className="divide-y divide-hairline" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.slice(0, limit).map((a) => (
          <motion.li
            key={a.id}
            layout="position"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex items-center gap-3 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-deep">{ACTIVITY_ICON[a.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium leading-5 text-deep">{a.title}</p>
              {a.detail && <p className="t-caption num truncate text-muted">{a.detail}</p>}
            </div>
            <div className="shrink-0 text-right">
              {a.amount !== undefined && <p className="num text-[15px] font-semibold leading-5 text-deep">{nairaShort(a.amount)}</p>}
              <p className="t-caption text-muted">{ago(a.at)}</p>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
