import { randomUUID } from 'node:crypto';
import { BankError, type BankClient } from './types.ts';

/**
 * DEMO_MODE bank. Same function signatures as the sandbox client, with
 * realistic timing. Its "hosted checkout" is a small page served by our
 * own server at /api/mock-checkout/:reference.
 */
const payments = new Map<string, { amount: number; status: 'pending' | 'successful' | 'failed'; callbackUrl: string }>();
const consents = new Map<string, { status: string }>();
const mrvs = new Map<string, { status: string; tco2e: number }>();
const certs = new Map<string, { projectId: string; quantity: number; beneficiary: string; reason: string; at: string }>();
const loans = new Map<string, { status: string }>();
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

  async revokeConsent(id) {
    await wait(300);
    consents.set(id, { status: 'revoked' });
  },

  async statement(accountNumber) {
    await wait(700);
    return { accountNumber, accountName: 'Mama Nkechi Provisions Ltd', transactions: 46, credits: 8_420_000, debits: 6_115_500, from: '2026-10-01', to: '2026-10-31' };
  },

  async registerWebhook() {
    return { id: 'wh_mock', secret: 'mock' };
  },

  async createCarbonProject() {
    await wait(500);
    return { id: `cprj_${randomUUID().slice(0, 8)}`, status: 'registered', raw: { mock: true } };
  },

  async submitMrv(i) {
    await wait(700);
    const id = `mrv_${randomUUID().slice(0, 8)}`;
    mrvs.set(id, { status: 'under_review', tco2e: i.tco2e });
    return { id, status: 'under_review', raw: { mock: true } };
  },

  async getMrv(id) {
    await wait(250);
    const m = mrvs.get(id);
    if (!m) throw new BankError(404, 'NOT_FOUND', 'Unknown MRV.');
    return { id, status: m.status, creditsIssued: m.status === 'verified' ? m.tco2e : undefined, raw: { mock: true } };
  },

  async reviewMrv(id, approve) {
    await wait(600);
    const m = mrvs.get(id);
    if (!m) throw new BankError(404, 'NOT_FOUND', 'Unknown MRV.');
    m.status = approve ? 'verified' : 'rejected';
    return { id, status: m.status, creditsIssued: approve ? m.tco2e : undefined, raw: { mock: true } };
  },

  async retireCredits(i) {
    await wait(700);
    const certificateId = `cert_${randomUUID().slice(0, 8)}`;
    certs.set(certificateId, { ...i, at: new Date().toISOString() });
    return { certificateId, quantity: i.quantity, serial: `FCR-NG-2026-${certificateId.slice(5, 11).toUpperCase()}`, raw: { mock: true } };
  },

  async getCertificate(id) {
    await wait(300);
    const c = certs.get(id);
    if (!c) throw new BankError(404, 'NOT_FOUND', 'Unknown certificate.');
    return { id, projectId: c.projectId, quantity: c.quantity, serial: `FCR-NG-2026-${id.slice(5, 11).toUpperCase()}`, beneficiary: c.beneficiary, reason: c.reason, retiredAt: c.at, raw: { mock: true } };
  },

  async applyLoan(i) {
    await wait(900);
    const id = `loan_${randomUUID().slice(0, 8)}`;
    const rate = 4.5;
    const fee = Math.round(i.amount * 0.01);
    const repay = Math.round(i.amount * (1 + rate / 100));
    const due = new Date(Date.now() + i.tenorDays * 86_400_000).toISOString().slice(0, 10);
    loans.set(id, { status: 'offered' });
    return { id, status: 'offered', principal: i.amount, interestRate: rate, tenorDays: i.tenorDays, fee, repaymentTotal: repay, dueDate: due, raw: { mock: true } };
  },

  async getLoan(id) {
    return { id, status: loans.get(id)?.status ?? 'offered', raw: { mock: true } };
  },

  async acceptLoan(id) {
    await wait(500);
    loans.set(id, { status: 'accepted' });
    return { id, status: 'accepted', raw: { mock: true } };
  },

  async disburseLoan(id) {
    await wait(800);
    loans.set(id, { status: 'disbursed' });
    return { id, status: 'disbursed', raw: { mock: true } };
  },

  async listWebhooks() {
    return [];
  },

  async deleteWebhook() {},
};
