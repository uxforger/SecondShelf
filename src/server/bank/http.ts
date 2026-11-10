import { BankError, type BankClient, type PaymentStatus, type StatementSummary, type TransferResult, type TransferStatus } from './types.ts';

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

const round3 = (n: number) => Math.round(n * 1000) / 1000;

function toMrv(d: Json) {
  const status = String(d.status ?? d.review_status ?? 'submitted').toLowerCase();
  return {
    id: String(d.id ?? d.mrv_id),
    status,
    creditsIssued: num(d.credits_issued ?? d.issued_credits ?? d.verified_tco2e ?? d.credits),
    note: d.review_notes ?? d.notes ?? d.reason,
    raw: d,
  };
}

function toLoan(d: Json) {
  const offer = (d.offer ?? d) as Json;
  return {
    id: String(d.id ?? d.loan_id ?? d.application_id),
    status: String(d.status ?? 'offered').toLowerCase(),
    principal: num(offer.principal ?? offer.amount ?? offer.approved_amount),
    interestRate: num(offer.interest_rate ?? offer.rate),
    tenorDays: num(offer.tenor_days ?? offer.tenor),
    fee: num(offer.fee ?? offer.processing_fee),
    repaymentTotal: num(offer.total_repayment ?? offer.repayment_amount ?? offer.total_payable),
    dueDate: offer.due_date ?? offer.maturity_date,
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
        // The distributor's merchant on the sandbox (guide §5.4: mer_204 Mama Nkechi Provisions).
        merchant_id: process.env.BANK_MERCHANT_ID || 'mer_204',
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
    // The bank checks this against the holder's phone on file. It isn't in the
    // participant guide, so it's configured (CONSENT_PHONE); see CHANGES.md.
    const phone = process.env.CONSENT_PHONE;
    if (!phone) throw new BankError(422, 'CONSENT_PHONE_MISSING', 'Consent phone not configured.');
    const d = await call(
      'POST',
      '/open-banking/consents',
      {
        account_number: accountNumber,
        // Synthetic contact for the sandbox OTP; no real personal data.
        customer_phone: phone,
        scopes: ['accounts', 'balance', 'statement'],
        permissions: ['accounts', 'balance', 'statement'],
        purpose: 'SecondShelf Business Passport',
      },
      idempotencyKey,
    );
    return { id: d.id ?? d.consent_id, status: d.status ?? 'pending' };
  },

  async authoriseConsent(id, otp) {
    const d = await call('POST', `/open-banking/consents/${encodeURIComponent(id)}/authorise`, { otp });
    return { id: d.id ?? id, status: d.status ?? 'authorised' };
  },

  async statement(accountNumber, consentId) {
    const d = await call('GET', `/open-banking/accounts/${accountNumber}/statement?consent_id=${encodeURIComponent(consentId)}&per_page=100`);
    const list: Json[] = Array.isArray(d) ? d : (d.transactions ?? d.items ?? d.entries ?? []);
    const summary: StatementSummary = { accountNumber, accountName: d.account_name, transactions: list.length, credits: 0, debits: 0 };
    for (const t of list) {
      const amount = Math.abs(Number(t.amount ?? 0));
      const dir = String(t.type ?? t.direction ?? t.entry_type ?? '').toLowerCase();
      if (dir.startsWith('c') || Number(t.amount) > 0 && !dir.startsWith('d')) summary.credits += amount;
      else summary.debits += amount;
      const at = t.date ?? t.created_at ?? t.timestamp;
      if (at && (!summary.from || at < summary.from)) summary.from = at;
      if (at && (!summary.to || at > summary.to)) summary.to = at;
    }
    return summary;
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
      { name: i.name, type: process.env.CARBON_PROJECT_TYPE || 'food_waste_avoidance', methodology: i.methodology, location: i.location, country: 'NG', description: i.description, sector: 'waste' },
      i.idempotencyKey,
    );
    shape('carbon project', d);
    return { id: String(d.id ?? d.project_id), status: String(d.status ?? 'registered'), raw: d };
  },

  async submitMrv(i) {
    const d = await call(
      'POST',
      `/carbon/projects/${encodeURIComponent(i.projectId)}/mrv`,
      {
        period_start: i.periodStart,
        period_end: i.periodEnd,
        methodology: 'VM0046',
        tco2e: round3(i.tco2e),
        claimed_tco2e: round3(i.tco2e),
        emission_reductions_tco2e: round3(i.tco2e),
        evidence_summary: i.evidenceSummary,
        evidence: i.items.map((x) => ({ type: x.kind, reference: x.reference, net_weight_kg: round3(x.netWeightKg), tco2e: round3(x.tco2e), date: x.at })),
      },
      i.idempotencyKey,
    );
    shape('mrv submit', d);
    return toMrv(d);
  },

  async getMrv(id) {
    return toMrv(await call('GET', `/carbon/mrv/${encodeURIComponent(id)}`));
  },

  async reviewMrv(id, approve, idempotencyKey) {
    const d = await call(
      'POST',
      `/carbon/mrv/${encodeURIComponent(id)}/review`,
      { decision: approve ? 'approve' : 'reject', outcome: approve ? 'verified' : 'rejected', notes: 'Sandbox verifier review of SecondShelf handover and collection records.' },
      idempotencyKey,
    );
    shape('mrv review', d);
    return toMrv(d);
  },

  async retireCredits(i) {
    const d = await call(
      'POST',
      '/carbon/credits/retire',
      { project_id: i.projectId, mrv_id: i.mrvId, quantity: round3(i.quantity), tco2e: round3(i.quantity), beneficiary: i.beneficiary, beneficiary_name: i.beneficiary, reason: i.reason, retirement_reason: i.reason },
      i.idempotencyKey,
    );
    shape('retire', d);
    return {
      certificateId: String(d.certificate_id ?? d.certificate?.id ?? d.id),
      quantity: Number(d.quantity ?? d.tco2e ?? i.quantity),
      serial: d.serial ?? d.serial_number ?? d.certificate?.serial,
      valueNaira: num(d.value ?? d.amount ?? d.value_ngn),
      raw: d,
    };
  },

  async getCertificate(id) {
    const d = await call('GET', `/carbon/certificates/${encodeURIComponent(id)}`);
    shape('certificate', d);
    return {
      id: String(d.id ?? d.certificate_id ?? id),
      projectId: d.project_id ?? d.project?.id,
      projectName: d.project_name ?? d.project?.name,
      quantity: Number(d.quantity ?? d.tco2e ?? 0),
      serial: d.serial ?? d.serial_number ?? d.serial_range,
      beneficiary: d.beneficiary ?? d.beneficiary_name,
      reason: d.reason ?? d.retirement_reason,
      retiredAt: d.retired_at ?? d.issued_at ?? d.created_at,
      raw: d,
    };
  },

  async applyLoan(i) {
    const d = await call(
      'POST',
      '/loans/applications',
      { applicant_account: i.accountNumber, account_number: i.accountNumber, amount: Number(i.amount.toFixed(2)), tenor_days: i.tenorDays, purpose: i.purpose, product: 'inventory' },
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
