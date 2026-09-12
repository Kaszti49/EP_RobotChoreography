# koreografia/ — choreography compiler and simulator

Five differential-drive robots, no localisation, no communication. A show is a fixed list
of blind instructions per robot on a shared clock. This tool lets you author the show in
**world coordinates**, converts it to per-robot `SHOW_robot<N>.txt` sketches built on the
proven motion engine of `../SHOW_robot1.txt`, and — its real job — **models the
accumulating dead-reckoning error and refuses to emit a show that cannot physically work.**

Plain ES modules, no bundler, no npm dependencies. Node ≥ 18 for the tests and the CLI.

```
node --test                                  # the test suite (78 tests)
node tools/build.js data/example-show.json   # compile + validate, print the report
node tools/build.js data/example-show.json out/   # ... and emit out/SHOW_robot<N>.txt
node tools/serve.js                          # UI at http://localhost:8080/ui/ (+ /api/compile for the Kod tab)
node tools/make-template.js                  # regenerate the template after SHOW_robot1.txt changes
```

## Layout

```
core/         pure logic, no DOM, no I/O -- fully unit tested
  config.js      field, robot radius, ERROR MODEL (provisional), timing, compiler options
  pose.js        world pose math, heading normalisation, primitive kinematics, the ONE
                 place where world CCW-positive meets the robot's CW-positive porog_fok
  uncertainty.js the two-scalar error budget (r, sigma_theta)
  duration.js    estimated wall-clock time of a primitive
  compile.js     show JSON -> per-robot primitive sequences with poses and uncertainty
  timeline.js    where a robot is at time t inside a beat (validator + UI share it)
  validate.js    bounds, clearance, feasibility, drift, start-pose checks
  template.js    slicing a sketch into its numbered blocks
  emit.js        compiled show -> paste-ready Arduino .txt per robot
  parse.js       koreografia() body -> beats (for the round-trip test and imports)
ui/           one page, three tabs (app.js = shell + Koreografia; code-tab.js; dashboard.js):
                Koreografia  field canvas, timeline, validation panel, JSON editor, "-> Kod fulre"
                Kod          paste a sketch, Fordit (server-side arduino-cli), Feltolt (BT OTA), Segedlet
                Muszerfal    live sensor / PWM charts, value table, D-pad, calibration + setup buttons
transport/    Transport interface, manual (files), Web Serial link, OTA protocol -- see its README
firmware/     OUR OWN robot framework ("keret-ep") that the emitted show is compiled into
data/         robots.json (calibration; robot 1 filled, 2-5 null), example-show.json
templates/    show_template.txt = SHOW_robot1.txt with placeholders (generated, tested)
tools/        build.js (CLI), serve.js (static server + POST /api/compile), make-template.js,
              keret_stub.h (g++ stub), firmware.js (arduino-cli compile + USB upload)
test/         node --test
```

## Coordinate and sign conventions

- Origin at one corner of the field. **+X right, +Y away from the audience.**
- Heading `theta` in degrees, **0° = +X, counter-clockwise positive** (maths convention).
- A pose is `{ x, y, theta }` in mm and degrees.
- The robot's `porog_fok(fok)` is **positive = clockwise** (`SHOW_robot1.txt` block 5).
  The compiler therefore converts a heading change `Δθ` by normalising it to `(-180, 180]`
  and emitting `balra_fok(Δθ)` for `Δθ > 0`, `jobbra_fok(-Δθ)` for `Δθ < 0`. Exactly ±180°
  is normalised to +180° → `balra_fok(180)`, deterministically.
- `test/roundtrip.test.js` emits code, parses it back and re-runs it on an **independent**
  robot model written from block 5 (not from `pose.js`). It also proves that swapping
  `balra`/`jobbra` in the output would be detected. If you touch `pose.js`, `compile.js`
  or `emit.js`, that test is the one that must stay green.

## The error model — provisional

Two scalars per robot: position-error radius `r` (mm) and heading deviation `sigma_theta`
(deg). No Kalman filter, no covariance — the inputs are two hand-measured numbers.

Sources (robot 1, parquet, 2026-09-08, `DOKUMENTACIO_robot1.md` §6):

| constant | value | derived from |
|---|---|---|
| `k_drive` | 0.10 mm/mm | ±10 cm per metre driven |
| `k_turn` | 20/1080 deg/deg | ±20° after three full spins |
| `k_head_per_mm` | 0.003 deg/mm | **weakest**: "~0–6 cm lateral over 1 m" (`MERESI_MENET.md` table) ≈ 3.4°/m |
| `initial_r_mm`, `initial_sigma_deg` | 10 mm, 1° | **assumption**: hand placement on a floor mark |

Propagation (`core/uncertainty.js`), errors added linearly (pessimistic, not quadrature):

```
drive d:  r += k_drive·d;  r += d·tan(sigma_theta);  sigma_theta += k_head_per_mm·d
turn  a:  sigma_theta += k_turn·|a|
```

The `d·tan(sigma_theta)` term is why a long straight after several spins is dangerous, and
why the example show needs an anchor beat after ~1 m per robot.

**All constants live in `core/config.js` (`ERROR_MODEL`).** When `../T8_negyzet.txt` has been
run, replace them there — nothing else reads them. Per-robot error constants are not yet
supported (one set for the fleet); adding a per-robot override to `robots.json` would be a
small change in `compile.js` only.

## Show file format

```json
{
  "field": { "width_mm": 4000, "height_mm": 3000, "margin_mm": 250 },
  "robots": [ { "id": 1, "start": { "x": 500, "y": 400, "theta": 90 } } ],
  "beats": [
    { "name": "open", "duration_ms": 4000,
      "moves": {
        "1": { "type": "goto", "x": 1500, "y": 1200, "face": 90 },
        "2": { "type": "primitive", "op": "elore_cm", "value": 80 },
        "3": { "type": "hold" } } },
    { "name": "re-place", "duration_ms": 10000, "anchor": true, "moves": {} }
  ]
}
```

- `goto` → turn, drive, turn (`face` optional; omitted = no final turn). With
  `config.compiler.allow_reverse` (default **off**) the compiler may drive backwards when
  that saves rotation.
- `primitive` → one explicit call: `elore_cm`, `hatra_cm`, `balra_fok`, `jobbra_fok`
  (non-negative values), or the raw `porog_fok` (signed, + = clockwise), `balra_kor`,
  `jobbra_kor`.
- `hold` (or a robot missing from `moves`) → stand still.
- `"anchor": true` → a hold during which the crew re-places every robot on its planned
  mark; the error budget restarts from the placement error. This is what the drift warning
  suggests inserting.

## Validation (all in `core/validate.js`; every finding names beat and robot)

| check | severity | what |
|---|---|---|
| start | error | start poses inside the margin, not overlapping, mutually clear |
| bounds | error | `(x, y)` expanded by `r + robot_radius` inside the field inset by the margin, sampled 20× per primitive |
| clearance | error | pairwise centre distance > `r_i + r_j + 2·robot_radius + min_gap` (200 mm), sampled 40× per beat with each robot walking its own primitive schedule — mid-beat crossings are caught |
| feasibility | error | `Σ estimate × 1.5 ≤ duration_ms`; and no single primitive longer than the engine's 20 s `IDOKORLAT` |
| drift | warning | `r` crosses 300 mm; names the beat, suggests an anchor |

Errors block emission. Warnings do not.

## Emitting and uploading

`emit.js` takes `templates/show_template.txt` and substitutes `@@ROBOT@@`, the eight block-2
calibration constants from `data/robots.json`, and `@@KOREOGRAFIA@@`. **Blocks 3, 4, 5, 7
and 8 — the motion engine — are byte-for-byte copies of `SHOW_robot1.txt`**;
`test/emit.test.js` and `test/template.test.js` assert this, so the engine cannot drift.
If you believe the engine has a bug, report it; do not fix it in the template.

Robots whose `robots.json` calibration is `null` (2–5 today) are refused with an error that
says to run `MERESI_MENET.md`. Robot 1's numbers are never substituted for them.

The emitted file is checked with `g++ -fsyntax-only` against `tools/keret_stub.h` (a stub
of the framework API from the Robot1 bundle) when g++ is installed. **This is not the
Arduino toolchain.** The real compile is the **Kód tab**: *→ Kód fülre* on the Koreográfia
tab drops the active robot's emitted sketch into the editor, *Fordít* posts it to
`tools/serve.js`, which runs `arduino-cli` against our firmware (`build/kod/`, ~30–60 s),
and *Feltölt a robotra* sends the image over Bluetooth. Block 6 of the emitted file carries a
comment per line with the beat name and the intended pose, so it can be diffed against the
plan.

**Firmware and Bluetooth — our own stack.** The camp framework's source and compile server
are unavailable, so `firmware/robot/robot.ino` is our own re-implementation of its API on
the documented pinout, with a documented OTA protocol (`transport/README.md`). Flow:

```
node tools/firmware.js build keret      # bare framework (or: build 1 = framework + robot 1's show)
node tools/firmware.js upload keret COM5 # first time over USB
# afterwards everything is in the UI: header Csatlakozas (BT COM port), then
#   Kod tab:       paste / "-> Kod fulre" -> Fordit + Feltolt (Ctrl+Enter)
#   Muszerfal tab: Start (T) / Stop (S), telemetry charts (encoders also in mm), L = sensor calibration,
#                  N,AUTO, H (wheel balance), G,408,408 (one-revolution check)
```

Firmware v6 counts encoder pulses exactly like the camp framework (both edges of A → 408/rev), so
the measured `MM_PER_IMP` values carry over; robot 1's motor/encoder signs (`N,-1,1,-1,1`) are
the defaults. Requires `arduino-cli` and the `esp32:esp32` core (prerequisites in `tools/firmware.js`).
**As of 2026-09-12 the robots still run the CAMP framework** (they answer `R,10` with
`T,<millis>,s1..s5,encB,encJ,pwmB,pwmJ,poz,?,mV,?` lines). The Muszerfal charts work with that
too, but Start/L/H and — crucially — our Bluetooth OTA do not: the camp `F` handshake is
undocumented and never answered. Hence **USB-telepítés** in the Kod tab: Fordít, pick the USB
port, one click (`POST /api/upload` = `arduino-cli upload`). After that the robot speaks our
protocol and Fordít + Feltölt works over Bluetooth. The header pill shows which framework the
connected robot runs ("saját keret" / "TÁBORI keret"). Our `L`/`H` commands avoid the camp's
`K`/`W` (speed-PI) letters. T1/T7 must be re-measured once a robot is on our firmware.

## Assumptions (decisions taken where the brief was ambiguous)

1. **Robot radius 120 mm** — from "~20 cm long" and a 148 mm track; not measured.
2. **`k_head_per_mm = 0.003 deg/mm`** and **placement error 10 mm / 1°** — see the table above.
3. **Block 2 is templated, not verbatim.** The brief lists blocks 1–5 as verbatim but also
   asks for block 2 to be filled from `robots.json`; the latter wins. Block 1's `#define
   ROBOT` is templated for the same reason.
4. **Timing constants** (`230 mm/s`, `70 ms` brake, `200 ms` settle, `20 s` timeout) are
   read from block 3 of the template by a test, plus an **assumed 300 ms ramp overhead** per
   primitive and a 1.5 safety factor. Spin time uses the nominal 143 mm track for every robot.
5. **Primitive values are quantised** to 0.1 cm / 0.1° in the compiler, so the simulated
   pose and the emitted number are the same number. A goto therefore lands within 0.5 mm
   of its target; the next goto starts from the quantised pose, so nothing accumulates.
6. **A goto whose distance would quantise to zero does not turn towards the target** (a
   heading made of floating-point noise); it only performs the `face` turn.
7. **Robots absent from a beat's `moves` hold.**
8. **Within a beat, primitives run back to back from `lepes_kezd()`** and the robot then
   stands until `lepes_var()` expires; clearance sampling and playback both use this.
9. **Emitted sketches are ASCII only** (the bundle's `CLAUDE.md` rule); non-ASCII in beat
   names is transliterated or replaced with `?` in comments.
10. **One error model for the fleet**, until T8 produces per-robot numbers.
11. **The transport interface gained `WebSerialTransport` and `ota.js`** beyond the brief's
    "interface only", and `firmware/` was added, because the follow-up requests asked for
    Bluetooth upload and "our own" firmware. Untested on hardware.
12. **`tools/serve.js`** exists because ES modules and Web Serial both need an http origin.
13. **Rendering:** all draw requests are coalesced into one `requestAnimationFrame`, the
    timeline's static layer is cached in an offscreen canvas, and the canvas backing store
    is capped at 1.5× DPR.

## Definition of done — status

- [x] `node --test` passes (78 tests, including g++ syntax check when available, the OTA protocol and the UI parsers).
- [x] `node tools/firmware.js build 1` compiles our firmware + robot 1's show with arduino-cli.
- [x] Kod tab: paste -> Fordit -> errors listed with clickable line numbers; Fordit + Feltolt
      sends the image over BT OTA. Muszerfal tab: live charts from `R,10` telemetry.
      (2026-09-12: robot 1 flashed over USB from the Kod tab, then OTA verified over USB and over
      Bluetooth with firmware v4 -- see transport/README.md for the two buffering fixes that took.)
- [x] Loading `data/example-show.json` renders five robots through 10 beats.
- [x] Emitting produces `SHOW_robot1.txt`; blocks 3–8 verbatim (tested), g++ syntax-checked
      against the framework stub. **Not** compiled with the Arduino toolchain — that needs
      the web IDE.
- [x] Sending robots 2 and 3 to the same point yields
      `robots 2 and 3 come too close in beat 2 "iv" at t=1800 ms …` and blocks emission.
- [ ] Robots 2–5 measured (`MERESI_MENET.md`) → fill `data/robots.json`.
- [ ] `T8_negyzet.txt` run → replace `ERROR_MODEL` in `core/config.js`.
- [ ] Hall measured → set `field` in the show file.
