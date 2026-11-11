import { daysLeft } from './dates.ts';

export type Urgency = 'expired' | 'urgent' | 'soon' | 'healthy';

/** Alert window: six weeks before the printed date. */
export const ALERT_DAYS = 42;
/** Inside two weeks the batch is urgent and can go to a food bank. */
export const URGENT_DAYS = 14;
/** A fire sale in the market typically recovers ~30% of the price. */
export const FIRE_SALE_SHARE = 0.3;

export function urgencyFor(days: number): Urgency {
  if (days <= 0) return 'expired';
  if (days <= URGENT_DAYS) return 'urgent';
  if (days <= ALERT_DAYS) return 'soon';
  return 'healthy';
}

/** "3 days", "1 day", "2 weeks", "Expired". Short enough for a badge. */
export function timeLeftLabel(days: number): string {
  if (days <= 0) return 'Expired';
  if (days < 14) return days === 1 ? '1 day' : `${days} days`;
  return `${Math.floor(days / 7)} weeks`;
}

/** Hard rule: nothing is listed, sold or donated on or after the expiry date. */
export function canTrade(expiry: string, ref?: string): boolean {
  return daysLeft(expiry, ref) > 0;
}

export function discountedPrice(price: number, discountPct: number): number {
  return Math.round((price * (100 - discountPct)) / 100 / 50) * 50;
}

/** Extra naira recovered versus dumping the stock at a market fire sale. */
export function recoveredVsFireSale(price: number, salePrice: number, qty: number): number {
  return Math.max(0, Math.round((salePrice - price * FIRE_SALE_SHARE) * qty));
}

export function suggestedDiscount(days: number): number {
  if (days <= 7) return 45;
  if (days <= 14) return 35;
  if (days <= 28) return 30;
  return 25;
}
