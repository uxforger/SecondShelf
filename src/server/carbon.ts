import { createHash, randomUUID } from 'node:crypto';
import {
  ApiError,
  type CarbonCertificate,
  type CarbonRetirement,
  type CarbonSale,
  type CarbonState,
  type CarbonSubmission,
  type MrvStatus,
  type Payout,
  type PoolPayout,
} from '../lib/api/types.ts';
import { avoidedCo2e, DRY_SHARE, EMISSION_FACTOR, LATER_WASTE, transportFor, VAN_T_PER_KM } from '../lib/carbon.ts';
import { shortDate } from '../lib/format.ts';
import { FOOD_BANK } from '../lib/mock/catalogue.ts';
import { bank, BankError, DISTRIBUTOR_ACCOUNT, type BankClient } from './bank/index.ts';
import { mockBank } from './bank/mock.ts';
import { kvGet, kvSet, now, sql } from './db.ts';
import { apply, getDb } from './state.ts';
import { enquire, registerResolver, send, type TransferTarget } from './transfers.ts';

/**
 * Forge Carbon Registry (sandbox), as approved by the organisers:
 *
 * - We calculate tCO2e with our VM0046 food-waste method. Our UI always
 *   calls the project "Food waste reduction (VM0046)".
 * - The registry only takes its listed types, so ONE pool project is
 *   registered as solar_replacing_diesel and shown as
 *   "SecondShelf carbon pool (sandbox)".
 * - MRV carries the tonnes as solar-equivalent kWh:
 *   kWh = ceil(tCO2e / 0.00053), with an evidence page listing the batches.
 * - Credits are sold through checkout to the registry merchant, retired with
 *   that payment_reference, and the registry pays the pool (minus 2%).
 * - We then send the distributor 60% of the pool payout.
 */

export const PROJECT_NAME = 'Food waste reduction (VM0046)';
export const POOL_NAME = 'SecondShelf carbon pool (sandbox)';
const METHODOLOGY = 'VM0046';
const REGISTRY_METHODOLOGY = 'VM0046 food loss and waste (carried via sandbox solar type)';
const REGISTRY_TYPE = 'solar_replacing_diesel';
/** Sandbox solar factor: 0.53 tCO2e per MWh. */
const T_PER_KWH = 0.00053;
const POOL_OWNER = {
  name: 'Arewa Solar Co-operative Society',
  contactName: 'Hauwa Lawal Garba',
  phone: '+2348031234508',
  payoutAccount: process.env.CARBON_POOL_ACCOUNT || '0123987005',
  bankCode: process.env.CARBON_POOL_BANK || '000015',
};
const CARBON_MERCHANT = process.env.CARBON_MERCHANT_ID || 'mer_900';
/** Naira per credit (1 credit = 1 tCO2e). */
const PRICE_NGN = Number(process.env.CARBON_PRICE_NGN || 25_000);
export const DISTRIBUTOR_SHARE = 0.6;
const BUYER = { name: 'Eko Green Offsets Ltd', email: 'offsets@ekogreen.example' };
const PUBLIC_URL = (process.env.PUBLIC_URL || 'https://team19.xtradot.co').replace(/\/$/, '');
const SELLER = 'biz-ade';

/** Local demo mode (no team key) runs the same steps on the mock registry. */
function registry(): BankClient {
  return bank.mode === 'mock' ? mockBank : bank;
}

function save(carbon: CarbonState, note?: { title: string; detail?: string; amount?: number }) {
  apply({ type: 'carbon/set', at: now(), carbon, note });
}

function keyFor(name: string) {
  let k = kvGet(name);
  if (!k) {
    k = randomUUID();
    kvSet(name, k);
  }
  return k;
}

/**
 * Run a record-creating bank call under a stored Idempotency-Key.
 * Timeout: keep the key (a later call replays, never duplicates).
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

const t3 = (n: number) => Math.round(n * 1000) / 1000;
export const kwhFor = (tco2e: number) => Math.ceil(Number((tco2e / T_PER_KWH).toFixed(6)));

function fresh(c: Partial<CarbonState> & { projectId: string; registry: CarbonState['registry']; payoutAccountName?: string }): CarbonState {
  return {
    projectName: PROJECT_NAME,
    poolName: POOL_NAME,
    methodology: METHODOLOGY,
    createdAt: now(),
    submissions: [],
    sales: [],
    retirements: [],
    ...c,
  };
}

/* ---------------- Pool project (registered once) ---------------- */

const POOL_KEY = 'carbon_pool_project';

export async function ensureProject(): Promise<CarbonState> {
  const mode = bank.mode === 'mock' ? 'simulated' : 'sandbox';
  const existing = getDb().carbon;
  if (existing?.projectId && existing.registry === mode) return { ...existing, projectName: PROJECT_NAME, poolName: POOL_NAME, sales: existing.sales ?? [] };

  const stored = kvGet(POOL_KEY);
  if (stored && mode === 'sandbox') {
    const { id, accountName } = JSON.parse(stored) as { id: string; accountName?: string };
    const carbon = fresh({ registry: 'sandbox', projectId: id, payoutAccountName: accountName });
    save(carbon);
    return carbon;
  }

  const p = await withKey('carbon_pool_idem', (idempotencyKey) =>
    registry().createCarbonProject({
      name: POOL_NAME,
      type: REGISTRY_TYPE,
      methodology: REGISTRY_METHODOLOGY,
      location: { state: 'Lagos', lga: 'Mushin', lat: 6.5355, lng: 3.3487 },
      owner: POOL_OWNER,
      idempotencyKey,
    }),
  );
  if (mode === 'sandbox') kvSet(POOL_KEY, JSON.stringify({ id: p.id, accountName: p.payoutAccountName }));
  console.log(`[carbon] pool project ${p.id} ${p.status}`);
  const carbon = fresh({ registry: mode, projectId: p.id, payoutAccountName: p.payoutAccountName });
  save(carbon, { title: 'Carbon pool registered', detail: `${POOL_NAME} · Forge Carbon Registry` });
  return carbon;
}

export const registrationResult = () => kvGet(POOL_KEY);

/* ---------------- What can be reported ---------------- */

export interface EligibleItem {
  id: string;
  kind: 'sale' | 'donation';
  product: string;
  batchNo: string;
  qty: number;
  netWeightKg: number;
  dryShare: number;
  transportT: number;
  tco2e: number;
  reference: string;
  at: string;
}

/** Rescued batches with past destruction records, handed over or collected, not yet reported. */
export function eligible(): EligibleItem[] {
  const db = getDb();
  const covered = new Set((db.carbon?.submissions ?? []).filter((s) => s.status !== 'rejected').flatMap((s) => s.itemIds));
  const batch = new Map(db.batches.map((b) => [b.id, b]));
  const product = new Map(db.products.map((p) => [p.id, p]));
  const out: EligibleItem[] = [];

  for (const o of db.orders) {
    if (o.sellerId !== SELLER || o.status !== 'handed_over') continue;
    const b = batch.get(o.batchId);
    const p = product.get(o.productId);
    const id = `order:${o.id}`;
    if (!b?.baselineDestroyed || !p || covered.has(id)) continue;
    const kg = o.qty * p.netKg;
    const transportT = transportFor(o.distanceKm);
    const dryShare = DRY_SHARE[p.type];
    out.push({ id, kind: 'sale', product: p.name, batchNo: b.batchNo, qty: o.qty, netWeightKg: kg, dryShare, transportT, tco2e: avoidedCo2e({ netWeightKg: kg, dryShare, transportT }), reference: o.ref, at: o.handedOverAt ?? o.paidAt });
  }
  for (const b of db.batches) {
    const d = b.donation;
    const p = product.get(b.productId);
    const id = `donation:${b.id}`;
    if (b.sellerId !== SELLER || d?.status !== 'collected' || !b.baselineDestroyed || !p || covered.has(id)) continue;
    const kg = d.qty * p.netKg;
    const transportT = transportFor(FOOD_BANK.distanceKm);
    const dryShare = DRY_SHARE[p.type];
    out.push({ id, kind: 'donation', product: p.name, batchNo: b.batchNo, qty: d.qty, netWeightKg: kg, dryShare, transportT, tco2e: avoidedCo2e({ netWeightKg: kg, dryShare, transportT }), reference: `DON-${b.batchNo}`, at: d.collectedAt ?? d.offeredAt });
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

export function preview() {
  const items = eligible();
  const tco2e = t3(items.reduce((n, i) => n + i.tco2e, 0));
  return {
    items: items.length,
    handovers: items.filter((i) => i.kind === 'sale').length,
    collections: items.filter((i) => i.kind === 'donation').length,
    foodKg: Math.round(items.reduce((n, i) => n + i.netWeightKg, 0)),
    tco2e,
    kwh: kwhFor(tco2e),
  };
}

/* ---------------- Evidence (submission → batches) ---------------- */

interface EvidenceRow {
  id: string;
  mrv_id: string | null;
  items_json: string;
  tco2e: number;
  kwh: number;
  period_from: string;
  period_to: string;
  created_at: string;
}

export function evidence(id: string) {
  const r = sql.prepare('SELECT * FROM carbon_evidence WHERE id = ?').get(id) as EvidenceRow | undefined;
  if (!r) return null;
  return { id: r.id, mrvId: r.mrv_id, items: JSON.parse(r.items_json) as EligibleItem[], tco2e: r.tco2e, kwh: r.kwh, periodFrom: r.period_from, periodTo: r.period_to, createdAt: r.created_at };
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Public page the registry's evidence_url points at. */
export function evidenceHtml(id: string): string | null {
  const e = evidence(id);
  if (!e) return null;
  const sub = getDb().carbon?.submissions.find((s) => s.evidenceId === id);
  const kg = e.items.reduce((n, i) => n + i.netWeightKg, 0);
  const rows = e.items
    .map(
      (i) =>
        `<tr><td>${esc(i.at.slice(0, 10))}</td><td>${esc(i.reference)}</td><td>${i.kind === 'sale' ? 'Buyer handover' : 'Food bank collection'}</td><td>${esc(i.product)}<br><small>Batch ${esc(i.batchNo)} · ${i.qty} cartons</small></td><td class="n">${i.netWeightKg.toFixed(1)}</td><td class="n">${i.dryShare.toFixed(2)}</td><td class="n">${i.transportT.toFixed(4)}</td><td class="n">${i.tco2e.toFixed(4)}</td></tr>`,
    )
    .join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MRV evidence ${esc(e.id)}</title><style>
:root{color-scheme:light dark;--bg:#f6f8f3;--fg:#0b3b2e;--muted:#5a6e64;--card:#fff;--line:#e3ede0}
@media (prefers-color-scheme:dark){:root{--bg:#0c1512;--fg:#e8f1ec;--muted:#9fb3a8;--card:#13201b;--line:#22332c}}
body{margin:0;font:15px/1.5 system-ui,sans-serif;background:var(--bg);color:var(--fg)}
main{max-width:960px;margin:0 auto;padding:24px 16px 48px}
h1{font-size:26px;margin:0 0 4px}p{margin:4px 0;color:var(--muted)}
section{background:var(--card);border-radius:18px;padding:18px;margin-top:16px;overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:720px}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
small{color:var(--muted)}code{font-size:14px}dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;margin:0}dt{color:var(--muted)}dd{margin:0;font-variant-numeric:tabular-nums}
</style></head><body><main>
<p>SecondShelf · MRV evidence</p>
<h1>${esc(PROJECT_NAME)}</h1>
<p>Registry project: ${esc(POOL_NAME)} · Sandbox registry · food-waste tonnes carried as solar-equivalent units</p>
<section><dl>
<dt>Evidence id</dt><dd>${esc(e.id)}</dd>
<dt>Registry submission</dt><dd>${esc(e.mrvId ?? 'pending')}</dd>
<dt>Period</dt><dd>${esc(e.periodFrom)} to ${esc(e.periodTo)}</dd>
<dt>Batches</dt><dd>${e.items.length} (${e.items.filter((i) => i.kind === 'sale').length} handovers, ${e.items.filter((i) => i.kind === 'donation').length} collections)</dd>
<dt>Net food weight</dt><dd>${kg.toFixed(1)} kg</dd>
<dt>Result</dt><dd><b>${e.tco2e.toFixed(3)} tCO₂e</b></dd>
<dt>Reported to registry</dt><dd>${e.kwh.toLocaleString('en-US')} kWh (energy_generated_kwh = ceil(tCO₂e ÷ 0.00053))</dd>
${sub?.serialRange ? `<dt>Serial range</dt><dd>${esc(sub.serialRange)}</dd>` : ''}
</dl></section>
<section><b>Formula (VM0046 food loss and waste)</b>
<p><code>tCO₂e = net tonnes × dry share × ${EMISSION_FACTOR} × (1 − ${LATER_WASTE}) − transport</code></p>
<p>${EMISSION_FACTOR} tCO₂e per dry tonne kept out of disposal; ${LATER_WASTE * 100}% assumed wasted later by the buyer; transport = km × ${VAN_T_PER_KM} t per km (light van). Only lines with past destruction records count, and each batch is reported once.</p></section>
<section><table><thead><tr><th>Date</th><th>Reference</th><th>Event</th><th>Product</th><th class="n">Net kg</th><th class="n">Dry share</th><th class="n">Transport t</th><th class="n">tCO₂e</th></tr></thead>
<tbody>${rows}</tbody></table></section>
<p style="margin-top:16px"><small>Synthetic hackathon data (Access Youth Tech Forge sandbox). Payments are QR-confirmed handovers with bank-verified payments.</small></p>
</main></body></html>`;
}

/* ---------------- MRV ---------------- */

function mrvStatus(s: string): MrvStatus {
  const v = s.toLowerCase();
  if (['verified', 'approved', 'issued'].includes(v)) return 'verified';
  if (['rejected', 'declined'].includes(v)) return 'rejected';
  if (v === 'submitted') return 'submitted';
  return 'under_review';
}

const watching = new Set<string>();
/** Check back after the registry's auto-verify time (the webhook usually gets there first). */
function watch(mrvId: string, at?: string) {
  if (watching.has(mrvId)) return;
  watching.add(mrvId);
  const delay = Math.min(Math.max((at ? new Date(at).getTime() - Date.now() : 60_000) + 3_000, 5_000), 10 * 60_000);
  const tick = async (n: number) => {
    const sub = getDb().carbon?.submissions.find((s) => s.mrvId === mrvId);
    if (!sub || sub.status === 'verified' || sub.status === 'rejected' || n > 8) return void watching.delete(mrvId);
    await refreshMrv(mrvId).catch((e) => console.warn(`[carbon] refresh ${mrvId}: ${(e as Error).message}`));
    setTimeout(() => void tick(n + 1), 20_000);
  };
  setTimeout(() => void tick(0), delay);
}

export async function submitMrv(): Promise<CarbonSubmission> {
  const carbon = await ensureProject();
  const items = eligible();
  if (!items.length) throw new ApiError('Nothing new to report yet.');
  const tco2e = t3(items.reduce((n, i) => n + i.tco2e, 0));
  const kwh = kwhFor(tco2e);
  const foodKg = Math.round(items.reduce((n, i) => n + i.netWeightKg, 0));
  const handovers = items.filter((i) => i.kind === 'sale').length;
  const collections = items.length - handovers;
  const periodStart = items[0].at.slice(0, 10);
  const periodEnd = items[items.length - 1].at.slice(0, 10);
  // Same items → same evidence id and Idempotency-Key, so a retry replays instead of double-reporting.
  const hash = createHash('sha256').update(items.map((i) => i.id).join(',')).digest('hex');
  const evidenceId = `ev-${hash.slice(0, 12)}`;
  sql
    .prepare('INSERT OR IGNORE INTO carbon_evidence (id, mrv_id, items_json, tco2e, kwh, period_from, period_to, created_at) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)')
    .run(evidenceId, JSON.stringify(items), tco2e, kwh, periodStart, periodEnd, now());

  const r = await withKey(`mrv_idem_${hash.slice(0, 24)}`, (idempotencyKey) =>
    registry().submitMrv({
      projectId: carbon.projectId,
      periodFrom: periodStart,
      periodTo: periodEnd,
      metric: 'energy_generated_kwh',
      value: kwh,
      evidenceUrl: `${PUBLIC_URL}/evidence/${evidenceId}`,
      idempotencyKey,
    }),
  );
  sql.prepare('UPDATE carbon_evidence SET mrv_id = ? WHERE id = ?').run(r.id, evidenceId);
  const sub: CarbonSubmission = {
    mrvId: r.id,
    evidenceId,
    status: mrvStatus(r.status),
    tco2e,
    kwh,
    estimatedTco2e: r.estimatedTco2e,
    autoVerifyAt: r.autoVerifyAt,
    itemIds: items.map((i) => i.id),
    handovers,
    collections,
    foodKg,
    periodStart,
    periodEnd,
    submittedAt: now(),
  };
  const latest = getDb().carbon ?? carbon;
  save({ ...latest, submissions: [sub, ...latest.submissions.filter((s) => s.mrvId !== sub.mrvId)] }, { title: 'MRV submitted', detail: `${tco2e.toFixed(2)} tCO₂e · ${items.length} rescued batches` });
  watch(r.id, r.autoVerifyAt);
  return sub;
}

function updateSubmission(mrvId: string, patch: Partial<CarbonSubmission>) {
  const c = getDb().carbon;
  const before = c?.submissions.find((s) => s.mrvId === mrvId);
  if (!c || !before) return;
  const next = { ...before, ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) } as CarbonSubmission;
  if (next.status === 'verified' && !next.verifiedAt) next.verifiedAt = now();
  const note =
    before.status !== next.status
      ? next.status === 'verified'
        ? { title: 'Credits issued', detail: `${next.creditsIssued ?? 0} credits · ${next.serialRange ?? 'serials pending'}` }
        : next.status === 'rejected'
          ? { title: 'MRV rejected', detail: next.reviewNote }
          : undefined
      : undefined;
  save({ ...c, submissions: c.submissions.map((s) => (s.mrvId === mrvId ? next : s)) }, note);
}

export async function refreshMrv(mrvId: string) {
  const r = await registry().getMrv(mrvId);
  updateSubmission(mrvId, {
    status: mrvStatus(r.status),
    estimatedTco2e: r.estimatedTco2e,
    verifiedTco2e: r.verifiedTco2e,
    creditsIssued: r.creditsIssued,
    creditBatchId: r.creditBatchId,
    serialRange: r.serialRange,
    autoVerifyAt: r.autoVerifyAt,
    reviewNote: r.note,
  });
  return getDb().carbon?.submissions.find((s) => s.mrvId === mrvId);
}

/* ---------------- Sell: buyer pays the registry merchant ---------------- */

interface SaleRow {
  reference: string;
  mrv_id: string;
  quantity: number;
  price: number;
  amount: number;
  status: string;
  idem_key: string;
}

function upsertSale(sale: CarbonSale) {
  const c = getDb().carbon!;
  const sales = c.sales ?? [];
  save({ ...c, sales: [sale, ...sales.filter((s) => s.reference !== sale.reference)] });
}

export async function sellCredits(mrvId: string, origin: string) {
  const c = getDb().carbon;
  const sub = c?.submissions.find((s) => s.mrvId === mrvId);
  if (!c || !sub) throw new ApiError('Report not found.');
  if (sub.status !== 'verified' || !sub.creditBatchId) throw new ApiError('Wait for the credits to be issued.');
  const quantity = Math.floor(sub.creditsIssued ?? 0);
  if (quantity < 1) throw new ApiError('Less than one whole credit was issued. Report more rescued food first.');
  if (c.retirements.some((r) => r.mrvId === mrvId)) throw new ApiError('These credits are already retired.');

  // One open sale per report: reuse the same checkout instead of starting another.
  const open = sql.prepare("SELECT * FROM carbon_sales WHERE mrv_id = ? AND status IN ('pending','paid') ORDER BY created_at DESC").get(mrvId) as SaleRow | undefined;
  const payUrl = kvGet(`carbon_sale_url_${open?.reference}`);
  if (open && payUrl) return { reference: open.reference, paymentUrl: payUrl, amount: open.amount };

  const reference = `CC-${Date.now().toString(36).toUpperCase()}${randomUUID().slice(0, 3).toUpperCase()}`;
  const amount = quantity * PRICE_NGN;
  const idem = randomUUID();
  sql.prepare('INSERT INTO carbon_sales (reference, mrv_id, quantity, price, amount, status, idem_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(reference, mrvId, quantity, PRICE_NGN, amount, 'pending', idem, now());
  try {
    const res = await registry().checkout({
      merchantId: CARBON_MERCHANT,
      reference,
      amount,
      callbackUrl: `${origin}/carbon/return`,
      customerName: BUYER.name,
      customerEmail: BUYER.email,
      description: `${quantity} carbon credits · ${POOL_NAME}`,
      idempotencyKey: idem,
    });
    kvSet(`carbon_sale_url_${reference}`, res.paymentUrl);
    upsertSale({ reference, mrvId, quantity, pricePerCredit: PRICE_NGN, amount, buyer: BUYER.name, status: 'pending', createdAt: now() });
    return { reference, paymentUrl: res.paymentUrl, amount };
  } catch (e) {
    if (e instanceof BankError && !e.isTimeout) sql.prepare('DELETE FROM carbon_sales WHERE reference = ?').run(reference);
    throw e;
  }
}

const completing = new Map<string, Promise<{ status: string; retirement?: CarbonRetirement; message?: string }>>();

/** Verify the buyer's payment, then retire with its payment_reference. Safe to call many times. */
export function completeSale(reference: string) {
  const running = completing.get(reference);
  if (running) return running;
  const p = doComplete(reference).finally(() => completing.delete(reference));
  completing.set(reference, p);
  return p;
}

function setSale(reference: string, status: CarbonSale['status']) {
  sql.prepare('UPDATE carbon_sales SET status = ? WHERE reference = ?').run(status, reference);
  const s = getDb().carbon?.sales?.find((x) => x.reference === reference);
  if (s && s.status !== status) upsertSale({ ...s, status });
}

async function doComplete(reference: string): Promise<{ status: string; retirement?: CarbonRetirement; message?: string }> {
  const row = sql.prepare('SELECT * FROM carbon_sales WHERE reference = ?').get(reference) as SaleRow | undefined;
  if (!row) throw new ApiError('Unknown sale reference.');
  const done = getDb().carbon?.retirements.find((r) => r.saleReference === reference);
  if (done) return { status: 'retired', retirement: done };
  if (row.status === 'failed') return { status: 'failed', message: 'The payment did not go through.' };

  if (row.status !== 'paid') {
    const v = await registry().verifyPayment(reference);
    if (v.status === 'failed') {
      setSale(reference, 'failed');
      return { status: 'failed', message: 'The bank declined this payment.' };
    }
    if (v.status !== 'successful') return { status: 'pending' };
    if (v.amount !== undefined && Math.abs(v.amount - row.amount) > 0.009) {
      setSale(reference, 'failed');
      console.warn(`[carbon] amount mismatch on ${reference}`);
      return { status: 'failed', message: 'Amount did not match. Credits not retired.' };
    }
    setSale(reference, 'paid');
  }

  const c = getDb().carbon!;
  const sub = c.submissions.find((s) => s.mrvId === row.mrv_id);
  if (!sub?.creditBatchId) throw new ApiError('Credits not issued for this report.');
  const reason = `Food rescued before expiry in Lagos, ${shortDate(sub.periodStart)} to ${shortDate(sub.periodEnd)} ${sub.periodEnd.slice(0, 4)}`;
  const r = await withKey(`retire_${reference}`, (idempotencyKey) =>
    registry().retireCredits({ creditBatchId: sub.creditBatchId!, quantity: row.quantity, buyer: BUYER, pricePerCredit: row.price, paymentReference: reference, reason, idempotencyKey }),
  );
  const totalAmount = r.totalAmount ?? row.amount;
  const registryFee = r.registryFee ?? 0;
  const pool: PoolPayout | undefined = r.payout
    ? { reference: r.payout.reference, amount: r.payout.amount, accountName: r.payout.accountName, status: r.payout.status === 'successful' ? 'successful' : r.payout.status === 'failed' ? 'failed' : 'pending', at: r.payout.status === 'successful' ? now() : undefined }
    : undefined;
  const net = pool?.amount ?? totalAmount - registryFee;
  const retirement: CarbonRetirement = {
    certificateId: r.retirementId,
    mrvId: row.mrv_id,
    tco2e: r.quantity || row.quantity,
    serialRange: sub.serialRange,
    buyer: BUYER.name,
    reason,
    retiredAt: now(),
    saleReference: reference,
    pricePerCredit: row.price,
    totalAmount,
    registryFee,
    poolPayout: pool,
    distributorShare: Math.round(net * DISTRIBUTOR_SHARE),
    certificateUrl: r.certificateUrl,
  };
  sql.prepare('UPDATE carbon_sales SET status = ? WHERE reference = ?').run('retired', reference);
  const latest = getDb().carbon!;
  save(
    { ...latest, sales: (latest.sales ?? []).map((s) => (s.reference === reference ? { ...s, status: 'retired' } : s)), retirements: [retirement, ...latest.retirements] },
    { title: 'Credits retired', detail: `${retirement.tco2e} credits · certificate issued`, amount: totalAmount },
  );
  if (pool?.status === 'pending') checkPoolLater(pool.reference);
  return { status: 'retired', retirement };
}

/* ---------------- Registry → pool payout ---------------- */

function findByPool(reference: string) {
  return getDb().carbon?.retirements.find((r) => r.poolPayout?.reference === reference);
}

/** transfer.* webhook for the registry's payout to the pool. Returns true if it was ours. */
export function applyPoolTransfer(reference: string, status: string, data: Record<string, any>): boolean {
  const r = findByPool(reference);
  if (!r?.poolPayout) return false;
  const s: PoolPayout['status'] = status === 'successful' ? 'successful' : status === 'failed' || status === 'reversed' ? 'failed' : 'pending';
  if (r.poolPayout.status === s) return true;
  const amount = Number(data?.amount) || r.poolPayout.amount;
  const poolPayout: PoolPayout = { ...r.poolPayout, status: s, amount, accountName: data?.account_name ?? data?.destination_account_name ?? r.poolPayout.accountName, at: now() };
  const c = getDb().carbon!;
  save(
    { ...c, retirements: c.retirements.map((x) => (x.certificateId === r.certificateId ? { ...x, poolPayout, distributorShare: Math.round(amount * DISTRIBUTOR_SHARE) } : x)) },
    s === 'successful' ? { title: 'Registry paid the pool', detail: `${POOL_NAME} · after 2% registry fee`, amount } : undefined,
  );
  return true;
}

/** If no webhook arrives, ask the bank once a minute for a few minutes. */
function checkPoolLater(reference: string, n = 0) {
  if (n > 5) return;
  setTimeout(async () => {
    const r = findByPool(reference);
    if (!r?.poolPayout || r.poolPayout.status !== 'pending') return;
    try {
      const t = await registry().getTransfer(reference);
      if (t.status !== 'pending') return void applyPoolTransfer(reference, t.status, {});
    } catch (e) {
      if (!(e instanceof BankError) || e.httpStatus !== 404) console.warn(`[carbon] pool payout ${reference}: ${(e as Error).message}`);
    }
    checkPoolLater(reference, n + 1);
  }, 60_000);
}

/* ---------------- Certificate ---------------- */

export async function certificate(id: string): Promise<CarbonCertificate> {
  const c = getDb().carbon;
  const local = c?.retirements.find((r) => r.certificateId === id);
  const base = { projectName: PROJECT_NAME, poolName: POOL_NAME, methodology: METHODOLOGY, registry: 'Forge Carbon Registry (sandbox)' };
  try {
    const r = await registry().getCertificate(id);
    return {
      ...base,
      id: r.id,
      projectId: r.projectId ?? c?.projectId ?? '',
      tco2e: r.quantity || local?.tco2e || 0,
      serialRange: r.serialRange ?? local?.serialRange,
      buyer: r.buyer ?? local?.buyer,
      reason: r.reason ?? local?.reason,
      retiredAt: r.retiredAt ?? local?.retiredAt,
      pdfUrl: r.pdfUrl,
      source: 'registry',
    };
  } catch (e) {
    if (!local) throw e;
    console.warn(`[carbon] certificate ${id} from local record: ${(e as Error).message}`);
    return { ...base, id, projectId: c!.projectId, tco2e: local.tco2e, serialRange: local.serialRange, buyer: local.buyer, reason: local.reason, retiredAt: local.retiredAt, source: 'local' };
  }
}

/* ---------------- Distributor share (60% of the pool payout) ---------------- */

function shareTarget(certificateId: string): TransferTarget | null {
  const r = getDb().carbon?.retirements.find((x) => x.certificateId === certificateId);
  if (!r) return null;
  return {
    key: `carbon:${certificateId}`,
    refBase: `C${certificateId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`,
    account: DISTRIBUTOR_ACCOUNT,
    amount: r.distributorShare,
    narration: `SecondShelf carbon share ${certificateId}`,
    record: (payout: Payout) => {
      const c = getDb().carbon!;
      const was = c.retirements.find((x) => x.certificateId === certificateId)?.payout?.status;
      const note = payout.status === 'successful' && was !== 'successful' ? { title: 'Carbon share paid', detail: `60% to Ade Foods · ${payout.accountName}`, amount: payout.amount } : undefined;
      save({ ...c, retirements: c.retirements.map((x) => (x.certificateId === certificateId ? { ...x, payout } : x)) }, note);
    },
  };
}

registerResolver((key) => (key.startsWith('carbon:') ? shareTarget(key.slice(7)) : null));

function paidPool(certificateId: string) {
  const r = getDb().carbon?.retirements.find((x) => x.certificateId === certificateId);
  if (!r) throw new ApiError('Certificate not found.');
  if (r.poolPayout && r.poolPayout.status !== 'successful') throw new ApiError('Waiting for the registry to pay the pool.');
  return shareTarget(certificateId)!;
}

export const enquireShare = (certificateId: string) => enquire(paidPool(certificateId));

export function sendShare(certificateId: string) {
  const t = paidPool(certificateId);
  return send(t, getDb().carbon?.retirements.find((x) => x.certificateId === certificateId)?.payout);
}

/* ---------------- Webhooks ---------------- */

export async function onCarbonEvent(type: string, data: Record<string, any>) {
  const mrvId: string | undefined = data?.submission_id ?? data?.mrv_id ?? (type.startsWith('carbon.mrv') ? data?.id : undefined);
  if ((type === 'carbon.mrv.verified' || type === 'carbon.mrv.rejected') && mrvId) {
    const verified = type === 'carbon.mrv.verified';
    updateSubmission(
      mrvId,
      verified
        ? { status: 'verified', verifiedTco2e: num(data?.verified_tco2e), creditsIssued: num(data?.credits_issued), creditBatchId: data?.credit_batch_id, serialRange: data?.serial_range }
        : { status: 'rejected', reviewNote: data?.reason ?? data?.notes },
    );
    // Fill anything the event didn't carry.
    if (verified) await refreshMrv(mrvId).catch(() => undefined);
  }
}

const num = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : Number(v));

export { BankError };
