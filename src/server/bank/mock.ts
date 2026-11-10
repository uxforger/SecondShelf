import { randomUUID } from 'node:crypto';
import { BankError, type BankClient } from './types.ts';

/**
 * DEMO_MODE bank. Same function signatures as the sandbox client, with
 * realistic timing. Its "hosted checkout" is a small page served by our
 * own server at /api/mock-checkout/:reference.
 */
const payments = new Map<string, { amount: number; status: 'pending' | 'successful' | 'failed'; callbackUrl: string }>();
const consents = new Map<string, { status: string }>();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function mockPaymentPage(reference: string) {
  return payments.get(reference);
}

export function mockSettle(reference: string, ok: boolean) {
  const p = payments.get(reference);
  if (p) p.status = ok ? 'successful' : 'failed';
  return p;
}

export const mockBank: BankClient = {
  mode: 'mock',

  async checkout(i) {
    await wait(500);
    payments.set(i.reference, { amount: i.amount, status: 'pending', callbackUrl: i.callbackUrl });
    return { reference: i.reference, paymentUrl: `/api/mock-checkout/${encodeURIComponent(i.reference)}` };
  },

  async verifyPayment(reference) {
    await wait(400);
    const p = payments.get(reference);
    if (!p) throw new BankError(404, 'NOT_FOUND', 'Unknown payment.');
    return { reference, status: p.status, amount: p.amount, fee: Math.min(2000, Math.round(p.amount * 0.015)), raw: { mock: true } };
  },

  async nameEnquiry(accountNumber) {
    await wait(450);
    if (accountNumber === '0000000001') throw new BankError(404, 'ACCOUNT_NOT_FOUND', 'Account not found.');
    return { accountNumber, accountName: 'Mama Nkechi Provisions Ltd', nameEnquiryRef: `NE-${randomUUID().slice(0, 8)}`, bankName: 'Xtradot Bank' };
  },

  async transfer(i) {
    await wait(700);
    return {
      reference: i.reference,
      status: 'successful',
      fee: 0,
      vat: 0,
      stampDuty: i.amount >= 10_000 ? 50 : 0,
      totalDebit: i.amount + (i.amount >= 10_000 ? 50 : 0),
      sessionId: `0000142611${Date.now().toString().slice(-14)}`,
      raw: { mock: true },
    };
  },

  async getTransfer(reference) {
    await wait(200);
    return { reference, status: 'successful', raw: { mock: true } };
  },

  async createConsent() {
    await wait(500);
    const id = `cns_${randomUUID().slice(0, 10)}`;
    consents.set(id, { status: 'awaiting_authorisation' });
    return { id, status: 'awaiting_authorisation' };
  },

  async authoriseConsent(id, otp) {
    await wait(500);
    if (otp !== '123456') throw new BankError(422, 'INVALID_OTP', 'Wrong code.');
    consents.set(id, { status: 'authorised' });
    return { id, status: 'authorised' };
  },

  async statement(accountNumber) {
    await wait(700);
    return { accountNumber, accountName: 'Mama Nkechi Provisions Ltd', transactions: 46, credits: 8_420_000, debits: 6_115_500, from: '2026-10-01', to: '2026-10-31' };
  },

  async registerWebhook() {
    return { id: 'wh_mock', secret: 'mock' };
  },

  async listWebhooks() {
    return [];
  },

  async deleteWebhook() {},
};
