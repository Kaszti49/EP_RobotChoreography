import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initialUncertainty, propagateDrive, propagateTurn, propagatePrimitive, propagateSequence, lerpUncertainty,
} from '../core/uncertainty.js';
import { ERROR_MODEL, ZERO_ERROR_MODEL, OPS } from '../core/config.js';
import { compileShow } from '../core/compile.js';
import { loadExample } from './helpers.js';

test('constants are derived from the two measured figures', () => {
  assert.ok(Math.abs(ERROR_MODEL.k_drive - 0.1) < 1e-12, '10 cm per metre');
  assert.ok(Math.abs(ERROR_MODEL.k_turn - 20 / 1080) < 1e-12, '20 deg per three spins');
});

test('a 1 m drive with zero heading error adds exactly 100 mm', () => {
  const u = { r: 0, sigma_theta: 0 };
  const after = propagateDrive(u, 1000, { ...ERROR_MODEL, k_head_per_mm: 0 });
  assert.ok(Math.abs(after.r - 100) < 1e-9);
});

test('three full spins add 20 deg of heading error', () => {
  const u = { r: 0, sigma_theta: 0 };
  const after = propagateTurn(u, 1080);
  assert.ok(Math.abs(after.sigma_theta - 20) < 1e-9);
});

test('the d*tan(sigma) term turns heading error into position error on the next drive', () => {
  const noHeading = propagateDrive({ r: 0, sigma_theta: 0 }, 1000, ZERO_ERROR_MODEL);
  const withHeading = propagateDrive({ r: 0, sigma_theta: 10 }, 1000, ZERO_ERROR_MODEL);
  assert.equal(noHeading.r, 0);
  assert.ok(Math.abs(withHeading.r - 1000 * Math.tan(10 * Math.PI / 180)) < 1e-9);
});

test('errors add linearly (not in quadrature)', () => {
  const model = { ...ERROR_MODEL, k_head_per_mm: 0 };
  const u = propagateDrive(propagateDrive({ r: 0, sigma_theta: 0 }, 1000, model), 1000, model);
  assert.ok(Math.abs(u.r - 200) < 1e-9, 'two metres -> 200 mm, not 141');
});

test('tan term is clamped so a huge sigma cannot produce NaN or negative r', () => {
  const u = propagateDrive({ r: 0, sigma_theta: 95 }, 1000, ERROR_MODEL);
  assert.ok(Number.isFinite(u.r) && u.r > 0);
});

test('sign of the drive does not matter to the budget', () => {
  const a = propagatePrimitive({ r: 0, sigma_theta: 2 }, { op: OPS.FORWARD, value: 50 });
  const b = propagatePrimitive({ r: 0, sigma_theta: 2 }, { op: OPS.BACKWARD, value: 50 });
  assert.deepEqual(a, b);
});

test('zero model propagates nothing', () => {
  const u = propagateSequence(initialUncertainty(ZERO_ERROR_MODEL), [
    { op: OPS.FORWARD, value: 100 }, { op: OPS.LEFT, value: 720 }, { op: OPS.BACKWARD, value: 100 },
  ], ZERO_ERROR_MODEL);
  assert.deepEqual(u, { r: 0, sigma_theta: 0 });
});

test('lerpUncertainty interpolates and clamps', () => {
  const a = { r: 0, sigma_theta: 0 };
  const b = { r: 100, sigma_theta: 10 };
  assert.deepEqual(lerpUncertainty(a, b, 0.5), { r: 50, sigma_theta: 5 });
  assert.deepEqual(lerpUncertainty(a, b, 3), b);
});

test('monotonicity: r and sigma never decrease across any non-anchor beat of the example', () => {
  const compiled = compileShow(loadExample());
  for (const beat of compiled.beats) {
    if (beat.anchor) continue;
    for (const robot of compiled.robots) {
      const br = beat.robots[robot.id];
      let prev = br.uBefore;
      for (const p of br.primitives) {
        assert.ok(p.uAfter.r >= p.uBefore.r, `r decreased in beat ${beat.index} robot ${robot.id}`);
        assert.ok(p.uAfter.sigma_theta >= p.uBefore.sigma_theta);
        assert.deepEqual(p.uBefore, prev, 'chain is continuous');
        prev = p.uAfter;
      }
      assert.ok(br.uAfter.r >= br.uBefore.r);
    }
  }
});
