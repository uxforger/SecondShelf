import { Banknote } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressSteps, SuccessMark } from '../../components/ui/Feedback';
import { api, ApiError, type Loan } from '../../lib/api';
import { naira, shortDate } from '../../lib/format';
import { spring } from '../../lib/motion';
import { toast, useDb } from '../../lib/store';

type Step = 'intro' | 'applying' | 'offer' | 'sending' | 'done' | 'declined';

/** "Get stock loan": apply → offer → accept → disburse, each step visible. */
export function LoanSheet({ open, onClose, verifiedSales }: { open: boolean; onClose: () => void; verifiedSales: number }) {
  const db = useDb();
  const loan = db.loan;
  const [step, setStep] = useState<Step>('intro');
  const [progress, setProgress] = useState(0);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (loan?.status === 'offered') setStep('offer');
    else if (loan?.status === 'accepted') setStep('offer');
    else if (loan?.status === 'disbursed') setStep('done');
    else setStep('intro');
    api
      .loanOffer()
      .then((o) => setAmount(o.amount))
      .catch(() => setAmount(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const busy = step === 'applying' || step === 'sending';

  const apply = async () => {
    setStep('applying');
    setProgress(0);
    const t = window.setTimeout(() => setProgress(1), 900);
    try {
      const l = await api.applyLoan();
      window.clearTimeout(t);
      setProgress(2);
      await new Promise((r) => setTimeout(r, 350));
      setStep(l.status === 'declined' ? 'declined' : 'offer');
    } catch (e) {
      window.clearTimeout(t);
      setStep('intro');
      toast(e instanceof ApiError ? e.message : 'Could not reach the bank.', 'error');
    }
  };

  const accept = async (l: Loan) => {
    setStep('sending');
    setProgress(0);
    try {
      if (l.status === 'offered') await api.acceptLoan(l.id);
      setProgress(1);
      await api.disburseLoan(l.id);
      setProgress(2);
      await new Promise((r) => setTimeout(r, 400));
      setStep('done');
    } catch (e) {
      setStep('offer');
      toast(e instanceof ApiError ? e.message : 'Could not reach the bank.', 'error');
    }
  };

  const footer =
    step === 'intro' ? (
      <Button size="lg" block onClick={apply} disabled={!amount}>
        Apply
      </Button>
    ) : step === 'offer' && loan ? (
      <div className="flex gap-2">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
          Later
        </Button>
        <Button size="lg" className="flex-1" onClick={() => accept(loan)}>
          Accept
        </Button>
      </div>
    ) : step === 'done' || step === 'declined' ? (
      <Button size="lg" block onClick={onClose} data-autofocus>
        Done
      </Button>
    ) : null;

  return (
    <BottomSheet open={open} onClose={() => !busy && onClose()} locked={busy} title={step === 'done' ? undefined : 'Stock loan'} label="Stock loan" footer={footer}>
      <AnimatePresence mode="popLayout" initial={false}>
        {step === 'intro' && (
          <motion.div key="i" exit={{ opacity: 0 }} transition={spring}>
            <p className="t-label text-muted">Based on your Passport</p>
            <p className="num mt-1 text-[2rem] font-semibold leading-[2.375rem] tracking-[-0.01em] text-deep">{amount ? naira(amount) : '…'}</p>
            <p className="t-label num mt-1 text-muted">{naira(verifiedSales)} verified sales in 90 days · 30 days to repay</p>
          </motion.div>
        )}
        {step === 'applying' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring} className="py-2">
            <ProgressSteps steps={[{ label: 'Sending your Passport' }, { label: 'Bank deciding' }]} current={progress} />
          </motion.div>
        )}
        {step === 'offer' && loan && (
          <motion.div key="o" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={spring}>
            <p className="t-label text-muted">Offer</p>
            <p className="num mt-1 text-[2rem] font-semibold leading-[2.375rem] tracking-[-0.01em] text-deep">{naira(loan.principal)}</p>
            <dl className="mt-4 divide-y divide-hairline">
              {loan.interestRate !== undefined && <Row label="Interest" value={`${loan.interestRate}% a month`} />}
              {loan.fee !== undefined && <Row label="Fee" value={naira(loan.fee)} />}
              {loan.netDisbursement !== undefined && <Row label="You receive" value={naira(loan.netDisbursement)} />}
              {loan.creditScore !== undefined && <Row label="Credit score" value={String(loan.creditScore)} />}
              {loan.repaymentTotal !== undefined && <Row label="You repay" value={naira(loan.repaymentTotal)} />}
              <Row label="Due" value={loan.dueDate ? shortDate(loan.dueDate) : `${loan.tenorDays ?? 30} days`} />
              <Row label="Paid into" value={`Xtradot Bank ···${loan.accountNumber.slice(-4)}`} />
            </dl>
          </motion.div>
        )}
        {step === 'sending' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring} className="py-2">
            <ProgressSteps steps={[{ label: 'Accepting offer' }, { label: 'Sending funds' }]} current={progress} />
          </motion.div>
        )}
        {step === 'done' && loan && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="flex flex-col items-center py-6 text-center">
            <SuccessMark size={80} />
            <p className="t-title mt-5 text-deep">Funds sent</p>
            <p className="num mt-1 text-[1.5rem] font-semibold text-deep">{naira(loan.netDisbursement ?? loan.principal)}</p>
            <p className="t-label mt-1 text-muted">To Xtradot Bank ···{loan.accountNumber.slice(-4)}</p>
          </motion.div>
        )}
        {step === 'declined' && (
          <motion.div key="x" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="py-4">
            <p className="t-heading text-deep">Not approved this time</p>
            <p className="t-label mt-1 text-muted">{loan?.declineReason ?? 'More verified sales will help.'}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4">
      <dt className="t-label text-muted">{label}</dt>
      <dd className="num text-[0.9375rem] font-semibold text-deep">{value}</dd>
    </div>
  );
}

/** Dashboard card for the active loan. */
export function LoanCard({ loan, onOpen }: { loan?: Loan; onOpen: () => void }) {
  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="t-heading text-deep">Stock loan</h2>
        {loan?.status === 'disbursed' ? <Badge tone="success">Active</Badge> : loan?.status === 'offered' || loan?.status === 'accepted' ? <Badge tone="warning">Offer ready</Badge> : null}
      </div>
      {loan && loan.status !== 'declined' ? (
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="t-label text-muted">{loan.status === 'disbursed' ? 'Borrowed' : 'Offered'}</p>
            <p className="num mt-0.5 text-[1.375rem] font-semibold leading-7 text-deep">{naira(loan.principal)}</p>
          </div>
          <div>
            <p className="t-label text-muted">{loan.repaymentTotal !== undefined ? 'Repay' : 'Due'}</p>
            <p className="num mt-0.5 text-[1.375rem] font-semibold leading-7 text-deep">
              {loan.repaymentTotal !== undefined ? naira(loan.repaymentTotal) : loan.dueDate ? shortDate(loan.dueDate) : '—'}
            </p>
            {loan.dueDate && loan.repaymentTotal !== undefined && <p className="t-caption text-muted">by {shortDate(loan.dueDate)}</p>}
          </div>
        </div>
      ) : (
        <p className="t-label mt-1 text-muted">Your Passport can back a 30-day stock loan.</p>
      )}
      {loan?.status !== 'disbursed' && (
        <Button variant="secondary" className="mt-5" icon={<Banknote className="size-5" />} onClick={onOpen}>
          {loan?.status === 'offered' || loan?.status === 'accepted' ? 'See offer' : 'Get stock loan'}
        </Button>
      )}
    </Card>
  );
}
