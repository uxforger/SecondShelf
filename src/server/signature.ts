import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Forge webhook check: x-forge-signature = "sha256=" + hex HMAC-SHA256 of
 * "{timestamp}.{raw_body}" with our webhook_secret. Timestamps older than
 * five minutes are rejected (replay protection).
 */
export function verifySignature(raw: Buffer, ts: string | undefined, sig: string | undefined, secret: string, nowMs = Date.now()): boolean {
  if (!ts || !sig || !secret) return false;
  const seconds = ts.length > 11 ? Number(ts) / 1000 : Number(ts);
  if (!Number.isFinite(seconds) || Math.abs(nowMs / 1000 - seconds) > 300) return false;
  const mac = 'sha256=' + createHmac('sha256', secret).update(`${ts}.`).update(raw).digest('hex');
  const a = Buffer.from(mac);
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}
