import { useSyncExternalStore } from 'react';

/**
 * Is the server talking to the real bank sandbox, or the built-in mock
 * (local demo mode, no team key)? Read once from the existing /api/info.
 * Until it answers we assume the sandbox, which is what deployments run.
 */
let simulated = false;
const listeners = new Set<() => void>();

void fetch('/api/info', { cache: 'no-store' })
  .then((r) => (r.ok ? r.json() : null))
  .then((info: { bank?: string; demo?: boolean } | null) => {
    if (!info) return;
    const next = info.demo === true || info.bank === 'mock';
    if (next !== simulated) {
      simulated = next;
      listeners.forEach((l) => l());
    }
  })
  .catch(() => {});

/** True when every bank and registry step is simulated (demo mode). */
export function useSimulatedBank(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => simulated,
    () => simulated,
  );
}
