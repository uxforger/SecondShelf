import { LogOut, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { ROLE_LABEL } from '../../components/layout/nav';
import { Page } from '../../components/layout/Page';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { api, DEMO_MODE, type Session } from '../../lib/api';
import { business } from '../../lib/selectors';
import { clearExpiryAlertFlag } from '../../lib/useLiveAlerts';
import { setSession, toast, useDb } from '../../lib/store';

export function Profile({ session }: { session: Session }) {
  const db = useDb();
  const biz = business(db, session.businessId);
  const live = api.connection() === 'live';
  const [confirm, setConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const reset = async () => {
    setResetting(true);
    await api.resetDemo();
    clearExpiryAlertFlag();
    setResetting(false);
    setConfirm(false);
    toast('Demo reset', 'success');
  };

  return (
    <Page title="Profile" back={session.role === 'distributor' ? '/stock' : undefined}>
      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-deep text-[1.375rem] font-semibold text-white">{session.name.charAt(0)}</span>
        <div className="min-w-0">
          <p className="truncate text-[1.25rem] font-semibold leading-7 text-deep">{session.name}</p>
          <p className="t-label text-muted">
            {ROLE_LABEL[session.role]} · {biz?.area}
          </p>
          {biz?.owner && <p className="t-caption text-muted">{biz.owner}</p>}
        </div>
      </Card>

      <Card className="mt-4 divide-y divide-hairline px-5">
        <div className="flex min-h-14 items-center justify-between gap-3">
          <span className="t-label text-muted">Sync</span>
          <Badge tone={live ? 'success' : 'neutral'} dot={false} className="gap-1">
            {live ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            {live ? 'Live across devices' : 'This device only'}
          </Badge>
        </div>
        {DEMO_MODE && (
          <div className="flex min-h-14 items-center justify-between gap-3">
            <span className="t-label text-muted">Demo data</span>
            <Button variant="ghost" size="sm" icon={<RotateCcw className="size-4" />} onClick={() => setConfirm(true)}>
              Reset
            </Button>
          </div>
        )}
      </Card>

      <Button variant="quiet" size="lg" block className="mt-6" icon={<LogOut className="size-5" />} onClick={() => setSession(null)}>
        Sign out
      </Button>

      <BottomSheet
        open={confirm}
        onClose={() => !resetting && setConfirm(false)}
        locked={resetting}
        title="Reset demo data?"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" className="flex-1" disabled={resetting} onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button size="lg" className="flex-1" loading={resetting} loadingLabel="Resetting" onClick={reset}>
              Reset
            </Button>
          </div>
        }
      >
        <p className="t-body text-body">All devices go back to the starting stock.</p>
      </BottomSheet>
    </Page>
  );
}
