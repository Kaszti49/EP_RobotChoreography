#!/usr/bin/env node
// =====================================================================
//  serve.js -- a dependency-free static server for the UI
//
//  ES modules and the Web Serial API both need an http(s) origin;
//  file:// will not do. http://localhost counts as a secure context.
//
//  usage:  node tools/serve.js [port]     then open http://localhost:8080/ui/
//
//  Besides static files it has two JSON endpoints for the Kod tab
//  (arduino-cli is a native tool, so compiling has to happen here):
//    GET  /api/status            { arduinoCli: bool, busy: bool }
//    GET  /api/ports             { ports: [{ address, label, usb }] }   arduino-cli board list
//    POST /api/upload   { port } -> USB (esptool) install of the last /api/compile image
//    POST /api/compile  { code } -> 200 { ok:true, size, bin:<base64>, diagnostics, log }
//                                   422 { ok:false, error, diagnostics, log }   compile errors
//                                   409 while another compile is running
// =====================================================================

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';
import { compileCode, findArduinoCli, listPorts, uploadSketch } from './firmware.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] ?? 8080);
const MAX_CODE_BYTES = 512 * 1024;

let compiling = false;

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('too large'), { code: 'ETOOLARGE' })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function api(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/status') {
    return sendJson(res, 200, { arduinoCli: Boolean(findArduinoCli()), busy: compiling });
  }
  if (req.method === 'POST' && url.pathname === '/api/compile') {
    if (compiling) return sendJson(res, 409, { ok: false, error: 'mar fut egy forditas' });
    let code;
    try {
      ({ code } = JSON.parse(await readBody(req, MAX_CODE_BYTES)));
    } catch (e) {
      return sendJson(res, e.code === 'ETOOLARGE' ? 413 : 400, { ok: false, error: `rossz keres: ${e.message}` });
    }
    if (typeof code !== 'string') return sendJson(res, 400, { ok: false, error: 'a "code" mezo hianyzik' });
    compiling = true;
    const t0 = Date.now();
    try {
      // one shared sketch folder: build/kod/ -- compiles are serialised above
      const r = await compileCode('kod', code);
      console.log(`compile ok: ${r.image.length} bytes in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      return sendJson(res, 200, {
        ok: true, size: r.image.length, bin: r.image.toString('base64'), diagnostics: r.diagnostics,
        log: (r.stdout + r.stderr).trim(), ms: Date.now() - t0,
      });
    } catch (e) {
      console.log(`compile failed: ${e.message}`);
      return sendJson(res, e.diagnostics ? 422 : 500, {
        ok: false, error: e.message, diagnostics: e.diagnostics ?? [], log: (e.output ?? '').trim(), ms: Date.now() - t0,
      });
    } finally {
      compiling = false;
    }
  }
  if (req.method === 'GET' && url.pathname === '/api/ports') {
    try {
      return sendJson(res, 200, { ok: true, ports: await listPorts() });
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: e.message });
    }
  }
  // USB install of the LAST compiled Kod-tab image (build/kod) with esptool -- for robots
  // still on the camp firmware, which cannot take our Bluetooth OTA.
  if (req.method === 'POST' && url.pathname === '/api/upload') {
    if (compiling) return sendJson(res, 409, { ok: false, error: 'mar fut egy forditas/feltoltes' });
    let port;
    try {
      ({ port } = JSON.parse(await readBody(req, 4096)));
    } catch (e) {
      return sendJson(res, 400, { ok: false, error: `rossz keres: ${e.message}` });
    }
    if (typeof port !== 'string' || !/^[A-Za-z0-9/._-]{1,64}$/.test(port)) return sendJson(res, 400, { ok: false, error: 'rossz port' });
    compiling = true;
    const t0 = Date.now();
    try {
      const r = await uploadSketch('kod', port);
      console.log(`usb upload ok on ${port} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      return sendJson(res, 200, { ok: true, log: r.output.trim(), ms: Date.now() - t0 });
    } catch (e) {
      console.log(`usb upload failed: ${e.message}`);
      return sendJson(res, 500, { ok: false, error: e.message, log: (e.output ?? '').trim(), ms: Date.now() - t0 });
    } finally {
      compiling = false;
    }
  }
  return sendJson(res, 404, { ok: false, error: 'not found' });
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    if (path.includes('..')) throw Object.assign(new Error('forbidden'), { code: 'EFORBIDDEN' });
    // /sources/<file> -> the repo's Sources/ folder (the camp's Segedlet for the Kod tab's help panel)
    let file = /^sources[/\\]/i.test(path) ? join(root, '..', 'Sources', path.slice(8)) : join(root, path);
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch (e) {
    res.writeHead(e.code === 'EFORBIDDEN' ? 403 : 404, { 'Content-Type': 'text/plain' });
    res.end(e.code === 'EFORBIDDEN' ? 'forbidden' : 'not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`koreografia UI: http://localhost:${port}/ui/`);
});
