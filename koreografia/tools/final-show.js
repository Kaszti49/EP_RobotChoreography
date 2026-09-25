#!/usr/bin/env node
// =====================================================================
//  final-show.js -- regenerate ../FINAL_SHOW.md for the approved show
//
//  usage:
//    node tools/final-show.js [data/keringo-show.json] [../FINAL_SHOW.md]
//
//  The document is the record of what is flashed on the robots: the show's
//  beat table with every robot's planned pose, the validator settings it
//  was approved under, and the complete emitted sketch of every robot.
//  A robot whose robots.json calibration is still null (robot 5 while it
//  is under test) gets its block 2 filled with TODO_ROBOT<N>_* identifiers
//  instead of numbers -- the sketch is complete but deliberately does not
//  compile until the real values are in robots.json and this is re-run.
// =====================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { compileShow } from '../core/compile.js';
import { validateShow } from '../core/validate.js';
import { emitRobot, CALIBRATION_DEFAULTS } from '../core/emit.js';
import { DEFAULT_CONFIG } from '../core/config.js';
import { loadDeps } from './build.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const CAL_KEYS = ['MM_PER_IMP_BAL', 'MM_PER_IMP_JOBB', 'PWM_PER_MMS', 'PWM_NULLA', 'NYOMTAV_MM', 'PORGES_TRIM', 'BAL_TRIM', 'PWM_MIN',
  'PORGES_PWM', 'PORGES_TRIM_BAL', 'PORGES_TRIM_JOBB', 'PORGES_OFFSET_FOK', 'PORGES_LASSITAS_MM', 'FEK_ELLEN_PWM', 'TEMPO'];

const deg = (t) => Math.round(((t % 360) + 360) % 360);
const pose = (p) => `(${Math.round(p.x)}, ${Math.round(p.y)}) ${deg(p.theta)}°`;
const sec = (ms) => (ms / 1000).toString().replace(/\.0$/, '');

/** Sketch text for a robot; a placeholder sketch when it has no calibration yet. */
function sketchFor(compiled, robotId, deps) {
  const entry = deps.robots.robots.find((r) => r.id === robotId);
  if (entry.calibration) return { text: emitRobot(compiled, robotId, deps), placeholder: false };
  // emit with dummy numbers, then swap every block-2 value for a TODO identifier
  const dummy = Object.fromEntries(CAL_KEYS.map((k) => [k, 1]));
  const robots = { robots: deps.robots.robots.map((r) => (r.id === robotId ? { ...r, calibration: dummy } : r)) };
  let text = emitRobot(compiled, robotId, { ...deps, robots });
  for (const k of CAL_KEYS) {
    const re = new RegExp(`^(const (?:float|int) ${k}\\s*=\\s*)[-0-9.]+;`, 'm');
    if (!re.test(text)) throw new Error(`block 2 line for ${k} not found`);
    text = text.replace(re, `$1TODO_ROBOT${robotId}_${k};   /* PLACEHOLDER -- robot ${robotId} not calibrated yet */`);
  }
  return { text, placeholder: true };
}

function main(argv) {
  const showPath = resolve(argv[0] ?? join(root, 'data', 'keringo-show.json'));
  const outPath = resolve(argv[1] ?? join(root, '..', 'FINAL_SHOW.md'));
  const show = JSON.parse(readFileSync(showPath, 'utf8'));
  const compiled = compileShow(show);
  const validation = validateShow(compiled);
  if (!validation.ok) {
    console.error(`show has ${validation.errors.length} validation error(s); not writing`);
    for (const e of validation.errors) console.error(`  - ${e.message}`);
    return 1;
  }
  const deps = { ...loadDeps(), validation };
  const total = compiled.beats.reduce((a, b) => a + b.duration_ms, 0);
  const today = new Date().toISOString().slice(0, 10);
  const cfg = DEFAULT_CONFIG;
  const L = [];

  L.push(`# FINAL_SHOW — "Keringő" (${show.robots.length} robots, ${sec(total)} s)`);
  L.push('');
  L.push(`Generated ${today} by \`node tools/final-show.js\` from \`koreografia/data/keringo-show.json\` and`);
  L.push('`koreografia/data/robots.json`. **Do not edit the sketches here by hand** — change the show JSON or');
  L.push('robots.json and re-run the tool; this file is the record of what is on the robots.');
  L.push('');
  const placeholders = deps.robots.robots.filter((r) => show.robots.some((s) => s.id === r.id) && !r.calibration).map((r) => r.id);
  if (placeholders.length) {
    L.push(`> **Robot ${placeholders.join(', ')}: PLACEHOLDER.** Calibration is still \`null\` in robots.json (under test). Its block 2`);
    L.push(`> below holds \`TODO_ROBOT${placeholders[0]}_*\` identifiers instead of numbers, so the sketch does not compile and cannot be`);
    L.push('> flashed by accident. Fill robots.json, re-run the tool, and this note disappears.');
    L.push('');
  }
  // a robot whose robots.json "measured" says provisional has bring-up numbers, not floor-tested ones
  const provisional = deps.robots.robots.filter((r) => show.robots.some((s) => s.id === r.id) && r.calibration && /provisional/i.test(r.measured ?? '')).map((r) => r.id);
  if (provisional.length) {
    L.push(`> **Robot ${provisional.join(', ')}: PROVISIONAL.** Its block 2 holds bring-up values (copied from robot 1, nothing measured`);
    L.push('> on the floor yet). The sketch compiles and can be flashed for the 1 m / 3-spin test, but the show numbers are not final:');
    L.push('> tune with `teszt-1m-3kor.json`, write the results into robots.json (and drop "provisional" from `measured`), re-run the tool.');
    L.push('');
  }
  L.push('Placement, floor marks and the pre-show checklist: [`SHOW_PREPARATION.md`](SHOW_PREPARATION.md).');
  L.push('');

  L.push('## The show');
  L.push('');
  L.push(`Field ${compiled.field.width_mm} × ${compiled.field.height_mm} mm, margin ${compiled.field.margin_mm} mm, audience along y = 0. `
    + 'Coordinates in mm, heading in degrees (0° = +x, counter-clockwise; 90° = facing away from the audience, 270° = facing it).');
  L.push('');
  // _comment wraps long sentences onto indented continuation lines
  const notes = [];
  for (const c of show._comment ?? []) {
    if (/^\s/.test(c) && notes.length) notes[notes.length - 1] += ` ${c.trim()}`;
    else notes.push(c.trim());
  }
  for (const n of notes) L.push(`- ${n}`);
  L.push('');
  L.push('### Beat table — planned pose of every robot at the END of each beat');
  L.push('');
  L.push('| # | t | slot | beat | ' + compiled.robots.map((r) => `robot ${r.id}`).join(' | ') + ' |');
  L.push('|---|---|---|---|' + compiled.robots.map(() => '---').join('|') + '|');
  let t = 0;
  for (const b of compiled.beats) {
    const name = b.anchor ? `**${b.name}** (break)` : b.name;
    L.push(`| ${b.index + 1} | ${sec(t)} s | ${sec(b.duration_ms)} s | ${name} | `
      + compiled.robots.map((r) => pose(b.robots[r.id].poseAfter)).join(' | ') + ' |');
    t += b.duration_ms;
  }
  L.push('');
  L.push(`Total ${sec(total)} s. The five 1 s breaks carry \`"anchor": true\`: the validator restarts the error budget there, `
    + 'i.e. it assumes every robot is on its planned mark at that moment (see the caveat below).');
  L.push('');

  L.push('## Validator settings this show was approved under');
  L.push('');
  L.push('| setting | value | note |');
  L.push('|---|---|---|');
  L.push(`| \`MIN_GAP_MM\` | ${cfg.min_gap_mm} | planned gap between bodies; 200 before 2026-09-21 |`);
  L.push(`| \`CLEARANCE_DRIFT_FACTOR\` | ${cfg.clearance_drift_factor} | 0 = clearance checks planned bodies only (drift not added); 1 = old expanded-disc rule |`);
  L.push(`| \`ROBOT_RADIUS_MM\` | ${cfg.robot_radius_mm} | column spacing 342 mm = 2 × 120 body + 100 gap + 2 quantisation |`);
  L.push(`| \`DRIFT_CEILING_MM\` | ${cfg.drift_ceiling_mm} | warning only |`);
  L.push(`| \`ERROR_MODEL\` | k_drive ${cfg.error.k_drive}, k_turn ${cfg.error.k_turn.toFixed(4)}, k_head ${cfg.error.k_head_per_mm} | PROVISIONAL, pessimistic — recalibrate from the floor tests |`);
  L.push('');
  L.push(`Result: ${validation.errors.length} errors, ${validation.warnings.length} warnings.`);
  L.push('');
  L.push('**Caveat.** With the provisional error model a 1 s break cannot really reset drift (nobody re-places five robots in a');
  L.push('second); the show is approved on the floor results (robots 1–4 land on their encoder targets), not on the model.');
  L.push('Once `ERROR_MODEL` is recalibrated, re-run `node tools/build.js data/keringo-show.json` and see whether the breaks');
  L.push('can lose the `anchor` flag.');
  L.push('');

  L.push('## Flashing');
  L.push('');
  L.push('1. `cd koreografia && node tools/serve.js` → http://localhost:8080/ui/?show=../data/keringo-show.json');
  L.push('2. Connect every robot (header **Csatlakozás**; a reload auto-connects named robots).');
  L.push('3. For each robot: pick it in the header → **→ Kód fülre** → **Fordít + Feltölt** (Ctrl+Enter). The pasted sketch');
  L.push('   must be byte-identical to the one below for that robot — same show, same robots.json.');
  L.push('4. Place the robots (`SHOW_PREPARATION.md`), Műszerfal → **▶ Start mind**. **■ STOP** stops everyone.');
  L.push('');
  L.push('CLI alternative: `node tools/build.js data/keringo-show.json out/` writes `out/SHOW_robot<N>.txt`, `node tools/firmware.js build <N> data/keringo-show.json` compiles it.');
  L.push('');

  L.push('## Calibration in use (block 2)');
  L.push('');
  L.push('| robot | measured | ' + CAL_KEYS.join(' | ') + ' |');
  L.push('|---|---|' + CAL_KEYS.map(() => '---').join('|') + '|');
  for (const r of compiled.robots) {
    const e = deps.robots.robots.find((x) => x.id === r.id);
    const cal = e.calibration ? { ...CALIBRATION_DEFAULTS, ...e.calibration } : null;
    const cells = cal ? CAL_KEYS.map((k) => String(cal[k])) : CAL_KEYS.map(() => '**TODO**');
    L.push(`| ${r.id} | ${e.measured ?? '—'} | ${cells.join(' | ')} |`);
  }
  L.push('');

  // plain sketch files next to the document: what the Kod tab's "Betoltes" loads (FINAL_SHOW.md itself is not a sketch)
  const showDir = join(dirname(outPath), 'show');
  mkdirSync(showDir, { recursive: true });
  L.push('## Sketches');
  L.push('');
  L.push('The same sketches as plain files, one per robot, for the Kod tab\x27s **Betoltes** button: '
    + compiled.robots.map((r) => `\x60show/SHOW_robot${r.id}.txt\x60`).join(', ') + '. **This markdown file is not a sketch** -- do not paste it into the Kod tab.');
  L.push('');
  for (const r of compiled.robots) {
    const { text, placeholder } = sketchFor(compiled, r.id, deps);
    if (!placeholder) writeFileSync(join(showDir, `SHOW_robot${r.id}.txt`), text, 'utf8');
    const tag = placeholder ? ' — PLACEHOLDER (not calibrated, does not compile)' : provisional.includes(r.id) ? ' — PROVISIONAL (bring-up values, not floor-tested)' : '';
    L.push(`### Robot ${r.id}${tag}`);
    L.push('');
    L.push('```cpp');
    L.push(text.replace(/\n$/, ''));
    L.push('```');
    L.push('');
  }

  L.push('## Change log');
  L.push('');
  L.push('- 2026-09-21 — first approved version. Robots 1–4 from robots.json; robot 5 placeholder.');
  L.push('- 2026-09-21 — robot 5 replaced (bad encoders on the first chassis). New one flashed keret-ep v7, named TaborRobot-5,');
  L.push('  provisional bring-up calibration in robots.json (robot 1\'s numbers, NYOMTAV 148.3, PWM_MIN 45) — marked PROVISIONAL here.');
  L.push('- 2026-09-21 — **robot 5 approved** after two 1 m / 3-spin runs (`RobotBaseStats/SHOW_robot5.md`): NYOMTAV 158.6,');
  L.push('  BAL_TRIM 1.020. All five robots final; this is the version to flash for the first full rehearsal.');
  L.push('');

  const text = L.join('\n');
  writeFileSync(outPath, text, 'utf8');
  console.log(`wrote ${outPath} (${text.split('\n').length} lines, placeholders: ${placeholders.length ? placeholders.join(', ') : 'none'})`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
