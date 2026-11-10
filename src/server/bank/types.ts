/**
 * What the app needs from a bank. Two implementations share this contract:
 * http.ts (Xtradot sandbox, inside the cluster) and mock.ts (DEMO_MODE).
 */

export interface CheckoutInput {
  reference: string;
  amount: number;
  callbackUrl: string;
  customerName: string;
  customerEmail: string;
  description: string;
  idempotencyKey: string;
}

export interface CheckoutResult {
  reference: string;
  paymentUrl: string;
}

export type PaymentStatus = 'successful' | 'pending' | 'failed';

export interface VerifyResult {
  reference: string;
  status: PaymentStatus;
  amount?: number;
  fee?: number;
  raw: unknown;
}

export interface NameEnquiry {
  accountNumber: string;
  accountName: string;
  nameEnquiryRef: string;
  bankName: string;
}

export interface TransferInput {
  reference: string;
  sourceAccount: string;
  destinationAccount: string;
  nameEnquiryRef: string;
  amount: number;
  narration: string;
  idempotencyKey: string;
}

export type TransferStatus = 'successful' | 'pending' | 'failed' | 'reversed';

export interface TransferResult {
  reference: string;
  status: TransferStatus;
  fee?: number;
  vat?: number;
  stampDuty?: number;
  totalDebit?: number;
  sessionId?: string;
  raw: unknown;
}

export interface StatementSummary {
  accountNumber: string;
  accountName?: string;
  transactions: number;
  credits: number;
  debits: number;
  from?: string;
  to?: string;
}

export interface CarbonProjectInput {
  name: string;
  methodology: string;
  location: string;
  description: string;
  idempotencyKey: string;
}

export interface MrvInput {
  projectId: string;
  periodStart: string;
  periodEnd: string;
  tco2e: number;
  evidenceSummary: string;
  items: { id: string; kind: 'sale' | 'donation'; netWeightKg: number; tco2e: number; reference: string; at: string }[];
  idempotencyKey: string;
}

export interface MrvResult {
  id: string;
  status: string;
  creditsIssued?: number;
  note?: string;
  raw: unknown;
}

export interface RetireInput {
  projectId: string;
  mrvId: string;
  quantity: number;
  beneficiary: string;
  reason: string;
  idempotencyKey: string;
}

export interface RetireResult {
  certificateId: string;
  quantity: number;
  serial?: string;
  valueNaira?: number;
  raw: unknown;
}

export interface CertificateResult {
  id: string;
  projectId?: string;
  projectName?: string;
  quantity: number;
  serial?: string;
  beneficiary?: string;
  reason?: string;
  retiredAt?: string;
  raw: unknown;
}

export interface LoanInput {
  accountNumber: string;
  bvn: string;
  amount: number;
  tenorDays: number;
  purpose: string;
  idempotencyKey: string;
}

export interface LoanResult {
  id: string;
  status: string;
  principal?: number;
  interestRate?: number;
  tenorDays?: number;
  fee?: number;
  netDisbursement?: number;
  repaymentTotal?: number;
  dueDate?: string;
  creditScore?: number;
  reason?: string;
  raw: unknown;
}

export interface BankClient {
  readonly mode: 'sandbox' | 'mock';
  checkout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyPayment(reference: string): Promise<VerifyResult>;
  nameEnquiry(accountNumber: string): Promise<NameEnquiry>;
  transfer(input: TransferInput): Promise<TransferResult>;
  getTransfer(reference: string): Promise<TransferResult>;
  createConsent(accountNumber: string, idempotencyKey: string): Promise<{ id: string; status: string }>;
  authoriseConsent(id: string, otp: string): Promise<{ id: string; status: string }>;
  statement(accountNumber: string, consentId: string): Promise<StatementSummary>;
  registerWebhook(url: string, idempotencyKey: string): Promise<{ id: string; secret: string }>;
  listWebhooks(): Promise<{ id: string; url: string }[]>;
  deleteWebhook(id: string): Promise<void>;

  createCarbonProject(input: CarbonProjectInput): Promise<{ id: string; status: string; raw: unknown }>;
  submitMrv(input: MrvInput): Promise<MrvResult>;
  getMrv(id: string): Promise<MrvResult>;
  /** Sandbox: we play the independent verifier. */
  reviewMrv(id: string, approve: boolean, idempotencyKey: string): Promise<MrvResult>;
  retireCredits(input: RetireInput): Promise<RetireResult>;
  getCertificate(id: string): Promise<CertificateResult>;

  applyLoan(input: LoanInput): Promise<LoanResult>;
  getLoan(id: string): Promise<LoanResult>;
  acceptLoan(id: string, idempotencyKey: string): Promise<LoanResult>;
  disburseLoan(id: string, idempotencyKey: string): Promise<LoanResult>;
}

export class BankError extends Error {
  constructor(
    public httpStatus: number,
    public code: string,
    message: string,
    public requestId?: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'BankError';
  }
  /** Outcome unknown: never resend, requery instead. */
  get isTimeout() {
    return this.httpStatus === 504 || this.code === 'TIMEOUT';
  }
}
