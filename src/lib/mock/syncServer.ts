import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Db } from '../api/types.ts';
import { ApiError } from '../api/types.ts';
import { reduce, type Action } from './reducer.ts';
import { seed } from './seed.ts';

/**
 * Demo-only sync endpoint. Keeps one shared database in memory so the
 * distributor phone, buyer phone and laptop all see the same state.
 *
 *   GET  /demo-api/state   -> Db
 *   POST /demo-api/action  -> Db        body: { action }
 *   POST /demo-api/reset   -> Db
 */
export function createDemoSync() {
  let db: Db = seed(new Date());

  const send = (res: ServerResponse, status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };

  const readBody = (req: IncomingMessage) =>
    new Promise<string>((resolve, reject) => {
      let data = '';
      req.on('data', (c) => {
        data += c;
        if (data.length > 1_000_000) reject(new Error('Too large'));
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

  return async function demoSync(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const url = (req.url ?? '').split('?')[0];
    if (!url.startsWith('/demo-api/')) return next();

    try {
      if (req.method === 'GET' && url === '/demo-api/state') return send(res, 200, db);

      if (req.method === 'POST' && url === '/demo-api/reset') {
        db = { ...seed(new Date()), version: db.version + 1 };
        return send(res, 200, db);
      }

      if (req.method === 'POST' && url === '/demo-api/action') {
        const { action } = JSON.parse(await readBody(req)) as { action: Action };
        try {
          db = reduce(db, action);
          return send(res, 200, db);
        } catch (e) {
          if (e instanceof ApiError) return send(res, 409, { error: e.message, db });
          throw e;
        }
      }

      return send(res, 404, { error: 'Not found' });
    } catch {
      return send(res, 500, { error: 'Something went wrong.' });
    }
  };
}
