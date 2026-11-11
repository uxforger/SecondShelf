import { useMemo } from 'react';
import type { Session } from '../../../lib/api';
import { shortDate } from '../../../lib/format';
import { useDb } from '../../../lib/store';
import { ledger, type LedgerEvent } from '../../data';
import { Card } from '../../kit/core';
import { Page } from '../../shell';
import { LedgerRow } from './Home';

/** Every bank event, newest first, grouped by day. Each row opens what it's about. */
export function Money({ session }: { session: Session }) {
  const db = useDb();
  const days = useMemo(() => {
    const out: { day: string; items: LedgerEvent[] }[] = [];
    for (const e of ledger(db)) {
      const d = e.at.slice(0, 10);
      const last = out[out.length - 1];
      if (last?.day === d) last.items.push(e);
      else out.push({ day: d, items: [e] });
    }
    return out;
  }, [db]);
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <Page title="Money" session={session}>
      <p className="t-16 -mt-3 mb-6 text-slate">Bank sandbox · every payment verified, every payout with its reference.</p>
      {days.length ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {days.map((g) => (
            <Card key={g.day} className="p-4 lg:p-5">
              <h2 className="t-14 px-2 font-semibold tracking-[0.06em] text-slate uppercase">{g.day === todayKey ? 'Today' : shortDate(g.day)}</h2>
              <ul className="mt-1">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <LedgerRow e={e} />
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      ) : (
        <p className="t-16 text-slate">— No bank events yet. They show here as they happen.</p>
      )}
    </Page>
  );
}
