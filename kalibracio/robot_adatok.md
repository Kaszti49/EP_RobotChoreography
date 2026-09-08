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

**ROBOT 2 ADATOK**

**K0 Mérés:**
A holtsáv azaz a minimum PWM amit a mind 2 kerék használhat az 60PWM.

**K1 Mérések:**
7:59:34 =========== K1 EREDMENY -- ELORE tolas ===========
7:59:34 impulzus bal=5872 jobb=5834 (ut: 2000 mm)
7:59:34 --> MM_PER_IMP a tablazatba: { 0.34060, 0.34282 }
7:59:34 arany bal/jobb = 0.9935 (1,000 = tokeletesen egyforma kerekek)
7:59:34 impulzus/fordulat bal=408 jobb=405 (nevleges: 408)
7:59:34 skala OK (imp/fordulat 406, tolt ut ~1993 mm)

8:00:06 =========== K1 EREDMENY -- ELORE tolas ===========
8:00:06 impulzus bal=5933 jobb=5889 (ut: 2000 mm)
8:00:06 --> MM_PER_IMP a tablazatba: { 0.33710, 0.33962 }
8:00:06 arany bal/jobb = 0.9926 (1,000 = tokeletesen egyforma kerekek)
8:00:06 impulzus/fordulat bal=412 jobb=409 (nevleges: 408)
8:00:06 skala OK (imp/fordulat 411, tolt ut ~2012 mm)

8:00:40 =========== K1 EREDMENY -- ELORE tolas ===========
8:00:40 impulzus bal=5909 jobb=5889 (ut: 2000 mm)
8:00:40 --> MM_PER_IMP a tablazatba: { 0.33847, 0.33962 }
8:00:40 arany bal/jobb = 0.9966 (1,000 = tokeletesen egyforma kerekek)
8:00:40 impulzus/fordulat bal=410 jobb=409 (nevleges: 408)
8:00:40 skala OK (imp/fordulat 410, tolt ut ~2008 mm)

**K2 Mérés:**
8:21:28 K2 -- nyomtav-meres. Becsles: 150.0 mm
8:21:28 mm/imp: bal=0.33710 jobb=0.33962 -- EZ A K1 EREDMENYE LEGYEN!
8:21:28 Egy teljes kor = 1392 impulzus/kerek, osszesen 6960 (5 kor).
8:21:28 Kerekenkenti cel: bal=6989 jobb=6937 impulzus (a ket mm/imp elter, ezert a ket cel is)
8:21:28 NE nyulj a robothoz! Elojel-teszt, aztan indulas...
8:21:31 Elojel-teszt: bal=594 jobb=575 (mindketto POZITIV kell legyen)
8:21:32 --- forgas-diagnosztika (2 x kb. 2 mp, kis elmozdulas) ---
8:21:34 JOBBRA: bal 743 imp/s, jobb 983 imp/s (kert: 1000, elteres 24.5 %)
8:21:36 BALRA : bal 804 imp/s, jobb 581 imp/s (kert: 1000, elteres 27.7 %)
8:21:36 Ha a ket sor kozott nagy a kulonbseg, a hiba FORGAS-specifikus.
8:21:36 Ha mindket sor egyforma, de a K3 aszimmetriat mutatott, akkor a
8:21:36 kulonbseg csak nagy PWM-en jelentkezik -- a show-t az nem erinti.
8:21:36 --------------------------------------------------------
8:21:38 Indulas 3 mp mulva...
8:21:41 Forgas JOBBRA...
8:21:53 vegen: bal=4272 jobb=9694 ido=11015 ms (legnagyobb elteres menet kozben: 5384 imp)
8:21:53 FIGYELEM: nagy elteres a ket kerek kozott -- nezd meg a K3 iranyonkenti adatait.
8:21:53 === JOBBRA kesz. Olvasd le a szoget! ===
8:21:53 Ha TULFORDULT (a nyil tullepett a jelen): a delta POZITIV.
8:21:53 Ha nem ert oda: a delta NEGATIV.
8:21:53 Keplet: uj_nyomtav = 150.0 * 1800 / (1800 + delta)
8:22:01 Forgas BALRA...
8:22:14 vegen: bal=9856 jobb=4121 ido=11115 ms (legnagyobb elteres menet kozben: 5740 imp)
8:22:14 FIGYELEM: nagy elteres a ket kerek kozott -- nezd meg a K3 iranyonkenti adatait.
8:22:14 === BALRA kesz. Olvasd le ezt a szoget is! ===
8:22:14 =========== A KET FORGAS OSSZEHASONLITASA ===========
8:22:14 JOBBRA: 11015 ms, bal=4272 jobb=9694
8:22:14 BALRA : 11115 ms, bal=9856 jobb=4121
8:22:14 ido-arany (balra/jobbra) = 1.01


**K3 Mérés:**
8:14:31 K3 -- PWM/sebesseg jelleggorbe.
8:14:31 HELY: a 8 pontos lista TOBB MINT 5 m-t megy elore! Roviditsd, ha nincs annyi.
8:14:33 Elojel-teszt: bal=666 jobb=636
8:14:34 Indulas 3 mp mulva, NE nyulj a robothoz.
8:14:37 --- ELORE ---
8:14:38 PWM 60 -> bal 812 imp/s, jobb 812 imp/s
8:14:39 PWM 80 -> bal 1172 imp/s, jobb 1158 imp/s
8:14:40 PWM 100 -> bal 1571 imp/s, jobb 1569 imp/s
8:14:41 PWM 120 -> bal 1966 imp/s, jobb 1946 imp/s
8:14:42 PWM 150 -> bal 2440 imp/s, jobb 2442 imp/s
8:14:44 --- HATRA ---
8:14:45 PWM 60 -> bal 443 imp/s, jobb 513 imp/s
8:14:46 PWM 80 -> bal 922 imp/s, jobb 976 imp/s
8:14:47 PWM 100 -> bal 1433 imp/s, jobb 1335 imp/s
8:14:48 PWM 120 -> bal 1812 imp/s, jobb 1655 imp/s
8:14:49 PWM 150 -> bal 2670 imp/s, jobb 1767 imp/s
8:14:49 --- meres-ellenorzes ---
8:14:49 =========== K3 EREDMENY ===========
8:14:49 --> HOLTSAV a tablazatba (iranyonkent):
8:14:49 { {15,42}, {16,21} }
8:14:49 --> KFF a tablazatba (iranyonkent):
8:14:49 { {0.05442,0.04087}, {0.05443,0.06521} }
8:14:49 (sorrend: {bal elore, bal hatra}, {jobb elore, jobb hatra})
8:14:49 (hasonlitsd ossze a K0 holtsav-ertekeivel: 15 PWM-en belul legyenek!)
8:14:49 --- irany-aszimmetria (elore vs hatra, ugyanaz a kerek) ---
8:14:49 bal: hatra -24.9 % tobb PWM kell ugyanahhoz a sebesseghez

**K4 Mérés:** 
Sikertelen! Bal kerék nem hajt! vagy nem kap jelet:
Kód:
// =====================================================================
//  K4 -- ZART-KORU ELLENORZES ES PD-HANGOLAS
//  Show-koreografia: 5. (utolso) meres a hat robotbol mindegyiken
// =====================================================================
//
//  MI EZ?
//    Ez a show_robot.txt VEZERLESE, valtozatlanul -- csak koreografia
//    helyett meropalyat jar. Ha ez a haromfele teszt atmegy, a robot
//    keszen all a show-ra. Ha nem, ITT derul ki, es nem a kozonseg elott.
//
//  A HAROM TESZT (allitsd a TESZT valtozot 1 / 2 / 3-ra)
//    1  EGYENES 2 m       -> a KSYNC keresztcsatolast ellenorzi
//    2  1 m-es NEGYZET JOBBRA (oramutato szerint)
//    3  1 m-es NEGYZET BALRA
//       -> a 2. es 3. egyutt az "UMBmark" teszt: a ket irany hibaja
//          megmondja, MELYIK mert szam rossz:
//
//       a ket irany hibaja UGYANARRA mutat  -> a MM_PER_IMP arany rossz (K1)
//       a ket irany hibaja ELLENTETESEN     -> a NYOMTAV_MM rossz (K2)
//
//    Ez azert mukodik, mert a kerek-aranybol jovo hiba a haladasi iranyhoz
//    kotott (mindig ugyanarra huz), a nyomtav-hiba viszont a fordulasokhoz
//    -- es a ket iranyban a fordulasok ellentetesek.
//
//  CELERTEKEK
//    1. teszt: 2 m utan az oldaliranyu elteres  < 30 mm
//    2-3. teszt: a start-pontba visszaerve az elteres  < 50 mm
//    Mindegyiket 3-5-szor futtasd -- egy szerencses kor nem meres.
//
//  ELOKESZULET
//    - Ragaszd le a padlon: egy 2 m-es egyenest, es egy 1 x 1 m-es negyzetet.
//    - A robot kiindulasi helyet es iranyat pontosan jelold (szalag-kereszt).
//    - Ugyanaz a padlo es ugyanaz az akku-allapot, mint a show-n!
//    - Toltsd ki lent a robot MERT adatait a robot_adatok.md-bol!
//
//  HANGOLASI SORREND (P -> D -> KSYNC), ugyanaz az elv, mint a vonalkovetesnel
//    1. PD_KD = 0, PD_KSYNC = 0. Emeld a PD_KP-t 0,2-rol, amig a robot mar
//       nem "lomhan" indul, de meg nem rangat / zug allasban.
//    2. Emeld a PD_KD-t (0,01 -> 0,05), amig a megallasok tullendulese eltunik.
//       Ha allasban remeg vagy zug: TUL SOK a D, vedd vissza.
//    3. Emeld a PD_KSYNC-et (0,1 -> 0,5), amig az 1. teszt egyenese kiegyenesedik.
//       Tul nagy KSYNC: a robot "ciganykerekezik", kapkodva korrigal.
// =====================================================================


// ============ 1. MELYIK ROBOT? ============
#define ROBOT 1              // <<<<<< 1..6

const int R = ROBOT - 1;

// ============ 2. MERT ADATOK (ugyanaz, mint a show_robot.txt-ben!) ============
//  Ez a blokk SZO SZERINT ugyanaz, mint a show_robot.txt 2. blokkja.
//  Ha ott valtoztatsz, ITT IS valtoztasd -- kulonben a K4 nem azt ellenorzi,
//  ami tenylegesen felmegy a robotra.
const bool MERVE[6] = { true, false, false, false, false, false };

const float MM_PER_IMP[6][2] = {
  {0.33847, 0.33962},   // robot 1  -- MERT (3 tolas atlaga 1000 mm-en), arany 0,99335
  {0.34040, 0.34040}, {0.34040, 0.34040},
  {0.34040, 0.34040}, {0.34040, 0.34040}, {0.34040, 0.34040}
};
// FIGYELEM: a nyomtav egyik robotnal SINCS bemerve -- ez meg a tabori becsles.
const float NYOMTAV_MM[6] = { 150.0, 153.0, 153.0, 153.0, 153.0, 153.0 };
// K0/K3: holtsav PWM, KEREKENKENT ES IRANYONKENT
//   { { bal elore, bal hatra }, { jobb elore, jobb hatra } }
//
//  MIERT IRANYONKENT? Mert a ket irany NEM egyforma, es a regi kod atlagolta
//  a kettot -- vagyis pont azt az informaciot dobta el, ami szamit.
//  Robot 1-nel a bal kerek HATRA gyengebb: PWM 120-nal 7 %-kal lassabb, mint
//  elore. Emiatt a K2 jobbra-forgasa szep volt (ott a bal kerek ELORE megy),
//  a balra-forgasa viszont kuzdott (ott HATRA).
const int HOLTSAV[6][2][2] = {
  { {15, 42}, {16, 21} },   // robot 1  -- MERT (K3 1. futas illesztese)
  { {60, 60}, {60, 60} },
  { {60, 60}, {60, 60} },
  { {60, 60}, {60, 60} },
  { {60, 60}, {60, 60} },
  { {60, 60}, {60, 60} }
};

// K3: feed-forward, PWM egy impulzus/s sebesseghez, IRANYONKENT
//   { { bal elore, bal hatra }, { jobb elore, jobb hatra } }
const float KFF[6][2][2] = {
  { {0.05442, 0.04087}, {0.05443, 0.06521} },   // robot 1  -- MERT
  { {0.20000, 0.20000}, {0.20000, 0.20000} },
  { {0.20000, 0.20000}, {0.20000, 0.20000} },
  { {0.20000, 0.20000}, {0.20000, 0.20000} },
  { {0.20000, 0.20000}, {0.20000, 0.20000} },
  { {0.20000, 0.20000}, {0.20000, 0.20000} }
};
const int   VMAX_IMPS[6] = { 1313, 600, 600, 600, 600, 600 };
const float PD_KP[6]    = { 0.60, 0.60, 0.60, 0.60, 0.60, 0.60 };
const float PD_KD[6]    = { 0.02, 0.02, 0.02, 0.02, 0.02, 0.02 };
const float PD_KSYNC[6] = { 0.30, 0.30, 0.30, 0.30, 0.30, 0.30 };

//  ROBOT 1: a jobb enkoder FORDITVA szamol (K0: elore hajtva -818 / -823).
//  Ha lefuttatod az N,AUTO-t, ez az ertek ROSSZ lesz -- futtasd ujra a K0-t,
//  es ird be az altala kiirt sort. NE hasznald mindkettot egyszerre.
const int ENC_ELOJEL[6][2] = { {1,1}, {1,1}, {1,1}, {1,1}, {1,1}, {1,1} };
const int MOT_ELOJEL[6][2] = { {1,1}, {1,1}, {1,1}, {1,1}, {1,1}, {1,1} };

// PWM-plafon. SAJAT nev SZANDEKOSAN -- a keret 2.0 NEM ad `maximumPWM`-et,
// arra hivatkozva a vazlat nem fordul le. Ne ird at `maximumPWM`-re.
const int PWM_PLAFON = 140;


// ============ 3. MELYIK TESZT FUSSON? ============
int TESZT = 1;      // <<<<<< 1 = egyenes 2 m,  2 = negyzet JOBBRA,  3 = negyzet BALRA


// ============ 4. BEALLITASOK (ugyanaz, mint a show-ban) ============
float GYORSULAS_MM_S2 = 600.0;
float SZOGGYORSULAS   = 360.0;
float D_ALFA          = 0.30;
float HIBA_HATAR      = 300.0;
float U_MIN           = 3.0;
float ALLAS_TURES     = 12.0;
int   TELEMETRIA_CIKLUS = 50;

struct Lepes { uint16_t ido_ms; float v_mm_s; float omega_fok_s; };


// ============ 5. A MEROPALYAK ============
//  1) EGYENES: 2000 mm 200 mm/s-mal = 10 000 ms
const Lepes TESZT1[] = {
  {1500, 0, 0}, {10000, 200, 0}, {2000, 0, 0}
};
//  2) NEGYZET JOBBRA: 4 x (1000 mm elore, 90 fok jobbra)
//     1000 mm / 200 mm/s = 5000 ms ;  90 fok / 45 fok/s = 2000 ms
const Lepes TESZT2[] = {
  {1500, 0, 0},
  {5000, 200, 0}, {2000, 0, 45}, {5000, 200, 0}, {2000, 0, 45},
  {5000, 200, 0}, {2000, 0, 45}, {5000, 200, 0}, {2000, 0, 45},
  {2000, 0, 0}
};
//  3) NEGYZET BALRA: ugyanaz, ellentetes fordulasokkal
const Lepes TESZT3[] = {
  {1500, 0, 0},
  {5000, 200, 0}, {2000, 0, -45}, {5000, 200, 0}, {2000, 0, -45},
  {5000, 200, 0}, {2000, 0, -45}, {5000, 200, 0}, {2000, 0, -45},
  {2000, 0, 0}
};

const Lepes* palya;
int palyaDb;


// ============ 6. BELSO ALLAPOT (azonos a show-eval) ============
int   shAllapot = 0;                       // 0 = visszaszamlal, 1 = megy, 2 = vege
unsigned long armMs = 0, showMs = 0, utolsoTick = 0;
float vAkt = 0, omegaAkt = 0;
float celBal = 0, celJobb = 0;
float elozoHibaBal = 0, elozoHibaJobb = 0;
float dSzurtBal = 0, dSzurtJobb = 0;
long  elozoEncBal = 0, elozoEncJobb = 0;
float odoX = 0, odoY = 0, odoSzog = 0;
float maxHiba = 0;
int   shCiklus = 0;
int   utolsoVisszaszam = -1;
int   telitesSzamlalo = 0;

// 150 ciklus = 3 masodperc tartos telites -> leallas
const int TELITES_LEALLAS = 150;

long encB() { return encBal  * ENC_ELOJEL[R][0]; }
long encJ() { return encJobb * ENC_ELOJEL[R][1]; }

// irany-index a feed-forward es a holtsav tablakhoz: 0 = elore, 1 = hatra
int iranyIdx(float x) { return (x >= 0.0) ? 0 : 1; }

int pwmSzamol(float u, int oldal) {
  if (u > -U_MIN && u < U_MIN) return 0;
  int   elojel  = (u > 0) ? 1 : -1;
  float nagysag = (u > 0) ? u : -u;
  int   d = (u > 0) ? 0 : 1;                       // a TENYLEGES hajtasi irany
  int   p = HOLTSAV[R][oldal][d] + (int)(nagysag + 0.5);
  if (p > PWM_PLAFON) p = PWM_PLAFON;
  return elojel * p * MOT_ELOJEL[R][oldal];
}


// ============ 7. A KERET HIVJA: EGYSZER ============

// INDULAS ELOTTI ELOJEL-ONTESZT.
//  Ez a vazlat az ELSO a lancban, amelyik ELOJELES enkoder-erteket hasznal
//  (a K1/K2/K3 abszolut erteket vesz, ezert vakok erre a hibara).
//  Rossz elojellel a kovetesi hiba azonnal telitesbe fut, az egyik kerek
//  plafonra megy, a masik leall -- pontosan ez tortent 2026-09-07-en.
//  Ezert a K4 mostantol NEM INDUL EL, amig ezt le nem ellenorizte.
bool elojelOnteszt() {
  enkoderNullaz();
  varj(200);
  motor(90, 90);
  varj(450);
  motor(0, 0);
  varj(500);

  long b = encBal * ENC_ELOJEL[R][0];
  long j = encJobb * ENC_ELOJEL[R][1];
  uzenet("Elojel-onteszt: bal=" + String(b) + " jobb=" + String(j)
         + "  (ENC_ELOJEL " + String(ENC_ELOJEL[R][0]) + "/" + String(ENC_ELOJEL[R][1]) + ")");

  motor(-90, -90);
  varj(450);
  motor(0, 0);
  varj(700);
  enkoderNullaz();

  if (b < 50 || j < 50) {
    uzenet("!!!!!!!!!! K4 LEALLT: ROSSZ ENKODER-ELOJEL !!!!!!!!!!");
    uzenet("Elore hajtva MINDKET erteknek pozitivnak kell lennie.");
    uzenet("Ha most negativ, a szabalyzo elszalasztana a robotot:");
    uzenet("  a hibas kerek hibaja telitesbe fut -> a masik kerek plafonra megy.");
    uzenet("TEENDO: futtasd a K0-t, es az altala kiirt ENC_ELOJEL sort ird be");
    uzenet("        a 2. blokk ENC_ELOJEL tablazataba EHHEZ a robothoz.");
    uzenet("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    return false;
  }
  uzenet("Elojel OK.");
  return true;
}

void indulas() {
  motor(0, 0);
  enkoderNullaz();

  if (TESZT == 2)      { palya = TESZT2; palyaDb = sizeof(TESZT2) / sizeof(Lepes); }
  else if (TESZT == 3) { palya = TESZT3; palyaDb = sizeof(TESZT3) / sizeof(Lepes); }
  else                 { palya = TESZT1; palyaDb = sizeof(TESZT1) / sizeof(Lepes); }

  shAllapot = 2;          // amig az onteszt nem ment at, NEM indulunk
  utolsoVisszaszam = -1;
  maxHiba = 0;
  shCiklus = 0;

  uzenet("K4 -- robot " + String(ROBOT) + ", teszt " + String(TESZT)
         + " (" + String(palyaDb) + " lepes)");
  uzenet("mm/imp " + String(MM_PER_IMP[R][0], 5) + "/" + String(MM_PER_IMP[R][1], 5)
         + "  nyomtav " + String(NYOMTAV_MM[R], 1) + "  vmax " + String(VMAX_IMPS[R]));
  uzenet("KP=" + String(PD_KP[R], 2) + " KD=" + String(PD_KD[R], 3)
         + " KSYNC=" + String(PD_KSYNC[R], 2));

  if (!MERVE[R]) {
    uzenet("!!! A robot " + String(ROBOT) + " NINCS BEMERVE (MERVE[" + String(R) + "] = false).");
    uzenet("!!! A K4 nevleges adatokkal ertelmetlen: futtasd eloszor a K0..K3-at.");
    uzenet("!!! A meres NEM indul el.");
    return;
  }

  uzenet("Elojel-onteszt kovetkezik -- a robot ROVIDEN elore-hatra mozdul.");
  varj(1200);
  if (!elojelOnteszt()) return;

  shAllapot = 0;          // most mar mehet a visszaszamlalas
  armMs = millis();
  utolsoTick = armMs;
  uzenet("Allitsd a kiindulasi jelre, aztan HATRA! Indulas 5 mp mulva.");
}


// ============ 8. A KERET HIVJA: 20 MS-ONKENT ============
void vezerles() {
  unsigned long most = millis();
  float dt = (float)(most - utolsoTick) / 1000.0;
  utolsoTick = most;
  if (dt <= 0.0 || dt > 0.2) dt = 0.02;

  // --- visszaszamlalas ---
  if (shAllapot == 0) {
    motor(0, 0);
    unsigned long eltelt = most - armMs;
    if (eltelt >= 5000) {
      enkoderNullaz();
      elozoEncBal = 0; elozoEncJobb = 0;
      celBal = 0; celJobb = 0;
      elozoHibaBal = 0; elozoHibaJobb = 0;
      dSzurtBal = 0; dSzurtJobb = 0;
      vAkt = 0; omegaAkt = 0;
      odoX = 0; odoY = 0; odoSzog = 0;
      showMs = most;
      shAllapot = 1;
      uzenet(">>> INDUL <<<");
      return;
    }
    int hatra = (int)((5000 - eltelt) / 1000) + 1;
    if (hatra != utolsoVisszaszam) { utolsoVisszaszam = hatra; uzenet(String(hatra) + "..."); }
    return;
  }
  if (shAllapot == 2) { motor(0, 0); return; }

  // --- hol tartunk ---
  unsigned long t = most - showMs;
  unsigned long vege = 0;
  int idx = 0;
  while (idx < palyaDb) { vege += palya[idx].ido_ms; if (t < vege) break; idx++; }

  float vCel = 0, omegaCel = 0;
  bool vegeVan = (idx >= palyaDb);
  if (!vegeVan) { vCel = palya[idx].v_mm_s; omegaCel = palya[idx].omega_fok_s; }

  // --- gyorsulas-korlat ---
  float dvMax = GYORSULAS_MM_S2 * dt;
  float dv = vCel - vAkt;
  if (dv >  dvMax) dv =  dvMax;
  if (dv < -dvMax) dv = -dvMax;
  vAkt += dv;
  float dwMax = SZOGGYORSULAS * dt;
  float dw = omegaCel - omegaAkt;
  if (dw >  dwMax) dw =  dwMax;
  if (dw < -dwMax) dw = -dwMax;
  omegaAkt += dw;

  // --- kinematika ---
  float omegaRad = omegaAkt * 0.01745329;
  float fel = NYOMTAV_MM[R] / 2.0;
  float vBalImpS  = (vAkt + omegaRad * fel) / MM_PER_IMP[R][0];
  float vJobbImpS = (vAkt - omegaRad * fel) / MM_PER_IMP[R][1];

  float nagyobb = (vBalImpS > 0 ? vBalImpS : -vBalImpS);
  float masik   = (vJobbImpS > 0 ? vJobbImpS : -vJobbImpS);
  if (masik > nagyobb) nagyobb = masik;
  if (nagyobb > (float)VMAX_IMPS[R]) {
    float sk = (float)VMAX_IMPS[R] / nagyobb;
    vBalImpS *= sk; vJobbImpS *= sk;
  }

  // --- cel-pozicio es hiba ---
  celBal  += vBalImpS  * dt;
  celJobb += vJobbImpS * dt;
  float hibaBal  = celBal  - (float)encB();
  float hibaJobb = celJobb - (float)encJ();
  bool telites = false;
  if (hibaBal  >  HIBA_HATAR) { hibaBal  =  HIBA_HATAR; celBal  = (float)encB() + HIBA_HATAR; telites = true; }
  if (hibaBal  < -HIBA_HATAR) { hibaBal  = -HIBA_HATAR; celBal  = (float)encB() - HIBA_HATAR; telites = true; }
  if (hibaJobb >  HIBA_HATAR) { hibaJobb =  HIBA_HATAR; celJobb = (float)encJ() + HIBA_HATAR; telites = true; }
  if (hibaJobb < -HIBA_HATAR) { hibaJobb = -HIBA_HATAR; celJobb = (float)encJ() - HIBA_HATAR; telites = true; }

  // BIZTONSAGI LEALLAS -- ugyanaz, mint a show_robot.txt-ben.
  //  Tartos telites = a szabalyzo olyan hibat hajszol, amit nem tud ledolgozni.
  //  Ilyenkor az egyik kerek plafonon marad; inkabb alljunk meg.
  telitesSzamlalo = telites ? telitesSzamlalo + 1 : 0;
  if (telitesSzamlalo >= TELITES_LEALLAS) {
    motor(0, 0);
    shAllapot = 2;
    uzenet("!!! BIZTONSAGI LEALLAS: " + String(TELITES_LEALLAS)
           + " cikluson at telitesben a kovetesi hiba.");
    uzenet("hibaBal=" + String(hibaBal, 0) + " hibaJobb=" + String(hibaJobb, 0));
    uzenet("Ha az egyik hiba vegig +/-" + String(HIBA_HATAR, 0)
           + " -> szinte biztosan ROSSZ ENC_ELOJEL. Futtass K0-t.");
    return;
  }

  float ah = (hibaBal > 0 ? hibaBal : -hibaBal);
  if (ah > maxHiba) maxHiba = ah;
  ah = (hibaJobb > 0 ? hibaJobb : -hibaJobb);
  if (ah > maxHiba) maxHiba = ah;

  // --- PD + keresztcsatolas ---
  float dB = (hibaBal  - elozoHibaBal)  / dt;
  float dJ = (hibaJobb - elozoHibaJobb) / dt;
  dSzurtBal  += (dB - dSzurtBal)  * D_ALFA;
  dSzurtJobb += (dJ - dSzurtJobb) * D_ALFA;
  elozoHibaBal  = hibaBal;
  elozoHibaJobb = hibaJobb;

  float szinkron = hibaBal - hibaJobb;
  float uBal  = KFF[R][0][iranyIdx(vBalImpS)]  * vBalImpS
                + PD_KP[R] * hibaBal  + PD_KD[R] * dSzurtBal  + PD_KSYNC[R] * szinkron;
  float uJobb = KFF[R][1][iranyIdx(vJobbImpS)] * vJobbImpS
                + PD_KP[R] * hibaJobb + PD_KD[R] * dSzurtJobb - PD_KSYNC[R] * szinkron;

  bool allunk = (vCel == 0 && omegaCel == 0 && vAkt == 0 && omegaAkt == 0);
  if (allunk) {
    if (hibaBal  < ALLAS_TURES && hibaBal  > -ALLAS_TURES) uBal  = 0;
    if (hibaJobb < ALLAS_TURES && hibaJobb > -ALLAS_TURES) uJobb = 0;
  }

  motor(pwmSzamol(uBal, 0), pwmSzamol(uJobb, 1));

  // --- odometria ---
  long dbi = encB() - elozoEncBal;
  long dji = encJ() - elozoEncJobb;
  elozoEncBal = encB(); elozoEncJobb = encJ();
  float dBalMm  = (float)dbi * MM_PER_IMP[R][0];
  float dJobbMm = (float)dji * MM_PER_IMP[R][1];
  float dUt = (dBalMm + dJobbMm) / 2.0;
  odoSzog += (dBalMm - dJobbMm) / NYOMTAV_MM[R];
  odoX += dUt * sin(odoSzog);
  odoY += dUt * cos(odoSzog);

  // --- vege es kiertekeles ---
  if (vegeVan && vAkt == 0 && omegaAkt == 0) {
    motor(0, 0);
    shAllapot = 2;
    uzenet("=========== K4 EREDMENY ===========");
    uzenet("A robot ODA HITTE magat: x=" + String(odoX, 0) + " mm  y=" + String(odoY, 0)
           + " mm  szog=" + String(odoSzog * 57.2958, 0) + " fok");
    uzenet("legnagyobb kovetesi hiba menet kozben: " + String(maxHiba, 0) + " impulzus");
    if (maxHiba > 250)
      uzenet("  -> nagy: emeld a PD_KP-t, vagy lassits (a motor telitesbe megy)");
    if (TESZT == 1) {
      uzenet("MERD MEG: mennyivel all OLDALRA a 2 m-es egyenestol?  Cel: < 30 mm");
      uzenet("  tul nagy -> emeld a PD_KSYNC-et; ha mindig ugyanarra huz -> a K1 arany rossz");
    } else {
      uzenet("MERD MEG: milyen messze all a kiindulasi jeltol?  Cel: < 50 mm");
      uzenet("  Futtasd le a 2. ES a 3. tesztet is, es hasonlitsd ossze:");
      uzenet("  ugyanarra huznak    -> MM_PER_IMP arany rossz (K1 ujra)");
      uzenet("  ellentetesen huznak -> NYOMTAV_MM rossz (K2 ujra)");
    }
    uzenet("Ird be a robot_adatok.md ellenorzes-tablazataba!");
    uzenet("===================================");
    return;
  }

  shCiklus++;
  if (shCiklus % TELEMETRIA_CIKLUS == 0)
    uzenet("t=" + String(t / 1000) + "s lepes=" + String(idx) + " v=" + String(vAkt, 0)
           + " w=" + String(omegaAkt, 0) + " hiba=" + String(hibaBal, 0) + "/" + String(hibaJobb, 0));
}
