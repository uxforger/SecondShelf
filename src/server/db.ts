import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Our own records. The bank sandbox is volatile (it resets), so this
 * SQLite file on the persistent volume is the source of truth.
 * DATA_DIR is /data in the cluster, ./.data locally.
 */
const dir = process.env.DATA_DIR || (fs.existsSync('/data') ? '/data' : path.join(process.cwd(), '.data'));
fs.mkdirSync(dir, { recursive: true });

export const sql = new DatabaseSync(path.join(dir, 'secondshelf.db'));

sql.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 3000;

  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- One row per bank checkout we start. The order is only created after verify.
  CREATE TABLE IF NOT EXISTS payments (
    reference TEXT PRIMARY KEY,
    order_json TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,            -- created | pending | paid | failed
    payment_url TEXT,
    idem_key TEXT NOT NULL,
    bank_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- One payout per order, ever. The idempotency key is stored so a retry reuses it.
  CREATE TABLE IF NOT EXISTS payouts (
    order_id TEXT PRIMARY KEY,
    reference TEXT NOT NULL,
    idem_key TEXT NOT NULL,
    status TEXT NOT NULL,            -- enquired | sending | pending | unknown | successful | failed
    account_number TEXT NOT NULL,
    account_name TEXT,
    name_enquiry_ref TEXT,
    enquired_at TEXT,
    amount REAL NOT NULL,
    bank_json TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY,
    account_number TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- Carbon: which rescued batches back each MRV submission (evidence page).
  CREATE TABLE IF NOT EXISTS carbon_evidence (
    id TEXT PRIMARY KEY,
    mrv_id TEXT,
    items_json TEXT NOT NULL,
    tco2e REAL NOT NULL,
    kwh INTEGER NOT NULL,
    period_from TEXT NOT NULL,
    period_to TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- Carbon credit sales: checkout to the registry merchant before retirement.
  CREATE TABLE IF NOT EXISTS carbon_sales (
    reference TEXT PRIMARY KEY,
    mrv_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    idem_key TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- Webhook de-duplication.
  CREATE TABLE IF NOT EXISTS webhook_events (
    event_id TEXT PRIMARY KEY,
    type TEXT,
    received_at TEXT NOT NULL
  );
`);

export function kvGet(key: string): string | null {
  const row = sql.prepare('SELECT value FROM kv WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function kvSet(key: string, value: string) {
  sql.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}

export const now = () => new Date().toISOString();
