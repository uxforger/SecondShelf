import { useSyncExternalStore } from 'react';
import { api, type Role, type Session } from './api/index.ts';

/* ---------------- Data ---------------- */

export function useDb() {
  return useSyncExternalStore(api.subscribe, api.getSnapshot, api.getSnapshot);
}

/* ---------------- Tiny external store helper ---------------- */

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next: T) {
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/* ---------------- Session (per device) ---------------- */

const SESSION_KEY = 'secondshelf_session';

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

const sessionStore = createStore<Session | null>(loadSession());

export function useSession() {
  return useStore(sessionStore);
}

export function setSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  if (!s) {
    try {
      sessionStorage.removeItem('secondshelf_expiry_alerted');
    } catch {
      /* ignore */
    }
  }
  sessionStore.set(s);
}

export function lastRole(): Role {
  try {
    return (localStorage.getItem('secondshelf_last_role') as Role) || 'distributor';
  } catch {
    return 'distributor';
  }
}

export function rememberRole(role: Role) {
  try {
    localStorage.setItem('secondshelf_last_role', role);
  } catch {
    /* ignore */
  }
}

/* ---------------- Toasts ---------------- */

export interface Toast {
  id: number;
  text: string;
  tone: 'neutral' | 'success' | 'error';
  action?: { label: string; run: () => void };
}

const toastStore = createStore<Toast[]>([]);
let toastId = 0;

export function toast(text: string, tone: Toast['tone'] = 'neutral', action?: Toast['action']) {
  const t = { id: ++toastId, text, tone, action };
  toastStore.set([...toastStore.get().slice(-2), t]);
  setTimeout(() => dismissToast(t.id), action ? 5000 : tone === 'error' ? 4200 : 2800);
}

export function dismissToast(id: number) {
  toastStore.set(toastStore.get().filter((t) => t.id !== id));
}

export function useToasts() {
  return useStore(toastStore);
}

/* ---------------- Highlight (new row flashes mint) ---------------- */

const highlightStore = createStore<string | null>(null);

export function highlight(id: string) {
  highlightStore.set(id);
  setTimeout(() => {
    if (highlightStore.get() === id) highlightStore.set(null);
  }, 2200);
}

export function useHighlight() {
  return useStore(highlightStore);
}

/* ---------------- Banners (live alerts from other devices) ---------------- */

export interface Banner {
  id: number;
  title: string;
  detail?: string;
  icon: 'alert' | 'listed' | 'paid' | 'handed_over' | 'pickup';
  /** Tapping the banner runs this. */
  open?: () => void;
}

const bannerStore = createStore<Banner[]>([]);
let bannerId = 0;

export function banner(b: Omit<Banner, 'id'>) {
  const item = { ...b, id: ++bannerId };
  bannerStore.set([item, ...bannerStore.get()].slice(0, 2));
  setTimeout(() => dismissBanner(item.id), 6000);
}

export function dismissBanner(id: number) {
  bannerStore.set(bannerStore.get().filter((b) => b.id !== id));
}

export function useBanners() {
  return useStore(bannerStore);
}

/* ---------------- Open a batch from anywhere (e.g. an alert) ---------------- */

const openRequest = createStore<{ batchId: string; mode: 'detail' | 'list'; n: number } | null>(null);
let openN = 0;

export function requestOpenBatch(batchId: string, mode: 'detail' | 'list' = 'detail') {
  openRequest.set({ batchId, mode, n: ++openN });
}

export function useOpenRequest() {
  return useStore(openRequest);
}

export function clearOpenRequest() {
  openRequest.set(null);
}
