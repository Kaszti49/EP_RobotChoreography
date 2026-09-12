import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAngle, makePose, headingTo, deltaHeading, turnPrimitive, drivePrimitive,
  applyPrimitive, applySequence, interpolatePrimitive, posesClose,
} from '../core/pose.js';
import { OPS } from '../core/config.js';

test('normalizeAngle maps into (-180, 180]', () => {
  assert.equal(normalizeAngle(0), 0);
  assert.equal(normalizeAngle(180), 180);
  assert.equal(normalizeAngle(-180), 180);
  assert.equal(normalizeAngle(190), -170);
  assert.equal(normalizeAngle(-190), 170);
  assert.equal(normalizeAngle(360), 0);
  assert.equal(normalizeAngle(725), 5);
  assert.equal(normalizeAngle(-725), -5);
  assert.ok(!Object.is(normalizeAngle(-360), -0), 'no negative zero');
});

test('heading convention: 0 = +X, 90 = +Y (CCW positive)', () => {
  const o = makePose(0, 0, 0);
  assert.equal(headingTo(o, { x: 10, y: 0 }), 0);
  assert.equal(headingTo(o, { x: 0, y: 10 }), 90);
  assert.equal(headingTo(o, { x: -10, y: 0 }), 180);
  assert.equal(headingTo(o, { x: 0, y: -10 }), -90);
});

test('deltaHeading takes the short way round', () => {
  assert.equal(deltaHeading(10, 350), -20);
  assert.equal(deltaHeading(350, 10), 20);
  assert.equal(deltaHeading(0, 180), 180);
});

test('turnPrimitive: positive delta -> balra_fok, negative -> jobbra_fok, values positive', () => {
  assert.deepEqual(turnPrimitive(30), { op: OPS.LEFT, value: 30 });
  assert.deepEqual(turnPrimitive(-30), { op: OPS.RIGHT, value: 30 });
  assert.deepEqual(turnPrimitive(350), { op: OPS.RIGHT, value: 10 }, '350 deg becomes 10 deg the other way');
  assert.equal(turnPrimitive(0), null);
  assert.equal(turnPrimitive(0.05, 0.1), null);
});

test('drivePrimitive converts mm to cm and drops sub-threshold moves', () => {
  assert.deepEqual(drivePrimitive(1234), { op: OPS.FORWARD, value: 123.4 });
  assert.deepEqual(drivePrimitive(500, true), { op: OPS.BACKWARD, value: 50 });
  assert.equal(drivePrimitive(0.5, false, 0.1), null);
});

test('applyPrimitive: elore along heading, hatra against it, turns rotate in place', () => {
  const p = makePose(100, 200, 90);
  const fwd = applyPrimitive(p, { op: OPS.FORWARD, value: 10 });
  assert.ok(posesClose(fwd, makePose(100, 300, 90), 1e-9));
  const back = applyPrimitive(p, { op: OPS.BACKWARD, value: 10 });
  assert.ok(posesClose(back, makePose(100, 100, 90), 1e-9));
  const left = applyPrimitive(p, { op: OPS.LEFT, value: 45 });
  assert.ok(posesClose(left, makePose(100, 200, 135)));
  const right = applyPrimitive(p, { op: OPS.RIGHT, value: 135 });
  assert.ok(posesClose(right, makePose(100, 200, -45)));
});

test('interpolatePrimitive is linear and clamps', () => {
  const p = makePose(0, 0, 0);
  const half = interpolatePrimitive(p, { op: OPS.FORWARD, value: 100 }, 0.5);
  assert.ok(posesClose(half, makePose(500, 0, 0), 1e-9));
  const over = interpolatePrimitive(p, { op: OPS.LEFT, value: 90 }, 2);
  assert.equal(over.theta, 90);
  const under = interpolatePrimitive(p, { op: OPS.LEFT, value: 90 }, -1);
  assert.equal(under.theta, 0);
});

test('applySequence composes', () => {
  const p = makePose(0, 0, 0);
  const seq = [
    { op: OPS.FORWARD, value: 100 },
    { op: OPS.LEFT, value: 90 },
    { op: OPS.FORWARD, value: 100 },
  ];
  assert.ok(posesClose(applySequence(p, seq), makePose(1000, 1000, 90), 1e-9));
});
