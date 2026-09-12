// =====================================================================
//  code-tab.js -- the Kod tab: paste a sketch (indulas / vezerles),
//  compile it on the dev server (POST /api/compile -> arduino-cli),
//  upload the resulting image to the active robot over Bluetooth
//  (transport/ota.js), or upload a ready-made .bin.
//
//  The editor is a plain textarea with a line-number gutter; the
//  content survives reloads in localStorage. Compiler diagnostics are
//  listed under the editor, line numbers are clickable.
// =====================================================================

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'koreografia.code';

const BLANK = `// Ket fuggvenyt irsz: indulas() egyszer fut a Start-ra,
// vezerles() 20 ms-onkent, amig a feladat fut (Stop = S).
// Segedlet: jobb felul a gomb. Fordit + Feltolt: Ctrl+Enter.

void indulas() {
  uzenet("Robot kesz.");
  enkoderNullaz();
}

void vezerles() {
  motor(0, 0);
}
`;

const EXAMPLES = [
  { id: 'blank', label: 'üres sablon (indulas / vezerles)', text: BLANK },
  { id: 'keret', label: 'helykitöltő show.ino (csak a keret)', url: '../firmware/robot/show.ino' },
  { id: 'negyzet', label: 'négyzet menj()-jel', text: `// Egy 30 cm-es negyzet a menj() fuggvennyel (408 imp = 1 fordulat = 138,9 mm).
const long OLDAL_IMP = 408L * 300 / 139;   // ~300 mm
const long FORDUL_IMP = 300;                // 90 fok -- robotonkent mas, hangold!

void indulas() {
  uzenet("negyzet indul");
  for (int i = 0; i < 4; i++) {
    menj(OLDAL_IMP, OLDAL_IMP, 120);
    varj(300);
    menj(FORDUL_IMP, -FORDUL_IMP, 100);
    varj(300);
  }
  uzenet("negyzet kesz");
}

void vezerles() {
  motor(0, 0);
}
` },
  { id: 'vonal', label: 'vonalkövetés (P-szabályozó)', text: `// Egyszeru vonalkoveto: a vonalPozicioSzamol() -2000..2000 kozott adja
// a vonal helyet, ebbol szamolunk korrekciot. Elotte Szenzor-kalibralas (Muszerfal)!
int Kp = 8;        // /100 -- ha kigyozik, csokkentsd; ha lassan reagal, noveld

void indulas() {
  uzenet("vonalkovetes indul");
  alapSebesseg = 110;
}

void vezerles() {
  int poz = vonalPozicioSzamol();
  if (poz == 9999) { motor(0, 0); return; }   // nincs vonal -> all
  int korr = (int)((long)poz * Kp / 100);
  korr = constrain(korr, -maxKorrekcio, maxKorrekcio);
  motor(alapSebesseg + korr, alapSebesseg - korr);
}
` },
];

export function initCodeTab(ctx) {
  const { serial, activeRobot, isConnected, log, setStatus, firmwareOf } = ctx;
  const code = $('code');
  const gutter = $('gutter');
  const out = $('codeOut');
  let lastBin = null;    // Uint8Array of the last successful compile
  let lastBinFor = '';   // the code it was compiled from
  let busy = false;
  let errorLines = new Set();

  // ---- editor -------------------------------------------------------
  function renderGutter() {
    const n = code.value.split('\n').length;
    let html = '';
    for (let i = 1; i <= n; i++) html += errorLines.has(i) ? `<span class="err">${i}</span>\n` : `${i}\n`;
    gutter.innerHTML = html;
    gutter.scrollTop = code.scrollTop;
  }
  code.addEventListener('input', () => {
    errorLines = new Set();
    renderGutter();
    $('btnUpload').disabled = !(lastBin && code.value === lastBinFor);
    scheduleSave();
  });
  code.addEventListener('scroll', () => { gutter.scrollTop = code.scrollTop; });
  code.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { // two spaces, keep the cursor
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en } = code;
      code.setRangeText('  ', s, en, 'end');
      code.dispatchEvent(new Event('input'));
    }
  });

  let saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => localStorage.setItem(STORAGE_KEY, code.value), 400);
  }

  function setCode(text, label) {
    code.value = text;
    errorLines = new Set();
    renderGutter();
    localStorage.setItem(STORAGE_KEY, text);
    $('btnUpload').disabled = true;
    if (label) say(`betöltve: ${label}`);
  }

  function gotoLine(line) {
    const lines = code.value.split('\n');
    let pos = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) pos += lines[i].length + 1;
    code.focus();
    code.setSelectionRange(pos, pos + (lines[line - 1]?.length ?? 0));
    const lineHeight = parseFloat(getComputedStyle(code).lineHeight) || 17;
    code.scrollTop = Math.max(0, (line - 4) * lineHeight);
  }

  // ---- examples / save / load -------------------------------------
  const sel = $('codeExample');
  for (const ex of EXAMPLES) {
    const o = document.createElement('option');
    o.value = ex.id;
    o.textContent = ex.label;
    sel.appendChild(o);
  }
  sel.addEventListener('change', async () => {
    const ex = EXAMPLES.find((x) => x.id === sel.value);
    sel.value = '';
    if (!ex) return;
    // only ask when there is something of the user's own to lose
    const untouched = !code.value.trim() || code.value === BLANK || code.value === localStorage.getItem(`${STORAGE_KEY}.example`);
    if (!untouched && !confirm('A szerkesztő tartalma felülíródik. Folytatod?')) return;
    try {
      const text = ex.text ?? await (await fetch(ex.url, { cache: 'no-store' })).text();
      setCode(text, ex.label);
      localStorage.setItem(`${STORAGE_KEY}.example`, text);
    } catch (e) {
      say(`nem sikerült betölteni: ${e.message}`, 'error');
    }
  });

  $('btnCodeSave').addEventListener('click', () => {
    const blob = new Blob([code.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `show_robot${activeRobot()}.ino`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('btnCodeLoad').addEventListener('click', () => $('codeFile').click());
  $('codeFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCode(await f.text(), f.name);
    e.target.value = '';
  });

  // ---- output ------------------------------------------------------
  function say(text, kind = '') {
    out.innerHTML = '';
    const span = document.createElement('span');
    span.className = kind;
    span.textContent = text;
    out.appendChild(span);
  }

  function showDiagnostics(res, headline, kind) {
    out.innerHTML = '';
    const head = document.createElement('div');
    head.className = kind;
    head.textContent = headline;
    out.appendChild(head);
    // the user's file: everything; the framework file: only errors (its deprecation warnings are not theirs to fix)
    const diags = (res.diagnostics ?? []).filter((d) => (d.file === 'show.ino' ? d.severity !== 'note' : d.severity === 'error'));
    errorLines = new Set(diags.filter((d) => d.file === 'show.ino' && d.severity === 'error').map((d) => d.line));
    renderGutter();
    for (const d of diags) {
      const row = document.createElement('span');
      row.className = `diag ${d.severity}`;
      const tag = d.severity === 'error' ? 'HIBA' : d.severity === 'warning' ? 'figyelem' : 'megj.';
      if (d.file === 'show.ino') {
        const a = document.createElement('a');
        a.textContent = `${d.line}. sor`;
        a.addEventListener('click', () => gotoLine(d.line));
        row.append(`${tag} · `, a, `: ${d.message}`);
      } else {
        row.textContent = `${tag} · (keret: ${d.file}:${d.line}) ${d.message}`;
      }
      out.appendChild(row);
    }
    if (!diags.length && res.log) {
      const pre = document.createElement('span');
      pre.className = 'diag note';
      pre.textContent = res.log.split('\n').slice(-15).join('\n');
      out.appendChild(pre);
    }
    const first = diags.find((d) => d.file === 'show.ino' && d.severity === 'error');
    if (first) gotoLine(first.line);
  }

  // ---- compile -----------------------------------------------------
  async function compile() {
    if (busy) return false;
    const src = code.value;
    if (!src.trim()) { say('Üres a szerkesztő.', 'error'); return false; }
    busy = true;
    setButtons();
    const t0 = performance.now();
    const tick = setInterval(() => say(`Fordítás… ${((performance.now() - t0) / 1000).toFixed(0)} s (általában 25–40 s)`), 500);
    say('Fordítás…');
    try {
      const res = await fetch('/api/compile', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: src }),
      });
      const j = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
      const secs = ((performance.now() - t0) / 1000).toFixed(1);
      if (!j.ok) {
        lastBin = null;
        showDiagnostics(j, `${j.error ?? 'fordítási hiba'} (${secs} s)`, 'error');
        setStatus(`Fordítás: ${j.error ?? 'hiba'}`, 'error');
        return false;
      }
      lastBin = Uint8Array.from(atob(j.bin), (c) => c.charCodeAt(0));
      lastBinFor = src;
      const warns = (j.diagnostics ?? []).filter((d) => d.file === 'show.ino' && d.severity === 'warning');
      showDiagnostics({ diagnostics: warns }, `✓ Lefordult: ${(j.size / 1024).toFixed(0)} kB, ${secs} s${warns.length ? ` — ${warns.length} figyelmeztetés` : ''}`, 'ok');
      setStatus(`Fordítás kész (${secs} s)`, 'ok');
      return true;
    } catch (e) {
      lastBin = null;
      say(`Nem érem el a fordítót: ${e.message} — fut a "node tools/serve.js"?`, 'error');
      setStatus('Fordító nem elérhető', 'error');
      return false;
    } finally {
      clearInterval(tick);
      busy = false;
      setButtons();
    }
  }

  // ---- upload ------------------------------------------------------
  const TABOR_HINT = 'a roboton a TÁBORI keret fut, az nem érti a mi Bluetooth-feltöltésünket. Egyszer USB-n kell telepíteni a saját keretet (lent: USB-telepítés), utána már megy Bluetooth-on.';

  async function uploadImage(bin, what) {
    const id = activeRobot();
    if (!isConnected(id)) {
      say(`robot ${id} nincs csatlakoztatva — fent: Csatlakozás.`, 'error');
      setStatus(`robot ${id} nincs csatlakoztatva`, 'error');
      return false;
    }
    if (firmwareOf(id) === 'tabor') {
      say(`Nem megy Bluetooth-on: ${TABOR_HINT}`, 'error');
      setStatus(`robot ${id}: tábori keret — USB-telepítés kell`, 'error');
      return false;
    }
    busy = true;
    setButtons();
    const bar = $('otaProgress');
    bar.hidden = false;
    bar.value = 0;
    const t0 = performance.now();
    say(`${what}: ${bin.length} bájt küldése robot ${id}-nek…`);
    try {
      const res = await serial.uploadFirmware(id, bin, {
        onProgress: (sent, total) => {
          bar.value = Math.round(sent / total * 100);
          const kbs = sent / 1024 / ((performance.now() - t0) / 1000);
          say(`${what}: ${Math.round(sent / 1024)} / ${Math.round(total / 1024)} kB (${kbs.toFixed(0)} kB/s) → robot ${id}`);
        },
      });
      say(`✓ Feltöltve robot ${id}-re: ${res.bytes} bájt, md5 ${res.md5}, ${((performance.now() - t0) / 1000).toFixed(0)} s. A robot újraindul, a kapcsolat pár mp múlva magától visszaáll.`, 'ok');
      setStatus(`Feltöltés kész, robot ${id} újraindul`, 'ok');
      return true;
    } catch (e) {
      const why = /no reply/.test(e.message) && firmwareOf(id) !== 'ep'
        ? ` — a robot nem válaszolt az F parancsra; valószínűleg ${TABOR_HINT}` : '';
      say(`Feltöltési hiba: ${e.message}${why}`, 'error');
      setStatus(`Feltöltés: ${e.message}`, 'error');
      log(`OTA robot ${id}: ${e.message}`);
      return false;
    } finally {
      bar.hidden = true;
      busy = false;
      setButtons();
    }
  }

  function setButtons() {
    $('btnCompile').disabled = busy;
    $('btnCompileUpload').disabled = busy;
    $('btnUpload').disabled = busy || !(lastBin && code.value === lastBinFor);
    $('btnOta').disabled = busy;
    $('btnUsb').disabled = busy || !lastBin || !$('usbPort').value;
  }

  // ---- USB install (server-side esptool of the last compiled image) ---
  async function refreshPorts() {
    const sel = $('usbPort');
    const keep = sel.value;
    try {
      const j = await (await fetch('/api/ports', { cache: 'no-store' })).json();
      if (!j.ok) throw new Error(j.error);
      // Bluetooth SPP ports are listed but disabled: esptool cannot flash over them
      sel.innerHTML = '<option value="">— port —</option>'
        + j.ports.map((p) => `<option value="${p.address}" ${p.bluetooth ? 'disabled' : ''}>${p.label}`
          + `${p.bluetooth ? ' — Bluetooth (nem jó)' : p.usb ? ' — USB' : ''}${p.name && !p.bluetooth ? ` (${p.name})` : ''}</option>`).join('');
      const usb = j.ports.filter((p) => p.usb);
      sel.value = [...sel.options].some((o) => o.value === keep && !o.disabled) ? keep : (usb.length === 1 ? usb[0].address : '');
      if (!usb.length) {
        $('usbHint').textContent = 'nincs USB-port: csak Bluetooth-portok látszanak. Kábel a robot ESP32-jébe (ADATkábel, nem töltő), '
          + 'majd ⟳. Ha akkor sem: CP210x / CH340 meghajtó kell a gépre.';
      } else {
        $('usbHint').textContent = '';
      }
    } catch (e) {
      log(`portok: ${e.message}`);
    }
    setButtons();
  }
  $('btnPorts').addEventListener('click', refreshPorts);
  $('usbPort').addEventListener('change', setButtons);
  $('usbPort').addEventListener('focus', () => { if ($('usbPort').options.length <= 1) refreshPorts(); });

  $('btnUsb').addEventListener('click', async () => {
    const port = $('usbPort').value;
    if (!port || !lastBin) return;
    const id = activeRobot();
    // esptool reboots the chip: the BT link dies and reconnects by itself afterwards
    busy = true;
    setButtons();
    const t0 = performance.now();
    const tick = setInterval(() => say(`USB-telepítés ${port}… ${((performance.now() - t0) / 1000).toFixed(0)} s (kb. 20–40 s)`), 500);
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ port }) });
      const j = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
      clearInterval(tick);
      if (!j.ok) {
        say(`USB-telepítés hiba: ${j.error}\n${(j.log ?? '').split('\n').slice(-8).join('\n')}`, 'error');
        setStatus('USB-telepítés sikertelen', 'error');
        return;
      }
      say(`✓ USB-telepítés kész (${((performance.now() - t0) / 1000).toFixed(0)} s). A robot újraindul a saját kerettel — a Bluetooth-kapcsolat pár mp múlva magától visszaáll (ha nem: fent Csatlakozás), és innentől Fordít + Feltölt is megy.`, 'ok');
      setStatus('USB-telepítés kész', 'ok');
    } catch (e) {
      clearInterval(tick);
      say(`USB-telepítés: ${e.message}`, 'error');
    } finally {
      busy = false;
      setButtons();
    }
  });

  $('btnCompile').addEventListener('click', compile);
  $('btnUpload').addEventListener('click', () => lastBin && uploadImage(lastBin, 'Feltöltés'));
  $('btnCompileUpload').addEventListener('click', async () => {
    const id = activeRobot();
    if (!isConnected(id)) { say(`robot ${id} nincs csatlakoztatva — előbb Csatlakozás, aztán Fordít + Feltölt.`, 'error'); return; }
    if (await compile()) await uploadImage(lastBin, 'Feltöltés');
  });
  window.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (!document.getElementById('tab-kod').classList.contains('active')) return;
    if (e.key === 's' || e.key === 'S') { e.preventDefault(); compile(); }
    if (e.key === 'Enter') { e.preventDefault(); $('btnCompileUpload').click(); }
  });

  // ready-made .bin (tools/firmware.js build)
  $('btnOta').addEventListener('click', async () => {
    const file = $('fwFile').files[0];
    if (!file) { $('otaStatus').textContent = 'Válassz egy .bin fájlt.'; return; }
    $('otaStatus').textContent = file.name;
    await uploadImage(new Uint8Array(await file.arrayBuffer()), file.name);
  });

  // ---- help (Sources/Segedlet.txt via serve.js) --------------------
  $('btnHelp').addEventListener('click', async () => {
    const panel = $('helpPanel');
    panel.hidden = false;
    if (!panel.dataset.loaded) {
      try {
        const r = await fetch('/sources/Seg%C3%A9dlet.txt', { cache: 'no-store' });
        $('helpText').textContent = r.ok ? await r.text() : `nem található (HTTP ${r.status}) — Sources/Segédlet.txt`;
        panel.dataset.loaded = '1';
      } catch (e) {
        $('helpText').textContent = `nem sikerült betölteni: ${e.message}`;
      }
    }
  });
  $('btnHelpClose').addEventListener('click', () => { $('helpPanel').hidden = true; });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('helpPanel').hidden = true; });

  // ---- startup -----------------------------------------------------
  code.value = localStorage.getItem(STORAGE_KEY) ?? BLANK;
  refreshPorts();
  renderGutter();
  fetch('/api/status', { cache: 'no-store' }).then((r) => r.json()).then((s) => {
    if (!s.arduinoCli) say('A szerver nem találja az arduino-cli-t: a fordítás nem fog menni (lásd tools/firmware.js).', 'error');
  }).catch(() => say('Nem érem el a szervert (/api/status) — a fordításhoz "node tools/serve.js" kell.', 'error'));

  return { setCode };
}
