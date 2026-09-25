# Handoff — 2026-09-20

## Where things stand

- **Branch:** `koreografia-app`. `cd koreografia && node tools/serve.js` → http://localhost:8080/ui/ (Chrome/Edge).
  `npm test` → 79 tests.
- **Two robots run a synchronised show.** Robots 1 and 2 ran `data/szinkron-teszt.json` (1 m forward, 1 spin left,
  1 spin right, 1 m back, 1.7 m apart) started by **▶ Start mind**: both `T`s landed within 30 ms, every beat started
  together, every move ended on its encoder target. The exact sketches are in `RobotBaseStats/SZINKRON_robot1.md` / `_robot2.md`;
  the tuning-test sketches (1 m out/back + 3 spins each way) in `RobotBaseStats/SHOW_robot1.md` / `_robot2.md`.
- **Robot 1** (`TaborRobot-1`): firmware **keret-ep v7**, signs `N,-1,1,-1,1,0`, track 148.3, PWM_MIN 35, speed line 0.145/9.30.
  Floor: 1 m within millimetres, 3 spins within a few degrees.
- **Robot 2** (`TaborRobot-2`): firmware **v7**, **cross-wired** (PWM leads + encoder plugs) → wiring flag saved in its NVS
  `N,-1,1,-1,1,1`. Weaker motors (deadband 45–50, right wheel ~20 % faster), slips ~6 % in spins → track 157.0, PWM_MIN 50,
  speed line 0.155/38.00. Floor: 1 m straight and right; 3 spins within ~10° (left/right asymmetric — check its right tyre).
- **Robot 3** (`TaborRobot-3`, 2026-09-14, from a Mac): firmware **v7**, signs `N,-1,1,-1,1,0`, track 152.5, PWM_MIN 45,
  speed line copied from robot 1. Sketch in `RobotBaseStats/SHOW_robot3.md`. (That session committed only the sketch;
  its `robots.json` entry and the test-show slot were reconstructed from the sketch on 2026-09-20 — the emitter now
  reproduces the committed sketch byte for byte apart from the pose comments.)
- **Robot 4** (`TaborRobot-4`, 2026-09-20): firmware **v7**, signs `N,-1,1,-1,1,0`, track 151.1, PWM_MIN 45, BAL_TRIM 1.004,
  speed line copied from robot 1 (a PWM 50/60 sweep matched it). Arrived with its **right encoder GND unplugged**
  (`N,AUTO`: "az enkoder nem szamol (bal -785, jobb 0)") — reseated, then everything was textbook. Floor: 1 m forward/back
  on the mark, 3 spins both ways on the mark; every move on its encoder target (`RobotBaseStats/SHOW_robot4.md`).
- **Robot 5** (`TaborRobot-5`, 2026-09-20, **not calibrated — encoder wiring**): flashed keret-ep **v7** over USB (it
  arrived already on v7 under robot 4's name, 10.6 V pack), renamed `B,5`, **not yet paired** in Windows. `N,AUTO` failed:
  left encoder 0 pulses (right 1121). Hand- and motor-driven tests showed the LEFT encoder was wired **VCC → D26**
  (a GPIO, so no supply; C2 also on D26) and the RIGHT encoder's VCC on **RX0**. After several rewiring attempts
  neither encoder counted reliably (the pin the user took for 3V3 gave nothing; the right encoder's signals ended up on
  D25/D26). Stopped there. **Next time: wire both encoders from scratch per `Sources/Lábbekötési táblázat.txt`** —
  left C1/C2 → GPIO25/26, right C1/C2 → GPIO27/14, both VCC → the **3V3 corner pin next to EN** (same edge as D25…D14;
  the sensor bar should hang on it too), GND → GND — then `M,0,90` / `M,90,0` and read `D` (no hand-turning needed),
  then `N,AUTO` and the robot 4 flow. `robots.json` keeps it `null`.

## The motion engine is now the site's (template "SHOW v6")

`koreografia/templates/show_template.txt` **is** the engine; the old `SHOW_robot1.txt` (v5) moved to
`RobotBaseStats/SHOW_robot1.md` as the baseline the tests pin blocks 5 and 8 (the API) against. What v6 does, all measured
with 50 Hz telemetry on robot 1 (see `koreografia/README.md` "What v6 fixes"):

- a move ends on the **sum** of both wheels' pulses (distance for a straight, angle for a spin) — v5 waited for each wheel,
  and in a spin the free wheel got dragged +900 imp (+120°);
- **load compensation**: common PWM offset ±1 per 10 ms until the wheels run at the commanded speed (a spin needs ~90–120
  PWM on the loaded backward wheel);
- **soft start** 300 ms (robot 2 broke traction on a hard start), **slow zone** (last 100 mm at 150 mm/s), drive cuts 50 imp
  early, **speed-proportional brake ending in TB6612 short-brake** (`motor(±1)`), residual > 16 imp crept back;
- the speed line (T7) barely matters any more — only `MM_PER_IMP`, `NYOMTAV_MM` and `BAL_TRIM` need the floor test.

Per-robot numbers live in `koreografia/data/robots.json`; `core/config.js TIMING` mirrors block 3 (tests check).

## Bringing up a new robot (what worked for robots 2–4, ~20 min)

Everything below can also be done from a shell, no browser: `node tools/firmware.js build keret` → `upload keret COM5`
(USB), then line commands over the COM port with pyserial (`B,4`, `N,AUTO`, `G,408,408,120`, an `M,p,p` sweep for
PWM_MIN), `build 4 data/teszt-1m-3kor.json` → `upload 4 COM5` (or Bluetooth OTA: the `F` protocol in `transport/ota.js`
is ~40 lines of Python), `S`/`Z`/`T` and read the `megy …`/`porog …` lines. Two gotchas: the camp framework streams 50 Hz
`T,…` telemetry as soon as the port opens, and over Bluetooth the engine's messages are only sent while the SPP client is
connected — closing the COM port between commands loses them, so keep one session open for a whole run.

1. Kód tab → Példa *helykitöltő show.ino* → Fordít → **USB-telepítés**. Send `B,<n>` (raw command box) → robot reboots as
   `TaborRobot-<n>` → pair it in Windows → header Robot n → Csatlakozás. (Names matter: auto-connect files each robot by its name.)
2. Műszerfal → **1. Enkóder-irány felismerése** (`N,AUTO`). If it says *"egy motor egyedul nem forog -- PWM-vezetekek keresztben?"*
   the robot is cross-wired like robot 2: send the `N,…,1` line it prints, then `N,AUTO` again.
3. Add the robot to `robots.json` (copy robot 1's `MM_PER_IMP`, `NYOMTAV 148.3`, `BAL_TRIM 1.000`; PWM_MIN from where it starts
   moving on the D-pad; the speed line can be fitted from a `M,p,p` sweep over telemetry — or just copied, the engine compensates).
4. Koreográfia → **Teszt betöltése** → that robot → **→ Kód fülre** → **Fordít + Feltölt** → Műszerfal **Start**. Tune in this order:
   distance → `MM_PER_IMP` × (100 / measured cm); sideways drift → `BAL_TRIM`; spin short/long by X° → `NYOMTAV × 1080/(1080∓X)`.

## Running several robots

Connect them all (a reload auto-connects every named robot). Load the show, flash each robot its own sketch (pick it in the
header before *→ Kód fülre*), place them, **▶ Start mind** (wakes the Bluetooth links with a no-op, then one `T` to all).
**■ STOP** stops everyone. The show is a shared beat clock (`lepes_var` waits out each slot), so a slower robot re-aligns at
every beat boundary.

## What was learned the hard way today

- The provisional PWM→speed line was fitted on v5's half-count encoders: the robot was doing 420 mm/s, not 230.
- `motor(0,0)` on the TB6612 is standby = free coasting; a fixed reverse pulse locks the wheel and the chassis skids on it.
  PWM 1 with a direction set is 99.6 % short-brake — that is the brake.
- In a spin the backward wheel is heavily loaded and the forward one free; a per-wheel termination cannot work.
- Robot 2: one motor alone did not turn at all → PWM leads and encoder plugs crossed. Fixed in firmware (v7 `csere` flag)
  rather than by rewiring; `N,AUTO` now detects the symptom and restores its previous signs on failure.
- A Windows Bluetooth COM port does not always report the robot's reboot; OTA now drops the link and reconnects itself.
- An idle Bluetooth link delivers its first packet ~0.5 s late; *Start mind* wakes the links before sending `T`.
- The user's own browser tab holding a COM port blocks any other tab from opening it ("The port is already open").
- Batteries: robot 1 dropped 10.5 → 9.6 V over ~8 test runs; robot 2 arrived at 8.2 V and could not even do `N,AUTO`.

## Still open

- Fine-tune robot 1/2 numbers (user: "minor tweaking"); robot 2's spin asymmetry is mechanical (right tyre / wheel seating).
- Robot 5: fix the encoder wiring (see above), then the bring-up.
- `teszt-1m-3kor.json` now holds robots 1–4 at 1.05 m spacing on a 4.6 m field (the pessimistic error model needs
  1035 mm between robots after 2 m of driving); a four-robot **▶ Start mind** run has not been tried yet.
- `core/config.js ERROR_MODEL` is still the pessimistic provisional one (±10 cm/m, ±20°/3 spins) — today's runs were far
  better; recalibrate it (T8 or from the floor tests), then robots can stand closer than 1.7 m in the validator.
- Untracked, deliberately not committed: `Robot1.bundle` (git bundle), `CLAUDE_CODE_PROMPT.md`, `Tests/desktop.ini`.

## Idea (2026-09-22, not started): measure the robots' real positions from a phone video

Why: every spin leaves 1–3° that nobody can see; by the last long leg the heading error is 10°+ and all five land off.
Dead reckoning has no outside reference, and tuning one number per run by eye is slow. ESP32-to-ESP32 networking does
not help (nobody knows where it is).

How: a phone on a tripod, fixed, as high/central as possible; four tape crosses on the floor at known (x, y) for a
pixel→mm homography (no need for a true overhead view); two coloured paper discs per robot (one colour per robot,
front + back → position and heading). A Python + OpenCV script (~150 lines) tracks the discs per frame and writes a CSV
per robot of (t, x, y, heading) and a per-beat comparison against `keringo-show.json` — the `tools/trace.js` table,
but measured instead of encoder-reckoned. One clean recording gives the true error of every spin on every robot.
Python is not installed on this PC (`winget install Python.Python.3.12`, `pip install opencv-python numpy`).
Later step on top of the same script: live corrections over the existing Bluetooth links.
