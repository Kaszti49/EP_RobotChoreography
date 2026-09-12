// =====================================================================
//  ota.js -- host side of OUR firmware-update protocol
//
//  Mirrors otaFogad() in firmware/robot/robot.ino:
//    host:   F,<size>,<md5hex>\n
//    robot:  F,READY\n                     (or F,ERR,<reason>\n)
//    host:   raw bytes, in chunks; at most `window` bytes ahead of the
//            last acknowledged count (BT-SPP buffers are small)
//    robot:  F,ACK,<received>\n  every 4096 bytes and at the end
//    robot:  F,OK\n  then reboots      | F,ERR,<reason>\n
//
//  Pure: the link is an object with three async methods, so the state
//  machine is unit-tested in node against a simulated robot and reused
//  unchanged by the Web Serial transport in the browser.
//
//    link.sendLine(text)            -> Promise<void>
//    link.writeRaw(Uint8Array)      -> Promise<void>
//    link.nextLine(timeoutMs)       -> Promise<string>   rejects on timeout
// =====================================================================

export const OTA_DEFAULTS = Object.freeze({
  chunk: 512,        // bytes per write
  window: 4096,      // bytes in flight before waiting for an ACK (== firmware ACK period)
  timeoutMs: 10000,  // == OTA_CSEND_MS in the firmware
});

export class OtaError extends Error {
  constructor(message, stage) { super(message); this.name = 'OtaError'; this.stage = stage; }
}

/** Wait for the next line that starts with "F," (other output, e.g. uzenet(), is skipped). */
async function nextF(link, timeoutMs) {
  for (;;) {
    const line = await link.nextLine(timeoutMs);
    if (line.startsWith('F,')) return line.trim().split(',');
  }
}

/**
 * Upload `bin` over `link`. Resolves when the robot reports F,OK.
 * @param {object} link
 * @param {Uint8Array} bin
 * @param {{ chunk?, window?, timeoutMs?, onProgress?: (sent:number, total:number) => void }} opts
 */
export async function otaUpload(link, bin, opts = {}) {
  const { chunk, window, timeoutMs } = { ...OTA_DEFAULTS, ...opts };
  const onProgress = opts.onProgress ?? (() => {});
  const total = bin.length;
  if (total === 0) throw new OtaError('empty firmware image', 'start');
  const md5 = md5Hex(bin);

  await link.sendLine(`F,${total},${md5}`);
  const ready = await nextF(link, timeoutMs);
  if (ready[1] === 'ERR') throw new OtaError(`robot refused: ${ready.slice(2).join(',')}`, 'start');
  if (ready[1] !== 'READY') throw new OtaError(`unexpected reply: ${ready.join(',')}`, 'start');

  let sent = 0;
  let acked = 0;
  while (sent < total) {
    // fill the window
    while (sent < total && sent - acked < window) {
      const n = Math.min(chunk, total - sent, window - (sent - acked));
      await link.writeRaw(bin.subarray(sent, sent + n));
      sent += n;
    }
    onProgress(sent, total);
    // the firmware ACKs every `window` bytes, and at the very end
    const reply = await nextF(link, timeoutMs);
    if (reply[1] === 'ERR') throw new OtaError(`robot aborted at ${acked} bytes: ${reply.slice(2).join(',')}`, 'transfer');
    if (reply[1] !== 'ACK') throw new OtaError(`unexpected reply during transfer: ${reply.join(',')}`, 'transfer');
    acked = Number(reply[2]);
    if (!Number.isFinite(acked) || acked > sent) throw new OtaError(`bad ACK count ${reply[2]} (sent ${sent})`, 'transfer');
  }
  // drain: the final ACK may have been consumed above; wait for OK
  for (;;) {
    const reply = await nextF(link, timeoutMs);
    if (reply[1] === 'OK') return { bytes: total, md5 };
    if (reply[1] === 'ERR') throw new OtaError(`robot rejected the image: ${reply.slice(2).join(',')}`, 'finish');
    if (reply[1] !== 'ACK') throw new OtaError(`unexpected reply at finish: ${reply.join(',')}`, 'finish');
  }
}

// ---------------------------------------------------------------------
//  MD5 (RFC 1321). Web Crypto has no MD5, and the ESP32 Update library
//  verifies MD5 -- so a small self-contained implementation lives here.
//  test/ota.test.js checks it against node:crypto.
// ---------------------------------------------------------------------
const K = new Uint32Array(64);
for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32);
const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];

export function md5Hex(bytes) {
  const len = bytes.length;
  const padded = new Uint8Array(((len + 8) >> 6 << 6) + 64);
  padded.set(bytes);
  padded[len] = 0x80;
  const bits = len * 8;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bits >>> 0, true);
  dv.setUint32(padded.length - 4, Math.floor(bits / 2 ** 32), true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const M = new Uint32Array(16);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) M[i] = dv.getUint32(off + i * 4, true);
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const t = (a + f + K[i] + M[g]) >>> 0;
      a = d; d = c; c = b;
      b = (b + ((t << S[i]) | (t >>> (32 - S[i])))) >>> 0;
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, a0, true); ov.setUint32(4, b0, true); ov.setUint32(8, c0, true); ov.setUint32(12, d0, true);
  return [...out].map((x) => x.toString(16).padStart(2, '0')).join('');
}
