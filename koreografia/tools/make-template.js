#!/usr/bin/env node
// =====================================================================
//  make-template.js -- regenerate templates/show_template.txt from the
//  proven ../SHOW_robot1.txt.
//
//  What changes, and ONLY this:
//    header      "ROBOT 1"                -> "ROBOT @@ROBOT@@"
//    block 1     #define ROBOT 1          -> #define ROBOT @@ROBOT@@
//    block 2     every const's value      -> @@NAME@@
//    block 6     the koreografia() body   -> @@KOREOGRAFIA@@
//  Blocks 3, 4, 5, 7, 8 are copied byte for byte. test/template.test.js
//  fails if the committed template ever drifts from SHOW_robot1.txt.
//
//  usage:  node tools/make-template.js
// =====================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { splitBlocks, joinBlocks } from '../core/template.js';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '..', '..', 'SHOW_robot1.txt');
const target = join(here, '..', 'templates', 'show_template.txt');

export const CALIBRATION_CONSTS = [
  'MM_PER_IMP_BAL', 'MM_PER_IMP_JOBB', 'PWM_PER_MMS', 'PWM_NULLA',
  'NYOMTAV_MM', 'PORGES_TRIM', 'BAL_TRIM', 'PWM_MIN',
];

export function buildTemplate(showText) {
  const parts = splitBlocks(showText);
  const rep = new Map();

  rep.set(0, parts.preamble.map((l) => l.replace(/SHOW -- ROBOT 1\b/, 'SHOW -- ROBOT @@ROBOT@@')));

  rep.set(1, parts.blocks.get(1).map((l) => l.replace(/^#define ROBOT \d+\s*$/, '#define ROBOT @@ROBOT@@')));

  rep.set(2, parts.blocks.get(2).map((l) => {
    const m = l.match(/^(\s*const\s+(?:float|int)\s+)([A-Z_0-9]+)(\s*=\s*)([-+]?[\d.]+)(\s*;.*)$/);
    if (!m) return l;
    if (!CALIBRATION_CONSTS.includes(m[2])) throw new Error(`unexpected const in block 2: ${m[2]}`);
    return `${m[1]}${m[2]}${m[3]}@@${m[2]}@@${m[5]}`;
  }));

  const b6 = parts.blocks.get(6);
  const open = b6.findIndex((l) => /^void koreografia\(\)\s*\{\s*$/.test(l));
  if (open < 0) throw new Error('koreografia() not found in block 6');
  let close = -1;
  for (let i = open + 1; i < b6.length; i++) if (/^\}\s*$/.test(b6[i])) { close = i; break; }
  if (close < 0) throw new Error('end of koreografia() not found');
  rep.set(6, [...b6.slice(0, open + 1), '', '@@KOREOGRAFIA@@', '', ...b6.slice(close)]);

  const preamble = rep.get(0);
  rep.delete(0);
  return joinBlocks({ ...parts, preamble }, rep);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const text = readFileSync(source, 'utf8');
  writeFileSync(target, buildTemplate(text), 'utf8');
  console.log(`wrote ${target}`);
}
