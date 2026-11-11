import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Own database and the demo bank, set before the modules load.
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-transfers-'));
delete process.env.GATEWAY_KEY;
process.env.DEMO_MODE = 'true';

const { enquire } = await import('./transfers.ts');
const { sql } = await import('./db.ts');

const target = (key: string) => ({
  key,
  refBase: '12345',
  account: '0123456790',
  amount: 129_500,
  narration: 'SecondShelf test',
  record: () => {},
});

test('two simultaneous name enquiries for one payout both succeed and leave one row', async () => {
  const t = target('o-race-1');
  const [a, b] = await Promise.all([enquire(t), enquire(t)]);
  assert.equal(a.accountName, 'BABATUNDE OLUMIDE ADEYEMI');
  assert.equal(b.accountName, 'BABATUNDE OLUMIDE ADEYEMI');
  const rows = sql.prepare('SELECT reference, idem_key FROM payouts WHERE order_id = ?').all(t.key) as { reference: string; idem_key: string }[];
  assert.equal(rows.length, 1, 'one payout row, so one reference and one idempotency key');
});

test('a repeat enquiry reuses the stored reference and key', async () => {
  const t = target('o-race-2');
  await enquire(t);
  const first = sql.prepare('SELECT reference, idem_key FROM payouts WHERE order_id = ?').get(t.key);
  await enquire(t);
  const second = sql.prepare('SELECT reference, idem_key FROM payouts WHERE order_id = ?').get(t.key);
  assert.deepEqual(second, first);
});
