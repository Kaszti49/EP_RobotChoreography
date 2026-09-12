// =====================================================================
//  emit.js -- compiled show -> one paste-ready Arduino .txt per robot
//
//  The output is templates/show_template.txt with four substitutions:
//    @@ROBOT@@          the robot id (header comment and #define)
//    @@<CONST>@@        block 2, from data/robots.json
//    @@KOREOGRAFIA@@    block 6, generated here
//  Blocks 3, 4, 5, 7, 8 -- the proven motion engine -- pass through
//  untouched. If you think there is a bug in them, report it; do not
//  patch it here.
//
//  Refuses to emit when the validator reported errors, or when the
//  robot's calibration in robots.json is null (robots 2-5 until they
//  are measured -- MERESI_MENET.md).
// =====================================================================

import { OPS } from './config.js';

export class EmitError extends Error {
  constructor(message, { robot = null } = {}) {
    super(message);
    this.name = 'EmitError';
    this.robot = robot;
  }
}

// How each block-2 constant is printed. Order matches the template.
export const CALIBRATION_FORMAT = Object.freeze({
  MM_PER_IMP_BAL: (v) => v.toFixed(5),
  MM_PER_IMP_JOBB: (v) => v.toFixed(5),
  PWM_PER_MMS: (v) => v.toFixed(5),
  PWM_NULLA: (v) => v.toFixed(2),
  NYOMTAV_MM: (v) => v.toFixed(1),
  PORGES_TRIM: (v) => v.toFixed(2),
  BAL_TRIM: (v) => v.toFixed(3),
  PWM_MIN: (v) => String(Math.round(v)),
});

/** The emitted sketches are ASCII only (serial/BT log safety). */
export function toAscii(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e\n\t]/g, '?');
}

function findRobot(robotsData, robotId) {
  const list = robotsData?.robots ?? robotsData;
  if (!Array.isArray(list)) throw new EmitError('robots.json must contain a "robots" array');
  const r = list.find((x) => x.id === robotId);
  if (!r) throw new EmitError(`robot ${robotId} is not in robots.json`, { robot: robotId });
  return r;
}

export function checkCalibration(robotEntry) {
  const cal = robotEntry.calibration;
  if (!cal || typeof cal !== 'object') {
    throw new EmitError(
      `robot ${robotEntry.id} has no calibration yet (null in robots.json). `
      + 'Measure it with MERESI_MENET.md (T2 -> T1 -> T5 -> T7 -> SHOW tuning) and fill in its block-2 constants. '
      + "Refusing to emit -- a file full of robot 1's numbers would look valid and drive wrong.",
      { robot: robotEntry.id },
    );
  }
  for (const name of Object.keys(CALIBRATION_FORMAT)) {
    const v = cal[name];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new EmitError(`robot ${robotEntry.id}: calibration.${name} is missing or not a number`, { robot: robotEntry.id });
    }
  }
  return cal;
}

function checkValidation(validation) {
  if (!validation) throw new EmitError('emit needs the validation result; run validateShow() first');
  if (!validation.ok) {
    const list = validation.errors.map((e) => `  - ${e.message}`).join('\n');
    throw new EmitError(`refusing to emit: the show has ${validation.errors.length} validation error(s):\n${list}`);
  }
}

const fmtCm = (v) => v.toFixed(1);
const fmtDeg = (v) => v.toFixed(1);

function primitiveCall(p) {
  const arg = (p.op === OPS.FORWARD || p.op === OPS.BACKWARD) ? fmtCm(p.value) : fmtDeg(p.value);
  return `${p.op}(${arg});`;
}

function poseComment(pose, u) {
  return `-> (${Math.round(pose.x)}, ${Math.round(pose.y)}) ${pose.theta.toFixed(1)} deg  r=${Math.round(u.r)} mm`;
}

/** The lines of the koreografia() body for one robot. */
export function koreografiaLines(compiled, robotId) {
  const lines = [];
  const pad = (s, w) => s + ' '.repeat(Math.max(1, w - s.length));
  for (const beat of compiled.beats) {
    const br = beat.robots[robotId];
    const tag = `[${beat.index + 1} ${toAscii(beat.name)}]`;
    const prims = br.primitives;
    if (prims.length === 0) {
      const note = beat.anchor ? 'ANCHOR: re-place the robot on its mark by hand' : 'hold';
      lines.push(`  ${pad('lepes_kezd();', 15)}${pad('', 22)}${pad(`lepes_var(${beat.duration_ms});`, 20)}// ${tag} ${note} ${poseComment(br.poseAfter, br.uAfter)}`);
    } else if (prims.length === 1) {
      const p = prims[0];
      lines.push(`  ${pad('lepes_kezd();', 15)}${pad(primitiveCall(p), 22)}${pad(`lepes_var(${beat.duration_ms});`, 20)}// ${tag} ${poseComment(p.poseAfter, p.uAfter)}`);
    } else {
      lines.push(`  ${pad('lepes_kezd();', 15)}${pad('', 22)}${pad('', 20)}// ${tag} ${prims.length} moves in ${beat.duration_ms} ms`);
      for (const p of prims) {
        lines.push(`  ${pad('', 15)}${pad(primitiveCall(p), 22)}${pad('', 20)}// ${tag} ${poseComment(p.poseAfter, p.uAfter)}`);
      }
      lines.push(`  ${pad('', 15)}${pad('', 22)}${pad(`lepes_var(${beat.duration_ms});`, 20)}// ${tag} end`);
    }
  }
  return lines;
}

/**
 * @param compiled   output of compileShow()
 * @param robotId    which robot's file to produce
 * @param deps       { template: string, robots: robots.json object, validation: validateShow() result }
 * @returns {string} the complete sketch, LF line endings, ASCII only
 */
export function emitRobot(compiled, robotId, { template, robots, validation }) {
  checkValidation(validation);
  if (!compiled.robots.some((r) => r.id === robotId)) {
    throw new EmitError(`robot ${robotId} is not part of this show`, { robot: robotId });
  }
  const entry = findRobot(robots, robotId);
  const cal = checkCalibration(entry);

  let text = template.replace(/\r\n?/g, '\n');
  const missing = [];
  const sub = (key, value) => {
    const token = `@@${key}@@`;
    if (!text.includes(token)) missing.push(token);
    text = text.split(token).join(value);
  };
  sub('ROBOT', String(robotId));
  for (const [name, fmt] of Object.entries(CALIBRATION_FORMAT)) sub(name, fmt(cal[name]));
  sub('KOREOGRAFIA', koreografiaLines(compiled, robotId).join('\n'));
  if (missing.length) throw new EmitError(`template is missing placeholders: ${missing.join(', ')}`);

  const leftover = text.match(/@@[A-Z_]+@@/);
  if (leftover) throw new EmitError(`template placeholder not filled: ${leftover[0]}`);
  return toAscii(text);
}

/** Emit every robot of the show. Returns { files: {id: text}, errors: {id: message} }. */
export function emitAll(compiled, deps) {
  checkValidation(deps.validation);
  const files = {};
  const errors = {};
  for (const r of compiled.robots) {
    try { files[r.id] = emitRobot(compiled, r.id, deps); }
    catch (e) { errors[r.id] = e.message; }
  }
  return { files, errors };
}

export function fileNameFor(robotId) {
  return `SHOW_robot${robotId}.txt`;
}
