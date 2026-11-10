import type { Activity, Batch, Db, Order } from '../api/types.ts';
import { addDays, toDay } from '../dates.ts';
import { discountedPrice } from '../expiry.ts';
import { BUYER, DISTRIBUTOR, FOOD_BANK, PAST_BUYERS, PRODUCTS } from './catalogue.ts';

/** ISO time `days` ago (negative = past) at a given hour, relative to `now`. */
function at(now: Date, days: number, hour = 11, minute = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const product = (id: string) => PRODUCTS.find((p) => p.id === id)!;

/**
 * Builds a fresh demo database relative to `now`, so expiry badges and
 * the 90-day window always look right on demo day.
 */
export function seed(now: Date = new Date()): Db {
  const day = toDay(now);
  const businesses = [DISTRIBUTOR, BUYER, FOOD_BANK, ...PAST_BUYERS];
  const dist = (id: string) => businesses.find((b) => b.id === id)!.distanceKm;

  const live: Batch[] = [
    { id: 'b-crackers', productId: 'p-crackers', batchNo: 'CC-2410', expiry: addDays(day, 40), quantity: 48 },
    { id: 'b-noodles', productId: 'p-noodles', batchNo: 'IN-0918', expiry: addDays(day, 12), quantity: 30 },
    { id: 'b-milk', productId: 'p-milk', batchNo: 'MP-1102', expiry: addDays(day, 75), quantity: 20 },
    {
      id: 'b-digestive',
      productId: 'p-digestive',
      batchNo: 'DB-0930',
      expiry: addDays(day, 25),
      quantity: 36,
      listing: { discountPct: 30, unitPrice: discountedPrice(7200, 30), listedAt: at(now, -2, 9, 40) },
    },
    {
      id: 'b-drink',
      productId: 'p-drink',
      batchNo: 'FD-0815',
      expiry: addDays(day, 18),
      quantity: 24,
      listing: { discountPct: 35, unitPrice: discountedPrice(8400, 35), listedAt: at(now, -1, 15, 10) },
    },
    { id: 'b-drink-old', productId: 'p-drink', batchNo: 'FD-0702', expiry: addDays(day, -3), quantity: 6 },
  ].map((b, i) => ({
    ...b,
    sellerId: DISTRIBUTOR.id,
    addedAt: at(now, -30 + i, 10),
    baselineDestroyed: true,
  }));

  // Sold-out batches from the last 90 days.
  const history: Array<{
    batch: Omit<Batch, 'sellerId' | 'addedAt' | 'quantity'>;
    discount: number;
    sales: Array<[buyerId: string, qty: number, daysAgo: number]>;
  }> = [
    {
      batch: { id: 'h-crackers', productId: 'p-crackers', batchNo: 'CC-2306', expiry: addDays(day, -10), baselineDestroyed: true },
      discount: 25,
      sales: [['biz-basira', 40, -80], ['biz-kola', 30, -62], ['biz-basira', 30, -41], [BUYER.id, 20, -20]],
    },
    {
      batch: { id: 'h-noodles', productId: 'p-noodles', batchNo: 'IN-0711', expiry: addDays(day, -2), baselineDestroyed: true },
      discount: 30,
      sales: [['biz-akoka', 30, -70], [BUYER.id, 25, -35], ['biz-chidi', 25, -12]],
    },
    {
      batch: { id: 'h-milk', productId: 'p-milk', batchNo: 'MP-0820', expiry: addDays(day, 5), baselineDestroyed: true },
      discount: 20,
      sales: [['biz-kola', 10, -55], ['biz-akoka', 15, -28], ['biz-basira', 15, -9]],
    },
    {
      batch: { id: 'h-digestive', productId: 'p-digestive', batchNo: 'DB-0802', expiry: addDays(day, 1), baselineDestroyed: true },
      discount: 25,
      sales: [['biz-chidi', 20, -48], [BUYER.id, 20, -25], ['biz-kola', 20, -4]],
    },
    {
      // No destruction record for this line yet, so it earns no carbon.
      batch: { id: 'h-drink', productId: 'p-drink', batchNo: 'FD-0611', expiry: addDays(day, -6), baselineDestroyed: false },
      discount: 30,
      sales: [['biz-basira', 25, -30], [BUYER.id, 25, -15]],
    },
  ];

  const orders: Order[] = [];
  const batches: Batch[] = [...live];
  let ref = 23101;

  for (const h of history) {
    const p = product(h.batch.productId);
    const unitPrice = discountedPrice(p.price, h.discount);
    const first = Math.min(...h.sales.map((s) => s[2]));
    batches.push({
      ...h.batch,
      sellerId: DISTRIBUTOR.id,
      addedAt: at(now, first - 6, 10),
      quantity: 0,
      listing: { discountPct: h.discount, unitPrice, listedAt: at(now, first - 3, 9) },
    });
    for (const [buyerId, qty, daysAgo] of h.sales) {
      const paidAt = at(now, daysAgo, 10 + (qty % 6), (qty * 7) % 60);
      orders.push({
        id: `o-${ref}`,
        ref: `SS-${ref++}`,
        batchId: h.batch.id,
        productId: p.id,
        sellerId: DISTRIBUTOR.id,
        buyerId,
        qty,
        unitPrice,
        deliveryFee: 0,
        total: unitPrice * qty,
        fulfilment: 'pickup',
        status: 'handed_over',
        paidAt,
        handedOverAt: at(now, daysAgo, 15, 20),
        distanceKm: dist(buyerId),
      });
    }
  }

  // A donation that was collected, and older stock that expired before SecondShelf.
  batches.push(
    {
      id: 'h-noodles-donated',
      productId: 'p-noodles',
      sellerId: DISTRIBUTOR.id,
      batchNo: 'IN-0630',
      expiry: addDays(day, -20),
      quantity: 0,
      addedAt: at(now, -60, 10),
      baselineDestroyed: true,
      donation: {
        qty: 20,
        status: 'collected',
        offeredAt: at(now, -33, 9),
        collectedAt: at(now, -32, 14),
        foodBankId: FOOD_BANK.id,
      },
    },
    {
      id: 'h-crackers-lost',
      productId: 'p-crackers',
      sellerId: DISTRIBUTOR.id,
      batchNo: 'CC-2204',
      expiry: addDays(day, -84),
      quantity: 0,
      addedAt: at(now, -120, 10),
      baselineDestroyed: true,
      expiredUnits: 12,
    },
  );

  const name = (id: string) => businesses.find((b) => b.id === id)!.name;
  const recent = [...orders].sort((a, b) => b.paidAt.localeCompare(a.paidAt)).slice(0, 6);
  const activity: Activity[] = ([
    {
      id: 'a-drink-listed',
      at: live[4].listing!.listedAt,
      kind: 'listed',
      title: 'Listed Fruit drink',
      detail: '35% off · 24 cartons',
      businessIds: [DISTRIBUTOR.id],
    },
    {
      id: 'a-dig-listed',
      at: live[3].listing!.listedAt,
      kind: 'listed',
      title: 'Listed Digestive biscuits',
      detail: '30% off · 36 cartons',
      businessIds: [DISTRIBUTOR.id],
    },
    ...recent.map<Activity>((o) => ({
      id: `a-${o.id}`,
      at: o.handedOverAt!,
      kind: 'handed_over',
      title: `${name(o.buyerId)} collected`,
      detail: `${product(o.productId).name} · ${o.qty} cartons`,
      amount: o.total,
      businessIds: [o.sellerId, o.buyerId],
    })),
  ] as Activity[]).sort((a, b) => b.at.localeCompare(a.at));

  return {
    version: 1,
    seededOn: day,
    startedAt: now.toISOString(),
    businesses,
    products: PRODUCTS,
    batches,
    orders,
    activity,
  };
}
