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

### ROBOT sorszáma: ____   Dátum: __________   Padló: __________   Akku (mV): ______

**K0 — előjel és holtsáv**

| | bal | jobb |
|---|---|---|
| előre hajtva az enkóder nő? (I/N) | | |
| holtsáv előre (PWM) | | |
| holtsáv hátra (PWM) | | |
| **HOLTSAV (a kettő átlaga)** | | |

Ha valamelyik enkóder rossz irányba számolt: Műszerfal → *Robot beállítása* →
*Enkóder-irány felismerése* (`N,AUTO`), majd K0 újra. A kódot ne írd át.

**K1 — út / impulzus** (tolt út: __________ mm)

| mérés | encBal | encJobb | mm/imp bal | mm/imp jobb |
|---|---|---|---|---|
| 1. | | | | |
| 2. | | | | |
| 3. | | | | |
| **átlag** | | | | |

arány (bal/jobb): __________  ← ez a robot „ferdesége”, 1,000-től való eltérése a lényeg

**K2 — nyomtáv** (5 teljes fordulat, becslés: 153,0 mm)

| irány | leolvasott delta (fok) | új nyomtáv = 153,0 × 1800 / (1800 + delta) |
|---|---|---|
| jobbra | | |
| balra | | |
| **NYOMTAV_MM (átlag)** | | |

Ismételd meg a mérést az új értékkel: ha a delta már 5 fok alatt van, kész.

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
