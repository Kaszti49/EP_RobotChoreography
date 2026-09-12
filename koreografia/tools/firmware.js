#!/usr/bin/env node
// =====================================================================
//  firmware.js -- compile our own firmware (+ a show) and upload it
//
//  usage:
//    node tools/firmware.js build  <robotId> [show.json]   emit the show for the robot,
//                                                          drop it into a sketch copy,
//                                                          arduino-cli compile -> build/robot<N>/*.bin
//    node tools/firmware.js build  keret                   the bare framework (placeholder show)
//    node tools/firmware.js upload <robotId|keret> <COMx>  USB upload with esptool (arduino-cli upload)
//    node tools/firmware.js ports                          list serial ports
//    node tools/firmware.js check                          is arduino-cli + the ESP32 core installed?
//
//  Bluetooth OTA upload is done from the UI (Web Serial + transport/ota.js)
//  with the .bin this tool produces: build/robot<N>/<sketch>.ino.bin
//
//  tools/serve.js also imports compileCode() from here: the UI's Kod tab
//  POSTs pasted sketch text to /api/compile and gets the .bin back.
//
//  Prerequisites (once):
//    winget install ArduinoSA.CLI
//    arduino-cli config init
//    arduino-cli config set board_manager.additional_urls https://espressif.github.io/arduino-esp32/package_esp32_index.json
//    arduino-cli core update-index && arduino-cli core install esp32:esp32
// =====================================================================

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { compileShow } from '../core/compile.js';
import { validateShow } from '../core/validate.js';
import { emitRobot } from '../core/emit.js';
import { loadDeps } from './build.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
// min_spiffs: two 1.9 MB app slots (needed for OTA) instead of two 1.3 MB ones
const FQBN = 'esp32:esp32:esp32:PartitionScheme=min_spiffs';

export function findArduinoCli() {
  const candidates = [
    'arduino-cli',
    'C:\\Program Files\\Arduino CLI\\arduino-cli.exe',
    join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Links', 'arduino-cli.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Arduino CLI', 'arduino-cli.exe'),
  ];
  for (const c of candidates) {
    const r = spawnSync(c, ['version'], { encoding: 'utf8' });
    if (r.status === 0) return c;
  }
  return null;
}

function run(cli, args, opts = {}) {
  const r = spawnSync(cli, args, { encoding: 'utf8', stdio: opts.quiet ? 'pipe' : 'inherit', ...opts });
  if (r.status !== 0) throw new Error(`${cli} ${args.join(' ')} failed (exit ${r.status})${r.stderr ? `\n${r.stderr}` : ''}`);
  return r;
}

/** Sketch folder for a target: build/<name>/<name>/<name>.ino + show.ino */
export function prepareSketch(target, showPath) {
  const name = target === 'keret' ? 'keret' : `robot${target}`;
  const dir = join(root, 'build', name, name);
  rmSync(join(root, 'build', name), { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(root, 'firmware', 'robot', 'robot.ino'), join(dir, `${name}.ino`));

  if (target === 'keret') {
    copyFileSync(join(root, 'firmware', 'robot', 'show.ino'), join(dir, 'show.ino'));
    return { name, dir };
  }
  const robotId = Number(target);
  const show = JSON.parse(readFileSync(resolve(showPath ?? join(root, 'data', 'example-show.json')), 'utf8'));
  const compiled = compileShow(show);
  const validation = validateShow(compiled);
  if (!validation.ok) {
    throw new Error(`show has ${validation.errors.length} validation error(s):\n${validation.errors.map((e) => `  - ${e.message}`).join('\n')}`);
  }
  const txt = emitRobot(compiled, robotId, { ...loadDeps(), validation });
  writeFileSync(join(dir, 'show.ino'), txt, 'utf8');
  writeFileSync(join(root, 'build', name, `SHOW_robot${robotId}.txt`), txt, 'utf8');
  return { name, dir };
}

/** Sketch folder from raw sketch text (the Kod tab): build/<name>/<name>/ with the framework + show.ino = code */
export function prepareSketchFromCode(name, code) {
  if (!/^[a-z0-9_-]{1,32}$/i.test(name)) throw new Error(`bad sketch name: ${name}`);
  const dir = join(root, 'build', name, name);
  rmSync(join(root, 'build', name), { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(root, 'firmware', 'robot', 'robot.ino'), join(dir, `${name}.ino`));
  writeFileSync(join(dir, 'show.ino'), String(code), 'utf8');
  return { name, dir };
}

/**
 * gcc diagnostics as {file, line, col, severity, message}. arduino-cli maps
 * the .cpp line numbers back to the .ino, so `line` is what the editor shows.
 * Only show.ino lines are the user's; a diagnostic in the framework file keeps
 * its file name so it is not mistaken for one.
 */
export function parseCompilerErrors(text) {
  const out = [];
  const re = /^(?:.*[\\/])?([^\\/\s:]+\.ino):(\d+):(\d+): (error|warning|note|fatal error): (.*)$/;
  for (const raw of String(text ?? '').split(/\r?\n/)) {
    const m = raw.match(re);
    if (!m) continue;
    const [, file, line, col, sev, message] = m;
    out.push({ file, line: Number(line), col: Number(col), severity: sev === 'fatal error' ? 'error' : sev, message: message.trim() });
  }
  return out;
}

/**
 * arduino-cli compile of a prepared sketch folder -> Promise<{ bin, stdout, stderr, diagnostics }>;
 * rejects with .diagnostics / .output on failure. Async so serve.js keeps serving while it runs.
 */
export function compileSketch(name, { quiet = false } = {}) {
  const cli = findArduinoCli();
  if (!cli) return Promise.reject(new Error('arduino-cli not found -- see the prerequisites in tools/firmware.js'));
  const dir = join(root, 'build', name, name);
  const out = join(root, 'build', name);
  return new Promise((resolve, reject) => {
    const child = spawn(cli, ['compile', '--fqbn', FQBN, '--output-dir', out, '--warnings', 'default', dir]);
    let stdout = '', stderr = '';
    child.stdout.on('data', (c) => { stdout += c; if (!quiet) process.stdout.write(c); });
    child.stderr.on('data', (c) => { stderr += c; if (!quiet) process.stderr.write(c); });
    child.on('error', reject);
    child.on('close', (status) => {
      const diagnostics = parseCompilerErrors(`${stderr}\n${stdout}`);
      if (status !== 0) {
        const errors = diagnostics.filter((d) => d.severity === 'error').length;
        const err = new Error(errors ? `${errors} forditasi hiba` : `arduino-cli failed (exit ${status})`);
        err.diagnostics = diagnostics;
        err.output = stdout + stderr;
        return reject(err);
      }
      const bin = readdirSync(out).find((f) => f.endsWith('.ino.bin'));
      if (!bin) return reject(new Error('compile finished but no .ino.bin found'));
      resolve({ bin: join(out, bin), stdout, stderr, diagnostics });
    });
  });
}

/** Pasted sketch text -> compiled image (Buffer). Used by serve.js. */
export async function compileCode(name, code) {
  prepareSketchFromCode(name, code);
  const res = await compileSketch(name, { quiet: true });
  return { ...res, image: readFileSync(res.bin) };
}

export async function build(target, showPath) {
  const { name } = prepareSketch(target, showPath);
  const { bin } = await compileSketch(name);
  console.log(`\nfirmware: ${bin}`);
  return bin;
}

/**
 * Serial ports: [{ address, label, name, usb, bluetooth }].
 * arduino-cli gives the ports; on Windows the Plug-and-Play device name tells
 * a paired Bluetooth SPP port ("... Bluetooth-kapcsolaton keresztul (COM3)")
 * from a USB-UART bridge (CP210x / CH340) -- esptool on a BT port just says
 * "Write timeout", which is how 2026-09-12 was lost.
 */
export async function listPorts() {
  const cli = findArduinoCli();
  if (!cli) throw new Error('arduino-cli not found');
  const r = spawnSync(cli, ['board', 'list', '--format', 'json'], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`arduino-cli board list failed: ${r.stderr}`);
  const j = JSON.parse(r.stdout || '{}');
  const names = windowsPortNames();
  return (j.detected_ports ?? []).map((p) => {
    const address = p.port.address;
    const name = names.get(address.toUpperCase()) ?? '';
    const bluetooth = /bluetooth/i.test(name);
    const usb = !bluetooth && (Boolean(p.port.properties?.vid) || (p.matching_boards?.length ?? 0) > 0 || /USB|CP210|CH340|Silicon Labs|UART/i.test(name));
    return { address, label: p.port.label, name, usb, bluetooth };
  });
}

/** COMx -> friendly device name (Windows only; empty map elsewhere or on failure) */
function windowsPortNames() {
  const map = new Map();
  if (process.platform !== 'win32') return map;
  const r = spawnSync('powershell', ['-NoProfile', '-Command',
    "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-CimInstance Win32_PnPEntity | Where-Object { $_.Name -match '\\(COM\\d+\\)' } | ForEach-Object { $_.Name }"],
  { encoding: 'utf8', timeout: 8000 });
  if (r.status !== 0) return map;
  for (const line of r.stdout.split(/\r?\n/)) {
    const m = line.match(/^(.*)\((COM\d+)\)\s*$/);
    if (m) map.set(m[2].toUpperCase(), m[1].trim());
  }
  return map;
}

/** esptool upload over USB of an already built sketch folder (async, used by serve.js) -> { output } */
export function uploadSketch(name, port) {
  const cli = findArduinoCli();
  if (!cli) return Promise.reject(new Error('arduino-cli not found'));
  const dir = join(root, 'build', name, name);
  const out = join(root, 'build', name);
  if (!existsSync(out)) return Promise.reject(new Error(`nincs leforditott kep (${name}) -- elobb Fordits`));
  return new Promise((resolve, reject) => {
    const child = spawn(cli, ['upload', '--fqbn', FQBN, '--port', port, '--input-dir', out, dir]);
    let output = '';
    child.stdout.on('data', (c) => { output += c; });
    child.stderr.on('data', (c) => { output += c; });
    child.on('error', reject);
    child.on('close', (status) => {
      if (status !== 0) {
        const hint = /could not open port|Access is denied|PermissionError/i.test(output)
          ? ' -- a port foglalt (masik program / a bongeszo BT-kapcsolata?) vagy nem USB'
          : /No serial data received|Failed to connect/i.test(output) ? ' -- nem valaszol az ESP32: adatkabel? tartsd nyomva a BOOT gombot' : '';
        return reject(Object.assign(new Error(`USB feltoltes sikertelen (exit ${status})${hint}`), { output }));
      }
      resolve({ output });
    });
  });
}

export function upload(target, port) {
  const name = target === 'keret' ? 'keret' : `robot${target}`;
  return uploadSketch(name, port).then((r) => process.stdout.write(r.output));
}

async function main(argv) {
  const [cmd, a, b] = argv;
  try {
    if (cmd === 'check') {
      const cli = findArduinoCli();
      if (!cli) { console.log('arduino-cli: NOT FOUND'); return 1; }
      console.log(`arduino-cli: ${cli}`);
      const r = spawnSync(cli, ['core', 'list'], { encoding: 'utf8' });
      const ok = /esp32:esp32/.test(r.stdout);
      console.log(ok ? 'esp32 core: installed' : 'esp32 core: MISSING (arduino-cli core install esp32:esp32)');
      return ok ? 0 : 1;
    }
    if (cmd === 'ports') {
      const cli = findArduinoCli();
      if (!cli) throw new Error('arduino-cli not found');
      run(cli, ['board', 'list']);
      return 0;
    }
    if (cmd === 'build' && a) { await build(a, b); return 0; }
    if (cmd === 'upload' && a && b) { await upload(a, b); return 0; }
    console.error('usage: node tools/firmware.js check | ports | build <robotId|keret> [show.json] | upload <robotId|keret> <COMx>');
    return 2;
  } catch (e) {
    console.error(e.message);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
