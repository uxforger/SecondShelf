/**
 * Every number the v2 screens show comes from here, computed from the one
 * shared Db. Screens never add things up themselves, so a figure can't
 * disagree with itself on two screens.
 */
import type { Batch, CarbonRetirement, CarbonSubmission, Db, Order, Product } from '../lib/api';
import { daysLeft, today } from '../lib/dates';
import { URGENT_DAYS, ALERT_DAYS, timeLeftLabel } from '../lib/expiry';
import { clock, naira, shortDate } from '../lib/format';
import { business, metrics, product as productOf } from '../lib/selectors';
import type { JourneyStep } from './kit/journey';

export const SELLER = 'biz-ade';
export const BUYER = 'biz-tolu';

const isThisMonth = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
};

/** "Today 14:05", "8 Dec". */
export function when(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString() ? `Today ${clock(iso)}` : shortDate(iso);
}

/* ------------------------------------------------------------------ */
/* Batches                                                              */
/* ------------------------------------------------------------------ */

export type StageKey = 'scanned' | 'listed' | 'sold' | 'paid' | 'handed' | 'paidout' | 'carbon';

export type NextAction =
  | { kind: 'list'; label: string }
  | { kind: 'reprice'; label: string }
  | { kind: 'handover'; label: string; order: Order }
  | { kind: 'payout'; label: string; order: Order }
  | { kind: 'carbon'; label: string }
  | { kind: 'certificate'; label: string; certificateId: string }
  | { kind: 'none'; label: string };

export interface BatchInfo {
  batch: Batch;
  product: Product;
  days: number;
  /** Naira at full price for what's still in stock. */
  value: number;
  orders: Order[];
  latest?: Order;
  stage: StageKey;
  /** Words for the current stage: "Listed", "Paid", "Expired"... */
  status: string;
  next: NextAction;
  expired: boolean;
}

function ordersOf(db: Db, batchId: string) {
  return db.orders.filter((o) => o.batchId === batchId).sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

function submissionFor(db: Db, itemId: string): CarbonSubmission | undefined {
  return db.carbon?.submissions.find((s) => s.status !== 'rejected' && s.itemIds.includes(itemId));
}
function retirementFor(db: Db, s?: CarbonSubmission): CarbonRetirement | undefined {
  return s ? db.carbon?.retirements.find((r) => r.mrvId === s.mrvId) : undefined;
}

export function batchInfo(db: Db, batch: Batch): BatchInfo | null {
  const product = productOf(db, batch.productId);
  if (!product) return null;
  const days = daysLeft(batch.expiry, today());
  const orders = ordersOf(db, batch.id);
  const latest = orders[0];
  const expired = days <= 0 && batch.quantity > 0 && !latest;
  const value = batch.quantity * product.price;

  let stage: StageKey = 'scanned';
  let status = 'In stock';
  let next: NextAction = { kind: 'none', label: 'Back to stock' };

  if (latest) {
    const sub = submissionFor(db, `order:${latest.id}`);
    const ret = retirementFor(db, sub);
    if (latest.status === 'paid') {
      stage = 'handed';
      status = 'Paid · ready';
      next = { kind: 'handover', label: 'Confirm handover', order: latest };
    } else if (latest.payout?.status !== 'successful') {
      stage = 'paidout';
      status = latest.payout && latest.payout.status !== 'failed' ? 'Paying out' : 'Handed over';
      next = { kind: 'payout', label: `Pay out ${naira(latest.total)}`, order: latest };
    } else if (!batch.baselineDestroyed) {
      stage = 'carbon';
      status = 'Paid out';
      next = { kind: 'none', label: 'Back to stock' };
    } else if (ret) {
      stage = 'carbon';
      status = 'Carbon retired';
      next = { kind: 'certificate', label: 'See certificate', certificateId: ret.certificateId };
    } else {
      stage = 'carbon';
      status = sub ? (sub.status === 'verified' ? 'Carbon verified' : 'Carbon reported') : 'Paid out';
      next = { kind: 'carbon', label: sub ? 'Open carbon' : 'Report carbon' };
    }
    // Stock left on a listed batch: the next sale is the priority only once this one is closed.
    if (batch.quantity > 0 && batch.listing && next.kind === 'none') next = { kind: 'reprice', label: 'Change price' };
  } else if (expired) {
    status = 'Expired';
  } else if (batch.listing) {
    stage = 'sold';
    status = 'Listed';
    next = { kind: 'reprice', label: 'Change price' };
  } else if (batch.donation) {
    status = batch.donation.status === 'collected' ? 'Donated' : 'Offered to food bank';
  } else if (batch.quantity > 0) {
    stage = 'listed';
    status = days <= ALERT_DAYS ? 'Not listed' : 'In stock';
    next = { kind: 'list', label: 'List it' };
  }
  return { batch, product, days, value, orders, latest, stage, status, next, expired };
}

export function allBatches(db: Db): BatchInfo[] {
  return db.batches
    .filter((b) => b.sellerId === SELLER)
    .map((b) => batchInfo(db, b))
    .filter((x): x is BatchInfo => !!x);
}

const ORDER: StageKey[] = ['scanned', 'listed', 'sold', 'paid', 'handed', 'paidout', 'carbon'];

/** The journey for one batch, built from the latest order. */
export function journeyOf(db: Db, info: BatchInfo): JourneyStep[] {
  const { batch, latest, product } = info;
  const sub = latest ? submissionFor(db, `order:${latest.id}`) : undefined;
  const ret = retirementFor(db, sub);
  const doneUpTo = (() => {
    if (!latest) return batch.listing ? 1 : 0;
    if (latest.status === 'paid') return 3;
    if (latest.payout?.status !== 'successful') return 4;
    if (ret || sub?.status === 'verified') return 6;
    return 5;
  })();
  const stateOf = (i: number): JourneyStep['state'] => (i <= doneUpTo ? 'done' : i === doneUpTo + 1 ? 'current' : 'todo');
  const buyer = latest ? business(db, latest.buyerId)?.name : undefined;
  const kg = latest ? latest.qty * product.netKg : 0;

  const steps: JourneyStep[] = [
    { key: 'scanned', label: 'Scanned', state: 'done', time: when(batch.addedAt), detail: `${batch.batchNo || 'No batch no.'} · use by ${shortDate(batch.expiry)}` },
    {
      key: 'listed',
      label: 'Listed',
      state: stateOf(1),
      time: when(batch.listing?.listedAt),
      value: batch.listing ? `${batch.listing.discountPct}% off` : undefined,
      detail: batch.listing ? `${naira(batch.listing.unitPrice)} a carton` : 'Set a price buyers see now',
    },
    { key: 'sold', label: 'Sold', state: stateOf(2), time: when(latest?.paidAt), detail: latest ? `${buyer} · ${latest.qty} cartons` : 'A buyer near you orders' },
    {
      key: 'paid',
      label: 'Paid',
      state: stateOf(3),
      value: latest ? naira(latest.total) : undefined,
      money: true,
      detail: latest ? <span className="mono">{latest.ref} · bank verified</span> : 'The bank confirms the payment',
    },
    { key: 'handed', label: 'Handed over', state: stateOf(4), time: when(latest?.handedOverAt), detail: latest?.handedOverAt ? 'QR code confirmed' : "Scan the buyer's code" },
    {
      key: 'paidout',
      label: 'Paid out',
      state: stateOf(5),
      time: when(latest?.payout?.status === 'successful' ? latest.payout.at : undefined),
      value: latest?.payout?.status === 'successful' ? naira(latest.payout.amount) : undefined,
      money: true,
      detail: latest?.payout ? <span className="mono">{latest.payout.reference}</span> : 'To your bank account',
    },
    {
      key: 'carbon',
      label: 'Carbon',
      state: !batch.baselineDestroyed ? (doneUpTo >= 5 ? 'done' : 'todo') : stateOf(6),
      value: latest && batch.baselineDestroyed && doneUpTo >= 4 ? `${(kg).toLocaleString('en-US', { maximumFractionDigits: 1 })} kg food` : undefined,
      detail: !batch.baselineDestroyed
        ? 'Not counted: no past destruction record'
        : ret
          ? `Retired · ${ret.serialRange ?? ret.certificateId}`
          : sub
            ? sub.status === 'verified'
              ? 'Verified by the registry'
              : 'Reported to the registry'
            : 'Report to the carbon registry',
    },
  ];

  if (info.expired) {
    return [steps[0], { key: 'expired', label: 'Expired', state: 'current', time: shortDate(batch.expiry), detail: `${batch.quantity} cartons not sold` }];
  }
  if (batch.donation) {
    return [
      steps[0],
      { key: 'offered', label: 'Offered to food bank', state: 'done', time: when(batch.donation.offeredAt), detail: `${batch.donation.qty} cartons` },
      {
        key: 'collected',
        label: 'Collected',
        state: batch.donation.status === 'collected' ? 'done' : 'current',
        time: when(batch.donation.collectedAt),
        detail: business(db, batch.donation.foodBankId)?.name,
      },
    ];
  }
  void ORDER;
  return steps;
}

/* ------------------------------------------------------------------ */
/* Distributor dashboard                                                */
/* ------------------------------------------------------------------ */

/** The one most urgent thing to sell now: unlisted, inside the window, soonest first. */
export function nextAction(db: Db): BatchInfo | undefined {
  return allBatches(db)
    .filter((b) => b.next.kind === 'list' && b.days > 0 && b.days <= ALERT_DAYS)
    .sort((a, b) => a.days - b.days || b.value - a.value)[0];
}

/** Batches with a step to take, most pressing first. Max 5. */
export function needsAction(db: Db): BatchInfo[] {
  const rank = (b: BatchInfo) => (b.next.kind === 'handover' ? 0 : b.next.kind === 'payout' ? 1 : b.next.kind === 'list' ? 2 : 3);
  return allBatches(db)
    .filter((b) => b.next.kind === 'handover' || b.next.kind === 'payout' || (b.next.kind === 'list' && b.days > 0 && b.days <= ALERT_DAYS))
    .sort((a, b) => rank(a) - rank(b) || a.days - b.days)
    .slice(0, 5);
}

export interface Kpis {
  recoveredThisMonth: number;
  soldBeforeExpiryPct: number;
  carbonAvoidedT: number;
  verifiedSales90: number;
  foodRescuedKg: number;
}

export function kpis(db: Db): Kpis {
  const m = metrics(db, SELLER);
  const recoveredThisMonth = db.orders.filter((o) => o.sellerId === SELLER && isThisMonth(o.paidAt)).reduce((n, o) => n + o.total, 0);
  return { recoveredThisMonth, soldBeforeExpiryPct: m.soldBeforeExpiryPct, carbonAvoidedT: m.co2eVerified, verifiedSales90: m.verifiedSales90, foodRescuedKg: m.foodRescuedKg };
}

/* ------------------------------------------------------------------ */
/* Bank ledger                                                          */
/* ------------------------------------------------------------------ */

export interface LedgerEvent {
  id: string;
  at: string;
  kind: 'in' | 'out' | 'loan' | 'consent' | 'carbon';
  title: string;
  reference?: string;
  amount?: number;
  /** Where tapping goes. */
  to: string;
}

export function ledger(db: Db): LedgerEvent[] {
  const ev: LedgerEvent[] = [];
  for (const o of db.orders) {
    if (o.sellerId !== SELLER) continue;
    const b = business(db, o.buyerId)?.name ?? 'Buyer';
    ev.push({ id: `pay-${o.id}`, at: o.paidAt, kind: 'in', title: `${b} paid`, reference: o.ref, amount: o.total, to: `/batch/${o.batchId}` });
    if (o.payout?.status === 'successful') ev.push({ id: `po-${o.id}`, at: o.payout.at, kind: 'out', title: 'Paid out to you', reference: o.payout.reference, amount: o.payout.amount, to: `/batch/${o.batchId}` });
  }
  const l = db.loan;
  if (l?.disbursedAt) ev.push({ id: `loan-${l.id}`, at: l.disbursedAt, kind: 'loan', title: 'Stock loan received', reference: l.id, amount: l.netDisbursement ?? l.principal, to: '/passport' });
  const s = db.passportStatement;
  if (s && !s.revokedAt) ev.push({ id: `consent-${s.consentId}`, at: s.at, kind: 'consent', title: 'Statement shared with bank', reference: s.consentId, to: '/passport' });
  for (const r of db.carbon?.retirements ?? []) {
    if (r.payout?.status === 'successful') ev.push({ id: `cs-${r.certificateId}`, at: r.payout.at, kind: 'carbon', title: 'Carbon share paid', reference: r.payout.reference, amount: r.payout.amount, to: '/carbon' });
  }
  return ev.sort((a, b) => b.at.localeCompare(a.at));
}

/* ------------------------------------------------------------------ */
/* Passport and carbon                                                  */
/* ------------------------------------------------------------------ */

export function passport(db: Db) {
  const k = kpis(db);
  const shared = !!db.passportStatement && !db.passportStatement.revokedAt;
  return { shared, statement: db.passportStatement, verifiedSales90: k.verifiedSales90, score: db.loan?.creditScore, loan: db.loan };
}

export type CarbonStage = 'calculated' | 'submitted' | 'verified' | 'retired' | 'paid';

/** Registry state only. Nothing reads "verified" unless the registry said so. */
export function carbonJourney(db: Db) {
  const c = db.carbon;
  const sub = c?.submissions.find((s) => s.status !== 'rejected');
  const ret = sub ? c?.retirements.find((r) => r.mrvId === sub.mrvId) : undefined;
  const paid = ret?.payout?.status === 'successful';
  const done: Record<CarbonStage, boolean> = {
    calculated: true,
    submitted: !!sub,
    verified: sub?.status === 'verified',
    retired: !!ret,
    paid,
  };
  const keys: CarbonStage[] = ['calculated', 'submitted', 'verified', 'retired', 'paid'];
  const firstOpen = keys.findIndex((k) => !done[k]);
  const state = (k: CarbonStage, i: number) => (done[k] ? 'done' : i === firstOpen ? 'current' : 'todo') as 'done' | 'current' | 'todo';
  const values: Record<CarbonStage, string | undefined> = {
    calculated: undefined,
    submitted: sub ? `${sub.kwh.toLocaleString('en-US')} kWh` : undefined,
    verified: sub?.status === 'verified' ? `${Math.floor(sub.creditsIssued ?? 0)} credits` : undefined,
    retired: ret ? `${ret.tco2e} retired` : undefined,
    paid: paid ? naira(ret!.payout!.amount) : undefined,
  };
  const labels: Record<CarbonStage, string> = { calculated: 'Calculated', submitted: 'Submitted', verified: 'Verified', retired: 'Retired', paid: 'Paid' };
  return { sub, ret, paid, steps: keys.map((k, i) => ({ key: k, label: labels[k], state: state(k, i), value: values[k] })) };
}

/* ------------------------------------------------------------------ */
/* Buyer                                                                */
/* ------------------------------------------------------------------ */

export function buyerNumbers(db: Db) {
  const mine = db.orders.filter((o) => o.buyerId === BUYER);
  const month = mine.filter((o) => isThisMonth(o.paidAt));
  const saved = month.reduce((n, o) => {
    const p = productOf(db, o.productId);
    return n + (p ? Math.max(0, (p.price - o.unitPrice) * o.qty) : 0);
  }, 0);
  const spent = month.reduce((n, o) => n + o.total, 0);
  return { saved, spent, orders: mine.sort((a, b) => b.paidAt.localeCompare(a.paidAt)) };
}

export function expiryWords(days: number): string {
  if (days <= 0) return 'Expired';
  return `${timeLeftLabel(days)} left`;
}

export const urgentDays = URGENT_DAYS;
