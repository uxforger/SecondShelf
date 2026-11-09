import { ArrowRight, Wifi, WifiOff } from 'lucide-react';
import { useMemo } from 'react';
import { Page } from '../../components/layout/Page';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CountUp } from '../../components/ui/Feedback';
import { api, type Session } from '../../lib/api';
import { naira } from '../../lib/format';
import { navigate } from '../../lib/router';
import { metrics } from '../../lib/selectors';
import { useDb } from '../../lib/store';
import { ActivityFeed, CarbonCard, MoneyCard, StatBlock } from './parts';

export function Overview({ session }: { session: Session }) {
  const db = useDb();
  const m = useMemo(() => metrics(db, session.businessId), [db, session.businessId]);
  const activity = useMemo(() => db.activity.filter((a) => a.businessIds.includes(session.businessId)), [db, session.businessId]);
  const live = api.connection() === 'live';

  return (
    <Page
      title="Overview"
      actions={
        <Badge tone={live ? 'success' : 'neutral'} dot={false} className="gap-1">
          {live ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {live ? 'Live' : 'This device'}
        </Badge>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <MoneyCard m={m} />
        </div>
        <div className="lg:col-span-5">
          <CarbonCard m={m} />
        </div>

        <Card className="p-5 lg:col-span-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="t-heading text-deep">Business Passport</h2>
            {db.passportSharedAt ? <Badge tone="success">Shared</Badge> : <Badge>Ready</Badge>}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
            <StatBlock label="Verified sales · 90 days">
              <CountUp value={m.verifiedSales90} format={naira} />
            </StatBlock>
            <StatBlock label="Orders fulfilled">
              <CountUp value={m.ordersFulfilled} format={(n) => `${Math.round(n)}`} />
            </StatBlock>
          </div>
          <Button variant="secondary" className="mt-5" icon={<ArrowRight className="size-5" />} onClick={() => navigate('/passport', { tab: true })}>
            Open passport
          </Button>
        </Card>

        <Card className="p-5 lg:col-span-7 lg:p-6">
          <h2 className="t-heading text-deep">Recent activity</h2>
          <div className="mt-2">
            <ActivityFeed items={activity} limit={7} />
          </div>
        </Card>
      </div>
    </Page>
  );
}
