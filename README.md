# EP_RobotChoreography

Choreography compiler, simulator, code editor and dashboard for the camp's five ESP32
line-follower robots, plus our own robot firmware ("keret-ep").

Everything lives in [`koreografia/`](koreografia/README.md):

```
cd koreografia
npm test                  # 79 tests
node tools/serve.js       # http://localhost:8080/ui/  (Koreográfia | Kód | Műszerfal)
```

Root files the app depends on:

- `SHOW_robot1.txt` — the measured, proven show sketch for robot 1; `koreografia/templates/show_template.txt`
  is generated from it (`node tools/make-template.js`) and the tests assert they never drift.
- `MERESI_MENET.md`, `DOKUMENTACIO_robot1.md` — the measurement procedure and robot 1's data that
  `koreografia/data/robots.json` and `core/config.js` are built on.
- `Sources/` — the camp's Segédlet (shown in the Kód tab), the pin table, and the two dashboard
  reference screenshots.
