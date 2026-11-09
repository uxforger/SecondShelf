import test from 'node:test';
import assert from 'node:assert/strict';
import { avoidedCo2e, DRY_SHARE, transportFor, VAN_T_PER_KM } from './carbon.ts';

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test('one dry tonne with no transport', () => {
  close(avoidedCo2e({ netWeightKg: 1000, dryShare: 1 }), 2.285 * 0.88);
});

test('applies dry share, later waste and transport', () => {
  // 48 cartons of crackers, 3.6 kg each, 6.2 km by van
  const kg = 48 * 3.6;
  const expected = (kg / 1000) * 0.95 * 2.285 * 0.88 - 6.2 * VAN_T_PER_KM;
  close(avoidedCo2e({ netWeightKg: kg, dryShare: DRY_SHARE.crackers, transportT: transportFor(6.2) }), expected);
});

test('dry shares match the method sheet', () => {
  assert.equal(DRY_SHARE.crackers, 0.95);
  assert.equal(DRY_SHARE.biscuits, 0.95);
  assert.equal(DRY_SHARE.noodles, 0.94);
  assert.equal(DRY_SHARE.milk, 0.96);
  assert.equal(DRY_SHARE.drink, 0.12);
});

test('fruit drink counts only its dry share', () => {
  const t = avoidedCo2e({ netWeightKg: 1000, dryShare: DRY_SHARE.drink });
  close(t, 0.12 * 2.285 * 0.88);
});

test('never negative when transport outweighs the saving', () => {
  assert.equal(avoidedCo2e({ netWeightKg: 1, dryShare: 0.12, transportT: 5 }), 0);
});

test('zero or invalid weight gives zero', () => {
  assert.equal(avoidedCo2e({ netWeightKg: 0, dryShare: 0.95 }), 0);
  assert.equal(avoidedCo2e({ netWeightKg: -10, dryShare: 0.95 }), 0);
  assert.equal(avoidedCo2e({ netWeightKg: Number.NaN, dryShare: 0.95 }), 0);
});

test('transport scales with distance and ignores negatives', () => {
  close(transportFor(10), 10 * VAN_T_PER_KM);
  assert.equal(transportFor(-3), 0);
});
