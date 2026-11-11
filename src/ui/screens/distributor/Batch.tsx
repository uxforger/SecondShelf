import { Award, Clock, HandHeart, Leaf, PackageCheck, Tag, Undo2, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, type Order, type Session } from '../../../lib/api';
import { naira, shortDate } from '../../../lib/format';
import { spring } from '../../../lib/motion';
import { navigate } from '../../../lib/router';
import { clearOpenRequest, toast, useDb, useOpenRequest } from '../../../lib/store';
import { ListSheet, PayoutSheet } from '../../actions';
import { batchInfo, expiryWords, journeyOf, urgentDays } from '../../data';
import { Button, Card, Pill } from '../../kit/core';
import { Journey } from '../../kit/journey';
import { ProductPhoto } from '../../kit/media';
import { Page } from '../../shell';

const ICON: Record<string, ReactNode> = {
  list: <Tag className="size-5" />,
  reprice: <Tag className="size-5" />,
  handover: <PackageCheck className="size-5" />,
  payout: <Wallet className="size-5" />,
  carbon: <Leaf className="size-5" />,
  certificate: <Award className="size-5" />,
};

export function BatchJourney({ id, session }: { id: string; session: Session }) {
  const db = useDb();
  const info = useMemo(() => {
    const b = db.batches.find((x) => x.id === id);
    return b ? batchInfo(db, b) : null;
  }, [db, id]);
  const steps = useMemo(() => (info ? journeyOf(db, info) : []), [db, info]);
  const [sheet, setSheet] = useState<'list' | 'payout' | null>(null);
  // Held while the sheet is open: once paid, the next step moves on to carbon.
  const [payOrder, setPayOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState<'donate' | 'unlist' | null>(null);
  const request = useOpenRequest();

  // "Tap to list" from an alert lands here with the List sheet open.
  useEffect(() => {
    if (request?.batchId !== id || !info) return;
    clearOpenRequest();
    // From an alert: list it. Straight after a handover: the payout is next.
    if (request.mode === 'list' && (info.next.kind === 'list' || info.next.kind === 'reprice')) setSheet('list');
    if (request.mode === 'detail' && info.next.kind === 'payout') {
      setPayOrder(info.next.order);
      setSheet('payout');
    }
  }, [request, id, info]);

  if (!info) {
    return (
      <Page title="Batch" back="/stock" session={session}>
        <p className="t-16 text-slate">This batch is no longer here.</p>
        <Button className="mt-4" onClick={() => navigate('/stock', { tab: true })}>
          Back to stock
        </Button>
      </Page>
    );
  }

  const { product, batch, days, next } = info;
  const waitingForBuyer = !!batch.listing && batch.quantity > 0 && next.kind === 'reprice';

  const run = () => {
    switch (next.kind) {
      case 'list':
      case 'reprice':
        return setSheet('list');
      case 'payout':
        setPayOrder(next.order);
        return setSheet('payout');
      case 'handover':
        return navigate(`/handover/${encodeURIComponent(next.order.ref)}`);
      case 'carbon':
        return navigate('/carbon');
      case 'certificate':
        return navigate(`/carbon/certificate/${encodeURIComponent(next.certificateId)}`);
      default:
        return navigate('/stock', { tab: true });
    }
  };

  const donate = async () => {
    setBusy('donate');
    try {
      await api.donateBatch(batch.id);
      toast('Offered to Lagos Food Bank Initiative', 'success');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not offer it.', 'error');
    } finally {
      setBusy(null);
    }
  };
  const unlist = async () => {
    setBusy('unlist');
    try {
      await api.unlistBatch(batch.id);
      toast('Taken down', 'neutral', { label: 'Undo', run: () => setSheet('list') });
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not take it down.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const canDonate = !batch.donation && batch.quantity > 0 && days > 0 && days <= urgentDays && !info.latest;

  return (
    <Page title={product.name} back="/stock" session={session}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Batch + the one next step */}
        <div className="space-y-4 lg:col-span-5">
          <Card className="overflow-hidden">
            <ProductPhoto product={product} layoutId={`photo-${batch.id}`} rounded="rounded-none" className="h-48 w-full sm:h-56" eager />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                {batch.quantity > 0 && <Pill tone={info.expired ? 'coral' : days <= 42 ? 'amber' : 'neutral'}>{expiryWords(days)}</Pill>}
                <Pill tone={batch.listing ? 'leaf' : 'neutral'} dot={false}>
                  {info.status}
                </Pill>
              </div>
              <p className="t-14 num mt-3 text-slate">
                {product.pack} · {batch.quantity} cartons left · use by {shortDate(batch.expiry)}
              </p>
              {batch.listing && batch.quantity > 0 && (
                <p className="num mt-2 text-ink">
                  <span className="t-24">{naira(batch.listing.unitPrice)}</span> <span className="t-14 text-slate line-through">{naira(product.price)}</span>
                </p>
              )}
            </div>
          </Card>

          <motion.div layout transition={spring}>
            {waitingForBuyer && (
              <div className="mb-3 flex items-center gap-3 rounded-[16px] bg-leaf-tint p-4">
                <Clock className="size-5 shrink-0 text-forest" />
                <p className="t-14 font-medium text-forest">Waiting for a buyer. Buyers nearby were told.</p>
              </div>
            )}
            <Button size="lg" block variant={next.kind === 'payout' || next.kind === 'handover' ? 'dark' : 'primary'} icon={ICON[next.kind]} onClick={run}>
              {next.label}
            </Button>
            {(canDonate || waitingForBuyer) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {canDonate && (
                  <Button variant="quiet" size="sm" icon={<HandHeart className="size-4" />} loading={busy === 'donate'} onClick={donate}>
                    Give to food bank
                  </Button>
                )}
                {waitingForBuyer && !info.orders.length && (
                  <Button variant="quiet" size="sm" icon={<Undo2 className="size-4" />} loading={busy === 'unlist'} onClick={unlist}>
                    Take down
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Journey */}
        <Card className="p-5 lg:col-span-7 lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="t-20 text-ink">Journey</h2>
            {info.orders.length > 1 && <span className="t-14 text-slate">Latest of {info.orders.length} sales</span>}
          </div>
          <Journey steps={steps} />
        </Card>
      </div>

      <ListSheet info={info} open={sheet === 'list'} onClose={() => setSheet(null)} />
      <PayoutSheet order={payOrder} open={sheet === 'payout'} onClose={() => setSheet(null)} />
    </Page>
  );
}
