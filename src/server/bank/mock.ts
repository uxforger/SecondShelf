import { randomUUID } from 'node:crypto';
import { BankError, type BankClient } from './types.ts';

/**
 * DEMO_MODE bank. Same function signatures as the sandbox client, with
 * realistic timing. Its "hosted checkout" is a small page served by our
 * own server at /api/mock-checkout/:reference.
 */
const payments = new Map<string, { amount: number; status: 'pending' | 'successful' | 'failed'; callbackUrl: string }>();
const consents = new Map<string, { status: string }>();
const mrvs = new Map<string, { status: string; tco2e: number; at: number }>();
const certs = new Map<string, { quantity: number; buyer: string; reason: string; at: string }>();
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
    return { accountNumber, accountName: 'BABATUNDE OLUMIDE ADEYEMI', nameEnquiryRef: `NE-${randomUUID().slice(0, 8)}`, bankName: 'Xtradot Bank' };
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
    return { accountNumber, accountName: 'BABATUNDE OLUMIDE ADEYEMI', transactions: 46, credits: 8_420_000, debits: 6_115_500, from: '2026-10-01', to: '2026-10-31' };
  },

  async registerWebhook() {
    return { id: 'wh_mock', secret: 'mock' };
  },

  async createCarbonProject(i) {
    await wait(500);
    return { id: `prj_${randomUUID().slice(0, 6)}`, status: 'registered', payoutAccountName: i.owner.name.toUpperCase(), raw: { mock: true } };
  },

  async submitMrv(i) {
    await wait(600);
    const id = `mrv_${randomUUID().slice(0, 6)}`;
    const t = Math.round((i.value / 1000) * 0.53 * 100) / 100;
    mrvs.set(id, { status: 'under_review', tco2e: t, at: Date.now() });
    return { id, status: 'under_review', estimatedTco2e: t, autoVerifyAt: new Date(Date.now() + 60_000).toISOString(), raw: { mock: true } };
  },

  async getMrv(id) {
    await wait(200);
    const m = mrvs.get(id);
    if (!m) throw new BankError(404, 'NOT_FOUND', 'Unknown MRV.');
    if (m.status === 'under_review' && Date.now() - m.at > 60_000) m.status = 'verified';
    const credits = Math.floor(m.tco2e);
    return m.status === 'verified'
      ? { id, status: 'verified', verifiedTco2e: m.tco2e, creditsIssued: credits, creditBatchId: `crb_${id.slice(4)}`, serialRange: `NG-SSP-2026-000001 to NG-SSP-2026-${String(credits).padStart(6, '0')}`, raw: { mock: true } }
      : { id, status: m.status, estimatedTco2e: m.tco2e, raw: { mock: true } };
  },

  async reviewMrv(id, approve) {
    const m = mrvs.get(id);
    if (!m) throw new BankError(404, 'NOT_FOUND', 'Unknown MRV.');
    m.status = approve ? 'verified' : 'rejected';
    return this.getMrv(id);
  },

  async retireCredits(i) {
    await wait(700);
    const retirementId = `ret_${randomUUID().slice(0, 6)}`;
    const total = i.quantity * i.pricePerCredit;
    const fee = Math.round(total * 0.02 * 100) / 100;
    certs.set(retirementId, { quantity: i.quantity, buyer: i.buyer.name, reason: i.reason, at: new Date().toISOString() });
    return {
      retirementId,
      quantity: i.quantity,
      totalAmount: total,
      registryFee: fee,
      status: 'retired',
      payout: { reference: `TRF-MOCK-${retirementId.slice(4)}`, amount: total - fee, accountName: 'AREWA SOLAR CO-OPERATIVE SOCIETY', status: 'successful' },
      raw: { mock: true },
    };
  },

  async getCertificate(id) {
    await wait(300);
    const c = certs.get(id);
    if (!c) throw new BankError(404, 'NOT_FOUND', 'Unknown certificate.');
    return { id, quantity: c.quantity, serialRange: `NG-SSP-2026-000001 to NG-SSP-2026-${String(c.quantity).padStart(6, '0')}`, buyer: c.buyer, reason: c.reason, retiredAt: c.at, raw: { mock: true } };
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

  async onboardMerchant() {
    return { merchantId: 'mer_mock', status: 'active' };
  },

  async listWebhooks() {
    return [];
  },

  async deleteWebhook() {},
};
