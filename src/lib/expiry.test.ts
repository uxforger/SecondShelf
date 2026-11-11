import test from 'node:test';
import assert from 'node:assert/strict';
import { canTrade, discountedPrice, recoveredVsFireSale, timeLeftLabel, urgencyFor } from './expiry.ts';
import { addDays, daysBetween, isValidDay } from './dates.ts';

test('urgency bands', () => {
  assert.equal(urgencyFor(-1), 'expired');
  assert.equal(urgencyFor(0), 'expired');
  assert.equal(urgencyFor(1), 'urgent');
  assert.equal(urgencyFor(14), 'urgent');
  assert.equal(urgencyFor(15), 'soon');
  assert.equal(urgencyFor(42), 'soon');
  assert.equal(urgencyFor(43), 'healthy');
});

test('badge labels are short and use words', () => {
  assert.equal(timeLeftLabel(0), 'Expired');
  assert.equal(timeLeftLabel(1), '1 day');
  assert.equal(timeLeftLabel(3), '3 days');
  assert.equal(timeLeftLabel(14), '2 weeks');
  assert.equal(timeLeftLabel(42), '6 weeks');
});

test('nothing trades on or after the expiry date', () => {
  const ref = '2026-11-09';
  assert.equal(canTrade('2026-11-08', ref), false);
  assert.equal(canTrade('2026-11-09', ref), false);
  assert.equal(canTrade('2026-11-10', ref), true);
});

test('discounted price rounds to ₦50', () => {
  assert.equal(discountedPrice(2600, 25), 1950);
  assert.equal(discountedPrice(9800, 30), 6850);
});

test('recovered versus fire sale', () => {
  // 1,950 − 30% of 2,600 = 1,170 per carton
  assert.equal(recoveredVsFireSale(2600, 1950, 10), 11700);
  assert.equal(recoveredVsFireSale(1000, 100, 10), 0);
});

test('calendar helpers', () => {
  assert.equal(addDays('2026-12-30', 3), '2027-01-02');
  assert.equal(daysBetween('2026-11-09', '2026-12-21'), 42);
  assert.equal(isValidDay('2026-02-30'), false);
  assert.equal(isValidDay('2026-02-28'), true);
});
