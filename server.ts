/**
 * Production server: serves the built app and the demo sync endpoint
 * from one origin, so phones and the laptop share state.
 *
 *   npm run build && npm start      (PORT defaults to 3000)
 *
 * Put it behind HTTPS (any host or tunnel): phone cameras need it.
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDemoSync } from './src/lib/mock/syncServer.ts';

const dir = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(dir, 'dist');
const app = express();

app.use(createDemoSync());
app.use(
  express.static(dist, {
    setHeaders(res, file) {
      if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      else res.setHeader('Cache-Control', 'no-cache');
    },
  }),
);
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

const port = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => console.log(`SecondShelf on http://localhost:${port}`));
