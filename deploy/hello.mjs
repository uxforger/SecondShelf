// Smoke test for the deploy pipeline: proves image build, pull, Service and
// public route work before the real app goes out.
import http from 'node:http';

const port = Number(process.env.PORT) || 8080;
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SecondShelf</title><style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#0b3b2e;color:#fff;font-family:system-ui,sans-serif}
p{color:#f5b528}</style></head><body><main><h1>SecondShelf</h1><p>Pipeline check: hello from team19.</p></main></body></html>`;

http
  .createServer((req, res) => {
    if (req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end('{"ok":true}');
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(page);
  })
  .listen(port, '0.0.0.0', () => console.log(`hello on :${port}`));
