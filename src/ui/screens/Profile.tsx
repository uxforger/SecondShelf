import { LogOut, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { api, DEMO_MODE, type Session } from '../../lib/api';
import { navigate } from '../../lib/router';
import { business } from '../../lib/selectors';
import { setSession, toast, useDb } from '../../lib/store';
import { clearExpiryAlertFlag } from '../../lib/useLiveAlerts';
import { Button, Card, Pill } from '../kit/core';
import { Sheet } from '../kit/sheet';
import { HOME, initials, Page } from '../shell';

const ROLE: Record<Session['role'], string> = { distributor: 'Distributor', buyer: 'Buyer', foodbank: 'Food bank' };

export function Profile({ session }: { session: Session }) {
  const db = useDb();
  const biz = business(db, session.businessId);
  const live = api.connection() === 'live';
  const [confirm, setConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const reset = async () => {
    setResetting(true);
    try {
      await api.resetDemo();
      clearExpiryAlertFlag();
      toast('Demo reset · fresh stock on every device', 'success');
      setConfirm(false);
      navigate(HOME[session.role], { replace: true, tab: true });
    } catch {
      toast('Could not reset. Try again.', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Page title="Profile" back={HOME[session.role]} wide={false}>
      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-forest text-[1.25rem] font-semibold text-lime">{initials(session.name)}</span>
        <div className="min-w-0">
          <p className="t-20 truncate text-ink">{session.name}</p>
          <p className="t-14 text-slate">
            {ROLE[session.role]} · {biz?.area}
          </p>
          {biz?.owner && <p className="t-14 text-slate">{biz.owner}</p>}
        </div>
      </Card>

      <Card className="mt-4 divide-y divide-hairline px-5">
        <div className="flex min-h-14 items-center justify-between gap-3">
          <span className="t-16 text-ink">Sync</span>
          <Pill tone={live ? 'leaf' : 'neutral'} dot={false}>
            {live ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            {live ? 'Live across devices' : 'This device only'}
          </Pill>
        </div>
        {DEMO_MODE && (
          <div className="flex min-h-14 items-center justify-between gap-3">
            <span className="t-16 text-ink">Demo data</span>
            <Button variant="secondary" size="sm" icon={<RotateCcw className="size-4" />} onClick={() => setConfirm(true)}>
              Reset
            </Button>
          </div>
        )}
      </Card>

      <Button variant="quiet" size="lg" block className="mt-6" icon={<LogOut className="size-5" />} onClick={() => setSession(null)}>
        Sign out
      </Button>

      <Sheet open={confirm} onClose={() => setConfirm(false)} locked={resetting} title="Reset demo data?">
        <p className="t-16 text-slate">Every device goes back to Ade Foods' starting stock.</p>
        <div className="mt-6 flex gap-2">
          <Button variant="secondary" size="lg" className="flex-1" disabled={resetting} onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" loading={resetting} loadingLabel="Resetting" onClick={reset}>
            Reset
          </Button>
        </div>
      </Sheet>
    </Page>
  );
}
