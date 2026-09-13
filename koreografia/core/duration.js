// =====================================================================
//  duration.js -- estimated wall-clock time of a primitive
//
//  Mirrors what mozgas() in the template does:
//    drive:  wheel travel = |mm|
//    spin:   wheel travel = PI * NYOMTAV_MM * (deg/360)
//    the last LASSITAS_MM of the wheel travel go at LASSU_MM_S, the
//    rest at SEBESSEG_MM_S / PORGES_MM_S;
//    plus, per primitive: active brake (at most FEK_MAX_MS) + settle,
//    one correction budget, and a ramp overhead. All from config.js
//    TIMING.
// =====================================================================

import { TIMING } from './config.js';
import { isDrive, isTurn, driveMm } from './pose.js';

/** Wheel travel (per wheel, mm) of a primitive. */
export function wheelTravelMm(prim, timing = TIMING) {
  if (isDrive(prim)) return Math.abs(driveMm(prim));
  if (isTurn(prim)) return Math.PI * timing.track_mm * (Math.abs(prim.value) / 360);
  throw new Error(`unknown primitive op: ${prim.op}`);
}

/** Pure motion time (no overhead) of a primitive, in ms: cruise + slow zone. */
export function motionMs(prim, timing = TIMING) {
  const travel = wheelTravelMm(prim, timing);
  const cruise = isDrive(prim) ? timing.drive_mm_s : timing.spin_rim_mm_s;
  const slow = Math.min(travel, timing.slow_zone_mm);
  return ((travel - slow) / cruise + slow / timing.slow_mm_s) * 1000;
}

/** Estimated total time the engine spends inside one primitive call. */
export function estimatePrimitiveMs(prim, timing = TIMING) {
  return motionMs(prim, timing) + timing.brake_ms + timing.settle_ms + timing.correction_ms + timing.ramp_ms;
}

export function estimateSequenceMs(prims, timing = TIMING) {
  return prims.reduce((sum, p) => sum + estimatePrimitiveMs(p, timing), 0);
}

/** The slot a beat needs to be safe for this primitive sequence. */
export function requiredBeatMs(prims, timing = TIMING) {
  return estimateSequenceMs(prims, timing) * timing.safety_factor;
}

/** Whether a single primitive would trip the engine's IDOKORLAT. */
export function exceedsMoveTimeout(prim, timing = TIMING) {
  return motionMs(prim, timing) > timing.move_timeout_ms;
}
