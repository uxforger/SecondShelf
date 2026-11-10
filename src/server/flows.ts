import { randomUUID } from 'node:crypto';
import { ApiError, type BankStatement, type Fulfilment, type Order, type Payout } from '../lib/api/types.ts';
import { BUYER } from '../lib/mock/catalogue.ts';
import { bank, BankError, DEMO_MODE, DISTRIBUTOR_ACCOUNT, PASSPORT_ACCOUNT, SETTLEMENT_ACCOUNT, type TransferResult } from './bank/index.ts';
import { kvGet, kvSet, now, sql } from './db.ts';
import { apply, dryRun, getDb } from './state.ts';

const DELIVERY_FEE = 1500;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* 1. Buyer payment: checkout → hosted page → verify → paid            */
/* ------------------------------------------------------------------ */

interface PaymentRow {
  reference: string;
  order_json: string;
  amount: number;
  status: string;
  payment_url: string | null;
  idem_key: string;
  bank_json: string | null;
}

function newReference(): string {
  const taken = new Set(getDb().orders.map((o) => o.ref));
  for (let i = 0; i < 50; i++) {
    const ref = `SS-${24000 + Math.floor(Math.random() * 76000)}`;
    const row = sql.prepare('SELECT 1 FROM payments WHERE reference = ?').get(ref);
    if (!taken.has(ref) && !row) return ref;
  }
  return `SS-${Date.now().toString().slice(-6)}`;
}

export async function startCheckout(input: { batchId: string; qty: number; fulfilment: Fulfilment }, origin: string) {
  const db = getDb();
  const b = db.batches.find((x) => x.id === input.batchId);
  if (!b?.listing) throw new ApiError('This offer has ended.');
  const deliveryFee = input.fulfilment === 'delivery' ? DELIVERY_FEE : 0;
  const reference = newReference();
  const order: Order = {
    id: `o-${randomUUID().slice(0, 8)}`,
    ref: reference,
    batchId: b.id,
    productId: b.productId,
    sellerId: b.sellerId,
    buyerId: BUYER.id,
    qty: Math.floor(input.qty),
    unitPrice: b.listing.unitPrice,
    deliveryFee,
    total: b.listing.unitPrice * Math.floor(input.qty) + deliveryFee,
    fulfilment: input.fulfilment,
    status: 'paid',
    paidAt: now(),
    distanceKm: BUYER.distanceKm,
  };
  // Same rules as a real sale (stock, expiry) before we ask anyone to pay.
  dryRun({ type: 'order/place', at: order.paidAt, today: today(), order });

  const idem = randomUUID();
  const t = now();
  sql
    .prepare('INSERT INTO payments (reference, order_json, amount, status, idem_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(reference, JSON.stringify(order), order.total, 'created', idem, t, t);

  const product = db.products.find((p) => p.id === order.productId);
  const res = await bank.checkout({
    reference,
    amount: order.total,
    callbackUrl: `${origin}/pay/return`,
    customerName: BUYER.name,
    customerEmail: 'orders@mamatolu.example',
    description: `${product?.name ?? 'Order'} · ${order.qty} cartons`,
    idempotencyKey: idem,
  });
  sql.prepare('UPDATE payments SET status = ?, payment_url = ?, updated_at = ? WHERE reference = ?').run('pending', res.paymentUrl, now(), reference);
  return { reference, paymentUrl: res.paymentUrl, amount: order.total };
}

const finalizing = new Map<string, Promise<{ status: string; order?: Order; message?: string }>>();

/** Always confirm with the bank before giving value. Safe to call many times. */
export function finalizePayment(reference: string) {
  const running = finalizing.get(reference);
  if (running) return running;
  const p = doFinalize(reference).finally(() => finalizing.delete(reference));
  finalizing.set(reference, p);
  return p;
}

async function doFinalize(reference: string): Promise<{ status: string; order?: Order; message?: string }> {
  const row = sql.prepare('SELECT * FROM payments WHERE reference = ?').get(reference) as PaymentRow | undefined;
  if (!row) throw new ApiError('Unknown payment reference.');
  const order = JSON.parse(row.order_json) as Order;
  if (row.status === 'paid') return { status: 'paid', order: getDb().orders.find((o) => o.ref === reference) ?? order };

  const v = await bank.verifyPayment(reference);
  sql.prepare('UPDATE payments SET bank_json = ?, updated_at = ? WHERE reference = ?').run(JSON.stringify(v.raw ?? null), now(), reference);

  if (v.status === 'failed') {
    sql.prepare('UPDATE payments SET status = ?, updated_at = ? WHERE reference = ?').run('failed', now(), reference);
    return { status: 'failed', message: 'The bank declined this payment.' };
  }
  if (v.status !== 'successful') return { status: 'pending' };
  if (v.amount !== undefined && Math.abs(v.amount - row.amount) > 0.009) {
    sql.prepare('UPDATE payments SET status = ?, updated_at = ? WHERE reference = ?').run('failed', now(), reference);
    console.warn(`[pay] amount mismatch on ${reference}`);
    return { status: 'failed', message: 'Amount did not match. Not marked as paid.' };
  }

  const paid: Order = { ...order, paidAt: now(), bankFee: v.fee };
  apply({ type: 'order/place', at: paid.paidAt, today: today(), order: paid });
  sql.prepare('UPDATE payments SET status = ?, updated_at = ? WHERE reference = ?').run('paid', now(), reference);
  return { status: 'paid', order: paid };
}

/* ------------------------------------------------------------------ */
/* 3. Distributor payout after handover: name enquiry → transfer       */
/* ------------------------------------------------------------------ */

interface PayoutRow {
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

const ENQUIRY_TTL = 9 * 60 * 1000; // bank allows 10 min; leave a margin

function handedOverOrder(orderId: string): Order {
  const o = getDb().orders.find((x) => x.id === orderId);
  if (!o) throw new ApiError('Order not found.');
  if (o.status !== 'handed_over') throw new ApiError('Confirm the handover first.');
  return o;
}

function payoutRow(orderId: string) {
  return sql.prepare('SELECT * FROM payouts WHERE order_id = ?').get(orderId) as PayoutRow | undefined;
}

/** Step 1: resolve the account name so the distributor sees who gets paid. */
export async function enquirePayout(orderId: string) {
  const o = handedOverOrder(orderId);
  const row = payoutRow(orderId);
  if (row && !['enquired'].includes(row.status)) return previewOf(row, o);
  const fresh = row?.enquired_at && Date.now() - new Date(row.enquired_at).getTime() < ENQUIRY_TTL;
  if (row && fresh) return previewOf(row, o);

  const ne = await bank.nameEnquiry(DISTRIBUTOR_ACCOUNT);
  const t = now();
  if (row) {
    sql
      .prepare('UPDATE payouts SET account_name = ?, name_enquiry_ref = ?, enquired_at = ?, updated_at = ? WHERE order_id = ?')
      .run(ne.accountName, ne.nameEnquiryRef, t, t, orderId);
  } else {
    sql
      .prepare(
        'INSERT INTO payouts (order_id, reference, idem_key, status, account_number, account_name, name_enquiry_ref, enquired_at, amount, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(orderId, `PO-${o.ref.replace('SS-', '')}-${Date.now().toString(36).slice(-4)}`, randomUUID(), 'enquired', DISTRIBUTOR_ACCOUNT, ne.accountName, ne.nameEnquiryRef, t, o.total, t);
  }
  return previewOf(payoutRow(orderId)!, o);
}

function previewOf(row: PayoutRow, o: Order) {
  return { accountName: row.account_name ?? '', accountNumber: row.account_number, bankName: 'Xtradot Bank', amount: row.amount ?? o.total, status: row.status };
}

/** Step 2: send. One payout per order; on a timeout we requery, never resend. */
export async function sendPayout(orderId: string): Promise<Payout> {
  const o = handedOverOrder(orderId);
  let row = payoutRow(orderId);
  if (!row || !row.name_enquiry_ref) {
    await enquirePayout(orderId);
    row = payoutRow(orderId)!;
  }
  if (row.status === 'successful') return o.payout!;
  if (['sending', 'pending', 'unknown'].includes(row.status)) return settlePayout(o, row);

  if (!row.enquired_at || Date.now() - new Date(row.enquired_at).getTime() > ENQUIRY_TTL) {
    await enquirePayout(orderId);
    row = payoutRow(orderId)!;
  }

  setPayoutStatus(orderId, 'sending');
  try {
    const res = await bank.transfer({
      reference: row.reference,
      sourceAccount: SETTLEMENT_ACCOUNT,
      destinationAccount: row.account_number,
      nameEnquiryRef: row.name_enquiry_ref!,
      amount: row.amount,
      narration: `SecondShelf ${o.ref}`,
      idempotencyKey: row.idem_key,
    });
    return recordTransfer(o, row, res);
  } catch (e) {
    if (e instanceof BankError && e.isTimeout) {
      setPayoutStatus(orderId, 'unknown');
      return settlePayout(o, { ...row, status: 'unknown' });
    }
    // Nothing moved: clear the attempt so the next one gets a fresh key and reference.
    sql.prepare('DELETE FROM payouts WHERE order_id = ?').run(orderId);
    throw e;
  }
}

function setPayoutStatus(orderId: string, status: string) {
  sql.prepare('UPDATE payouts SET status = ?, updated_at = ? WHERE order_id = ?').run(status, now(), orderId);
}

/** Poll the transfer until it is final. Used after 504s and for pending interbank. */
async function settlePayout(o: Order, row: PayoutRow): Promise<Payout> {
  for (let i = 0; i < 6; i++) {
    try {
      const res = await bank.getTransfer(row.reference);
      if (res.status !== 'pending') return recordTransfer(o, row, res);
    } catch (e) {
      if (!(e instanceof BankError) || (e.httpStatus !== 404 && !e.isTimeout)) throw e;
    }
    await sleep(2000);
  }
  const payout = toPayout(o, row, { reference: row.reference, status: 'pending', raw: null });
  apply({ type: 'order/payout', at: now(), orderId: o.id, payout: { ...payout, status: row.status === 'unknown' ? 'unknown' : 'pending' } });
  return payout;
}

function toPayout(o: Order, row: PayoutRow, res: TransferResult): Payout {
  return {
    status: res.status === 'reversed' ? 'failed' : res.status,
    accountName: row.account_name ?? '',
    accountNumber: row.account_number,
    bankName: 'Xtradot Bank',
    amount: row.amount ?? o.total,
    fee: res.fee,
    vat: res.vat,
    stampDuty: res.stampDuty,
    totalDebit: res.totalDebit,
    reference: row.reference,
    sessionId: res.sessionId,
    at: now(),
  };
}

function recordTransfer(o: Order, row: PayoutRow, res: TransferResult): Payout {
  const payout = toPayout(o, row, res);
  sql
    .prepare('UPDATE payouts SET status = ?, bank_json = ?, updated_at = ? WHERE order_id = ?')
    .run(payout.status, JSON.stringify(res.raw ?? null), now(), o.id);
  apply({ type: 'order/payout', at: payout.at, orderId: o.id, payout });
  return payout;
}

/* ------------------------------------------------------------------ */
/* 4. Share Passport: open-banking consent → OTP → statement           */
/* ------------------------------------------------------------------ */

export async function createPassportConsent() {
  const c = await bank.createConsent(PASSPORT_ACCOUNT, randomUUID());
  sql.prepare('INSERT OR REPLACE INTO consents (id, account_number, status, created_at) VALUES (?, ?, ?, ?)').run(c.id, PASSPORT_ACCOUNT, c.status, now());
  return { consentId: c.id, accountNumber: PASSPORT_ACCOUNT };
}

export async function authorisePassportConsent(consentId: string, otp: string): Promise<BankStatement> {
  if (!/^\d{6}$/.test(otp)) throw new ApiError('Enter the 6-digit code.');
  const a = await bank.authoriseConsent(consentId, otp);
  sql.prepare('UPDATE consents SET status = ? WHERE id = ?').run(a.status, consentId);
  const s = await bank.statement(PASSPORT_ACCOUNT, consentId);
  const statement: BankStatement = { ...s, consentId, at: now() };
  apply({ type: 'passport/bank', at: statement.at, statement });
  return statement;
}

/* ------------------------------------------------------------------ */
/* 2. Webhooks: verify HMAC, reject stale, de-duplicate, apply         */
/* ------------------------------------------------------------------ */

export const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://app.team19.svc.cluster.local/api/hooks/forge';

/** Returns false if we've already seen this event. */
export function firstDelivery(eventId: string, type: string): boolean {
  const r = sql.prepare('INSERT OR IGNORE INTO webhook_events (event_id, type, received_at) VALUES (?, ?, ?)').run(eventId, type, now());
  return Number(r.changes) > 0;
}

export async function handleEvent(type: string, data: Record<string, any>) {
  const reference: string | undefined = data?.reference ?? data?.payment_reference ?? data?.transfer_reference;
  if (type.startsWith('payment.') && reference) {
    await finalizePayment(reference).catch((e) => console.warn(`[hook] ${type} ${reference}: ${e.message}`));
    return;
  }
  if (type.startsWith('transfer.') && reference) {
    const row = sql.prepare('SELECT * FROM payouts WHERE reference = ?').get(reference) as PayoutRow | undefined;
    if (!row) return;
    const o = getDb().orders.find((x) => x.id === row.order_id);
    if (!o) return;
    const status = type.split('.')[1];
    recordTransfer(o, row, {
      reference,
      status: status === 'successful' ? 'successful' : status === 'reversed' ? 'reversed' : status === 'failed' ? 'failed' : 'pending',
      fee: data.fee,
      vat: data.vat,
      stampDuty: data.stamp_duty,
      totalDebit: data.total_debit,
      sessionId: data.session_id,
      raw: data,
    });
  }
}

/** Register our in-cluster webhook once; the secret is shown only at registration. */
export async function ensureWebhook() {
  if (DEMO_MODE || kvGet('webhook_secret')) return;
  let idem = kvGet('webhook_idem');
  if (!idem) {
    idem = randomUUID();
    kvSet('webhook_idem', idem);
  }
  // Our earlier registrations (e.g. from a pod that lost its disk) have secrets
  // we no longer know; remove them so every delivery can be verified.
  try {
    for (const w of await bank.listWebhooks()) if (w.url === WEBHOOK_URL) await bank.deleteWebhook(w.id);
  } catch (e) {
    console.warn(`[hook] cleanup skipped: ${(e as Error).message}`);
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const w = await bank.registerWebhook(WEBHOOK_URL, idem);
      if (!w.secret) throw new Error('No webhook_secret in response.');
      kvSet('webhook_secret', w.secret);
      kvSet('webhook_id', String(w.id ?? ''));
      console.log('[hook] registered');
      return;
    } catch (e) {
      console.warn(`[hook] registration failed: ${(e as Error).message}`);
      await sleep(30_000);
    }
  }
}

export const webhookSecret = () => kvGet('webhook_secret');
