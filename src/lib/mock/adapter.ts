import {
  ApiError,
  type Batch,
  type Db,
  type ListStage,
  type NewBatchInput,
  type Order,
  type OrderInput,
  type PayStage,
  type Product,
  type Role,
  type SecondShelfApi,
  type Session,
} from '../api/types.ts';
import { today } from '../dates.ts';
import { BUYER, DISTRIBUTOR, FOOD_BANK } from './catalogue.ts';
import { reduce, type Action } from './reducer.ts';
import { seed } from './seed.ts';

const STORAGE_KEY = 'secondshelf_demo_v1';
const POLL_MS = 2000;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const rand = () => Math.random().toString(36).slice(2, 8);

/** Realistic timing: random between min and max, capped at 1.2 s per stage. */
const stage = (min: number, max: number) => wait(Math.min(1200, min + Math.random() * (max - min)));

function load(): Db | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Db) : null;
  } catch {
    return null;
  }
}

function save(db: Db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

const SESSIONS: Record<Role, Session> = {
  distributor: { role: 'distributor', businessId: DISTRIBUTOR.id, name: DISTRIBUTOR.name },
  buyer: { role: 'buyer', businessId: BUYER.id, name: BUYER.name },
  foodbank: { role: 'foodbank', businessId: FOOD_BANK.id, name: FOOD_BANK.name },
};

export function createMockApi(): SecondShelfApi {
  let db: Db = load() ?? seed();
  let mode: 'live' | 'local' = 'local';
  let pending = 0;
  const listeners = new Set<() => void>();
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('secondshelf') : null;

  const emit = () => listeners.forEach((l) => l());

  const set = (next: Db, broadcast = true) => {
    if (next === db) return;
    db = next;
    save(db);
    if (broadcast) channel?.postMessage('changed');
    emit();
  };

  channel?.addEventListener('message', () => {
    const fresh = load();
    if (fresh && fresh.version !== db.version) set(fresh, false);
  });

  async function fetchState(timeoutMs = 4000): Promise<Db | null> {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch('/demo-api/state', { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(t);
      if (!res.ok) return null;
      const body = (await res.json()) as Db;
      return body && Array.isArray(body.batches) ? body : null;
    } catch {
      return null;
    }
  }

  async function pull() {
    if (mode !== 'live' || pending > 0) return;
    const fresh = await fetchState();
    if (fresh && pending === 0 && fresh.version !== db.version) set(fresh);
  }

  // Try the shared endpoint; fall back to this browser only.
  void (async () => {
    const remote = await fetchState(1500);
    if (!remote) return;
    mode = 'live';
    set(remote);
    setInterval(pull, POLL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void pull();
    });
    emit();
  })();

  /** Optimistic: apply locally first, then confirm with the shared endpoint. */
  async function dispatch(action: Action): Promise<Db> {
    const before = db;
    const next = reduce(before, action); // throws ApiError on a broken rule
    set(next);
    if (mode !== 'live') return next;

    pending++;
    try {
      const res = await fetch('/demo-api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const body = (await res.json()) as { error?: string } & Partial<Db>;
      if (!res.ok) {
        const server = (body as { db?: Db }).db;
        set(server ?? before);
        throw new ApiError(body.error ?? 'Could not save.');
      }
      set(body as Db);
      return body as Db;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      set(before);
      throw new ApiError('No connection. Try again.');
    } finally {
      pending--;
    }
  }

  const findBatch = (id: string): Batch => {
    const b = db.batches.find((x) => x.id === id);
    if (!b) throw new ApiError('Batch not found.');
    return b;
  };

  return {
    getSnapshot: () => db,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    connection: () => mode,

    async refresh() {
      const started = Date.now();
      if (mode === 'live') {
        const fresh = await fetchState();
        if (fresh) set(fresh);
      } else {
        const fresh = load();
        if (fresh) set(fresh, false);
      }
      const spent = Date.now() - started;
      if (spent < 500) await wait(500 - spent);
    },

    async signIn({ role, identifier, password }) {
      await stage(600, 800);
      if (!identifier.trim() || password.length < 4) throw new ApiError('Check your details.');
      return SESSIONS[role];
    },

    async lookupBarcode(code) {
      await stage(550, 800);
      const clean = code.replace(/\D/g, '');
      return db.products.find((p) => p.barcode === clean) ?? null;
    },

    async addBatch(input: NewBatchInput) {
      await stage(450, 650);
      let product: Product | undefined;
      let productId = input.productId;
      if (!productId && input.newProduct) {
        productId = `p-${rand()}`;
        product = {
          id: productId,
          barcode: input.barcode.replace(/\D/g, ''),
          name: input.newProduct.name.trim(),
          pack: '1 carton',
          netKg: input.newProduct.netKg,
          price: input.newProduct.price,
          type: 'biscuits',
          image: 'inspection',
          focus: '20% 70%',
        };
      }
      if (!productId) throw new ApiError('Choose a product.');
      const batch: Batch = {
        id: `b-${rand()}`,
        productId,
        sellerId: DISTRIBUTOR.id,
        batchNo: input.batchNo.trim().toUpperCase() || `B-${rand().toUpperCase()}`,
        expiry: input.expiry,
        quantity: input.quantity,
        addedAt: new Date().toISOString(),
        // Only catalogue lines have past destruction records.
        baselineDestroyed: !product,
      };
      await dispatch({ type: 'batch/add', at: batch.addedAt, today: today(), batch, product });
      return batch;
    },

    async listBatch(batchId, discountPct, onStage?: (s: ListStage) => void) {
      onStage?.('saving');
      await stage(600, 800);
      await dispatch({ type: 'batch/list', at: new Date().toISOString(), today: today(), batchId, discountPct });
      onStage?.('notifying');
      await stage(800, 1000);
      onStage?.('done');
      return findBatch(batchId);
    },

    async donateBatch(batchId) {
      await stage(600, 800);
      await dispatch({ type: 'batch/donate', at: new Date().toISOString(), today: today(), batchId });
      return findBatch(batchId);
    },

    async collectDonation(batchId) {
      await stage(600, 800);
      await dispatch({ type: 'donation/collect', at: new Date().toISOString(), batchId });
      return findBatch(batchId);
    },

    async placeOrder(input: OrderInput, onStage?: (s: PayStage) => void, signal?: AbortSignal) {
      const b = findBatch(input.batchId);
      if (!b.listing) throw new ApiError('This offer has ended.');
      onStage?.('connecting');
      await stage(650, 850);
      if (signal?.aborted) throw new ApiError('Payment cancelled.');
      onStage?.('authorising');
      await stage(700, 900);
      const deliveryFee = input.fulfilment === 'delivery' ? 1500 : 0;
      const n = 24000 + Math.floor(Math.random() * 6000);
      const order: Order = {
        id: `o-${rand()}`,
        ref: `SS-${n}`,
        batchId: b.id,
        productId: b.productId,
        sellerId: b.sellerId,
        buyerId: BUYER.id,
        qty: input.qty,
        unitPrice: b.listing.unitPrice,
        deliveryFee,
        total: b.listing.unitPrice * input.qty + deliveryFee,
        fulfilment: input.fulfilment,
        status: 'paid',
        paidAt: new Date().toISOString(),
        distanceKm: BUYER.distanceKm,
      };
      await dispatch({ type: 'order/place', at: order.paidAt, today: today(), order });
      onStage?.('confirmed');
      return order;
    },

    async confirmHandover(ref) {
      await stage(500, 700);
      const clean = ref.trim().toUpperCase();
      await dispatch({ type: 'order/handover', at: new Date().toISOString(), ref: clean });
      const o = db.orders.find((x) => x.ref === clean);
      if (!o) throw new ApiError('Code not recognised.');
      return o;
    },

    async sharePassport() {
      await stage(800, 1000);
      const at = new Date().toISOString();
      await dispatch({ type: 'passport/share', at });
      return at;
    },

    async resetDemo() {
      if (mode === 'live') {
        try {
          const res = await fetch('/demo-api/reset', { method: 'POST' });
          if (res.ok) {
            set((await res.json()) as Db);
            return;
          }
        } catch {
          /* fall through to a local reset */
        }
      }
      set({ ...seed(), version: db.version + 1 });
    },
  };
}
