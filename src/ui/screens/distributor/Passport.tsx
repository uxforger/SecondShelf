import { Banknote, CalendarClock, Eye, FileText, Landmark, ShieldCheck, Wallet } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { api, ApiError, type Loan, type Session } from '../../../lib/api';
import { naira, shortDate, weight } from '../../../lib/format';
import { haptic } from '../../../lib/haptics';
import { spring } from '../../../lib/motion';
import { metrics } from '../../../lib/selectors';
import { toast, useDb } from '../../../lib/store';
import { passport, SELLER, when } from '../../data';
import { BankCard, BankProcess } from '../../kit/bank';
import { Button, Card, Pill, SuccessCheck } from '../../kit/core';
import { OtpBoxes } from '../../kit/fields';
import { Sheet } from '../../kit/sheet';
import { Page } from '../../shell';

export function Passport({ session }: { session: Session }) {
  const db = useDb();
  const p = useMemo(() => passport(db), [db]);
  const m = useMemo(() => metrics(db, SELLER), [db]);
  const [consent, setConsent] = useState(false);
  const [loan, setLoan] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const s = p.statement;

  const revoke = async () => {
    setRevoking(true);
    try {
      await api.revokePassportConsent();
      toast('Bank access stopped', 'success');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not reach the bank.', 'error');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Page title="Passport" session={session} back="/home">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {/* Hero: the record and the one next step */}
          <Card dark className="p-6 lg:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="t-14 flex items-center gap-2 font-semibold tracking-[0.06em] text-white/60 uppercase">
                <ShieldCheck className="size-4" /> Trading passport
              </p>
              {p.shared ? <Pill tone="lime">Bank-verified</Pill> : <Pill tone="night">Not shared</Pill>}
            </div>
            <p className="t-14 mt-5 text-white/70">Verified sales · 90 days</p>
            <p className="num mt-1 font-display text-[2.5rem] leading-none font-semibold tracking-[-0.03em]">{p.verifiedSales90 > 0 ? naira(p.verifiedSales90) : '—'}</p>
            <p className="t-14 mt-2 text-white/60">{db.businesses.find((b) => b.id === SELLER)?.owner} trading as Ade Foods</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {p.shared ? (
                <Button variant="lime" size="lg" icon={<Landmark className="size-5" />} onClick={() => setLoan(true)}>
                  {p.loan?.status === 'disbursed' ? 'See loan' : 'See loan offer'}
                </Button>
              ) : (
                <Button variant="lime" size="lg" icon={<ShieldCheck className="size-5" />} onClick={() => setConsent(true)}>
                  Share with bank
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-5 lg:p-6">
            <h2 className="t-20 text-ink">Your record</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Sell-through" value={m.sellThroughPct > 0 ? `${Math.round(m.sellThroughPct)}%` : '—'} />
              <Stat label="Orders fulfilled" value={m.ordersFulfilled ? String(m.ordersFulfilled) : '—'} />
              <Stat label="Repeat buyers" value={m.buyers ? `${m.repeatBuyers} of ${m.buyers}` : '—'} />
              <Stat label="Food rescued" value={m.foodRescuedKg ? weight(m.foodRescuedKg) : '—'} />
            </dl>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-5">
          {s && !s.revokedAt ? (
            <BankCard title="Bank statement" reference={s.consentId} status="Bank-verified" tone="leaf">
              <dl className="t-14 grid grid-cols-2 gap-3">
                <Stat small label="Account" value={`···${s.accountNumber.slice(-4)}`} />
                <Stat small label="Transactions" value={String(s.transactions)} />
                <Stat small label="Money in" value={naira(s.credits)} />
                <Stat small label="Money out" value={naira(s.debits)} />
              </dl>
              <p className="t-12 mt-3 text-slate">
                {s.from && s.to ? `${shortDate(s.from)} to ${shortDate(s.to)} · ` : ''}read {when(s.at)}
              </p>
              <Button variant="secondary" size="sm" className="mt-3" loading={revoking} loadingLabel="Stopping" onClick={revoke}>
                Stop sharing
              </Button>
            </BankCard>
          ) : (
            <Card className="p-5 lg:p-6">
              <h2 className="t-20 text-ink">Bank statement</h2>
              <p className="t-16 mt-1 text-slate">{s?.revokedAt ? 'Sharing stopped.' : 'Not shared yet.'} Share once to unlock a stock loan.</p>
              <Button className="mt-4" icon={<ShieldCheck className="size-5" />} onClick={() => setConsent(true)}>
                Share with bank
              </Button>
            </Card>
          )}

          <Card className="p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <h2 className="t-20 text-ink">Stock loan</h2>
              {p.loan && <Pill tone={p.loan.status === 'disbursed' ? 'leaf' : p.loan.status === 'declined' ? 'coral' : 'amber'}>{LOAN_STATUS[p.loan.status]}</Pill>}
            </div>
            {p.loan ? (
              <>
                <p className="num t-32 mt-2 text-ink">{naira(p.loan.principal)}</p>
                <p className="t-14 text-slate">
                  {p.loan.creditScore !== undefined && `Score ${p.loan.creditScore} · `}
                  {p.loan.dueDate ? `due ${shortDate(p.loan.dueDate)}` : `${p.loan.tenorDays ?? 30} days`}
                </p>
              </>
            ) : (
              <p className="t-16 mt-1 text-slate">{p.shared ? 'Ready to check.' : 'Share your statement first.'}</p>
            )}
            <Button variant="secondary" className="mt-4" icon={<Banknote className="size-5" />} disabled={!p.shared && !p.loan} onClick={() => setLoan(true)}>
              {p.loan ? 'Open loan' : 'Check offer'}
            </Button>
          </Card>
        </div>
      </div>

      <ConsentSheet open={consent} onClose={() => setConsent(false)} onShared={() => setLoan(true)} />
      <LoanSheet open={loan} onClose={() => setLoan(false)} verifiedSales={p.verifiedSales90} />
    </Page>
  );
}

const LOAN_STATUS: Record<Loan['status'], string> = { offered: 'Offer ready', accepted: 'Accepted', disbursed: 'Funds sent', declined: 'Declined', repaid: 'Repaid' };

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <dt className="t-14 text-slate">{label}</dt>
      <dd className={`num mt-0.5 font-semibold text-ink ${small ? 't-16' : 't-20'}`}>{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Consent: what's shared, for how long → OTP → verified                 */
/* ------------------------------------------------------------------ */

type CStep = 'ask' | 'creating' | 'otp' | 'reading' | 'done';

function ConsentSheet({ open, onClose, onShared }: { open: boolean; onClose: () => void; onShared: () => void }) {
  const [step, setStep] = useState<CStep>('ask');
  const [progress, setProgress] = useState(0);
  const [consentId, setConsentId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('ask');
      setOtp('');
      setError(null);
    }
  }, [open]);

  const create = async () => {
    setStep('creating');
    setError(null);
    try {
      const c = await api.createPassportConsent();
      setConsentId(c.consentId);
      setStep('otp');
    } catch (e) {
      setStep('ask');
      setError(e instanceof ApiError ? e.message : 'Could not reach the bank.');
    }
  };

  const authorise = async (code = otp) => {
    if (!consentId || !/^\d{6}$/.test(code)) return setError('Enter the 6-digit code.');
    setStep('reading');
    setProgress(0);
    setError(null);
    const t = window.setTimeout(() => setProgress(1), 800);
    try {
      await api.authorisePassportConsent(consentId, code);
      window.clearTimeout(t);
      setProgress(2);
      haptic();
      await new Promise((r) => setTimeout(r, 350));
      setStep('done');
    } catch (e) {
      window.clearTimeout(t);
      setStep('otp');
      setError(e instanceof ApiError ? e.message : 'Could not reach the bank.');
    }
  };

  const busy = step === 'creating' || step === 'reading';
  return (
    <Sheet open={open} onClose={onClose} locked={busy} title={step === 'done' ? 'Shared' : 'Share with bank'}>
      <AnimatePresence mode="popLayout" initial={false}>
        {(step === 'ask' || step === 'creating') && (
          <motion.div key="ask" exit={{ opacity: 0, x: -16 }} transition={spring}>
            <p className="t-16 text-slate">Xtradot Bank reads your account ···6790 to verify your sales.</p>
            <ul className="mt-4 space-y-3">
              <Li icon={<Wallet className="size-5" />} title="Account and balance" />
              <Li icon={<FileText className="size-5" />} title="Transactions, October 2026" />
              <Li icon={<CalendarClock className="size-5" />} title="Until you stop sharing" />
              <Li icon={<Eye className="size-5" />} title="Read only. No money can move." />
            </ul>
            {error && (
              <p role="alert" className="t-14 mt-4 rounded-[12px] bg-coral-tint px-3 py-2 text-coral-ink">
                {error}
              </p>
            )}
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" size="lg" className="flex-1" disabled={busy} onClick={onClose}>
                Cancel
              </Button>
              <Button size="lg" className="flex-1" loading={step === 'creating'} loadingLabel="Asking bank" onClick={create}>
                Share
              </Button>
            </div>
          </motion.div>
        )}
        {(step === 'otp' || step === 'reading') && (
          <motion.div key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={spring}>
            {step === 'otp' ? (
              <>
                <p className="t-16 text-slate">Enter the code the bank sent to your phone.</p>
                <div className="mt-5">
                  <OtpBoxes
                    value={otp}
                    error={!!error}
                    onChange={(v) => {
                      setOtp(v);
                      setError(null);
                      if (v.length === 6) void authorise(v);
                    }}
                  />
                </div>
                <p className={`t-14 mt-3 ${error ? 'text-coral-ink' : 'text-slate'}`} role={error ? 'alert' : undefined}>
                  {error ?? 'Sandbox code: 123456'}
                </p>
                <Button size="lg" block className="mt-5" disabled={otp.length !== 6} onClick={() => authorise()}>
                  Authorise
                </Button>
              </>
            ) : (
              <BankProcess steps={[{ label: 'Checking the code' }, { label: 'Reading the statement' }, { label: 'Verified' }]} current={progress} />
            )}
          </motion.div>
        )}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-col items-center text-center">
            <SuccessCheck size={72} />
            <p className="t-24 mt-4 text-ink">Bank-verified</p>
            <p className="t-16 text-slate">Your statement is on your Passport.</p>
            <Button
              size="lg"
              block
              className="mt-6"
              icon={<Landmark className="size-5" />}
              onClick={() => {
                onClose();
                window.setTimeout(onShared, 260);
              }}
            >
              See loan offer
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}

function Li({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-leaf-tint text-forest">{icon}</span>
      <span className="t-16 font-medium text-ink">{title}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Loan: checking → scoring → offer → accept → funds sent                */
/* ------------------------------------------------------------------ */

type LStep = 'intro' | 'applying' | 'offer' | 'sending' | 'done' | 'declined';

function LoanSheet({ open, onClose, verifiedSales }: { open: boolean; onClose: () => void; verifiedSales: number }) {
  const db = useDb();
  const loan = db.loan;
  const [step, setStep] = useState<LStep>('intro');
  const [progress, setProgress] = useState(0);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setStep(loan?.status === 'offered' || loan?.status === 'accepted' ? 'offer' : loan?.status === 'disbursed' ? 'done' : loan?.status === 'declined' ? 'declined' : 'intro');
    api
      .loanOffer()
      .then((o) => setAmount(o.amount))
      .catch(() => setAmount(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = async () => {
    setStep('applying');
    setProgress(0);
    setError(null);
    const t1 = window.setTimeout(() => setProgress(1), 900);
    try {
      const l = await api.applyLoan();
      window.clearTimeout(t1);
      setProgress(2);
      await new Promise((r) => setTimeout(r, 400));
      setStep(l.status === 'declined' ? 'declined' : 'offer');
    } catch (e) {
      window.clearTimeout(t1);
      setError(e instanceof ApiError ? e.message : 'Could not reach the bank.');
    }
  };

  const accept = async (l: Loan) => {
    setStep('sending');
    setProgress(0);
    setError(null);
    try {
      if (l.status === 'offered') await api.acceptLoan(l.id);
      setProgress(1);
      await api.disburseLoan(l.id);
      setProgress(2);
      haptic();
      await new Promise((r) => setTimeout(r, 400));
      setStep('done');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reach the bank.');
    }
  };

  const busy = (step === 'applying' || step === 'sending') && !error;
  return (
    <Sheet open={open} onClose={onClose} locked={busy} title="Stock loan" wide>
      <AnimatePresence mode="popLayout" initial={false}>
        {step === 'intro' && (
          <motion.div key="i" exit={{ opacity: 0 }} transition={spring}>
            <p className="t-14 text-slate">Based on your Passport</p>
            <p className="num t-40 mt-1 text-ink">{amount ? naira(amount) : '—'}</p>
            <p className="t-14 num mt-1 text-slate">{naira(verifiedSales)} verified sales in 90 days · 30 days to repay</p>
            <Button size="lg" block className="mt-6" disabled={!amount} onClick={apply}>
              Check my offer
            </Button>
          </motion.div>
        )}
        {(step === 'applying' || step === 'sending') && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring} className="py-2">
            <BankProcess
              steps={step === 'applying' ? [{ label: 'Checking your record' }, { label: 'Scoring' }, { label: 'Offer ready' }] : [{ label: 'Accepting the offer' }, { label: 'Sending funds' }, { label: 'Funds sent' }]}
              current={progress}
              error={error}
              onRetry={step === 'applying' ? apply : () => loan && accept(loan)}
            />
          </motion.div>
        )}
        {step === 'offer' && loan && (
          <motion.div key="o" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={spring}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {loan.creditScore !== undefined && <ScoreDial score={loan.creditScore} />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="t-14 text-slate">Offer</p>
                  {loan.decision && <Pill tone={loan.decision === 'approved' ? 'leaf' : 'amber'}>{loan.decision === 'approved_reduced' ? 'Approved, reduced' : loan.decision === 'approved' ? 'Approved' : loan.decision}</Pill>}
                </div>
                <p className="num t-40 mt-1 text-ink">{naira(loan.principal)}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Box label="Rate" value={loan.interestRate !== undefined ? `${loan.interestRate}% / month` : '—'} />
              <Box label="Fee" value={loan.fee !== undefined ? naira(loan.fee) : '—'} />
              {/* Only when it differs from the offer, so the amount isn't shown twice. */}
              {loan.netDisbursement !== undefined && loan.netDisbursement !== loan.principal && <Box label="You receive" value={naira(loan.netDisbursement)} money />}
              <Box label="Total to repay" value={loan.repaymentTotal !== undefined ? naira(loan.repaymentTotal) : '—'} />
            </dl>
            {loan.schedule && loan.schedule.length > 0 && (
              <div className="mt-5">
                <p className="t-14 font-medium text-ink">Schedule</p>
                <ul className="mt-2 divide-y divide-hairline rounded-[14px] bg-white ring-1 ring-hairline">
                  {loan.schedule.map((s) => (
                    <li key={s.instalment} className="t-14 num flex justify-between px-4 py-2.5">
                      <span className="text-slate">
                        {s.instalment}. {shortDate(s.dueDate)}
                      </span>
                      <span className="font-semibold text-ink">{naira(s.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
                Later
              </Button>
              <Button size="lg" className="flex-1" onClick={() => accept(loan)}>
                Accept
              </Button>
            </div>
          </motion.div>
        )}
        {step === 'done' && loan && (
          <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex flex-col items-center text-center">
            <SuccessCheck size={72} tone="lime" />
            <p className="t-24 mt-4 text-ink">Funds sent</p>
            <p className="num t-32 text-forest">{naira(loan.netDisbursement ?? loan.principal)}</p>
            <BankCard className="mt-5 w-full text-left" title={`To account ···${loan.accountNumber.slice(-4)}`} reference={loan.id} status="Disbursed" tone="leaf">
              <p className="t-14 text-slate">{loan.dueDate ? `Repay ${naira(loan.repaymentTotal ?? loan.principal)} by ${shortDate(loan.dueDate)}` : `Repay ${naira(loan.repaymentTotal ?? loan.principal)}`}</p>
            </BankCard>
            <Button size="lg" block className="mt-5" onClick={onClose}>
              Done
            </Button>
          </motion.div>
        )}
        {step === 'declined' && (
          <motion.div key="x" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="t-24 text-ink">Not this time</p>
            <p className="t-16 mt-1 text-slate">{loan?.declineReason ?? 'The bank declined. Sell more through SecondShelf and try again.'}</p>
            <Button size="lg" block className="mt-6" onClick={onClose}>
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}

function Box({ label, value, money }: { label: string; value: string; money?: boolean }) {
  return (
    <div className={`rounded-[14px] p-3 ring-1 ${money ? 'bg-lime-tint ring-lime' : 'bg-white ring-hairline'}`}>
      <dt className="t-12 font-medium text-slate">{label}</dt>
      <dd className="num t-16 mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}

/** Credit score dial. Scale is read from the score itself (0–100 or 300–850). */
export function ScoreDial({ score, size = 132, dark }: { score: number; size?: number; dark?: boolean }) {
  const reduced = useReducedMotion();
  const [min, max] = score > 100 ? [300, 850] : [0, 100];
  const t = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const r = 52;
  const len = Math.PI * r * 1.5; // 270° arc
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Credit score ${score}`}>
        <g transform="rotate(135 60 60)">
          <circle cx="60" cy="60" r={r} fill="none" stroke={dark ? 'rgba(255,255,255,0.12)' : '#E6EAE4'} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${len} ${Math.PI * 2 * r}`} />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={dark ? '#C8F169' : '#1F9D55'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${len} ${Math.PI * 2 * r}`}
            initial={reduced ? false : { strokeDashoffset: len }}
            animate={{ strokeDashoffset: len * (1 - t) }}
            transition={{ type: 'spring', visualDuration: 0.9, bounce: 0 }}
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`num font-display text-[2rem] leading-none font-semibold ${dark ? 'text-white' : 'text-ink'}`}>{score}</span>
        <span className={`t-12 ${dark ? 'text-white/60' : 'text-slate'}`}>score</span>
      </div>
    </div>
  );
}
