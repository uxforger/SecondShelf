import { PackageOpen, ScanLine, UserRound } from 'lucide-react';
import { AnimatePresence, LayoutGroup } from 'motion/react';
import { AlarmClock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Page } from '../../components/layout/Page';
import { Button, IconButton } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/Card';
import { EmptyState, Figure } from '../../components/ui/Feedback';
import { naira } from '../../lib/format';
import { spring } from '../../lib/motion';
import type { Session } from '../../lib/api';
import { today } from '../../lib/dates';
import { navigate } from '../../lib/router';
import { atRisk, stockGroups, viewOf, type BatchView } from '../../lib/selectors';
import { clearOpenRequest, useDb, useHighlight, useOpenRequest } from '../../lib/store';
import { BatchSheet } from './BatchSheet';
import { BatchRow } from './parts';

const SECTIONS: { key: keyof ReturnType<typeof stockGroups>; title: string }[] = [
  { key: 'soon', title: 'Expiring soon' },
  { key: 'listed', title: 'Listed' },
  { key: 'donating', title: 'Food bank' },
  { key: 'healthy', title: 'In stock' },
  { key: 'expired', title: 'Expired' },
];

export function Stock({ session }: { session: Session }) {
  const db = useDb();
  const lit = useHighlight();
  const [openId, setOpenId] = useState<string | null>(null);
  const [openMode, setOpenMode] = useState<'detail' | 'list'>('detail');
  const ref = today();
  const risk = useMemo(() => atRisk(db, session.businessId, ref), [db, session.businessId, ref]);

  // An alert banner asked us to open a batch straight into listing.
  const req = useOpenRequest();
  useEffect(() => {
    if (!req) return;
    setOpenMode(req.mode);
    setOpenId(req.batchId);
    clearOpenRequest();
  }, [req]);

  const open1 = (id: string, mode: 'detail' | 'list' = 'detail') => {
    setOpenMode(mode);
    setOpenId(id);
  };
  const groups = useMemo(() => stockGroups(db, session.businessId, ref), [db, session.businessId, ref]);
  const total = SECTIONS.reduce((n, s) => n + groups[s.key].length, 0);

  const open: BatchView | null = useMemo(() => {
    const b = openId ? db.batches.find((x) => x.id === openId) : null;
    return b ? viewOf(db, b, ref) : null;
  }, [db, openId, ref]);

  return (
    <Page
      title="Your stock"
      actions={
        <>
          <Button size="sm" className="max-lg:hidden" icon={<ScanLine className="size-5" />} onClick={() => navigate('/scan')}>
            Scan
          </Button>
          <IconButton label="Profile" className="lg:hidden" onClick={() => navigate('/profile')}>
            <UserRound className="size-6" />
          </IconButton>
        </>
      }
    >
      {total > 0 && (
        <motion.div layout transition={spring} className="mb-2">
          {risk.value > 0 ? (
            <button
              type="button"
              onClick={() => open1(risk.items[0].batch.id, 'list')}
              className="flex w-full items-center gap-4 rounded-[20px] bg-warning-tint p-4 text-left ring-1 ring-amber/40 lg:max-w-[560px]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber text-deep">
                <AlarmClock className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="t-label block text-warning-ink">At risk · next 6 weeks</span>
                <Figure value={risk.value} format={naira} delta={naira} className="text-[1.625rem] font-semibold leading-8 tracking-[-0.01em] text-deep" />
                <span className="t-caption block truncate text-warning-ink">
                  {risk.items[0].product.name} first · {risk.count} {risk.count === 1 ? "batch" : "batches"}
                </span>
              </span>
              <span className="t-label shrink-0 rounded-full bg-deep px-4 py-2.5 text-white">List</span>
            </button>
          ) : (
            <p className="t-label flex items-center gap-2 rounded-[20px] bg-[#dcefdc] px-4 py-3 text-success-ink lg:max-w-[560px]">
              <CheckCircle2 className="size-5" /> Nothing at risk
            </p>
          )}
        </motion.div>
      )}
      {total === 0 ? (
        <EmptyState
          icon={<PackageOpen className="size-7" />}
          title="No stock yet"
          line="Scan a carton to add your first batch."
          action={
            <Button icon={<ScanLine className="size-5" />} onClick={() => navigate('/scan')}>
              Scan
            </Button>
          }
        />
      ) : (
        <LayoutGroup>
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            {SECTIONS.map((s) => {
              const items = groups[s.key];
              if (!items.length) return null;
              return (
                <section key={s.key} aria-label={s.title} className="lg:mb-2">
                  <SectionHeader title={s.title} count={items.length} />
                  <ul className="-mx-3">
                    <AnimatePresence initial={false}>
                      {items.map((v) => (
                        <BatchRow key={v.batch.id} v={v} highlighted={lit === v.batch.id} onOpen={() => open1(v.batch.id)} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              );
            })}
          </div>
        </LayoutGroup>
      )}
      <BatchSheet view={open} initialMode={openMode} onClose={() => setOpenId(null)} />
    </Page>
  );
}
