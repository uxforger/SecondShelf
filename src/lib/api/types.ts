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
  /** Owner, for a sole trader ("trading as"). */
  owner?: string;
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

/** Money sent to the distributor's bank account after handover. */
export interface Payout {
  status: 'successful' | 'pending' | 'failed' | 'unknown';
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
  fee?: number;
  vat?: number;
  stampDuty?: number;
  totalDebit?: number;
  reference: string;
  sessionId?: string;
  at: string;
}

/** A bank statement read through open-banking consent. */
export interface BankStatement {
  /** "bank" = read from the sandbox with consent; "simulated" = demo fallback. */
  source?: 'bank' | 'simulated';
  consentId: string;
  accountNumber: string;
  accountName?: string;
  transactions: number;
  credits: number;
  debits: number;
  from?: string;
  to?: string;
  at: string;
  revokedAt?: string;
}
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
  payout?: Payout;
  /** Bank merchant fee on the collection, read from verify. */
  bankFee?: number;
}

export type ActivityKind = 'added' | 'listed' | 'paid' | 'handed_over' | 'donated' | 'collected' | 'shared' | 'paid_out' | 'carbon' | 'loan';

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
  /** What the event is about, for links and the live screen. */
  batchId?: string;
  orderId?: string;
}

export interface Db {
  version: number;
  seededOn: string;
  /** When this demo run started (seed or reset). The live view counts from here. */
  startedAt?: string;
  businesses: Business[];
  products: Product[];
  batches: Batch[];
  orders: Order[];
  activity: Activity[];
  passportSharedAt?: string;
  passportStatement?: BankStatement;
  carbon?: CarbonState;
  loan?: Loan;
}

/* ---------------- Carbon registry ---------------- */

export type MrvStatus = 'submitted' | 'under_review' | 'verified' | 'rejected';

export interface CarbonSubmission {
  /** Registry submission id. */
  mrvId: string;
  /** Our evidence page id: /evidence/<evidenceId>. */
  evidenceId: string;
  status: MrvStatus;
  /** Our VM0046 food-waste figure, tCO2e. */
  tco2e: number;
  /** What the sandbox registry carries: ceil(tCO2e / 0.00053) kWh, solar-equivalent. */
  kwh: number;
  estimatedTco2e?: number;
  verifiedTco2e?: number;
  /** Whole credits (1 credit = 1 tCO2e, rounded down by the registry). */
  creditsIssued?: number;
  creditBatchId?: string;
  serialRange?: string;
  autoVerifyAt?: string;
  itemIds: string[];
  handovers: number;
  collections: number;
  foodKg: number;
  periodStart: string;
  periodEnd: string;
  submittedAt: string;
  verifiedAt?: string;
  reviewNote?: string;
}

export interface CarbonSale {
  /** Checkout reference to the registry merchant (mer_900). */
  reference: string;
  mrvId: string;
  quantity: number;
  pricePerCredit: number;
  amount: number;
  buyer: string;
  status: 'pending' | 'paid' | 'retired' | 'failed';
  createdAt: string;
}

export interface PoolPayout {
  reference: string;
  amount: number;
  accountName?: string;
  status: 'pending' | 'successful' | 'failed';
  at?: string;
}

export interface CarbonRetirement {
  /** Registry retirement id (also the certificate id). */
  certificateId: string;
  mrvId: string;
  /** Credits retired (tCO2e). */
  tco2e: number;
  serialRange?: string;
  buyer: string;
  reason: string;
  retiredAt: string;
  saleReference: string;
  pricePerCredit: number;
  totalAmount: number;
  registryFee: number;
  /** Registry → pool payout (minus its 2% fee), confirmed by webhook. */
  poolPayout?: PoolPayout;
  /** 60% of the pool payout, sent to the distributor by us. */
  distributorShare: number;
  payout?: Payout;
  certificateUrl?: string;
}

export interface CarbonState {
  /** "sandbox" = Forge Carbon Registry; "simulated" = local demo mode only. */
  registry?: 'sandbox' | 'simulated';
  projectId: string;
  /** Shown in our UI: "Food waste reduction (VM0046)". */
  projectName: string;
  /** Shown as the registry project: "SecondShelf carbon pool (sandbox)". */
  poolName: string;
  payoutAccountName?: string;
  methodology: string;
  createdAt: string;
  submissions: CarbonSubmission[];
  sales: CarbonSale[];
  retirements: CarbonRetirement[];
}

export interface CarbonCertificate {
  id: string;
  projectId: string;
  projectName: string;
  poolName: string;
  tco2e: number;
  serialRange?: string;
  buyer?: string;
  reason?: string;
  retiredAt?: string;
  pdfUrl?: string;
  registry: string;
  methodology: string;
  source: 'registry' | 'local';
}

/* ---------------- Inventory loan ---------------- */

export type LoanStatus = 'offered' | 'accepted' | 'disbursed' | 'declined' | 'repaid';

export interface Loan {
  id: string;
  status: LoanStatus;
  principal: number;
  /** Percent per month (sandbox: interest_rate_monthly). */
  interestRate?: number;
  tenorDays?: number;
  fee?: number;
  /** What lands in the account after fees. */
  netDisbursement?: number;
  repaymentTotal?: number;
  dueDate?: string;
  creditScore?: number;
  /** approved | approved_reduced | declined | referred */
  decision?: string;
  requestedAmount?: number;
  schedule?: { instalment: number; dueDate: string; amount: number }[];
  accountNumber: string;
  appliedAt: string;
  acceptedAt?: string;
  disbursedAt?: string;
  declineReason?: string;
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
export interface CheckoutStart {
  reference: string;
  /** Hosted Access Bank checkout page. */
  paymentUrl: string;
  amount: number;
}

export interface PaymentResult {
  status: 'paid' | 'pending' | 'failed';
  order?: Order;
  message?: string;
}

export interface CarbonPreview {
  items: number;
  handovers: number;
  collections: number;
  foodKg: number;
  tco2e: number;
  /** Solar-equivalent kWh the registry will carry. */
  kwh: number;
}

export interface PayoutPreview {
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
}

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
  /** Creates the bank checkout. The order exists only after verifyPayment says paid. */
  startCheckout(input: OrderInput): Promise<CheckoutStart>;
  /** Always asks the bank before marking anything paid. */
  verifyPayment(reference: string): Promise<PaymentResult>;
  /** Name enquiry for the distributor's payout account. */
  enquirePayout(orderId: string): Promise<PayoutPreview>;
  sendPayout(orderId: string): Promise<Payout>;
  /** Open-banking consent for the Passport; authorise with the OTP. */
  createPassportConsent(): Promise<{ consentId: string; accountNumber: string }>;
  authorisePassportConsent(consentId: string, otp: string): Promise<BankStatement>;
  revokePassportConsent(): Promise<void>;

  /** Carbon registry (server-side, sandbox). */
  carbonPreview(): Promise<CarbonPreview>;
  submitMrv(): Promise<CarbonSubmission>;
  refreshMrv(mrvId: string): Promise<CarbonSubmission | null>;
  /** Buyer pays the registry merchant (mer_900) on the hosted checkout. */
  sellCredits(mrvId: string): Promise<{ reference: string; paymentUrl: string; amount: number }>;
  /** After checkout: verify the payment, then retire with its payment_reference. */
  completeSale(reference: string): Promise<{ status: string; retirement?: CarbonRetirement; message?: string }>;
  getCertificate(certificateId: string): Promise<CarbonCertificate>;
  enquireCarbonShare(certificateId: string): Promise<PayoutPreview>;
  sendCarbonShare(certificateId: string): Promise<Payout>;

  /** Inventory loan from the Passport. */
  loanOffer(): Promise<{ amount: number }>;
  applyLoan(): Promise<Loan>;
  acceptLoan(loanId: string): Promise<Loan>;
  disburseLoan(loanId: string): Promise<Loan>;
  confirmHandover(ref: string): Promise<Order>;
  resetDemo(): Promise<void>;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
