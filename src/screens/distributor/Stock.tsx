import { PackageOpen, ScanLine, UserRound } from 'lucide-react';
import { AnimatePresence, LayoutGroup } from 'motion/react';
import { useMemo, useState } from 'react';
import { Page } from '../../components/layout/Page';
import { Button, IconButton } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/Feedback';
import type { Session } from '../../lib/api';
import { today } from '../../lib/dates';
import { navigate } from '../../lib/router';
import { stockGroups, viewOf, type BatchView } from '../../lib/selectors';
import { useDb, useHighlight } from '../../lib/store';
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
  const ref = today();
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
                        <BatchRow key={v.batch.id} v={v} highlighted={lit === v.batch.id} onOpen={() => setOpenId(v.batch.id)} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              );
            })}
          </div>
        </LayoutGroup>
      )}
      <BatchSheet view={open} onClose={() => setOpenId(null)} />
    </Page>
  );
}
