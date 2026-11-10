import { useSyncExternalStore } from 'react';

/**
 * Minimal hash router. Keeps a depth counter in history.state so a back
 * gesture or button can play the page transition in reverse.
 */

export interface RouteState {
  path: string;
  /** 1 forward, -1 back, 0 tab switch / replace */
  dir: number;
  key: number;
}

// Coming back from the bank's hosted checkout: /pay/return?reference=SS-123&status=...
// becomes the in-app route #/pay/SS-123, which always verifies with the bank.
if (window.location.pathname === '/pay/return') {
  const ref = new URLSearchParams(window.location.search).get('reference') ?? '';
  history.replaceState(null, '', `/#/pay/${encodeURIComponent(ref)}`);
}
// Carbon credit buyer back from checkout: verify, then retire.
if (window.location.pathname === '/carbon/return') {
  const ref = new URLSearchParams(window.location.search).get('reference') ?? '';
  history.replaceState(null, '', `/#/carbon/paid/${encodeURIComponent(ref)}`);
}

let depth = (history.state?.depth as number | undefined) ?? 0;
let state: RouteState = { path: readPath(), dir: 0, key: 0 };
const listeners = new Set<() => void>();

function readPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/';
}

function update(dir: number) {
  state = { path: readPath(), dir, key: state.key + 1 };
  listeners.forEach((l) => l());
}

window.addEventListener('popstate', (e) => {
  const next = (e.state?.depth as number | undefined) ?? 0;
  const dir = next < depth ? -1 : next > depth ? 1 : 0;
  depth = next;
  update(dir);
});

if (history.state?.depth === undefined) history.replaceState({ depth }, '', window.location.href);

export function navigate(path: string, opts: { replace?: boolean; tab?: boolean; back?: boolean } = {}) {
  if (path === state.path) return;
  const url = `#${path}`;
  if (opts.replace) history.replaceState({ depth }, '', url);
  else {
    depth += 1;
    history.pushState({ depth }, '', url);
  }
  update(opts.tab || opts.replace ? 0 : opts.back ? -1 : 1);
}

/** Go back if there is somewhere to go, otherwise replace with `fallback`. */
export function goBack(fallback: string) {
  if (depth > 0) history.back();
  else {
    history.replaceState({ depth }, '', `#${fallback}`);
    update(-1);
  }
}

export function useRoute(): RouteState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

/** Match "/shop/:id" style patterns. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const a = path.split('?')[0].split('/').filter(Boolean);
  if (p.length !== a.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}
