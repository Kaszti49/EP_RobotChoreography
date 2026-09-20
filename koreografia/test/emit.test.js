import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileShow } from '../core/compile.js';
import { validateShow } from '../core/validate.js';
import { emitRobot, emitAll, EmitError, toAscii, koreografiaLines } from '../core/emit.js';
import { splitBlocks } from '../core/template.js';
import { loadExample, loadRobots, loadTemplate, loadShowRobot1, clone } from './helpers.js';

function deps() {
  const compiled = compileShow(loadExample());
  const validation = validateShow(compiled);
  return { compiled, deps: { template: loadTemplate(), robots: loadRobots(), validation } };
}

test('emits a complete sketch for robot 1 with its calibration filled in', () => {
  const { compiled, deps: d } = deps();
  const txt = emitRobot(compiled, 1, d);
  assert.match(txt, /^#define ROBOT 1$/m);
  assert.match(txt, /SHOW -- ROBOT 1 /);
  assert.match(txt, /const float MM_PER_IMP_BAL  = 0\.34582;/);
  assert.match(txt, /const float MM_PER_IMP_JOBB = 0\.34392;/);
  assert.match(txt, /const float PWM_PER_MMS = 0\.14500;/);
  assert.match(txt, /const float PWM_NULLA   = 9\.30;/);
  assert.match(txt, /const float NYOMTAV_MM  = 148\.3;/);
  assert.match(txt, /const float PORGES_TRIM = 1\.00;/);
  assert.match(txt, /const float BAL_TRIM = 0\.996;/);
  assert.match(txt, /const int PWM_MIN = 35;/);
  assert.ok(!/@@/.test(txt), 'no placeholder left');
  assert.ok(!/\r/.test(txt), 'LF only');
  assert.ok(/^[\x20-\x7e\n\t]*$/.test(txt), 'ASCII only');
  assert.ok(txt.split('\n').length > 250, 'multi-line file (newlines survived toAscii)');
});

test('blocks 3, 4, 5, 7, 8 and the preamble are byte-identical to the template; 5 and 8 also to SHOW_robot1.txt', () => {
  const { compiled, deps: d } = deps();
  const emitted = splitBlocks(emitRobot(compiled, 1, d));
  const template = splitBlocks(loadTemplate());
  const source = splitBlocks(loadShowRobot1());
  assert.deepEqual(emitted.order, template.order);
  for (const n of [3, 4, 5, 7, 8]) {
    assert.deepEqual(emitted.blocks.get(n), template.blocks.get(n), `block ${n} differs from the template`);
  }
  const trimEnd = (lines) => { const out = [...lines]; while (out.length && out[out.length - 1] === '') out.pop(); return out; };
  for (const n of [5, 8]) {
    assert.deepEqual(trimEnd(emitted.blocks.get(n)), trimEnd(source.blocks.get(n)), `block ${n} differs from SHOW_robot1.txt`);
  }
  // block 2 differs from the template only by the numbers, and from the
  // source by robot 1's re-measured speed line (2026-09-13)
  assert.deepEqual(emitted.blocks.get(1), source.blocks.get(1));
  assert.equal(emitted.blocks.get(2).length, source.blocks.get(2).length);
  assert.deepEqual(emitted.preamble, template.preamble.map((l) => l.replace('ROBOT @@ROBOT@@', 'ROBOT 1')));
});

test('block 6 has one lepes_kezd / lepes_var pair per beat with the beat duration, and a pose comment per move', () => {
  const { compiled, deps: d } = deps();
  const txt = emitRobot(compiled, 1, d);
  const body = txt.slice(txt.indexOf('void koreografia() {'), txt.indexOf('// ====', txt.indexOf('void koreografia() {')));
  const kezd = body.match(/lepes_kezd\(\);/g).length;
  const vars = [...body.matchAll(/lepes_var\((\d+)\);/g)].map((m) => Number(m[1]));
  assert.equal(kezd, compiled.beats.length);
  assert.deepEqual(vars, compiled.beats.map((b) => b.duration_ms));
  for (const line of body.split('\n')) {
    if (/(elore_cm|hatra_cm|balra_fok|jobbra_fok)\(/.test(line)) {
      assert.match(line, /\/\/ \[\d+ [^\]]+\] -> \(-?\d+, -?\d+\) -?\d+\.\d deg/, `pose comment missing on: ${line}`);
    }
  }
});

test('refuses robots with null calibration, with a clear message', () => {
  const { compiled, deps: d } = deps();
  // which robots are calibrated follows robots.json (a bring-up flips one), so derive it
  const calibrated = d.robots.robots.filter((r) => r.calibration).map((r) => String(r.id));
  const uncalibrated = d.robots.robots.filter((r) => !r.calibration).map((r) => String(r.id));
  assert.ok(uncalibrated.length > 0, 'test needs at least one robot with null calibration');
  for (const id of uncalibrated.map(Number)) {
    assert.throws(() => emitRobot(compiled, id, d), (e) => e instanceof EmitError && e.robot === id && /no calibration yet/.test(e.message));
  }
  const all = emitAll(compiled, d);
  assert.deepEqual(Object.keys(all.files).sort(), calibrated.sort());
  assert.deepEqual(Object.keys(all.errors).sort(), uncalibrated.sort());
  assert.ok(!Object.values(all.errors).some((m) => /0\.34582/.test(m)), "never leaks robot 1's numbers");
});

test('refuses to emit when validation has errors', () => {
  const show = clone(loadExample());
  show.beats[0].duration_ms = 100; // nobody fits
  const compiled = compileShow(show);
  const validation = validateShow(compiled);
  assert.ok(!validation.ok);
  assert.throws(() => emitRobot(compiled, 1, { template: loadTemplate(), robots: loadRobots(), validation }), /refusing to emit/);
  assert.throws(() => emitAll(compiled, { template: loadTemplate(), robots: loadRobots(), validation }), /refusing to emit/);
});

test('refuses without a validation result, and for an unknown robot', () => {
  const { compiled, deps: d } = deps();
  assert.throws(() => emitRobot(compiled, 1, { ...d, validation: null }), /validation/);
  assert.throws(() => emitRobot(compiled, 7, d), /not part of this show/);
});

test('a robot with calibration but a missing constant is refused', () => {
  const { compiled, deps: d } = deps();
  const robots = clone(d.robots);
  delete robots.robots[0].calibration.BAL_TRIM;
  assert.throws(() => emitRobot(compiled, 1, { ...d, robots }), /BAL_TRIM/);
});

test('beat names are made ASCII in comments', () => {
  assert.equal(toAscii('szünet – újra'), 'szunet ? ujra');
  const show = clone(loadExample());
  show.beats[0].name = 'előre';
  const compiled = compileShow(show);
  const lines = koreografiaLines(compiled, 1);
  assert.match(lines[0], /\[1 elore\]/);
});
