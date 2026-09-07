# Robot-adatlap — 6 robot egyedi bemérése

Ez a lap a **show egyetlen igazsága**. A `show_robot.txt` 2. blokkja szó szerint ezekből
a számokból áll össze. Amit ide nem írunk be, azt a robot nem tudja magáról.

**Nyomtasd ki, és tollal töltsd ki mérés közben.** A végén gépeld be a kódba.

---

## Miért kell minden robotot külön bemérni?

A hat robot ugyanabból a dobozból jött, de:

- a kerék gumija másképp kopott és másképp lapul → **más a megtett út egy impulzusra**
- a váz nyomtávja a nyomtatási tűrésen belül szór → **más szögben fordul ugyanattól a parancstól**
- a motor keféje, a hajtómű súrlódása eltér → **más PWM-nél indul el, és más sebességgel megy**

A show-ban ezek nem tűnnek el maguktól: 3 % úthiba egy 10 méteres koreográfia végére
30 cm. A vonalkövetésnél a vonal folyamatosan visszatette a robotot a helyére —
**most nincs vonal, ami ezt megtegye.** Ezért a különbséget méréssel kell kivenni.

---

## A mérés menete (robotonként, ebben a sorrendben!)

| Sorrend | Program | Mit ad | Mennyi idő |
|---|---|---|---|
| 1. | `K0_elojel_holtsav.txt` | előjelek, `HOLTSAV` | ~1 perc |
| 2. | `K1_ut_per_impulzus.txt` | `MM_PER_IMP` (bal, jobb külön) | 3 × ~1 perc |
| 3. | `K2_nyomtav.txt` | `NYOMTAV_MM` | ~3 perc |
| 4. | `K3_pwm_sebesseg.txt` | `KFF`, `VMAX_IMPS` | ~1 perc |
| 5. | `K4_ellenorzes.txt` | PD-hangolás + ellenőrzés | ~20 perc |

**Mérési fegyelem** (ugyanaz, mint a tábori hangolási naplónál):

- Minden szám **3 mérés átlaga**. Ha a 3 mérés 1 %-nál jobban szór, előbb a mechanikát nézd meg.
- **Ugyanaz a padló**, amin a show lesz. Márványon és szőnyegen más a `MM_PER_IMP`.
- **Teli akku**, és jegyezd fel a feszültséget (`V` parancs). 6800 mV alatt a keret letilt.
- Egyszerre egy dolgot változtass, és írd fel, mit láttál.

---

## Adatlap — másold le 6 példányban

### ROBOT sorszáma: 1   Dátum: 2026/09/07   Padló: fa parketta   Akku: 8,62 V

> **A 2026-09-07-i mérés kiértékelve.** A nyers naplók a `meresi_naplo_robot1.md`-ben
> maradtak meg. Az alábbi táblázat a **javított** értékeket tartalmazza — kettő
> hibát találtunk a nyers adatokban, mindkettő javítva a mérőprogramokban is.

| | érték | honnan |
|---|---|---|
| mm/imp bal | **0,33829** | K1, 3 tolás átlaga (2956,0 imp / 1000 mm) |
| mm/imp jobb | **0,34056** | K1, 3 tolás átlaga (2936,3 imp / 1000 mm) |
| arány bal/jobb | **0,99335** | 0,67 % kerék-aszimmetria — normális |
| nyomtáv (mm) | 153,0 ⬜ | **NINCS BEMÉRVE** — tábori becslés, a K2-t újra kell futtatni |
| holtsáv bal/jobb | **26 / 26** | K0, két futás átlaga (K3 illesztése {29,27} — egyezik) |
| KFF bal/jobb | **0,04353 / 0,04278** | K3 első (érvényes) futása, PWM 60…120 |
| imp/s @ PWM 120 | 2020 (leglassabb kerék) | K3 első futás |
| VMAX_IMPS (65 %) | **1313** | óvatos: a K3 csak PWM 120-ig mért |
| ENC_ELOJEL | **{ 1, −1 }** | K0: előre hajtva encJobb = −818 / −823 |
| MOT_ELOJEL | { 1, 1 } | K0 |

**A mérés minősége jó volt.** A három K1 tolás szórása mindkét keréken 0,58 % —
bőven az 1 %-os szabályon belül. Nem a mérés volt rossz, hanem két konstans.

---

#### 1. hiba — fordított jobb enkóder (ez okozta a „bal kerék nem húz" tünetet)

A K0 **kétszer is** kiírta:

```
1) ELORE hajtva: encBal=817  encJobb=-818
   Mindkettonek POZITIVNAK kell lennie
```

Az `ENC_ELOJEL` mégis `{1,1}` maradt. A K1/K2/K3 **abszolút értéket** használ,
ezért mindhárom vakon átengedte. A K4 az első, amelyik előjeles értéket használ —
ott viszont végzetes:

`hibaJobb` azonnal a `HIBA_HATAR = 300` korlátra fut és **ott is marad**. Ezután

- `uJobb = KFF·v + 0,6·300 − 0,3·(86−300) ≈ 244` → a jobb kerék **plafonon, végig**
- `uBal  = KFF·v + 0,6·86 + 0,3·(86−300) ≈ 0` → a bal kerék **megáll**

A `PD_KSYNC` keresztcsatolás azt hiszi, a bal kerék 214 impulzussal le van maradva
(hamis jel), és erre a **helyes** válasza az, hogy a balt elveszi és a jobbat
padlóig nyomja. A bal kerékkel semmi baj nem volt — a szabályzót utasította rá
egy rossz előjel.

A napló `szog=3963 fok` sora ugyanez az odometriában.

**Javítva:** `ENC_ELOJEL = {1,−1}`; a K0 most kész, bemásolható sort ír ki; a
K1/K2/K3 megáll előjel-hibánál; a K4 indulás előtt önteszttel ellenőrzi.

> ⚠️ Ha lefuttatod az `N,AUTO`-t a Műszerfalon, a `{1,−1}` **rossz lesz** — a két
> javítás kioltja egymást. A sorrend mindig: K0 futtatás → a K0 által kiírt sort
> beírni. Egyszerre csak az egyik.

---

#### 2. hiba — minden mm/imp pontosan 2× akkora volt

Az `UT_MM` 2000-en maradt, a robotot viszont 1000 mm-t toltuk.

Az enkóder **408 impulzus / fordulat = 138,9 mm** — ez hardver-adat, nem kopás:

```
2946 imp ÷ 408 = 7,22 fordulat × 138,9 mm = 1003 mm  ← ennyit toltunk valójában
```

Mind a hat K1 leolvasás 1003 ± 6 mm-re jön ki. A napló „205 imp/fordulat" sora a
408-as névlegeshez képest 2× eltérés — ekkorát gumikopás nem okoz.

**Független megerősítés:** a K2 a mm/imp-ből számolja a teljes kör impulzusszámát.
A rossz 0,679-cel 705 imp/kerék jött ki, a helyes érték 1416 — arány **2,01**.
Ezért fordult a robot 5 helyett **2,5 kört**, pontosan ahogy fel is jegyeztük.
Ugyanaz a hiba, két teljesen független mérésből.

**Javítva:** helyes mm/imp a táblázatban; a K1 most összeveti a mért
impulzus/fordulatot a 408-cal, és kiírja, hogy **valójában** hány mm-t toltak.

---

#### 3. — a K3 nem támasztja alá, hogy a bal kerék gyengébb

- **1. futás (PWM 60…120):** bal ≈ jobb, 1 %-on belül. PWM 120: bal 2168 / jobb 2184.
- **2. futás (…180):** előre a **bal a gyorsabb** (3300 / 3212), hátra lassabb
  (2702 / 3198). Irányfüggő, és ellentmond az 1. futásnak. PWM 150–180-on a robot
  jóval túlfutott a 2 m-en — nekiment valaminek. **Az ütközött mérés nem mérés.**
- **3. futás (60, 80):** az `illesztes()` legalább 3 pontot kér, ezért `a=0, b=0`-t
  adott vissza. A `KFF = 0` nem eredmény, hanem hibajelzés.

**A show-ban ez amúgy sem számít:** 160 mm/s ≈ 470 imp/s ≈ **PWM 45**. Végig abban
a tartományban maradunk, ahol az 1. futás szerint a két kerék 1 %-on belül egyforma.

**Javítva:** a K3 most a tényleges csúcs-PWM-et írja ki (eddig fixen „240"-et,
akkor is, ha a lista 80-nál végződött — emiatt lett a VMAX 770); monotonitás-
ellenőrzés jelzi az ütközést; a sikertelen illesztés hangos hiba, nem csendes nulla.

---

#### 4. — `maximumPWM` nincs a keretben

A `Segédlet.txt` dokumentálja, a feltöltött keret 2.0 viszont nem adja, ezért a
K4 és a `show_robot.txt` **nem fordult le**. A `keret_stub.h` viszont deklarálta,
így az `ellenoriz.sh` átengedte — a desktop-ellenőrzés hamis biztonságot adott.

**Javítva:** saját `PWM_PLAFON = 255` konstans mindkét vázlatban; a stub már nem
deklarálja, tehát a jövőben az `ellenoriz.sh` elkapja ugyanezt.

---

#### Mi hiányzik még robot 1-nél

| | |
|---|---|
| ⬜ **NYOMTAV_MM** | a K2 három futása érvénytelen volt (2× rossz mm/imp). Újra kell mérni — **és fel kell írni a két maradék szöget**, ez eddig egyszer sem történt meg. |
| ⬜ **VMAX_IMPS** | 1313 óvatos érték PWM 120-ig mérve. PWM 240-ig újramérve nagyobb lesz. |
| ⬜ **PD_KP / PD_KD / PD_KSYNC** | még kiindulási értékek, a K4 hangolási menete (P → D → KSYNC) adja a véglegeset. |

#### Robot 2…6

Egyik sincs bemérve. A `MERVE[]` tömbben `false` — a `show_robot.txt` hangosan
figyelmeztet, a K4 pedig el sem indul rajtuk.

---

## A kész tábla — ezt másold a `show_robot.txt` 2. blokkjába

A robot 1 sora **mért**. A 2…6 még névleges, ezért a `MERVE[]` tömbben `false`:
így a `show_robot.txt` figyelmeztet, a K4 pedig el sem indul rajtuk.

```cpp
const bool MERVE[6] = { true, false, false, false, false, false };

const float MM_PER_IMP[6][2] = {
  {0.33829, 0.34056},   // robot 1  -- MERT (arany 0,99335)
  {0.34040, 0.34040},   // robot 2  -- nevleges
  {0.34040, 0.34040},   // robot 3  -- nevleges
  {0.34040, 0.34040},   // robot 4  -- nevleges
  {0.34040, 0.34040},   // robot 5  -- nevleges
  {0.34040, 0.34040}    // robot 6  -- nevleges
};
// FIGYELEM: a nyomtav egyik robotnal SINCS bemerve.
const float NYOMTAV_MM[6] = { 153.0, 153.0, 153.0, 153.0, 153.0, 153.0 };
const int   HOLTSAV[6][2] = {
  {26, 26},             // robot 1  -- MERT
  {60,60}, {60,60}, {60,60}, {60,60}, {60,60}
};
const float KFF[6][2] = {
  {0.04353, 0.04278},   // robot 1  -- MERT
  {0.20000, 0.20000}, {0.20000, 0.20000},
  {0.20000, 0.20000}, {0.20000, 0.20000}, {0.20000, 0.20000}
};
const int   VMAX_IMPS[6] = { 1313, 600, 600, 600, 600, 600 };
const float PD_KP[6]    = { 0.60, 0.60, 0.60, 0.60, 0.60, 0.60 };
const float PD_KD[6]    = { 0.02, 0.02, 0.02, 0.02, 0.02, 0.02 };
const float PD_KSYNC[6] = { 0.30, 0.30, 0.30, 0.30, 0.30, 0.30 };
const int ENC_ELOJEL[6][2] = { {1,-1}, {1,1}, {1,1}, {1,1}, {1,1}, {1,1} };
const int MOT_ELOJEL[6][2] = { {1,1}, {1,1}, {1,1}, {1,1}, {1,1}, {1,1} };
```

**A `VMAX_IMPS`-be a hat robot közül a LEGLASSABB értékét írd be mind a hatnak.**
Egy koreográfia csak annyira lehet gyors, amennyire a leglassabb robot bírja — és a
show akkor néz ki jól, ha mind a hat ugyanazt csinálja, nem akkor, ha egy gyorsabb.

---

## Két szabály, ami ezt a két hibát a jövőben megfogja

1. **A K0 kiírja a bemásolandó `ENC_ELOJEL` sort — azt másold, ne találgass.**
   `N,AUTO` **vagy** kézi előjel, soha nem mindkettő. Ha `N,AUTO`-t futtattál,
   utána **futtasd újra a K0-t**, és azt a sort írd be, amit *akkor* ír ki.
2. **A K1 `UT_MM`-je pontosan annyi legyen, amennyit tolsz.** A program most
   összeveti a 408 imp/fordulat hardver-adattal, és megmondja, valójában hány
   mm-t toltál — de csak akkor tud szólni, ha elolvasod a naplót.

## Milyen nagyságrendek reálisak — a robot 1 valódi adataival

Ezek **mért** számok, nem kitalált példa. Ha a te robotod ezektől nagyságrendben
eltér, előbb a mérést nézd meg, ne a robotot.

| | robot 1 (mért) | mit jelent |
|---|---|---|
| mm/imp bal | 0,33829 | a névleges 0,34040 közelében — így néz ki egy jó K1 |
| mm/imp jobb | 0,34056 | |
| arány | 0,99335 | 0,67 % kerék-aszimmetria; 3 % fölött nézd meg a mechanikát |
| imp/fordulat | 409 / 408 | **a 408-hoz kell közel lennie** — ez a legjobb K1-ellenőrzés |
| nyomtáv (mm) | *még nincs* | várhatóan 150…156 között |
| holtsáv bal/jobb | 26 / 26 | 100 fölött szoruló kerék vagy gyenge akku |
| KFF bal/jobb | 0,04353 / 0,04278 | PWM egy imp/s-ra |
| imp/s @ PWM 120 | 2020 (leglassabb) | |
| VMAX_IMPS (65 %) | 1313 | PWM 120-ig mérve; 240-ig több lenne |

**A show sebessége ehhez képest:** 160 mm/s ≈ 470 imp/s ≈ **PWM 45**. Vagyis a
koreográfia végig abban a tartományban marad, ahol a két kerék 1 %-on belül
egyforma — bőven a szabályzó mozgásterén belül.


K0 mérés:
10:56:18 K0 -- elojel es holtsav. NE nyulj a robothoz!
10:56:20 1) ELORE hajtva: encBal=794 encJobb=-790
10:56:20 Mindkettonek POZITIVNAK kell lennie, es a robotnak ELORE kell mennie.
10:56:21 !!! FORDITOTT ENKODER-ELOJEL !!!
10:56:21 Ird be a K4 es a show_robot ENC_ELOJEL tablazataba EHHEZ a robothoz:
10:56:21 ENC_ELOJEL sora: { 1, -1 }
10:56:21 VAGY futtasd az N,AUTO-t a Muszerfalon -- de NE MINDKETTOT!
10:56:21 (Ha N,AUTO-t futtatsz, utana FUTTASD UJRA A K0-t, es azt a sort ird be,
10:56:21 uzenet-sor tele, eldobva: 1
10:56:22 2) Holtsav-meres indul (4 x kb. 8 mp)...
10:56:25 =========== K0 EREDMENY ===========
10:56:25 HOLTSAV bal elore/hatra: 25 / 25
10:56:25 HOLTSAV jobb elore/hatra: 25 / 25
10:56:25 --> HOLTSAV a tablazatba: { 25, 25 }
10:56:25 ===================================
10:56:25 Ird be a robot_adatok.md tablazatba, majd jon a K1.
10:56:33 a kódod leállt (stop)
10:57:19 a kódod elindult
10:57:19 K0 -- elojel es holtsav. NE nyulj a robothoz!
10:57:22 1) ELORE hajtva: encBal=796 encJobb=-798
10:57:22 Mindkettonek POZITIVNAK kell lennie, es a robotnak ELORE kell mennie.
10:57:22 !!! FORDITOTT ENKODER-ELOJEL !!!
10:57:22 Ird be a K4 es a show_robot ENC_ELOJEL tablazataba EHHEZ a robothoz:
10:57:22 ENC_ELOJEL sora: { 1, -1 }
10:57:22 VAGY futtasd az N,AUTO-t a Muszerfalon -- de NE MINDKETTOT!
10:57:22 (Ha N,AUTO-t futtatsz, utana FUTTASD UJRA A K0-t, es azt a sort ird be,
10:57:22 uzenet-sor tele, eldobva: 1
10:57:23 2) Holtsav-meres indul (4 x kb. 8 mp)...
10:57:26 =========== K0 EREDMENY ===========
10:57:26 HOLTSAV bal elore/hatra: 25 / 25
10:57:26 HOLTSAV jobb elore/hatra: 25 / 25
10:57:26 --> HOLTSAV a tablazatba: { 25, 25 }
10:57:26 ===================================
10:57:26 Ird be a robot_adatok.md tablazatba, majd jon a K1.

K1 Mérés:

1. Mérés:
11:07:40 K1 -- told vegig a robotot 2000 mm-t a vezeto mellett, aztan engedd el.
11:07:41 ... bal=0 jobb=0
11:07:42 ... bal=188 jobb=-190
11:07:43 ... bal=637 jobb=-630
11:07:44 ... bal=1185 jobb=-1173
11:07:45 ... bal=1809 jobb=-1802
11:07:46 ... bal=2385 jobb=-2371
11:07:47 ... bal=2835 jobb=-2837
11:07:48 ... bal=3109 jobb=-3100
11:07:49 ... bal=3670 jobb=-3670
11:07:50 ... bal=4291 jobb=-4278
11:07:51 ... bal=4920 jobb=-4891
11:07:52 ... bal=5442 jobb=-5428
11:07:53 ... bal=5895 jobb=-5893
11:07:54 ... bal=5894 jobb=-5891
11:07:55 ... bal=5894 jobb=-5891
11:07:55 =========== K1 LEALLT: ELOJEL-HIBA ===========
11:07:55 encBal=5894 encJobb=-5891 -- ELLENTETES elojel egyenes tolasnal!
11:07:55 Az egyik enkoder forditva szamol. Futtasd a K0-t, es a kiirt
11:07:55 ENC_ELOJEL sort ird be a K4 / show_robot tablazataba.
11:07:55 A meres addig ERVENYTELEN. (Ez a hiba a K4-ben elszalado robotot okoz.)
11:07:55 ==============================================

2. Mérés:
11:10:20 K1 -- told vegig a robotot 2000 mm-t a vezeto mellett, aztan engedd el.
11:10:21 ... bal=0 jobb=0
11:10:22 ... bal=62 jobb=-55
11:10:23 ... bal=522 jobb=-524
11:10:24 ... bal=970 jobb=-978
11:10:25 ... bal=1500 jobb=-1497
11:10:26 ... bal=1976 jobb=-1972
11:10:27 ... bal=2376 jobb=-2349
11:10:28 ... bal=2845 jobb=-2836
11:10:29 ... bal=3270 jobb=-3263
11:10:30 ... bal=3795 jobb=-3787
11:10:31 ... bal=4341 jobb=-4322
11:10:32 ... bal=4887 jobb=-4877
11:10:33 ... bal=5447 jobb=-5433
11:10:34 ... bal=5828 jobb=-5823
11:10:35 ... bal=5869 jobb=-5856
11:10:36 ... bal=5869 jobb=-5856
11:10:37 =========== K1 LEALLT: ELOJEL-HIBA ===========
11:10:37 encBal=5869 encJobb=-5856 -- ELLENTETES elojel egyenes tolasnal!
11:10:37 Az egyik enkoder forditva szamol. Futtasd a K0-t, es a kiirt
11:10:37 ENC_ELOJEL sort ird be a K4 / show_robot tablazataba.
11:10:37 A meres addig ERVENYTELEN. (Ez a hiba a K4-ben elszalado robotot okoz.)
11:10:37 ==============================================

3. mérés:
11:12:06 ... bal=367 jobb=-365
11:12:07 ... bal=936 jobb=-940
11:12:08 ... bal=1552 jobb=-1563
11:12:09 ... bal=2153 jobb=-2155
11:12:10 ... bal=2859 jobb=-2869
11:12:11 ... bal=3665 jobb=-3671
11:12:13 ... bal=4385 jobb=-4399
11:12:14 ... bal=4996 jobb=-4997
11:12:14 ... bal=5637 jobb=-5618
11:12:15 ... bal=5864 jobb=-5840
11:12:16 ... bal=5864 jobb=-5841
11:12:17 ... bal=5864 jobb=-5841
11:12:17 =========== K1 LEALLT: ELOJEL-HIBA ===========
11:12:17 encBal=5864 encJobb=-5841 -- ELLENTETES elojel egyenes tolasnal!
11:12:17 Az egyik enkoder forditva szamol. Futtasd a K0-t, es a kiirt
11:12:17 ENC_ELOJEL sort ird be a K4 / show_robot tablazataba.
11:12:17 A meres addig ERVENYTELEN. (Ez a hiba a K4-ben elszalado robotot okoz.)
11:12:17 ==============================================

4. mérés:
11:13:03 ... bal=19 jobb=-19
11:13:04 ... bal=451 jobb=-448
11:13:05 ... bal=940 jobb=-942
11:13:06 ... bal=1228 jobb=-1232
11:13:07 ... bal=1579 jobb=-1590
11:13:08 ... bal=2049 jobb=-2036
11:13:09 ... bal=2610 jobb=-2599
11:13:10 ... bal=2948 jobb=-2962
11:13:11 ... bal=3425 jobb=-3427
11:13:12 ... bal=3912 jobb=-3910
11:13:13 ... bal=4495 jobb=-4475
11:13:14 ... bal=4965 jobb=-4951
11:13:15 ... bal=5389 jobb=-5385
11:13:16 ... bal=5790 jobb=-5779
11:13:17 ... bal=5894 jobb=-5888
11:13:18 ... bal=5894 jobb=-5888
11:13:18 =========== K1 LEALLT: ELOJEL-HIBA ===========
11:13:18 encBal=5894 encJobb=-5888 -- ELLENTETES elojel egyenes tolasnal!
11:13:18 Az egyik enkoder forditva szamol. Futtasd a K0-t, es a kiirt
11:13:18 ENC_ELOJEL sort ird be a K4 / show_robot tablazataba.
11:13:18 A meres addig ERVENYTELEN. (Ez a hiba a K4-ben elszalado robotot okoz.)
11:13:18 ==============================================

A 0,67 %-os arány-eltérés az, amitől kiegyenlítés nélkül a robot 2 m alatt
kb. 7 cm-t kanyarodna el magától — pontosan ezt tünteti el a keresztcsatolás.
