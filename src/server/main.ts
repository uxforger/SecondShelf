/**
 * Production entry: one process serves the built app, /api and /healthz
 * on 0.0.0.0:8080 (PORT to override).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.ts';
import { DEMO_MODE } from './bank/index.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const staticDir = process.env.STATIC_DIR || path.resolve(here, '../dist');
const port = Number(process.env.PORT) || 8080;

const app = createApp({ staticDir });
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`SecondShelf on :${port} · bank ${DEMO_MODE ? 'mock (DEMO_MODE)' : 'sandbox'}`);
});

// Kubernetes sends SIGTERM on rollout; finish in-flight requests first.
process.on('SIGTERM', () => server.close(() => process.exit(0)));
