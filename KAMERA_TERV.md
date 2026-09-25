# Kamera-korrekció — külső referencia a show alatt

## Context

A show vak: a robotok csak az enkódereiket látják, és a csúszás elvileg sem mérhető velük
(`FINAL_SHOW.md` "D. AMI NEM JAVITHATO TOVABB": ±10 cm/méter, ±20° három pörgés után).
Minden pörgés 1–3° maradékot hagy, ami a 156 s-os "Keringő" végére 10°+ fejirány-hibává
és látható pozícióhibává áll össze. Egy-egy szám kézi hangolása futásonként nem konvergál
tovább, és a hiba amúgy is padló- és akkumulátorfüggő.

**Cél:** külső referencia. Egy telefon (Android 14+, USB-webkameraként) állványról nézi a
4,6 × 3 m-es padlót; a böngésző képkockánként megméri minden robot valódi (x, y, fejirány)
értékét, és a **meglévő Bluetooth-linkeken** apró javításokat küld — minden ütem holtidejében,
amikor a robot amúgy is áll. A show szerkezete, ütemórája és időzítése nem változik.

**Miért ez működik:** a `lepes_var()` már ma is percekig ácsorog ütemenként, és a firmware a
soros parancsokat egy **külön FreeRTOS-taskban** dolgozza fel (`robot.ino:188-193` — a `varj()`
sima `vTaskDelay`, a `parancs()` a `loop()`-ban fut), tehát a robot **futó show közben is vesz
parancsot**. Csak épp ma nincs olyan parancs, amit a show fel tudna használni.

---

## Válasz a marker-kérdésre (ez alakítja a tervet)

A padlójelek **is** kellenek, a robotokon lévő markerek **is** — két külön dolgot csinálnak:

| | mire való | hány darab |
|---|---|---|
| **Padlójelek** (A/B/C/D, már le vannak ragasztva) | a kép→padló átszámítás (homográfia) kalibrálása: melyik pixel hány mm. Egyszer, show előtt. | 4 (a meglévő sarokjelek) |
| **Robotra ragasztott marker** | *melyik* robotot látjuk, *hol* van és *merre néz* | 1/robot |

Marker nélkül a kamera csak öt egyforma dobozt lát: nem tudja megmondani, melyik a 3-as, és
főleg nem látja a **fejirányt** — márpedig a fejirány a fő hibaforrás. Egy nyomtatott ArUco
négyzet mind a hármat egyszerre adja, egyetlen detektálásból, és megbízhatóbb, mint a színes
korongok vegyes fényben. Marker = A4-re nyomtatott fekete-fehér négyzet, laposan a robot
tetejére, a **keréktengely közepe** fölé (ez a pörgés középpontja és a terv referenciapontja),
nyíllal az orr felé.

---

## A megoldás négy darabja

### 1. Firmware: egy új parancs (`K`) — `koreografia/firmware/robot/robot.ino`

`K,<ütem>,<fok1>,<mm>,<fok2>` — egyrekeszes postaláda, a `parancs()` `switch`-ébe (`:511-583`),
`portMUX`-szal védve (a `loop()` task írja, a show task olvassa). A parancs **nem mozgat**:
csak letesz egy javítást, amit a show vesz át, ha épp abban az ütemben tart és belefér az időbe.
Új `korr_kiolvas(utem, &fok1, &mm, &fok2)` a show felé, `mezoF()` float mezőkhöz,
`KERET_VERZIO` → `keret-ep v8`. `varj()` és `loop()` **nem változik**.

Előjelek: `fok` = `porog_fok` konvenció (**+ = jobbra**), `mm` = + előre.

### 2. Show-sablon: az ütem holtideje dolgozik — `koreografia/templates/show_template.txt`

Blokk 5 kap egy ütemszámlálót és egy beszélő várakozást:

- `lepes_kezd()` → `lepesSzam++`
- `lepes_var(ido)` belépéskor kiírja: `var,<ütem>,<maradék ms>` — ez a jelzés a gazdának,
  hogy a robot **most áll** és mérhető;
- utána 20 ms-onként nézi a postaládát, és ha érkezett javítás *erre* az ütemre, **csak akkor**
  hajtja végre, ha a becsült idő + 600 ms tartalék belefér a hátralévő időbe — különben
  `korr,kihagy`. **A közös ütemóra mindig fontosabb, mint a javítás.**
- a javító mozgások `korr ` előtaggal naplóznak, hogy a `trace.js` szét tudja választani őket.

Blokk 3: `KORR_MIN_FOK 2.0`, `KORR_MIN_MM 30.0`, `KORR_MAX_MM 250.0`, `KORR_BIZTONSAG 1.5`,
`KORR_TARTALEK_MS 600`. Új `becsult_ms()` ugyanabból a blokk-3 konstanshalmazból számol, mint a
gazda `core/duration.js`-e (TEMPO-val együtt).

**Sorrend számít:** a g++-nak nincs auto-prototípusa, ezért blokk 5-ben `lepes_var` a *legutolsó*,
előtte `becsult_ms`/`korr_ido_ms`, előttük `megy_cm`/`porog_fok`, és a hat egysoros
(`balra_fok` stb.) **szó szerint marad** — azok *maguk* az előjel-konvenció.

### 3. Böngésző: új "Kamera" fül — `koreografia/ui/camera.js` (+ `camera-math.js`)

A meglévő `dashboard.js` mintáját követi pontosan: `initCamera(ctx)` → `{ onLine, onResize,
onActivate, onDeactivate }`, bekötve az `app.js` `onLine`-jába (`:67-70`) és a `switchTab`-be (`:153`).
Így a **már megnyitott** Web Serial linkeket használja — nincs új transzport, nincs szerver,
nincs Python.

- **Detektálás:** `js-aruco2` (MIT, `cv.js` + `aruco.js`, a szótárak a fájlban vannak) bevendorozva
  `koreografia/vendor/js-aruco2/`-ba, klasszikus `<script>`-ként (nem ES-modul!). `maxHammingDistance: 3`
  — a könyvtár alapértéke 12 lenne, ami összekeverné a robotokat.
- **Kalibráció:** a négy padlójelre egyesével ráállítunk egy **markeres robotot**, "Rögzít" → a
  marker képpontja párosul a jel ismert (x, y)-jával. Négy pár → `core/homography.js` (DLT).
  Azért robottal és nem a padlójelre helyezett papírral, mert így a homográfia **marker-magasságban**
  készül, és a parallaxist magától elnyeli. Kiírja az RMS/max hibát mm-ben; 20 mm fölött figyelmeztet.
  `localStorage`-ba mentve.
- **Mérés mód:** minden `var,n,rem` üzenetre 0,4 s képkockát átlagol, és sorba írja a tervezett vs.
  mért pózt (Δmm, Δ°) — a `tools/trace.js` táblája, de **mérve**. CSV-mentés.
- **Élő mód:** `var,n,rem` → `X` (az alvó SPP-link első csomagja ~0,5 s késik — az `app.js:135`
  már ezt a trükköt használja a `T` előtt) → átlagolás → `compileShow(...).beats[n-1].robots[r].poseAfter`
  a terv → `compileGoto(mért, terv)` → `K` küldése. Küszöbök: 30 mm / 2° alatt kihagy, 30 mm alatt
  csak fejirányt javít, hajtás 250 mm-re vágva. Mindkét oldal ellenőriz.

### 4. Marker-nyomtató oldal — `koreografia/ui/marker.html`

`AR.Dictionary(...).generateSVG(id)` robotonként, valós méretben (alap 180 mm, 720p-nél 250 mm),
orr-nyíllal, vágójelekkel, A4-re.

---

## Fájlok

**Új:** `core/homography.js`, `ui/camera.js`, `ui/camera-math.js`, `ui/marker.html`,
`vendor/js-aruco2/{cv.js,aruco.js,LICENSE.txt}`, `test/{homography,camera,trace}.test.js`, `KAMERA.md`.

**Módosul:** `firmware/robot/robot.ino`, `templates/show_template.txt`, `tools/keret_stub.h`
(egy sor: `korr_kiolvas` deklarációja), `tools/trace.js` (`MOVE_RE` + `korr` sorok külön
dead-reckonolva, terv-primitívet nem fogyasztva), `ui/index.html` (fül, szekció, két `<script>`),
`ui/app.js` (7 pontos bekötés, `ctx.getCompiled`), `ui/field.js` (mért pózok rárajzolása),
`test/template.test.js`, `test/emit.test.js`, `tools/make-template.js`, `HANDOFF.md`, `koreografia/README.md`.

**Újrahasznosítva (nem írunk újat):** `core/compile.js` `compileGoto()` — pont a
mért→tervezett póz különbségéből csinál fordulj-menj-fordulj hármast; `core/pose.js`
(`turnDeg`, `driveMm`, `applySequence`); `core/timeline.js`; `transport/webserial.js`;
`transport/manual.js` `browserDownloadSink` a CSV-hez.

---

## Tesztek

`test/template.test.js` ma blokk **5-öt és 8-at** bájtazonosnak köti a v5 alapvonalhoz
(`RobotBaseStats/SHOW_robot1.md`). Blokk 8 **marad** bájtazonos; blokk 5 pinje szignatúra-szintűre
enyhül: a hat egysoros és a két cél-sor szó szerint, plusz a függvény-szignatúrák.
A `RobotBaseStats/SHOW_robot1.md`-hez **nem nyúlunk** — az a v5 történeti alapvonal.
`syntax.test.js` (g++) az igazi őr az újrarendezett blokk 5 fölött.
Új tesztek: homográfia (identitás, perspektíva oda-vissza, kollineáris → hiba), `planCorrection`
küszöbei és az **előjel-körbejárás** (`applySequence(mért, prims)` ≈ terv, és a `K` hármas
`porog_fok`-előjellel visszaalkalmazva ugyanoda visz), `korr` sorok a trace-ben.

---

## Előbb rendezni: mi van valójában a robotokon

A ma 12:40-kor fordított sketchek (`koreografia/build/robot*/`) **nem reprodukálhatók** a repóból:
`SZINKRON = 16.0` (a sablonban 8.0), és a blokk-2 értékek is eltérnek a `robots.json`-tól
(robot 1: `PORGES_TRIM 1.035 / TRIM_JOBB 1.020 / OFFSET 0` vs. `1.000 / 1.000 / -14`;
robot 2: `1.026 / .955 / .992 / OFFSET 5 / LASSITAS 60 / FEK 100` vs. `1.006 / — / — / -12 / 30 / —`).
A `build/` gitignore-olt, tehát ez a hangolás **csak ott létezik**.

Döntésed szerint **a 12:40-es buildek a mérvadók**, ezért az első lépés: visszaemelni a
`SZINKRON = 16.0`-t (kommentjével) a sablon 3. blokkjába, és a `robots.json`-t hozzáigazítani mind
az öt robot ténylegesen felprogramozott értékeihez — `node tools/build.js` után a kimenetnek a
blokk 3/5 kamera-részén kívül **bájtra egyeznie kell** a `build/robot*/SHOW_robot*.txt`-vel.
Ez nem elhalasztható: a kamera-firmware OTA-ja **szükségszerűen újraflasheli a show-t is**,
és különben a kamerát egy közben megváltozott motorvezérlés ellen hangolnánk.

---

## Verifikáció (sorrendben)

1. `cd koreografia && npm test` — zöld, benne a `syntax.test.js` (valódi fordító az új blokk 5-re).
2. `node tools/build.js data/keringo-show.json out` → diff a `build/robot1/SHOW_robot1.txt`-vel:
   **csak** a blokk 3/5 kamera-része térhet el. Blokk 2 és 6 nem mozdulhat.
3. `node tools/firmware.js build 1 ...` → OTA **egy** robotra. `P` válasza `keret-ep v8`.
4. **Álló robot, show nélkül:** `./tools/say.ps1 -Port COM5 "K,3,10,100,-10"` → `K,OK,...` és a
   robot **nem mozdul** (nincs `lepes_var`, ami átvegye).
5. **Show közben:** hosszú ütemű próba-show, `var,3,<rem>` megjelenik → `K,3,0,100,0` egy másik
   ablakból → `korr megy 10 cm ...` majd `korr,ok,3`. Túl nagy javítás rövid ütem végén → `korr,kihagy`.
6. `node tools/trace.js logs/<futás>.log --robot 1` — a javítás külön `korr` sorként, az ütemvégi Δ tükrözi.
7. **Kamera szárazon, csak mérés:** állvány, markerek nyomtatva, kalibráció A/B/C/D-n,
   RMS < 20 mm, fejirány ellenőrzése egy szándékosan 90°-ra állított roboton; végigfut a show
   élő mód **nélkül** → CSV és ütemtábla. Ez megmondja, mekkora a valódi hiba és mennyi a tényleges
   holtidő ütemenként.
8. Élő mód **egy** robottal, aztán mind az öttel.

---

## Kockázatok

- **Felbontás vs. markerméret.** A detektor 49×49-re torzítja a jelöltet (~6 px/cella), tehát a
  markernek ≳50 px-nek kell lennie a képen. 4,6 m-re: 1080p → 2,4 mm/px → 180 mm marker = 75 px (jó);
  720p → 3,6 mm/px → 50 px (határeset). **1080p-t kérünk**; ha a telefon USB-webkamera módja csak
  720p-t ad, **250 mm-es** markert nyomtatunk. A teljes padlóhoz ~3,3 m magasság kell 65–70° látószögnél;
  ultraszéles objektívvel ~1,9 m elég, de a hordótorzítást a síkhomográfia **nem** modellezi — ezért
  fogad a `computeHomography` 4-nél több pontpárt is (6–9 jellel a maradék elkenhető), és ezért írjuk
  ki a max. hibát mm-ben, hogy látható legyen, ne néma.
- **Ritkán fér bele a javítás.** A `keringo-show.json` ütemei 1,5× biztonsági szorzóval készültek,
  a tipikus holtidő 1–4 s, egy 250 mm + két fordulás becslése 1,5–3 s a ×1,5 előtt. Eleinte sok
  `korr,kihagy` várható. Kezelés: `data/keringo-kamera.json` variáns +2500 ms-mal a goto-ütemeken,
  vagy rövid ütemeken csak fejirány-javítás (az olcsó). A mérés mód előre megmondja a valódi holtidőt.
- **A javítás maga is vakon fut.** Ugyanaz a nyílt hurkú motor ugyanazzal a csúszással hajtja végre;
  egy 40 mm-es mozgás nagyrészt túlfutás és fék. Ezért 30 mm / 2° a küszöb és 250 mm a plafon —
  a kamera az **ütemek között** zárja a hurkot, nem szervó. A küszöböket ne vigyük lejjebb.
- **`enkoderNullaz()` a javításban.** Minden `mozgas()` nullázza az enkódereket, így a Műszerfal
  "megtett út" cellái ütem közben ugranak; a nyers `E,…` telemetria ott nem kumulatív. A `trace.js`
  nem függ ettől (mozgásonkénti `bal=`/`jobb=`-t olvas). `KAMERA.md`-ben dokumentálva.
- **Hamis marker-azonosítás** → `maxHammingDistance: 3` + méret- és négyzetesség-szűrő, különben
  a 2-es robot mérése mozgatná a 4-est.

---

## Amit be kell szerezni / elő kell készíteni

- Telefon USB-webkamera módban (Beállítások → USB → Webkamera), USB-kábellel a PC-hez.
- Állvány, minél magasabbra, a padló egésze a képben (oldalról/hátulról is jó — a homográfia kezeli).
- 5 nyomtatott marker (a `marker.html` oldalról), laposan a robotok tetejére, a keréktengely fölé,
  nyíl az orr felé.
- A négy sarokjel (A/B/C/D) leragasztva — ezek már megvannak a `SHOW_PREPARATION.md` szerint.
- Python **nem kell** — minden a böngészőben fut.
