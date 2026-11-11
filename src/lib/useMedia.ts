import { useSyncExternalStore } from 'react';

export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** ≥ 1024px: sidebar, grid dashboard, side panels. */
export const useDesktop = () => useMedia('(min-width: 1024px)');
