# transport/ — getting code and commands to the robots

| file | status |
|---|---|
| `transport.js` | the abstract interface: `connect / send / broadcast / disconnect` |
| `manual.js` | files on disk (node) or browser downloads; a human pastes them into an editor |
| `webserial.js` | text-line link over the Web Serial API (Chrome/Edge, `http://localhost` or https) — USB COM port or a paired Bluetooth-SPP COM port. Adds `drive()`, `nextLine()`, `writeRaw()`, `uploadFirmware()`. **Not yet tried on hardware.** |
| `ota.js` | host side of **our** firmware-update protocol (pure, unit-tested against a simulated robot) |

## Our own firmware — `firmware/robot/`

The camp framework ("keret 2.0") source and its compile server are not available, so
`firmware/robot/robot.ino` re-implements the API the sketches use (`motor`, `varj`,
`uzenet`, `enkoderNullaz`, `menj`, `encBal/encJobb`, `szenzor*`) from the pinout in
`Sources/Lábbekötési táblázat.txt`, plus the Műszerfal line commands and a documented
OTA protocol. The emitted `SHOW_robot<N>.txt` is compiled *into* it as `show.ino`.

```
node tools/firmware.js check            # arduino-cli + ESP32 core present?
node tools/firmware.js build 1          # emit show for robot 1, compile -> build/robot1/robot1.ino.bin
node tools/firmware.js ports            # find the USB COM port
node tools/firmware.js upload 1 COM5    # first time: USB (esptool)
```

After the first USB flash, later builds go over Bluetooth from the UI: connect the robot's
COM port (*Csatlakozas*), choose the `.bin`, *Feltoltes*. Then `T` starts the show, `S` stops.

### Commands (USB serial and Bluetooth SPP, one line each)

| cmd | effect |
|---|---|
| `T` | start: `indulas()` once, then `vezerles()` every 20 ms, in its own FreeRTOS task |
| `S` / `A` | stop: task deleted, motors off |
| `M,<bal>,<jobb>` | manual motors −255..255; refused while a task runs; auto-stop 1.5 s after the last `M` |
| `G,<iB>,<iJ>[,pwm]` | `menj()` by encoder counts |
| `Z` | zero encoders |
| `P` / `V` / `D` | info line / battery mV / diagnostics |
| `R,<hz>` | telemetry, one line per tick: `E,<encBal>,<encJobb>,<mV>,<FUT|ALL>,<s1>,<s2>,<s3>,<s4>,<s5>,<pwmBal>,<pwmJobb>,<vonalpoz>` (vonalpoz −2000..2000, 9999 = no line). The Muszerfal tab turns this on (`R,10`) for the active robot while it is open and off (`R,0`) when it is left |
| `L` / `L,?` | sensor calibration: samples for 3 s while you push the robot across the line, white = max, black = min, saved in NVS; replies `L,OK,<f1/../f5>,<b1/../b5>` (`L,ERR,...` if a sensor saw no contrast). `L,?` only reports. (`L`/`H`, not `K`/`W`: those mean speed-PI in the camp framework) |
| `H` | wheel measurement: both motors 120 PWM for 1 s, replies `H,<encBal>,<encJobb>,<jobb/bal ratio>` |
| `N` / `N,AUTO` / `N,encL,encR,motL,motR` | encoder/motor signs, saved in NVS. `N,AUTO` also detects crossed motor/encoder cables |
| `B,<n>` / `B,<name>` | Bluetooth name `TaborRobot-<n>` / `Tabor-<name>`, then reboot (re-pair in Windows) |
| `F,<size>[,<md5>]` | firmware update — protocol below |

### OTA protocol (ours; `ota.js` ⇄ `otaFogad()` in `robot.ino`)

**Verified on robot 1, 2026-09-12:** 1.1 MB image over USB in 101 s (10.7 kB/s at 115200) and over
Bluetooth SPP in 18 s (60 kB/s), both `F,OK`. Two firmware-side buffering rules make it work
(firmware v4):
- `BluetoothSerial`'s RX queue is a fixed 512 bytes and *silently drops* overflow; during OTA the
  BT stack writes straight into our own 16 KB ring buffer (`BT.onData`). USB gets an 8 KB UART buffer.
- `Update` flushes a full 4 KB sector only when the *next* byte arrives, and the flash erase blocks
  the UART ISR long enough to overflow the 128-byte FIFO. So the robot collects a whole 4 KB window
  in RAM, hands it to `Update` in one call, and only then ACKs — every flash operation happens
  while the host is waiting. Keep the host window at 4096 (= `OTA_DEFAULTS.window`).
A robot reboot (OTA, USB flash, power) drops the BT link; `webserial.js` notices the dead port,
reports it (`onDisconnect`) and reopens the same granted port by itself (20 tries, ~40 s;
`onReconnect`). On page load the app probes the ports granted earlier with `P` (Bluetooth first)
and keeps the one that answers, so a reload needs no picker either.

**Encoder counting = the camp's: both edges of channel A (`CHANGE`), 408 imp/rev = 138.9 mm**
(firmware v6). v1–v5 counted rising edges only — half the pulses — so every `SHOW_robot*.txt`
distance came out doubled. The calibration in `robots.json` / block 2 of the show therefore
transfers unchanged; the Műszerfal shows the counts converted to mm with it, and
"3. Egy kerékfordulat" (`G,408,408,120`) is the one-click check that the wheel turns exactly once.

**Signs (robot 1, measured with `N,AUTO` 2026-09-12): `N,-1,1,-1,1`** — the left motor and BOTH
encoders are inverted relative to the pin table. With the original defaults (`1,-1,1,1`) forward
became a left spin and the sync loop ran away. The firmware defaults are now these values; the
NVS copy (set from the Műszerfal "Robot beállítása") wins and survives OTA.


```
host:   F,<size>,<md5hex>\n
robot:  F,READY\n                          or  F,ERR,<reason>\n
host:   raw bytes, at most 4096 ahead of the last ACK
robot:  F,ACK,<received>\n                 every 4096 bytes and at the end
robot:  F,OK\n  then reboot                or  F,ERR,<reason>\n
```
10 s without data aborts. The ESP32 `Update` library verifies size and MD5.
Partition scheme `min_spiffs` (two 1.9 MB app slots) is set in `tools/firmware.js`.

### Differences from the camp framework — re-measure after switching

- **Encoder counting:** one count per quadrature cycle (rising edge of A, direction from B).
  The old framework's pulses/rev may differ, so `MM_PER_IMP_*` **must be re-measured with
  T1** on our firmware before any SHOW numbers are trusted. `NYOMTAV_MM` and the PWM line
  (T7) likewise.
- **Signs:** defaults `encL=+1, encR=−1` (pinout note "a jobb enkóder előjele fordított"),
  motors `+1`. Run `N,AUTO` once per robot on our firmware; its NVS namespace is separate
  from the old framework's.
- **Battery lockout:** motors disabled under 6800 mV, warning under 7400 mV (same numbers
  as the camp docs); an unconnected divider (0 mV) does not lock.
- **Stop semantics:** `S` deletes the task instead of cooperating through `varj()`; the
  effect for the show is the same — motors off immediately.
- Line-follower helpers (`szenzorNormal`, `vonalPozicioSzamol`) are minimal; the built-in
  PD follower (`Q`), `W`/`K`/`J`/`C` are **not** implemented — the show doesn't use them.

## Still unknown / untested

1. Everything above against a real robot — pinout, encoder polarity, PWM frequency vs the
   TB6612, BT-SPP throughput for OTA (~1.1 MB image; at typical SPP rates expect 1–3 min).
2. Whether five simultaneous SPP links from one Windows host are stable.
3. The original framework's `F` payload format and Start command — irrelevant once every
   robot runs our firmware, which is the plan.
