// =====================================================================
//  validate.js -- every safety check on a compiled show
//
//  Five checks, each producing findings { check, severity, beat, robot,
//  robots, message }. Errors block emission; warnings do not.
//
//    bounds       expanded disc (r + robot radius) stays inside the
//                 field inset by the margin, sampled DURING each move
//    clearance    pairwise centre distance > r_i + r_j + 2*radius +
//                 min_gap, sampled >= N times across each beat using the
//                 timeline (robots move simultaneously within a beat)
//    feasibility  sum(estimate) * safety_factor <= duration_ms, and no
//                 single primitive trips the engine's IDOKORLAT
//    drift        warn once per robot when r crosses the ceiling
//    start        start poses inside the field and mutually clear
// =====================================================================

import { distance, interpolatePrimitive } from './pose.js';
import { lerpUncertainty } from './uncertainty.js';
import { stateAt } from './timeline.js';
import { exceedsMoveTimeout, requiredBeatMs, estimateSequenceMs } from './duration.js';

export const CHECKS = Object.freeze({
  BOUNDS: 'bounds',
  CLEARANCE: 'clearance',
  FEASIBILITY: 'feasibility',
  DRIFT: 'drift',
  START: 'start',
});

function finding(check, severity, message, { beat = null, robot = null, robots = null, t_ms = null } = {}) {
  return Object.freeze({ check, severity, message, beat, robot, robots, t_ms });
}

const fmt = (n) => Math.round(n);

// ---------------------------------------------------------------------
//  1. bounds
// ---------------------------------------------------------------------
function insideField(pose, radius, field) {
  const lo = field.margin_mm + radius;
  return pose.x >= lo && pose.y >= lo
    && pose.x <= field.width_mm - lo
    && pose.y <= field.height_mm - lo;
}

export function checkBounds(compiled) {
  const { field, config } = compiled;
  const n = config.validator.bounds_samples_per_primitive;
  const out = [];
  for (const beat of compiled.beats) {
    for (const robot of compiled.robots) {
      const br = beat.robots[robot.id];
      for (const p of br.primitives) {
        for (let k = 1; k <= n; k++) {
          const f = k / n;
          const pose = f === 1 ? p.poseAfter : interpolate(p, f);
          const u = lerpUncertainty(p.uBefore, p.uAfter, f);
          const radius = u.r + config.robot_radius_mm;
          if (!insideField(pose, radius, field)) {
            out.push(finding(CHECKS.BOUNDS, 'error',
              `robot ${robot.id} leaves the field in beat ${beat.index + 1} "${beat.name}" during ${p.op}(${p.value}): `
              + `centre (${fmt(pose.x)}, ${fmt(pose.y)}) with radius ${fmt(radius)} mm (r=${fmt(u.r)} + body ${config.robot_radius_mm}) `
              + `is outside the ${field.margin_mm} mm margin`,
              { beat: beat.index, robot: robot.id }));
            break; // one finding per primitive is enough
          }
        }
      }
    }
  }
  return out;
}

function interpolate(p, f) { return interpolatePrimitive(p.poseBefore, p, f); }

// ---------------------------------------------------------------------
//  2. clearance
// ---------------------------------------------------------------------
export function checkClearance(compiled) {
  const { config } = compiled;
  const n = config.validator.clearance_samples_per_beat;
  const out = [];
  const robots = compiled.robots;
  for (const beat of compiled.beats) {
    const reported = new Set();
    for (let k = 0; k <= n; k++) {
      const t = beat.duration_ms * (k / n);
      const states = robots.map((r) => stateAt(beat.robots[r.id], t));
      for (let i = 0; i < robots.length; i++) {
        for (let j = i + 1; j < robots.length; j++) {
          const key = `${robots[i].id}-${robots[j].id}`;
          if (reported.has(key)) continue;
          const a = states[i];
          const b = states[j];
          const d = distance(a.pose, b.pose);
          const need = a.uncertainty.r + b.uncertainty.r + 2 * config.robot_radius_mm + config.min_gap_mm;
          if (d < need) {
            reported.add(key);
            out.push(finding(CHECKS.CLEARANCE, 'error',
              `robots ${robots[i].id} and ${robots[j].id} come too close in beat ${beat.index + 1} "${beat.name}" `
              + `at t=${fmt(t)} ms: centre distance ${fmt(d)} mm, need ${fmt(need)} mm `
              + `(r=${fmt(a.uncertainty.r)}+${fmt(b.uncertainty.r)}, bodies 2x${config.robot_radius_mm}, gap ${config.min_gap_mm})`,
              { beat: beat.index, robots: [robots[i].id, robots[j].id], t_ms: t }));
          }
        }
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------
//  3. beat feasibility
// ---------------------------------------------------------------------
export function checkFeasibility(compiled) {
  const { config } = compiled;
  const out = [];
  const stats = [];
  for (const beat of compiled.beats) {
    let slowest = null;
    for (const robot of compiled.robots) {
      const br = beat.robots[robot.id];
      const prims = br.primitives;
      for (const p of prims) {
        if (exceedsMoveTimeout(p, config.timing)) {
          out.push(finding(CHECKS.FEASIBILITY, 'error',
            `robot ${robot.id}, beat ${beat.index + 1} "${beat.name}": ${p.op}(${p.value}) alone takes longer than the engine's `
            + `${config.timing.move_timeout_ms} ms IDOKORLAT -- the move would be aborted mid-way; split it`,
            { beat: beat.index, robot: robot.id }));
        }
      }
      const est = estimateSequenceMs(prims, config.timing);
      const need = requiredBeatMs(prims, config.timing);
      if (!slowest || est > slowest.estimate_ms) slowest = { robot: robot.id, estimate_ms: est, required_ms: need };
      if (need > beat.duration_ms) {
        out.push(finding(CHECKS.FEASIBILITY, 'error',
          `robot ${robot.id} does not fit beat ${beat.index + 1} "${beat.name}": estimated ${fmt(est)} ms `
          + `x safety ${config.timing.safety_factor} = ${fmt(need)} ms > slot ${beat.duration_ms} ms`,
          { beat: beat.index, robot: robot.id }));
      }
    }
    stats.push({ beat: beat.index, name: beat.name, duration_ms: beat.duration_ms, slowest });
  }
  return { findings: out, stats };
}

// ---------------------------------------------------------------------
//  4. drift ceiling
// ---------------------------------------------------------------------
export function checkDrift(compiled) {
  const { config } = compiled;
  const out = [];
  const crossed = new Set();
  for (const beat of compiled.beats) {
    for (const robot of compiled.robots) {
      if (crossed.has(robot.id)) continue;
      const br = beat.robots[robot.id];
      const rEnd = br.primitives.length ? br.primitives[br.primitives.length - 1].uAfter.r : br.uBefore.r;
      if (rEnd > config.drift_ceiling_mm) {
        crossed.add(robot.id);
        out.push(finding(CHECKS.DRIFT, 'warning',
          `robot ${robot.id}: position error radius reaches ${fmt(rEnd)} mm in beat ${beat.index + 1} "${beat.name}" `
          + `(ceiling ${config.drift_ceiling_mm} mm). Insert an anchor beat ("anchor": true -- a hold where the robots `
          + `are re-placed by hand) before this beat, or shorten the path.`,
          { beat: beat.index, robot: robot.id }));
      }
    }
    // an anchor resets the budget, so a robot may cross again later
    if (beat.anchor) crossed.clear();
  }
  return out;
}

// ---------------------------------------------------------------------
//  5. start pose sanity
// ---------------------------------------------------------------------
export function checkStart(compiled) {
  const { field, config } = compiled;
  const out = [];
  const r0 = config.error.initial_r_mm;
  const robots = compiled.robots;
  for (const robot of robots) {
    if (!insideField(robot.start, r0 + config.robot_radius_mm, field)) {
      out.push(finding(CHECKS.START, 'error',
        `robot ${robot.id} starts outside the field: (${fmt(robot.start.x)}, ${fmt(robot.start.y)}) `
        + `with body ${config.robot_radius_mm} mm inside a ${field.width_mm}x${field.height_mm} field with ${field.margin_mm} mm margin`,
        { beat: 0, robot: robot.id }));
    }
  }
  for (let i = 0; i < robots.length; i++) {
    for (let j = i + 1; j < robots.length; j++) {
      const d = distance(robots[i].start, robots[j].start);
      const need = 2 * r0 + 2 * config.robot_radius_mm + config.min_gap_mm;
      if (d < need) {
        out.push(finding(CHECKS.START, 'error',
          d === 0
            ? `robots ${robots[i].id} and ${robots[j].id} start on the same point`
            : `robots ${robots[i].id} and ${robots[j].id} start too close: ${fmt(d)} mm apart, need ${fmt(need)} mm`,
          { beat: 0, robots: [robots[i].id, robots[j].id] }));
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------
//  all together
// ---------------------------------------------------------------------
export function validateShow(compiled) {
  const feas = checkFeasibility(compiled);
  const all = [
    ...checkStart(compiled),
    ...checkBounds(compiled),
    ...checkClearance(compiled),
    ...feas.findings,
    ...checkDrift(compiled),
  ];
  const errors = all.filter((f) => f.severity === 'error');
  const warnings = all.filter((f) => f.severity === 'warning');
  return Object.freeze({ ok: errors.length === 0, errors, warnings, beatStats: feas.stats });
}
