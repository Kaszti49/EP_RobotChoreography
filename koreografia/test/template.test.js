import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitBlocks, readConsts, toLines } from '../core/template.js';
import { TIMING } from '../core/config.js';
import { loadTemplate, loadShowRobot1, loadRobots } from './helpers.js';

// a block without its trailing blank lines (SHOW_robot1.txt may lack the final newline)
const trimEnd = (lines) => { const out = [...lines]; while (out.length && out[out.length - 1] === '') out.pop(); return out; };

test('SHOW_robot1.txt splits into blocks 1..8 in order', () => {
  const parts = splitBlocks(loadShowRobot1());
  assert.deepEqual(parts.order, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.match(parts.blocks.get(4).join('\n'), /void mozgas\(long cb, long cj, int pwm\)/);
  assert.match(parts.blocks.get(5).join('\n'), /void porog_fok\(float fok\)/);
  assert.match(parts.blocks.get(6).join('\n'), /void koreografia\(\)/);
  assert.match(parts.blocks.get(7).join('\n'), /void indulas\(\)/);
  assert.match(parts.blocks.get(8).join('\n'), /void vezerles\(\)/);
});

// The template IS the engine (v6, 2026-09-13): blocks 3, 4 and 7 are ours.
// SHOW_robot1.txt is the v5 baseline it grew out of; what must never drift
// from it is the API the choreography (block 6) is written against and the
// sign conventions the round-trip test depends on -- blocks 5 and 8.
test('template blocks 5 and 8 (the movement API and vezerles) are verbatim copies of SHOW_robot1.txt', () => {
  const t = splitBlocks(loadTemplate());
  const s = splitBlocks(loadShowRobot1());
  assert.deepEqual(t.order, s.order);
  for (const n of [5, 8]) assert.deepEqual(trimEnd(t.blocks.get(n)), trimEnd(s.blocks.get(n)), `block ${n}`);
  assert.deepEqual(t.blocks.get(1), s.blocks.get(1).map((l) => l.replace(/^#define ROBOT 1\s*$/, '#define ROBOT @@ROBOT@@')));
});

test('template block 4 has the v6 engine and block 3 its constants', () => {
  const t = splitBlocks(loadTemplate());
  const b4 = t.blocks.get(4).join('\n');
  assert.match(b4, /void fekez\(int irB, int irJ\)/);
  assert.match(b4, /void mozgas\(long cb, long cj, int pwm\)/);
  assert.match(b4, /if \(hatra <= RAFUTAS_IMP\) break;/, 'stops on the SUM of the two wheels');
  const b3 = readConsts(t.blocks.get(3));
  for (const k of ['LASSITAS_MM', 'LASSU_MM_S', 'RAFUTAS_IMP', 'FEK_PWM', 'FEK_MAX_MS', 'TURES_IMP', 'JAVITAS_MAX', 'PWM_PLAFON', 'IDOKORLAT']) {
    assert.ok(k in b3, `block 3 const ${k}`);
  }
});

test('template has exactly the placeholders the emitter fills', () => {
  const t = loadTemplate();
  const found = [...t.matchAll(/@@([A-Z_]+)@@/g)].map((m) => m[1]).sort();
  assert.deepEqual([...new Set(found)], [
    'BAL_TRIM', 'FEK_ELLEN_PWM', 'KOREOGRAFIA', 'MM_PER_IMP_BAL', 'MM_PER_IMP_JOBB', 'NYOMTAV_MM',
    'PORGES_LASSITAS_MM', 'PORGES_OFFSET_FOK', 'PORGES_PWM', 'PORGES_TRIM', 'PORGES_TRIM_BAL', 'PORGES_TRIM_JOBB', 'PWM_MIN', 'PWM_NULLA', 'PWM_PER_MMS', 'ROBOT', 'TEMPO',
  ]);
  assert.equal(found.filter((x) => x === 'ROBOT').length, 2, 'header comment and #define');
});

test('config TIMING matches block 3 of the template (and the track is the nominal one robot 1 is tuned around)', () => {
  const b3 = readConsts(splitBlocks(loadTemplate()).blocks.get(3));
  assert.equal(Number(b3.SEBESSEG_MM_S), TIMING.drive_mm_s);
  assert.equal(Number(b3.PORGES_MM_S), TIMING.spin_rim_mm_s);
  assert.equal(Number(b3.LASSITAS_MM), TIMING.slow_zone_mm);
  assert.equal(Number(b3.LASSU_MM_S), TIMING.slow_mm_s);
  assert.equal(Number(b3.FEK_MAX_MS) + 100, TIMING.brake_ms, 'FEK_MAX_MS + the varj(100) after fekez()');
  assert.ok(Number(b3.JAVITAS_MAX) >= 1 && TIMING.correction_ms > 0, 'the engine corrects, the model budgets for it');
  assert.equal(Number(b3.IDOKORLAT), TIMING.move_timeout_ms);
  assert.equal(Number(b3.INDULAS_MS), TIMING.ramp_ms);
  const r1 = loadRobots().robots.find((r) => r.id === 1).calibration;
  assert.ok(Math.abs(r1.NYOMTAV_MM - TIMING.track_mm) <= 2, `robot 1 track ${r1.NYOMTAV_MM} vs nominal ${TIMING.track_mm}`);
  // the settle time is the literal varj(200) at the end of mozgas()
  const b4 = splitBlocks(loadTemplate()).blocks.get(4).join('\n');
  assert.match(b4, new RegExp(`motor\\(0, 0\\);\\n\\s*varj\\(${TIMING.settle_ms}\\);`));
  assert.match(b4, /varj\(100\);/);
});

test('toLines tolerates CRLF', () => {
  assert.deepEqual(toLines('a\r\nb\nc'), ['a', 'b', 'c']);
});
