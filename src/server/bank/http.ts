import { BankError, type BankClient, type PaymentStatus, type StatementSummary, type TransferResult, type TransferStatus } from './types.ts';

/** Holder phones on file (spec v2 test data), needed for open-banking consent. */
const HOLDER_PHONE: Record<string, string> = {
  '0123456789': '+2348031234501',
  '0123456790': '+2348051234502',
  '0123456791': '+2348061234503',
  '0123456792': '+2348071234504',
};

/** Seeded history is October 2026; read that month (STATEMENT_FROM/TO to override). */
function statementPeriod() {
  return { from: process.env.STATEMENT_FROM || '2026-10-01', to: process.env.STATEMENT_TO || '2026-10-31' };
}

const BASE = process.env.BANK_API_BASE || 'http://bank-api.ingress-apisix.svc.cluster.local/v1';

/** Stay under the team's 60 calls/minute (shared with Huawei MaaS). */
const LIMIT = Number(process.env.BANK_RATE_LIMIT || 50);
const calls: number[] = [];
async function takeSlot() {
  for (let i = 0; i < 20; i++) {
    const t = Date.now();
    while (calls.length && t - calls[0] > 60_000) calls.shift();
    if (calls.length < LIMIT) {
      calls.push(t);
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new BankError(429, 'RATE_LIMITED', 'Bank is busy. Try again in a minute.');
}

type Json = Record<string, any>;

async function call(method: 'GET' | 'POST', path: string, body?: Json, idempotencyKey?: string): Promise<Json> {
  const key = process.env.GATEWAY_KEY;
  if (!key) throw new BankError(500, 'NO_KEY', 'GATEWAY_KEY is not set.');
  await takeSlot();
  const headers: Record<string, string> = { 'x-api-key': key, accept: 'application/json' };
  if (body) headers['content-type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  let res: Response;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(32_000) });
  } catch (e) {
    // Network timeout: the outcome is unknown, exactly like a 504.
    log(method, path, 'network-timeout');
    throw new BankError(504, 'TIMEOUT', 'No response from the bank.');
  }
  const json = (await res.json().catch(() => null)) as Json | null;
  log(method, path, res.status, json?.request_id, json?.error?.code, json?.error?.field, json?.error?.message);
  if (!res.ok || json?.status === 'error') {
    throw new BankError(res.status, json?.error?.code ?? `HTTP_${res.status}`, json?.error?.message ?? res.statusText, json?.request_id, json?.error?.field);
  }
  return (json?.data ?? json ?? {}) as Json;
}

/** Logs the shape of each call, never headers, keys or bodies. */
function log(method: string, path: string, status: number | string, requestId?: string, code?: string, field?: string, message?: string) {
  // Validation details help fix field names; they never contain our key or request body.
  const why = code ? ` ${code}${field ? ` field=${field}` : ''}${message ? ` "${String(message).slice(0, 160)}"` : ''}` : '';
  console.log(`[bank] ${method} ${path.split('?')[0]} -> ${status}${why}${requestId ? ` (${requestId})` : ''}`);
}

/** Logs which fields a new endpoint returned (names only, never values). */
function shape(what: string, d: Json) {
  console.log(`[bank] ${what} fields: ${Object.keys(d ?? {}).join(',')}`);
}

const pct = (v?: number) => (v === undefined ? undefined : v > 0 && v < 1 ? Math.round(v * 10000) / 100 : v);

const round3 = (n: number) => Math.round(n * 1000) / 1000;

function toMrv(d: Json) {
  return {
    id: String(d.submission_id ?? d.id ?? d.mrv_id),
    status: String(d.status ?? 'submitted').toLowerCase(),
    estimatedTco2e: num(d.estimated_tco2e),
    verifiedTco2e: num(d.verified_tco2e),
    creditsIssued: num(d.credits_issued),
    creditBatchId: d.credit_batch_id,
    serialRange: d.serial_range,
    autoVerifyAt: d.auto_verify_at,
    note: d.reason ?? d.notes,
    raw: d,
  };
}

function toLoan(d: Json) {
  const offer = (d.offer ?? d) as Json;
  const next = offer.next_due as Json | string | undefined;
  const decision = String(d.decision ?? '').toLowerCase();
  return {
    id: String(d.loan_id ?? d.id ?? d.application_id),
    status: decision === 'declined' || decision === 'referred' ? 'declined' : String(d.status ?? 'offered').toLowerCase(),
    principal: num(offer.approved_amount ?? offer.principal ?? offer.amount),
    // The sandbox sends a fraction (0.03 = 3%); show a percentage.
    interestRate: pct(num(offer.interest_rate_monthly ?? offer.interest_rate ?? offer.rate)),
    tenorDays: num(offer.tenor_days ?? (offer.tenor_months !== undefined ? Number(offer.tenor_months) * 30 : offer.tenor)),
    fee: num(offer.management_fee ?? offer.fee ?? offer.processing_fee),
    netDisbursement: num(offer.net_disbursement),
    repaymentTotal: num(offer.total_repayable ?? offer.total_repayment ?? offer.repayment_amount),
    dueDate: typeof next === 'string' ? next : (next?.due_date ?? next?.date ?? offer.due_date ?? offer.maturity_date),
    creditScore: num(offer.credit_score),
    decision: d.decision ? String(d.decision).toLowerCase() : undefined,
    requestedAmount: num(offer.requested_amount),
    schedule: Array.isArray(offer.repayment_schedule)
      ? (offer.repayment_schedule as Json[]).map((x) => ({ instalment: Number(x.instalment), dueDate: String(x.due_date), amount: Number(x.amount) }))
      : undefined,
    reason: d.decline_reason ?? d.reason,
    raw: d,
  };
}

const num = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : Number(v));

function paymentStatus(s: unknown): PaymentStatus {
  const v = String(s ?? '').toLowerCase();
  if (['successful', 'success', 'paid', 'completed', 'overpaid'].includes(v)) return 'successful';
  if (['failed', 'declined', 'cancelled', 'abandoned', 'expired', 'reversed'].includes(v)) return 'failed';
  return 'pending';
}

function transferStatus(s: unknown): TransferStatus {
  const v = String(s ?? '').toLowerCase();
  if (['successful', 'success', 'completed'].includes(v)) return 'successful';
  if (v === 'reversed') return 'reversed';
  if (['failed', 'declined'].includes(v)) return 'failed';
  return 'pending';
}

function toTransfer(d: Json, reference: string): TransferResult {
  return {
    reference: d.reference ?? reference,
    status: transferStatus(d.status),
    fee: num(d.fee),
    vat: num(d.vat),
    stampDuty: num(d.stamp_duty),
    totalDebit: num(d.total_debit),
    sessionId: d.session_id ?? d.nip_session_id,
    raw: d,
  };
}

export const httpBank: BankClient = {
  mode: 'sandbox',

  async checkout(i) {
    const d = await call(
      'POST',
      '/payments/checkout',
      {
        reference: i.reference,
        amount: Number(i.amount.toFixed(2)),
        currency: 'NGN',
        callback_url: i.callbackUrl,
        description: i.description,
        customer: { name: i.customerName, email: i.customerEmail },
        customer_name: i.customerName,
        customer_email: i.customerEmail,
        email: i.customerEmail,
        // Ade Foods' own merchant (onboarded once; see merchant.ts).
        merchant_id: i.merchantId,
      },
      i.idempotencyKey,
    );
    const paymentUrl = d.payment_url ?? d.checkout_url ?? d.authorization_url;
    if (!paymentUrl) throw new BankError(502, 'NO_PAYMENT_URL', 'Bank did not return a checkout link.');
    return { reference: d.reference ?? i.reference, paymentUrl };
  },

  async verifyPayment(reference) {
    const d = await call('GET', `/payments/${encodeURIComponent(reference)}/verify`);
    return { reference: d.reference ?? reference, status: paymentStatus(d.status), amount: num(d.amount), fee: num(d.fee ?? d.merchant_fee), raw: d };
  },

  async nameEnquiry(accountNumber) {
    const d = await call('POST', '/transfers/intra/name-enquiry', { account_number: accountNumber, destination_account: accountNumber });
    return {
      accountNumber,
      accountName: d.account_name ?? d.name ?? '',
      nameEnquiryRef: d.name_enquiry_ref ?? d.reference ?? '',
      bankName: d.bank_name ?? 'Xtradot Bank',
    };
  },

  async transfer(i) {
    const d = await call(
      'POST',
      '/transfers/intra',
      {
        source_account: i.sourceAccount,
        destination_account: i.destinationAccount,
        name_enquiry_ref: i.nameEnquiryRef,
        amount: Number(i.amount.toFixed(2)),
        narration: i.narration,
        reference: i.reference,
      },
      i.idempotencyKey,
    );
    return toTransfer(d, i.reference);
  },

  async getTransfer(reference) {
    return toTransfer(await call('GET', `/transfers/${encodeURIComponent(reference)}`), reference);
  },

  async createConsent(accountNumber, idempotencyKey) {
    // Spec v2: the holder's phone on file (test data), third party, scopes and a period.
    const phone = process.env.CONSENT_PHONE || HOLDER_PHONE[accountNumber];
    if (!phone) throw new BankError(422, 'CONSENT_PHONE_MISSING', 'Consent phone not configured.');
    const { from, to } = statementPeriod();
    const d = await call(
      'POST',
      '/open-banking/consents',
      {
        account_number: accountNumber,
        customer_phone: phone,
        third_party: { name: 'SecondShelf (Team 19)', purpose: 'Business Passport and stock-loan scoring' },
        scopes: ['accounts:read', 'balance:read', 'transactions:read'],
        data_from: from,
        data_to: to,
        expires_in_days: 30,
      },
      idempotencyKey,
    );
    return { id: String(d.consent_id ?? d.id), status: String(d.status ?? 'awaiting_authorisation') };
  },

  async authoriseConsent(id, otp) {
    const d = await call('POST', `/open-banking/consents/${encodeURIComponent(id)}/authorise`, { otp });
    return { id: String(d.consent_id ?? id), status: String(d.status ?? 'active') };
  },

  async revokeConsent(id) {
    const key = process.env.GATEWAY_KEY!;
    await takeSlot();
    const res = await fetch(`${BASE}/open-banking/consents/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-api-key': key }, signal: AbortSignal.timeout(32_000) });
    const json = (await res.json().catch(() => null)) as Json | null;
    log('DELETE', '/open-banking/consents/{id}', res.status, json?.request_id, json?.error?.code);
    if (!res.ok && res.status !== 404) throw new BankError(res.status, json?.error?.code ?? `HTTP_${res.status}`, json?.error?.message ?? 'Could not revoke.', json?.request_id);
  },

  async statement(accountNumber, consentId) {
    const { from, to } = statementPeriod();
    const d = await call('GET', `/open-banking/accounts/${accountNumber}/statement?consent_id=${encodeURIComponent(consentId)}&from=${from}&to=${to}`);
    const list: Json[] = Array.isArray(d.transactions) ? d.transactions : [];
    return {
      accountNumber,
      accountName: d.account_name,
      transactions: list.length,
      credits: Number(d.total_credits ?? list.reduce((n, t) => n + Number(t.credit ?? 0), 0)),
      debits: Number(d.total_debits ?? list.reduce((n, t) => n + Number(t.debit ?? 0), 0)),
      from: d.period?.from ?? from,
      to: d.period?.to ?? to,
    };
  },

  async onboardMerchant(i, idempotencyKey) {
    const d = await call(
      'POST',
      '/merchants/onboard',
      {
        business_name: i.businessName,
        rc_number: i.rcNumber,
        business_type: i.businessType,
        tin: i.tin,
        category: i.category,
        address: i.address,
        directors: i.directors,
        settlement_account: { account_number: i.settlementAccount, bank_code: '000014' },
        contact_email: i.contactEmail,
      },
      idempotencyKey,
    );
    shape('merchant onboard', d);
    return { merchantId: String(d.merchant_id ?? d.id), status: String(d.status ?? 'under_review'), liveAfter: d.live_after };
  },

  async listWebhooks() {
    const d = await call('GET', '/webhooks?per_page=100');
    const list: Json[] = Array.isArray(d) ? d : (d.items ?? d.webhooks ?? []);
    return list.map((w) => ({ id: String(w.id ?? w.webhook_id ?? ''), url: String(w.url ?? '') })).filter((w) => w.id);
  },

  async deleteWebhook(id) {
    const key = process.env.GATEWAY_KEY!;
    await takeSlot();
    const res = await fetch(`${BASE}/webhooks/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-api-key': key }, signal: AbortSignal.timeout(32_000) });
    log('DELETE', '/webhooks/{id}', res.status);
  },

  async createCarbonProject(i) {
    const d = await call(
      'POST',
      '/carbon/projects',
      {
        name: i.name,
        type: i.type,
        location: i.location,
        owner: { name: i.owner.name, contact_name: i.owner.contactName, phone: i.owner.phone, payout_account: i.owner.payoutAccount, bank_code: i.owner.bankCode },
        methodology: i.methodology,
      },
      i.idempotencyKey,
    );
    shape('carbon project', d);
    return { id: String(d.project_id ?? d.id), status: String(d.status ?? 'registered'), payoutAccountName: d.payout_account_name, raw: d };
  },

  async submitMrv(i) {
    const d = await call(
      'POST',
      `/carbon/projects/${encodeURIComponent(i.projectId)}/mrv`,
      { period: { from: i.periodFrom, to: i.periodTo }, metric: i.metric, value: i.value, evidence_url: i.evidenceUrl, sensor_ids: [] },
      i.idempotencyKey,
    );
    shape('mrv submit', d);
    return toMrv(d);
  },

  async getMrv(id) {
    return toMrv(await call('GET', `/carbon/mrv/${encodeURIComponent(id)}`));
  },

  async reviewMrv(id, approve, idempotencyKey) {
    const d = await call('POST', `/carbon/mrv/${encodeURIComponent(id)}/review`, { decision: approve ? 'verified' : 'rejected' }, idempotencyKey);
    return toMrv(d);
  },

  async retireCredits(i) {
    const d = await call(
      'POST',
      '/carbon/credits/retire',
      {
        credit_batch_id: i.creditBatchId,
        quantity: i.quantity,
        buyer: i.buyer,
        price_per_credit: Number(i.pricePerCredit.toFixed(2)),
        currency: 'NGN',
        payment_reference: i.paymentReference,
        retirement_reason: i.reason,
      },
      i.idempotencyKey,
    );
    shape('retire', d);
    const po = d.payout as Json | undefined;
    return {
      retirementId: String(d.retirement_id ?? d.id),
      quantity: Number(d.quantity ?? i.quantity),
      totalAmount: num(d.total_amount),
      registryFee: num(d.registry_fee),
      status: d.status,
      payout: po ? { reference: String(po.reference), amount: Number(po.amount), accountName: po.account_name, status: String(po.status ?? 'pending') } : undefined,
      certificateUrl: d.certificate_url,
      raw: d,
    };
  },

  async getCertificate(id) {
    const d = await call('GET', `/carbon/certificates/${encodeURIComponent(id)}`);
    shape('certificate', d);
    const buyer = d.buyer as Json | string | undefined;
    return {
      id: String(d.retirement_id ?? d.certificate_id ?? d.id ?? id),
      projectId: d.project_id ?? d.project?.project_id ?? d.project?.id,
      projectName: d.project_name ?? d.project?.name,
      quantity: Number(d.quantity ?? d.credits ?? 0),
      serialRange: d.serial_range ?? d.serials,
      buyer: typeof buyer === 'string' ? buyer : buyer?.name,
      reason: d.retirement_reason ?? d.reason,
      retiredAt: d.retired_at ?? d.created_at,
      pdfUrl: d.pdf_url ?? d.certificate_pdf_url,
      raw: d,
    };
  },

  async applyLoan(i) {
    const d = await call(
      'POST',
      '/loans/applications',
      {
        applicant_account: i.accountNumber,
        ...(i.bvn ? { bvn: i.bvn } : {}),
        ...(i.rcNumber ? { rc_number: i.rcNumber } : {}),
        amount: Number(i.amount.toFixed(2)),
        tenor_months: Math.min(12, Math.max(1, Math.round(i.tenorDays / 30))),
        purpose: i.purpose,
        ...(i.consentId ? { consent_id: i.consentId } : {}),
      },
      i.idempotencyKey,
    );
    shape('loan apply', d);
    return toLoan(d);
  },

  async getLoan(id) {
    return toLoan(await call('GET', `/loans/${encodeURIComponent(id)}`));
  },

  async acceptLoan(id, idempotencyKey) {
    const d = await call('POST', `/loans/${encodeURIComponent(id)}/accept`, { accept: true }, idempotencyKey);
    shape('loan accept', d);
    return toLoan(d);
  },

  async disburseLoan(id, idempotencyKey) {
    const d = await call('POST', `/loans/${encodeURIComponent(id)}/disburse`, {}, idempotencyKey);
    shape('loan disburse', d);
    return toLoan(d);
  },

  async registerWebhook(url, idempotencyKey) {
    const d = await call('POST', '/webhooks', { url, events: ['*'] }, idempotencyKey);
    return { id: d.id, secret: d.webhook_secret ?? d.secret };
  },
};
