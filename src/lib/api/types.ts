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
  mrvId: string;
  status: MrvStatus;
  /** Our VM0046 figure, t CO2e. */
  tco2e: number;
  /** Credits the registry issued (t CO2e), once verified. */
  creditsIssued?: number;
  /** "order:<id>" and "donation:<batchId>" items covered by this report. */
  itemIds: string[];
  handovers: number;
  collections: number;
  foodKg: number;
  periodStart: string;
  periodEnd: string;
  evidence: string;
  submittedAt: string;
  verifiedAt?: string;
  reviewNote?: string;
}

export interface CarbonRetirement {
  certificateId: string;
  mrvId: string;
  tco2e: number;
  serial?: string;
  beneficiary: string;
  reason: string;
  retiredAt: string;
  /** Value of the retired credits and the distributor's 60% share, naira. */
  valueNaira: number;
  distributorShare: number;
  payout?: Payout;
}

export interface CarbonState {
  /** "sandbox" = Forge Carbon Registry; "simulated" = our mock registry (sandbox has no food-waste project type). */
  registry?: 'sandbox' | 'simulated';
  projectId: string;
  projectName: string;
  methodology: string;
  createdAt: string;
  submissions: CarbonSubmission[];
  retirements: CarbonRetirement[];
}

export interface CarbonCertificate {
  id: string;
  projectId: string;
  projectName: string;
  tco2e: number;
  serial?: string;
  beneficiary?: string;
  reason?: string;
  retiredAt?: string;
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
  interestRate?: number;
  tenorDays?: number;
  fee?: number;
  repaymentTotal?: number;
  dueDate?: string;
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

  /** Carbon registry (server-side, sandbox). */
  carbonPreview(): Promise<CarbonPreview>;
  submitMrv(): Promise<CarbonSubmission>;
  refreshMrv(mrvId: string): Promise<CarbonSubmission | null>;
  /** Sandbox only: act as the independent verifier. */
  approveMrv(mrvId: string): Promise<CarbonSubmission | null>;
  retireCredits(mrvId: string): Promise<CarbonRetirement>;
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
