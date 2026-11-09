/**
 * Avoided emissions for food diverted from disposal (VM0046 approach).
 *
 *   tCO2e = netWeightTonnes × dryShare × 2.285 × (1 − 0.12) − transport
 *
 * 2.285  t CO2e per dry tonne kept out of disposal
 * 0.12   share assumed wasted later by the buyer
 * transport is subtracted for the trip that moves the stock
 */

export const EMISSION_FACTOR = 2.285;
export const LATER_WASTE = 0.12;
/** Light van, one way, per km (t CO2e). */
export const VAN_T_PER_KM = 0.00025;

export type FoodType = 'crackers' | 'biscuits' | 'noodles' | 'milk' | 'drink';

export const DRY_SHARE: Record<FoodType, number> = {
  crackers: 0.95,
  biscuits: 0.95,
  noodles: 0.94,
  milk: 0.96,
  drink: 0.12,
};

export interface CarbonInput {
  netWeightKg: number;
  dryShare: number;
  /** Transport emissions for this movement, t CO2e. */
  transportT?: number;
}

/** Pure. Never negative. Returns tonnes CO2e. */
export function avoidedCo2e({ netWeightKg, dryShare, transportT = 0 }: CarbonInput): number {
  if (!(netWeightKg > 0) || !(dryShare > 0)) return 0;
  const tonnes = netWeightKg / 1000;
  const gross = tonnes * dryShare * EMISSION_FACTOR * (1 - LATER_WASTE);
  return Math.max(0, gross - Math.max(0, transportT));
}

export function transportFor(distanceKm: number): number {
  return Math.max(0, distanceKm) * VAN_T_PER_KM;
}
