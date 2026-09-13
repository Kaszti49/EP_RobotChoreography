#!/usr/bin/env node
// =====================================================================
//  make-template.js -- template vs. SHOW_robot1.txt drift check
//
//  Until 2026-09-13 this tool GENERATED templates/show_template.txt from
//  ../SHOW_robot1.txt (now RobotBaseStats/SHOW_robot1.md). Since the v6 engine the template is the source
//  of truth for blocks 3, 4 and 7 (the motion engine), so this tool no
//  longer writes anything: it prints which blocks differ from the v5
//  baseline, and fails if block 5 or 8 (the API the choreography is
//  written against) has drifted. test/template.test.js checks the same.
//
//  usage:  node tools/make-template.js
// =====================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { splitBlocks } from '../core/template.js';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '..', '..', 'RobotBaseStats', 'SHOW_robot1.md');   // code fence
const target = join(here, '..', 'templates', 'show_template.txt');

export const CALIBRATION_CONSTS = [
  'MM_PER_IMP_BAL', 'MM_PER_IMP_JOBB', 'PWM_PER_MMS', 'PWM_NULLA',
  'NYOMTAV_MM', 'PORGES_TRIM', 'BAL_TRIM', 'PWM_MIN',
];

/** Blocks whose text differs between the template and SHOW_robot1.txt. */
export function driftedBlocks(templateText, showText) {
  const t = splitBlocks(templateText);
  const s = splitBlocks(showText);
  const out = [];
  const trimEnd = (lines) => { const o = [...lines]; while (o.length && o[o.length - 1] === '') o.pop(); return o; };
  for (const n of s.order) {
    const a = trimEnd(t.blocks.get(n) ?? []).join('\n');
    const b = trimEnd(s.blocks.get(n) ?? []).join('\n');
    if (a !== b) out.push(n);
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const md = readFileSync(source, 'utf8');
  const show = (md.match(/```cpp\r?\n([\s\S]*?)\r?\n```/) ?? [, md])[1];
  const drifted = driftedBlocks(readFileSync(target, 'utf8'), show);
  console.log(`blocks that differ from SHOW_robot1.txt: ${drifted.join(', ') || 'none'}`);
  console.log('  expected: 1, 2, 6 (placeholders) and, while the baseline is v5: 3, 4, 7 (the engine)');
  const bad = drifted.filter((n) => n === 5 || n === 8);
  if (bad.length) {
    console.error(`!!! block ${bad.join(', ')} drifted -- the movement API must stay identical to SHOW_robot1.txt`);
    process.exit(1);
  }
}
