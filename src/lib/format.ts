const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** ₦185,250 */
export function naira(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}₦${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
}

/** ₦1.2m, ₦185k, ₦950 for tight spaces. */
export function nairaShort(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `₦${(n / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}m`;
  if (a >= 10_000) return `₦${Math.round(n / 1000)}k`;
  return naira(n);
}

/** "8 Dec" from "YYYY-MM-DD" or ISO. */
export function shortDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return value;
  return `${d} ${MONTHS[m - 1]}`;
}

/** "14:05" */
export function clock(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "Just now", "5 min", "2 h", "8 Dec" */
export function ago(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return shortDate(iso);
}

/** 840 kg, 1.9 t */
export function weight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${Math.round(kg).toLocaleString('en-US')} kg`;
}

export function tonnes(t: number, digits = 1): string {
  return `${t.toFixed(digits)} t`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
}
