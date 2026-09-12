// =====================================================================
//  app.js -- the page shell: header (robot link), tabs, and the
//  Koreografia tab. The Kod tab lives in code-tab.js, the Muszerfal in
//  dashboard.js; both get the same small context object from here.
//  No framework, no bundler.
//
//  Choreography state is one immutable "compiled" object plus a time
//  cursor. Every edit re-runs compile + validate from the JSON in the
//  textarea; the canvas and panels are pure functions of
//  (compiled, validation, t).
// =====================================================================

import { compileShow, CompileError } from '../core/compile.js';
import { validateShow } from '../core/validate.js';
import { emitAll, emitRobot, fileNameFor } from '../core/emit.js';
import { showLengthMs } from '../core/timeline.js';
import { ManualTransport, browserDownloadSink } from '../transport/manual.js';
import { WebSerialTransport } from '../transport/webserial.js';
import { FieldView } from './field.js';
import { TimelineView } from './timeline-view.js';
import { initCodeTab } from './code-tab.js';
import { initDashboard, isTelemetryLine } from './dashboard.js';

const $ = (id) => document.getElementById(id);

const state = {
  show: null,
  compiled: null,
  validation: null,
  t: 0,
  playing: false,
  lastFrame: 0,
  robots: [1, 2, 3, 4, 5], // ids offered in the header; replaced from robots.json
  tab: 'koreo',
};

const field = new FieldView($('field'));
const timeline = new TimelineView($('timeline'), (t) => seek(t));

// ---------------------------------------------------------------------
//  shared helpers (also handed to the other tabs)
// ---------------------------------------------------------------------
function setStatus(text, kind = '') {
  const el = $('status');
  el.textContent = text;
  el.className = `status ${kind}`;
}

function log(line) {
  const el = $('dashLog');
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
  el.textContent += `${line}\n`;
  if (el.textContent.length > 60000) el.textContent = el.textContent.slice(-40000);
  if (atBottom) el.scrollTop = el.scrollHeight;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ---------------------------------------------------------------------
//  connection (Web Serial): the header picks ONE active robot; STOP
//  broadcasts. Telemetry lines (E,... ours / T,... camp) go to the
//  dashboard, not the log -- at 10 Hz they would bury everything else.
// ---------------------------------------------------------------------
const serial = new WebSerialTransport({
  onLine: (id, line) => {
    if (!isTelemetryLine(line)) log(`robot ${id} -> ${line}`);
    dashboard.onLine(id, line);
  },
  onLog: log,
  onDisconnect: (id) => { dashboard.forget(id); renderLink(); setStatus(`robot ${id}: a kapcsolat megszakadt — újracsatlakozás…`, 'warning'); },
  onReconnect: async (id) => {
    renderLink();
    setStatus(`robot ${id}: újra csatlakozva`, 'ok');
    try { await serial.send(id, 'P'); } catch { /* the pill updates when the reply arrives */ }
  },
});

const activeRobot = () => Number($('robotSel').value);
const isConnected = (id) => serial.connectedIds().includes(id);

function renderLink() {
  const id = activeRobot();
  const ids = serial.connectedIds();
  const on = ids.includes(id);
  $('btnConnect').textContent = on ? 'Bontás' : 'Csatlakozás';
  $('btnConnect').className = on ? '' : 'primary';
  $('btnConnect').disabled = !WebSerialTransport.available;
  const pill = $('connState');
  pill.className = `pill ${on ? 'on' : ''}`;
  const fw = { ep: 'saját keret', tabor: 'TÁBORI keret' }[dashboard.firmwareOf(id)] ?? '';
  pill.textContent = ids.length
    ? `robot ${id}: ${on ? `csatlakozva${fw ? ` (${fw})` : ''}` : 'nincs kapcsolat'} · összesen ${ids.length}`
    : (WebSerialTransport.available ? 'nincs kapcsolat' : 'Web Serial nem elérhető (Chrome/Edge kell)');
  pill.title = fw === 'TÁBORI keret' ? 'A roboton még a tábori keret fut: Bluetooth-feltöltés nem megy, előbb USB-telepítés (Kód fül).' : '';
  dashboard.onLinkChange();
}

function renderRobotSelect() {
  const sel = $('robotSel');
  const keep = sel.value;
  sel.innerHTML = state.robots.map((id) => `<option value="${id}">${id}</option>`).join('');
  if ([...sel.options].some((o) => o.value === keep)) sel.value = keep;
  renderLink();
}

$('robotSel').addEventListener('change', renderLink);

$('btnConnect').addEventListener('click', async () => {
  const id = activeRobot();
  try {
    if (isConnected(id)) {
      await serial.disconnect(id);
      dashboard.forget(id);
    } else {
      await serial.connect(id);
      await serial.send(id, 'P'); // which firmware? (our reply starts with P,keret-ep)
    }
  } catch (e) {
    log(`robot ${id}: ${e.message}`);
    setStatus(`robot ${id}: ${e.message}`, 'error');
  }
  renderLink();
});

$('btnStopAll').addEventListener('click', async () => {
  try { await serial.broadcast('S'); } catch (e) { log(e.message); }
});

const ctx = { serial, activeRobot, isConnected, log, setStatus, switchTab, renderLink, firmwareOf: (id) => dashboard.firmwareOf(id) };

// ---------------------------------------------------------------------
//  tabs
// ---------------------------------------------------------------------
function switchTab(name) {
  if (state.tab === name) return;
  const prev = state.tab;
  state.tab = name;
  for (const b of document.querySelectorAll('nav.tabs button')) b.classList.toggle('active', b.dataset.tab === name);
  for (const s of document.querySelectorAll('main > .tab')) s.classList.toggle('active', s.id === `tab-${name}`);
  if (prev === 'muszerfal') dashboard.onDeactivate();
  if (name === 'muszerfal') dashboard.onActivate();
  if (name === 'koreo') resize();
  localStorage.setItem('koreografia.tab', name);
}
for (const b of document.querySelectorAll('nav.tabs button')) b.addEventListener('click', () => switchTab(b.dataset.tab));

// ---------------------------------------------------------------------
//  load / apply
// ---------------------------------------------------------------------
function applyShow(show) {
  try {
    const compiled = compileShow(show);
    const validation = validateShow(compiled);
    state.show = show;
    state.compiled = compiled;
    state.validation = validation;
    state.t = Math.min(state.t, showLengthMs(compiled));
    $('json').value = JSON.stringify(show, null, 2);
    $('scrub').max = String(showLengthMs(compiled));
    renderPanels();
    setStatus(validation.ok
      ? `OK — ${compiled.robots.length} robot, ${compiled.beats.length} ütem, ${validation.warnings.length} figyelmeztetés`
      : `${validation.errors.length} hiba — nincs kibocsátás`, validation.ok ? 'ok' : 'error');
    field.highlight = null;
    timeline.highlightBeat = null;
    draw();
  } catch (e) {
    const where = e instanceof CompileError ? ` (ütem ${e.beat === null ? '?' : e.beat + 1}, robot ${e.robot ?? '?'})` : '';
    setStatus(`Fordítási hiba: ${e.message}${where}`, 'error');
    $('summary').textContent = e.message;
    $('findings').innerHTML = '';
  }
}

async function loadShowUrl(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  applyShow(await res.json());
}

const loadExample = () => loadShowUrl('../data/example-show.json');

$('btnExample').addEventListener('click', loadExample);

$('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    applyShow(JSON.parse(await file.text()));
  } catch (err) {
    setStatus(`Nem JSON: ${err.message}`, 'error');
  }
});

$('btnApply').addEventListener('click', () => {
  try {
    applyShow(JSON.parse($('json').value));
  } catch (err) {
    setStatus(`Nem JSON: ${err.message}`, 'error');
  }
});

$('btnSave').addEventListener('click', () => {
  if (!state.show) return;
  browserDownloadSink('show.json', JSON.stringify(state.show, null, 2));
});

// ---------------------------------------------------------------------
//  emit
// ---------------------------------------------------------------------
async function loadDeps() {
  const [template, robots] = await Promise.all([
    fetch('../templates/show_template.txt', { cache: 'no-store' }).then((r) => r.text()),
    fetch('../data/robots.json', { cache: 'no-store' }).then((r) => r.json()),
  ]);
  return { template, robots };
}

function emitGuard() {
  if (!state.compiled) { setStatus('Nincs show betöltve.', 'error'); return false; }
  if (!state.validation.ok) { setStatus('Nincs kibocsátás: először javítsd a hibákat.', 'error'); return false; }
  return true;
}

$('btnEmit').addEventListener('click', async () => {
  if (!emitGuard()) return;
  try {
    const deps = await loadDeps();
    const { files, errors } = emitAll(state.compiled, { ...deps, validation: state.validation });
    const transport = new ManualTransport(browserDownloadSink, log);
    for (const [id, text] of Object.entries(files)) transport.stage(Number(id), fileNameFor(Number(id)), text);
    const names = transport.flush();
    const skipped = Object.keys(errors);
    setStatus(`Letöltve: ${names.join(', ')}${skipped.length ? ` — nincs kalibráció: robot ${skipped.join(', ')}` : ''}`,
      skipped.length ? 'warning' : 'ok');
    for (const [id, msg] of Object.entries(errors)) log(`robot ${id}: ${msg}`);
  } catch (e) {
    setStatus(`Kibocsátási hiba: ${e.message}`, 'error');
  }
});

// the active robot's emitted sketch -> Kod tab editor
$('btnToCode').addEventListener('click', async () => {
  if (!emitGuard()) return;
  const id = activeRobot();
  try {
    const deps = await loadDeps();
    const txt = emitRobot(state.compiled, id, { ...deps, validation: state.validation });
    codeTab.setCode(txt, `koreográfia → robot ${id}`);
    switchTab('kod');
  } catch (e) {
    setStatus(`robot ${id}: ${e.message}`, 'error');
  }
});

// ---------------------------------------------------------------------
//  panels
// ---------------------------------------------------------------------
function renderPanels() {
  const { compiled, validation } = state;
  const summary = $('summary');
  const list = $('findings');
  list.innerHTML = '';
  if (validation.ok && validation.warnings.length === 0) {
    summary.innerHTML = '<span class="ok">Minden ellenőrzés rendben.</span>';
  } else {
    summary.textContent = `${validation.errors.length} hiba, ${validation.warnings.length} figyelmeztetés`;
  }
  for (const f of [...validation.errors, ...validation.warnings]) {
    const li = document.createElement('li');
    li.className = f.severity;
    li.innerHTML = `<span class="tag">${f.severity === 'error' ? 'HIBA' : 'FIGYELEM'} · ${f.check}</span>${escapeHtml(f.message)}`;
    li.addEventListener('click', () => jumpToFinding(f));
    list.appendChild(li);
  }

  const tbody = $('beats').querySelector('tbody');
  tbody.innerHTML = '';
  for (const s of validation.beatStats) {
    const tr = document.createElement('tr');
    const sl = s.slowest;
    const fits = sl.required_ms <= s.duration_ms;
    tr.innerHTML = `<td>${s.beat + 1}</td><td>${escapeHtml(s.name)}${compiled.beats[s.beat].anchor ? ' ⚓' : ''}</td>`
      + `<td>${s.duration_ms}</td>`
      + `<td style="color:${fits ? '' : 'var(--err)'}">R${sl.robot}: ${Math.round(sl.required_ms)} ms</td>`;
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => jumpToBeat(s.beat, null));
    tbody.appendChild(tr);
  }
}

function beatStartMs(index) {
  let t = 0;
  for (const b of state.compiled.beats) {
    if (b.index === index) return t;
    t += b.duration_ms;
  }
  return t;
}

function jumpToBeat(index, robots) {
  field.highlight = { beat: index, robots: new Set(robots ?? state.compiled.robots.map((r) => r.id)) };
  timeline.highlightBeat = index;
  seek(beatStartMs(index));
}

function jumpToFinding(f) {
  const robots = f.robots ?? (f.robot !== null ? [f.robot] : null);
  jumpToBeat(f.beat ?? 0, robots);
  if (f.t_ms !== null && f.t_ms !== undefined) seek(beatStartMs(f.beat) + f.t_ms);
}

// ---------------------------------------------------------------------
//  playback
// ---------------------------------------------------------------------
function seek(t) {
  state.t = Math.max(0, Math.min(t, state.compiled ? showLengthMs(state.compiled) : 0));
  draw();
}

// Every caller (scrub events, resize, playback, clicks) asks for a draw;
// the canvas is painted at most once per animation frame.
let drawQueued = false;
function draw() {
  if (drawQueued) return;
  drawQueued = true;
  requestAnimationFrame(paint);
}

function paint(now) {
  drawQueued = false;
  if (state.playing) {
    const dt = (now - state.lastFrame) * Number($('speed').value);
    state.lastFrame = now;
    const total = showLengthMs(state.compiled);
    state.t += dt;
    if (state.t >= total) { state.t = total; state.playing = false; $('btnPlay').textContent = '▶ Lejátszás'; }
  }
  $('scrub').value = String(Math.round(state.t));
  $('timeLabel').textContent = `${(state.t / 1000).toFixed(1)} s`;
  if (state.tab === 'koreo') {
    field.draw(state.compiled, state.t);
    timeline.draw(state.compiled, state.t);
  }
  if (state.playing) draw();
}

$('btnPlay').addEventListener('click', () => {
  if (!state.compiled) return;
  state.playing = !state.playing;
  $('btnPlay').textContent = state.playing ? '❚❚ Szünet' : '▶ Lejátszás';
  if (state.playing) {
    if (state.t >= showLengthMs(state.compiled)) state.t = 0;
    state.lastFrame = performance.now();
    draw();
  }
});
$('btnStop').addEventListener('click', () => { state.playing = false; $('btnPlay').textContent = '▶ Lejátszás'; seek(0); });
$('scrub').addEventListener('input', (e) => seek(Number(e.target.value)));

function resize() {
  if (state.tab !== 'koreo') return; // hidden canvases measure 0x0
  field.fit();
  timeline.fit();
  draw();
}
window.addEventListener('resize', () => { resize(); dashboard.onResize(); });

// ---------------------------------------------------------------------
//  the other two tabs
// ---------------------------------------------------------------------
const codeTab = initCodeTab(ctx);
const dashboard = initDashboard(ctx);
// devtools handle, e.g. koreografia.dashboard.onLine(1, 'E,0,0,7800,ALL,100,200,3000,200,100,80,80,-150')
window.koreografia = { serial, dashboard, codeTab, state };

// ---------------------------------------------------------------------
//  startup: ?show=<url> loads a served show file, ?t=<ms> seeks,
//  ?tab=kod|muszerfal opens a tab (else the last one used)
// ---------------------------------------------------------------------
renderRobotSelect();
fetch('../data/robots.json', { cache: 'no-store' }).then((r) => r.json()).then((j) => {
  state.robots = j.robots.map((r) => r.id);
  renderRobotSelect();
}).catch(() => {});

resize();
const params = new URLSearchParams(location.search);
loadShowUrl(params.get('show') || '../data/example-show.json')
  .then(() => { if (params.has('t')) seek(Number(params.get('t'))); })
  .catch((e) => setStatus(`Betöltési hiba: ${e.message}`, 'error'));
const startTab = params.get('tab') || localStorage.getItem('koreografia.tab');
if (startTab && startTab !== 'koreo') switchTab(startTab);

// A reload loses the link but not the grant: probe the ports granted earlier
// (Bluetooth ones first) with P and keep the first that answers like a robot.
// One robot at a time for now -- it becomes the selected robot.
async function autoConnect() {
  const ports = await WebSerialTransport.grantedPorts();
  if (!ports.length) return;
  const id = activeRobot();
  ports.sort((p, q) => Boolean(q.getInfo().bluetoothServiceClassId) - Boolean(p.getInfo().bluetoothServiceClassId));
  setStatus(`robot ${id}: automatikus csatlakozás (${ports.length} ismert port)…`);
  for (const port of ports) {
    try {
      await Promise.race([serial.connect(id, port), new Promise((_, rej) => setTimeout(() => rej(new Error('nem nyílt meg 6 s alatt')), 6000))]);
      await serial.send(id, 'P');
      const t0 = Date.now();
      while (Date.now() - t0 < 2500) {
        const line = await serial.nextLine(id, 2500 - (Date.now() - t0)).catch(() => null);
        if (line === null) break;
        if (line.startsWith('P,')) {
          setStatus(`robot ${id}: automatikusan csatlakozva`, 'ok');
          renderLink();
          return;
        }
      }
      await serial.disconnect(id);
    } catch (e) {
      log(`automatikus csatlakozás: egy port nem jó (${e.message})`);
      await serial.disconnect(id).catch(() => {});
    }
  }
  setStatus('Nincs válaszoló robot az ismert portokon -- Csatlakozás kézzel', 'warning');
  renderLink();
}
autoConnect().catch((e) => log(`automatikus csatlakozás: ${e.message}`));
