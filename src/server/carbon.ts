import { createHash, randomUUID } from 'node:crypto';
import { ApiError, type CarbonCertificate, type CarbonState, type CarbonSubmission, type MrvStatus, type Payout } from '../lib/api/types.ts';
import { avoidedCo2e, DRY_SHARE, transportFor } from '../lib/carbon.ts';
import { shortDate } from '../lib/format.ts';
import { FOOD_BANK } from '../lib/mock/catalogue.ts';
import { bank, BankError, DISTRIBUTOR_ACCOUNT } from './bank/index.ts';
import { kvGet, kvSet, now } from './db.ts';
import { apply, getDb } from './state.ts';
import { enquire, registerResolver, send, type TransferTarget } from './transfers.ts';

/**
 * Forge Carbon Registry (sandbox): one grouped SecondShelf project, MRV
 * reports built from rescued batches with our VM0046 calculation, review,
 * retirement and certificate. The distributor gets 60% of the credit value.
 */

export const PROJECT_NAME = 'SecondShelf Lagos food rescue';
const METHODOLOGY = 'VM0046';
/** Naira per tCO2e used when the registry doesn't price the retirement. */
const PRICE_NGN = Number(process.env.CARBON_PRICE_NGN || 25_000);
export const DISTRIBUTOR_SHARE = 0.6;
const SELLER = 'biz-ade';

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

const t3 = (n: number) => Math.round(n * 1000) / 1000;

/* ---------------- Project ---------------- */

export async function ensureProject(): Promise<CarbonState> {
  const existing = getDb().carbon;
  if (existing?.projectId) return existing;
  const p = await bank.createCarbonProject({
    name: PROJECT_NAME,
    methodology: METHODOLOGY,
    location: 'Lagos, Nigeria',
    description: 'Packaged food sold or donated before expiry instead of being destroyed. Grouped across SecondShelf distributors.',
    idempotencyKey: keyFor('carbon_project_idem'),
  });
  const carbon: CarbonState = { projectId: p.id, projectName: PROJECT_NAME, methodology: METHODOLOGY, createdAt: now(), submissions: [], retirements: [] };
  save(carbon, { title: 'Carbon project registered', detail: `${PROJECT_NAME} · ${METHODOLOGY}` });
  return carbon;
}

/* ---------------- What can be reported ---------------- */

export interface EligibleItem {
  id: string;
  kind: 'sale' | 'donation';
  netWeightKg: number;
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
    out.push({ id, kind: 'sale', netWeightKg: kg, tco2e: avoidedCo2e({ netWeightKg: kg, dryShare: DRY_SHARE[p.type], transportT: transportFor(o.distanceKm) }), reference: o.ref, at: o.handedOverAt ?? o.paidAt });
  }
  for (const b of db.batches) {
    const d = b.donation;
    const p = product.get(b.productId);
    const id = `donation:${b.id}`;
    if (b.sellerId !== SELLER || d?.status !== 'collected' || !b.baselineDestroyed || !p || covered.has(id)) continue;
    const kg = d.qty * p.netKg;
    out.push({ id, kind: 'donation', netWeightKg: kg, tco2e: avoidedCo2e({ netWeightKg: kg, dryShare: DRY_SHARE[p.type], transportT: transportFor(FOOD_BANK.distanceKm) }), reference: `DON-${b.batchNo}`, at: d.collectedAt ?? d.offeredAt });
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

export function preview() {
  const items = eligible();
  return {
    items: items.length,
    handovers: items.filter((i) => i.kind === 'sale').length,
    collections: items.filter((i) => i.kind === 'donation').length,
    foodKg: Math.round(items.reduce((n, i) => n + i.netWeightKg, 0)),
    tco2e: t3(items.reduce((n, i) => n + i.tco2e, 0)),
  };
}

/* ---------------- MRV ---------------- */

function mrvStatus(s: string): MrvStatus {
  const v = s.toLowerCase();
  if (['verified', 'approved', 'issued'].includes(v)) return 'verified';
  if (['rejected', 'declined'].includes(v)) return 'rejected';
  if (v === 'submitted') return 'submitted';
  return 'under_review';
}

export async function submitMrv(): Promise<CarbonSubmission> {
  const carbon = await ensureProject();
  const items = eligible();
  if (!items.length) throw new ApiError('Nothing new to report yet.');
  const tco2e = t3(items.reduce((n, i) => n + i.tco2e, 0));
  const foodKg = Math.round(items.reduce((n, i) => n + i.netWeightKg, 0));
  const handovers = items.filter((i) => i.kind === 'sale').length;
  const collections = items.length - handovers;
  const periodStart = items[0].at.slice(0, 10);
  const periodEnd = items[items.length - 1].at.slice(0, 10);
  const evidence =
    `${handovers} buyer handovers (QR-confirmed, bank-verified payments) and ${collections} food bank collections in Lagos, ` +
    `${foodKg} kg packaged food sold or donated before expiry from lines with past destruction records. ` +
    `VM0046: net tonnes × dry share × 2.285 × (1 − 0.12) − van transport = ${tco2e} tCO2e.`;
  // Same items → same key, so a retry after a timeout replays instead of double-reporting.
  const idem = keyFor(`mrv_idem_${createHash('sha256').update(items.map((i) => i.id).join(',')).digest('hex').slice(0, 24)}`);

  const r = await bank.submitMrv({ projectId: carbon.projectId, periodStart, periodEnd, tco2e, evidenceSummary: evidence, items, idempotencyKey: idem });
  const sub: CarbonSubmission = {
    mrvId: r.id,
    status: mrvStatus(r.status),
    tco2e,
    creditsIssued: r.creditsIssued,
    itemIds: items.map((i) => i.id),
    handovers,
    collections,
    foodKg,
    periodStart,
    periodEnd,
    evidence,
    submittedAt: now(),
  };
  const latest = getDb().carbon ?? carbon;
  save({ ...latest, submissions: [sub, ...latest.submissions.filter((s) => s.mrvId !== sub.mrvId)] }, { title: 'MRV submitted', detail: `${tco2e.toFixed(2)} tCO₂e · ${items.length} rescued batches` });
  return sub;
}

function updateSubmission(mrvId: string, patch: Partial<CarbonSubmission>, note?: { title: string; detail?: string }) {
  const c = getDb().carbon;
  if (!c) return;
  const before = c.submissions.find((s) => s.mrvId === mrvId);
  if (!before) return;
  const next = { ...before, ...patch };
  const announce = note && before.status !== next.status;
  save({ ...c, submissions: c.submissions.map((s) => (s.mrvId === mrvId ? next : s)) }, announce ? note : undefined);
}

function verifiedNote(tco2e: number) {
  return { title: 'MRV verified', detail: `${tco2e.toFixed(2)} tCO₂e credits issued` };
}

export async function refreshMrv(mrvId: string) {
  const r = await bank.getMrv(mrvId);
  const status = mrvStatus(r.status);
  const sub = getDb().carbon?.submissions.find((s) => s.mrvId === mrvId);
  updateSubmission(
    mrvId,
    { status, creditsIssued: r.creditsIssued ?? (status === 'verified' ? sub?.tco2e : undefined), reviewNote: r.note, ...(status === 'verified' && !sub?.verifiedAt ? { verifiedAt: now() } : {}) },
    status === 'verified' ? verifiedNote(r.creditsIssued ?? sub?.tco2e ?? 0) : status === 'rejected' ? { title: 'MRV rejected', detail: r.note } : undefined,
  );
  return getDb().carbon?.submissions.find((s) => s.mrvId === mrvId);
}

/** Sandbox only: we act as the independent verifier. Labelled as such in the UI. */
export async function approveMrv(mrvId: string) {
  const r = await bank.reviewMrv(mrvId, true, keyFor(`mrv_review_${mrvId}`));
  const status = mrvStatus(r.status);
  if (status === 'verified') {
    const sub = getDb().carbon?.submissions.find((s) => s.mrvId === mrvId);
    updateSubmission(mrvId, { status, creditsIssued: r.creditsIssued ?? sub?.tco2e, verifiedAt: now(), reviewNote: r.note }, verifiedNote(r.creditsIssued ?? sub?.tco2e ?? 0));
  }
  return refreshMrv(mrvId).catch(() => getDb().carbon?.submissions.find((s) => s.mrvId === mrvId));
}

/* ---------------- Retire + certificate ---------------- */

export async function retire(mrvId: string) {
  const c = getDb().carbon;
  const sub = c?.submissions.find((s) => s.mrvId === mrvId);
  if (!c || !sub) throw new ApiError('Report not found.');
  if (sub.status !== 'verified') throw new ApiError('Wait for verification first.');
  const done = c.retirements.find((r) => r.mrvId === mrvId);
  if (done) return done;

  const quantity = t3(sub.creditsIssued ?? sub.tco2e);
  const beneficiary = 'Ade Foods, Mushin';
  const reason = `Food rescued before expiry, ${shortDate(sub.periodStart)} to ${shortDate(sub.periodEnd)} ${sub.periodEnd.slice(0, 4)}`;
  const r = await bank.retireCredits({ projectId: c.projectId, mrvId, quantity, beneficiary, reason, idempotencyKey: keyFor(`retire_${mrvId}`) });
  const valueNaira = Math.round(r.valueNaira ?? quantity * PRICE_NGN);
  const retirement = {
    certificateId: r.certificateId,
    mrvId,
    tco2e: r.quantity || quantity,
    serial: r.serial,
    beneficiary,
    reason,
    retiredAt: now(),
    valueNaira,
    distributorShare: Math.round(valueNaira * DISTRIBUTOR_SHARE),
  };
  const latest = getDb().carbon!;
  save({ ...latest, retirements: [retirement, ...latest.retirements] }, { title: 'Credits retired', detail: `${retirement.tco2e.toFixed(2)} tCO₂e · certificate issued`, amount: valueNaira });
  return retirement;
}

export async function certificate(id: string): Promise<CarbonCertificate> {
  const c = getDb().carbon;
  const local = c?.retirements.find((r) => r.certificateId === id);
  try {
    const r = await bank.getCertificate(id);
    return {
      id: r.id,
      projectId: r.projectId ?? c?.projectId ?? '',
      projectName: r.projectName ?? c?.projectName ?? PROJECT_NAME,
      tco2e: r.quantity || local?.tco2e || 0,
      serial: r.serial ?? local?.serial,
      beneficiary: r.beneficiary ?? local?.beneficiary,
      reason: r.reason ?? local?.reason,
      retiredAt: r.retiredAt ?? local?.retiredAt,
      registry: 'Forge Carbon Registry (sandbox)',
      methodology: METHODOLOGY,
      source: 'registry',
    };
  } catch (e) {
    if (!local) throw e;
    console.warn(`[carbon] certificate ${id} from local record: ${(e as Error).message}`);
    return { id, projectId: c!.projectId, projectName: c!.projectName, tco2e: local.tco2e, serial: local.serial, beneficiary: local.beneficiary, reason: local.reason, retiredAt: local.retiredAt, registry: 'Forge Carbon Registry (sandbox)', methodology: METHODOLOGY, source: 'local' };
  }
}

/* ---------------- Distributor share (60%) ---------------- */

function shareTarget(certificateId: string): TransferTarget | null {
  const r = getDb().carbon?.retirements.find((x) => x.certificateId === certificateId);
  if (!r) return null;
  return {
    key: `carbon:${certificateId}`,
    refBase: `C${certificateId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`,
    account: DISTRIBUTOR_ACCOUNT,
    amount: r.distributorShare,
    narration: `SecondShelf carbon share ${r.serial ?? certificateId}`,
    record: (payout: Payout) => {
      const c = getDb().carbon!;
      const was = c.retirements.find((x) => x.certificateId === certificateId)?.payout?.status;
      const note = payout.status === 'successful' && was !== 'successful' ? { title: 'Carbon share paid out', detail: `60% to ${payout.accountName}`, amount: payout.amount } : undefined;
      save({ ...c, retirements: c.retirements.map((x) => (x.certificateId === certificateId ? { ...x, payout } : x)) }, note);
    },
  };
}

registerResolver((key) => (key.startsWith('carbon:') ? shareTarget(key.slice(7)) : null));

export function enquireShare(certificateId: string) {
  const t = shareTarget(certificateId);
  if (!t) throw new ApiError('Certificate not found.');
  return enquire(t);
}

export function sendShare(certificateId: string) {
  const t = shareTarget(certificateId);
  if (!t) throw new ApiError('Certificate not found.');
  return send(t, getDb().carbon?.retirements.find((x) => x.certificateId === certificateId)?.payout);
}

/* ---------------- Webhooks ---------------- */

export async function onCarbonEvent(type: string, data: Record<string, any>) {
  const mrvId: string | undefined = data?.mrv_id ?? data?.mrv?.id ?? (type.startsWith('carbon.mrv') ? data?.id : undefined);
  if ((type === 'carbon.mrv.verified' || type === 'carbon.mrv.rejected') && mrvId) {
    const verified = type === 'carbon.mrv.verified';
    const sub = getDb().carbon?.submissions.find((s) => s.mrvId === mrvId);
    const credits = Number(data?.credits_issued ?? data?.issued_credits ?? data?.verified_tco2e ?? sub?.tco2e ?? 0) || undefined;
    updateSubmission(
      mrvId,
      verified ? { status: 'verified', creditsIssued: credits, verifiedAt: sub?.verifiedAt ?? now() } : { status: 'rejected', reviewNote: data?.reason ?? data?.notes },
      verified ? verifiedNote(credits ?? 0) : { title: 'MRV rejected', detail: data?.reason },
    );
  }
}

export { BankError };
