// =====================================================================
//  duration.js -- estimated wall-clock time of a primitive
//
//  Mirrors what mozgas() in the template does:
//    drive:  |mm| / SEBESSEG_MM_S
//    spin:   arc = PI * NYOMTAV_MM * (deg/360), then arc / PORGES_MM_S
//    plus, per primitive: FEK_MS active brake + varj(200) settle,
//    plus an ASSUMED ramp overhead (TIMING.ramp_ms) because motors do
//    not reach speed instantly. All from config.js TIMING.
// =====================================================================

import { TIMING } from './config.js';
import { isDrive, isTurn, driveMm } from './pose.js';

/** Pure motion time (no overhead) of a primitive, in ms. */
export function motionMs(prim, timing = TIMING) {
  if (isDrive(prim)) {
    return Math.abs(driveMm(prim)) / timing.drive_mm_s * 1000;
  }
  if (isTurn(prim)) {
    const arc = Math.PI * timing.track_mm * (Math.abs(prim.value) / 360);
    return arc / timing.spin_rim_mm_s * 1000;
  }
  throw new Error(`unknown primitive op: ${prim.op}`);
}

/** Estimated total time the engine spends inside one primitive call. */
export function estimatePrimitiveMs(prim, timing = TIMING) {
  return motionMs(prim, timing) + timing.brake_ms + timing.settle_ms + timing.ramp_ms;
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
