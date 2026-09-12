import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseKoreografia, extractKoreografiaBody, ParseError } from '../core/parse.js';
import { OPS } from '../core/config.js';
import { loadShowRobot1 } from './helpers.js';

test('parses the hand-written choreography of SHOW_robot1.txt', () => {
  const beats = parseKoreografia(loadShowRobot1());
  assert.equal(beats.length, 7);
  assert.deepEqual(beats[0], { duration_ms: 8000, primitives: [{ op: OPS.FORWARD, value: 100 }], calls: [{ call: 'elore_cm', arg: 100 }] });
  assert.deepEqual(beats[1], { duration_ms: 1000, primitives: [], calls: [] });
  assert.deepEqual(beats[2].primitives, [{ op: OPS.BACKWARD, value: 100 }]);
  assert.deepEqual(beats[4].primitives, [{ op: OPS.LEFT, value: 1080 }]);
  assert.deepEqual(beats[6].primitives, [{ op: OPS.RIGHT, value: 1080 }]);
  assert.equal(beats[6].duration_ms, 16000);
});

test('ignores comments, handles decimals and porog_fok sign', () => {
  const src = `
    void koreografia() {
      // a comment with a fake call: elore_cm(999);
      lepes_kezd();  porog_fok(-45.5);  lepes_var(3000);  /* block
      comment jobbra_fok(1); */
      lepes_kezd();  porog_fok(30);     lepes_var(2000);
      lepes_kezd();  megy_cm(-12.5);    lepes_var(2000);
    }`;
  const beats = parseKoreografia(src);
  assert.deepEqual(beats.map((b) => b.primitives[0]), [
    { op: OPS.LEFT, value: 45.5 }, { op: OPS.RIGHT, value: 30 }, { op: OPS.BACKWARD, value: 12.5 },
  ]);
});

test('rejects unknown calls and stray text', () => {
  assert.throws(() => parseKoreografia('void koreografia() { lepes_kezd(); motor(0,0); }'), ParseError);
  assert.throws(() => parseKoreografia('void koreografia() { elore_cm(10); }'), /before lepes_kezd/);
  assert.throws(() => parseKoreografia('void indulas() {}'), /not found/);
  assert.throws(() => parseKoreografia('void koreografia() { lepes_kezd(); int x = 1; }'), /unparsed/);
});

test('extractKoreografiaBody handles nested braces', () => {
  const body = extractKoreografiaBody('void koreografia() { if (1) { lepes_kezd(); } }\nvoid indulas() {}');
  assert.equal(body.trim(), 'if (1) { lepes_kezd(); }');
});
