import { httpBank } from './http.ts';
import { mockBank } from './mock.ts';
import type { BankClient } from './types.ts';

/**
 * DEMO_MODE=true (or no GATEWAY_KEY, e.g. on a laptop) uses the mock bank.
 * Same functions either way, so nothing else changes.
 */
export const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.GATEWAY_KEY;

export const bank: BankClient = DEMO_MODE ? mockBank : httpBank;

/** SecondShelf's settlement account (team-owned sandbox account), source of payouts. */
export const SETTLEMENT_ACCOUNT = process.env.SETTLEMENT_ACCOUNT || '0123456789';
/** The demo distributor: Babatunde Olumide Adeyemi trading as Ade Foods (Xtradot, tier 3). */
export const DISTRIBUTOR_ACCOUNT = process.env.DISTRIBUTOR_ACCOUNT || '0123456790';
/** Account read (with consent) for the Business Passport. */
export const PASSPORT_ACCOUNT = process.env.PASSPORT_ACCOUNT || DISTRIBUTOR_ACCOUNT;
/** Loans need an individual with a BVN: the same trader. */
export const LOAN_ACCOUNT = process.env.LOAN_ACCOUNT || DISTRIBUTOR_ACCOUNT;
export const LOAN_BVN = process.env.LOAN_BVN ?? '22200000002';
/** Only for a corporate applicant; unused in the demo. */
export const LOAN_RC = process.env.LOAN_RC || '';

export * from './types.ts';
