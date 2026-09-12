// =====================================================================
//  webserial.js -- EXPERIMENTAL Transport over the Web Serial API
//
//  What this is: a text-line link to a serial port. On Windows a paired
//  Bluetooth Classic (SPP) device shows up as a COM port, and Chrome
//  can open it from a secure context (http://localhost qualifies).
//  Segedlet.txt says the framework understands its Muszerfal commands
//  "sorosan/Bluetooth-on" (over serial / Bluetooth), and that renaming
//  with B,<n> requires re-pairing in Windows -- which is how SPP behaves.
//  Verified against robot 1 on 2026-09-12 (commands, telemetry, OTA).
//
//  Firmware upload: works with OUR firmware (firmware/robot/robot.ino)
//  and its F,<size>,<md5> protocol implemented in ota.js. It will not
//  work with the original camp framework, whose payload format is
//  unknown (README.md in this directory).
//
//  Chrome/Edge only (navigator.serial). Never imported by core/ or tests.
// =====================================================================

import { Transport } from './transport.js';
import { otaUpload } from './ota.js';

export class WebSerialTransport extends Transport {
  /**
   * @param {object} opts
   * @param {(robotId:number, line:string) => void} [opts.onLine]   a line received from a robot
   * @param {(msg:string) => void}                  [opts.onLog]
   * @param {(robotId:number) => void}              [opts.onDisconnect]  the port died on its own (robot rebooted)
   * @param {(robotId:number) => void}              [opts.onReconnect]   ...and came back by itself
   * @param {number}                                [opts.baudRate]  ignored by BT-SPP virtual ports, required by the API
   */
  constructor({ onLine = () => {}, onLog = () => {}, onDisconnect = () => {}, onReconnect = () => {}, baudRate = 115200 } = {}) {
    super();
    this.onLine = onLine;
    this.onLog = onLog;
    this.onDisconnect = onDisconnect;
    this.onReconnect = onReconnect;
    this.baudRate = baudRate;
    this.links = new Map(); // robotId -> { port, writer, reader, lines, waiters }
    this.ports = new Map(); // robotId -> SerialPort granted by the user (kept for reconnects)
  }

  static get available() {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  /**
   * Without `port`: must be called from a user gesture (click), the browser
   * shows a port picker. With a port from grantedPorts(): no picker, no gesture.
   */
  async connect(robotId, port = null) {
    if (!WebSerialTransport.available) {
      throw new Error('Web Serial is not available in this browser (use Chrome/Edge over http://localhost or https)');
    }
    if (this.links.has(robotId)) return;
    port = port ?? await navigator.serial.requestPort();
    this.ports.set(robotId, port);
    await this.#open(robotId, port);
  }

  /** Ports the user granted to this origin earlier (survive reloads). */
  static async grantedPorts() {
    return WebSerialTransport.available ? navigator.serial.getPorts() : [];
  }

  async #open(robotId, port) {
    await port.open({ baudRate: this.baudRate });
    const writer = port.writable.getWriter();
    const link = { port, writer, closing: false, lines: [], waiters: [] };
    this.links.set(robotId, link);
    this.onLog(`robot ${robotId}: port open`);
    this.#readLoop(robotId, link)
      .catch((e) => this.onLog(`robot ${robotId}: read loop ended: ${e.message}`))
      .finally(async () => {
        // The robot rebooted (OTA, USB flash, power) or went out of range: the
        // port is dead. Forget it, or every later write fails 10 s late with a
        // confusing "no reply". The UI re-renders through onDisconnect, and we
        // try to reopen the same (already granted) port -- no picker needed.
        if (!link.closing && this.links.get(robotId) === link) {
          this.links.delete(robotId);
          try { link.writer.releaseLock(); } catch { /* already released */ }
          await link.port.close().catch(() => {});
          this.onLog(`robot ${robotId}: a kapcsolat megszakadt (a robot ujraindult?) -- ujracsatlakozas...`);
          this.onDisconnect(robotId);
          this.#reconnect(robotId, port);
        }
      });
  }

  // A rebooting robot's Bluetooth is back after ~3-5 s; a USB flash takes ~25 s.
  // Stops as soon as the user disconnects (ports entry removed) or connects otherwise.
  async #reconnect(robotId, port) {
    const tries = 20;
    for (let i = 1; i <= tries; i++) {
      await new Promise((r) => setTimeout(r, i === 1 ? 3000 : 2000));
      if (this.links.has(robotId) || this.ports.get(robotId) !== port) return;
      try {
        await this.#open(robotId, port);
        this.onLog(`robot ${robotId}: ujra csatlakozva (${i}. probalkozas)`);
        this.onReconnect(robotId);
        return;
      } catch (e) {
        if (i === tries) this.onLog(`robot ${robotId}: nem sikerult ujracsatlakozni (${e.message}) -- Csatlakozas kezzel`);
      }
    }
  }

  async #readLoop(robotId, link) {
    const decoder = new TextDecoder();
    let buffer = '';
    while (link.port.readable && !link.closing) {
      const reader = link.port.readable.getReader();
      link.reader = reader;
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl;
          while ((nl = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, nl).replace(/\r$/, '');
            buffer = buffer.slice(nl + 1);
            if (line) this.#deliver(robotId, link, line);
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  }

  // every received line goes to onLine AND to whoever is awaiting nextLine()
  #deliver(robotId, link, line) {
    this.onLine(robotId, line);
    const w = link.waiters.shift();
    if (w) w(line); else if (link.lines.length < 1000) link.lines.push(line);
  }

  /** Next received line from a robot, or reject after timeoutMs. */
  nextLine(robotId, timeoutMs = 5000) {
    const link = this.#link(robotId);
    if (link.lines.length) return Promise.resolve(link.lines.shift());
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        link.waiters = link.waiters.filter((x) => x !== fn);
        reject(new Error(`robot ${robotId}: no reply within ${timeoutMs} ms`));
      }, timeoutMs);
      const fn = (l) => { clearTimeout(t); resolve(l); };
      link.waiters.push(fn);
    });
  }

  #link(robotId) {
    const link = this.links.get(robotId);
    if (!link) throw new Error(`robot ${robotId} is not connected`);
    return link;
  }

  /** Raw bytes, no newline (firmware image transfer). */
  async writeRaw(robotId, bytes) {
    await this.#link(robotId).writer.write(bytes);
  }

  /** Manual wheel drive: M,<bal>,<jobb> (-255..255). The firmware stops after 1.5 s without a new M. */
  async drive(robotId, bal, jobb) {
    await this.send(robotId, `M,${Math.round(bal)},${Math.round(jobb)}`);
  }

  async send(robotId, line) {
    const link = this.#link(robotId);
    await link.writer.write(new TextEncoder().encode(`${line}\n`));
    this.onLog(`robot ${robotId} <- ${line}`);
  }

  async broadcast(line) {
    await Promise.all([...this.links.keys()].map((id) => this.send(id, line)));
  }

  async disconnect(robotId) {
    this.ports.delete(robotId); // also stops a running reconnect loop
    const link = this.links.get(robotId);
    if (!link) return;
    link.closing = true;
    try { await link.reader?.cancel(); } catch { /* already closed */ }
    try { link.writer.releaseLock(); } catch { /* already released */ }
    try { await link.port.close(); } catch (e) { this.onLog(`robot ${robotId}: close: ${e.message}`); }
    this.links.delete(robotId);
    this.onLog(`robot ${robotId}: port closed`);
  }

  connectedIds() {
    return [...this.links.keys()];
  }

  /**
   * Upload a compiled firmware image (.bin from tools/firmware.js build)
   * over the open link, using ota.js. Resolves on F,OK; the robot reboots.
   */
  async uploadFirmware(robotId, bin, { onProgress } = {}) {
    this.#link(robotId).lines.length = 0; // drop stale chatter
    const link = {
      sendLine: (text) => this.send(robotId, text),
      writeRaw: (bytes) => this.writeRaw(robotId, bytes),
      nextLine: (t) => this.nextLine(robotId, t),
    };
    return otaUpload(link, bin, { onProgress });
  }
}
