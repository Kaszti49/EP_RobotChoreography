// =====================================================================
//  pose.js -- pose math and primitive kinematics
//
//  COORDINATE CONVENTION (world, used by every file in core/):
//    * origin at one corner of the field
//    * +X to the right, +Y AWAY from the audience
//    * heading theta in degrees, 0 deg = +X, COUNTER-CLOCKWISE positive
//      (standard maths convention)
//    * a pose is { x, y, theta } in mm and degrees
//
//  ROBOT CONVENTION (the opposite handedness):
//    porog_fok(fok):  POSITIVE = CLOCKWISE  (SHOW_robot1.txt block 5)
//    balra_fok(f) = porog_fok(-f)   -> counter-clockwise -> theta += f
//    jobbra_fok(f) = porog_fok(+f)  -> clockwise         -> theta -= f
//
//  The only place the two conventions meet is turnPrimitive() below and
//  applyPrimitive(). test/roundtrip.test.js exists to catch a sign error
//  in either.
// =====================================================================

import { OPS } from './config.js';

const DEG = Math.PI / 180;

/** Normalise an angle in degrees to (-180, 180]. */
export function normalizeAngle(deg) {
  let a = deg % 360;
  if (a <= -180) a += 360;
  if (a > 180) a -= 360;
  // -0 is ugly in output and equals 0 anyway
  return a === 0 ? 0 : a;
}

export function makePose(x, y, theta) {
  return Object.freeze({ x, y, theta: normalizeAngle(theta) });
}

export function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** World heading (deg) of the vector from `from` to `to`. */
export function headingTo(from, to) {
  return normalizeAngle(Math.atan2(to.y - from.y, to.x - from.x) / DEG);
}

/** Signed shortest rotation (deg) to go from heading `a` to heading `b`. */
export function deltaHeading(a, b) {
  return normalizeAngle(b - a);
}

/**
 * The single point where a world heading change becomes a robot call.
 *   delta > 0 -> balra_fok(delta)     (counter-clockwise)
 *   delta < 0 -> jobbra_fok(-delta)   (clockwise)
 * Returns null when the (normalised) delta is below `minDeg`.
 */
export function turnPrimitive(deltaDeg, minDeg = 0) {
  const d = normalizeAngle(deltaDeg);
  if (Math.abs(d) < minDeg || d === 0) return null;
  return d > 0
    ? { op: OPS.LEFT, value: d }
    : { op: OPS.RIGHT, value: -d };
}

export function drivePrimitive(mm, backward = false, minCm = 0) {
  const cm = Math.abs(mm) / 10;
  if (cm < minCm || cm === 0) return null;
  return { op: backward ? OPS.BACKWARD : OPS.FORWARD, value: cm };
}

export function isDrive(prim) {
  return prim.op === OPS.FORWARD || prim.op === OPS.BACKWARD;
}

export function isTurn(prim) {
  return prim.op === OPS.LEFT || prim.op === OPS.RIGHT;
}

/** Signed distance (mm) a drive primitive moves along the heading. */
export function driveMm(prim) {
  if (prim.op === OPS.FORWARD) return prim.value * 10;
  if (prim.op === OPS.BACKWARD) return -prim.value * 10;
  return 0;
}

/** Signed world heading change (deg, CCW positive) of a turn primitive. */
export function turnDeg(prim) {
  if (prim.op === OPS.LEFT) return prim.value;
  if (prim.op === OPS.RIGHT) return -prim.value;
  return 0;
}

/**
 * Pose after executing `fraction` (0..1) of a primitive from `pose`.
 * Drives move along the current heading; turns rotate in place.
 */
export function interpolatePrimitive(pose, prim, fraction) {
  const f = Math.min(1, Math.max(0, fraction));
  if (isDrive(prim)) {
    const d = driveMm(prim) * f;
    return makePose(
      pose.x + d * Math.cos(pose.theta * DEG),
      pose.y + d * Math.sin(pose.theta * DEG),
      pose.theta,
    );
  }
  if (isTurn(prim)) {
    return makePose(pose.x, pose.y, pose.theta + turnDeg(prim) * f);
  }
  throw new Error(`unknown primitive op: ${prim.op}`);
}

/** Pose after fully executing a primitive. */
export function applyPrimitive(pose, prim) {
  return interpolatePrimitive(pose, prim, 1);
}

/** Pose after executing a whole primitive sequence. */
export function applySequence(pose, prims) {
  return prims.reduce(applyPrimitive, pose);
}

export function posesClose(a, b, mmTol = 1e-6, degTol = 1e-6) {
  return Math.abs(a.x - b.x) <= mmTol
    && Math.abs(a.y - b.y) <= mmTol
    && Math.abs(normalizeAngle(a.theta - b.theta)) <= degTol;
}
