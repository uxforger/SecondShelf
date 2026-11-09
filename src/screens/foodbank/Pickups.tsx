import { Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Page } from '../../components/layout/Page';
import { Badge, ExpiryBadge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/Feedback';
import { api, ApiError, type Session } from '../../lib/api';
import { today } from '../../lib/dates';
import { shortDate, weight } from '../../lib/format';
import { spring } from '../../lib/motion';
import { business, donations, type BatchView } from '../../lib/selectors';
import { highlight, toast, useDb, useHighlight } from '../../lib/store';
import { Highlight, Thumb } from '../distributor/parts';

export function Pickups(_: { session: Session }) {
  const db = useDb();
  const lit = useHighlight();
  const all = useMemo(() => donations(db, today()), [db]);
  const toCollect = all.filter((v) => v.batch.donation?.status === 'offered' && v.days > 0);
  const collected = all.filter((v) => v.batch.donation?.status === 'collected');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const open = all.find((v) => v.batch.id === openId) ?? null;

  const collect = async (v: BatchView) => {
    setBusy(true);
    try {
      await api.collectDonation(v.batch.id);
      setOpenId(null);
      highlight(v.batch.id);
      toast('Collected', 'success');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not save.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const row = (v: BatchView) => {
    const seller = business(db, v.batch.sellerId);
    const d = v.batch.donation!;
    return (
      <motion.li key={v.batch.id} layout="position" layoutId={`don-${v.batch.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => setOpenId(v.batch.id)}
          className="relative isolate flex min-h-[72px] w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left"
        >
          <Highlight on={lit === v.batch.id} />
          <Thumb image={v.product.image} focus={v.product.focus} zoom={v.product.zoom} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[1rem] font-medium leading-6 text-deep">{v.product.name}</p>
            <p className="t-caption num truncate text-muted">
              {d.qty} cartons · {seller?.name}, {seller?.area}
            </p>
          </div>
          {d.status === 'offered' ? <ExpiryBadge days={v.days} /> : <Badge tone="success">Collected</Badge>}
        </motion.button>
      </motion.li>
    );
  };

  return (
    <Page title="Pickups">
      {all.length === 0 ? (
        <EmptyState icon={<Truck className="size-7" />} title="No pickups yet" line="Offers from distributors show here." />
      ) : (
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          <section aria-label="To collect">
            <SectionHeader title="To collect" count={toCollect.length} />
            {toCollect.length === 0 ? (
              <p className="t-label px-1 py-3 text-muted">Nothing to collect.</p>
            ) : (
              <ul className="-mx-3">
                <AnimatePresence initial={false}>{toCollect.map(row)}</AnimatePresence>
              </ul>
            )}
          </section>
          <section aria-label="Collected">
            <SectionHeader title="Collected" count={collected.length} />
            <ul className="-mx-3">
              <AnimatePresence initial={false}>{collected.map(row)}</AnimatePresence>
            </ul>
          </section>
        </div>
      )}

      <BottomSheet
        open={!!open}
        onClose={() => !busy && setOpenId(null)}
        title={open?.product.name}
        footer={
          open?.batch.donation?.status === 'offered' ? (
            <Button size="lg" block loading={busy} loadingLabel="Saving" onClick={() => open && collect(open)}>
              Confirm pickup
            </Button>
          ) : undefined
        }
      >
        {open && (
          <dl className="divide-y divide-hairline">
            <div className="flex min-h-12 items-center justify-between">
              <dt className="t-label text-muted">Cartons</dt>
              <dd className="num font-medium text-deep">
                {open.batch.donation!.qty} · {weight(open.batch.donation!.qty * open.product.netKg)}
              </dd>
            </div>
            <div className="flex min-h-12 items-center justify-between">
              <dt className="t-label text-muted">Use by</dt>
              <dd className="num font-medium text-deep">{shortDate(open.batch.expiry)}</dd>
            </div>
            <div className="flex min-h-12 items-center justify-between">
              <dt className="t-label text-muted">From</dt>
              <dd className="font-medium text-deep">{business(db, open.batch.sellerId)?.name}</dd>
            </div>
          </dl>
        )}
      </BottomSheet>
    </Page>
  );
}
