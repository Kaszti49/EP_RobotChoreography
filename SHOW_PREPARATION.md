# SHOW_PREPARATION — placing the robots for "Keringő"

Companion to [`FINAL_SHOW.md`](FINAL_SHOW.md) (the sketches) and `koreografia/data/keringo-show.json` (the plan).
Everything below is derived from the plan; if the show JSON changes, re-check the numbers here.

## 1. The floor

- **4.6 m wide × 3.0 m deep**, the same floor the 1 m / 3-spin tests were run on. Nothing inside the outer **25 cm** band
  is ever used, so a 4.1 × 2.5 m clear area is the true requirement.
- **Audience along the front edge.** All coordinates are *(x, y)* in **mm from the front-left corner** as seen from the
  audience: *x* runs to the right (0 → 4600), *y* runs away from the audience (0 → 3000).
- Headings: **90° = nose pointing away from the audience** (the start pose), **270° = nose toward the audience**,
  0° = nose to the right, 180° = nose to the left.
- **The robot's reference point is the midpoint of the wheel axle** (the point it spins about), not the nose or the
  body centre. Every mark below is for that point. Mark it on each chassis with a strip of tape across the top if it
  is not obvious.

```
                       back wall  (y = 3000)
   +------------------------------------------------------------+
   |                                                            |
   |          D (1600,2300)                  C (3000,2300)      |     square for act 2
   |                                                            |
   |                         M (2300,1600)                      |     centre, robot 3
   |                                                            |
   |          A (1600, 900)                  B (3000, 900)      |
   |                                                            |
   |    [1]        [2]        [3]        [4]        [5]         |     start line, y = 600
   |   x=900     x=1650     x=2300     x=2950     x=3700        |
   +------------------------------------------------------------+
   x=0                     AUDIENCE                        x=4600
```

## 2. Start marks (this is what you tape down)

Tape a straight line at **y = 600 mm** (60 cm from the front edge), then a cross tick at each *x*:

| robot | x (from left edge) | y (from front edge) | nose points | gap to the next robot |
|---|---|---|---|---|
| 1 | **900 mm** | 600 mm | away from audience (90°) | 750 mm centre-to-centre to robot 2 (≈ 59 cm between bodies) |
| 2 | **1650 mm** | 600 mm | away from audience | 650 mm to robot 3 (≈ 49 cm between bodies) |
| 3 | **2300 mm** (floor centre line) | 600 mm | away from audience | 650 mm to robot 4 (≈ 49 cm between bodies) |
| 4 | **2950 mm** | 600 mm | away from audience | 750 mm to robot 5 (≈ 59 cm between bodies) |
| 5 | **3700 mm** | 600 mm | away from audience | — |

The line is symmetric about x = 2300; robots 1 and 5 are 100 mm further out than an even spacing because they cut long
diagonals to the back corners in beat 2 and must not brush robots 2 and 4 on the way.

Placement tolerance: **±10 mm on the mark, ±2° on the heading** — that is what the error budget assumes
(`initial_r_mm: 10`, `initial_sigma_deg: 1` in `core/config.js`, so 1° is the model's number; 2° is what a human
can reliably do). A heading error of 2° puts the robot 5 cm sideways after a 1.4 m leg, which is still inside every
clearance in the plan. Sight the heading along the tape line: both wheels the same distance from it.

**The show ends on these same marks, same heading.** If every robot is back on its tick at the end, the run was good
and the next run needs no re-placing.

## 3. Other marks worth taping (for rehearsal and for the 1 s breaks)

You do not have to tape these, but they let you see at a glance whether a robot is where the plan says, and they are
where a robot would have to be nudged during a break if it is badly off.

| mark | (x, y) | who is there, when |
|---|---|---|
| A | (1600, 900) | front-left corner of the square: 2 after beat 2; 1 after beat 8; 5 after beat 10 |
| B | (3000, 900) | front-right corner: 4 after beat 2; 2 after beat 8; 1 after beat 10 |
| C | (3000, 2300) | back-right corner: 5 after beat 2; 4 after beat 8; 2 after beat 10 |
| D | (1600, 2300) | back-left corner: 1 after beat 2; 5 after beat 8; 4 after beat 10 |
| M | (2300, 1600) | centre: robot 3 from beat 2 to beat 15 |
| column | x = 2300, y = 916 / 1258 / 1600 / 1942 / 2284 | the final line-up (beat 15): 5, 1, 3, 4, 2 front to back, all facing the audience; **342 mm centre-to-centre = 10 cm between the 24 cm bodies** (nose-to-tail it is ~14 cm, the bodies are 20 cm long) |
| column, one step | x = 2300, y = 616 / 958 / 1300 / 1642 / 1984 | after beat 16; the closing spins happen here |

Full per-beat positions: the beat table in `FINAL_SHOW.md`.

### The breaks

`szünet 1–5` are **1 second** each. That is not enough to re-place anything — treat them as beats, not as pauses. The
plan flags them as anchors only so the (pessimistic) validator passes; the real safety margin is that robots 1–4 land
on their encoder targets on this floor. Positions at each break, for a rehearsal check:

| break | after beat | robot 1 | robot 2 | robot 3 | robot 4 | robot 5 |
|---|---|---|---|---|---|---|
| szünet 1 | 6 (mind pörög) | D, nose front | A, nose right | M, nose back | B, nose back | C, nose left |
| szünet 2 | 8 (keringő 1) | A, nose right | B, nose back | M | C, nose left | D, nose front |
| szünet 3 | 10 (keringő 2) | B, nose back | C, nose left | M | D, nose front | A, nose right |
| szünet 4 | 17 (záró pörgés) | column y 958 | column y 1984 | column y 1300 | column y 1642 | column y 616 — all nose to audience |
| szünet 5 | 19 (hazatérés 1) | (900, 958) | (1650, 1984) | (2300, 1300) | (2950, 1642) | (3700, 616) — all nose to audience |

("nose right" = 0°, "nose back" = 90°, "nose left" = 180°, "nose front" = 270°.)

If a robot is visibly off at a break in rehearsal, do not touch it mid-run — note which beat drifted, stop after the
run and fix the calibration (`NYOMTAV_MM` for spins, `MM_PER_IMP` for distance, `BAL_TRIM` for sideways drift; the
recipe is in `HANDOFF.md`).

## 4. Clearances the plan relies on

- Closest planned approach anywhere in the show: **342 mm centre-to-centre** (the column, beats 15–19: from the
  line-up until the four slide out of it).
- Everywhere else robots stay ≥ 625 mm apart (checked on the compiled timeline, 200 samples per beat); in the orbit
  the four followers are 1.4 m apart and pass 0.7 m from robot 3.
- The validator was run with `MIN_GAP_MM = 100` and `CLEARANCE_DRIFT_FACTOR = 0` (`core/config.js`): it checks the
  *planned* bodies with a 10 cm gap and does **not** add the drift model on top. So a robot that drifts more than
  ~5 cm by the line-up can touch its neighbour. Watch the column in rehearsal before trusting it in front of people.

## 5. Pre-show checklist

1. **Batteries ≥ 9.3 V on every robot** (Műszerfal shows mV). Robot 1 dropped 10.5 → 9.6 V over ~8 runs; a robot at
   8.2 V could not even run `N,AUTO`. One full show is 156 s of motion — budget one charge per 3–4 runs.
2. **Each robot has its own sketch** from `FINAL_SHOW.md`: Koreográfia tab → load `keringo-show.json` → pick the
   robot in the header → **→ Kód fülre** → **Fordít + Feltölt**. Robot *N* must get sketch *N* — the show is
   different per robot.
   - All five robots are calibrated as of 2026-09-21 (robot 5 = the replacement chassis, `RobotBaseStats/SHOW_robot5.md`).
     **The test sketch is not the show sketch**: a robot that last ran `teszt-1m-3kor` still needs its show sketch
     flashed. If a robot is out, run with the rest and leave its start mark empty — nothing in the plan depends on
     any single robot.
3. Every robot connected over Bluetooth (header pills show *saját keret* and the robot name). A reload
   auto-connects named robots.
4. Place the robots on the start ticks, noses away from the audience, ±1 cm / ±2°.
5. Clear the floor of everything else: the followers use the full 1600–3000 × 900–2300 square plus the diagonals from
   the start line.
6. Műszerfal → **▶ Start mind**. All five `T`s go out within ~30 ms and the beat clock keeps them together; a slower
   robot re-aligns at every beat boundary.
7. **■ STOP** stops everyone at any moment. After a stop the robots are *not* on any mark — re-place on the start ticks.
8. At the end, check that all five are back on their start ticks facing away from the audience. If they are, run it again.
