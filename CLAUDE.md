# CLAUDE.md — working notes for agents on this repo

Read this before editing anything. It records the constraints and conventions that are
**not** visible from the code, and the invariants that break silently if you miss them.

---

## 1. What this project is

An Enterpartner robotics-camp line-follower fleet (6 robots) repurposed into a
**synchronised choreography show with no line on the floor**.

The original camp material — `Segédlet.txt`, `Szakmai Segédlet.txt`, `Lábbekötési
táblázat.txt`, `motor.txt`, `szenzor.txt`, `Komplett vezérlés PD.txt`,
`PID + Szenzorfeldolgozás.txt`, and the three UI screenshots — is the **source of truth
for the hardware and the framework API**. It is unmodified and must stay that way; it
describes the world we build on, not the work we did.

Everything else in the repo is the choreography system.

## 2. Hard constraints (given by the user, non-negotiable)

- **No hardware may be added or removed.** No IMU, no radio beyond the built-in BT, no
  extra sensors. Anything the show needs must come from parts already on the robot.
- **The on-robot firmware ("keret 2.0") is fixed.** You only ever write two functions,
  pasted into a web IDE: `void indulas()` (once, on Start) and `void vezerles()`
  (every 20 ms). There is no `setup()`/`loop()`, no library imports, no multi-file build.
- **Each robot must be measured individually.** That is the whole point — the six robots
  differ mechanically and the show has no external feedback to hide it.
- **The wheels must be driven independently.**
- Code, comments and team-facing docs are **Hungarian**.

## 3. Framework API you may call (from `Segédlet.txt`)

```
motor(bal, jobb)        -255..255, negative = reverse, immediate
menj(impBal, impJobb, pwm)   BLOCKING - never call from vezerles()
varj(ms)                blocking wait that keeps the Stop button alive
uzenet(String)          log line to the Műszerfal
enkoderNullaz()         zero both encoder counters
szenzorOlvas()          refresh szenzor[] - the framework already calls this before vezerles()
szenzorNormal()         fill szenzorNorm[] from the calibration
vonalPozicioSzamol()    -2000..+2000, 9999 = no line
encBal, encJobb         long, encoder counts
szenzor[5], szenzorNorm[5], vonalLatszik, kalFeher[5], kalFekete[5], SENSOR_PIN[5]
kuszob, alapSebesseg, minimumPWM, maximumPWM, maxKorrekcio
utolsoPozicio, keresesiIrany, vonalvesztesSzamlalo
```

### RESERVED NAMES — redefining these will not compile

`KP` and `KD` are **already taken by the framework** (stated explicitly in
`Komplett vezérlés PD.txt`). That is why our gains are called `PD_KP`, `PD_KD`,
`PD_KSYNC`. Likewise do not redeclare any identifier in the list above.

### Encoder / motor sign

The right encoder's sign is handled by the framework, and `N,AUTO` on the Műszerfal
auto-detects encoder and motor direction into NVS. **Prefer `N,AUTO` over patching code.**
`ENC_ELOJEL` / `MOT_ELOJEL` in the tables exist only as a last-resort override.

## 4. The control architecture, and why it is what it is

Removing the line removes the only *external* feedback. The PD is therefore re-pointed at
the encoders. Per wheel, every 20 ms:

```
u = KFF·v_cél + PD_KP·hiba + PD_KD·d(hiba)/dt ± PD_KSYNC·(hibaBal − hibaJobb)
PWM = előjel · (HOLTSAV + |u|)
```

- `hiba` is **position** error (target impulse count − actual), not velocity error.
  Position error is already the integral of velocity error, so a plain PD removes
  steady-state drift by construction. **Do not add an I-term** — it only adds windup, and
  the camp's own `Szakmai Segédlet` §7.3 makes the same argument.
- `KFF` is feed-forward from the measured PWM→speed line. Without it the PD always lags,
  and each robot lags differently.
- `PD_KSYNC` is cross-coupling: if the left wheel lags, left gets **more** and right gets
  **less**. Sign matters — `szinkron = hibaBal − hibaJobb`, added to `uBal`, subtracted
  from `uJobb`. Getting this backwards makes the robot diverge instead of converge.
- The following-error clamp (`HIBA_HATAR`, and clamping `celBal`/`celJobb` with it) is the
  position-loop equivalent of anti-windup. Keep both halves — clamping only the error and
  not the target lets the target run away.
- `GYORSULAS_MM_S2` is not a comfort setting. On marble/parquet a slipped wheel loses
  distance the encoder never sees, and **no controller can recover it**. This is the one
  failure mode PD cannot fix.

## 5. Sign and coordinate conventions — easy to get wrong, used in three places

| quantity | convention |
|---|---|
| `omega_fok_s` | **positive = right / clockwise** (matches the camp's `bal = alap+u` idiom) |
| heading `szog` | 0 = facing **+Y**, increasing clockwise |
| wheel speeds | `vBal = v + ωrad·b/2`, `vJobb = v − ωrad·b/2` |
| odometry | `szog += (dBalMm − dJobbMm)/NYOMTAV`; `x += d·sin(szog)`; `y += d·cos(szog)` |
| canvas | `ctx.rotate(+szog)` is clockwise on screen; nose drawn at `(0, −R)` |

## 6. THE INVARIANT: firmware and simulator must stay identical

The simulator's value is that it computes what the robot computes. Three things are
duplicated on purpose and must be changed **together**:

| concept | firmware | simulator |
|---|---|---|
| `Lepes` struct `{ido_ms, v_mm_s, omega_fok_s}` | `show/show_robot.txt` §4 | `szimulator/show_szimulator.html`, `demoAllapot()` + `exportKod()` |
| slew limiter + kinematics + VMAX scaling | `show_robot.txt` §10.2–10.3 | `szimulal()` |
| 20 ms tick | `DT` implied by the framework | `var DT = 0.02` |

`kalibracio/K4_ellenorzes.txt` **deliberately duplicates the entire control core** of
`show_robot.txt`. This is not an oversight — each file is pasted whole into a web IDE and
there is no `#include`. If you change the controller, change it in both, or K4 stops
validating the thing that actually ships.

## 7. The calibration chain — which sketch fills which constant

| sketch | measures | fills |
|---|---|---|
| `K0_elojel_holtsav.txt` | sign check; lowest PWM that moves each wheel each way | `HOLTSAV`, `ENC_ELOJEL`, `MOT_ELOJEL` |
| `K1_ut_per_impulzus.txt` | robot **pushed** 2 m along a straight edge, motors off | `MM_PER_IMP[bal][jobb]` |
| `K2_nyomtav.txt` | 5 in-place rotations, leftover angle read off a floor mark | `NYOMTAV_MM` |
| `K3_pwm_sebesseg.txt` | PWM 60…240 sweep, least-squares fit **in-sketch** | `KFF`, `VMAX_IMPS` |
| `K4_ellenorzes.txt` | final controller on 2 m straight + UMBmark squares | `PD_KP`, `PD_KD`, `PD_KSYNC` |

K1 is a **push** test on purpose: motors off means no torque slip, so it measures pure
wheel geometry. Both wheels cover the same ground distance `D` when the robot travels
straight, so one run gives `D/encBal` and `D/encJobb` — and their ratio is exactly the
asymmetry that makes an uncorrected robot curve.

UMBmark reading: CW and CCW errors pointing the **same** way ⇒ `MM_PER_IMP` ratio wrong;
pointing **opposite** ways ⇒ `NYOMTAV_MM` wrong.

## 8. Editing conventions

- **`.txt` sketches: ASCII only.** No accented Hungarian in code or in `uzenet()` strings.
  This matches the precedent set by `Komplett vezérlés PD.txt` and avoids encoding
  surprises in the serial/BT log. `.md` files use full accented Hungarian.
- Keep the numbered `// ============ N. SECTION ============` banners in the sketches;
  the docs and the README refer to blocks by number ("paste into block 8").
- `uint16_t ido_ms` caps a single step at 65535 ms.
- Do not reorder the `#define ROBOT` line out of block 1 — it is advertised everywhere as
  the single per-robot edit.

## 9. How to verify changes without a robot

Both checks were run when this was built and both passed.

```bash
# 1. syntax-check every sketch against a stub of the framework API
bash eszkozok/ellenoriz.sh

# 2. re-simulate a choreography independently (collisions, bounds, speed, drift)
#    see eszkozok/ellenoriz.sh header for the Python snippet used
```

`eszkozok/keret_stub.h` + `eszkozok/stub_impl.cpp` stand in for the on-robot framework.
They exist **only** for `g++ -fsyntax-only`; they are not a simulator and must never be
uploaded to a robot.

Note: `file://` URLs cannot be opened by the browser tooling in this environment, so the
simulator cannot be previewed locally — publish and look at the live artifact instead.

## 10. The published simulator

<https://claude.ai/code/artifact/b7285a7e-1554-467c-bbf9-e2ee4da8a8f6>

- Republishing **the same file path in the same conversation** keeps this URL.
- From any other conversation you must pass that URL as `url`, and read it first.
- It declares the `db` capability and stores the choreography at `show/koreografia`
  as `{json, mikor}`. `localStorage` (`rajkoreografia-v1`) is the fallback when `db`
  resolves `null`. The page must keep working with neither.

## 11. Open items — do not present these as done

- **Arena size is unknown.** The user guessed "big hard smooth floor, marble or wood".
  The simulator field is a parameter (default 4000 × 5000 mm) precisely because of this.
- **No robot has been measured yet.** Every number in the `show_robot.txt` tables is
  nominal (`0.34040`, `153.0`, `60`, `0.20000`, `600`), and the `PD_KP`/`PD_KD`/`PD_KSYNC`
  values are starting points for the K4 tuning procedure, not measured results.
- The demo choreography ("V-nyitás") was verified geometrically only: 400 mm minimum
  separation, in bounds, 78 % of VMAX, 45 mm endpoint error at 1 % injected drift.
- The start trigger threshold `TRIGGER_KUSZOB = 1200` is an estimate; it has not been
  checked against a real room's lighting.

## 12. File map

```
Segédlet.txt, Szakmai Segédlet.txt, Lábbekötési táblázat.txt,
motor.txt, szenzor.txt, Komplett vezérlés PD.txt,
PID + Szenzorfeldolgozás.txt, *.png          original camp material — DO NOT EDIT
README.md                                     human front door (Hungarian)
README_show.md                                engineering deep-dive (Hungarian)
CLAUDE.md                                     this file
kalibracio/K0…K4*.txt                         paste-in measurement programs
kalibracio/robot_adatok.md                    printable data sheet
show/show_robot.txt                           THE final firmware
szimulator/show_szimulator.html               choreography editor + simulator
eszkozok/                                     desktop-only verification helpers
```
