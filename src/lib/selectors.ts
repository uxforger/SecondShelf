import type { Batch, Business, Db, Order, Product } from './api/types.ts';
import { avoidedCo2e, DRY_SHARE, transportFor } from './carbon.ts';
import { daysLeft } from './dates.ts';
import { urgencyFor, type Urgency } from './expiry.ts';

export interface BatchView {
  batch: Batch;
  product: Product;
  days: number;
  urgency: Urgency;
}

export function product(db: Db, id: string): Product | undefined {
  return db.products.find((p) => p.id === id);
}

export function business(db: Db, id: string): Business | undefined {
  return db.businesses.find((b) => b.id === id);
}

export function viewOf(db: Db, batch: Batch, ref: string): BatchView | null {
  const p = product(db, batch.productId);
  if (!p) return null;
  const days = daysLeft(batch.expiry, ref);
  return { batch, product: p, days, urgency: urgencyFor(days) };
}

export interface StockGroups {
  soon: BatchView[];
  listed: BatchView[];
  donating: BatchView[];
  healthy: BatchView[];
  expired: BatchView[];
}

/** The distributor's stock, grouped by what needs attention first. */
export function stockGroups(db: Db, sellerId: string, ref: string): StockGroups {
  const groups: StockGroups = { soon: [], listed: [], donating: [], healthy: [], expired: [] };
  for (const b of db.batches) {
    if (b.sellerId !== sellerId || b.quantity <= 0) continue;
    if (b.donation?.status === 'collected') continue;
    const v = viewOf(db, b, ref);
    if (!v) continue;
    if (v.urgency === 'expired') groups.expired.push(v);
    else if (b.donation?.status === 'offered') groups.donating.push(v);
    else if (b.listing) groups.listed.push(v);
    else if (v.urgency === 'healthy') groups.healthy.push(v);
    else groups.soon.push(v);
  }
  const byDays = (a: BatchView, b: BatchView) => a.days - b.days;
  groups.soon.sort(byDays);
  groups.listed.sort(byDays);
  groups.donating.sort(byDays);
  groups.healthy.sort(byDays);
  return groups;
}

/** What a buyer can see in the shop. Never anything expired. */
export function offers(db: Db, ref: string): BatchView[] {
  return db.batches
    .filter((b) => b.listing && b.quantity > 0 && b.donation?.status !== 'offered')
    .map((b) => viewOf(db, b, ref))
    .filter((v): v is BatchView => !!v && v.days > 0)
    .sort((a, b) => a.days - b.days);
}

export function donations(db: Db, ref: string): BatchView[] {
  return db.batches
    .filter((b) => b.donation)
    .map((b) => viewOf(db, b, ref))
    .filter((v): v is BatchView => !!v)
    .sort((a, b) => (b.batch.donation!.offeredAt).localeCompare(a.batch.donation!.offeredAt));
}

export function ordersFor(db: Db, businessId: string): Order[] {
  return db.orders
    .filter((o) => o.buyerId === businessId || o.sellerId === businessId)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

export interface Metrics {
  moneyRecovered: number;
  moneyPending: number;
  co2eVerified: number;
  co2ePending: number;
  soldBeforeExpiryPct: number;
  sellThroughPct: number;
  repeatBuyers: number;
  buyers: number;
  ordersFulfilled: number;
  verifiedSales90: number;
  foodRescuedKg: number;
}

const DAY = 86_400_000;

export function metrics(db: Db, sellerId: string, now = Date.now()): Metrics {
  let moneyRecovered = 0;
  let moneyPending = 0;
  let co2eVerified = 0;
  let co2ePending = 0;
  let soldUnits = 0;
  let ordersFulfilled = 0;
  let verifiedSales90 = 0;
  let foodRescuedKg = 0;
  const buyerCounts = new Map<string, number>();

  const batchById = new Map(db.batches.map((b) => [b.id, b]));

  for (const o of db.orders) {
    if (o.sellerId !== sellerId) continue;
    const p = product(db, o.productId);
    const b = batchById.get(o.batchId);
    if (!p) continue;
    const kg = o.qty * p.netKg;
    const t = b?.baselineDestroyed
      ? avoidedCo2e({ netWeightKg: kg, dryShare: DRY_SHARE[p.type], transportT: transportFor(o.distanceKm) })
      : 0;
    soldUnits += o.qty;
    if (o.status === 'handed_over') {
      moneyRecovered += o.total;
      co2eVerified += t;
      ordersFulfilled += 1;
      foodRescuedKg += kg;
      buyerCounts.set(o.buyerId, (buyerCounts.get(o.buyerId) ?? 0) + 1);
      if (o.handedOverAt && now - new Date(o.handedOverAt).getTime() <= 90 * DAY) verifiedSales90 += o.total;
    } else {
      moneyPending += o.total;
      co2ePending += t;
    }
  }

  let donatedUnits = 0;
  let expiredUnits = 0;
  let inStock = 0;
  for (const b of db.batches) {
    if (b.sellerId !== sellerId) continue;
    const p = product(db, b.productId);
    expiredUnits += b.expiredUnits ?? 0;
    if (b.donation?.status === 'collected' && p) {
      donatedUnits += b.donation.qty;
      foodRescuedKg += b.donation.qty * p.netKg;
      if (b.baselineDestroyed) {
        const fb = business(db, b.donation.foodBankId);
        co2eVerified += avoidedCo2e({
          netWeightKg: b.donation.qty * p.netKg,
          dryShare: DRY_SHARE[p.type],
          transportT: transportFor(fb?.distanceKm ?? 0),
        });
      }
    }
    if (b.quantity > 0) {
      if (daysLeft(b.expiry) <= 0) expiredUnits += b.quantity;
      else inStock += b.quantity;
    }
  }

  const closed = soldUnits + donatedUnits + expiredUnits;
  const received = closed + inStock;
  const repeatBuyers = [...buyerCounts.values()].filter((n) => n >= 2).length;

  return {
    moneyRecovered,
    moneyPending,
    co2eVerified,
    co2ePending,
    soldBeforeExpiryPct: closed ? (soldUnits / closed) * 100 : 0,
    sellThroughPct: received ? (soldUnits / received) * 100 : 0,
    repeatBuyers,
    buyers: buyerCounts.size,
    ordersFulfilled,
    verifiedSales90,
    foodRescuedKg,
  };
}
