import { useEffect, useRef } from 'react';
import { api, type Activity, type Db, type Session } from './api';
import { today } from './dates';
import { timeLeftLabel } from './expiry';
import { naira } from './format';
import { haptic } from './haptics';
import { navigate, useRoute } from './router';
import { atRisk, business, product, viewOf } from './selectors';
import { banner, requestOpenBatch, useDb } from './store';

const ALERTED_KEY = 'secondshelf_expiry_alerted';

/**
 * Turns what happens on other devices into banners on this one, and
 * alerts the distributor to stock entering the six-week window.
 */
export function useLiveAlerts(session: Session) {
  const db = useDb();
  const route = useRoute();
  const seen = useRef<Set<string> | null>(null);
  const routeRef = useRef(route.path);
  routeRef.current = route.path;

  // New events → banners.
  useEffect(() => {
    if (!seen.current) {
      seen.current = new Set(db.activity.map((a) => a.id));
      return;
    }
    const fresh = db.activity.filter((a) => !seen.current!.has(a.id)).reverse();
    for (const a of fresh) {
      seen.current.add(a.id);
      announce(db, a, session, routeRef.current);
    }
  }, [db, session]);

  // Opening alert: "this is what to sell today". Once per sign-in.
  useEffect(() => {
    if (session.role !== 'distributor') return;
    let already = false;
    try {
      already = sessionStorage.getItem(ALERTED_KEY) === session.businessId;
    } catch {
      /* ignore */
    }
    if (already) return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(ALERTED_KEY, session.businessId);
      } catch {
        /* ignore */
      }
      const risk = atRisk(api.getSnapshot(), session.businessId, today());
      const top = risk.items[0];
      if (!top) return;
      banner({
        icon: 'alert',
        title: `${top.product.name} · ${timeLeftLabel(top.days)} left`,
        detail: `${naira(risk.value)} at risk · tap to list`,
        open: () => openForListing(top.batch.id),
      });
    }, 900);
    return () => window.clearTimeout(t);
    // run once per session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.businessId]);
}

export function clearExpiryAlertFlag() {
  try {
    sessionStorage.removeItem(ALERTED_KEY);
  } catch {
    /* ignore */
  }
}

function openForListing(batchId: string) {
  navigate(`/batch/${batchId}`);
  requestOpenBatch(batchId, 'list');
}

function announce(db: Db, a: Activity, session: Session, path: string) {
  const b = a.batchId ? db.batches.find((x) => x.id === a.batchId) : undefined;
  const v = b ? viewOf(db, b, today()) : null;
  const o = a.orderId ? db.orders.find((x) => x.id === a.orderId) : undefined;

  if (session.role === 'buyer') {
    if (a.kind === 'listed' && a.title.startsWith('Listed') && v?.batch.listing) {
      banner({
        icon: 'listed',
        title: `New near you · ${v.product.name}`,
        detail: `${naira(v.batch.listing.unitPrice)} (was ${naira(v.product.price)}) · ${timeLeftLabel(v.days)} left`,
        open: () => navigate(`/shop/${v.batch.id}`),
      });
    }
    if (a.kind === 'handed_over' && o?.buyerId === session.businessId) {
      haptic();
      if (path !== `/orders/${o.id}`) {
        banner({ icon: 'handed_over', title: 'Handed over', detail: `${o.ref} · ${naira(o.total)}`, open: () => navigate(`/orders/${o.id}`, { tab: true }) });
      }
    }
    return;
  }

  if (session.role === 'distributor') {
    if (a.kind === 'paid' && o?.sellerId === session.businessId) {
      banner({
        icon: 'paid',
        title: `${business(db, o.buyerId)?.name ?? 'Buyer'} paid`,
        detail: `${naira(o.total)} · ${product(db, o.productId)?.name} · ${o.qty} cartons`,
        open: () => navigate('/sales', { tab: true }),
      });
    }
    // Something just scanned in that is already inside the window.
    // Not on the phone that just scanned it: its batch page already leads with "List it".
    if (a.kind === 'added' && v && v.days > 0 && v.days <= 42 && !path.startsWith('/scan') && path !== `/batch/${v.batch.id}`) {
      banner({
        icon: 'alert',
        title: `${v.product.name} · ${timeLeftLabel(v.days)} left`,
        detail: `${naira(v.batch.quantity * v.product.price)} at risk · tap to list`,
        open: () => openForListing(v.batch.id),
      });
    }
    return;
  }

  if (session.role === 'foodbank' && a.kind === 'donated' && v?.batch.donation) {
    banner({
      icon: 'pickup',
      title: `New pickup · ${v.product.name}`,
      detail: `${v.batch.donation.qty} cartons · ${business(db, v.batch.sellerId)?.name} · use by ${timeLeftLabel(v.days)}`,
      open: () => navigate('/pickups', { tab: true }),
    });
  }
}
