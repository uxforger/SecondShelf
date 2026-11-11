import { useMemo, useState } from 'react';
import { api, ApiError, type Session } from '../../../lib/api';
import { today } from '../../../lib/dates';
import { business, donations } from '../../../lib/selectors';
import { toast, useDb } from '../../../lib/store';
import { expiryWords, when } from '../../data';
import { Button, Card, Pill, SectionTitle } from '../../kit/core';
import { ProductPhoto } from '../../kit/media';
import { Page } from '../../shell';

export function Pickups({ session }: { session: Session }) {
  const db = useDb();
  const all = useMemo(() => donations(db, today()), [db]);
  const open = all.filter((v) => v.batch.donation?.status === 'offered' && v.days > 0);
  const done = all.filter((v) => v.batch.donation?.status === 'collected');
  const [busy, setBusy] = useState<string | null>(null);

  const collect = async (batchId: string) => {
    setBusy(batchId);
    try {
      await api.collectDonation(batchId);
      toast('Collected · thank you', 'success');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not confirm.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Page title="Pickups" session={session}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5 lg:p-6">
          <SectionTitle title="To collect" count={open.length} />
          {open.length ? (
            <ul className="mt-2 space-y-2">
              {open.map((v) => (
                <li key={v.batch.id} className="flex items-center gap-3 rounded-[12px] py-2">
                  <ProductPhoto product={v.product} className="size-12" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[1rem] font-semibold text-ink">{v.product.name}</span>
                    <span className="t-14 block truncate text-slate">
                      {v.batch.donation!.qty} cartons · {business(db, v.batch.sellerId)?.name}
                    </span>
                  </span>
                  <Pill tone="amber" className="max-sm:hidden">
                    {expiryWords(v.days)}
                  </Pill>
                  <Button size="sm" loading={busy === v.batch.id} onClick={() => collect(v.batch.id)}>
                    Collected
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="t-14 mt-2 text-slate">New pickups show here at once.</p>
          )}
        </Card>
        <Card className="p-5 lg:p-6">
          <SectionTitle title="Collected" count={done.length} />
          <ul className="mt-2 space-y-2">
            {done.map((v) => (
              <li key={v.batch.id} className="flex items-center gap-3 py-2">
                <ProductPhoto product={v.product} className="size-12" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[1rem] font-semibold text-ink">{v.product.name}</span>
                  <span className="t-14 block text-slate">
                    {v.batch.donation!.qty} cartons · {when(v.batch.donation!.collectedAt)}
                  </span>
                </span>
                <Pill tone="leaf">Collected</Pill>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Page>
  );
}
