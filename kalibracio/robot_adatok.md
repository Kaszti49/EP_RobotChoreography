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
First stats:
const int PWM_DB = 4;
int pwmLista[PWM_DB] = { 60, 80, 100, 120};
int BEALL_MS = 200;    // ennyi ideig gyorsul be a PWM-re
int MERES_MS = 250;    // ezen az ablakon merjuk a sebesseget

9:09:23 K3 -- PWM/sebesseg jelleggorbe. Kell kb. 2 m szabad hely!
9:09:23 Indulas 3 mp mulva, NE nyulj a robothoz.
9:09:26 --- ELORE ---
9:09:27 PWM 60 -> bal 709 imp/s, jobb 705 imp/s
9:09:27 PWM 80 -> bal 1200 imp/s, jobb 1280 imp/s
9:09:28 PWM 100 -> bal 1664 imp/s, jobb 1708 imp/s
9:09:28 PWM 120 -> bal 2168 imp/s, jobb 2184 imp/s
9:09:31 --- HATRA ---
9:09:31 PWM 60 -> bal 704 imp/s, jobb 768 imp/s
9:09:32 PWM 80 -> bal 1202 imp/s, jobb 1306 imp/s
9:09:32 PWM 100 -> bal 1614 imp/s, jobb 1720 imp/s
9:09:32 PWM 120 -> bal 2020 imp/s, jobb 2116 imp/s
9:09:33 =========== K3 EREDMENY ===========
9:09:33 --> KFF a tablazatba: { 0.04353, 0.04278 }
9:09:33 --> HOLTSAV (illesztett): { 29, 27 }
9:09:33 (hasonlitsd ossze a K0 holtsav-ertekeivel: 15 PWM-en belul legyenek!)
9:09:33 meg PWM 240-nel: 2020 imp/s a leglassabb kerek
9:09:33 --> VMAX_IMPS a tablazatba (65 %): 1313
9:09:33 A show SOHA ne menjen ennel gyorsabban -- a maradek 35 % a PD-e,

Second Stats:
const int PWM_DB = 6;
int pwmLista[PWM_DB] = { 60, 80, 100, 120, 150, 180};
int BEALL_MS = 200;    // ennyi ideig gyorsul be a PWM-re
int MERES_MS = 250;    // ezen az ablakon merjuk a sebesseget

9:21:40 K3 -- PWM/sebesseg jelleggorbe. Kell kb. 2 m szabad hely!
9:21:40 Indulas 3 mp mulva, NE nyulj a robothoz.
9:21:44 --- ELORE ---
9:21:45 PWM 60 -> bal 630 imp/s, jobb 488 imp/s
9:21:46 PWM 80 -> bal 1192 imp/s, jobb 1112 imp/s
9:21:46 PWM 100 -> bal 1657 imp/s, jobb 1641 imp/s
9:21:46 PWM 120 -> bal 2032 imp/s, jobb 2084 imp/s
9:21:46 PWM 150 -> bal 2592 imp/s, jobb 2624 imp/s
9:21:46 PWM 180 -> bal 3300 imp/s, jobb 3212 imp/s
9:21:51 --- HATRA ---
9:21:51 PWM 60 -> bal 720 imp/s, jobb 704 imp/s
9:21:51 PWM 80 -> bal 1219 imp/s, jobb 1187 imp/s
9:21:51 PWM 100 -> bal 1576 imp/s, jobb 1628 imp/s
9:21:51 PWM 120 -> bal 1937 imp/s, jobb 2059 imp/s
9:21:51 PWM 150 -> bal 2327 imp/s, jobb 2661 imp/s
9:21:52 PWM 180 -> bal 2702 imp/s, jobb 3198 imp/s
9:21:52 =========== K3 EREDMENY ===========
9:21:52 --> KFF a tablazatba: { 0.05351, 0.04630 }
9:21:52 --> HOLTSAV (illesztett): { 18, 28 }
9:21:52 (hasonlitsd ossze a K0 holtsav-ertekeivel: 15 PWM-en belul legyenek!)
9:21:52 meg PWM 240-nel: 2702 imp/s a leglassabb kerek
9:21:52 --> VMAX_IMPS a tablazatba (65 %): 1757
9:21:52 A show SOHA ne menjen ennel gyorsabban -- a maradek 35 % a PD-e,

Third Stats:
const int PWM_DB = 2;
int pwmLista[PWM_DB] = { 60, 80};
int BEALL_MS = 200;    // ennyi ideig gyorsul be a PWM-re
int MERES_MS = 250;    // ezen az ablakon merjuk a sebesseget

9:27:48 K3 -- PWM/sebesseg jelleggorbe. Kell kb. 2 m szabad hely!
9:27:48 Indulas 3 mp mulva, NE nyulj a robothoz.
9:27:51 --- ELORE ---
9:27:52 PWM 60 -> bal 698 imp/s, jobb 749 imp/s
9:27:52 PWM 80 -> bal 1244 imp/s, jobb 1260 imp/s
9:27:55 --- HATRA ---
9:27:55 PWM 60 -> bal 704 imp/s, jobb 696 imp/s
9:27:56 PWM 80 -> bal 1184 imp/s, jobb 1192 imp/s
9:27:56 =========== K3 EREDMENY ===========
9:27:56 --> KFF a tablazatba: { 0.00000, 0.00000 }
9:27:56 --> HOLTSAV (illesztett): { 0, 0 }
9:27:56 (hasonlitsd ossze a K0 holtsav-ertekeivel: 15 PWM-en belul legyenek!)
9:27:56 meg PWM 240-nel: 1184 imp/s a leglassabb kerek
9:27:56 --> VMAX_IMPS a tablazatba (65 %): 770
9:27:56 A show SOHA ne menjen ennel gyorsabban -- a maradek 35 % a PD-e,

After a certain speed the left wheel on this robot cannot keep up with the right thus it has less power.

**K4 — PD-hangolás és ellenőrzés**

10:01:56 K4 -- robot 1, teszt 1 (3 lepes)
10:01:56 KP=0.60 KD=0.020 KSYNC=0.30
10:01:56 Allitsd a kiindulasi jelre, aztan HATRA! Indulas 5 mp mulva.
10:01:56 5...
10:01:57 4...
10:01:58 3...
10:01:59 2...
10:02:00 1...
10:02:01 >>> INDUL <<<
10:02:02 t=1s lepes=0 v= 0 w= 0 hiba= 0/ 0
10:02:03 t=2s lepes=1 v=200 w= 0 hiba=80/300
10:02:04 t=3s lepes=1 v=200 w= 0 hiba=87/300
10:02:05 t=4s lepes=1 v=200 w= 0 hiba=86/300
10:02:06 t=5s lepes=1 v=200 w= 0 hiba=93/300
10:02:07 t=6s lepes=1 v=200 w= 0 hiba=90/300
10:02:08 t=7s lepes=1 v=200 w= 0 hiba=88/300
10:02:09 t=8s lepes=1 v=200 w= 0 hiba=88/300
10:02:10 t=9s lepes=1 v=200 w= 0 hiba=85/300
10:02:11 t=10s lepes=1 v=200 w= 0 hiba=86/300
10:02:12 t=11s lepes=1 v=200 w= 0 hiba=86/300
10:02:13 t=12s lepes=2 v= 0 w= 0 hiba=97/300
10:02:14 t=13s lepes=2 v= 0 w= 0 hiba=95/300
10:02:14 =========== K4 EREDMENY ===========
10:02:14 A robot ODA HITTE magat: x=16 mm y=-50 mm szog=3963 fok
10:02:14 legnagyobb kovetesi hiba menet kozben: 300 impulzus
10:02:14 -> nagy: emeld a PD_KP-t, vagy lassits (a motor telitesbe megy)
10:02:14 MERD MEG: mennyivel all OLDALRA a 2 m-es egyenestol? Cel: < 30 mm
10:02:14 tul nagy -> emeld a PD_KSYNC-et; ha mindig ugyanarra huz -> a K1 arany rossz
10:02:14 Ird be a robot_adatok.md ellenorzes-tablazataba!
10:02:14 ===================================

For some reason at these tests the left wheel doesnt or have very little power. The right overpowers it and for the Test 1 it just keeps spinning same goes for the 2nd test.
Just in case here is the code:
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

const int maximumPWM = 120;

// ============ 2. MERT ADATOK (ugyanaz, mint a show_robot.txt-ben!) ============
const float MM_PER_IMP[6][2] = {
  {0.67889, 0.68353}, {0.67889, 0.68353}, {0.67590, 0.68027},
  {0.67590, 0.68027}, {0.67499, 0.67958}, {0.67499, 0.67958}
};
const float NYOMTAV_MM[6] = { 153.0, 153.0, 153.0, 153.0, 153.0, 153.0 };
const int   HOLTSAV[6][2] = { {25,25}, {30,25}, {25,27}, {25,25}, {30,25}, {25,27} };
const float KFF[6][2] = {
  {0.04353, 0.04278}, {0.04353, 0.04278}, {0.05351, 0.04630},
  {0.05351, 0.04630}, {0.20000, 0.2000}, {0.20000, 0.20000}
};
const int   VMAX_IMPS[6] = { 600, 600, 600, 600, 600, 600 };
const float PD_KP[6]    = { 0.60, 0.60, 0.60, 0.60, 0.60, 0.60 };
const float PD_KD[6]    = { 0.02, 0.02, 0.02, 0.02, 0.02, 0.02 };
const float PD_KSYNC[6] = { 0.30, 0.30, 0.30, 0.30, 0.30, 0.30 };
const int ENC_ELOJEL[6][2] = { {1,1}, {1,1}, {1,1}, {1,1}, {1,1}, {1,1} };
const int MOT_ELOJEL[6][2] = { {1,1}, {1,1}, {1,1}, {1,1}, {1,1}, {1,1} };


// ============ 3. MELYIK TESZT FUSSON? ============
int TESZT = 2;      // <<<<<< 1 = egyenes 2 m,  2 = negyzet JOBBRA,  3 = negyzet BALRA


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

long encB() { return encBal  * ENC_ELOJEL[R][0]; }
long encJ() { return encJobb * ENC_ELOJEL[R][1]; }

int pwmSzamol(float u, int oldal) {
  if (u > -U_MIN && u < U_MIN) return 0;
  int   elojel  = (u > 0) ? 1 : -1;
  float nagysag = (u > 0) ? u : -u;
  int   p = HOLTSAV[R][oldal] + (int)(nagysag + 0.5);
  if (p > maximumPWM) p = maximumPWM;
  return elojel * p * MOT_ELOJEL[R][oldal];
}


// ============ 7. A KERET HIVJA: EGYSZER ============
void indulas() {
  motor(0, 0);
  enkoderNullaz();

  if (TESZT == 2)      { palya = TESZT2; palyaDb = sizeof(TESZT2) / sizeof(Lepes); }
  else if (TESZT == 3) { palya = TESZT3; palyaDb = sizeof(TESZT3) / sizeof(Lepes); }
  else                 { palya = TESZT1; palyaDb = sizeof(TESZT1) / sizeof(Lepes); }

  shAllapot = 0;
  armMs = millis();
  utolsoTick = armMs;
  utolsoVisszaszam = -1;
  maxHiba = 0;
  shCiklus = 0;

  uzenet("K4 -- robot " + String(ROBOT) + ", teszt " + String(TESZT)
         + " (" + String(palyaDb) + " lepes)");
  uzenet("KP=" + String(PD_KP[R], 2) + " KD=" + String(PD_KD[R], 3)
         + " KSYNC=" + String(PD_KSYNC[R], 2));
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
  if (hibaBal  >  HIBA_HATAR) { hibaBal  =  HIBA_HATAR; celBal  = (float)encB() + HIBA_HATAR; }
  if (hibaBal  < -HIBA_HATAR) { hibaBal  = -HIBA_HATAR; celBal  = (float)encB() - HIBA_HATAR; }
  if (hibaJobb >  HIBA_HATAR) { hibaJobb =  HIBA_HATAR; celJobb = (float)encJ() + HIBA_HATAR; }
  if (hibaJobb < -HIBA_HATAR) { hibaJobb = -HIBA_HATAR; celJobb = (float)encJ() - HIBA_HATAR; }

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
  float uBal  = KFF[R][0] * vBalImpS  + PD_KP[R] * hibaBal  + PD_KD[R] * dSzurtBal  + PD_KSYNC[R] * szinkron;
  float uJobb = KFF[R][1] * vJobbImpS + PD_KP[R] * hibaJobb + PD_KD[R] * dSzurtJobb - PD_KSYNC[R] * szinkron;

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
