// =====================================================================
//  THE SIGN ROUND-TRIP TEST -- the most important test in the suite.
//
//  Emit the Arduino code, parse it back, and re-simulate it with an
//  INDEPENDENT model of the robot written from block 5 of
//  SHOW_robot1.txt (porog_fok: positive = CLOCKWISE), not from pose.js.
//  If the compiler or emitter ever inverts clockwise/counter-clockwise,
//  the robot-side simulation will end up somewhere else than the
//  compiler intended, and this test fails.
// =====================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileShow } from '../core/compile.js';
import { validateShow } from '../core/validate.js';
import { emitRobot } from '../core/emit.js';
import { parseKoreografia } from '../core/parse.js';
import { normalizeAngle } from '../core/pose.js';
import { makeConfig, ZERO_ERROR_MODEL } from '../core/config.js';
import { loadExample, loadRobots, loadTemplate, clone } from './helpers.js';

// --- the robot, as block 5 of the template defines it -----------------
// World frame: +X right, +Y away from audience, heading CCW-positive.
// A clockwise spin therefore DECREASES the heading.
function robotSim(start) {
  let { x, y, theta } = start;
  const megy_cm = (cm) => {
    const mm = cm * 10;
    x += mm * Math.cos(theta * Math.PI / 180);
    y += mm * Math.sin(theta * Math.PI / 180);
  };
  const porog_fok = (fok) => { theta -= fok; };          // + = jobbra = clockwise
  const api = {
    elore_cm: (cm) => megy_cm(+cm),
    hatra_cm: (cm) => megy_cm(-cm),
    megy_cm,
    porog_fok,
    balra_fok: (f) => porog_fok(-f),
    jobbra_fok: (f) => porog_fok(+f),
    balra_kor: (k) => porog_fok(-360 * k),
    jobbra_kor: (k) => porog_fok(+360 * k),
  };
  return {
    run(calls) { for (const { call, arg } of calls) api[call](arg); },
    pose: () => ({ x, y, theta: normalizeAngle(theta) }),
  };
}

const close = (a, b, tolMm = 1e-6, tolDeg = 1e-6) =>
  Math.abs(a.x - b.x) <= tolMm && Math.abs(a.y - b.y) <= tolMm && Math.abs(normalizeAngle(a.theta - b.theta)) <= tolDeg;

function roundTrip(show, robotId = 1, config = undefined) {
  const compiled = compileShow(show, config);
  const validation = validateShow(compiled);
  assert.ok(validation.ok, validation.errors.map((e) => e.message).join('\n'));
  const txt = emitRobot(compiled, robotId, { template: loadTemplate(), robots: loadRobots(), validation });
  const beats = parseKoreografia(txt);
  assert.equal(beats.length, compiled.beats.length, 'one parsed beat per compiled beat');

  const sim = robotSim(compiled.robots.find((r) => r.id === robotId).start);
  beats.forEach((pb, i) => {
    const cb = compiled.beats[i];
    assert.equal(pb.duration_ms, cb.duration_ms, `beat ${i} duration`);
    sim.run(pb.calls);
    const intended = cb.robots[robotId].poseAfter;
    const actual = sim.pose();
    assert.ok(close(actual, intended, 1e-6, 1e-6),
      `beat ${i} "${cb.name}": robot would be at ${JSON.stringify(actual)}, compiler intended ${JSON.stringify(intended)}`);
  });
  return { compiled, txt, beats };
}

test('example show: emitted code re-simulated on the robot model lands on every intended pose', () => {
  roundTrip(loadExample(), 1);
});

test('a left goto and a right goto end where the world coordinates say', () => {
  const show = {
    field: { width_mm: 4000, height_mm: 3000, margin_mm: 250 },
    robots: [{ id: 1, start: { x: 2000, y: 1500, theta: 0 } }],
    beats: [
      { name: 'left', duration_ms: 12000, moves: { 1: { type: 'goto', x: 2000, y: 2000, face: 180 } } },   // +Y = CCW from +X
      { name: 'right', duration_ms: 12000, moves: { 1: { type: 'goto', x: 2000, y: 1000, face: 0 } } },     // -Y
      { name: 'tiny', duration_ms: 12000, moves: { 1: { type: 'goto', x: 2000, y: 1000, face: 350 } } },     // 350 -> -10 -> jobbra 10
    ],
  };
  const { beats, compiled } = roundTrip(show, 1);
  // the first thing the robot does is a LEFT (counter-clockwise) turn of 90
  assert.deepEqual(beats[0].calls[0], { call: 'balra_fok', arg: 90 });
  assert.deepEqual(beats[2].calls, [{ call: 'jobbra_fok', arg: 10 }]);
  // and geometry, independently of the compiler
  const sim = robotSim(compiled.robots[0].start);
  sim.run(beats[0].calls);
  assert.ok(close(sim.pose(), { x: 2000, y: 2000, theta: 180 }, 1e-6));
});

test('closed-loop square through emit -> parse -> robot model returns to the start', () => {
  const start = { x: 1000, y: 1000, theta: 90 };
  const beats = [];
  for (let i = 0; i < 4; i++) {
    beats.push({ name: `s${i}`, duration_ms: 9000, moves: { 1: { type: 'primitive', op: 'elore_cm', value: 100 } } });
    beats.push({ name: `t${i}`, duration_ms: 4000, moves: { 1: { type: 'primitive', op: 'jobbra_fok', value: 90 } } });
  }
  const show = { field: { width_mm: 4000, height_mm: 3000, margin_mm: 250 }, robots: [{ id: 1, start }], beats };
  // zero error model: with the real one, 4 m of driving grows r past the field and validation blocks emission
  const { beats: parsed, compiled } = roundTrip(show, 1, makeConfig({ error: ZERO_ERROR_MODEL }));
  const sim = robotSim(compiled.robots[0].start);
  for (const b of parsed) sim.run(b.calls);
  assert.ok(close(sim.pose(), start, 1e-6, 1e-6), JSON.stringify(sim.pose()));
});

test('every emitted call is one of the block-5 wrappers with a non-negative argument', () => {
  const compiled = compileShow(loadExample());
  const validation = validateShow(compiled);
  const txt = emitRobot(compiled, 1, { template: loadTemplate(), robots: loadRobots(), validation });
  for (const b of parseKoreografia(txt)) {
    for (const c of b.calls) {
      assert.ok(['elore_cm', 'hatra_cm', 'balra_fok', 'jobbra_fok'].includes(c.call), c.call);
      assert.ok(c.arg >= 0);
    }
  }
});

test('mutation check: an inverted turn sign WOULD be caught', () => {
  // Simulate the bug: swap balra/jobbra in the emitted text and confirm the robot model diverges.
  const show = clone(loadExample());
  const compiled = compileShow(show);
  const validation = validateShow(compiled);
  const txt = emitRobot(compiled, 1, { template: loadTemplate(), robots: loadRobots(), validation });
  const swapped = txt.replace(/balra_fok\(/g, '@L(').replace(/jobbra_fok\(/g, 'balra_fok(').replace(/@L\(/g, 'jobbra_fok(');
  const beats = parseKoreografia(swapped);
  const sim = robotSim(compiled.robots[0].start);
  let diverged = false;
  beats.forEach((pb, i) => {
    sim.run(pb.calls);
    if (!close(sim.pose(), compiled.beats[i].robots[1].poseAfter, 1e-6, 1e-6)) diverged = true;
  });
  assert.ok(diverged, 'the round-trip must be sensitive to a clockwise/counter-clockwise swap');
});
