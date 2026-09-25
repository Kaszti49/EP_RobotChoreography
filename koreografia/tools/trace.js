#!/usr/bin/env node
// =====================================================================
//  trace.js -- where did the robot's ENCODERS say it went, beat by beat?
//
//  Reads a run log (the robot's "megy ... | cel a/b -> bal=x jobb=y" and
//  "porog ..." lines, as written by tools/run-one.ps1 or startall.ps1),
//  pairs every line with the primitive the compiler planned for that
//  robot, dead-reckons the pose from the ACTUAL pulse counts with the
//  robot's calibration, and prints per move and per beat:
//
//    * sum error   -- actual (bal + jobb) vs the target sum, in pulses:
//                     the engine's own criterion (TURES_IMP = 16)
//    * split       -- how the two wheels shared it; in a spin an uneven
//                     split means the robot walked while turning
//    * encoder pose vs planned pose at the end of every beat
//
//  The left wheel's scale is MM_PER_IMP_BAL / BAL_TRIM (BAL_TRIM says how
//  many more left pulses a straight needs on the floor), so a robot that
//  drives straight with its calibration traces straight here; and the
//  track is NYOMTAV_MM scaled the same way, so a spin whose raw pulse sum
//  is on target traces its calibrated angle. Both are "what the
//  calibration claims", not a measurement.
//
//  What the trace cannot see is slip: the wheel turned, the floor did not
//  move under it. So: if the ENCODER pose matches the plan but the robot
//  is not on its floor mark, the fix is NYOMTAV_MM / PORGES_TRIM_* /
//  BAL_TRIM / MM_PER_IMP. If the encoder pose itself is off, the engine
//  did not reach its target -- look at the sum error of that move.
//
//  usage:
//    node tools/trace.js <run.log> --robot 5 [--show data/keringo-show.json]
// =====================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { compileShow } from '../core/compile.js';
import { CALIBRATION_DEFAULTS } from '../core/emit.js';
import { normalizeAngle } from '../core/pose.js';
import { loadDeps } from './build.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const MOVE_RE = /^(megy|porog)\s+(-?[\d.]+)\s*(cm|fok)\s*\|\s*cel\s+(-?\d+)\/(-?\d+)\s*->\s*bal=(-?\d+)\s+jobb=(-?\d+)/;

/** The move lines of a log, in order. */
export function parseLog(text) {
  const out = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const m = raw.trim().match(MOVE_RE);
    if (!m) continue;
    out.push({
      kind: m[1], value: Number(m[2]), unit: m[3],
      celB: Number(m[4]), celJ: Number(m[5]), bal: Number(m[6]), jobb: Number(m[7]),
    });
  }
  return out;
}

/** Differential-drive step from per-wheel travel in mm (exact arc). Heading in degrees, CCW positive. */
export function deadReckon(pose, dL, dR, track) {
  const th = pose.theta * Math.PI / 180;
  const dth = (dR - dL) / track;
  let x = pose.x, y = pose.y;
  if (Math.abs(dth) < 1e-9) {
    const d = (dL + dR) / 2;
    x += d * Math.cos(th); y += d * Math.sin(th);
  } else {
    const R = (track / 2) * (dL + dR) / (dR - dL);
    x += R * (Math.sin(th + dth) - Math.sin(th));
    y -= R * (Math.cos(th + dth) - Math.cos(th));
  }
  return { x, y, theta: normalizeAngle(pose.theta + dth * 180 / Math.PI) };
}

const opKind = (op) => (op === 'elore_cm' || op === 'hatra_cm') ? 'megy' : 'porog';
const fmt = (v, w = 6, d = 0) => v.toFixed(d).padStart(w);
const fmtPose = (p) => `(${fmt(p.x, 5)}, ${fmt(p.y, 5)}) ${fmt(normalizeAngle(p.theta), 6, 1)} deg`;
const deg360 = (t) => ((t % 360) + 360) % 360;

export function traceRun(logText, { show, robots, robotId }) {
  const compiled = compileShow(show);
  const entry = robots.robots.find((r) => r.id === robotId);
  if (!entry?.calibration) throw new Error(`robot ${robotId} has no calibration in robots.json`);
  const cal = { ...CALIBRATION_DEFAULTS, ...entry.calibration };
  const moves = parseLog(logText);
  const start = compiled.robots.find((r) => r.id === robotId)?.start;
  if (!start) throw new Error(`robot ${robotId} is not in the show`);

  // NYOMTAV_MM was tuned against the engine's RAW pulse sum (MM_PER_IMP x
  // pulses, no BAL_TRIM); with the left wheel rescaled above, the same
  // spin must still come out at its calibrated angle -> effective track.
  const track = cal.NYOMTAV_MM * (1 + 1 / cal.BAL_TRIM) / 2;

  const lines = [];
  let pose = { ...start };
  let k = 0;
  let worstSum = 0, worstSplit = 0;
  lines.push(`robot ${robotId}: ${moves.length} move lines in the log; calibration MM_PER_IMP ${cal.MM_PER_IMP_BAL}/${cal.MM_PER_IMP_JOBB}, NYOMTAV ${cal.NYOMTAV_MM}, trims ${cal.PORGES_TRIM}x${cal.PORGES_TRIM_BAL}/${cal.PORGES_TRIM_JOBB}, BAL_TRIM ${cal.BAL_TRIM}`);
  lines.push(`start ${fmtPose(start)}`);
  lines.push('');
  lines.push('  move                      target b/j      actual b/j    sum err   split (b% / j%)   encoder pose after');
  for (const beat of compiled.beats) {
    const br = beat.robots[robotId];
    const tag = `[${beat.index + 1} ${beat.name}]`;
    for (const p of br.primitives) {
      const m = moves[k];
      if (!m) { lines.push(`  ${tag} ${p.op}(${p.value}) -- NO LOG LINE (run stopped early?)`); continue; }
      if (m.kind !== opKind(p.op)) {
        lines.push(`  ${tag} ${p.op}(${p.value}) -- log has "${m.kind} ${m.value} ${m.unit}" here: log and show do not match, stopping`);
        return { text: lines.join('\n'), ok: false };
      }
      k++;
      // BAL_TRIM was tuned so that bal = BAL_TRIM x jobb pulses drives STRAIGHT on
      // the floor, i.e. the left wheel really covers MM_PER_IMP_BAL / BAL_TRIM per
      // pulse. Without this the trace would call the calibration a heading drift.
      const dL = m.bal * cal.MM_PER_IMP_BAL / cal.BAL_TRIM, dR = m.jobb * cal.MM_PER_IMP_JOBB;
      // a spin's trims are floor calibration too: the engine turns fewer
      // pulses for the same angle, so the effective track shrinks with them
      const spinTrim = m.kind === 'porog' ? cal.PORGES_TRIM * (m.celB < 0 ? cal.PORGES_TRIM_BAL : cal.PORGES_TRIM_JOBB) : 1;
      pose = deadReckon(pose, dL, dR, track * spinTrim);
      if (m.kind === 'porog') pose.theta = normalizeAngle(pose.theta + (m.celB < 0 ? 1 : -1) * cal.PORGES_OFFSET_FOK);
      // the engine's own target: block-4 direction trim on a spin
      let celB = Math.abs(m.celB), celJ = Math.abs(m.celJ);
      if (m.kind === 'porog') {
        // the printed target already carries PORGES_TRIM (block 5); block 4 adds the direction trim and the offset
        const trim = m.celB < 0 ? cal.PORGES_TRIM_BAL : cal.PORGES_TRIM_JOBB;
        const offMm = Math.PI * cal.NYOMTAV_MM * (cal.PORGES_OFFSET_FOK / 360);
        celB = Math.max(0, Math.round(celB * trim) - Math.round(offMm / cal.MM_PER_IMP_BAL));
        celJ = Math.max(0, Math.round(celJ * trim) - Math.round(offMm / cal.MM_PER_IMP_JOBB));
        if (celB + celJ < 1) { lines.push(`  ${tag.padEnd(28).slice(0, 28)}${m.kind} ${fmt(m.value, 5)} ${m.unit}  -- below the spin offset, engine skips it`); continue; }
      }
      const gotB = m.bal * Math.sign(m.celB || 1), gotJ = m.jobb * Math.sign(m.celJ || 1);
      const sumErr = (gotB + gotJ) - (celB + celJ);
      const pB = celB ? 100 * gotB / celB : 100, pJ = celJ ? 100 * gotJ / celJ : 100;
      const split = pB - pJ;
      worstSum = Math.max(worstSum, Math.abs(sumErr)); worstSplit = Math.max(worstSplit, Math.abs(split));
      const flag = Math.abs(sumErr) > 16 ? ' <-- sum off' : (Math.abs(split) > 3 ? ' <-- uneven split' : '');
      const label = `${m.kind} ${fmt(m.value, 5)} ${m.unit}`;
      lines.push(`  ${tag.padEnd(28).slice(0, 28)}${label.padEnd(14)}${fmt(m.celB, 6)}/${fmt(m.celJ, 5)}   ${fmt(m.bal, 6)}/${fmt(m.jobb, 5)}   ${fmt(sumErr, 6)}   ${fmt(pB, 6, 1)} / ${fmt(pJ, 5, 1)}   ${fmtPose(pose)}${flag}`);
    }
    if (br.primitives.length === 0 && !moves[k] && k >= moves.length) { /* hold after an early stop: nothing to say */ }
    const plan = br.poseAfter;
    const dx = pose.x - plan.x, dy = pose.y - plan.y, dth = normalizeAngle(pose.theta - plan.theta);
    const dist = Math.hypot(dx, dy);
    const mark = br.primitives.length ? (dist > 50 || Math.abs(dth) > 5 ? '  <-- off plan' : '') : '';
    lines.push(`  ${tag.padEnd(28).slice(0, 28)}beat end: plan ${fmtPose(plan)} | encoder ${fmtPose(pose)} | d = ${fmt(dist, 4)} mm, ${fmt(dth, 5, 1)} deg${beat.anchor ? '  (anchor)' : ''}${mark}`);
  }
  if (k < moves.length) lines.push(`  !!! ${moves.length - k} extra move line(s) in the log after the last planned move`);
  lines.push('');
  lines.push(`worst sum error ${worstSum} imp (engine tolerance 16), worst split ${worstSplit.toFixed(1)} % (spins: the loaded backward wheel lags)`);
  lines.push(`end: plan ${fmtPose(compiled.beats.at(-1).robots[robotId].poseAfter)} | encoder ${fmtPose(pose)} (heading ${deg360(pose.theta).toFixed(1)} deg)`);
  return { text: lines.join('\n'), ok: k === moves.length && moves.length > 0, pose };
}

function main(argv) {
  const args = [...argv];
  const opt = { show: join(root, 'data', 'keringo-show.json'), robot: null, log: null };
  while (args.length) {
    const a = args.shift();
    if (a === '--robot') opt.robot = Number(args.shift());
    else if (a === '--show') opt.show = resolve(args.shift());
    else opt.log = resolve(a);
  }
  if (!opt.log || !opt.robot) {
    console.error('usage: node tools/trace.js <run.log> --robot <N> [--show data/keringo-show.json]');
    return 2;
  }
  const show = JSON.parse(readFileSync(opt.show, 'utf8'));
  const { robots } = loadDeps();
  const r = traceRun(readFileSync(opt.log, 'utf8'), { show, robots, robotId: opt.robot });
  console.log(r.text);
  return r.ok ? 0 : 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exit(main(process.argv.slice(2)));
}
