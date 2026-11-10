import { randomUUID } from 'node:crypto';
import { ApiError, type BankStatement, type Fulfilment, type Order, type Payout } from '../lib/api/types.ts';
import { BUYER } from '../lib/mock/catalogue.ts';
import { mockBank } from './bank/mock.ts';
import { bank, BankError, DEMO_MODE, DISTRIBUTOR_ACCOUNT, PASSPORT_ACCOUNT } from './bank/index.ts';
import { applyPoolTransfer, onCarbonEvent } from './carbon.ts';
import { onLoanEvent } from './loans.ts';
import { merchantId, onMerchantEvent } from './merchant.ts';
import { applyTransferEvent, enquire, registerResolver, send, type TransferTarget } from './transfers.ts';
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
  const merchant = merchantId();

  const idem = randomUUID();
  const t = now();
  sql
    .prepare('INSERT INTO payments (reference, order_json, amount, status, idem_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(reference, JSON.stringify(order), order.total, 'created', idem, t, t);

  const product = db.products.find((p) => p.id === order.productId);
  const res = await bank.checkout({
    merchantId: merchant,
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

function handedOverOrder(orderId: string): Order {
  const o = getDb().orders.find((x) => x.id === orderId);
  if (!o) throw new ApiError('Order not found.');
  if (o.status !== 'handed_over') throw new ApiError('Confirm the handover first.');
  return o;
}

function orderTarget(o: Order): TransferTarget {
  return {
    key: o.id,
    refBase: o.ref.replace('SS-', ''),
    account: DISTRIBUTOR_ACCOUNT,
    amount: o.total,
    narration: `SecondShelf ${o.ref}`,
    record: (payout) => apply({ type: 'order/payout', at: payout.at, orderId: o.id, payout }),
  };
}

registerResolver((key) => {
  const o = getDb().orders.find((x) => x.id === key);
  return o ? orderTarget(o) : null;
});

/** Step 1: resolve the account name so the distributor sees who gets paid. */
export const enquirePayout = (orderId: string) => enquire(orderTarget(handedOverOrder(orderId)));

/** Step 2: send. One payout per order; on a timeout we requery, never resend. */
export function sendPayout(orderId: string): Promise<Payout> {
  const o = handedOverOrder(orderId);
  return send(orderTarget(o), o.payout);
}

/* ------------------------------------------------------------------ */
/* 4. Share Passport: open-banking consent → OTP → statement           */
/* ------------------------------------------------------------------ */

/** Real consent when possible; the simulated bank only when the sandbox can't take it. */
let consentBank = bank;

export async function createPassportConsent() {
  consentBank = bank;
  let c: { id: string; status: string };
  try {
    c = await bank.createConsent(PASSPORT_ACCOUNT, randomUUID());
  } catch (e) {
    const phoneProblem = e instanceof BankError && (e.code === 'CONSENT_PHONE_MISSING' || e.field === 'customer_phone');
    if (!phoneProblem || bank.mode === 'mock') throw e;
    console.warn('[passport] sandbox consent needs the holder phone (CONSENT_PHONE); using the simulated bank');
    consentBank = mockBank;
    c = await mockBank.createConsent(PASSPORT_ACCOUNT, randomUUID());
  }
  sql.prepare('INSERT OR REPLACE INTO consents (id, account_number, status, created_at) VALUES (?, ?, ?, ?)').run(c.id, PASSPORT_ACCOUNT, c.status, now());
  return { consentId: c.id, accountNumber: PASSPORT_ACCOUNT };
}

export async function revokePassportConsent() {
  const s = getDb().passportStatement;
  if (!s) return null;
  if (s.source !== 'simulated') await bank.revokeConsent(s.consentId);
  sql.prepare('UPDATE consents SET status = ? WHERE id = ?').run('revoked', s.consentId);
  apply({ type: 'passport/revoked', at: now() });
  return { revoked: true };
}

export async function authorisePassportConsent(consentId: string, otp: string): Promise<BankStatement> {
  if (!/^\d{6}$/.test(otp)) throw new ApiError('Enter the 6-digit code.');
  const a = await consentBank.authoriseConsent(consentId, otp);
  sql.prepare('UPDATE consents SET status = ? WHERE id = ?').run(a.status, consentId);
  const s = await consentBank.statement(PASSPORT_ACCOUNT, consentId);
  const statement: BankStatement = { ...s, consentId, at: now(), source: consentBank.mode === 'mock' ? 'simulated' : 'bank' };
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
    const status = type.split('.')[1];
    // The registry's payout to the carbon pool isn't one of our transfers.
    if (applyPoolTransfer(reference, status, data)) return;
    applyTransferEvent(reference, {
      reference,
      status: status === 'successful' ? 'successful' : status === 'reversed' ? 'reversed' : status === 'failed' ? 'failed' : 'pending',
      fee: data.fee,
      vat: data.vat,
      stampDuty: data.stamp_duty,
      totalDebit: data.total_debit,
      sessionId: data.session_id,
      raw: data,
    });
    return;
  }
  if (type.startsWith('carbon.')) {
    await onCarbonEvent(type, data).catch((e) => console.warn(`[hook] ${type}: ${(e as Error).message}`));
    return;
  }
  if (type.startsWith('merchant.')) {
    onMerchantEvent(type, data);
    return;
  }
  if (type.startsWith('loan.')) {
    await onLoanEvent(type, data).catch((e) => console.warn(`[hook] ${type}: ${(e as Error).message}`));
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
