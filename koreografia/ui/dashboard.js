// =====================================================================
//  dashboard.js -- the Muszerfal tab: live telemetry of the ACTIVE
//  robot (header select), two rolling charts (sensors, PWM), the value
//  table, manual wheel control, and the one-time setup buttons.
//
//  Telemetry: while the tab is open we ask the active robot for
//  R,<TELEMETRY_HZ>; every E,... line becomes one sample. Leaving the
//  tab (or switching robot) sends R,0 so Bluetooth stays quiet during
//  a show. Charts are painted at most once per animation frame.
//
//  Firmware lines understood (firmware/robot/robot.ino header):
//    E,encBal,encJobb,mV,FUT|ALL,s1,s2,s3,s4,s5,pwmBal,pwmJobb,poz
//    T,millis,s1..s5,encBal,encJobb,pwmBal,pwmJobb,poz,?,mV,?   (camp firmware -- charts work, nothing else)
//    L,OK,f1/f2/f3/f4/f5,b1/b2/b3/b4/b5     L,START,ms   L,ERR,...
//    H,encBal,encJobb,ratio                 H,ERR,...
//    N,encL,encR,motL,motR
//    P,keret-ep v2,...                       ours answers P like this; anything else = camp firmware
// =====================================================================

const $ = (id) => document.getElementById(id);

const TELEMETRY_HZ = 10;
const WINDOW_S = 30;
const MAX_SAMPLES = TELEMETRY_HZ * WINDOW_S;
const SENSOR_COLORS = ['#f85149', '#e58a00', '#3fb950', '#58a6ff', '#bc8cff'];
const PWM_COLORS = { bal: '#58a6ff', jobb: '#f85149' };

// A fixed-range strip chart on a canvas. `series` is an array of
// { color, dash, get: (sample) => number | null, scale: [min, max] }.
class StripChart {
  constructor(canvas, { yMin, yMax, gridLines, series }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.yMin = yMin;
    this.yMax = yMax;
    this.gridLines = gridLines;
    this.series = series;
    this.w = 0;
    this.h = 0;
  }

  fit() {
    const box = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.floor(box.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(box.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = box.width;
    this.h = box.height;
  }

  draw(samples) {
    const { ctx, w, h } = this;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 42, padR = 8, padT = 8, padB = 8;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const y = (v) => padT + (this.yMax - v) / (this.yMax - this.yMin) * plotH;

    ctx.font = '10px ui-monospace, monospace';
    ctx.fillStyle = '#8b949e';
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    for (const g of this.gridLines) {
      ctx.beginPath();
      ctx.moveTo(padL, y(g) + 0.5);
      ctx.lineTo(w - padR, y(g) + 0.5);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(String(g), padL - 4, y(g) + 3);
    }
    if (!samples.length) return;

    const x = (i) => padL + (i / (MAX_SAMPLES - 1)) * plotW;
    const offset = MAX_SAMPLES - samples.length; // right-aligned, scrolls in from the right
    for (const s of this.series) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width ?? 1.5;
      ctx.setLineDash(s.dash ?? []);
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i < samples.length; i++) {
        let v = s.get(samples[i]);
        if (v === null || v === undefined || Number.isNaN(v)) { pen = false; continue; }
        if (s.scale) v = s.scale(v);
        v = Math.max(this.yMin, Math.min(this.yMax, v));
        if (pen) ctx.lineTo(x(offset + i), y(v)); else ctx.moveTo(x(offset + i), y(v));
        pen = true;
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}

/**
 * Telemetry line -> sample object, or null if the line is not telemetry.
 * Two dialects:
 *   ours   E,encBal,encJobb,mV,FUT|ALL,s1..s5,pwmBal,pwmJobb,poz          (firmware/robot/robot.ino)
 *   camp   T,millis,s1..s5,encBal,encJobb,pwmBal,pwmJobb,poz,?,mV,?       (the original "keret 2.0",
 *          seen on the robots 2026-09-12; fields 12 and 14 unknown, always 0 so far)
 * `firmware` says which one answered: 'ep' | 'tabor'.
 */
export function parseTelemetry(line) {
  const f = line.trim().split(',');
  const n = (i) => (f[i] === undefined || f[i] === '' ? null : Number(f[i]));
  const pos = (v) => (v === 9999 ? null : v);
  if (f[0] === 'E') {
    return {
      firmware: 'ep',
      encBal: n(1), encJobb: n(2), mv: n(3), mode: f[4] ?? null,
      sensors: f.length >= 10 ? [n(5), n(6), n(7), n(8), n(9)] : null,
      pwmBal: n(10), pwmJobb: n(11),
      pos: pos(n(12)),
    };
  }
  if (f[0] === 'T' && f.length >= 12 && /^\d+$/.test(f[1] ?? '')) {
    return {
      firmware: 'tabor',
      encBal: n(7), encJobb: n(8), mv: n(13), mode: null,
      sensors: [n(2), n(3), n(4), n(5), n(6)],
      pwmBal: n(9), pwmJobb: n(10),
      pos: pos(n(11)),
    };
  }
  return null;
}

/** Is this a telemetry line (either dialect)? Used by the log filter. */
export const isTelemetryLine = (line) => parseTelemetry(line) !== null;

export function initDashboard(ctx) {
  const { serial, activeRobot, isConnected, log, setStatus } = ctx;
  let active = false;                 // is the tab visible
  let telemetryOn = new Map();        // robotId -> hz we last asked for
  let samples = [];
  let shownRobot = null;              // whose samples are in the buffer
  const firmware = new Map();         // robotId -> 'ep' | 'tabor' (learned from what the robot sends)
  // per-robot mm/impulse from robots.json, so the table can show distance, not just counts
  const mmPerImp = new Map();
  fetch('../data/robots.json', { cache: 'no-store' }).then((r) => r.json()).then((j) => {
    for (const r of j.robots) if (r.calibration) mmPerImp.set(r.id, [r.calibration.MM_PER_IMP_BAL, r.calibration.MM_PER_IMP_JOBB]);
  }).catch(() => {});
  const fmtMm = (id, encB, encJ) => {
    const c = mmPerImp.get(id);
    if (!c || encB === null) return 'nincs kalibráció (robots.json)';
    return `${(encB * c[0]).toFixed(0)} / ${(encJ * c[1]).toFixed(0)} mm`;
  };
  const cells = Object.fromEntries([...document.querySelectorAll('#dashTable td[data-k]')].map((td) => [td.dataset.k, td]));

  const sensorChart = new StripChart($('chartSensors'), {
    yMin: 0, yMax: 4095, gridLines: [0, 1024, 2048, 3072, 4095],
    series: [
      ...SENSOR_COLORS.map((color, i) => ({ color, get: (s) => s.sensors?.[i] ?? null })),
      // line position -2000..2000 mapped onto the same axis, dashed
      { color: '#e6edf3', dash: [4, 4], width: 1, get: (s) => s.pos, scale: (p) => (p + 2000) / 4000 * 4095 },
    ],
  });
  const pwmChart = new StripChart($('chartPwm'), {
    yMin: -255, yMax: 255, gridLines: [-255, -128, 0, 128, 255],
    series: [
      { color: PWM_COLORS.bal, get: (s) => s.pwmBal },
      { color: PWM_COLORS.jobb, get: (s) => s.pwmJobb },
    ],
  });

  let drawQueued = false;
  function draw() {
    if (drawQueued || !active) return;
    drawQueued = true;
    requestAnimationFrame(() => {
      drawQueued = false;
      sensorChart.draw(samples);
      pwmChart.draw(samples);
    });
  }

  function onResize() {
    if (!active) return;
    sensorChart.fit();
    pwmChart.fit();
    draw();
  }

  // ---- commands ----------------------------------------------------
  async function send(cmd) {
    const id = activeRobot();
    if (!isConnected(id)) {
      setStatus(`robot ${id} nincs csatlakoztatva`, 'error');
      log(`robot ${id}: nincs kapcsolat, "${cmd}" nem ment el`);
      return false;
    }
    try { await serial.send(id, cmd); return true; } catch (e) { log(e.message); return false; }
  }

  // telemetry only for the active robot, only while the tab is open
  async function syncTelemetry() {
    for (const id of serial.connectedIds()) {
      const want = active && id === activeRobot() ? TELEMETRY_HZ : 0;
      if (telemetryOn.get(id) === want) continue;
      try {
        await serial.send(id, `R,${want}`);
        telemetryOn.set(id, want);
      } catch (e) { log(e.message); }
    }
    for (const id of [...telemetryOn.keys()]) if (!serial.connectedIds().includes(id)) telemetryOn.delete(id);
    if (shownRobot !== activeRobot()) {
      shownRobot = activeRobot();
      samples = [];
      resetTable();
      draw();
    }
    if (active && isConnected(activeRobot()) && firmware.get(activeRobot()) !== 'tabor') send('L,?');
  }

  function noteFirmware(id, kind) {
    if (firmware.get(id) === kind) return;
    firmware.set(id, kind);
    ctx.renderLink();
    if (kind === 'tabor') log(`robot ${id}: TABORI keret fut rajta -- muszerfal ok, de Bluetooth-feltoltes / Start / kalibralas nem megy; elobb USB-telepites (Kod ful)`);
  }

  function resetTable() {
    for (const td of Object.values(cells)) td.textContent = '–';
    $('dashMode').textContent = '–';
  }

  // ---- incoming lines ----------------------------------------------
  function onLine(id, line) {
    const s = parseTelemetry(line);
    if (s) noteFirmware(id, s.firmware);
    else if (line.startsWith('P,keret-ep')) noteFirmware(id, 'ep');
    else if (line.startsWith('P,') || /^=== keret 2/.test(line)) noteFirmware(id, 'tabor');
    if (id !== activeRobot()) return;
    if (s) {
      samples.push(s);
      if (samples.length > MAX_SAMPLES) samples.splice(0, samples.length - MAX_SAMPLES);
      cells.sensors.textContent = s.sensors ? s.sensors.join(' · ') : '– (régi keret)';
      cells.enc.textContent = `${s.encBal} / ${s.encJobb}`;
      cells.mm.textContent = fmtMm(id, s.encBal, s.encJobb);
      cells.pwm.textContent = s.pwmBal === null ? '–' : `${s.pwmBal} / ${s.pwmJobb}`;
      cells.pos.textContent = s.pos === null ? 'nincs vonal' : String(s.pos);
      cells.akku.textContent = s.mv === null ? '–' : `${(s.mv / 1000).toFixed(2)} V`;
      $('dashMode').textContent = s.mode === 'FUT' ? 'FUT (a kódod megy)' : s.mode === 'ALL' ? 'ÁLL' : (s.firmware === 'tabor' ? 'tábori keret' : '–');
      draw();
      return;
    }
    const f = line.trim().split(',');
    if (f[0] === 'L' && f[1] === 'OK' && f.length >= 4) {
      cells.calW.textContent = f[2].split('/').join(' · ');
      cells.calB.textContent = f[3].split('/').join(' · ');
    } else if (f[0] === 'L' && f[1] === 'START') {
      setStatus('Kalibrálás: told át a robotot a vonalon (3 s)…', 'warning');
    } else if (f[0] === 'L' && f[1] === 'ERR') {
      setStatus(`Kalibrálás hiba: ${f.slice(2).join(',')}`, 'error');
    } else if (f[0] === 'H' && f[1] !== 'ERR' && f.length >= 4) {
      const ratio = Number(f[3]);
      const verdict = Math.abs(ratio - 1) < 0.03 ? 'a két kerék egyforma' : ratio < 1 ? 'a jobb kerék lassabb' : 'a bal kerék lassabb';
      $('dashSetupOut').textContent = `kerék-mérés: bal ${f[1]} imp, jobb ${f[2]} imp, jobb/bal = ${f[3]} — ${verdict}`;
      setStatus('Kerék-mérés kész', 'ok');
    } else if (f[0] === 'H' && f[1] === 'ERR') {
      $('dashSetupOut').textContent = `kerék-mérés hiba: ${f.slice(2).join(',')}`;
    } else if (line.startsWith('G kesz:')) {
      const m = line.match(/bal=(-?\d+) jobb=(-?\d+)/);
      $('dashSetupOut').textContent = m
        ? `egy fordulat: bal ${m[1]}, jobb ${m[2]} imp (cél 408) — ${fmtMm(id, Number(m[1]), Number(m[2]))}; a keréknek pontosan egyet kellett fordulnia`
        : line;
    } else if (f[0] === 'N' && f.length === 5) {
      $('signEncL').value = f[1]; $('signEncR').value = f[2]; $('signMotL').value = f[3]; $('signMotR').value = f[4];
    } else if (line.includes('N,AUTO kesz')) {
      $('dashSetupOut').textContent = line;
      setStatus('Enkóder-irány beállítva', 'ok');
    } else if (line.startsWith('!!!')) {
      setStatus(line, 'warning');
    }
  }

  // ---- buttons -----------------------------------------------------
  $('dashStart').addEventListener('click', () => send('T'));
  $('dashStop').addEventListener('click', () => send('S'));
  $('dashEncZero').addEventListener('click', () => send('Z'));
  $('dashCal').addEventListener('click', () => send('L'));
  $('dashEncAuto').addEventListener('click', async () => {
    $('dashSetupOut').textContent = 'enkóder-irány: a robot mindkét kereket megforgatja (kb. 1,5 s)…';
    await send('N,AUTO');
  });
  $('dashWheel').addEventListener('click', async () => {
    $('dashSetupOut').textContent = 'kerék-mérés: 1 s előre mindkét kerékkel — tedd le a padlóra…';
    await send('H');
  });
  $('dashOneRev').addEventListener('click', async () => {
    $('dashSetupOut').textContent = 'egy kerékfordulat: mindkét kerék 408 impulzust megy (138,9 mm) — jelöld meg a kereket, és nézd, pont egyet fordul-e…';
    await send('G,408,408,120');
  });
  $('dashSignQuery').addEventListener('click', () => send('N'));
  $('dashSignSave').addEventListener('click', () =>
    send(`N,${$('signEncL').value},${$('signEncR').value},${$('signMotL').value},${$('signMotR').value}`));

  $('btnRaw').addEventListener('click', () => {
    const line = $('rawCmd').value.trim();
    if (line) send(line);
  });
  $('rawCmd').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('btnRaw').click(); });

  // ---- manual wheel control: hold a button / arrow key -> M,<bal>,<jobb>
  //  repeated every 400 ms (the firmware stops 1.5 s after the last M);
  //  release -> M,0,0
  const DRIVE = {
    fwd: (p) => [p, p],
    back: (p) => [-p, -p],
    left: (p) => [-p, p],   // left wheel back, right forward -> counter-clockwise
    right: (p) => [p, -p],
    stop: () => [0, 0],
  };
  const KEY_TO_DRIVE = { ArrowUp: 'fwd', ArrowDown: 'back', ArrowLeft: 'left', ArrowRight: 'right' };
  let driveTimer = null;
  let driveActive = null;

  async function driveSend(kind) {
    const p = Number($('drivePwm').value);
    const [bal, jobb] = DRIVE[kind](p);
    const id = activeRobot();
    if (!isConnected(id)) { setStatus(`robot ${id} nincs csatlakoztatva`, 'error'); driveStop(false); return; }
    try { await serial.drive(id, bal, jobb); } catch (e) { log(e.message); driveStop(false); }
  }

  function driveStart(kind) {
    if (driveActive === kind) return;
    driveStop(false);
    driveActive = kind;
    document.querySelector(`[data-drive="${kind}"]`)?.classList.add('active');
    driveSend(kind);
    driveTimer = setInterval(() => driveSend(kind), 400);
  }

  function driveStop(sendStop = true) {
    if (driveTimer) clearInterval(driveTimer);
    driveTimer = null;
    if (driveActive) document.querySelector(`[data-drive="${driveActive}"]`)?.classList.remove('active');
    const was = driveActive;
    driveActive = null;
    if (sendStop && was) driveSend('stop');
  }

  for (const b of document.querySelectorAll('[data-drive]')) {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); driveStart(b.dataset.drive); });
    b.addEventListener('pointerup', () => driveStop());
    b.addEventListener('pointercancel', () => driveStop());
    b.addEventListener('lostpointercapture', () => driveStop());
  }
  window.addEventListener('keydown', (e) => {
    if (!active) return;
    const kind = KEY_TO_DRIVE[e.key];
    if (!kind || e.repeat || e.target.matches('input, textarea, select')) return;
    e.preventDefault();
    driveStart(kind);
  });
  window.addEventListener('keyup', (e) => { if (KEY_TO_DRIVE[e.key]) driveStop(); });
  window.addEventListener('blur', () => driveStop());
  $('drivePwm').addEventListener('input', (e) => { $('drivePwmLabel').textContent = e.target.value; });

  // ---- lifecycle ---------------------------------------------------
  return {
    onLine,
    onResize,
    /** 'ep' | 'tabor' | undefined (nothing heard yet) */
    firmwareOf: (id) => firmware.get(id),
    forget: (id) => firmware.delete(id),
    onActivate() {
      active = true;
      onResize();
      syncTelemetry();
    },
    onDeactivate() {
      active = false;
      driveStop();
      syncTelemetry();
    },
    onLinkChange() {
      syncTelemetry();
    },
  };
}
