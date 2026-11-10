import { BadgeCheck, Landmark } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Page } from '../../components/layout/Page';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Figure, ProgressSteps, SuccessMark } from '../../components/ui/Feedback';
import { api, ApiError, type Session } from '../../lib/api';
import { naira, nairaShort, shortDate, weight } from '../../lib/format';
import { Input } from '../../components/ui/Field';
import { spring } from '../../lib/motion';
import { business, metrics } from '../../lib/selectors';
import { toast, useDb } from '../../lib/store';
import { useDesktop } from '../../lib/useMedia';
import { ActivityFeed, CarbonCard, MoneyCard } from './parts';

export function Passport({ session }: { session: Session }) {
  const db = useDb();
  const desktop = useDesktop();
  const m = useMemo(() => metrics(db, session.businessId), [db, session.businessId]);
  const biz = business(db, session.businessId);
  const activity = useMemo(() => db.activity.filter((a) => a.businessIds.includes(session.businessId)), [db, session.businessId]);
  const [consent, setConsent] = useState(false);
  // idle -> requesting (bank creates consent) -> otp -> reading (authorise + statement) -> done
  const [sharing, setSharing] = useState<'idle' | 'requesting' | 'otp' | 'reading' | 'done'>('idle');
  const [step, setStep] = useState(0);
  const [consentId, setConsentId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const statement = db.passportStatement;

  const share = async () => {
    setSharing('requesting');
    try {
      const c = await api.createPassportConsent();
      setConsentId(c.consentId);
      setOtp('');
      setOtpError(null);
      setSharing('otp');
    } catch (e) {
      setSharing('idle');
      toast(e instanceof ApiError ? e.message : 'Could not reach the bank.', 'error');
    }
  };

  const authorise = async () => {
    if (!consentId) return;
    if (!/^\d{6}$/.test(otp)) return setOtpError('Enter the 6-digit code.');
    setSharing('reading');
    setStep(0);
    const t = window.setTimeout(() => setStep(1), 900);
    try {
      await api.authorisePassportConsent(consentId, otp);
      window.clearTimeout(t);
      setStep(2);
      await new Promise((r) => setTimeout(r, 400));
      setSharing('done');
    } catch (e) {
      window.clearTimeout(t);
      setSharing('otp');
      setOtpError(e instanceof ApiError ? e.message : 'Could not reach the bank.');
    }
  };

  const busy = sharing === 'requesting' || sharing === 'reading';
  const closeConsent = () => {
    if (busy) return;
    setConsent(false);
    window.setTimeout(() => setSharing('idle'), 400);
  };

  const rows: [string, React.ReactNode][] = [
    ['Sell-through', <Figure value={m.sellThroughPct} format={(n) => `${Math.round(n)}%`} />],
    ['Orders fulfilled', <Figure value={m.ordersFulfilled} format={(n) => `${Math.round(n)}`} />],
    ['Repeat buyers', <Figure value={m.repeatBuyers} format={(n) => `${Math.round(n)} of ${m.buyers}`} />],
    ['Food rescued', <Figure value={m.foodRescuedKg} format={weight} />],
  ];

  return (
    <Page title="Passport">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-7">
          <Card dark className="overflow-hidden p-5 lg:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="t-label flex items-center gap-1.5 text-white/75">
                  <BadgeCheck className="size-4" /> Business Passport
                </p>
                <p className="mt-1 text-[1.25rem] font-semibold leading-7">
                  {biz?.name}, {biz?.area}
                </p>
              </div>
              {db.passportSharedAt && <Badge tone="deep" className="bg-white/12 ring-1 ring-white/20">Shared {shortDate(db.passportSharedAt)}</Badge>}
            </div>
            <p className="t-label mt-6 text-white/75">Verified sales · 90 days</p>
            <Figure value={m.verifiedSales90} format={naira} className="mt-1 block text-[2.25rem] font-semibold leading-[2.625rem] tracking-[-0.02em] lg:text-[2.75rem] lg:leading-[3rem]" />
            <Button variant="cta" className="mt-6" icon={<Landmark className="size-5" />} onClick={() => setConsent(true)}>
              {db.passportSharedAt ? 'Share again' : 'Share with bank'}
            </Button>
          </Card>

          {statement && (
            <Card className="p-5 lg:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="t-heading text-deep">{statement.source === 'simulated' ? 'Bank statement' : 'Bank-verified'}</h2>
                {statement.source === 'simulated' ? <Badge tone="warning">Simulated</Badge> : <Badge tone="success">Access Bank</Badge>}
              </div>
              <p className="t-label mt-1 text-muted">
                {statement.accountName ?? 'Business account'} ···{statement.accountNumber.slice(-4)} · read with consent {shortDate(statement.at)}
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <dt className="t-caption text-muted">Money in</dt>
                  <dd className="num text-[1.125rem] font-semibold text-deep">{nairaShort(statement.credits)}</dd>
                </div>
                <div>
                  <dt className="t-caption text-muted">Money out</dt>
                  <dd className="num text-[1.125rem] font-semibold text-deep">{nairaShort(statement.debits)}</dd>
                </div>
                <div>
                  <dt className="t-caption text-muted">Transactions</dt>
                  <dd className="num text-[1.125rem] font-semibold text-deep">{statement.transactions}</dd>
                </div>
              </dl>
            </Card>
          )}

          <Card className="px-5 py-2 lg:px-6">
            <dl className="divide-y divide-hairline">
              {rows.map(([label, value]) => (
                <div key={label} className="flex min-h-14 items-center justify-between gap-4">
                  <dt className="t-label text-muted">{label}</dt>
                  <dd className="num text-[1.0625rem] font-semibold text-deep">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {!desktop && (
            <>
              <MoneyCard m={m} />
              <CarbonCard m={m} />
            </>
          )}
        </div>

        <Card className="p-5 lg:col-span-5 lg:p-6">
          <h2 className="t-heading text-deep">Record</h2>
          <div className="mt-2">
            <ActivityFeed items={activity} limit={desktop ? 10 : 6} />
          </div>
        </Card>
      </div>

      <BottomSheet
        open={consent}
        onClose={closeConsent}
        locked={busy}
        label="Share your Passport with Access Bank?"
        title={sharing === 'done' ? undefined : sharing === 'otp' ? 'Confirm with Access Bank' : 'Share with Access Bank?'}
        footer={
          sharing === 'done' ? (
            <Button size="lg" block onClick={closeConsent} data-autofocus>
              Done
            </Button>
          ) : sharing === 'idle' ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="lg" className="flex-1" onClick={closeConsent}>
                Cancel
              </Button>
              <Button size="lg" className="flex-1" onClick={share}>
                Share
              </Button>
            </div>
          ) : sharing === 'otp' ? (
            <Button size="lg" block onClick={authorise}>
              Authorise
            </Button>
          ) : null
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {sharing === 'idle' && (
            <motion.div key="idle" exit={{ opacity: 0 }} transition={spring}>
              <p className="t-body text-body">Access Bank reads your statement with your consent.</p>
              <ul className="mt-4 space-y-2">
                {['Verified sales', 'Sell-through', 'Repeat buyers', 'Bank statement, read only'].map((x) => (
                  <li key={x} className="t-label flex items-center gap-2 text-deep">
                    <BadgeCheck className="size-5 text-green" /> {x}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
          {sharing === 'requesting' && (
            <motion.div key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring} className="py-2">
              <ProgressSteps steps={[{ label: 'Requesting consent' }, { label: 'Code sent' }]} current={0} />
            </motion.div>
          )}
          {sharing === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={spring}>
              <p className="t-label mb-4 text-muted">Enter the code sent to the account holder.</p>
              <Input
                label="One-time code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                data-autofocus
                hint="Sandbox code: 123456"
                error={otpError}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setOtpError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && authorise()}
              />
            </motion.div>
          )}
          {sharing === 'reading' && (
            <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring} className="py-2">
              <ProgressSteps steps={[{ label: 'Authorising consent' }, { label: 'Reading statement' }]} current={step} />
            </motion.div>
          )}
          {sharing === 'done' && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="flex flex-col items-center py-6 text-center">
              <SuccessMark size={80} />
              <p className="t-title mt-5 text-deep">Shared</p>
              <p className="t-label mt-1 text-muted">
                {statement ? (statement.source === 'simulated' ? `${statement.transactions} transactions read (simulated).` : `${statement.transactions} transactions verified by Access Bank.`) : 'Access Bank can view your Passport.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </BottomSheet>
    </Page>
  );
}
