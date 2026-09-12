import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { otaUpload, md5Hex, OtaError } from '../transport/ota.js';

test('md5Hex matches node:crypto for empty, short, block-boundary and random inputs', () => {
  const cases = [new Uint8Array(0), new TextEncoder().encode('abc'), new Uint8Array(55), new Uint8Array(56),
    new Uint8Array(64), randomBytes(1000), randomBytes(70000)];
  for (const c of cases) {
    assert.equal(md5Hex(new Uint8Array(c)), createHash('md5').update(c).digest('hex'));
  }
});

/**
 * A robot that behaves like otaFogad() in robot.ino: accepts F,<size>,<md5>,
 * acks every 4096 bytes and at the end, verifies size and md5.
 */
function fakeRobot({ ackEvery = 4096, refuse = false, dieAfter = Infinity, chatter = false } = {}) {
  const lines = [];
  const waiters = [];
  const emit = (l) => { const w = waiters.shift(); if (w) w(l); else lines.push(l); };
  let expected = 0, md5 = '', received = 0, lastAck = 0, buf = [];
  const state = { received: 0, done: false, image: null };
  return {
    state,
    link: {
      async sendLine(text) {
        if (chatter) emit('megy 100 cm | cel 2891/2907');
        const [cmd, size, hash] = text.split(',');
        assert.equal(cmd, 'F');
        if (refuse) { emit('F,ERR,begin no space'); return; }
        expected = Number(size); md5 = hash;
        emit('F,READY');
      },
      async writeRaw(bytes) {
        for (const b of bytes) {
          buf.push(b); received++; state.received = received;
          if (received > dieAfter) { emit('F,ERR,write flash'); return; }
          if (received - lastAck >= ackEvery || received === expected) {
            lastAck = received;
            emit(`F,ACK,${received}`);
          }
          if (received === expected) {
            state.image = new Uint8Array(buf);
            state.done = true;
            emit(md5Hex(state.image) === md5 ? 'F,OK' : 'F,ERR,end md5');
          }
        }
      },
      nextLine(timeoutMs) {
        if (lines.length) return Promise.resolve(lines.shift());
        return new Promise((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('timeout')), timeoutMs);
          waiters.push((l) => { clearTimeout(t); resolve(l); });
        });
      },
    },
  };
}

test('uploads an image intact, with progress, and ends on F,OK', async () => {
  const bin = new Uint8Array(randomBytes(10000));
  const robot = fakeRobot();
  const progress = [];
  const res = await otaUpload(robot.link, bin, { onProgress: (s, t) => progress.push([s, t]) });
  assert.equal(res.bytes, 10000);
  assert.equal(res.md5, md5Hex(bin));
  assert.ok(robot.state.done);
  assert.deepEqual(robot.state.image, bin);
  assert.ok(progress.length >= 2);
  assert.deepEqual(progress.at(-1), [10000, 10000]);
});

test('never sends more than one window ahead of the last ACK', async () => {
  const bin = new Uint8Array(randomBytes(20000));
  const robot = fakeRobot();
  let maxAhead = 0; let acked = 0;
  const link = {
    ...robot.link,
    async writeRaw(b) { maxAhead = Math.max(maxAhead, robot.state.received + b.length - acked); await robot.link.writeRaw(b); },
    async nextLine(t) { const l = await robot.link.nextLine(t); if (l.startsWith('F,ACK')) acked = Number(l.split(',')[2]); return l; },
  };
  await otaUpload(link, bin);
  assert.ok(maxAhead <= 4096, `max in flight ${maxAhead}`);
});

test('images smaller than one window and exact multiples of the window work', async () => {
  for (const size of [1, 511, 512, 4096, 8192, 4097]) {
    const bin = new Uint8Array(randomBytes(size));
    const robot = fakeRobot();
    await otaUpload(robot.link, bin);
    assert.deepEqual(robot.state.image, bin, `size ${size}`);
  }
});

test('robot chatter (uzenet lines) between protocol lines is ignored', async () => {
  const bin = new Uint8Array(randomBytes(5000));
  const robot = fakeRobot({ chatter: true });
  await otaUpload(robot.link, bin);
  assert.ok(robot.state.done);
});

test('a refusal, a mid-transfer error and a timeout surface as OtaError with a stage', async () => {
  await assert.rejects(otaUpload(fakeRobot({ refuse: true }).link, new Uint8Array(100)),
    (e) => e instanceof OtaError && e.stage === 'start' && /no space/.test(e.message));

  await assert.rejects(otaUpload(fakeRobot({ dieAfter: 6000 }).link, new Uint8Array(randomBytes(9000))),
    (e) => e instanceof OtaError && e.stage === 'transfer' && /flash/.test(e.message));

  const silent = { async sendLine() {}, async writeRaw() {}, nextLine: (t) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), t)) };
  await assert.rejects(otaUpload(silent, new Uint8Array(10), { timeoutMs: 20 }), /timeout/);

  await assert.rejects(otaUpload(fakeRobot().link, new Uint8Array(0)), /empty/);
});
