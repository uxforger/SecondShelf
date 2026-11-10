import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { ApiError } from '../lib/api/types.ts';
import { CLIENT_ACTIONS, type Action } from '../lib/mock/reducer.ts';
import { bank, BankError, DEMO_MODE } from './bank/index.ts';
import { mockPaymentPage, mockSettle } from './bank/mock.ts';
import {
  authorisePassportConsent,
  createPassportConsent,
  revokePassportConsent,
  enquirePayout,
  ensureWebhook,
  finalizePayment,
  firstDelivery,
  handleEvent,
  sendPayout,
  startCheckout,
  webhookSecret,
} from './flows.ts';
import { verifySignature } from './signature.ts';
import { approveMrv, attemptRegistration, certificate, enquireShare, ensureProject, registrationResult, preview as carbonPreview, refreshMrv, retire, sendShare, submitMrv } from './carbon.ts';
import { acceptLoan, applyForLoan, disburseLoan, offerAmount } from './loans.ts';
import { onboardMerchant } from './merchant.ts';
import { apply, getDb, onChange, resetAll } from './state.ts';

/** Where the browser should come back to after the hosted checkout. */
function originOf(req: Request) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || req.protocol;
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

/** Turn rule and bank errors into short messages for people. */
function fail(res: Response, e: unknown, withState = false) {
  if (e instanceof ApiError) return res.status(409).json(withState ? { error: e.message, db: getDb() } : { error: e.message });
  if (e instanceof BankError) {
    const friendly: Record<string, string> = {
      INSUFFICIENT_FUNDS: 'Not enough funds.',
      RATE_LIMITED: 'The bank is busy. Try again in a minute.',
      TIMEOUT: 'The bank is slow to answer. We are checking the result.',
      INVALID_OTP: 'That code is not right.',
      BANK_UNAVAILABLE: 'The bank is unavailable right now.',
      ACCOUNT_NOT_FOUND: 'Account not found.',
    };
    console.warn(`[api] bank error ${e.code} ${e.httpStatus} ${e.requestId ?? ''}`);
    return res.status(e.httpStatus >= 500 ? 502 : 422).json({ error: friendly[e.code] ?? 'The bank could not complete this.', code: e.code, requestId: e.requestId });
  }
  console.error('[api] unexpected', e);
  return res.status(500).json({ error: 'Something went wrong.' });
}

const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) => fn(req, res).catch((e) => fail(res, e));

export function createApp(opts: { staticDir?: string } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);

  app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

  // Webhooks need the raw body for the signature, so this comes before express.json().
  app.post('/api/hooks/forge', express.raw({ type: '*/*', limit: '1mb' }), (req, res) => {
    const secret = webhookSecret();
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
    if (!secret || !verifySignature(raw, req.header('x-forge-timestamp'), req.header('x-forge-signature'), secret)) {
      return res.status(401).json({ error: 'bad signature' });
    }
    let body: Record<string, any> = {};
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'bad json' });
    }
    const type = req.header('x-forge-event') || body.event || body.type || 'unknown';
    const eventId = String(body.event_id ?? body.id ?? '');
    if (!eventId) return res.status(400).json({ error: 'missing event_id' });
    if (!firstDelivery(eventId, type)) return res.status(200).json({ ok: true, duplicate: true });
    res.status(200).json({ ok: true });
    console.log(`[hook] ${type}`);
    void handleEvent(type, body.data ?? body);
  });

  app.use('/api', express.json({ limit: '200kb' }));

  app.get('/api/state', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(getDb());
  });

  app.get('/api/info', (_req, res) => res.json({ bank: bank.mode, demo: DEMO_MODE }));

  app.post('/api/action', (req, res) => {
    const action = req.body?.action as Action | undefined;
    if (!action || !CLIENT_ACTIONS.includes(action.type)) return res.status(403).json({ error: 'Not allowed.' });
    try {
      res.json(apply(action));
    } catch (e) {
      fail(res, e, true); // the browser rolls back to this state
    }
  });

  app.post('/api/reset', (_req, res) => res.json(resetAll()));

  // Live updates: every change is pushed as the new version number.
  app.get('/api/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(`retry: 3000\ndata: ${getDb().version}\n\n`);
    const off = onChange((db) => res.write(`data: ${db.version}\n\n`));
    const ping = setInterval(() => res.write(': ping\n\n'), 20_000);
    req.on('close', () => {
      off();
      clearInterval(ping);
    });
  });

  // 1. Payments
  app.post(
    '/api/payments/checkout',
    wrap(async (req, res) => {
      const { batchId, qty, fulfilment } = req.body ?? {};
      res.json(await startCheckout({ batchId, qty: Number(qty), fulfilment: fulfilment === 'delivery' ? 'delivery' : 'pickup' }, originOf(req)));
    }),
  );
  app.post(
    '/api/payments/:reference/verify',
    wrap(async (req, res) => res.json(await finalizePayment(String(req.params.reference)))),
  );

  // 3. Payouts
  app.post(
    '/api/payouts/:orderId/enquire',
    wrap(async (req, res) => res.json(await enquirePayout(String(req.params.orderId)))),
  );
  app.post(
    '/api/payouts/:orderId/send',
    wrap(async (req, res) => res.json(await sendPayout(String(req.params.orderId)))),
  );

  // 4. Passport sharing
  app.post(
    '/api/passport/consent',
    wrap(async (_req, res) => res.json(await createPassportConsent())),
  );
  app.post('/api/passport/revoke', wrap(async (_req, res) => res.json(await revokePassportConsent())));
  app.post(
    '/api/passport/consent/:id/authorise',
    wrap(async (req, res) => res.json(await authorisePassportConsent(String(req.params.id), String(req.body?.otp ?? '')))),
  );

  // 5a. Carbon registry
  app.get('/api/carbon/preview', (_req, res) => res.json(carbonPreview()));
  app.post('/api/carbon/project', wrap(async (_req, res) => res.json(await ensureProject())));
  // One honest registration attempt with the sandbox registry; the result is stored, never retried.
  app.post('/api/carbon/register', wrap(async (_req, res) => res.json(await attemptRegistration())));
  app.get('/api/carbon/registration', (_req, res) => res.json({ result: registrationResult() }));
  app.post('/api/carbon/mrv', wrap(async (_req, res) => res.json(await submitMrv())));
  app.post('/api/carbon/mrv/:id/refresh', wrap(async (req, res) => res.json((await refreshMrv(String(req.params.id))) ?? null)));
  app.post('/api/carbon/mrv/:id/approve', wrap(async (req, res) => res.json((await approveMrv(String(req.params.id))) ?? null)));
  app.post('/api/carbon/mrv/:id/retire', wrap(async (req, res) => res.json(await retire(String(req.params.id)))));
  app.get('/api/carbon/certificates/:id', wrap(async (req, res) => res.json(await certificate(String(req.params.id)))));
  app.post('/api/carbon/certificates/:id/share/enquire', wrap(async (req, res) => res.json(await enquireShare(String(req.params.id)))));
  app.post('/api/carbon/certificates/:id/share/send', wrap(async (req, res) => res.json(await sendShare(String(req.params.id)))));

  // Ade Foods as a collections merchant (one-time onboarding).
  app.post('/api/merchant/onboard', wrap(async (_req, res) => res.json(await onboardMerchant())));

  // 5b. Inventory loan
  app.get('/api/loans/offer', (_req, res) => res.json({ amount: offerAmount() }));
  app.post('/api/loans/apply', wrap(async (_req, res) => res.json(await applyForLoan())));
  app.post('/api/loans/:id/accept', wrap(async (req, res) => res.json(await acceptLoan(String(req.params.id)))));
  app.post('/api/loans/:id/disburse', wrap(async (req, res) => res.json(await disburseLoan(String(req.params.id)))));

  // DEMO_MODE hosted checkout, standing in for pay.xtradot.co.
  app.get('/api/mock-checkout/:reference', (req, res) => {
    const p = mockPaymentPage(req.params.reference);
    if (!p) return res.status(404).send('Unknown payment');
    const amount = `₦${Math.round(p.amount).toLocaleString('en-US')}`;
    res.type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sandbox checkout</title><style>
body{margin:0;font-family:system-ui,sans-serif;background:#f6f8f3;color:#0b3b2e;display:grid;place-items:center;min-height:100dvh}
main{background:#fff;border-radius:24px;padding:28px;width:min(360px,90vw);box-shadow:0 16px 48px rgba(11,59,46,.14)}
p{color:#5a6e64;margin:4px 0}h1{font-size:34px;margin:8px 0 20px}button{width:100%;height:52px;border:0;border-radius:999px;font-size:17px;font-weight:600;margin-top:10px;cursor:pointer}
.pay{background:#0b3b2e;color:#fff}.no{background:#e3ede0;color:#0b3b2e}small{display:block;margin-top:16px;color:#5a6e64;text-align:center}
</style></head><body><main><p>Bank sandbox (demo mode)</p><p>${req.params.reference}</p><h1>${amount}</h1>
<form method="post"><button class="pay" name="ok" value="1">Pay ${amount}</button><button class="no" name="ok" value="0">Cancel</button></form>
<small>Simulated checkout. No real money.</small></main></body></html>`);
  });
  app.post('/api/mock-checkout/:reference', express.urlencoded({ extended: false }), (req, res) => {
    const ok = req.body?.ok === '1';
    const p = mockSettle(req.params.reference, ok);
    if (!p) return res.status(404).send('Unknown payment');
    res.redirect(303, `${p.callbackUrl}?reference=${encodeURIComponent(req.params.reference)}&status=${ok ? 'successful' : 'cancelled'}`);
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  if (opts.staticDir && fs.existsSync(opts.staticDir)) {
    const dir = path.resolve(opts.staticDir);
    app.use(
      express.static(dir, {
        index: false,
        setHeaders(res, file) {
          if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          else res.setHeader('Cache-Control', 'no-cache');
        },
      }),
    );
    // SPA: everything else (including /pay/return) gets the app.
    app.get(/.*/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(dir, 'index.html'));
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => fail(res, err));

  void ensureWebhook();
  return app;
}
