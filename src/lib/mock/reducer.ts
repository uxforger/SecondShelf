import { ApiError, type Activity, type BankStatement, type Batch, type Db, type Order, type Payout, type Product } from '../api/types.ts';
import { daysLeft } from '../dates.ts';
import { discountedPrice, URGENT_DAYS } from '../expiry.ts';
import { FOOD_BANK } from './catalogue.ts';

/**
 * Every change to demo data is one of these actions. The same pure reducer
 * runs in the browser (optimistic / offline) and on the sync endpoint, so
 * all devices agree.
 */
export type Action =
  | { type: 'batch/add'; at: string; today: string; batch: Batch; product?: Product }
  | { type: 'batch/list'; at: string; today: string; batchId: string; discountPct: number }
  | { type: 'batch/unlist'; at: string; batchId: string }
  | { type: 'batch/donate'; at: string; today: string; batchId: string }
  | { type: 'donation/collect'; at: string; batchId: string }
  | { type: 'order/place'; at: string; today: string; order: Order }
  | { type: 'order/handover'; at: string; ref: string }
  | { type: 'passport/share'; at: string }
  // Server-only: set from verified bank responses, never accepted from a browser.
  | { type: 'order/payout'; at: string; orderId: string; payout: Payout }
  | { type: 'passport/bank'; at: string; statement: BankStatement };

/** Actions a browser may send. Payments, payouts and bank data are server-only. */
export const CLIENT_ACTIONS: Action['type'][] = ['batch/add', 'batch/list', 'batch/unlist', 'batch/donate', 'donation/collect', 'order/handover'];

const MAX_ACTIVITY = 40;

function findBatch(db: Db, id: string): Batch {
  const b = db.batches.find((x) => x.id === id);
  if (!b) throw new ApiError('Batch not found.');
  return b;
}

function productOf(db: Db, b: Batch): Product {
  const p = db.products.find((x) => x.id === b.productId);
  if (!p) throw new ApiError('Product not found.');
  return p;
}

function nameOf(db: Db, id: string): string {
  return db.businesses.find((b) => b.id === id)?.name ?? 'Buyer';
}

function withActivity(db: Db, a: Omit<Activity, 'id'>): Activity[] {
  const id = `a-${a.kind}-${a.at}-${db.version}`;
  return [{ id, ...a }, ...db.activity].slice(0, MAX_ACTIVITY);
}

function replaceBatch(db: Db, next: Batch): Batch[] {
  return db.batches.map((b) => (b.id === next.id ? next : b));
}

export function reduce(db: Db, action: Action): Db {
  const version = db.version + 1;

  switch (action.type) {
    case 'batch/add': {
      const { batch, product } = action;
      if (daysLeft(batch.expiry, action.today) <= 0) throw new ApiError("Expired items can't be added.");
      if (!(batch.quantity > 0)) throw new ApiError('Add at least one carton.');
      if (db.batches.some((b) => b.id === batch.id)) return db;
      const products = product && !db.products.some((p) => p.id === product.id) ? [...db.products, product] : db.products;
      const p = products.find((x) => x.id === batch.productId);
      if (!p) throw new ApiError('Product not found.');
      const next: Db = { ...db, version, products, batches: [batch, ...db.batches] };
      next.activity = withActivity(db, {
        at: action.at,
        kind: 'added',
        title: `Added ${p.name}`,
        detail: `${batch.quantity} cartons · ${batch.batchNo}`,
        businessIds: [batch.sellerId],
        batchId: batch.id,
      });
      return next;
    }

    case 'batch/list': {
      const b = findBatch(db, action.batchId);
      const p = productOf(db, b);
      if (daysLeft(b.expiry, action.today) <= 0) throw new ApiError("Expired stock can't be listed.");
      if (b.quantity <= 0) throw new ApiError('Nothing left to list.');
      if (b.donation?.status === 'offered') throw new ApiError('Already offered to a food bank.');
      const pct = Math.min(50, Math.max(10, Math.round(action.discountPct / 5) * 5));
      const next: Batch = {
        ...b,
        listing: { discountPct: pct, unitPrice: discountedPrice(p.price, pct), listedAt: action.at },
      };
      return {
        ...db,
        version,
        batches: replaceBatch(db, next),
        activity: withActivity(db, {
          at: action.at,
          kind: 'listed',
          title: `Listed ${p.name}`,
          detail: `${pct}% off · ${b.quantity} cartons`,
          businessIds: [b.sellerId],
          batchId: b.id,
        }),
      };
    }

    case 'batch/unlist': {
      const b = findBatch(db, action.batchId);
      const p = productOf(db, b);
      if (!b.listing) return db;
      return {
        ...db,
        version,
        batches: replaceBatch(db, { ...b, listing: undefined }),
        activity: withActivity(db, {
          at: action.at,
          kind: 'listed',
          title: `Unlisted ${p.name}`,
          businessIds: [b.sellerId],
          batchId: b.id,
        }),
      };
    }

    case 'batch/donate': {
      const b = findBatch(db, action.batchId);
      const p = productOf(db, b);
      const left = daysLeft(b.expiry, action.today);
      if (left <= 0) throw new ApiError("Expired stock can't be donated.");
      if (left > URGENT_DAYS) throw new ApiError('Donate in the last two weeks.');
      if (b.quantity <= 0) throw new ApiError('Nothing left to donate.');
      const next: Batch = {
        ...b,
        listing: undefined,
        donation: { qty: b.quantity, status: 'offered', offeredAt: action.at, foodBankId: FOOD_BANK.id },
      };
      return {
        ...db,
        version,
        batches: replaceBatch(db, next),
        activity: withActivity(db, {
          at: action.at,
          kind: 'donated',
          title: `Offered ${p.name}`,
          detail: `${b.quantity} cartons · ${FOOD_BANK.name}`,
          businessIds: [b.sellerId, FOOD_BANK.id],
          batchId: b.id,
        }),
      };
    }

    case 'donation/collect': {
      const b = findBatch(db, action.batchId);
      const p = productOf(db, b);
      if (!b.donation || b.donation.status !== 'offered') throw new ApiError('Nothing to collect.');
      const next: Batch = {
        ...b,
        quantity: Math.max(0, b.quantity - b.donation.qty),
        donation: { ...b.donation, status: 'collected', collectedAt: action.at },
      };
      return {
        ...db,
        version,
        batches: replaceBatch(db, next),
        activity: withActivity(db, {
          at: action.at,
          kind: 'collected',
          title: `${FOOD_BANK.name} collected`,
          detail: `${p.name} · ${b.donation.qty} cartons`,
          businessIds: [b.sellerId, FOOD_BANK.id],
          batchId: b.id,
        }),
      };
    }

    case 'order/place': {
      const o = action.order;
      const b = findBatch(db, o.batchId);
      const p = productOf(db, b);
      if (!b.listing) throw new ApiError('This offer has ended.');
      if (daysLeft(b.expiry, action.today) <= 0) throw new ApiError('This offer has expired.');
      if (o.qty < 1 || o.qty > b.quantity) throw new ApiError(`Only ${b.quantity} cartons left.`);
      if (db.orders.some((x) => x.ref === o.ref)) throw new ApiError('Duplicate reference.');
      const nextBatch: Batch = { ...b, quantity: b.quantity - o.qty };
      return {
        ...db,
        version,
        batches: replaceBatch(db, nextBatch),
        orders: [o, ...db.orders],
        activity: withActivity(db, {
          at: action.at,
          kind: 'paid',
          title: `${nameOf(db, o.buyerId)} paid`,
          detail: `${p.name} · ${o.qty} cartons`,
          amount: o.total,
          businessIds: [o.sellerId, o.buyerId],
          batchId: o.batchId,
          orderId: o.id,
        }),
      };
    }

    case 'order/handover': {
      const ref = action.ref.trim().toUpperCase();
      const o = db.orders.find((x) => x.ref === ref);
      if (!o) throw new ApiError('Code not recognised.');
      if (o.status === 'handed_over') throw new ApiError('Already handed over.');
      const p = db.products.find((x) => x.id === o.productId);
      const next: Order = { ...o, status: 'handed_over', handedOverAt: action.at };
      return {
        ...db,
        version,
        orders: db.orders.map((x) => (x.id === o.id ? next : x)),
        activity: withActivity(db, {
          at: action.at,
          kind: 'handed_over',
          title: `${nameOf(db, o.buyerId)} collected`,
          detail: `${p?.name ?? 'Order'} · ${o.qty} cartons`,
          amount: o.total,
          businessIds: [o.sellerId, o.buyerId],
          batchId: o.batchId,
          orderId: o.id,
        }),
      };
    }

    case 'order/payout': {
      const o = db.orders.find((x) => x.id === action.orderId);
      if (!o) throw new ApiError('Order not found.');
      const was = o.payout?.status;
      const next: Order = { ...o, payout: action.payout };
      const announce = action.payout.status === 'successful' && was !== 'successful';
      return {
        ...db,
        version,
        orders: db.orders.map((x) => (x.id === o.id ? next : x)),
        activity: announce
          ? withActivity(db, {
              at: action.at,
              kind: 'paid_out',
              title: `Paid out to ${action.payout.accountName}`,
              detail: `${o.ref} · Xtradot Bank ···${action.payout.accountNumber.slice(-4)}`,
              amount: action.payout.amount,
              businessIds: [o.sellerId],
              batchId: o.batchId,
              orderId: o.id,
            })
          : db.activity,
      };
    }

    case 'passport/bank': {
      return {
        ...db,
        version,
        passportSharedAt: action.at,
        passportStatement: action.statement,
        activity: withActivity(db, {
          at: action.at,
          kind: 'shared',
          title: 'Passport shared with Access Bank',
          detail: `${action.statement.transactions} bank transactions read with consent`,
          businessIds: ['biz-ade'],
        }),
      };
    }

    case 'passport/share': {
      return {
        ...db,
        version,
        passportSharedAt: action.at,
        activity: withActivity(db, {
          at: action.at,
          kind: 'shared',
          title: 'Passport shared',
          detail: 'Access Bank',
          businessIds: ['biz-ade'],
        }),
      };
    }
  }
}
