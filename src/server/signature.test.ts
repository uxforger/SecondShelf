import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifySignature } from './signature.ts';

const secret = 'whsec_test';
const body = Buffer.from('{"event_id":"evt_1","event":"payment.successful","data":{"reference":"SS-24081"}}');
const sign = (ts: string, raw: Buffer, key = secret) => 'sha256=' + createHmac('sha256', key).update(`${ts}.`).update(raw).digest('hex');
const now = 1_794_300_000_000;
const ts = String(now / 1000);

test('accepts a correctly signed, fresh delivery', () => {
  assert.equal(verifySignature(body, ts, sign(ts, body), secret, now), true);
});

test('rejects a tampered body', () => {
  const tampered = Buffer.from(body.toString().replace('SS-24081', 'SS-99999'));
  assert.equal(verifySignature(tampered, ts, sign(ts, body), secret, now), false);
});

test('rejects the wrong secret', () => {
  assert.equal(verifySignature(body, ts, sign(ts, body, 'other'), secret, now), false);
});

test('rejects timestamps older than five minutes', () => {
  const old = String(now / 1000 - 301);
  assert.equal(verifySignature(body, old, sign(old, body), secret, now), false);
});

test('rejects missing headers', () => {
  assert.equal(verifySignature(body, undefined, sign(ts, body), secret, now), false);
  assert.equal(verifySignature(body, ts, undefined, secret, now), false);
});
