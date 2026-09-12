# Handoff — 2026-09-12

## Where things stand

- **Branch:** `koreografia-app` (this one). Clean: only the app and the files it references. The older
  `koreografia` branch (local) keeps the full history; remote `main` is untouched.
- **Run:** `cd koreografia && node tools/serve.js` → http://localhost:8080/ui/ in Chrome/Edge.
  `npm test` → 79 tests.
- **Robot 1** runs our firmware **v5** (`keret-ep v5`), signs `N,-1,1,-1,1` saved in its NVS.
  **Firmware v6 is built but not yet flashed** — see "First thing next time".
- **Robots 2–5** still run the camp framework. Each needs one **USB-telepítés** (Kód tab), then Bluetooth only.
  The CP210x driver is installed on this PC now.

## First thing next time

1. Power the robot, open the app — it auto-connects to the last Bluetooth port (else *Csatlakozás*, COM4).
2. Kód tab → Példa *helykitöltő show.ino* (or *→ Kód fülre* from the Koreográfia tab) → **Fordít + Feltölt**.
   The log must show `P,keret-ep v6 (408 imp/ford)` after the automatic reconnect.
3. Műszerfal → **3. Egy kerékfordulat (408 imp)**: the wheel must turn exactly once.
4. Rerun the office test (1 m forward, 1 m back, 3 turns left, 3 right). Distances/turns should now be right;
   direction and sync were already fixed today.

## What each piece is

| Piece | What | Notes |
|---|---|---|
| Koreográfia tab | show JSON → compile → validate → field/timeline sim; emits `SHOW_robot<N>.txt` | `→ Kód fülre` drops the emitted sketch into the editor |
| Kód tab | editor → **Fordít** (server runs arduino-cli, 30–60 s) → **Feltölt** (Bluetooth OTA) | **USB-telepítés** for robots still on the camp firmware; **Segédlet** = the camp's help text |
| Műszerfal | live sensor/PWM charts, table (encoders in imp *and mm*), D-pad, Start/Stop | **L** = 3 s sensor calibration, **N,AUTO** = sign detection, **H** = wheel balance, **G,408,408** = one revolution |
| `firmware/robot/robot.ino` | our framework ("keret-ep"), same API as the camp's | v6: encoder ×2 counting (408 imp/rev), OTA buffering fixes, robot-1 signs as defaults |
| `tools/serve.js` | static server + `/api/compile`, `/api/ports`, `/api/upload`, `/sources/` | |
| `transport/` | Web Serial link (auto-reconnect, auto-connect on load), OTA protocol | details + verification numbers in `transport/README.md` |
| `data/robots.json` | per-robot calibration (robot 1 measured; 2–5 `null`) | filled from `MERESI_MENET.md` runs |

## What was learned the hard way today

- The robots were on the **camp firmware** (it streams `T,…` telemetry); its OTA handshake is undocumented, so
  the first flash of our firmware must be USB.
- Bluetooth OTA needed two firmware fixes: BluetoothSerial's 512-byte RX queue drops silently (→ own 16 KB ring),
  and `Update` flushes a sector only on the *next* byte, so the flash erase overlapped incoming data (→ collect a
  full 4 KB window, write, then ACK). Verified: BT 18 s, USB 101 s.
- Left motor and both encoders are inverted relative to the pin table on robot 1 (`N,-1,1,-1,1`).
- The camp counts **both edges** of encoder A (408 imp/rev); v1–v5 counted one → everything drove 2× too far.
- A robot reboot always drops the BT link; the app now reconnects by itself.

## Still open

- Flash v6 and re-verify distances (above).
- Robots 2–5: USB-telepítés, `N,AUTO`, then `MERESI_MENET.md` on our firmware → `data/robots.json`.
- T8 (square test) not run → `core/config.js ERROR_MODEL` still provisional.
- The example show needs an anchor beat (re-placement by hand) — error budget on 4×3 m is ~1 m per robot.
