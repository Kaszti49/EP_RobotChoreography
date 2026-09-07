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

### ROBOT sorszáma: 1   Dátum: 2026/09/07   Padló: 1000mm fa parketta   Akku (mV): 8.62V

**K0 — előjel és holtsáv**

7:49:24 K0 -- elojel es holtsav. NE nyulj a robothoz!
7:49:27 1) ELORE hajtva: encBal=817 encJobb=-818
7:49:27 Mindkettonek POZITIVNAK kell lennie, es a robotnak ELORE kell mennie.
7:49:27 Ha nem: Muszerfal -> Robot beallitasa -> 'Enkoder-irany felismerese' (N,AUTO),
7:49:27 utana futtasd ujra ezt a merest. A kodot NE ird at.
7:49:28 2) Holtsav-meres indul (4 x kb. 8 mp)...
7:49:32 =========== K0 EREDMENY ===========
7:49:32 HOLTSAV bal elore/hatra: 25 / 25
7:49:32 HOLTSAV jobb elore/hatra: 30 / 25
7:49:32 --> HOLTSAV a tablazatba: { 25, 27 }
7:49:32 ===================================
7:49:32 Ird be a robot_adatok.md tablazatba, majd jon a K1.
7:51:24 a kódod leállt (stop)
7:51:29 a kódod elindult
7:51:29 K0 -- elojel es holtsav. NE nyulj a robothoz!
7:51:31 1) ELORE hajtva: encBal=816 encJobb=-823
7:51:31 Mindkettonek POZITIVNAK kell lennie, es a robotnak ELORE kell mennie.
7:51:31 Ha nem: Muszerfal -> Robot beallitasa -> 'Enkoder-irany felismerese' (N,AUTO),
7:51:32 utana futtasd ujra ezt a merest. A kodot NE ird at.
7:51:33 2) Holtsav-meres indul (4 x kb. 8 mp)...
7:51:36 =========== K0 EREDMENY ===========
7:51:36 HOLTSAV bal elore/hatra: 30 / 25
7:51:36 HOLTSAV jobb elore/hatra: 25 / 25
7:51:36 --> HOLTSAV a tablazatba: { 27, 25 }
7:51:36 ===================================

Ha valamelyik enkóder rossz irányba számolt: Műszerfal → *Robot beállítása* →
*Enkóder-irány felismerése* (`N,AUTO`), majd K0 újra. A kódot ne írd át.

**K1 — út / impulzus** (tolt út: 1000 mm)

8:03:35 =========== K1 EREDMENY ===========
8:03:35 impulzus bal=2946 jobb=2926 (ut: 1000 mm)
8:03:35 --> MM_PER_IMP a tablazatba: { 0.67889, 0.68353 }
8:03:35 arany bal/jobb = 0.9932 (1,000 = tokeletesen egyforma kerekek)
8:03:35 impulzus/fordulat bal=205 jobb=203 (nevleges: 408)
8:03:35 Ismeteld 3-szor, es a HAROM ATLAGAT ird be a robot_adatok.md-be.
8:03:35 ===================================
8:05:27 =========== K1 EREDMENY ===========
8:05:27 impulzus bal=2959 jobb=2940 (ut: 1000 mm)
8:05:27 --> MM_PER_IMP a tablazatba: { 0.67590, 0.68027 }
8:05:27 arany bal/jobb = 0.9936 (1,000 = tokeletesen egyforma kerekek)
8:05:27 impulzus/fordulat bal=206 jobb=204 (nevleges: 408)
8:05:27 Ismeteld 3-szor, es a HAROM ATLAGAT ird be a robot_adatok.md-be.
8:05:27 ===================================
8:07:09 =========== K1 EREDMENY ===========
8:07:09 impulzus bal=2963 jobb=2943 (ut: 1000 mm)
8:07:09 --> MM_PER_IMP a tablazatba: { 0.67499, 0.67958 }
8:07:09 arany bal/jobb = 0.9933 (1,000 = tokeletesen egyforma kerekek)
8:07:09 impulzus/fordulat bal=206 jobb=204 (nevleges: 408)
8:07:09 Ismeteld 3-szor, es a HAROM ATLAGAT ird be a robot_adatok.md-be.
8:07:09 ===================================

**K2 — nyomtáv** (5 teljes fordulat, becslés: 153,0 mm)

8:19:13 K2 -- nyomtav-meres. Becsles: 153.0 mm
8:19:13 Egy teljes kor = 705 impulzus/kerek, osszesen 3525 (5 kor).
8:19:13 NE nyulj a robothoz! Indulas 3 mp mulva...
8:19:16 Forgas JOBBRA...
8:19:21 === JOBBRA kesz. Olvasd le a szoget! ===
8:19:21 Ha TULFORDULT (a nyil tullepett a jelen): a delta POZITIV.
8:19:21 Ha nem ert oda: a delta NEGATIV.
8:19:21 Keplet: uj_nyomtav = 153.0 * 1800 / (1800 + delta)
8:19:29 Forgas BALRA...
8:19:35 === BALRA kesz. Olvasd le ezt a szoget is! ===
8:19:35 =========== K2 KIERTEKELES ===========
8:19:35 1) Szamold ki mindket iranyra: uj = regi * 1800 / (1800 + delta)
8:19:35 2) A KET EREDMENY ATLAGA a NYOMTAV_MM, ezt ird a tablazatba.
8:19:35 3) Ird vissza ide a NYOMTAV_BECSLES-be, es futtasd ujra:
8:19:35 ha a delta mar 5 fok alatt van, keszen vagy.
8:19:35 ======================================
8:19:42 a kódod leállt (stop)
8:20:25 a kódod elindult
8:20:25 K2 -- nyomtav-meres. Becsles: 153.0 mm
8:20:25 Egy teljes kor = 705 impulzus/kerek, osszesen 3525 (5 kor).
8:20:25 NE nyulj a robothoz! Indulas 3 mp mulva...
8:20:28 Forgas JOBBRA...
8:20:35 === JOBBRA kesz. Olvasd le a szoget! ===
8:20:35 Ha TULFORDULT (a nyil tullepett a jelen): a delta POZITIV.
8:20:35 Ha nem ert oda: a delta NEGATIV.
8:20:35 Keplet: uj_nyomtav = 153.0 * 1800 / (1800 + delta)
8:20:43 Forgas BALRA...
8:20:49 === BALRA kesz. Olvasd le ezt a szoget is! ===
8:20:49 =========== K2 KIERTEKELES ===========
8:20:49 1) Szamold ki mindket iranyra: uj = regi * 1800 / (1800 + delta)
8:20:49 2) A KET EREDMENY ATLAGA a NYOMTAV_MM, ezt ird a tablazatba.
8:20:49 3) Ird vissza ide a NYOMTAV_BECSLES-be, es futtasd ujra:
8:20:49 ha a delta mar 5 fok alatt van, keszen vagy.
8:20:49 ======================================
8:25:34 K2 -- nyomtav-meres. Becsles: 153.0 mm
8:25:34 Egy teljes kor = 705 impulzus/kerek, osszesen 3525 (5 kor).
8:25:34 NE nyulj a robothoz! Indulas 3 mp mulva...
8:25:37 Forgas JOBBRA...
8:25:42 === JOBBRA kesz. Olvasd le a szoget! ===
8:25:42 Ha TULFORDULT (a nyil tullepett a jelen): a delta POZITIV.
8:25:42 Ha nem ert oda: a delta NEGATIV.
8:25:42 Keplet: uj_nyomtav = 153.0 * 1800 / (1800 + delta)
8:25:50 Forgas BALRA...
8:25:55 === BALRA kesz. Olvasd le ezt a szoget is! ===
8:25:55 =========== K2 KIERTEKELES ===========
8:25:55 1) Szamold ki mindket iranyra: uj = regi * 1800 / (1800 + delta)
8:25:55 2) A KET EREDMENY ATLAGA a NYOMTAV_MM, ezt ird a tablazatba.
8:25:55 3) Ird vissza ide a NYOMTAV_BECSLES-be, es futtasd ujra:
8:25:55 ha a delta mar 5 fok alatt van, keszen vagy.
8:25:55 ======================================

We put the robot on the surface without the tapes and then placed them on the tape line the first is without on the line and the 2nd and 3rd are on the line. The Robot only rotated roughly 2.5 times to the right and 2.5 to the left in one session.
**K3 — feed-forward**

| | bal | jobb |
|---|---|---|
| KFF (PWM / (imp/s)) | | |
| illesztett holtsáv | | |
| imp/s PWM 240-nél | | |

**VMAX_IMPS** (a leglassabb kerék 65 %-a): __________

Ha az illesztett holtsáv 15 PWM-nél jobban eltér a K0 értékétől, valamelyik mérés hibás.

**K4 — PD-hangolás és ellenőrzés**

| próba | PD_KP | PD_KD | PD_KSYNC | teszt | mért eltérés (mm) | megjegyzés |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

**Elfogadási feltétel:** 1. teszt (2 m egyenes) < 30 mm oldalirányban;
2. és 3. teszt (1 m négyzet mindkét irányban) < 50 mm a kiindulási ponttól.

Ha a négyzet-teszt két iránya **ugyanarra** húz → a K1 arány rossz, mérd újra.
Ha **ellentétesen** húz → a K2 nyomtáv rossz, mérd újra.

---

## A kész tábla — ezt másold a `show_robot.txt` 2. blokkjába

Cseréld ki a nevleges értékeket a mértekre. A sorrend: robot 1 → 6.

```cpp
const float MM_PER_IMP[6][2] = {
  {0.34040, 0.34040},   // robot 1
  {0.34040, 0.34040},   // robot 2
  {0.34040, 0.34040},   // robot 3
  {0.34040, 0.34040},   // robot 4
  {0.34040, 0.34040},   // robot 5
  {0.34040, 0.34040}    // robot 6
};
const float NYOMTAV_MM[6] = { 153.0, 153.0, 153.0, 153.0, 153.0, 153.0 };
const int   HOLTSAV[6][2] = { {60,60}, {60,60}, {60,60}, {60,60}, {60,60}, {60,60} };
const float KFF[6][2] = {
  {0.20000, 0.20000}, {0.20000, 0.20000}, {0.20000, 0.20000},
  {0.20000, 0.20000}, {0.20000, 0.20000}, {0.20000, 0.20000}
};
const int   VMAX_IMPS[6] = { 600, 600, 600, 600, 600, 600 };
const float PD_KP[6]    = { 0.60, 0.60, 0.60, 0.60, 0.60, 0.60 };
const float PD_KD[6]    = { 0.02, 0.02, 0.02, 0.02, 0.02, 0.02 };
const float PD_KSYNC[6] = { 0.30, 0.30, 0.30, 0.30, 0.30, 0.30 };
const int ENC_ELOJEL[6][2] = { {1,1}, {1,1}, {1,1}, {1,1}, {1,1}, {1,1} };
const int MOT_ELOJEL[6][2] = { {1,1}, {1,1}, {1,1}, {1,1}, {1,1}, {1,1} };
```

**A `VMAX_IMPS`-be a hat robot közül a LEGLASSABB értékét is beírhatod mind a hatnak.**
Egy koreográfia csak annyira lehet gyors, amennyire a leglassabb robot bírja — és a
show akkor néz ki jól, ha mind a hat ugyanazt csinálja, nem akkor, ha egy gyorsabb.

---

## Kitöltött példa (hogy lásd, milyen nagyságrendek reálisak)

| | robot 1 | robot 2 |
|---|---|---|
| mm/imp bal | 0,34120 | 0,33890 |
| mm/imp jobb | 0,33950 | 0,34210 |
| arány | 1,0050 | 0,9906 |
| nyomtáv (mm) | 154,2 | 151,8 |
| holtsáv bal/jobb | 58 / 63 | 66 / 61 |
| KFF bal/jobb | 0,1980 | 0,2130 |
| imp/s @ PWM 240 | 940 | 880 |
| VMAX_IMPS (65 %) | 611 | 572 |

Robot 2 a lassabb → a közös `VMAX_IMPS` **572** legyen mind a hatnál.
Az 1 % körüli arány-eltérés az, amitől kiegyenlítés nélkül a robot 2 m alatt
kb. 10 cm-t kanyarodna el magától — pontosan ezt tünteti el a keresztcsatolás.
