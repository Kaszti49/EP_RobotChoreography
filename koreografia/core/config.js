// =====================================================================
//  config.js -- every tunable number of the choreography compiler
//
//  Everything that the compiler, validator, emitter or UI treats as a
//  constant lives here. Consumers import from this file only; nothing
//  else may hard-code a number that describes the robots or the field.
//
//  PROVISIONAL means: taken from a crude measurement on ONE robot
//  (robot 1, parquet, 2026-09-08, DOKUMENTACIO_robot1.md section 6).
//  T8_negyzet.txt will produce per-robot numbers; swapping them in is
//  an edit to this file (and/or data/robots.json) and nothing else.
// =====================================================================

// ---------------------------------------------------------------------
//  Field. The real hall has NOT been measured (CLAUDE.md of the Robot1
//  bundle, section 11). These are nominal defaults; a show file may
//  override them in its "field" block.
// ---------------------------------------------------------------------
export const FIELD_DEFAULT = Object.freeze({
  width_mm: 4000,
  height_mm: 3000,
  margin_mm: 250,
});

// ---------------------------------------------------------------------
//  Robot geometry.
//  ASSUMPTION: the robot is "~20 cm long" (DOKUMENTACIO_robot1.md 2.3) and
//  the physical track is 148 mm (section 4). A circumscribing radius of
//  120 mm covers a 200 x 160 mm body with a little slack. Not measured.
// ---------------------------------------------------------------------
export const ROBOT_RADIUS_MM = 120;

// Minimum gap between two robots' bodies in the plan.
// DOKUMENTACIO_robot1.md section 6 said "ne tervezz 20 cm-nel kisebb
// hezagot"; overridden to 10 cm on 2026-09-21 (user decision, for the
// closing line-up of data/keringo-show.json: 24 cm body + 10 cm gap =
// 34 cm centre to centre).
export const MIN_GAP_MM = 100;

// How much of the two robots' drift radii (r_i + r_j) the clearance check
// adds on top of bodies + MIN_GAP_MM. 1 = the original rule (gap between
// the *expanded* uncertainty discs -- with the provisional ERROR_MODEL no
// formation tighter than ~60 cm can pass it). 0 = clearance checks the
// planned bodies only, and drift is policed by DRIFT_CEILING_MM alone.
// Set to 0 on 2026-09-21 together with the 10 cm gap; put back to 1 once
// ERROR_MODEL is recalibrated from the floor tests if you want the discs
// counted again.
export const CLEARANCE_DRIFT_FACTOR = 0;

// ---------------------------------------------------------------------
//  Error model  (PROVISIONAL -- see header)
//
//  Two measured figures exist, both from robot 1 on parquet:
//    * +-10 cm position error per metre driven
//    * +-20 deg heading error after three full spins (1080 deg)
//
//  Errors are added LINEARLY, never in quadrature: we want a pessimistic
//  budget, not a statistically tidy one.
// ---------------------------------------------------------------------
export const ERROR_MODEL = Object.freeze({
  // mm of position error per mm driven:  100 mm / 1000 mm
  k_drive: 100 / 1000,

  // deg of heading error per deg turned:  20 deg / 1080 deg
  k_turn: 20 / 1080,

  // deg of heading error per mm driven.
  // Not among the two measured figures. Derived from the only related
  // observation: "1 m alatt oldalra ~0-6 cm" (MERESI_MENET.md data
  // table, robot 1) -- a 6 cm lateral drift over 1 m is a ~3.4 deg
  // heading change, so ~0.003 deg/mm. PROVISIONAL, and the weakest of
  // the three constants.
  k_head_per_mm: 0.003,

  // Placement error when a human puts the robot on its floor mark.
  // ASSUMPTION (no measurement): 10 mm and 1 deg.
  initial_r_mm: 10,
  initial_sigma_deg: 1,

  // The d*tan(sigma) term is undefined at 90 deg; beyond this the show
  // is dead anyway and the drift ceiling will have fired long ago.
  sigma_clamp_deg: 89,
});

// An error model with every constant zero. Used by the closed-loop
// identity test and by anyone who wants the pure kinematics.
export const ZERO_ERROR_MODEL = Object.freeze({
  k_drive: 0,
  k_turn: 0,
  k_head_per_mm: 0,
  initial_r_mm: 0,
  initial_sigma_deg: 0,
  sigma_clamp_deg: 89,
});

// Warn when a robot's position-error radius r exceeds this.
export const DRIFT_CEILING_MM = 300;

// ---------------------------------------------------------------------
//  Timing.  Values that describe the on-robot motion engine MUST match
//  block 3 of templates/show_template.txt -- test/template.test.js
//  checks that they do.
// ---------------------------------------------------------------------
export const TIMING = Object.freeze({
  // block 3: SEBESSEG_MM_S / PORGES_MM_S
  drive_mm_s: 300,
  spin_rim_mm_s: 300,
  // block 3: LASSITAS_MM / LASSU_MM_S -- the last LASSITAS_MM of wheel
  // travel (per wheel) are crawled at LASSU_MM_S.
  slow_zone_mm: 100,
  slow_mm_s: 150,
  // The physical track (DOKUMENTACIO_robot1.md section 4). Spin time is
  // computed with this nominal value; each robot's tuned NYOMTAV_MM in
  // robots.json is within a few percent (robot 1: 148.3), which the
  // safety factor absorbs.
  track_mm: 148,
  // block 3: FEK_MAX_MS (the active brake runs until the wheels stop,
  // at most this long) plus the varj(100) after it; and the fixed
  // varj(200) at the end of mozgas().
  brake_ms: 400 + 100,
  settle_ms: 200,
  // block 3: up to JAVITAS_MAX corrections after the brake. Measured
  // 2026-09-13 (robot 1): a correction takes ~300 ms and most moves need
  // none; budget one. (Worst case is 1500 ms creep each, but then the
  // safety factor below covers it.)
  correction_ms: 300,
  // block 3: IDOKORLAT -- a single mozgas() is aborted after this.
  move_timeout_ms: 20000,

  // block 3: INDULAS_MS soft start (PWM ramps up over this time).
  // 2026-09-13 telemetry (robot 1): a 1 m drive took 3.7 s against
  // 3.67 s of modelled motion, a 3-turn spin 5.9 s against 4.8 s + two
  // corrections.
  ramp_ms: 300,

  // A beat must fit  sum(estimated primitive time) * safety_factor.
  // Generous on purpose: the PWM->speed line is itself provisional
  // (DOKUMENTACIO_robot1.md section 7).
  safety_factor: 1.5,
});

// ---------------------------------------------------------------------
//  Compiler options
// ---------------------------------------------------------------------
export const COMPILER = Object.freeze({
  // Prefer hatra_cm over a ~180 deg turn when it saves rotation.
  // OFF by default: backward driving is measurably worse on this
  // hardware (DOKUMENTACIO_robot1.md section 5: "hatra minimalis balra
  // sodrodas"; section 3: 15 % slower backwards).
  allow_reverse: false,

  // Primitive values are quantised to what the emitted code prints, so
  // that the simulated pose and the emitted pose are the same number.
  cm_decimals: 1,
  deg_decimals: 1,

  // Below these the compiler emits nothing (the engine ignores < 1 pulse
  // anyway; 1 pulse ~ 0.35 mm).
  min_drive_cm: 0.1,
  min_turn_deg: 0.1,
});

// Sampling density for the validator (points per primitive / per beat).
export const VALIDATOR = Object.freeze({
  bounds_samples_per_primitive: 20,
  clearance_samples_per_beat: 40,
});

// The canonical primitive names, exactly as the emitted code calls them.
export const OPS = Object.freeze({
  FORWARD: 'elore_cm',
  BACKWARD: 'hatra_cm',
  LEFT: 'balra_fok',
  RIGHT: 'jobbra_fok',
});

export const DEFAULT_CONFIG = Object.freeze({
  robot_radius_mm: ROBOT_RADIUS_MM,
  min_gap_mm: MIN_GAP_MM,
  clearance_drift_factor: CLEARANCE_DRIFT_FACTOR,
  drift_ceiling_mm: DRIFT_CEILING_MM,
  error: ERROR_MODEL,
  timing: TIMING,
  compiler: COMPILER,
  validator: VALIDATOR,
});

/** Shallow-merge overrides into DEFAULT_CONFIG (one level deep). */
export function makeConfig(overrides = {}) {
  const out = { ...DEFAULT_CONFIG };
  for (const key of Object.keys(overrides)) {
    const base = DEFAULT_CONFIG[key];
    const value = overrides[key];
    out[key] = (base && typeof base === 'object' && value && typeof value === 'object')
      ? { ...base, ...value }
      : value;
  }
  return Object.freeze(out);
}
