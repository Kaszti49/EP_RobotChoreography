// =====================================================================
//  compile.js -- show JSON (world coordinates) -> primitive sequences
//
//  Input: the show file format documented in ../README.md.
//  Output: a "compiled show" -- the same beats, but for every robot and
//  every beat the list of primitives, the pose before/after each one,
//  and the uncertainty before/after each one. Nothing downstream
//  (validate, emit, UI) recomputes any of that; they read it from here.
//
//  goto compiles to the classic turn -> drive -> turn. With
//  config.compiler.allow_reverse the compiler may drive backwards when
//  that saves rotation (off by default -- backward driving is worse on
//  this hardware).
//
//  Structural problems (unknown robot id, bad move type, ...) throw a
//  CompileError that names the beat and robot. Physical problems are
//  the validator's job.
// =====================================================================

import { DEFAULT_CONFIG, FIELD_DEFAULT, OPS } from './config.js';
import {
  makePose, distance, headingTo, deltaHeading, normalizeAngle,
  turnPrimitive, drivePrimitive, applyPrimitive,
} from './pose.js';
import { initialUncertainty, propagatePrimitive } from './uncertainty.js';
import { estimatePrimitiveMs } from './duration.js';

export class CompileError extends Error {
  constructor(message, { beat = null, robot = null } = {}) {
    super(message);
    this.name = 'CompileError';
    this.beat = beat;
    this.robot = robot;
  }
}

const MOVE_TYPES = new Set(['goto', 'primitive', 'hold']);

// Ops accepted in an explicit "primitive" move. porog_fok is the raw
// engine call (positive = clockwise) and is folded into balra/jobbra.
const PRIMITIVE_ALIASES = Object.freeze({
  elore_cm: (v) => ({ op: OPS.FORWARD, value: v }),
  hatra_cm: (v) => ({ op: OPS.BACKWARD, value: v }),
  balra_fok: (v) => ({ op: OPS.LEFT, value: v }),
  jobbra_fok: (v) => ({ op: OPS.RIGHT, value: v }),
  porog_fok: (v) => (v >= 0 ? { op: OPS.RIGHT, value: v } : { op: OPS.LEFT, value: -v }),
  balra_kor: (v) => ({ op: OPS.LEFT, value: v * 360 }),
  jobbra_kor: (v) => ({ op: OPS.RIGHT, value: v * 360 }),
});

function roundTo(value, decimals) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** Quantise a primitive to what the emitter prints; drop it if it vanishes. */
export function quantizePrimitive(prim, compiler = DEFAULT_CONFIG.compiler) {
  if (!prim) return null;
  const isDriveOp = prim.op === OPS.FORWARD || prim.op === OPS.BACKWARD;
  const value = roundTo(prim.value, isDriveOp ? compiler.cm_decimals : compiler.deg_decimals);
  const min = isDriveOp ? compiler.min_drive_cm : compiler.min_turn_deg;
  if (value < min) return null;
  return { op: prim.op, value };
}

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

// ---------------------------------------------------------------------
//  Per-move compilers. Each returns an array of un-quantised primitives.
// ---------------------------------------------------------------------

/** turn -> drive -> [turn].  `face` optional (absolute world heading). */
export function compileGoto(pose, move, compiler = DEFAULT_CONFIG.compiler) {
  const target = { x: move.x, y: move.y };
  const rawDist = distance(pose, target);
  const hasFace = isFiniteNumber(move.face);

  // A distance that would quantise to nothing is treated as zero, so a
  // goto to (almost) the current position does not turn towards a
  // heading made of floating-point noise.
  const moving = rawDist >= compiler.min_drive_cm * 10;
  const dist = moving ? rawDist : 0;

  // Candidate A: face the target and drive forward.
  const forwardDelta = moving ? deltaHeading(pose.theta, headingTo(pose, target)) : 0;
  const forwardPlan = plan(pose, forwardDelta, dist, false, hasFace ? move.face : null, compiler);

  if (!compiler.allow_reverse || !moving) return forwardPlan.prims;

  // Candidate B: face away from the target and drive backward.
  const reverseDelta = normalizeAngle(forwardDelta + 180);
  const reversePlan = plan(pose, reverseDelta, dist, true, hasFace ? move.face : null, compiler);

  return reversePlan.rotation < forwardPlan.rotation ? reversePlan.prims : forwardPlan.prims;
}

function plan(pose, firstDelta, dist, backward, face, compiler) {
  const prims = [];
  let rotation = 0;
  let cur = pose;

  const t1 = quantizePrimitive(turnPrimitive(firstDelta), compiler);
  if (t1) { prims.push(t1); cur = applyPrimitive(cur, t1); rotation += t1.value; }

  const d = quantizePrimitive(drivePrimitive(dist, backward), compiler);
  if (d) { prims.push(d); cur = applyPrimitive(cur, d); }

  if (face !== null) {
    const t2 = quantizePrimitive(turnPrimitive(deltaHeading(cur.theta, face)), compiler);
    if (t2) { prims.push(t2); rotation += t2.value; }
  }
  return { prims, rotation };
}

export function compilePrimitiveMove(move, compiler = DEFAULT_CONFIG.compiler, where = {}) {
  const alias = PRIMITIVE_ALIASES[move.op];
  if (!alias) {
    throw new CompileError(`unknown primitive op "${move.op}" (known: ${Object.keys(PRIMITIVE_ALIASES).join(', ')})`, where);
  }
  if (!isFiniteNumber(move.value)) {
    throw new CompileError(`primitive "${move.op}" needs a numeric value`, where);
  }
  if (move.op !== 'porog_fok' && move.value < 0) {
    throw new CompileError(`primitive "${move.op}" takes a non-negative value (use the opposite op instead of a sign)`, where);
  }
  const q = quantizePrimitive(alias(move.value), compiler);
  return q ? [q] : [];
}

// ---------------------------------------------------------------------
//  Show-level structural checks
// ---------------------------------------------------------------------

function checkShowStructure(show) {
  if (!show || typeof show !== 'object') throw new CompileError('show must be an object');
  if (!Array.isArray(show.robots) || show.robots.length === 0) {
    throw new CompileError('show.robots must be a non-empty array');
  }
  const ids = new Set();
  for (const r of show.robots) {
    if (!Number.isInteger(r?.id)) throw new CompileError('every robot needs an integer id');
    if (ids.has(r.id)) throw new CompileError(`duplicate robot id ${r.id}`, { robot: r.id });
    ids.add(r.id);
    const s = r.start;
    if (!s || !isFiniteNumber(s.x) || !isFiniteNumber(s.y) || !isFiniteNumber(s.theta)) {
      throw new CompileError(`robot ${r.id}: start must have numeric x, y, theta`, { robot: r.id });
    }
  }
  if (!Array.isArray(show.beats)) throw new CompileError('show.beats must be an array');
  show.beats.forEach((b, i) => {
    if (!b || typeof b !== 'object') throw new CompileError(`beat ${i}: must be an object`, { beat: i });
    if (!Number.isInteger(b.duration_ms) || b.duration_ms <= 0) {
      throw new CompileError(`beat ${i} "${b.name ?? ''}": duration_ms must be a positive integer`, { beat: i });
    }
    const moves = b.moves ?? {};
    if (typeof moves !== 'object' || Array.isArray(moves)) {
      throw new CompileError(`beat ${i}: moves must be an object keyed by robot id`, { beat: i });
    }
    for (const key of Object.keys(moves)) {
      const id = Number(key);
      if (!ids.has(id)) throw new CompileError(`beat ${i} "${b.name ?? ''}": move for unknown robot "${key}"`, { beat: i, robot: id });
      const m = moves[key];
      if (!m || !MOVE_TYPES.has(m.type)) {
        throw new CompileError(`beat ${i} "${b.name ?? ''}", robot ${id}: move type must be one of ${[...MOVE_TYPES].join(', ')}`, { beat: i, robot: id });
      }
      if (m.type === 'goto' && (!isFiniteNumber(m.x) || !isFiniteNumber(m.y))) {
        throw new CompileError(`beat ${i} "${b.name ?? ''}", robot ${id}: goto needs numeric x and y`, { beat: i, robot: id });
      }
    }
  });
}

const HOLD = Object.freeze({ type: 'hold' });

// ---------------------------------------------------------------------
//  The compiler proper
// ---------------------------------------------------------------------

/**
 * @param {object} show    parsed show JSON
 * @param {object} config  see config.js DEFAULT_CONFIG / makeConfig()
 * @returns {object}       compiled show (see header)
 */
export function compileShow(show, config = DEFAULT_CONFIG) {
  checkShowStructure(show);

  const field = Object.freeze({ ...FIELD_DEFAULT, ...(show.field ?? {}) });
  const robots = show.robots.map((r) => Object.freeze({
    id: r.id,
    start: makePose(r.start.x, r.start.y, r.start.theta),
  }));

  // running state per robot
  const pose = new Map(robots.map((r) => [r.id, r.start]));
  const unc = new Map(robots.map((r) => [r.id, initialUncertainty(config.error)]));

  const beats = show.beats.map((beat, index) => {
    const perRobot = {};
    for (const robot of robots) {
      const move = beat.moves?.[String(robot.id)] ?? HOLD;
      const where = { beat: index, robot: robot.id };
      const poseBefore = pose.get(robot.id);
      const uBefore = unc.get(robot.id);

      let prims;
      if (move.type === 'goto') prims = compileGoto(poseBefore, move, config.compiler);
      else if (move.type === 'primitive') prims = compilePrimitiveMove(move, config.compiler, where);
      else prims = [];

      let curPose = poseBefore;
      let curU = uBefore;
      const primitives = prims.map((p) => {
        const next = applyPrimitive(curPose, p);
        const nextU = propagatePrimitive(curU, p, config.error);
        const rec = Object.freeze({
          op: p.op,
          value: p.value,
          poseBefore: curPose,
          poseAfter: next,
          uBefore: curU,
          uAfter: nextU,
          estimate_ms: estimatePrimitiveMs(p, config.timing),
        });
        curPose = next;
        curU = nextU;
        return rec;
      });

      // An anchor beat is a hold during which humans re-place every robot
      // on its planned mark; the error budget restarts from placement error.
      if (beat.anchor) curU = initialUncertainty(config.error);

      perRobot[robot.id] = Object.freeze({
        move,
        primitives: Object.freeze(primitives),
        poseBefore,
        poseAfter: curPose,
        uBefore,
        uAfter: curU,
      });
      pose.set(robot.id, curPose);
      unc.set(robot.id, curU);
    }
    return Object.freeze({
      index,
      name: beat.name ?? `beat ${index + 1}`,
      duration_ms: beat.duration_ms,
      anchor: Boolean(beat.anchor),
      robots: Object.freeze(perRobot),
    });
  });

  return Object.freeze({ field, config, robots: Object.freeze(robots), beats: Object.freeze(beats) });
}

/** Flat primitive list of one robot across the whole show (for tests / parsers). */
export function primitivesOf(compiled, robotId) {
  return compiled.beats.flatMap((b) => b.robots[robotId].primitives.map((p) => ({ op: p.op, value: p.value })));
}
