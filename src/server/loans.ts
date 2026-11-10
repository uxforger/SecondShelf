import { randomUUID } from 'node:crypto';
import { ApiError, type Loan, type LoanStatus } from '../lib/api/types.ts';
import { metrics } from '../lib/selectors.ts';
import { bank, BankError, LOAN_ACCOUNT, LOAN_BVN } from './bank/index.ts';
import { kvGet, kvSet, now, sql } from './db.ts';
import { apply, getDb } from './state.ts';

/**
 * Inventory loan from the Business Passport: apply → offer → accept → disburse.
 * The amount is sized from verified sales, so the Passport is what earns it.
 */

const TENOR_DAYS = 30;

/** 30% of verified sales in 90 days, ₦100k to ₦1.5m, rounded to ₦10k. */
export function offerAmount() {
  const m = metrics(getDb(), 'biz-ade');
  const raw = m.verifiedSales90 * 0.3;
  return Math.max(100_000, Math.min(1_500_000, Math.round(raw / 10_000) * 10_000));
}

function status(s: string): LoanStatus {
  const v = s.toLowerCase();
  if (['disbursed', 'active', 'running'].includes(v)) return 'disbursed';
  if (['accepted'].includes(v)) return 'accepted';
  if (['declined', 'rejected'].includes(v)) return 'declined';
  if (['closed', 'repaid'].includes(v)) return 'repaid';
  return 'offered';
}

/**
 * Run a record-creating bank call under a stored Idempotency-Key.
 * Timeout: keep the key (a retry replays, never duplicates).
 * Definite rejection (4xx): drop the key so a corrected request isn't a 409.
 */
async function withKey<T>(name: string, fn: (key: string) => Promise<T>): Promise<T> {
  try {
    return await fn(keyFor(name));
  } catch (e) {
    if (e instanceof BankError && !e.isTimeout && e.httpStatus >= 400 && e.httpStatus < 500) sql.prepare('DELETE FROM kv WHERE key = ?').run(name);
    throw e;
  }
}

function save(loan: Loan, note?: { title: string; detail?: string; amount?: number }) {
  apply({ type: 'loan/set', at: now(), loan, note });
}

function keyFor(name: string) {
  let k = kvGet(name);
  if (!k) {
    k = randomUUID();
    kvSet(name, k);
  }
  return k;
}

export async function applyForLoan(): Promise<Loan> {
  const current = getDb().loan;
  if (current && ['offered', 'accepted', 'disbursed'].includes(current.status)) return current;
  const amount = offerAmount();
  // One key per attempt; kept until a decision so a retry replays the same application.
  const r = await withKey('loan_apply_idem', (idempotencyKey) =>
    bank.applyLoan({ accountNumber: LOAN_ACCOUNT, bvn: LOAN_BVN, amount, tenorDays: TENOR_DAYS, purpose: 'Inventory: restock fast-moving packaged food', idempotencyKey }),
  );
  const loan: Loan = {
    id: r.id,
    status: status(r.status),
    principal: r.principal ?? amount,
    interestRate: r.interestRate,
    tenorDays: r.tenorDays ?? TENOR_DAYS,
    fee: r.fee,
    netDisbursement: r.netDisbursement,
    repaymentTotal: r.repaymentTotal,
    dueDate: r.dueDate,
    creditScore: r.creditScore,
    accountNumber: LOAN_ACCOUNT,
    appliedAt: now(),
    declineReason: r.reason,
  };
  if (loan.status === 'declined') kvSet('loan_apply_idem', randomUUID());
  save(loan, loan.status === 'declined' ? { title: 'Loan declined', detail: r.reason } : { title: 'Stock loan offered', detail: `${loan.tenorDays} days`, amount: loan.principal });
  return loan;
}

function mine(id: string): Loan {
  const l = getDb().loan;
  if (!l || l.id !== id) throw new ApiError('Loan not found.');
  return l;
}

export async function acceptLoan(id: string): Promise<Loan> {
  const l = mine(id);
  if (l.status !== 'offered') return l;
  const r = await withKey(`loan_accept_${id}`, (k) => bank.acceptLoan(id, k));
  const next: Loan = { ...l, status: status(r.status) === 'offered' ? 'accepted' : status(r.status), acceptedAt: now(), principal: r.principal ?? l.principal, interestRate: r.interestRate ?? l.interestRate, fee: r.fee ?? l.fee, netDisbursement: r.netDisbursement ?? l.netDisbursement, creditScore: r.creditScore ?? l.creditScore, repaymentTotal: r.repaymentTotal ?? l.repaymentTotal, dueDate: r.dueDate ?? l.dueDate };
  save(next, { title: 'Loan offer accepted', amount: next.principal });
  return next;
}

export async function disburseLoan(id: string): Promise<Loan> {
  const l = mine(id);
  if (l.status === 'disbursed') return l;
  if (l.status !== 'accepted') throw new ApiError('Accept the offer first.');
  const r = await withKey(`loan_disburse_${id}`, (k) => bank.disburseLoan(id, k));
  const s = status(r.status);
  const next: Loan = { ...l, status: s === 'accepted' || s === 'offered' ? 'disbursed' : s, disbursedAt: now(), dueDate: r.dueDate ?? l.dueDate, repaymentTotal: r.repaymentTotal ?? l.repaymentTotal };
  save(next, { title: 'Stock loan disbursed', detail: `To ···${l.accountNumber.slice(-4)}`, amount: next.principal });
  kvSet('loan_apply_idem', randomUUID());
  return next;
}

export async function onLoanEvent(type: string, data: Record<string, any>) {
  const l = getDb().loan;
  const id = data?.loan_id ?? data?.id;
  if (!l || (id && id !== l.id)) return;
  if (type === 'loan.disbursed' && l.status !== 'disbursed') save({ ...l, status: 'disbursed', disbursedAt: l.disbursedAt ?? now() }, { title: 'Stock loan disbursed', amount: l.principal });
  if (type === 'loan.closed') save({ ...l, status: 'repaid' }, { title: 'Stock loan repaid' });
}
