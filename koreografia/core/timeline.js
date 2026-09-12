// =====================================================================
//  timeline.js -- where is a robot at time t inside a beat?
//
//  The engine runs a beat's primitives back to back from lepes_kezd(),
//  then lepes_var() holds until the slot ends. So within a beat a robot
//  executes primitive k during [start_k, start_k + estimate_k) and then
//  stands still. Shared by the validator (clearance sampling) and the
//  UI (playback) so they cannot disagree.
// =====================================================================

import { interpolatePrimitive } from './pose.js';
import { lerpUncertainty } from './uncertainty.js';

/** [{ start_ms, end_ms }] for each primitive of a compiled beat-robot. */
export function schedule(beatRobot) {
  let t = 0;
  return beatRobot.primitives.map((p) => {
    const start_ms = t;
    t += p.estimate_ms;
    return { start_ms, end_ms: t };
  });
}

/** Pose and uncertainty of one robot at `t_ms` after the beat started. */
export function stateAt(beatRobot, t_ms) {
  const sched = schedule(beatRobot);
  for (let i = 0; i < sched.length; i++) {
    const s = sched[i];
    if (t_ms < s.end_ms) {
      const p = beatRobot.primitives[i];
      const f = s.end_ms === s.start_ms ? 1 : (t_ms - s.start_ms) / (s.end_ms - s.start_ms);
      return {
        pose: interpolatePrimitive(p.poseBefore, p, f),
        uncertainty: lerpUncertainty(p.uBefore, p.uAfter, f),
        primitiveIndex: i,
      };
    }
  }
  // all primitives done (or none): standing at the end pose
  const last = beatRobot.primitives[beatRobot.primitives.length - 1];
  return {
    pose: beatRobot.poseAfter,
    uncertainty: last ? last.uAfter : beatRobot.uAfter,
    primitiveIndex: -1,
  };
}

/** Total show length in ms. */
export function showLengthMs(compiled) {
  return compiled.beats.reduce((s, b) => s + b.duration_ms, 0);
}

/** Map a global show time to { beat, t_in_beat }. Clamps at both ends. */
export function locate(compiled, t_ms) {
  let t = Math.max(0, t_ms);
  for (const beat of compiled.beats) {
    if (t < beat.duration_ms) return { beat, t_in_beat: t };
    t -= beat.duration_ms;
  }
  const last = compiled.beats[compiled.beats.length - 1];
  return last ? { beat: last, t_in_beat: last.duration_ms } : null;
}
