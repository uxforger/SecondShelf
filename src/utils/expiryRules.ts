import { ExpiryUrgency, InventoryBatch, ProductCategory } from '../types';

/**
 * Baseline date helper. Defaults to today's date in Lagos / local system.
 */
export function calculateDaysRemaining(expiryDateStr: string, referenceDateStr?: string): number {
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  // Normalize both dates to midnight UTC to compare cleanly
  const expiry = new Date(expiryDateStr);
  
  const refUtc = Date.UTC(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const expUtc = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  
  const diffMs = expUtc - refUtc;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Expiry classification for SecondShelf:
 * - <= 0 days: Expired (CRITICAL RULE 1: Never sell or donate)
 * - 1 to 14 days: Critical Urgency (Emergency recovery or steep clearance)
 * - 15 to 42 days (6 weeks): Smart Expiry Radar Alert (Optimal 20-35% markdown)
 * - > 42 days: Healthy Stock
 */
export function getExpiryStatus(daysRemaining: number): ExpiryUrgency {
  if (daysRemaining <= 0) {
    return 'expired';
  }
  if (daysRemaining <= 14) {
    return 'critical';
  }
  if (daysRemaining <= 42) {
    return 'radar_warning';
  }
  return 'healthy';
}

/**
 * RULE 1 — EXPIRY ELIGIBILITY
 * Expired food products can NEVER be listed, sold, or donated under any circumstance.
 */
export function validateListingEligibility(batch: Pick<InventoryBatch, 'expiryDate' | 'quantity' | 'originalPackagingIntact'>, referenceDate?: string): {
  eligible: boolean;
  reason?: string;
  daysRemaining: number;
  urgency: ExpiryUrgency;
} {
  const daysRemaining = calculateDaysRemaining(batch.expiryDate, referenceDate);
  const urgency = getExpiryStatus(daysRemaining);

  if (daysRemaining <= 0) {
    return {
      eligible: false,
      reason: 'Expired food products can NEVER be listed or traded under SecondShelf food safety rules.',
      daysRemaining,
      urgency,
    };
  }

  if (batch.quantity <= 0) {
    return {
      eligible: false,
      reason: 'Available batch quantity must be greater than zero.',
      daysRemaining,
      urgency,
    };
  }

  if (!batch.originalPackagingIntact) {
    return {
      eligible: false,
      reason: 'Anti-repackaging protection: Original batch packaging must be intact to prevent adulteration.',
      daysRemaining,
      urgency,
    };
  }

  return {
    eligible: true,
    daysRemaining,
    urgency,
  };
}

/**
 * Suggested early markdown based on 6-week radar to prevent severe fire-sale losses
 */
export function calculateSuggestedMarkdown(daysRemaining: number): number {
  if (daysRemaining <= 0) return 0; // cannot sell
  if (daysRemaining <= 7) return 55; // Last resort commercial clearance
  if (daysRemaining <= 14) return 40; // 2 weeks remaining
  if (daysRemaining <= 28) return 30; // 4 weeks remaining
  if (daysRemaining <= 42) return 25; // 6-week radar threshold
  return 15; // Healthy proactive clearance
}

/**
 * Calculates capital recovered versus informal open market fire-sale (which typically yields ~69% loss)
 */
export function calculateCapitalSavedVsFireSale(
  standardRetailPrice: number,
  secondShelfPrice: number,
  quantity: number
): number {
  // Fire-sale typically recovers only 30% of original value (70% loss)
  const fireSaleRecoveryPerUnit = standardRetailPrice * 0.30;
  const secondShelfRecoveryPerUnit = secondShelfPrice;
  const differencePerUnit = Math.max(0, secondShelfRecoveryPerUnit - fireSaleRecoveryPerUnit);
  return Math.round(differencePerUnit * quantity);
}

/**
 * Potential Climate Assessment (VM0046 calculation):
 * Benchmark factor: ~1.9 t CO2e avoided per dry tonne of food diverted from dumpsites.
 * Per Brand Guidelines: Must explicitly display "UNVERIFIED / METHODOLOGY TO INVESTIGATE".
 */
export function calculateVm0046Avoidance(weightKg: number, category: ProductCategory): {
  tonnesCo2e: number;
  label: string;
  isVerified: boolean;
} {
  const metricTonnes = weightKg / 1000;
  // Specific category weighting factors
  let emissionFactor = 1.9; // default dry goods factor
  if (category === 'Dairy & Beverages') {
    emissionFactor = 2.4;
  } else if (category === 'Cooking Oils & Seasoning') {
    emissionFactor = 1.6;
  }
  
  const tonnesCo2e = Number((metricTonnes * emissionFactor).toFixed(2));

  return {
    tonnesCo2e,
    label: 'STATUS: UNVERIFIED / METHODOLOGY TO INVESTIGATE (VM0046)',
    isVerified: false,
  };
}

/**
 * Format Nigerian Naira currency string
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦');
}
