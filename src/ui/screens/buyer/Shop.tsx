import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import type { Session } from '../../../lib/api';
import { today } from '../../../lib/dates';
import { spring } from '../../../lib/motion';
import { offers } from '../../../lib/selectors';
import { useDb } from '../../../lib/store';
import { Page } from '../../shell';
import { OfferCard } from './parts';

export function Shop({ session }: { session: Session }) {
  const db = useDb();
  const list = useMemo(() => offers(db, today()), [db]);
  return (
    <Page title="Offers near you" session={session}>
      {list.length ? (
        <motion.ul layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <AnimatePresence initial={false}>
            {list.map((v) => (
              <motion.li key={v.batch.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={spring}>
                <OfferCard v={v} db={db} big />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <p className="t-16 text-slate">No offers right now. New ones show here first.</p>
      )}
    </Page>
  );
}
