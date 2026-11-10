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
/** The demo distributor's receiving account: Mama Nkechi Provisions Ltd. */
export const DISTRIBUTOR_ACCOUNT = process.env.DISTRIBUTOR_ACCOUNT || '0123456793';
/** Account read (with consent) for the Business Passport: Babatunde Adeyemi, the "Ade" of Ade Foods. */
export const PASSPORT_ACCOUNT = process.env.PASSPORT_ACCOUNT || '0123456790';

export * from './types.ts';
