import type { FoodType } from '../carbon.ts';

export type Role = 'distributor' | 'buyer' | 'foodbank';

export type ImageKey = 'provisions' | 'warehouse' | 'inspection' | 'market' | 'handover';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  /** "12 × 300 g" */
  pack: string;
  /** Net weight of one carton, kg. */
  netKg: number;
  /** Normal price per carton, naira. */
  price: number;
  type: FoodType;
  image: ImageKey;
  /** Focus point for object-position. */
  focus: string;
  /** Crop into the photo (presentation only, no filters). */
  zoom?: number;
}

export interface Business {
  id: string;
  name: string;
  area: string;
  role: Role;
  /** Distance from the demo distributor, km. */
  distanceKm: number;
}

export interface Listing {
  discountPct: number;
  unitPrice: number;
  listedAt: string;
}

export interface Donation {
  qty: number;
  status: 'offered' | 'collected';
  offeredAt: string;
  collectedAt?: string;
  foodBankId: string;
}

export interface Batch {
  id: string;
  productId: string;
  sellerId: string;
  batchNo: string;
  /** YYYY-MM-DD */
  expiry: string;
  /** Cartons still in stock. */
  quantity: number;
  addedAt: string;
  listing?: Listing;
  donation?: Donation;
  /** This product line has past destruction records, so its carbon counts. */
  baselineDestroyed: boolean;
  /** Units that expired unsold (history only). */
  expiredUnits?: number;
}

export type OrderStatus = 'paid' | 'handed_over';
export type Fulfilment = 'pickup' | 'delivery';

export interface Order {
  id: string;
  /** Short payment reference shown to people and in the QR: "SS-24081". */
  ref: string;
  batchId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  qty: number;
  unitPrice: number;
  deliveryFee: number;
  total: number;
  fulfilment: Fulfilment;
  status: OrderStatus;
  paidAt: string;
  handedOverAt?: string;
  distanceKm: number;
}

export type ActivityKind = 'added' | 'listed' | 'paid' | 'handed_over' | 'donated' | 'collected' | 'shared';

export interface Activity {
  id: string;
  at: string;
  kind: ActivityKind;
  /** Short line: "Listed Cream crackers". */
  title: string;
  /** Second line: "25% off · 48 cartons". */
  detail?: string;
  amount?: number;
  businessIds: string[];
}

export interface Db {
  version: number;
  seededOn: string;
  businesses: Business[];
  products: Product[];
  batches: Batch[];
  orders: Order[];
  activity: Activity[];
  passportSharedAt?: string;
}

export interface Session {
  role: Role;
  businessId: string;
  name: string;
}

/* ------------------------------------------------------------------
   The contract every adapter implements. Screens only talk to this.
   ------------------------------------------------------------------ */

export type ListStage = 'saving' | 'notifying' | 'done';
export type PayStage = 'connecting' | 'authorising' | 'confirmed';

export interface NewBatchInput {
  barcode: string;
  /** Existing product, or details for a new one. */
  productId?: string;
  newProduct?: { name: string; netKg: number; price: number };
  batchNo: string;
  expiry: string;
  quantity: number;
}

export interface OrderInput {
  batchId: string;
  qty: number;
  fulfilment: Fulfilment;
}

export interface SecondShelfApi {
  /** Current snapshot; always available synchronously. */
  getSnapshot(): Db;
  subscribe(listener: () => void): () => void;
  /** Ask for fresh data now (pull to refresh). */
  refresh(): Promise<void>;
  /** "live" when other devices see changes, "local" when only this browser does. */
  connection(): 'live' | 'local';

  signIn(input: { role: Role; identifier: string; password: string }): Promise<Session>;
  lookupBarcode(code: string): Promise<Product | null>;
  addBatch(input: NewBatchInput): Promise<Batch>;
  listBatch(batchId: string, discountPct: number, onStage?: (s: ListStage) => void): Promise<Batch>;
  /** Take a listing back down (undo). Paid orders are not affected. */
  unlistBatch(batchId: string): Promise<Batch>;
  donateBatch(batchId: string): Promise<Batch>;
  collectDonation(batchId: string): Promise<Batch>;
  /** Can be cancelled until the bank starts authorising. */
  placeOrder(input: OrderInput, onStage?: (s: PayStage) => void, signal?: AbortSignal): Promise<Order>;
  confirmHandover(ref: string): Promise<Order>;
  sharePassport(): Promise<string>;
  resetDemo(): Promise<void>;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
