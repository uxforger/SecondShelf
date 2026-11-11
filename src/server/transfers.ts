import { randomUUID } from 'node:crypto';
import type { Payout, PayoutPreview } from '../lib/api/types.ts';
import { bank, BankError, SETTLEMENT_ACCOUNT, type TransferResult } from './bank/index.ts';
import { now, sql } from './db.ts';

/**
 * One transfer per key, ever. Used for order payouts ("o-…") and the
 * distributor's carbon share ("carbon:<certificate>").
 *
 * - name enquiry first, so people see who gets paid
 * - the Idempotency-Key and reference are stored before sending
 * - on a timeout we requery GET /transfers/{ref}; we never resend
 * - fees, VAT and stamp duty come from the bank's response
 */
export interface TransferTarget {
  key: string;
  /** Short readable part of the reference, e.g. "99255". */
  refBase: string;
  account: string;
  amount: number;
  narration: string;
  /** Save the result in app state. */
  record: (p: Payout) => void;
}

interface Row {
  order_id: string;
  reference: string;
  idem_key: string;
  status: string;
  account_number: string;
  account_name: string | null;
  name_enquiry_ref: string | null;
  enquired_at: string | null;
  amount: number;
}

const ENQUIRY_TTL = 9 * 60 * 1000; // bank allows 10 min; keep a margin
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const row = (key: string) => sql.prepare('SELECT * FROM payouts WHERE order_id = ?').get(key) as Row | undefined;
const fresh = (r?: Row) => !!r?.enquired_at && Date.now() - new Date(r.enquired_at).getTime() < ENQUIRY_TTL;

const resolvers: ((key: string) => TransferTarget | null)[] = [];
/** Lets webhooks find the target for a transfer reference. */
export function registerResolver(fn: (key: string) => TransferTarget | null) {
  resolvers.push(fn);
}

export async function enquire(t: TransferTarget): Promise<PayoutPreview & { status: string }> {
  const r = row(t.key);
  if (r && (r.status !== 'enquired' || fresh(r))) return preview(r);
  const ne = await bank.nameEnquiry(t.account);
  const at = now();
  // Two enquiries can run at once (two devices, a double tap). The first insert
  // wins and keeps its reference and idempotency key; the other just refreshes
  // the name, and only while the payout hasn't started sending.
  const inserted = sql
    .prepare(
      'INSERT OR IGNORE INTO payouts (order_id, reference, idem_key, status, account_number, account_name, name_enquiry_ref, enquired_at, amount, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(t.key, `PO-${t.refBase}-${Date.now().toString(36).slice(-4)}`, randomUUID(), 'enquired', t.account, ne.accountName, ne.nameEnquiryRef, at, t.amount, at);
  if (Number(inserted.changes) === 0) {
    sql
      .prepare("UPDATE payouts SET account_name = ?, name_enquiry_ref = ?, enquired_at = ?, updated_at = ? WHERE order_id = ? AND status = 'enquired'")
      .run(ne.accountName, ne.nameEnquiryRef, at, at, t.key);
  }
  return preview(row(t.key)!);
}

function preview(r: Row) {
  return { accountName: r.account_name ?? '', accountNumber: r.account_number, bankName: 'Xtradot Bank', amount: r.amount, status: r.status };
}

export async function send(t: TransferTarget, existing?: Payout): Promise<Payout> {
  let r = row(t.key);
  if (r?.status === 'successful' && existing) return existing;
  if (r && ['sending', 'pending', 'unknown'].includes(r.status)) return settle(t, r);
  if (!r || !fresh(r)) {
    await enquire(t);
    r = row(t.key)!;
  }
  setStatus(t.key, 'sending');
  try {
    const res = await bank.transfer({
      reference: r.reference,
      sourceAccount: SETTLEMENT_ACCOUNT,
      destinationAccount: r.account_number,
      nameEnquiryRef: r.name_enquiry_ref!,
      amount: r.amount,
      narration: t.narration,
      idempotencyKey: r.idem_key,
    });
    return finish(t, r, res);
  } catch (e) {
    if (e instanceof BankError && e.isTimeout) {
      setStatus(t.key, 'unknown');
      return settle(t, { ...r, status: 'unknown' });
    }
    // Nothing moved: drop the attempt so the next one gets a fresh key and reference.
    sql.prepare('DELETE FROM payouts WHERE order_id = ?').run(t.key);
    throw e;
  }
}

function setStatus(key: string, status: string) {
  sql.prepare('UPDATE payouts SET status = ?, updated_at = ? WHERE order_id = ?').run(status, now(), key);
}

async function settle(t: TransferTarget, r: Row): Promise<Payout> {
  for (let i = 0; i < 6; i++) {
    try {
      const res = await bank.getTransfer(r.reference);
      if (res.status !== 'pending') return finish(t, r, res);
    } catch (e) {
      if (!(e instanceof BankError) || (e.httpStatus !== 404 && !e.isTimeout)) throw e;
    }
    await sleep(2000);
  }
  const p = toPayout(r, { reference: r.reference, status: 'pending', raw: null });
  const waiting = { ...p, status: r.status === 'unknown' ? ('unknown' as const) : ('pending' as const) };
  t.record(waiting);
  return waiting;
}

function toPayout(r: Row, res: TransferResult): Payout {
  return {
    status: res.status === 'reversed' ? 'failed' : res.status,
    accountName: r.account_name ?? '',
    accountNumber: r.account_number,
    bankName: 'Xtradot Bank',
    amount: r.amount,
    fee: res.fee,
    vat: res.vat,
    stampDuty: res.stampDuty,
    totalDebit: res.totalDebit,
    reference: r.reference,
    sessionId: res.sessionId,
    at: now(),
  };
}

function finish(t: TransferTarget, r: Row, res: TransferResult): Payout {
  const p = toPayout(r, res);
  sql.prepare('UPDATE payouts SET status = ?, bank_json = ?, updated_at = ? WHERE order_id = ?').run(p.status, JSON.stringify(res.raw ?? null), now(), t.key);
  t.record(p);
  return p;
}

/** transfer.* webhook: update whichever payout this reference belongs to. */
export function applyTransferEvent(reference: string, res: TransferResult) {
  const r = sql.prepare('SELECT * FROM payouts WHERE reference = ?').get(reference) as Row | undefined;
  if (!r) return;
  for (const resolve of resolvers) {
    const t = resolve(r.order_id);
    if (t) return void finish(t, r, res);
  }
}
