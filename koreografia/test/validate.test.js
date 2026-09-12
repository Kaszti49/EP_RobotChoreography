import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileShow } from '../core/compile.js';
import {
  validateShow, checkBounds, checkClearance, checkFeasibility, checkDrift, checkStart, CHECKS,
} from '../core/validate.js';
import { loadExample, clone, tinyShow } from './helpers.js';

test('the example show validates with no errors', () => {
  const v = validateShow(compileShow(loadExample()));
  assert.deepEqual(v.errors, []);
  assert.ok(v.ok);
  assert.equal(v.beatStats.length, 10);
  assert.ok(v.beatStats.every((s) => s.slowest && Number.isInteger(s.slowest.robot)));
});

test('deliberately breaking the example: two robots sent to the same point -> clearance error naming both and the beat', () => {
  const show = clone(loadExample());
  const target = { type: 'goto', x: 2000, y: 1600, face: 90 };
  show.beats[1].moves['2'] = target;
  show.beats[1].moves['3'] = target;
  const v = validateShow(compileShow(show));
  assert.ok(!v.ok);
  const hit = v.errors.find((e) => e.check === CHECKS.CLEARANCE && e.beat === 1);
  assert.ok(hit, 'a clearance error in beat index 1');
  assert.deepEqual(hit.robots, [2, 3]);
  assert.match(hit.message, /robots 2 and 3/);
  assert.match(hit.message, /beat 2 "iv"/);
});

// ---- the five checks individually -----------------------------------

test('1. bounds: a drive whose end is in the margin is caught, and so is a turn on the spot with a grown r', () => {
  // start near the right edge, facing +X, drive 40 cm: the end (3800) is inside the field but
  // not inside the margin (3750) once the body radius is added.
  const show = tinyShow([{
    name: 'out', duration_ms: 12000,
    moves: { 1: { type: 'primitive', op: 'elore_cm', value: 40 } },
  }], { x: 3400, y: 1500, theta: 0 });
  const findings = checkBounds(compileShow(show));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].check, CHECKS.BOUNDS);
  assert.equal(findings[0].beat, 0);
  assert.equal(findings[0].robot, 1);
  assert.match(findings[0].message, /robot 1 leaves the field in beat 1/);

  // the uncertainty radius counts, and it is checked during a move that does not
  // translate at all: after 3 m of driving r is ~330 mm, so a turn at (3300, 1500) fails.
  const wide = compileShow(tinyShow([
    { name: 'a', duration_ms: 20000, moves: { 1: { type: 'primitive', op: 'elore_cm', value: 300 } } },
    { name: 'b', duration_ms: 5000, moves: { 1: { type: 'primitive', op: 'balra_fok', value: 90 } } },
  ], { x: 300, y: 1500, theta: 0 }));
  const w = checkBounds(wide);
  assert.ok(w.some((f) => f.beat === 1 && /balra_fok/.test(f.message)), JSON.stringify(w));
});

test('2. clearance: robots that cross mid-beat collide even with safe endpoints', () => {
  const show = {
    field: { width_mm: 4000, height_mm: 3000, margin_mm: 250 },
    robots: [
      { id: 1, start: { x: 1000, y: 1500, theta: 0 } },
      { id: 2, start: { x: 2500, y: 1500, theta: 180 } },
    ],
    beats: [{
      name: 'swap', duration_ms: 12000,
      moves: {
        1: { type: 'goto', x: 2500, y: 1500 },
        2: { type: 'goto', x: 1000, y: 1500 },
      },
    }],
  };
  const findings = checkClearance(compileShow(show));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].check, CHECKS.CLEARANCE);
  assert.deepEqual(findings[0].robots, [1, 2]);
  assert.equal(findings[0].beat, 0);
  assert.ok(findings[0].t_ms > 0 && findings[0].t_ms < 12000, 'collision is mid-beat');
});

test('2b. clearance: standing robots 1.5 m apart are fine', () => {
  const show = {
    field: { width_mm: 4000, height_mm: 3000, margin_mm: 250 },
    robots: [
      { id: 1, start: { x: 1000, y: 1500, theta: 0 } },
      { id: 2, start: { x: 2500, y: 1500, theta: 180 } },
    ],
    beats: [{ name: 'hold', duration_ms: 1000, moves: {} }],
  };
  assert.deepEqual(checkClearance(compileShow(show)), []);
});

test('3. feasibility: a beat too short for its slowest robot, and a move longer than IDOKORLAT', () => {
  const tooShort = compileShow(tinyShow([{
    name: 'rush', duration_ms: 1000, moves: { 1: { type: 'primitive', op: 'elore_cm', value: 100 } },
  }]));
  const f = checkFeasibility(tooShort);
  assert.equal(f.findings.length, 1);
  assert.equal(f.findings[0].check, CHECKS.FEASIBILITY);
  assert.equal(f.findings[0].beat, 0);
  assert.equal(f.findings[0].robot, 1);
  assert.match(f.findings[0].message, /does not fit beat 1/);
  assert.equal(f.stats[0].slowest.robot, 1);

  // a 5 m drive needs > 20 s of motion: aborted by the engine's timeout
  const tooLong = compileShow(tinyShow([{
    name: 'marathon', duration_ms: 60000, moves: { 1: { type: 'primitive', op: 'elore_cm', value: 500 } },
  }]));
  const g = checkFeasibility(tooLong);
  assert.ok(g.findings.some((x) => /IDOKORLAT/.test(x.message)));
});

test('4. drift ceiling: warns once, names the beat, suggests an anchor', () => {
  const beats = [];
  for (let i = 0; i < 6; i++) {
    beats.push({ name: `leg${i}`, duration_ms: 9000, moves: { 1: { type: 'primitive', op: 'elore_cm', value: 100 } } });
    beats.push({ name: `turn${i}`, duration_ms: 4000, moves: { 1: { type: 'primitive', op: 'balra_fok', value: 90 } } });
  }
  const c = compileShow(tinyShow(beats, { x: 1000, y: 1000, theta: 0 }));
  const w = checkDrift(c);
  assert.equal(w.length, 1, 'reported once per robot');
  assert.equal(w[0].severity, 'warning');
  assert.equal(w[0].check, CHECKS.DRIFT);
  assert.equal(w[0].robot, 1);
  assert.match(w[0].message, /anchor beat/);
  // the beat named is the first whose end r exceeds the ceiling
  const beatEnd = (i) => { const br = c.beats[i].robots[1]; return br.primitives.at(-1)?.uAfter.r ?? br.uAfter.r; };
  assert.ok(beatEnd(w[0].beat) > c.config.drift_ceiling_mm);
  assert.ok(w[0].beat === 0 || beatEnd(w[0].beat - 1) <= c.config.drift_ceiling_mm);

  // warnings do not make the show fail
  const v = validateShow(c);
  assert.ok(v.warnings.length >= 1);
});

test('5. start pose sanity: outside the field, overlapping, and too close', () => {
  const outside = compileShow(tinyShow([], { x: 100, y: 100, theta: 0 }));
  const a = checkStart(outside);
  assert.equal(a.length, 1);
  assert.equal(a[0].check, CHECKS.START);
  assert.equal(a[0].robot, 1);

  const same = compileShow({
    field: { width_mm: 4000, height_mm: 3000, margin_mm: 250 },
    robots: [{ id: 1, start: { x: 1000, y: 1000, theta: 0 } }, { id: 2, start: { x: 1000, y: 1000, theta: 0 } }],
    beats: [],
  });
  const b = checkStart(same);
  assert.equal(b.length, 1);
  assert.deepEqual(b[0].robots, [1, 2]);
  assert.match(b[0].message, /same point/);

  const close = compileShow({
    field: { width_mm: 4000, height_mm: 3000, margin_mm: 250 },
    robots: [{ id: 1, start: { x: 1000, y: 1000, theta: 0 } }, { id: 2, start: { x: 1300, y: 1000, theta: 0 } }],
    beats: [],
  });
  const cc = checkStart(close);
  assert.equal(cc.length, 1);
  assert.match(cc[0].message, /too close/);
});

test('validateShow separates errors from warnings and reports ok', () => {
  const v = validateShow(compileShow(tinyShow([{
    name: 'rush', duration_ms: 1000, moves: { 1: { type: 'primitive', op: 'elore_cm', value: 100 } },
  }])));
  assert.equal(v.ok, false);
  assert.ok(v.errors.every((e) => e.severity === 'error'));
  assert.ok(v.warnings.every((w) => w.severity === 'warning'));
});
