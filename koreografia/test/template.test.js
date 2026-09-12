import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitBlocks, readConsts, toLines } from '../core/template.js';
import { buildTemplate } from '../tools/make-template.js';
import { TIMING } from '../core/config.js';
import { loadTemplate, loadShowRobot1 } from './helpers.js';

test('SHOW_robot1.txt splits into blocks 1..8 in order', () => {
  const parts = splitBlocks(loadShowRobot1());
  assert.deepEqual(parts.order, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.match(parts.blocks.get(4).join('\n'), /void mozgas\(long cb, long cj, int pwm\)/);
  assert.match(parts.blocks.get(5).join('\n'), /void porog_fok\(float fok\)/);
  assert.match(parts.blocks.get(6).join('\n'), /void koreografia\(\)/);
  assert.match(parts.blocks.get(7).join('\n'), /void indulas\(\)/);
  assert.match(parts.blocks.get(8).join('\n'), /void vezerles\(\)/);
});

test('the committed template is exactly what make-template.js produces from SHOW_robot1.txt', () => {
  assert.equal(loadTemplate().replace(/\r\n/g, '\n'), buildTemplate(loadShowRobot1()));
});

test('template blocks 3, 4, 5, 7, 8 are verbatim copies of SHOW_robot1.txt', () => {
  const t = splitBlocks(loadTemplate());
  const s = splitBlocks(loadShowRobot1());
  for (const n of [3, 4, 5, 7, 8]) assert.deepEqual(t.blocks.get(n), s.blocks.get(n), `block ${n}`);
});

test('template has exactly the placeholders the emitter fills', () => {
  const t = loadTemplate();
  const found = [...t.matchAll(/@@([A-Z_]+)@@/g)].map((m) => m[1]).sort();
  assert.deepEqual([...new Set(found)], [
    'BAL_TRIM', 'KOREOGRAFIA', 'MM_PER_IMP_BAL', 'MM_PER_IMP_JOBB', 'NYOMTAV_MM',
    'PORGES_TRIM', 'PWM_MIN', 'PWM_NULLA', 'PWM_PER_MMS', 'ROBOT',
  ]);
  assert.equal(found.filter((x) => x === 'ROBOT').length, 2, 'header comment and #define');
});

test('config TIMING matches block 3 of the template (and robot 1 track from block 2 of the source)', () => {
  const b3 = readConsts(splitBlocks(loadTemplate()).blocks.get(3));
  assert.equal(Number(b3.SEBESSEG_MM_S), TIMING.drive_mm_s);
  assert.equal(Number(b3.PORGES_MM_S), TIMING.spin_rim_mm_s);
  assert.equal(Number(b3.FEK_MS), TIMING.brake_ms);
  assert.equal(Number(b3.IDOKORLAT), TIMING.move_timeout_ms);
  const b2 = readConsts(splitBlocks(loadShowRobot1()).blocks.get(2));
  assert.equal(Number(b2.NYOMTAV_MM), TIMING.track_mm);
  // the settle time is the literal varj(200) at the end of mozgas()
  const b4 = splitBlocks(loadTemplate()).blocks.get(4).join('\n');
  assert.match(b4, new RegExp(`motor\\(0, 0\\);\\n\\s*varj\\(${TIMING.settle_ms}\\);`));
});

test('toLines tolerates CRLF', () => {
  assert.deepEqual(toLines('a\r\nb\nc'), ['a', 'b', 'c']);
});
