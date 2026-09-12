import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileShow } from '../core/compile.js';
import { schedule, stateAt, locate, showLengthMs } from '../core/timeline.js';
import { estimatePrimitiveMs, motionMs, estimateSequenceMs, exceedsMoveTimeout } from '../core/duration.js';
import { TIMING, OPS } from '../core/config.js';
import { tinyShow, loadExample } from './helpers.js';

test('duration: drive and spin times follow the engine constants', () => {
  const drive = { op: OPS.FORWARD, value: 100 };
  assert.ok(Math.abs(motionMs(drive) - 1000 / 230 * 1000) < 1e-9);
  const spin = { op: OPS.RIGHT, value: 360 };
  assert.ok(Math.abs(motionMs(spin) - Math.PI * 143 / 230 * 1000) < 1e-9);
  const overhead = TIMING.brake_ms + TIMING.settle_ms + TIMING.ramp_ms;
  assert.ok(Math.abs(estimatePrimitiveMs(drive) - (motionMs(drive) + overhead)) < 1e-9);
  assert.equal(estimateSequenceMs([]), 0);
  assert.ok(!exceedsMoveTimeout({ op: OPS.FORWARD, value: 400 }));
  assert.ok(exceedsMoveTimeout({ op: OPS.FORWARD, value: 500 }));
});

test('schedule runs primitives back to back from t=0', () => {
  const c = compileShow(tinyShow([{
    name: 'g', duration_ms: 12000, moves: { 1: { type: 'goto', x: 1000, y: 2000, face: 0 } },
  }]));
  const br = c.beats[0].robots[1];
  const s = schedule(br);
  assert.equal(s.length, 3);
  assert.equal(s[0].start_ms, 0);
  assert.equal(s[1].start_ms, s[0].end_ms);
  assert.equal(s[2].start_ms, s[1].end_ms);
});

test('stateAt walks the primitives and then holds the end pose', () => {
  const c = compileShow(tinyShow([{
    name: 'g', duration_ms: 12000, moves: { 1: { type: 'goto', x: 1000, y: 2000, face: 0 } },
  }]));
  const br = c.beats[0].robots[1];
  const s = schedule(br);

  const start = stateAt(br, 0);
  assert.deepEqual(start.pose, br.poseBefore);
  assert.equal(start.primitiveIndex, 0);

  // halfway through the drive: heading already 90, y halfway
  const midDrive = stateAt(br, (s[1].start_ms + s[1].end_ms) / 2);
  assert.equal(midDrive.primitiveIndex, 1);
  assert.equal(midDrive.pose.theta, 90);
  assert.ok(Math.abs(midDrive.pose.y - 1500) < 1e-6);
  assert.ok(midDrive.uncertainty.r > br.primitives[1].uBefore.r && midDrive.uncertainty.r < br.primitives[1].uAfter.r);

  const done = stateAt(br, 11999);
  assert.equal(done.primitiveIndex, -1);
  assert.deepEqual(done.pose, br.poseAfter);
  assert.deepEqual(done.uncertainty, br.primitives[2].uAfter);
});

test('stateAt on a hold beat is constant', () => {
  const c = compileShow(tinyShow([{ name: 'h', duration_ms: 1000, moves: {} }]));
  const br = c.beats[0].robots[1];
  assert.deepEqual(stateAt(br, 0).pose, br.poseBefore);
  assert.deepEqual(stateAt(br, 999).pose, br.poseBefore);
});

test('locate maps global time to beat and clamps', () => {
  const c = compileShow(loadExample());
  assert.equal(showLengthMs(c), 46000);
  assert.equal(locate(c, 0).beat.index, 0);
  assert.equal(locate(c, 4999).beat.index, 0);
  assert.equal(locate(c, 5000).beat.index, 1);
  assert.equal(locate(c, 5000).t_in_beat, 0);
  const end = locate(c, 1e9);
  assert.equal(end.beat.index, 9);
  assert.equal(end.t_in_beat, 2000);
});
