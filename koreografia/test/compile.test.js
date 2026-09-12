import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileShow, compileGoto, CompileError, primitivesOf } from '../core/compile.js';
import { makePose, posesClose, applySequence } from '../core/pose.js';
import { makeConfig, ZERO_ERROR_MODEL, OPS } from '../core/config.js';
import { tinyShow, loadExample, clone } from './helpers.js';

const ops = (prims) => prims.map((p) => [p.op, p.value]);

test('goto compiles to turn -> drive -> turn', () => {
  const prims = compileGoto(makePose(0, 0, 0), { type: 'goto', x: 0, y: 1000, face: 0 });
  assert.deepEqual(ops(prims), [[OPS.LEFT, 90], [OPS.FORWARD, 100], [OPS.RIGHT, 90]]);
});

test('goto without face skips the final rotation', () => {
  const prims = compileGoto(makePose(0, 0, 0), { type: 'goto', x: 0, y: 1000 });
  assert.deepEqual(ops(prims), [[OPS.LEFT, 90], [OPS.FORWARD, 100]]);
});

test('goto already facing the target emits only the drive', () => {
  const prims = compileGoto(makePose(0, 0, 90), { type: 'goto', x: 0, y: 500 });
  assert.deepEqual(ops(prims), [[OPS.FORWARD, 50]]);
});

test('heading normalisation: a 350 deg change is a 10 deg turn the other way', () => {
  // from heading 0 to face 350: delta = 350 -> -10 -> jobbra 10
  const prims = compileGoto(makePose(0, 0, 0), { type: 'goto', x: 0, y: 0, face: 350 });
  assert.deepEqual(ops(prims), [[OPS.RIGHT, 10]]);
  // and the mirror
  const prims2 = compileGoto(makePose(0, 0, 350), { type: 'goto', x: 0, y: 0, face: 0 });
  assert.deepEqual(ops(prims2), [[OPS.LEFT, 10]]);
  for (const p of [...prims, ...prims2]) assert.ok(p.value < 180, 'never a turn of 180 or more via normalisation');
});

test('goto to the current position with a face only turns (no phantom heading from float noise)', () => {
  // after driving along 90 deg, x carries cos(90deg)*d ~ 1e-14 of noise
  const pose = applySequence(makePose(500, 400, 90), [{ op: OPS.FORWARD, value: 85 }]);
  const prims = compileGoto(pose, { type: 'goto', x: 500, y: 1250, face: 270 });
  assert.deepEqual(ops(prims), [[OPS.LEFT, 180]]);
});

test('reverse driving is off by default and only used when it saves rotation', () => {
  const pose = makePose(0, 0, 0);
  const behind = { type: 'goto', x: -1000, y: 0, face: 0 };
  const forwardOnly = compileGoto(pose, behind);
  // exactly 180 is ambiguous; normalizeAngle picks +180 -> balra, deterministically
  assert.deepEqual(ops(forwardOnly), [[OPS.LEFT, 180], [OPS.FORWARD, 100], [OPS.LEFT, 180]]);

  const reverse = compileGoto(pose, behind, makeConfig({ compiler: { allow_reverse: true } }).compiler);
  assert.deepEqual(ops(reverse), [[OPS.BACKWARD, 100]]);

  // a target ahead never triggers reverse even when allowed
  const ahead = compileGoto(pose, { type: 'goto', x: 1000, y: 0 }, makeConfig({ compiler: { allow_reverse: true } }).compiler);
  assert.deepEqual(ops(ahead), [[OPS.FORWARD, 100]]);
});

test('values are quantised to 0.1 cm / 0.1 deg and the simulated pose uses the quantised value', () => {
  const show = tinyShow([{ name: 'b', duration_ms: 5000, moves: { 1: { type: 'goto', x: 1333.33, y: 1000 } } }]);
  const c = compileShow(show);
  const prim = c.beats[0].robots[1].primitives[0];
  assert.equal(prim.value, 33.3);
  assert.ok(Math.abs(prim.poseAfter.x - 1333) < 1e-9, 'pose reflects 33.3 cm, not 33.333');
});

test('primitive moves are passed through, porog_fok sign is folded into balra/jobbra', () => {
  const show = tinyShow([
    { name: 'a', duration_ms: 3000, moves: { 1: { type: 'primitive', op: 'porog_fok', value: 90 } } },
    { name: 'b', duration_ms: 3000, moves: { 1: { type: 'primitive', op: 'porog_fok', value: -90 } } },
    { name: 'c', duration_ms: 3000, moves: { 1: { type: 'primitive', op: 'hatra_cm', value: 20 } } },
  ]);
  const c = compileShow(show);
  assert.deepEqual(ops(c.beats[0].robots[1].primitives), [[OPS.RIGHT, 90]]);
  assert.deepEqual(ops(c.beats[1].robots[1].primitives), [[OPS.LEFT, 90]]);
  assert.deepEqual(ops(c.beats[2].robots[1].primitives), [[OPS.BACKWARD, 20]]);
  assert.ok(posesClose(c.beats[2].robots[1].poseAfter, makePose(800, 1000, 0), 1e-9));
});

test('hold and missing moves leave the pose alone', () => {
  const show = tinyShow([
    { name: 'a', duration_ms: 1000, moves: { 1: { type: 'hold' } } },
    { name: 'b', duration_ms: 1000, moves: {} },
  ]);
  const c = compileShow(show);
  assert.equal(c.beats[0].robots[1].primitives.length, 0);
  assert.equal(c.beats[1].robots[1].primitives.length, 0);
  assert.deepEqual(c.beats[1].robots[1].poseAfter, c.robots[0].start);
});

test('closed-loop identity: a 100 cm square with zero error returns to the exact start pose', () => {
  const start = { x: 1000, y: 1000, theta: 0 };
  const beats = [];
  for (let i = 0; i < 4; i++) {
    beats.push({ name: `side${i}`, duration_ms: 9000, moves: { 1: { type: 'primitive', op: 'elore_cm', value: 100 } } });
    beats.push({ name: `turn${i}`, duration_ms: 3000, moves: { 1: { type: 'primitive', op: 'balra_fok', value: 90 } } });
  }
  const c = compileShow(tinyShow(beats, start), makeConfig({ error: ZERO_ERROR_MODEL }));
  const last = c.beats[c.beats.length - 1].robots[1];
  assert.ok(posesClose(last.poseAfter, makePose(start.x, start.y, start.theta), 1e-9, 1e-9),
    `ended at ${JSON.stringify(last.poseAfter)}`);
  assert.deepEqual(last.uAfter, { r: 0, sigma_theta: 0 });

  // the same square expressed as gotos
  const gotoBeats = [
    { name: 'a', duration_ms: 9000, moves: { 1: { type: 'goto', x: 2000, y: 1000 } } },
    { name: 'b', duration_ms: 9000, moves: { 1: { type: 'goto', x: 2000, y: 2000 } } },
    { name: 'c', duration_ms: 9000, moves: { 1: { type: 'goto', x: 1000, y: 2000 } } },
    { name: 'd', duration_ms: 9000, moves: { 1: { type: 'goto', x: 1000, y: 1000, face: 0 } } },
  ];
  const g = compileShow(tinyShow(gotoBeats, start), makeConfig({ error: ZERO_ERROR_MODEL }));
  const gl = g.beats[3].robots[1];
  assert.ok(posesClose(gl.poseAfter, makePose(start.x, start.y, start.theta), 1e-9, 1e-9));
  assert.deepEqual(ops(primitivesOf(g, 1)), [
    [OPS.FORWARD, 100], [OPS.LEFT, 90], [OPS.FORWARD, 100], [OPS.LEFT, 90],
    [OPS.FORWARD, 100], [OPS.LEFT, 90], [OPS.FORWARD, 100], [OPS.LEFT, 90],
  ]);
});

test('anchor beat resets the uncertainty to the placement error', () => {
  const show = tinyShow([
    { name: 'go', duration_ms: 9000, moves: { 1: { type: 'primitive', op: 'elore_cm', value: 100 } } },
    { name: 'anchor', duration_ms: 5000, anchor: true, moves: {} },
  ]);
  const c = compileShow(show);
  assert.ok(c.beats[0].robots[1].uAfter.r > 100);
  assert.equal(c.beats[1].robots[1].uAfter.r, c.config.error.initial_r_mm);
});

test('structural errors name the beat and robot', () => {
  const bad = clone(loadExample());
  bad.beats[2].moves['9'] = { type: 'hold' };
  assert.throws(() => compileShow(bad), (e) => e instanceof CompileError && e.beat === 2 && e.robot === 9);

  const badType = clone(loadExample());
  badType.beats[1].moves['3'] = { type: 'teleport' };
  assert.throws(() => compileShow(badType), (e) => e instanceof CompileError && e.beat === 1 && e.robot === 3);

  const badOp = clone(loadExample());
  badOp.beats[0].moves['1'] = { type: 'primitive', op: 'kanyar', value: 1 };
  assert.throws(() => compileShow(badOp), /unknown primitive op "kanyar"/);

  const negative = clone(loadExample());
  negative.beats[0].moves['1'] = { type: 'primitive', op: 'elore_cm', value: -5 };
  assert.throws(() => compileShow(negative), /non-negative/);

  const badDuration = clone(loadExample());
  badDuration.beats[0].duration_ms = 0;
  assert.throws(() => compileShow(badDuration), /duration_ms/);
});

test('compiled output is frozen (immutable)', () => {
  const c = compileShow(loadExample());
  assert.ok(Object.isFrozen(c));
  assert.ok(Object.isFrozen(c.beats[0]));
  assert.ok(Object.isFrozen(c.beats[0].robots[1].primitives[0]));
});
