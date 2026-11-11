/**
 * One short tick, used only for moments that matter:
 * a successful scan, a confirmed payment, a confirmed handover.
 */
export function haptic() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
  } catch {
    /* unsupported: no-op */
  }
}
