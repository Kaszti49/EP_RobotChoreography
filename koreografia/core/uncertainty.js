// =====================================================================
//  uncertainty.js -- the dead-reckoning error budget
//
//  Two scalars per robot, nothing more:
//    r           position-error radius in mm
//    sigma_theta heading standard deviation in degrees
//
//  Propagation (all terms are >= 0, so r and sigma never decrease):
//    drive of distance d (mm):
//        r     += k_drive * d               slip along the way
//        r     += d * tan(sigma_theta)      a heading error already
//                                           accumulated becomes a
//                                           position error on THIS move
//        sigma += k_head_per_mm * d         straight runs also drift
//    turn of |a| degrees:
//        sigma += k_turn * |a|
//
//  Errors add linearly, not in quadrature -- pessimistic on purpose.
//  This is NOT a Kalman filter and must not become one; the constants
//  are two hand-measured numbers (config.js ERROR_MODEL).
// =====================================================================

import { ERROR_MODEL } from './config.js';
import { isDrive, isTurn, driveMm } from './pose.js';

const DEG = Math.PI / 180;

export function initialUncertainty(model = ERROR_MODEL) {
  return Object.freeze({ r: model.initial_r_mm, sigma_theta: model.initial_sigma_deg });
}

/** Uncertainty after driving |d| mm (sign is irrelevant to the budget). */
export function propagateDrive(u, d_mm, model = ERROR_MODEL) {
  const d = Math.abs(d_mm);
  const sigmaForTan = Math.min(u.sigma_theta, model.sigma_clamp_deg);
  return Object.freeze({
    r: u.r + model.k_drive * d + d * Math.tan(sigmaForTan * DEG),
    sigma_theta: u.sigma_theta + model.k_head_per_mm * d,
  });
}

/** Uncertainty after turning |a| degrees in place. */
export function propagateTurn(u, a_deg, model = ERROR_MODEL) {
  return Object.freeze({
    r: u.r,
    sigma_theta: u.sigma_theta + model.k_turn * Math.abs(a_deg),
  });
}

export function propagatePrimitive(u, prim, model = ERROR_MODEL) {
  if (isDrive(prim)) return propagateDrive(u, driveMm(prim), model);
  if (isTurn(prim)) return propagateTurn(u, prim.value, model);
  throw new Error(`unknown primitive op: ${prim.op}`);
}

export function propagateSequence(u, prims, model = ERROR_MODEL) {
  return prims.reduce((acc, p) => propagatePrimitive(acc, p, model), u);
}

/** Linear interpolation between two uncertainty states. */
export function lerpUncertainty(a, b, f) {
  const t = Math.min(1, Math.max(0, f));
  return Object.freeze({
    r: a.r + (b.r - a.r) * t,
    sigma_theta: a.sigma_theta + (b.sigma_theta - a.sigma_theta) * t,
  });
}
