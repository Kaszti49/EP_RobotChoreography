#!/usr/bin/env node
// =====================================================================
//  build.js -- compile, validate and emit a show from the command line
//
//  usage:
//    node tools/build.js data/example-show.json            validate only
//    node tools/build.js data/example-show.json out/       also emit
//                                                         SHOW_robot<N>.txt
//                                                         for every robot
//                                                         with calibration
//  exit code 1 when the show has validation errors.
// =====================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { compileShow } from '../core/compile.js';
import { validateShow } from '../core/validate.js';
import { emitAll, fileNameFor } from '../core/emit.js';
import { ManualTransport } from '../transport/manual.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

export function loadDeps() {
  return {
    template: readFileSync(join(root, 'templates', 'show_template.txt'), 'utf8'),
    robots: JSON.parse(readFileSync(join(root, 'data', 'robots.json'), 'utf8')),
  };
}

export function report(compiled, validation) {
  const lines = [];
  lines.push(`field ${compiled.field.width_mm} x ${compiled.field.height_mm} mm, margin ${compiled.field.margin_mm} mm, `
    + `${compiled.robots.length} robots, ${compiled.beats.length} beats`);
  for (const s of validation.beatStats) {
    const sl = s.slowest;
    lines.push(`  beat ${s.beat + 1} "${s.name}" ${s.duration_ms} ms -- slowest robot ${sl.robot}: `
      + `${Math.round(sl.estimate_ms)} ms est, ${Math.round(sl.required_ms)} ms with safety`);
  }
  for (const r of compiled.robots) {
    const last = compiled.beats[compiled.beats.length - 1]?.robots[r.id];
    if (last) {
      const u = last.primitives.length ? last.primitives[last.primitives.length - 1].uAfter : last.uAfter;
      lines.push(`  robot ${r.id} ends at (${Math.round(last.poseAfter.x)}, ${Math.round(last.poseAfter.y)}) `
        + `${last.poseAfter.theta.toFixed(1)} deg, r=${Math.round(u.r)} mm, sigma=${u.sigma_theta.toFixed(1)} deg`);
    }
  }
  for (const w of validation.warnings) lines.push(`WARNING [${w.check}] ${w.message}`);
  for (const e of validation.errors) lines.push(`ERROR   [${e.check}] ${e.message}`);
  lines.push(validation.ok ? 'OK -- no errors' : `FAILED -- ${validation.errors.length} error(s)`);
  return lines.join('\n');
}

function main(argv) {
  const [showPath, outDir] = argv;
  if (!showPath) {
    console.error('usage: node tools/build.js <show.json> [out-dir]');
    return 2;
  }
  const show = JSON.parse(readFileSync(resolve(showPath), 'utf8'));
  const compiled = compileShow(show);
  const validation = validateShow(compiled);
  console.log(report(compiled, validation));
  if (!validation.ok) return 1;
  if (!outDir) return 0;

  const { files, errors } = emitAll(compiled, { ...loadDeps(), validation });
  mkdirSync(resolve(outDir), { recursive: true });
  const transport = new ManualTransport((name, text) => writeFileSync(join(resolve(outDir), name), text, 'utf8'));
  for (const [id, text] of Object.entries(files)) {
    transport.stage(Number(id), fileNameFor(Number(id)), text);
  }
  transport.flush();
  for (const id of Object.keys(files)) console.log(`wrote ${join(outDir, fileNameFor(Number(id)))}`);
  for (const [id, msg] of Object.entries(errors)) console.log(`robot ${id}: NOT emitted -- ${msg}`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
