import type { Db } from '../lib/api/types.ts';
import { reduce, type Action } from '../lib/mock/reducer.ts';
import { seed } from '../lib/mock/seed.ts';
import { kvGet, kvSet, sql } from './db.ts';

/**
 * The app's shared state, persisted to SQLite on every change.
 * Every device reads it (poll + server-sent events) and changes it only
 * through the reducer, so rules like "nothing sells after expiry" hold.
 */
const KEY = 'app_state_v1';

function load(): Db | null {
  try {
    const raw = kvGet(KEY);
    return raw ? (JSON.parse(raw) as Db) : null;
  } catch {
    return null;
  }
}

let db: Db = load() ?? seed(new Date());
kvSet(KEY, JSON.stringify(db));

const listeners = new Set<(db: Db) => void>();

export const getDb = () => db;

export function onChange(fn: (db: Db) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function commit(next: Db) {
  if (next === db) return db;
  db = next;
  kvSet(KEY, JSON.stringify(db));
  listeners.forEach((l) => l(db));
  return db;
}

/** Throws ApiError when a rule is broken; nothing is saved in that case. */
export function apply(action: Action): Db {
  return commit(reduce(db, action));
}

/** Check an action against the rules without saving it. */
export function dryRun(action: Action): void {
  reduce(db, action);
}

export function resetAll() {
  sql.exec('DELETE FROM payments; DELETE FROM payouts; DELETE FROM consents; DELETE FROM carbon_sales;');
  // Fresh carbon and loan story on reset; the one carbon project is kept on purpose.
  sql.exec("DELETE FROM kv WHERE key LIKE 'mrv_%' OR key LIKE 'retire_%' OR key LIKE 'loan_%';");
  const projectId = db.carbon?.projectId;
  const next: Db = { ...seed(new Date()), version: db.version + 1 };
  if (projectId && db.carbon) next.carbon = { ...db.carbon, submissions: [], sales: [], retirements: [] };
  return commit(next);
}
