import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDaysRemaining,
  getExpiryStatus,
  validateListingEligibility,
  calculateSuggestedMarkdown,
  calculateCapitalSavedVsFireSale,
  calculateVm0046Avoidance,
  formatNaira,
} from './expiryRules';

test('calculateDaysRemaining calculates correctly against reference date', () => {
  const refDate = '2026-11-06';
  const futureDate = '2026-11-20'; // 14 days
  const pastDate = '2026-11-01'; // -5 days
  
  assert.equal(calculateDaysRemaining(futureDate, refDate), 14);
  assert.equal(calculateDaysRemaining(pastDate, refDate), -5);
  assert.equal(calculateDaysRemaining('2026-11-06', refDate), 0);
});

test('getExpiryStatus categorizes correctly', () => {
  assert.equal(getExpiryStatus(-2), 'expired');
  assert.equal(getExpiryStatus(0), 'expired');
  assert.equal(getExpiryStatus(7), 'critical');
  assert.equal(getExpiryStatus(14), 'critical');
  assert.equal(getExpiryStatus(30), 'radar_warning');
  assert.equal(getExpiryStatus(42), 'radar_warning');
  assert.equal(getExpiryStatus(43), 'healthy');
  assert.equal(getExpiryStatus(90), 'healthy');
});

test('RULE 1: Expired stock is rejected from listing', () => {
  const expiredBatch = {
    expiryDate: '2026-11-01',
    quantity: 100,
    originalPackagingIntact: true,
  };
  const refDate = '2026-11-06';
  
  const result = validateListingEligibility(expiredBatch, refDate);
  assert.equal(result.eligible, false);
  assert.match(result.reason || '', /Expired food products can NEVER be listed/i);
});

test('RULE 1: Zero quantity is rejected', () => {
  const zeroQtyBatch = {
    expiryDate: '2026-12-15',
    quantity: 0,
    originalPackagingIntact: true,
  };
  const result = validateListingEligibility(zeroQtyBatch, '2026-11-06');
  assert.equal(result.eligible, false);
  assert.match(result.reason || '', /greater than zero/i);
});

test('RULE 1: Damaged packaging is rejected under anti-repackaging protection', () => {
  const tamperedBatch = {
    expiryDate: '2026-12-15',
    quantity: 50,
    originalPackagingIntact: false,
  };
  const result = validateListingEligibility(tamperedBatch, '2026-11-06');
  assert.equal(result.eligible, false);
  assert.match(result.reason || '', /Original batch packaging must be intact/i);
});

test('RULE 1: Valid batch within shelf-life is eligible', () => {
  const validBatch = {
    expiryDate: '2026-12-18', // 42 days from 2026-11-06
    quantity: 50,
    originalPackagingIntact: true,
  };
  const result = validateListingEligibility(validBatch, '2026-11-06');
  assert.equal(result.eligible, true);
  assert.equal(result.urgency, 'radar_warning');
});

test('calculateSuggestedMarkdown recommends 25-35% markdown in 6-week window', () => {
  assert.equal(calculateSuggestedMarkdown(40), 25);
  assert.equal(calculateSuggestedMarkdown(25), 30);
  assert.equal(calculateSuggestedMarkdown(10), 40);
  assert.equal(calculateSuggestedMarkdown(5), 55);
});

test('calculateCapitalSavedVsFireSale computes margin advantage over open market fire sale', () => {
  // 100 packs: retail ₦10,000, SecondShelf price ₦7,500. Fire sale gives 30% = ₦3,000.
  // Advantage: ₦7,500 - ₦3,000 = ₦4,500 * 100 = ₦450,000.
  const capitalSaved = calculateCapitalSavedVsFireSale(10000, 7500, 100);
  assert.equal(capitalSaved, 450000);
});

test('calculateVm0046Avoidance calculates potential CO2e and marks unverified per brand guidelines', () => {
  const result = calculateVm0046Avoidance(1000, 'Packaged Foods & Biscuits');
  assert.equal(result.tonnesCo2e, 1.9);
  assert.equal(result.isVerified, false);
  assert.match(result.label, /UNVERIFIED \/ METHODOLOGY TO INVESTIGATE/);
});

test('formatNaira formats currency with Naira sign', () => {
  const formatted = formatNaira(150000);
  assert.match(formatted, /150,000/);
});
