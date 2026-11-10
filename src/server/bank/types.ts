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
}

export class BankError extends Error {
  constructor(
    public httpStatus: number,
    public code: string,
    message: string,
    public requestId?: string,
  ) {
    super(message);
    this.name = 'BankError';
  }
  /** Outcome unknown: never resend, requery instead. */
  get isTimeout() {
    return this.httpStatus === 504 || this.code === 'TIMEOUT';
  }
}
