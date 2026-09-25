# FINAL_SHOW — "Keringő" (5 robots, 156 s)

Generated 2026-09-22 by `node tools/final-show.js` from `koreografia/data/keringo-show.json` and
`koreografia/data/robots.json`. **Do not edit the sketches here by hand** — change the show JSON or
robots.json and re-run the tool; this file is the record of what is on the robots.

Placement, floor marks and the pre-show checklist: [`SHOW_PREPARATION.md`](SHOW_PREPARATION.md).

## The show

Field 4600 × 3000 mm, margin 250 mm, audience along y = 0. Coordinates in mm, heading in degrees (0° = +x, counter-clockwise; 90° = facing away from the audience, 270° = facing it).

- KERINGO -- elmeleti show ot robotra, 4,6 x 3 m padlora (a teszt-1m-3kor mezoje). 2026-09-21.
- Kozonseg az y=0 oldalon. Indulas: sor az y=600 vonalon (x = 900, 1650, 2300, 2950, 3700), mind a kozonsegnek hattal (theta 90, +Y).
- A negyzet kozepe (2300,1600), fel oldala 700: A=(1600,900) B=(3000,900) C=(3000,2300) D=(1600,2300).
- 1. felvonas NYITANY: egyutt elore; szetnyilas a negyzetre (3-as kozepre, 2/4 az elso, 1/5 a hatso sarokra); porges-hullam kozeprol kifele (3, majd 1+5, majd 2+4), vegul mind egyszerre ket kor.
- 2. felvonas KERINGO: a 3-as kozepen porog (3 kor balra, majd 3 kor jobbra), a masik negy az ora jarasaval ellentetesen kering korulotte, sarokrol sarokra; ket ugras = fel fordulat (mindenki az atellenes sarokra er). Egy ugras 1,4 m -- a (pesszimista) hibamodell miatt minden ugras utan jelre allas kell; ha a config.js ERROR_MODEL-t ujrakalibraljatok, a kozbulso anchorok kivehetok es a kering mehet egyben. A szunetek 1 mp-esek (kivansag szerint); az "anchor": true jelzo rajtuk marad, hogy a validator atengedje -- vagyis a modell ugy szamol, mintha a robotok minden szunetben pontosan a jelen allnanak.
- 3. felvonas FINALE: csillag (befele fordulnak, egy lepes a kozep fele, a 3-as porog), majd SORBA ALLAS ket lepesben (elobb az 5-os elore es a 2-es hatra, az 1-es es a 4-es a helye magassagaba all; aztan ezek oldalrol becsusznak): fuggoleges vonal x=2300-on, 342 mm kozeptavolsag (24 cm test + 10 cm hezag, +2 mm a 0,1 cm-es kvantalas miatt), elol az 5-os, hatul a 2-es, mind a kozonseg fele; a sor egyutt lep egyet a kozonseghez, zaro porges (szelek 2 kor, kozep 3 kor) a vonalban.
- 4. HAZATERES: a negy szelso oldalra kicsuszik a sorbol a sajat rajtoszlopaba (a 3-as marad), aztan mind az oten egyszerre hatramennek a rajtjelig es megfordulnak -- mindenki a kiindulo pozban (theta 90) all meg, a show ujraindithato a robotok erintese nelkul.
- Validator (2026-09-21): core/config.js MIN_GAP_MM 200 -> 100 es CLEARANCE_DRIFT_FACTOR 0 (a tavolsag-ellenorzes a tervezett testeket nezi, a sodrodast a DRIFT_CEILING figyeli).

### Beat table — planned pose of every robot at the END of each beat

| # | t | slot | beat | robot 1 | robot 2 | robot 3 | robot 4 | robot 5 |
|---|---|---|---|---|---|---|---|---|
| 1 | 0 s | 5 s | felvonulas | (900, 900) 90° | (1650, 900) 90° | (2300, 900) 90° | (2950, 900) 90° | (3700, 900) 90° |
| 2 | 5 s | 17 s | szetnyilas a negyzetre | (1601, 2299) 270° | (1600, 900) 0° | (2300, 1600) 90° | (3000, 900) 90° | (2999, 2299) 180° |
| 3 | 22 s | 5 s | hullam - kozep | (1601, 2299) 270° | (1600, 900) 0° | (2300, 1600) 90° | (3000, 900) 90° | (2999, 2299) 180° |
| 4 | 27 s | 5 s | hullam - hatso par | (1601, 2299) 270° | (1600, 900) 0° | (2300, 1600) 90° | (3000, 900) 90° | (2999, 2299) 180° |
| 5 | 32 s | 5 s | hullam - elso par | (1601, 2299) 270° | (1600, 900) 0° | (2300, 1600) 90° | (3000, 900) 90° | (2999, 2299) 180° |
| 6 | 37 s | 7.5 s | mind porog | (1601, 2299) 270° | (1600, 900) 0° | (2300, 1600) 90° | (3000, 900) 90° | (2999, 2299) 180° |
| 7 | 44.5 s | 1 s | **szunet 1** (break) | (1601, 2299) 270° | (1600, 900) 0° | (2300, 1600) 90° | (3000, 900) 90° | (2999, 2299) 180° |
| 8 | 45.5 s | 13 s | keringo 1 - kozep balra | (1601, 900) 0° | (3000, 900) 90° | (2300, 1600) 90° | (3000, 2300) 180° | (1600, 2299) 270° |
| 9 | 58.5 s | 1 s | **szunet 2** (break) | (1601, 900) 0° | (3000, 900) 90° | (2300, 1600) 90° | (3000, 2300) 180° | (1600, 2299) 270° |
| 10 | 59.5 s | 13 s | keringo 2 - kozep jobbra | (3000, 900) 90° | (3000, 2300) 180° | (2300, 1600) 90° | (1600, 2300) 270° | (1600, 900) 0° |
| 11 | 72.5 s | 1 s | **szunet 3** (break) | (3000, 900) 90° | (3000, 2300) 180° | (2300, 1600) 90° | (1600, 2300) 270° | (1600, 900) 0° |
| 12 | 73.5 s | 6 s | csillag - befele | (3000, 900) 135° | (3000, 2300) 225° | (2300, 1600) 90° | (1600, 2300) 315° | (1600, 900) 45° |
| 13 | 79.5 s | 6 s | csillag - egy lepes | (2823, 1077) 135° | (2823, 2123) 225° | (2300, 1600) 90° | (1777, 2123) 315° | (1777, 1077) 45° |
| 14 | 85.5 s | 11.5 s | sorba allas 1 - eleje, vege, beallas | (2823, 1258) 180° | (2300, 2284) 270° | (2300, 1600) 270° | (1777, 1942) 0° | (2300, 916) 270° |
| 15 | 97 s | 11.5 s | sorba allas 2 - a kozepe | (2300, 1258) 270° | (2300, 2284) 270° | (2300, 1600) 270° | (2300, 1942) 270° | (2300, 916) 270° |
| 16 | 108.5 s | 5 s | egy lepes a kozonseghez | (2300, 958) 270° | (2300, 1984) 270° | (2300, 1300) 270° | (2300, 1642) 270° | (2300, 616) 270° |
| 17 | 113.5 s | 9.5 s | zaro porges | (2300, 958) 270° | (2300, 1984) 270° | (2300, 1300) 270° | (2300, 1642) 270° | (2300, 616) 270° |
| 18 | 123 s | 1 s | **szunet 4** (break) | (2300, 958) 270° | (2300, 1984) 270° | (2300, 1300) 270° | (2300, 1642) 270° | (2300, 616) 270° |
| 19 | 124 s | 16 s | hazateres 1 - szetnyilik a sor | (900, 958) 270° | (1650, 1984) 270° | (2300, 1300) 270° | (2950, 1642) 270° | (3700, 616) 270° |
| 20 | 140 s | 1 s | **szunet 5** (break) | (900, 958) 270° | (1650, 1984) 270° | (2300, 1300) 270° | (2950, 1642) 270° | (3700, 616) 270° |
| 21 | 141 s | 13 s | hazateres 2 - egyutt a rajtjelre | (900, 600) 90° | (1650, 600) 90° | (2300, 600) 90° | (2950, 600) 90° | (3700, 600) 90° |
| 22 | 154 s | 2 s | vege | (900, 600) 90° | (1650, 600) 90° | (2300, 600) 90° | (2950, 600) 90° | (3700, 600) 90° |

Total 156 s. The five 1 s breaks carry `"anchor": true`: the validator restarts the error budget there, i.e. it assumes every robot is on its planned mark at that moment (see the caveat below).

## Validator settings this show was approved under

| setting | value | note |
|---|---|---|
| `MIN_GAP_MM` | 100 | planned gap between bodies; 200 before 2026-09-21 |
| `CLEARANCE_DRIFT_FACTOR` | 0 | 0 = clearance checks planned bodies only (drift not added); 1 = old expanded-disc rule |
| `ROBOT_RADIUS_MM` | 120 | column spacing 342 mm = 2 × 120 body + 100 gap + 2 quantisation |
| `DRIFT_CEILING_MM` | 300 | warning only |
| `ERROR_MODEL` | k_drive 0.1, k_turn 0.0185, k_head 0.003 | PROVISIONAL, pessimistic — recalibrate from the floor tests |

Result: 0 errors, 0 warnings.

**Caveat.** With the provisional error model a 1 s break cannot really reset drift (nobody re-places five robots in a
second); the show is approved on the floor results (robots 1–4 land on their encoder targets), not on the model.
Once `ERROR_MODEL` is recalibrated, re-run `node tools/build.js data/keringo-show.json` and see whether the breaks
can lose the `anchor` flag.

## Flashing

1. `cd koreografia && node tools/serve.js` → http://localhost:8080/ui/?show=../data/keringo-show.json
2. Connect every robot (header **Csatlakozás**; a reload auto-connects named robots).
3. For each robot: pick it in the header → **→ Kód fülre** → **Fordít + Feltölt** (Ctrl+Enter). The pasted sketch
   must be byte-identical to the one below for that robot — same show, same robots.json.
4. Place the robots (`SHOW_PREPARATION.md`), Műszerfal → **▶ Start mind**. **■ STOP** stops everyone.

CLI alternative: `node tools/build.js data/keringo-show.json out/` writes `out/SHOW_robot<N>.txt`, `node tools/firmware.js build <N> data/keringo-show.json` compiles it.

## Calibration in use (block 2)

| robot | measured | MM_PER_IMP_BAL | MM_PER_IMP_JOBB | PWM_PER_MMS | PWM_NULLA | NYOMTAV_MM | PORGES_TRIM | BAL_TRIM | PWM_MIN | PORGES_PWM | PORGES_TRIM_BAL | PORGES_TRIM_JOBB | PORGES_OFFSET_FOK | PORGES_LASSITAS_MM | FEK_ELLEN_PWM | TEMPO |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-09-13 | 0.34582 | 0.34392 | 0.145 | 9.3 | 148.3 | 1 | 0.996 | 35 | 0 | 1 | 1 | -14 | 0 | 0 | 1.5 |
| 2 | 2026-09-13 | 0.34582 | 0.34392 | 0.155 | 38 | 157 | 1.006 | 1.025 | 50 | 0 | 1 | 1 | -12 | 30 | 0 | 1.5 |
| 3 | 2026-09-14 | 0.34582 | 0.34392 | 0.145 | 9.3 | 152.5 | 1 | 0.996 | 45 | 0 | 0.991 | 1.01 | 0 | 0 | 0 | 1.5 |
| 4 | 2026-09-20 | 0.34582 | 0.34392 | 0.145 | 9.3 | 151.1 | 1 | 1.004 | 45 | 0 | 1 | 1 | 3 | 0 | 0 | 1.5 |
| 5 | 2026-09-21 | 0.34582 | 0.34392 | 0.145 | 26.5 | 158.6 | 0.987 | 1.006 | 45 | 0 | 1 | 1 | 6 | 0 | 60 | 1.5 |

## Sketches

The same sketches as plain files, one per robot, for the Kod tab's **Betoltes** button: `show/SHOW_robot1.txt`, `show/SHOW_robot2.txt`, `show/SHOW_robot3.txt`, `show/SHOW_robot4.txt`, `show/SHOW_robot5.txt`. **This markdown file is not a sketch** -- do not paste it into the Kod tab.

### Robot 1

```cpp
// =====================================================================
//  SHOW -- ROBOT 1   (v6)
//  Enkoderes koreografia vonal nelkul, kerekenkent szinkronizalva.
//
//  EZ A FAJL KET RESZBOL ALL:
//    2. blokk  = PER ROBOT mert adatok   -> robotonkent MAS
//    3. blokk  = KOZOS show-beallitasok  -> mind az ot roboton UGYANAZ
//  A tobbihez nem kell nyulni.
// =====================================================================
//
// ---------------------------------------------------------------------
//  A. HOGYAN MUKODIK
// ---------------------------------------------------------------------
//  Nincs vonal, tehat nincs kulso visszacsatolas. Ami maradt: a ket
//  enkoder. Minden mozgas egy impulzus-cel kerekenkent, es a mozgas()
//  ciklus 10 ms-onkent ujraszamolja a ket PWM-et.
//
//  KESZ = A KET KEREK EGYUTT: a mozgas akkor er veget, amikor a ket
//  enkoder OSSZEGE eleri a ket cel osszeget. Egyenesben ez a tavolsag,
//  porgesben ez a szog ((sB + sJ) / nyomtav) -- fuggetlenul attol,
//  melyik kerek mennyit vitt belole. A regi (v5) valtozat mindket
//  kereket kulon varta meg, es porgesben a hamarabb keszen levo kereket
//  a robot forgasa tovabb pergette: +900 impulzus, +90..120 fok.
//
//  SZINKRON: a ciklus azt nezi, a ket kerek hany SZAZALEKAN all a SAJAT
//  celjanak. Amelyik siet, kevesebb PWM-et kap, amelyik lemarad, tobbet.
//  Ettol megy egyenesen, es ettol marad helyben a porges.
//
//  LASSITAS + AKTIV FEK + UTANIGAZITAS: az utolso LASSITAS_MM-en a robot
//  LASSU_MM_S-sel kuszik, RAFUTAS_IMP-pel a cel elott lekapcsol, majd
//  ellen-PWM-mel fekez, amig a kerekek meg nem allnak (a puszta
//  motor(0,0) a TB6612-n keszenlet = szabadon gurulas). Ha az osszeg
//  igy is TURES_IMP-nel tobbel ter el, a ket kerek lassan behozza.
//
// ---------------------------------------------------------------------
//  B. SEBESSEG -- EGY SZAM, MIND AZ OT ROBOTRA
// ---------------------------------------------------------------------
//  A PWM robotonkent MAST jelent (mas motor, mas surlodas, mas akku).
//  Ezert a koreografia nem PWM-ben, hanem mm/s-ban all: SEBESSEG_MM_S.
//  Minden robot a SAJAT mert PWM/sebesseg egyenesevel szamolja at:
//
//        PWM = PWM_PER_MMS * v + PWM_NULLA
//
//  Igy eleg EGY helyen allitani a sebesseget, es mind az ot ugyanolyan
//  gyorsan megy. A ket atvalto szamot a T7_sebesseg.txt meri robotonkent.
//
// ---------------------------------------------------------------------
//  C. A NAPLOT IGY OLVASD
// ---------------------------------------------------------------------
//  Minden mozgas utan a naplo kiirja: cel bal/jobb -> bal=.. jobb=..
//  A KET SZAM OSSZEGE szamit: az legyen TURES_IMP-en belul a ket cel
//  osszegehez kepest. Porgesben a ket kerek kulon-kulon elterhet
//  (az elore halado kerek terheletlen, a hatra halado terhelt), ez nem
//  hiba, a szog az osszegbol jon.
//  Ha a robot a padlon MEGIS tobbet/kevesebbet fordul, mint a naplo
//  szerint kellene: PORGES_TRIM (2. blokk). Ha az egyenes hosszabb /
//  rovidebb: MM_PER_IMP (T1 tolasi teszt).
//
// ---------------------------------------------------------------------
//  D. AMI NEM JAVITHATO TOVABB
// ---------------------------------------------------------------------
//  Csuszas: a kerek elfordul, a robot megsem oda megy. Az enkoder ezt
//  elvileg sem latja. Nagysagrend: +-10 cm meterenkent, +-20 fok harom
//  porges utan, padlofuggoen. Ne tervezz 20 cm-nel kisebb hezagot ket
//  robot koze, es ne fuzz sok porgest egymas utan -- kulso referencia
//  nelkul a szoghiba osszeadodik.
//
//  Ha a robot ugyanazzal a kodddal futasrol futasra rosszabb lesz:
//  eloszor az AKKUT merd (V parancs), ne a szamokat allitsd.
// =====================================================================


// ============ 1. MELYIK ROBOT VAGYOK ============

#define ROBOT 1


// =====================================================================
//  2. PER ROBOT MERT ADATOK  --  ROBOTONKENT MAS
//     (a MERESI_MENET.md tablazatabol)
// =====================================================================

// --- T1 tolasi teszt + T5 hajtott egyenes ---
const float MM_PER_IMP_BAL  = 0.34582;
const float MM_PER_IMP_JOBB = 0.34392;

// --- T7 sebessegmeres: PWM = PWM_PER_MMS * v + PWM_NULLA ---
//     ELOZETES ertek a T2 D-fazisabol illesztve. Futtasd a T7-et
//     es ird felul -- ez a ket szam teszi egyformava az ot robotot.
const float PWM_PER_MMS = 0.14500;
const float PWM_NULLA   = 9.30;

// --- porges: HANGOLT szam, nem fizikai nyomtav (a csuszast is tartalmazza)
const float NYOMTAV_MM  = 148.3;
const float PORGES_TRIM = 1.000;   // tul sokat porog -> 0,985 | keveset -> 1,015

// --- egyenes futas arany-finomitasa (1,000 = nincs javitas)
//     farat BALRA tolja -> 0,996 | JOBBRA -> 1,004 | egy lepes ~4 mm/meter
const float BAL_TRIM = 0.996;

// --- holtsav (T2 C fazis): bal 20/40, jobb 25/20 -> a legrosszabb 40
const int PWM_MIN = 35;            // ez ala semmilyen szamitas nem viheti

// --- porges es fek finomhangolas (2026-09-21, robot 5). 0 / 1,00 = a
//     3. blokk kozos beallitasa ervenyes, a tobbi robot igy fut.
//     PORGES_PWM: >0 = ez a PWM az alap porgesben a PORGES_MM_S-bol
//     szamolt helyett. Nagyobb alap: a terhelt (hatra halado) kerek
//     azonnal kap nyomatekot, es a szinkronnak van hova levinnie a
//     sieto szabad kereket (a PWM_MIN alatt nem mehet).
const int PORGES_PWM = 0;
//     iranyfuggo trim a PORGES_TRIM-en FELUL: balra keveset fordul ->
//     _BAL 1,02 | jobbra sokat -> _JOBB 0,98. A naplo "cel" oszlopa a
//     trim NELKULI cel, az enkoder-osszeg a cel x trim koze all be.
const float PORGES_TRIM_BAL  = 1.000;
const float PORGES_TRIM_JOBB = 1.000;
//     PORGES_OFFSET_FOK: FIX fok, amit MINDEN porgesbol levonunk -- a
//     megallas (rafutas + fek alatti csuszas) minden porgesnel ugyanannyi
//     fokot ad hozza, a kicsiknel ez a fo hiba. 45 fok 8-cal tul -> 6.
const float PORGES_OFFSET_FOK = -14.0;
//     PORGES_LASSITAS_MM: a lassu szakasz hossza PORGESBEN (0 = a kozos
//     LASSITAS_MM). Egy 90 fokos fordulat 123 mm kerekenkent, azaz 100-as
//     lassitassal szinte vegig kuszas -- a terhelt kerek ott megall es
//     rangat (robot 2: 90/180 fok 10-15-tel rovid, a 720 pontos). 30-cal
//     a kis fordulat is sebesseggel megy, mint a nagy.
const float PORGES_LASSITAS_MM = 0.0;
//     FEK_ELLEN_PWM: >0 = FIX ellen-hajtas ennyi PWM-mel, amig a kerek
//     meg nem all (a sebessegaranyos FEK_PWM helyett). Erosebb, de a
//     lezart kereken a robot megcsuszhat -- padlon ellenorizd.
const int FEK_ELLEN_PWM = 0;
//     TEMPO: a 3. blokk SEBESSEG_MM_S / PORGES_MM_S szorzoja CSAK ezen a
//     roboton (1,0 = a kozos tempo). Probahoz: 1,5 = masfelszeres.
const float TEMPO = 1.50;


// =====================================================================
//  3. KOZOS SHOW-BEALLITASOK  --  MIND AZ OT ROBOTON UGYANAZ
// =====================================================================

const float SEBESSEG_MM_S = 300.0;   // egyenes haladas
const float PORGES_MM_S   = 300.0;   // a kerekek keruleti sebessege porgesben

const float SZINKRON       = 8.0;    // keresztcsatolas ereje
                                     //   billeg/rangat -> 4.0
                                     //   szetcsuszik   -> 12.0
const float LASSITAS_MM    = 100.0;  // ennyi kerek-mm-rel a cel elott mar
const float LASSU_MM_S     = 150.0;  //   csak ilyen lassan kuszik
const int   RAFUTAS_IMP    = 50;     // ennyi impulzussal a cel elott kapcsol
                                     //   le a hajtas: a fek alatt a ket kerek
                                     //   OSSZESEN kb. ennyit gurul meg
const int   FEK_PWM        = 60;     // aktiv fek: ellen-PWM, amig a kerek
const int   FEK_MAX_MS     = 400;    //   meg nem all, legfeljebb ennyi ms
const int   TURES_IMP      = 16;     // a ket kerek OSSZESEN ennyin belul kesz
const int   JAVITAS_MAX    = 2;      // legfeljebb ennyi utanigazitas
const int   INDULAS_MS     = 300;    // lagy inditas: ennyi ido alatt fut fel a
                                     //   PWM (allasbol ugorva a kerek kiporog)
const int   PWM_PLAFON     = 200;

const unsigned long IDOKORLAT = 20000;

const float SHOW_PI = 3.14159265;


// =====================================================================
//  4. A MOZGATO CIKLUS  --  INNENTOL NEM KELL ALLITANI
// =====================================================================

long imp_bal(float mm)  { return (long)(mm / MM_PER_IMP_BAL  + (mm < 0 ? -0.5 : 0.5)); }
long imp_jobb(float mm) { return (long)(mm / MM_PER_IMP_JOBB + (mm < 0 ? -0.5 : 0.5)); }

long abszolut(long x) { return (x < 0) ? -x : x; }

int hatarol(int v, int also, int felso) {
  if (v < also)  return also;
  if (v > felso) return felso;
  return v;
}

// mm/s -> PWM, a robot sajat mert egyenesevel (es sajat TEMPO-javal)
int pwm_sebessegbol(float mm_s) {
  int p = (int)(PWM_PER_MMS * mm_s * TEMPO + PWM_NULLA + 0.5);
  return hatarol(p, PWM_MIN, PWM_PLAFON);
}

//  Kerek-sebesseg: impulzus / 10 ms a kerek SAJAT iranyaban (+ = halad).
//  (8 imp/10 ms = 800 imp/s ~ 275 mm/s.)

//  AKTIV FEK: ellen-PWM a sebesseggel aranyosan (FEK_PWM 8 imp/10 ms
//  felett), es amint a kerek mar csak kuszik, rovidzar-fek: PWM 1 a
//  TB6612-n 99,6 % "short brake" -- a puszta motor(0,0) keszenlet, azaz
//  szabadon gurulas. Egy fix eros ellen-lokes a kereket megallitja, de a
//  robot tovabb csuszik rajta (2026-09-13: +32 imp a fek UTAN). Kesz, ha
//  mindket kerek 3 egymas utani mintaban allt; legfeljebb FEK_MAX_MS.
void fekez(int irB, int irJ) {
  long pB = encBal, pJ = encJobb;
  int allB = 0, allJ = 0;
  unsigned long t0 = millis();
  while (millis() - t0 < (unsigned long)FEK_MAX_MS) {
    varj(10);
    long nB = encBal, nJ = encJobb;
    long vB = (nB - pB) * irB, vJ = (nJ - pJ) * irJ;
    pB = nB; pJ = nJ;
    allB = (vB <= 1) ? allB + 1 : 0;
    allJ = (vJ <= 1) ? allJ + 1 : 0;
    if (allB >= 3 && allJ >= 3) break;
    int fB = (vB <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vB / 8), 1, FEK_PWM));
    int fJ = (vJ <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vJ / 8), 1, FEK_PWM));
    motor(-irB * fB, -irJ * fJ);
  }
  motor(0, 0);
}

//  cb, cj = elojeles impulzus-cel kerekenkent (+ = elore, - = hatra)
//
//  A mozgas akkor kesz, amikor a ket kerek EGYUTT tette meg a ket cel
//  OSSZEGET -- nem akkor, amikor kulon-kulon mindketto elerte a sajatjat.
//  Egyenesben az osszeg = 2x a tavolsag, porgesben az osszeg adja a
//  szoget ((sB + sJ) / nyomtav), fuggetlenul attol, hogy a ket kerek
//  hogyan osztozott rajta. Igy egyik kerek sem var a masikra hajtas
//  nelkul, es a robot forgasa nem pergeti tovabb (ez adta porgesben a
//  +900 impulzust az elore halado kereken: 2026-09-13-i telemetria).
//
//  TERHELES (lokes): a PWM_PER_MMS egyenes terheletlen kerekre igaz.
//  Porgesben a hatra halado kerek erosen terhelt (58 PWM-en megallt),
//  ezert a ciklus a ket kerek EGYUTTES sebesseget a celhoz meri, es
//  10 ms-onkent 1 PWM-mel emeli (lassu -> +) vagy csokkenti (gyors -> -)
//  a kozos ratartast. Ez a szonyeg / lemerult akku ellen is ved.
//
//  SZINKRON: a ket kerek a SAJAT celjanak hany szazalekan all; aki siet,
//  kevesebb PWM-et kap, aki lemarad, tobbet -- ettol megy egyenesen.
//  A korrekcio +-alap-ig mehet (nem alap/2-ig): porgesben az elore
//  halado kerek terheletlen, 50 vs 105 PWM mellett is az volt a gyorsabb.
//
//  Lefutas: lagy inditas (INDULAS_MS) -> teljes sebesseg -> az utolso LASSITAS_MM-en LASSU_MM_S-sel
//  kuszas (amelyik kerek gyorsabb ennel, az addig rovidzar-feket kap)
//  -> RAFUTAS_IMP-pel a cel elott hajtas le, aktiv fek -> ha az osszeg
//  TURES_IMP-nel tobbel ter el, utanigazitas (mindket kerek a hiba
//  felet), legfeljebb JAVITAS_MAX-szor.
void mozgas(long cb, long cj, int pwm) {
  long celB = abszolut(cb);
  long celJ = abszolut(cj);
  int  irB  = (cb >= 0) ? 1 : -1;
  int  irJ  = (cj >= 0) ? 1 : -1;

  // PORGES = a ket kerek ellentetes iranyba megy (porog_fok). Iranyfuggo
  // trim a celokon (bal kerek hatra = balra porges), es sajat PWM-alap.
  if (irB != irJ) {
    float trim = (cb < 0) ? PORGES_TRIM_BAL : PORGES_TRIM_JOBB;
    float offMm = SHOW_PI * NYOMTAV_MM * (PORGES_OFFSET_FOK / 360.0);   // kerekenkent
    celB = (long)(celB * trim + 0.5) - imp_bal(offMm);
    celJ = (long)(celJ * trim + 0.5) - imp_jobb(offMm);
    if (celB < 0) celB = 0;
    if (celJ < 0) celJ = 0;
    if (PORGES_PWM > 0) pwm = hatarol(PORGES_PWM, PWM_MIN, PWM_PLAFON);
  }
  long celOssz = celB + celJ;

  if (celOssz < 1) { enkoderNullaz(); return; }   // a naplo 0/0-t mutasson, ne a regit

  // a lassu szakasz hossza az OSSZEG terben (mindket kerek LASSITAS_MM-je;
  // porgesben a robot sajat PORGES_LASSITAS_MM-je, ha van)
  float lassMm = (irB != irJ && PORGES_LASSITAS_MM > 0) ? PORGES_LASSITAS_MM : LASSITAS_MM;
  long lassuImp = imp_bal(lassMm) + imp_jobb(lassMm);
  // cel-sebessegek kerekenkent, imp / 10 ms
  float mmPerImp = (MM_PER_IMP_BAL + MM_PER_IMP_JOBB) * 0.5;
  float vCel   = (float)(pwm - PWM_NULLA) / PWM_PER_MMS / mmPerImp / 100.0;
  float vLassu = LASSU_MM_S / mmPerImp / 100.0;
  if (vCel < vLassu) vCel = vLassu;

  enkoderNullaz();
  unsigned long t0 = millis();
  long pB = 0, pJ = 0;
  int  lokes = 0;

  while (true) {
    long eB = encBal * irB;           // haladas a SAJAT iranyban (+)
    long eJ = encJobb * irJ;
    long vB = eB - pB, vJ = eJ - pJ;  // imp / 10 ms
    pB = eB; pJ = eJ;
    long ossz = eB + eJ;
    long hatra = celOssz - ossz;

    if (hatra <= RAFUTAS_IMP) break;
    if (millis() - t0 > IDOKORLAT) {
      uzenet("!!! idokorlat -- a mozgas nem fejezodott be");
      break;
    }

    bool lassu = (hatra <= lassuImp);
    float vKell = lassu ? vLassu : vCel;
    int   alapNyers = lassu ? PWM_MIN : pwm;

    // lagy inditas: az elso INDULAS_MS alatt a PWM egyenletesen fut fel
    unsigned long eltelt = millis() - t0;
    bool indul = eltelt < (unsigned long)INDULAS_MS;
    if (indul) alapNyers = PWM_MIN + (int)((long)(alapNyers - PWM_MIN) * (long)eltelt / INDULAS_MS);

    // kozos terheles-ratartas a ket kerek egyuttes sebessege alapjan
    // (felfutas alatt nem tanul: akkor meg szandekosan lassu)
    float vVan = (float)(vB + vJ) * 0.5;
    if (indul) { /* tart */ }
    else if (vVan < vKell * 0.9 && alapNyers + lokes < PWM_PLAFON) lokes++;
    else if (vVan > vKell * 1.1 && lokes > 0) lokes--;
    int alap = hatarol(alapNyers + lokes, PWM_MIN, PWM_PLAFON);

    // hol tart a ket kerek a SAJAT celjahoz kepest (0..1)
    float fB = (celB < 1) ? 1.0 : (float)eB / (float)celB;
    float fJ = (celJ < 1) ? 1.0 : (float)eJ / (float)celJ;

    // + = a bal siet -> a bal kap kevesebbet, a jobb tobbet
    float hiba = fB - fJ;
    int   korr = hatarol((int)(SZINKRON * hiba * (float)alap), -alap, alap);

    int pwmB = (celB < 1) ? 0 : hatarol(alap - korr, PWM_MIN, PWM_PLAFON);
    int pwmJ = (celJ < 1) ? 0 : hatarol(alap + korr, PWM_MIN, PWM_PLAFON);

    // lassu szakasz: amelyik kerek meg gyorsabb a kuszasnal, rovidzar-fek
    if (lassu && vB > vLassu * 1.2) pwmB = 1;
    if (lassu && vJ > vLassu * 1.2) pwmJ = 1;

    motor(irB * pwmB, irJ * pwmJ);
    varj(10);
  }

  fekez(irB, irJ);
  varj(100);

  // UTANIGAZITAS: az osszeg hibajat a ket kerek felezve hozza be.
  // 5 ms-os ciklus, a kuszas felevel (bang-bang: aki gyorsabb, rovidzar-
  // fek), es egy mintaval ELORE all meg (a kerek allasbol ugorva indul).
  for (int k = 0; k < JAVITAS_MAX; k++) {
    long hiba = celOssz - (encBal * irB + encJobb * irJ);   // + = keves, - = tul sok
    if (abszolut(hiba) <= TURES_IMP) break;
    int   d    = (hiba > 0) ? 1 : -1;
    long  celK = abszolut(hiba) / 2;
    float vKuszo = vLassu * 0.5 * 0.5;                    // imp / 5 ms
    long  sB = encBal, sJ = encJobb;
    long  qB = 0, qJ = 0;
    int   p = PWM_MIN;
    unsigned long t1 = millis();
    while (millis() - t1 < 1500) {
      long mB = (encBal - sB) * irB * d, mJ = (encJobb - sJ) * irJ * d;
      long vB = mB - qB, vJ = mJ - qJ;
      qB = mB; qJ = mJ;
      bool keszB = mB + vB >= celK, keszJ = mJ + vJ >= celK;
      if (keszB && keszJ) break;
      if (vB + vJ == 0 && p < PWM_PLAFON) p++;              // holtsav: emeljuk, amig megindul
      int pB = keszB ? 1 : (vB > vKuszo ? 1 : p);
      int pJ = keszJ ? 1 : (vJ > vKuszo ? 1 : p);
      motor(irB * d * pB, irJ * d * pJ);
      varj(5);
    }
    fekez(irB * d, irJ * d);
    varj(100);
  }

  motor(0, 0);
  varj(200);
}


// =====================================================================
//  5. A MOZGAS-KESZLET  --  ezeket hivod a koreografiaban
// =====================================================================

unsigned long lepesStart = 0;
void lepes_kezd() { lepesStart = millis(); }

// kitolti a lepes idokeretet -- ettol marad szinkronban az ot robot
void lepes_var(unsigned long ido) {
  motor(0, 0);
  while (millis() - lepesStart < ido) varj(20);
}

void megy_cm(float cm) {
  float mm = cm * 10.0;
  long cb = imp_bal(mm * BAL_TRIM), cj = imp_jobb(mm);
  mozgas(cb, cj, pwm_sebessegbol(SEBESSEG_MM_S));
  uzenet("megy " + String(cm, 0) + " cm | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

// + = JOBBRA (oramutato szerint), - = BALRA. Helyben porges.
void porog_fok(float fok) {
  float ivMm = SHOW_PI * NYOMTAV_MM * PORGES_TRIM * (fok / 360.0);
  long cb = imp_bal(ivMm), cj = -imp_jobb(ivMm);
  mozgas(cb, cj, pwm_sebessegbol(PORGES_MM_S));
  uzenet("porog " + String(fok, 0) + " fok | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

void elore_cm(float cm)  { megy_cm(+cm); }
void hatra_cm(float cm)  { megy_cm(-cm); }
void balra_fok(float f)  { porog_fok(-f); }
void jobbra_fok(float f) { porog_fok(+f); }
void balra_kor(float k)  { porog_fok(-360.0 * k); }
void jobbra_kor(float k) { porog_fok(+360.0 * k); }


// =====================================================================
//  6. A KOREOGRAFIA  --  EZT IRD AT (mind az ot roboton UGYANAZ a lista)
// =====================================================================
//
//  Minta:  lepes_kezd();  <mozgas>;  lepes_var(<ezredmasodperc>);
//
//  Az idot a LEGLASSABB robothoz meretezd: a tobbi allva varja ki a
//  maradekot, es igy mind egyszerre lep tovabb. Enelkul a show nehany
//  lepes utan szetcsuszik IDOBEN, akkor is, ha pozicioban mind pontos.

void koreografia() {

  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [1 felvonulas] -> (900, 900) 90.0 deg  r=45 mm
  lepes_kezd();                                            // [2 szetnyilas a negyzetre] 3 moves in 17000 ms
                 jobbra_fok(26.6);                         // [2 szetnyilas a negyzetre] -> (900, 900) 63.4 deg  r=45 mm
                 elore_cm(156.5);                          // [2 szetnyilas a negyzetre] -> (1601, 2299) 63.4 deg  r=267 mm
                 jobbra_fok(153.4);                        // [2 szetnyilas a negyzetre] -> (1601, 2299) -90.0 deg  r=267 mm
                                       lepes_var(17000);   // [2 szetnyilas a negyzetre] end
  lepes_kezd();                        lepes_var(5000);    // [3 hullam - kozep] hold -> (1601, 2299) -90.0 deg  r=267 mm
  lepes_kezd();  jobbra_fok(360.0);    lepes_var(5000);    // [4 hullam - hatso par] -> (1601, 2299) -90.0 deg  r=267 mm
  lepes_kezd();                        lepes_var(5000);    // [5 hullam - elso par] hold -> (1601, 2299) -90.0 deg  r=267 mm
  lepes_kezd();  balra_fok(720.0);     lepes_var(7500);    // [6 mind porog] -> (1601, 2299) -90.0 deg  r=267 mm
  lepes_kezd();                        lepes_var(1000);    // [7 szunet 1] ANCHOR: re-place the robot on its mark by hand -> (1601, 2299) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [8 keringo 1 - kozep balra] 2 moves in 13000 ms
                 elore_cm(139.9);                          // [8 keringo 1 - kozep balra] -> (1601, 900) -90.0 deg  r=174 mm
                 balra_fok(90.0);                          // [8 keringo 1 - kozep balra] -> (1601, 900) 0.0 deg  r=174 mm
                                       lepes_var(13000);   // [8 keringo 1 - kozep balra] end
  lepes_kezd();                        lepes_var(1000);    // [9 szunet 2] ANCHOR: re-place the robot on its mark by hand -> (1601, 900) 0.0 deg  r=10 mm
  lepes_kezd();                                            // [10 keringo 2 - kozep jobbra] 2 moves in 13000 ms
                 elore_cm(139.9);                          // [10 keringo 2 - kozep jobbra] -> (3000, 900) 0.0 deg  r=174 mm
                 balra_fok(90.0);                          // [10 keringo 2 - kozep jobbra] -> (3000, 900) 90.0 deg  r=174 mm
                                       lepes_var(13000);   // [10 keringo 2 - kozep jobbra] end
  lepes_kezd();                        lepes_var(1000);    // [11 szunet 3] ANCHOR: re-place the robot on its mark by hand -> (3000, 900) 90.0 deg  r=10 mm
  lepes_kezd();  balra_fok(45.0);      lepes_var(6000);    // [12 csillag - befele] -> (3000, 900) 135.0 deg  r=10 mm
  lepes_kezd();  elore_cm(25.0);       lepes_var(6000);    // [13 csillag - egy lepes] -> (2823, 1077) 135.0 deg  r=43 mm
  lepes_kezd();                                            // [14 sorba allas 1 - eleje, vege, beallas] 3 moves in 11500 ms
                 jobbra_fok(45.0);                         // [14 sorba allas 1 - eleje, vege, beallas] -> (2823, 1077) 90.0 deg  r=43 mm
                 elore_cm(18.1);                           // [14 sorba allas 1 - eleje, vege, beallas] -> (2823, 1258) 90.0 deg  r=72 mm
                 balra_fok(90.0);                          // [14 sorba allas 1 - eleje, vege, beallas] -> (2823, 1258) 180.0 deg  r=72 mm
                                       lepes_var(11500);   // [14 sorba allas 1 - eleje, vege, beallas] end
  lepes_kezd();                                            // [15 sorba allas 2 - a kozepe] 2 moves in 11500 ms
                 elore_cm(52.3);                           // [15 sorba allas 2 - a kozepe] -> (2300, 1258) 180.0 deg  r=176 mm
                 balra_fok(90.0);                          // [15 sorba allas 2 - a kozepe] -> (2300, 1258) -90.0 deg  r=176 mm
                                       lepes_var(11500);   // [15 sorba allas 2 - a kozepe] end
  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [16 egy lepes a kozonseghez] -> (2300, 958) -90.0 deg  r=253 mm
  lepes_kezd();  jobbra_fok(720.0);    lepes_var(9500);    // [17 zaro porges] -> (2300, 958) -90.0 deg  r=253 mm
  lepes_kezd();                        lepes_var(1000);    // [18 szunet 4] ANCHOR: re-place the robot on its mark by hand -> (2300, 958) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [19 hazateres 1 - szetnyilik a sor] 3 moves in 16000 ms
                 jobbra_fok(90.0);                         // [19 hazateres 1 - szetnyilik a sor] -> (2300, 958) 180.0 deg  r=10 mm
                 elore_cm(140.0);                          // [19 hazateres 1 - szetnyilik a sor] -> (900, 958) 180.0 deg  r=215 mm
                 balra_fok(90.0);                          // [19 hazateres 1 - szetnyilik a sor] -> (900, 958) -90.0 deg  r=215 mm
                                       lepes_var(16000);   // [19 hazateres 1 - szetnyilik a sor] end
  lepes_kezd();                        lepes_var(1000);    // [20 szunet 5] ANCHOR: re-place the robot on its mark by hand -> (900, 958) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [21 hazateres 2 - egyutt a rajtjelre] 2 moves in 13000 ms
                 elore_cm(35.8);                           // [21 hazateres 2 - egyutt a rajtjelre] -> (900, 600) -90.0 deg  r=52 mm
                 balra_fok(180.0);                         // [21 hazateres 2 - egyutt a rajtjelre] -> (900, 600) 90.0 deg  r=52 mm
                                       lepes_var(13000);   // [21 hazateres 2 - egyutt a rajtjelre] end
  lepes_kezd();                        lepes_var(2000);    // [22 vege] hold -> (900, 600) 90.0 deg  r=52 mm

}


// =====================================================================
//  7. INDITAS
// =====================================================================

void indulas() {
  motor(0, 0);
  uzenet("=== SHOW v6 -- robot " + String(ROBOT) + " ===");
  uzenet("sebesseg " + String(SEBESSEG_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(pwm_sebessegbol(SEBESSEG_MM_S))
         + " | porges " + String(PORGES_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(PORGES_PWM > 0 ? PORGES_PWM : pwm_sebessegbol(PORGES_MM_S))
         + " | lassu " + String(LASSU_MM_S, 0) + " mm/s | tempo x" + String(TEMPO, 2)
         + " | fek " + String(FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : FEK_PWM)
         + (FEK_ELLEN_PWM > 0 ? " fix" : " aranyos"));
  uzenet("nyomtav " + String(NYOMTAV_MM, 1) + " | szinkron "
         + String(SZINKRON, 1) + " | lassitas " + String(LASSITAS_MM, 0)
         + " mm | rafutas " + String(RAFUTAS_IMP) + " imp | fek PWM "
         + String(FEK_PWM) + " | tures " + String(TURES_IMP) + " imp");
  uzenet("Indulas 3 mp mulva.");
  varj(3000);

  koreografia();

  motor(0, 0);
  uzenet("=========== SHOW VEGE ===========");
}


// =====================================================================
//  8. VEZERLES
// =====================================================================

void vezerles() {
  motor(0, 0);      // a koreografia az indulas()-ban fut le
}
```

### Robot 2

```cpp
// =====================================================================
//  SHOW -- ROBOT 2   (v6)
//  Enkoderes koreografia vonal nelkul, kerekenkent szinkronizalva.
//
//  EZ A FAJL KET RESZBOL ALL:
//    2. blokk  = PER ROBOT mert adatok   -> robotonkent MAS
//    3. blokk  = KOZOS show-beallitasok  -> mind az ot roboton UGYANAZ
//  A tobbihez nem kell nyulni.
// =====================================================================
//
// ---------------------------------------------------------------------
//  A. HOGYAN MUKODIK
// ---------------------------------------------------------------------
//  Nincs vonal, tehat nincs kulso visszacsatolas. Ami maradt: a ket
//  enkoder. Minden mozgas egy impulzus-cel kerekenkent, es a mozgas()
//  ciklus 10 ms-onkent ujraszamolja a ket PWM-et.
//
//  KESZ = A KET KEREK EGYUTT: a mozgas akkor er veget, amikor a ket
//  enkoder OSSZEGE eleri a ket cel osszeget. Egyenesben ez a tavolsag,
//  porgesben ez a szog ((sB + sJ) / nyomtav) -- fuggetlenul attol,
//  melyik kerek mennyit vitt belole. A regi (v5) valtozat mindket
//  kereket kulon varta meg, es porgesben a hamarabb keszen levo kereket
//  a robot forgasa tovabb pergette: +900 impulzus, +90..120 fok.
//
//  SZINKRON: a ciklus azt nezi, a ket kerek hany SZAZALEKAN all a SAJAT
//  celjanak. Amelyik siet, kevesebb PWM-et kap, amelyik lemarad, tobbet.
//  Ettol megy egyenesen, es ettol marad helyben a porges.
//
//  LASSITAS + AKTIV FEK + UTANIGAZITAS: az utolso LASSITAS_MM-en a robot
//  LASSU_MM_S-sel kuszik, RAFUTAS_IMP-pel a cel elott lekapcsol, majd
//  ellen-PWM-mel fekez, amig a kerekek meg nem allnak (a puszta
//  motor(0,0) a TB6612-n keszenlet = szabadon gurulas). Ha az osszeg
//  igy is TURES_IMP-nel tobbel ter el, a ket kerek lassan behozza.
//
// ---------------------------------------------------------------------
//  B. SEBESSEG -- EGY SZAM, MIND AZ OT ROBOTRA
// ---------------------------------------------------------------------
//  A PWM robotonkent MAST jelent (mas motor, mas surlodas, mas akku).
//  Ezert a koreografia nem PWM-ben, hanem mm/s-ban all: SEBESSEG_MM_S.
//  Minden robot a SAJAT mert PWM/sebesseg egyenesevel szamolja at:
//
//        PWM = PWM_PER_MMS * v + PWM_NULLA
//
//  Igy eleg EGY helyen allitani a sebesseget, es mind az ot ugyanolyan
//  gyorsan megy. A ket atvalto szamot a T7_sebesseg.txt meri robotonkent.
//
// ---------------------------------------------------------------------
//  C. A NAPLOT IGY OLVASD
// ---------------------------------------------------------------------
//  Minden mozgas utan a naplo kiirja: cel bal/jobb -> bal=.. jobb=..
//  A KET SZAM OSSZEGE szamit: az legyen TURES_IMP-en belul a ket cel
//  osszegehez kepest. Porgesben a ket kerek kulon-kulon elterhet
//  (az elore halado kerek terheletlen, a hatra halado terhelt), ez nem
//  hiba, a szog az osszegbol jon.
//  Ha a robot a padlon MEGIS tobbet/kevesebbet fordul, mint a naplo
//  szerint kellene: PORGES_TRIM (2. blokk). Ha az egyenes hosszabb /
//  rovidebb: MM_PER_IMP (T1 tolasi teszt).
//
// ---------------------------------------------------------------------
//  D. AMI NEM JAVITHATO TOVABB
// ---------------------------------------------------------------------
//  Csuszas: a kerek elfordul, a robot megsem oda megy. Az enkoder ezt
//  elvileg sem latja. Nagysagrend: +-10 cm meterenkent, +-20 fok harom
//  porges utan, padlofuggoen. Ne tervezz 20 cm-nel kisebb hezagot ket
//  robot koze, es ne fuzz sok porgest egymas utan -- kulso referencia
//  nelkul a szoghiba osszeadodik.
//
//  Ha a robot ugyanazzal a kodddal futasrol futasra rosszabb lesz:
//  eloszor az AKKUT merd (V parancs), ne a szamokat allitsd.
// =====================================================================


// ============ 1. MELYIK ROBOT VAGYOK ============

#define ROBOT 2


// =====================================================================
//  2. PER ROBOT MERT ADATOK  --  ROBOTONKENT MAS
//     (a MERESI_MENET.md tablazatabol)
// =====================================================================

// --- T1 tolasi teszt + T5 hajtott egyenes ---
const float MM_PER_IMP_BAL  = 0.34582;
const float MM_PER_IMP_JOBB = 0.34392;

// --- T7 sebessegmeres: PWM = PWM_PER_MMS * v + PWM_NULLA ---
//     ELOZETES ertek a T2 D-fazisabol illesztve. Futtasd a T7-et
//     es ird felul -- ez a ket szam teszi egyformava az ot robotot.
const float PWM_PER_MMS = 0.15500;
const float PWM_NULLA   = 38.00;

// --- porges: HANGOLT szam, nem fizikai nyomtav (a csuszast is tartalmazza)
const float NYOMTAV_MM  = 157.0;
const float PORGES_TRIM = 1.006;   // tul sokat porog -> 0,985 | keveset -> 1,015

// --- egyenes futas arany-finomitasa (1,000 = nincs javitas)
//     farat BALRA tolja -> 0,996 | JOBBRA -> 1,004 | egy lepes ~4 mm/meter
const float BAL_TRIM = 1.025;

// --- holtsav (T2 C fazis): bal 20/40, jobb 25/20 -> a legrosszabb 40
const int PWM_MIN = 50;            // ez ala semmilyen szamitas nem viheti

// --- porges es fek finomhangolas (2026-09-21, robot 5). 0 / 1,00 = a
//     3. blokk kozos beallitasa ervenyes, a tobbi robot igy fut.
//     PORGES_PWM: >0 = ez a PWM az alap porgesben a PORGES_MM_S-bol
//     szamolt helyett. Nagyobb alap: a terhelt (hatra halado) kerek
//     azonnal kap nyomatekot, es a szinkronnak van hova levinnie a
//     sieto szabad kereket (a PWM_MIN alatt nem mehet).
const int PORGES_PWM = 0;
//     iranyfuggo trim a PORGES_TRIM-en FELUL: balra keveset fordul ->
//     _BAL 1,02 | jobbra sokat -> _JOBB 0,98. A naplo "cel" oszlopa a
//     trim NELKULI cel, az enkoder-osszeg a cel x trim koze all be.
const float PORGES_TRIM_BAL  = 1.000;
const float PORGES_TRIM_JOBB = 1.000;
//     PORGES_OFFSET_FOK: FIX fok, amit MINDEN porgesbol levonunk -- a
//     megallas (rafutas + fek alatti csuszas) minden porgesnel ugyanannyi
//     fokot ad hozza, a kicsiknel ez a fo hiba. 45 fok 8-cal tul -> 6.
const float PORGES_OFFSET_FOK = -12.0;
//     PORGES_LASSITAS_MM: a lassu szakasz hossza PORGESBEN (0 = a kozos
//     LASSITAS_MM). Egy 90 fokos fordulat 123 mm kerekenkent, azaz 100-as
//     lassitassal szinte vegig kuszas -- a terhelt kerek ott megall es
//     rangat (robot 2: 90/180 fok 10-15-tel rovid, a 720 pontos). 30-cal
//     a kis fordulat is sebesseggel megy, mint a nagy.
const float PORGES_LASSITAS_MM = 30.0;
//     FEK_ELLEN_PWM: >0 = FIX ellen-hajtas ennyi PWM-mel, amig a kerek
//     meg nem all (a sebessegaranyos FEK_PWM helyett). Erosebb, de a
//     lezart kereken a robot megcsuszhat -- padlon ellenorizd.
const int FEK_ELLEN_PWM = 0;
//     TEMPO: a 3. blokk SEBESSEG_MM_S / PORGES_MM_S szorzoja CSAK ezen a
//     roboton (1,0 = a kozos tempo). Probahoz: 1,5 = masfelszeres.
const float TEMPO = 1.50;


// =====================================================================
//  3. KOZOS SHOW-BEALLITASOK  --  MIND AZ OT ROBOTON UGYANAZ
// =====================================================================

const float SEBESSEG_MM_S = 300.0;   // egyenes haladas
const float PORGES_MM_S   = 300.0;   // a kerekek keruleti sebessege porgesben

const float SZINKRON       = 8.0;    // keresztcsatolas ereje
                                     //   billeg/rangat -> 4.0
                                     //   szetcsuszik   -> 12.0
const float LASSITAS_MM    = 100.0;  // ennyi kerek-mm-rel a cel elott mar
const float LASSU_MM_S     = 150.0;  //   csak ilyen lassan kuszik
const int   RAFUTAS_IMP    = 50;     // ennyi impulzussal a cel elott kapcsol
                                     //   le a hajtas: a fek alatt a ket kerek
                                     //   OSSZESEN kb. ennyit gurul meg
const int   FEK_PWM        = 60;     // aktiv fek: ellen-PWM, amig a kerek
const int   FEK_MAX_MS     = 400;    //   meg nem all, legfeljebb ennyi ms
const int   TURES_IMP      = 16;     // a ket kerek OSSZESEN ennyin belul kesz
const int   JAVITAS_MAX    = 2;      // legfeljebb ennyi utanigazitas
const int   INDULAS_MS     = 300;    // lagy inditas: ennyi ido alatt fut fel a
                                     //   PWM (allasbol ugorva a kerek kiporog)
const int   PWM_PLAFON     = 200;

const unsigned long IDOKORLAT = 20000;

const float SHOW_PI = 3.14159265;


// =====================================================================
//  4. A MOZGATO CIKLUS  --  INNENTOL NEM KELL ALLITANI
// =====================================================================

long imp_bal(float mm)  { return (long)(mm / MM_PER_IMP_BAL  + (mm < 0 ? -0.5 : 0.5)); }
long imp_jobb(float mm) { return (long)(mm / MM_PER_IMP_JOBB + (mm < 0 ? -0.5 : 0.5)); }

long abszolut(long x) { return (x < 0) ? -x : x; }

int hatarol(int v, int also, int felso) {
  if (v < also)  return also;
  if (v > felso) return felso;
  return v;
}

// mm/s -> PWM, a robot sajat mert egyenesevel (es sajat TEMPO-javal)
int pwm_sebessegbol(float mm_s) {
  int p = (int)(PWM_PER_MMS * mm_s * TEMPO + PWM_NULLA + 0.5);
  return hatarol(p, PWM_MIN, PWM_PLAFON);
}

//  Kerek-sebesseg: impulzus / 10 ms a kerek SAJAT iranyaban (+ = halad).
//  (8 imp/10 ms = 800 imp/s ~ 275 mm/s.)

//  AKTIV FEK: ellen-PWM a sebesseggel aranyosan (FEK_PWM 8 imp/10 ms
//  felett), es amint a kerek mar csak kuszik, rovidzar-fek: PWM 1 a
//  TB6612-n 99,6 % "short brake" -- a puszta motor(0,0) keszenlet, azaz
//  szabadon gurulas. Egy fix eros ellen-lokes a kereket megallitja, de a
//  robot tovabb csuszik rajta (2026-09-13: +32 imp a fek UTAN). Kesz, ha
//  mindket kerek 3 egymas utani mintaban allt; legfeljebb FEK_MAX_MS.
void fekez(int irB, int irJ) {
  long pB = encBal, pJ = encJobb;
  int allB = 0, allJ = 0;
  unsigned long t0 = millis();
  while (millis() - t0 < (unsigned long)FEK_MAX_MS) {
    varj(10);
    long nB = encBal, nJ = encJobb;
    long vB = (nB - pB) * irB, vJ = (nJ - pJ) * irJ;
    pB = nB; pJ = nJ;
    allB = (vB <= 1) ? allB + 1 : 0;
    allJ = (vJ <= 1) ? allJ + 1 : 0;
    if (allB >= 3 && allJ >= 3) break;
    int fB = (vB <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vB / 8), 1, FEK_PWM));
    int fJ = (vJ <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vJ / 8), 1, FEK_PWM));
    motor(-irB * fB, -irJ * fJ);
  }
  motor(0, 0);
}

//  cb, cj = elojeles impulzus-cel kerekenkent (+ = elore, - = hatra)
//
//  A mozgas akkor kesz, amikor a ket kerek EGYUTT tette meg a ket cel
//  OSSZEGET -- nem akkor, amikor kulon-kulon mindketto elerte a sajatjat.
//  Egyenesben az osszeg = 2x a tavolsag, porgesben az osszeg adja a
//  szoget ((sB + sJ) / nyomtav), fuggetlenul attol, hogy a ket kerek
//  hogyan osztozott rajta. Igy egyik kerek sem var a masikra hajtas
//  nelkul, es a robot forgasa nem pergeti tovabb (ez adta porgesben a
//  +900 impulzust az elore halado kereken: 2026-09-13-i telemetria).
//
//  TERHELES (lokes): a PWM_PER_MMS egyenes terheletlen kerekre igaz.
//  Porgesben a hatra halado kerek erosen terhelt (58 PWM-en megallt),
//  ezert a ciklus a ket kerek EGYUTTES sebesseget a celhoz meri, es
//  10 ms-onkent 1 PWM-mel emeli (lassu -> +) vagy csokkenti (gyors -> -)
//  a kozos ratartast. Ez a szonyeg / lemerult akku ellen is ved.
//
//  SZINKRON: a ket kerek a SAJAT celjanak hany szazalekan all; aki siet,
//  kevesebb PWM-et kap, aki lemarad, tobbet -- ettol megy egyenesen.
//  A korrekcio +-alap-ig mehet (nem alap/2-ig): porgesben az elore
//  halado kerek terheletlen, 50 vs 105 PWM mellett is az volt a gyorsabb.
//
//  Lefutas: lagy inditas (INDULAS_MS) -> teljes sebesseg -> az utolso LASSITAS_MM-en LASSU_MM_S-sel
//  kuszas (amelyik kerek gyorsabb ennel, az addig rovidzar-feket kap)
//  -> RAFUTAS_IMP-pel a cel elott hajtas le, aktiv fek -> ha az osszeg
//  TURES_IMP-nel tobbel ter el, utanigazitas (mindket kerek a hiba
//  felet), legfeljebb JAVITAS_MAX-szor.
void mozgas(long cb, long cj, int pwm) {
  long celB = abszolut(cb);
  long celJ = abszolut(cj);
  int  irB  = (cb >= 0) ? 1 : -1;
  int  irJ  = (cj >= 0) ? 1 : -1;

  // PORGES = a ket kerek ellentetes iranyba megy (porog_fok). Iranyfuggo
  // trim a celokon (bal kerek hatra = balra porges), es sajat PWM-alap.
  if (irB != irJ) {
    float trim = (cb < 0) ? PORGES_TRIM_BAL : PORGES_TRIM_JOBB;
    float offMm = SHOW_PI * NYOMTAV_MM * (PORGES_OFFSET_FOK / 360.0);   // kerekenkent
    celB = (long)(celB * trim + 0.5) - imp_bal(offMm);
    celJ = (long)(celJ * trim + 0.5) - imp_jobb(offMm);
    if (celB < 0) celB = 0;
    if (celJ < 0) celJ = 0;
    if (PORGES_PWM > 0) pwm = hatarol(PORGES_PWM, PWM_MIN, PWM_PLAFON);
  }
  long celOssz = celB + celJ;

  if (celOssz < 1) { enkoderNullaz(); return; }   // a naplo 0/0-t mutasson, ne a regit

  // a lassu szakasz hossza az OSSZEG terben (mindket kerek LASSITAS_MM-je;
  // porgesben a robot sajat PORGES_LASSITAS_MM-je, ha van)
  float lassMm = (irB != irJ && PORGES_LASSITAS_MM > 0) ? PORGES_LASSITAS_MM : LASSITAS_MM;
  long lassuImp = imp_bal(lassMm) + imp_jobb(lassMm);
  // cel-sebessegek kerekenkent, imp / 10 ms
  float mmPerImp = (MM_PER_IMP_BAL + MM_PER_IMP_JOBB) * 0.5;
  float vCel   = (float)(pwm - PWM_NULLA) / PWM_PER_MMS / mmPerImp / 100.0;
  float vLassu = LASSU_MM_S / mmPerImp / 100.0;
  if (vCel < vLassu) vCel = vLassu;

  enkoderNullaz();
  unsigned long t0 = millis();
  long pB = 0, pJ = 0;
  int  lokes = 0;

  while (true) {
    long eB = encBal * irB;           // haladas a SAJAT iranyban (+)
    long eJ = encJobb * irJ;
    long vB = eB - pB, vJ = eJ - pJ;  // imp / 10 ms
    pB = eB; pJ = eJ;
    long ossz = eB + eJ;
    long hatra = celOssz - ossz;

    if (hatra <= RAFUTAS_IMP) break;
    if (millis() - t0 > IDOKORLAT) {
      uzenet("!!! idokorlat -- a mozgas nem fejezodott be");
      break;
    }

    bool lassu = (hatra <= lassuImp);
    float vKell = lassu ? vLassu : vCel;
    int   alapNyers = lassu ? PWM_MIN : pwm;

    // lagy inditas: az elso INDULAS_MS alatt a PWM egyenletesen fut fel
    unsigned long eltelt = millis() - t0;
    bool indul = eltelt < (unsigned long)INDULAS_MS;
    if (indul) alapNyers = PWM_MIN + (int)((long)(alapNyers - PWM_MIN) * (long)eltelt / INDULAS_MS);

    // kozos terheles-ratartas a ket kerek egyuttes sebessege alapjan
    // (felfutas alatt nem tanul: akkor meg szandekosan lassu)
    float vVan = (float)(vB + vJ) * 0.5;
    if (indul) { /* tart */ }
    else if (vVan < vKell * 0.9 && alapNyers + lokes < PWM_PLAFON) lokes++;
    else if (vVan > vKell * 1.1 && lokes > 0) lokes--;
    int alap = hatarol(alapNyers + lokes, PWM_MIN, PWM_PLAFON);

    // hol tart a ket kerek a SAJAT celjahoz kepest (0..1)
    float fB = (celB < 1) ? 1.0 : (float)eB / (float)celB;
    float fJ = (celJ < 1) ? 1.0 : (float)eJ / (float)celJ;

    // + = a bal siet -> a bal kap kevesebbet, a jobb tobbet
    float hiba = fB - fJ;
    int   korr = hatarol((int)(SZINKRON * hiba * (float)alap), -alap, alap);

    int pwmB = (celB < 1) ? 0 : hatarol(alap - korr, PWM_MIN, PWM_PLAFON);
    int pwmJ = (celJ < 1) ? 0 : hatarol(alap + korr, PWM_MIN, PWM_PLAFON);

    // lassu szakasz: amelyik kerek meg gyorsabb a kuszasnal, rovidzar-fek
    if (lassu && vB > vLassu * 1.2) pwmB = 1;
    if (lassu && vJ > vLassu * 1.2) pwmJ = 1;

    motor(irB * pwmB, irJ * pwmJ);
    varj(10);
  }

  fekez(irB, irJ);
  varj(100);

  // UTANIGAZITAS: az osszeg hibajat a ket kerek felezve hozza be.
  // 5 ms-os ciklus, a kuszas felevel (bang-bang: aki gyorsabb, rovidzar-
  // fek), es egy mintaval ELORE all meg (a kerek allasbol ugorva indul).
  for (int k = 0; k < JAVITAS_MAX; k++) {
    long hiba = celOssz - (encBal * irB + encJobb * irJ);   // + = keves, - = tul sok
    if (abszolut(hiba) <= TURES_IMP) break;
    int   d    = (hiba > 0) ? 1 : -1;
    long  celK = abszolut(hiba) / 2;
    float vKuszo = vLassu * 0.5 * 0.5;                    // imp / 5 ms
    long  sB = encBal, sJ = encJobb;
    long  qB = 0, qJ = 0;
    int   p = PWM_MIN;
    unsigned long t1 = millis();
    while (millis() - t1 < 1500) {
      long mB = (encBal - sB) * irB * d, mJ = (encJobb - sJ) * irJ * d;
      long vB = mB - qB, vJ = mJ - qJ;
      qB = mB; qJ = mJ;
      bool keszB = mB + vB >= celK, keszJ = mJ + vJ >= celK;
      if (keszB && keszJ) break;
      if (vB + vJ == 0 && p < PWM_PLAFON) p++;              // holtsav: emeljuk, amig megindul
      int pB = keszB ? 1 : (vB > vKuszo ? 1 : p);
      int pJ = keszJ ? 1 : (vJ > vKuszo ? 1 : p);
      motor(irB * d * pB, irJ * d * pJ);
      varj(5);
    }
    fekez(irB * d, irJ * d);
    varj(100);
  }

  motor(0, 0);
  varj(200);
}


// =====================================================================
//  5. A MOZGAS-KESZLET  --  ezeket hivod a koreografiaban
// =====================================================================

unsigned long lepesStart = 0;
void lepes_kezd() { lepesStart = millis(); }

// kitolti a lepes idokeretet -- ettol marad szinkronban az ot robot
void lepes_var(unsigned long ido) {
  motor(0, 0);
  while (millis() - lepesStart < ido) varj(20);
}

void megy_cm(float cm) {
  float mm = cm * 10.0;
  long cb = imp_bal(mm * BAL_TRIM), cj = imp_jobb(mm);
  mozgas(cb, cj, pwm_sebessegbol(SEBESSEG_MM_S));
  uzenet("megy " + String(cm, 0) + " cm | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

// + = JOBBRA (oramutato szerint), - = BALRA. Helyben porges.
void porog_fok(float fok) {
  float ivMm = SHOW_PI * NYOMTAV_MM * PORGES_TRIM * (fok / 360.0);
  long cb = imp_bal(ivMm), cj = -imp_jobb(ivMm);
  mozgas(cb, cj, pwm_sebessegbol(PORGES_MM_S));
  uzenet("porog " + String(fok, 0) + " fok | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

void elore_cm(float cm)  { megy_cm(+cm); }
void hatra_cm(float cm)  { megy_cm(-cm); }
void balra_fok(float f)  { porog_fok(-f); }
void jobbra_fok(float f) { porog_fok(+f); }
void balra_kor(float k)  { porog_fok(-360.0 * k); }
void jobbra_kor(float k) { porog_fok(+360.0 * k); }


// =====================================================================
//  6. A KOREOGRAFIA  --  EZT IRD AT (mind az ot roboton UGYANAZ a lista)
// =====================================================================
//
//  Minta:  lepes_kezd();  <mozgas>;  lepes_var(<ezredmasodperc>);
//
//  Az idot a LEGLASSABB robothoz meretezd: a tobbi allva varja ki a
//  maradekot, es igy mind egyszerre lep tovabb. Enelkul a show nehany
//  lepes utan szetcsuszik IDOBEN, akkor is, ha pozicioban mind pontos.

void koreografia() {

  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [1 felvonulas] -> (1650, 900) 90.0 deg  r=45 mm
  lepes_kezd();                                            // [2 szetnyilas a negyzetre] 3 moves in 17000 ms
                 balra_fok(90.0);                          // [2 szetnyilas a negyzetre] -> (1650, 900) 180.0 deg  r=45 mm
                 elore_cm(5.0);                            // [2 szetnyilas a negyzetre] -> (1600, 900) 180.0 deg  r=53 mm
                 balra_fok(180.0);                         // [2 szetnyilas a negyzetre] -> (1600, 900) 0.0 deg  r=53 mm
                                       lepes_var(17000);   // [2 szetnyilas a negyzetre] end
  lepes_kezd();                        lepes_var(5000);    // [3 hullam - kozep] hold -> (1600, 900) 0.0 deg  r=53 mm
  lepes_kezd();                        lepes_var(5000);    // [4 hullam - hatso par] hold -> (1600, 900) 0.0 deg  r=53 mm
  lepes_kezd();  jobbra_fok(360.0);    lepes_var(5000);    // [5 hullam - elso par] -> (1600, 900) 0.0 deg  r=53 mm
  lepes_kezd();  jobbra_fok(720.0);    lepes_var(7500);    // [6 mind porog] -> (1600, 900) 0.0 deg  r=53 mm
  lepes_kezd();                        lepes_var(1000);    // [7 szunet 1] ANCHOR: re-place the robot on its mark by hand -> (1600, 900) 0.0 deg  r=10 mm
  lepes_kezd();                                            // [8 keringo 1 - kozep balra] 2 moves in 13000 ms
                 elore_cm(140.0);                          // [8 keringo 1 - kozep balra] -> (3000, 900) 0.0 deg  r=174 mm
                 balra_fok(90.0);                          // [8 keringo 1 - kozep balra] -> (3000, 900) 90.0 deg  r=174 mm
                                       lepes_var(13000);   // [8 keringo 1 - kozep balra] end
  lepes_kezd();                        lepes_var(1000);    // [9 szunet 2] ANCHOR: re-place the robot on its mark by hand -> (3000, 900) 90.0 deg  r=10 mm
  lepes_kezd();                                            // [10 keringo 2 - kozep jobbra] 2 moves in 13000 ms
                 elore_cm(140.0);                          // [10 keringo 2 - kozep jobbra] -> (3000, 2300) 90.0 deg  r=174 mm
                 balra_fok(90.0);                          // [10 keringo 2 - kozep jobbra] -> (3000, 2300) 180.0 deg  r=174 mm
                                       lepes_var(13000);   // [10 keringo 2 - kozep jobbra] end
  lepes_kezd();                        lepes_var(1000);    // [11 szunet 3] ANCHOR: re-place the robot on its mark by hand -> (3000, 2300) 180.0 deg  r=10 mm
  lepes_kezd();  balra_fok(45.0);      lepes_var(6000);    // [12 csillag - befele] -> (3000, 2300) -135.0 deg  r=10 mm
  lepes_kezd();  elore_cm(25.0);       lepes_var(6000);    // [13 csillag - egy lepes] -> (2823, 2123) -135.0 deg  r=43 mm
  lepes_kezd();                                            // [14 sorba allas 1 - eleje, vege, beallas] 3 moves in 11500 ms
                 jobbra_fok(62.1);                         // [14 sorba allas 1 - eleje, vege, beallas] -> (2823, 2123) 162.9 deg  r=43 mm
                 elore_cm(54.7);                           // [14 sorba allas 1 - eleje, vege, beallas] -> (2300, 2284) 162.9 deg  r=133 mm
                 balra_fok(107.1);                         // [14 sorba allas 1 - eleje, vege, beallas] -> (2300, 2284) -90.0 deg  r=133 mm
                                       lepes_var(11500);   // [14 sorba allas 1 - eleje, vege, beallas] end
  lepes_kezd();                        lepes_var(11500);   // [15 sorba allas 2 - a kozepe] hold -> (2300, 2284) -90.0 deg  r=133 mm
  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [16 egy lepes a kozonseghez] -> (2300, 1984) -90.0 deg  r=202 mm
  lepes_kezd();  balra_fok(720.0);     lepes_var(9500);    // [17 zaro porges] -> (2300, 1984) -90.0 deg  r=202 mm
  lepes_kezd();                        lepes_var(1000);    // [18 szunet 4] ANCHOR: re-place the robot on its mark by hand -> (2300, 1984) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [19 hazateres 1 - szetnyilik a sor] 3 moves in 16000 ms
                 jobbra_fok(90.0);                         // [19 hazateres 1 - szetnyilik a sor] -> (2300, 1984) 180.0 deg  r=10 mm
                 elore_cm(65.0);                           // [19 hazateres 1 - szetnyilik a sor] -> (1650, 1984) 180.0 deg  r=105 mm
                 balra_fok(90.0);                          // [19 hazateres 1 - szetnyilik a sor] -> (1650, 1984) -90.0 deg  r=105 mm
                                       lepes_var(16000);   // [19 hazateres 1 - szetnyilik a sor] end
  lepes_kezd();                        lepes_var(1000);    // [20 szunet 5] ANCHOR: re-place the robot on its mark by hand -> (1650, 1984) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [21 hazateres 2 - egyutt a rajtjelre] 2 moves in 13000 ms
                 elore_cm(138.4);                          // [21 hazateres 2 - egyutt a rajtjelre] -> (1650, 600) -90.0 deg  r=173 mm
                 balra_fok(180.0);                         // [21 hazateres 2 - egyutt a rajtjelre] -> (1650, 600) 90.0 deg  r=173 mm
                                       lepes_var(13000);   // [21 hazateres 2 - egyutt a rajtjelre] end
  lepes_kezd();                        lepes_var(2000);    // [22 vege] hold -> (1650, 600) 90.0 deg  r=173 mm

}


// =====================================================================
//  7. INDITAS
// =====================================================================

void indulas() {
  motor(0, 0);
  uzenet("=== SHOW v6 -- robot " + String(ROBOT) + " ===");
  uzenet("sebesseg " + String(SEBESSEG_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(pwm_sebessegbol(SEBESSEG_MM_S))
         + " | porges " + String(PORGES_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(PORGES_PWM > 0 ? PORGES_PWM : pwm_sebessegbol(PORGES_MM_S))
         + " | lassu " + String(LASSU_MM_S, 0) + " mm/s | tempo x" + String(TEMPO, 2)
         + " | fek " + String(FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : FEK_PWM)
         + (FEK_ELLEN_PWM > 0 ? " fix" : " aranyos"));
  uzenet("nyomtav " + String(NYOMTAV_MM, 1) + " | szinkron "
         + String(SZINKRON, 1) + " | lassitas " + String(LASSITAS_MM, 0)
         + " mm | rafutas " + String(RAFUTAS_IMP) + " imp | fek PWM "
         + String(FEK_PWM) + " | tures " + String(TURES_IMP) + " imp");
  uzenet("Indulas 3 mp mulva.");
  varj(3000);

  koreografia();

  motor(0, 0);
  uzenet("=========== SHOW VEGE ===========");
}


// =====================================================================
//  8. VEZERLES
// =====================================================================

void vezerles() {
  motor(0, 0);      // a koreografia az indulas()-ban fut le
}
```

### Robot 3

```cpp
// =====================================================================
//  SHOW -- ROBOT 3   (v6)
//  Enkoderes koreografia vonal nelkul, kerekenkent szinkronizalva.
//
//  EZ A FAJL KET RESZBOL ALL:
//    2. blokk  = PER ROBOT mert adatok   -> robotonkent MAS
//    3. blokk  = KOZOS show-beallitasok  -> mind az ot roboton UGYANAZ
//  A tobbihez nem kell nyulni.
// =====================================================================
//
// ---------------------------------------------------------------------
//  A. HOGYAN MUKODIK
// ---------------------------------------------------------------------
//  Nincs vonal, tehat nincs kulso visszacsatolas. Ami maradt: a ket
//  enkoder. Minden mozgas egy impulzus-cel kerekenkent, es a mozgas()
//  ciklus 10 ms-onkent ujraszamolja a ket PWM-et.
//
//  KESZ = A KET KEREK EGYUTT: a mozgas akkor er veget, amikor a ket
//  enkoder OSSZEGE eleri a ket cel osszeget. Egyenesben ez a tavolsag,
//  porgesben ez a szog ((sB + sJ) / nyomtav) -- fuggetlenul attol,
//  melyik kerek mennyit vitt belole. A regi (v5) valtozat mindket
//  kereket kulon varta meg, es porgesben a hamarabb keszen levo kereket
//  a robot forgasa tovabb pergette: +900 impulzus, +90..120 fok.
//
//  SZINKRON: a ciklus azt nezi, a ket kerek hany SZAZALEKAN all a SAJAT
//  celjanak. Amelyik siet, kevesebb PWM-et kap, amelyik lemarad, tobbet.
//  Ettol megy egyenesen, es ettol marad helyben a porges.
//
//  LASSITAS + AKTIV FEK + UTANIGAZITAS: az utolso LASSITAS_MM-en a robot
//  LASSU_MM_S-sel kuszik, RAFUTAS_IMP-pel a cel elott lekapcsol, majd
//  ellen-PWM-mel fekez, amig a kerekek meg nem allnak (a puszta
//  motor(0,0) a TB6612-n keszenlet = szabadon gurulas). Ha az osszeg
//  igy is TURES_IMP-nel tobbel ter el, a ket kerek lassan behozza.
//
// ---------------------------------------------------------------------
//  B. SEBESSEG -- EGY SZAM, MIND AZ OT ROBOTRA
// ---------------------------------------------------------------------
//  A PWM robotonkent MAST jelent (mas motor, mas surlodas, mas akku).
//  Ezert a koreografia nem PWM-ben, hanem mm/s-ban all: SEBESSEG_MM_S.
//  Minden robot a SAJAT mert PWM/sebesseg egyenesevel szamolja at:
//
//        PWM = PWM_PER_MMS * v + PWM_NULLA
//
//  Igy eleg EGY helyen allitani a sebesseget, es mind az ot ugyanolyan
//  gyorsan megy. A ket atvalto szamot a T7_sebesseg.txt meri robotonkent.
//
// ---------------------------------------------------------------------
//  C. A NAPLOT IGY OLVASD
// ---------------------------------------------------------------------
//  Minden mozgas utan a naplo kiirja: cel bal/jobb -> bal=.. jobb=..
//  A KET SZAM OSSZEGE szamit: az legyen TURES_IMP-en belul a ket cel
//  osszegehez kepest. Porgesben a ket kerek kulon-kulon elterhet
//  (az elore halado kerek terheletlen, a hatra halado terhelt), ez nem
//  hiba, a szog az osszegbol jon.
//  Ha a robot a padlon MEGIS tobbet/kevesebbet fordul, mint a naplo
//  szerint kellene: PORGES_TRIM (2. blokk). Ha az egyenes hosszabb /
//  rovidebb: MM_PER_IMP (T1 tolasi teszt).
//
// ---------------------------------------------------------------------
//  D. AMI NEM JAVITHATO TOVABB
// ---------------------------------------------------------------------
//  Csuszas: a kerek elfordul, a robot megsem oda megy. Az enkoder ezt
//  elvileg sem latja. Nagysagrend: +-10 cm meterenkent, +-20 fok harom
//  porges utan, padlofuggoen. Ne tervezz 20 cm-nel kisebb hezagot ket
//  robot koze, es ne fuzz sok porgest egymas utan -- kulso referencia
//  nelkul a szoghiba osszeadodik.
//
//  Ha a robot ugyanazzal a kodddal futasrol futasra rosszabb lesz:
//  eloszor az AKKUT merd (V parancs), ne a szamokat allitsd.
// =====================================================================


// ============ 1. MELYIK ROBOT VAGYOK ============

#define ROBOT 3


// =====================================================================
//  2. PER ROBOT MERT ADATOK  --  ROBOTONKENT MAS
//     (a MERESI_MENET.md tablazatabol)
// =====================================================================

// --- T1 tolasi teszt + T5 hajtott egyenes ---
const float MM_PER_IMP_BAL  = 0.34582;
const float MM_PER_IMP_JOBB = 0.34392;

// --- T7 sebessegmeres: PWM = PWM_PER_MMS * v + PWM_NULLA ---
//     ELOZETES ertek a T2 D-fazisabol illesztve. Futtasd a T7-et
//     es ird felul -- ez a ket szam teszi egyformava az ot robotot.
const float PWM_PER_MMS = 0.14500;
const float PWM_NULLA   = 9.30;

// --- porges: HANGOLT szam, nem fizikai nyomtav (a csuszast is tartalmazza)
const float NYOMTAV_MM  = 152.5;
const float PORGES_TRIM = 1.000;   // tul sokat porog -> 0,985 | keveset -> 1,015

// --- egyenes futas arany-finomitasa (1,000 = nincs javitas)
//     farat BALRA tolja -> 0,996 | JOBBRA -> 1,004 | egy lepes ~4 mm/meter
const float BAL_TRIM = 0.996;

// --- holtsav (T2 C fazis): bal 20/40, jobb 25/20 -> a legrosszabb 40
const int PWM_MIN = 45;            // ez ala semmilyen szamitas nem viheti

// --- porges es fek finomhangolas (2026-09-21, robot 5). 0 / 1,00 = a
//     3. blokk kozos beallitasa ervenyes, a tobbi robot igy fut.
//     PORGES_PWM: >0 = ez a PWM az alap porgesben a PORGES_MM_S-bol
//     szamolt helyett. Nagyobb alap: a terhelt (hatra halado) kerek
//     azonnal kap nyomatekot, es a szinkronnak van hova levinnie a
//     sieto szabad kereket (a PWM_MIN alatt nem mehet).
const int PORGES_PWM = 0;
//     iranyfuggo trim a PORGES_TRIM-en FELUL: balra keveset fordul ->
//     _BAL 1,02 | jobbra sokat -> _JOBB 0,98. A naplo "cel" oszlopa a
//     trim NELKULI cel, az enkoder-osszeg a cel x trim koze all be.
const float PORGES_TRIM_BAL  = 0.991;
const float PORGES_TRIM_JOBB = 1.010;
//     PORGES_OFFSET_FOK: FIX fok, amit MINDEN porgesbol levonunk -- a
//     megallas (rafutas + fek alatti csuszas) minden porgesnel ugyanannyi
//     fokot ad hozza, a kicsiknel ez a fo hiba. 45 fok 8-cal tul -> 6.
const float PORGES_OFFSET_FOK = 0.0;
//     PORGES_LASSITAS_MM: a lassu szakasz hossza PORGESBEN (0 = a kozos
//     LASSITAS_MM). Egy 90 fokos fordulat 123 mm kerekenkent, azaz 100-as
//     lassitassal szinte vegig kuszas -- a terhelt kerek ott megall es
//     rangat (robot 2: 90/180 fok 10-15-tel rovid, a 720 pontos). 30-cal
//     a kis fordulat is sebesseggel megy, mint a nagy.
const float PORGES_LASSITAS_MM = 0.0;
//     FEK_ELLEN_PWM: >0 = FIX ellen-hajtas ennyi PWM-mel, amig a kerek
//     meg nem all (a sebessegaranyos FEK_PWM helyett). Erosebb, de a
//     lezart kereken a robot megcsuszhat -- padlon ellenorizd.
const int FEK_ELLEN_PWM = 0;
//     TEMPO: a 3. blokk SEBESSEG_MM_S / PORGES_MM_S szorzoja CSAK ezen a
//     roboton (1,0 = a kozos tempo). Probahoz: 1,5 = masfelszeres.
const float TEMPO = 1.50;


// =====================================================================
//  3. KOZOS SHOW-BEALLITASOK  --  MIND AZ OT ROBOTON UGYANAZ
// =====================================================================

const float SEBESSEG_MM_S = 300.0;   // egyenes haladas
const float PORGES_MM_S   = 300.0;   // a kerekek keruleti sebessege porgesben

const float SZINKRON       = 8.0;    // keresztcsatolas ereje
                                     //   billeg/rangat -> 4.0
                                     //   szetcsuszik   -> 12.0
const float LASSITAS_MM    = 100.0;  // ennyi kerek-mm-rel a cel elott mar
const float LASSU_MM_S     = 150.0;  //   csak ilyen lassan kuszik
const int   RAFUTAS_IMP    = 50;     // ennyi impulzussal a cel elott kapcsol
                                     //   le a hajtas: a fek alatt a ket kerek
                                     //   OSSZESEN kb. ennyit gurul meg
const int   FEK_PWM        = 60;     // aktiv fek: ellen-PWM, amig a kerek
const int   FEK_MAX_MS     = 400;    //   meg nem all, legfeljebb ennyi ms
const int   TURES_IMP      = 16;     // a ket kerek OSSZESEN ennyin belul kesz
const int   JAVITAS_MAX    = 2;      // legfeljebb ennyi utanigazitas
const int   INDULAS_MS     = 300;    // lagy inditas: ennyi ido alatt fut fel a
                                     //   PWM (allasbol ugorva a kerek kiporog)
const int   PWM_PLAFON     = 200;

const unsigned long IDOKORLAT = 20000;

const float SHOW_PI = 3.14159265;


// =====================================================================
//  4. A MOZGATO CIKLUS  --  INNENTOL NEM KELL ALLITANI
// =====================================================================

long imp_bal(float mm)  { return (long)(mm / MM_PER_IMP_BAL  + (mm < 0 ? -0.5 : 0.5)); }
long imp_jobb(float mm) { return (long)(mm / MM_PER_IMP_JOBB + (mm < 0 ? -0.5 : 0.5)); }

long abszolut(long x) { return (x < 0) ? -x : x; }

int hatarol(int v, int also, int felso) {
  if (v < also)  return also;
  if (v > felso) return felso;
  return v;
}

// mm/s -> PWM, a robot sajat mert egyenesevel (es sajat TEMPO-javal)
int pwm_sebessegbol(float mm_s) {
  int p = (int)(PWM_PER_MMS * mm_s * TEMPO + PWM_NULLA + 0.5);
  return hatarol(p, PWM_MIN, PWM_PLAFON);
}

//  Kerek-sebesseg: impulzus / 10 ms a kerek SAJAT iranyaban (+ = halad).
//  (8 imp/10 ms = 800 imp/s ~ 275 mm/s.)

//  AKTIV FEK: ellen-PWM a sebesseggel aranyosan (FEK_PWM 8 imp/10 ms
//  felett), es amint a kerek mar csak kuszik, rovidzar-fek: PWM 1 a
//  TB6612-n 99,6 % "short brake" -- a puszta motor(0,0) keszenlet, azaz
//  szabadon gurulas. Egy fix eros ellen-lokes a kereket megallitja, de a
//  robot tovabb csuszik rajta (2026-09-13: +32 imp a fek UTAN). Kesz, ha
//  mindket kerek 3 egymas utani mintaban allt; legfeljebb FEK_MAX_MS.
void fekez(int irB, int irJ) {
  long pB = encBal, pJ = encJobb;
  int allB = 0, allJ = 0;
  unsigned long t0 = millis();
  while (millis() - t0 < (unsigned long)FEK_MAX_MS) {
    varj(10);
    long nB = encBal, nJ = encJobb;
    long vB = (nB - pB) * irB, vJ = (nJ - pJ) * irJ;
    pB = nB; pJ = nJ;
    allB = (vB <= 1) ? allB + 1 : 0;
    allJ = (vJ <= 1) ? allJ + 1 : 0;
    if (allB >= 3 && allJ >= 3) break;
    int fB = (vB <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vB / 8), 1, FEK_PWM));
    int fJ = (vJ <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vJ / 8), 1, FEK_PWM));
    motor(-irB * fB, -irJ * fJ);
  }
  motor(0, 0);
}

//  cb, cj = elojeles impulzus-cel kerekenkent (+ = elore, - = hatra)
//
//  A mozgas akkor kesz, amikor a ket kerek EGYUTT tette meg a ket cel
//  OSSZEGET -- nem akkor, amikor kulon-kulon mindketto elerte a sajatjat.
//  Egyenesben az osszeg = 2x a tavolsag, porgesben az osszeg adja a
//  szoget ((sB + sJ) / nyomtav), fuggetlenul attol, hogy a ket kerek
//  hogyan osztozott rajta. Igy egyik kerek sem var a masikra hajtas
//  nelkul, es a robot forgasa nem pergeti tovabb (ez adta porgesben a
//  +900 impulzust az elore halado kereken: 2026-09-13-i telemetria).
//
//  TERHELES (lokes): a PWM_PER_MMS egyenes terheletlen kerekre igaz.
//  Porgesben a hatra halado kerek erosen terhelt (58 PWM-en megallt),
//  ezert a ciklus a ket kerek EGYUTTES sebesseget a celhoz meri, es
//  10 ms-onkent 1 PWM-mel emeli (lassu -> +) vagy csokkenti (gyors -> -)
//  a kozos ratartast. Ez a szonyeg / lemerult akku ellen is ved.
//
//  SZINKRON: a ket kerek a SAJAT celjanak hany szazalekan all; aki siet,
//  kevesebb PWM-et kap, aki lemarad, tobbet -- ettol megy egyenesen.
//  A korrekcio +-alap-ig mehet (nem alap/2-ig): porgesben az elore
//  halado kerek terheletlen, 50 vs 105 PWM mellett is az volt a gyorsabb.
//
//  Lefutas: lagy inditas (INDULAS_MS) -> teljes sebesseg -> az utolso LASSITAS_MM-en LASSU_MM_S-sel
//  kuszas (amelyik kerek gyorsabb ennel, az addig rovidzar-feket kap)
//  -> RAFUTAS_IMP-pel a cel elott hajtas le, aktiv fek -> ha az osszeg
//  TURES_IMP-nel tobbel ter el, utanigazitas (mindket kerek a hiba
//  felet), legfeljebb JAVITAS_MAX-szor.
void mozgas(long cb, long cj, int pwm) {
  long celB = abszolut(cb);
  long celJ = abszolut(cj);
  int  irB  = (cb >= 0) ? 1 : -1;
  int  irJ  = (cj >= 0) ? 1 : -1;

  // PORGES = a ket kerek ellentetes iranyba megy (porog_fok). Iranyfuggo
  // trim a celokon (bal kerek hatra = balra porges), es sajat PWM-alap.
  if (irB != irJ) {
    float trim = (cb < 0) ? PORGES_TRIM_BAL : PORGES_TRIM_JOBB;
    float offMm = SHOW_PI * NYOMTAV_MM * (PORGES_OFFSET_FOK / 360.0);   // kerekenkent
    celB = (long)(celB * trim + 0.5) - imp_bal(offMm);
    celJ = (long)(celJ * trim + 0.5) - imp_jobb(offMm);
    if (celB < 0) celB = 0;
    if (celJ < 0) celJ = 0;
    if (PORGES_PWM > 0) pwm = hatarol(PORGES_PWM, PWM_MIN, PWM_PLAFON);
  }
  long celOssz = celB + celJ;

  if (celOssz < 1) { enkoderNullaz(); return; }   // a naplo 0/0-t mutasson, ne a regit

  // a lassu szakasz hossza az OSSZEG terben (mindket kerek LASSITAS_MM-je;
  // porgesben a robot sajat PORGES_LASSITAS_MM-je, ha van)
  float lassMm = (irB != irJ && PORGES_LASSITAS_MM > 0) ? PORGES_LASSITAS_MM : LASSITAS_MM;
  long lassuImp = imp_bal(lassMm) + imp_jobb(lassMm);
  // cel-sebessegek kerekenkent, imp / 10 ms
  float mmPerImp = (MM_PER_IMP_BAL + MM_PER_IMP_JOBB) * 0.5;
  float vCel   = (float)(pwm - PWM_NULLA) / PWM_PER_MMS / mmPerImp / 100.0;
  float vLassu = LASSU_MM_S / mmPerImp / 100.0;
  if (vCel < vLassu) vCel = vLassu;

  enkoderNullaz();
  unsigned long t0 = millis();
  long pB = 0, pJ = 0;
  int  lokes = 0;

  while (true) {
    long eB = encBal * irB;           // haladas a SAJAT iranyban (+)
    long eJ = encJobb * irJ;
    long vB = eB - pB, vJ = eJ - pJ;  // imp / 10 ms
    pB = eB; pJ = eJ;
    long ossz = eB + eJ;
    long hatra = celOssz - ossz;

    if (hatra <= RAFUTAS_IMP) break;
    if (millis() - t0 > IDOKORLAT) {
      uzenet("!!! idokorlat -- a mozgas nem fejezodott be");
      break;
    }

    bool lassu = (hatra <= lassuImp);
    float vKell = lassu ? vLassu : vCel;
    int   alapNyers = lassu ? PWM_MIN : pwm;

    // lagy inditas: az elso INDULAS_MS alatt a PWM egyenletesen fut fel
    unsigned long eltelt = millis() - t0;
    bool indul = eltelt < (unsigned long)INDULAS_MS;
    if (indul) alapNyers = PWM_MIN + (int)((long)(alapNyers - PWM_MIN) * (long)eltelt / INDULAS_MS);

    // kozos terheles-ratartas a ket kerek egyuttes sebessege alapjan
    // (felfutas alatt nem tanul: akkor meg szandekosan lassu)
    float vVan = (float)(vB + vJ) * 0.5;
    if (indul) { /* tart */ }
    else if (vVan < vKell * 0.9 && alapNyers + lokes < PWM_PLAFON) lokes++;
    else if (vVan > vKell * 1.1 && lokes > 0) lokes--;
    int alap = hatarol(alapNyers + lokes, PWM_MIN, PWM_PLAFON);

    // hol tart a ket kerek a SAJAT celjahoz kepest (0..1)
    float fB = (celB < 1) ? 1.0 : (float)eB / (float)celB;
    float fJ = (celJ < 1) ? 1.0 : (float)eJ / (float)celJ;

    // + = a bal siet -> a bal kap kevesebbet, a jobb tobbet
    float hiba = fB - fJ;
    int   korr = hatarol((int)(SZINKRON * hiba * (float)alap), -alap, alap);

    int pwmB = (celB < 1) ? 0 : hatarol(alap - korr, PWM_MIN, PWM_PLAFON);
    int pwmJ = (celJ < 1) ? 0 : hatarol(alap + korr, PWM_MIN, PWM_PLAFON);

    // lassu szakasz: amelyik kerek meg gyorsabb a kuszasnal, rovidzar-fek
    if (lassu && vB > vLassu * 1.2) pwmB = 1;
    if (lassu && vJ > vLassu * 1.2) pwmJ = 1;

    motor(irB * pwmB, irJ * pwmJ);
    varj(10);
  }

  fekez(irB, irJ);
  varj(100);

  // UTANIGAZITAS: az osszeg hibajat a ket kerek felezve hozza be.
  // 5 ms-os ciklus, a kuszas felevel (bang-bang: aki gyorsabb, rovidzar-
  // fek), es egy mintaval ELORE all meg (a kerek allasbol ugorva indul).
  for (int k = 0; k < JAVITAS_MAX; k++) {
    long hiba = celOssz - (encBal * irB + encJobb * irJ);   // + = keves, - = tul sok
    if (abszolut(hiba) <= TURES_IMP) break;
    int   d    = (hiba > 0) ? 1 : -1;
    long  celK = abszolut(hiba) / 2;
    float vKuszo = vLassu * 0.5 * 0.5;                    // imp / 5 ms
    long  sB = encBal, sJ = encJobb;
    long  qB = 0, qJ = 0;
    int   p = PWM_MIN;
    unsigned long t1 = millis();
    while (millis() - t1 < 1500) {
      long mB = (encBal - sB) * irB * d, mJ = (encJobb - sJ) * irJ * d;
      long vB = mB - qB, vJ = mJ - qJ;
      qB = mB; qJ = mJ;
      bool keszB = mB + vB >= celK, keszJ = mJ + vJ >= celK;
      if (keszB && keszJ) break;
      if (vB + vJ == 0 && p < PWM_PLAFON) p++;              // holtsav: emeljuk, amig megindul
      int pB = keszB ? 1 : (vB > vKuszo ? 1 : p);
      int pJ = keszJ ? 1 : (vJ > vKuszo ? 1 : p);
      motor(irB * d * pB, irJ * d * pJ);
      varj(5);
    }
    fekez(irB * d, irJ * d);
    varj(100);
  }

  motor(0, 0);
  varj(200);
}


// =====================================================================
//  5. A MOZGAS-KESZLET  --  ezeket hivod a koreografiaban
// =====================================================================

unsigned long lepesStart = 0;
void lepes_kezd() { lepesStart = millis(); }

// kitolti a lepes idokeretet -- ettol marad szinkronban az ot robot
void lepes_var(unsigned long ido) {
  motor(0, 0);
  while (millis() - lepesStart < ido) varj(20);
}

void megy_cm(float cm) {
  float mm = cm * 10.0;
  long cb = imp_bal(mm * BAL_TRIM), cj = imp_jobb(mm);
  mozgas(cb, cj, pwm_sebessegbol(SEBESSEG_MM_S));
  uzenet("megy " + String(cm, 0) + " cm | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

// + = JOBBRA (oramutato szerint), - = BALRA. Helyben porges.
void porog_fok(float fok) {
  float ivMm = SHOW_PI * NYOMTAV_MM * PORGES_TRIM * (fok / 360.0);
  long cb = imp_bal(ivMm), cj = -imp_jobb(ivMm);
  mozgas(cb, cj, pwm_sebessegbol(PORGES_MM_S));
  uzenet("porog " + String(fok, 0) + " fok | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

void elore_cm(float cm)  { megy_cm(+cm); }
void hatra_cm(float cm)  { megy_cm(-cm); }
void balra_fok(float f)  { porog_fok(-f); }
void jobbra_fok(float f) { porog_fok(+f); }
void balra_kor(float k)  { porog_fok(-360.0 * k); }
void jobbra_kor(float k) { porog_fok(+360.0 * k); }


// =====================================================================
//  6. A KOREOGRAFIA  --  EZT IRD AT (mind az ot roboton UGYANAZ a lista)
// =====================================================================
//
//  Minta:  lepes_kezd();  <mozgas>;  lepes_var(<ezredmasodperc>);
//
//  Az idot a LEGLASSABB robothoz meretezd: a tobbi allva varja ki a
//  maradekot, es igy mind egyszerre lep tovabb. Enelkul a show nehany
//  lepes utan szetcsuszik IDOBEN, akkor is, ha pozicioban mind pontos.

void koreografia() {

  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [1 felvonulas] -> (2300, 900) 90.0 deg  r=45 mm
  lepes_kezd();  elore_cm(70.0);       lepes_var(17000);   // [2 szetnyilas a negyzetre] -> (2300, 1600) 90.0 deg  r=138 mm
  lepes_kezd();  balra_fok(360.0);     lepes_var(5000);    // [3 hullam - kozep] -> (2300, 1600) 90.0 deg  r=138 mm
  lepes_kezd();                        lepes_var(5000);    // [4 hullam - hatso par] hold -> (2300, 1600) 90.0 deg  r=138 mm
  lepes_kezd();                        lepes_var(5000);    // [5 hullam - elso par] hold -> (2300, 1600) 90.0 deg  r=138 mm
  lepes_kezd();  balra_fok(720.0);     lepes_var(7500);    // [6 mind porog] -> (2300, 1600) 90.0 deg  r=138 mm
  lepes_kezd();                        lepes_var(1000);    // [7 szunet 1] ANCHOR: re-place the robot on its mark by hand -> (2300, 1600) 90.0 deg  r=10 mm
  lepes_kezd();  balra_fok(1080.0);    lepes_var(13000);   // [8 keringo 1 - kozep balra] -> (2300, 1600) 90.0 deg  r=10 mm
  lepes_kezd();                        lepes_var(1000);    // [9 szunet 2] ANCHOR: re-place the robot on its mark by hand -> (2300, 1600) 90.0 deg  r=10 mm
  lepes_kezd();  jobbra_fok(1080.0);   lepes_var(13000);   // [10 keringo 2 - kozep jobbra] -> (2300, 1600) 90.0 deg  r=10 mm
  lepes_kezd();                        lepes_var(1000);    // [11 szunet 3] ANCHOR: re-place the robot on its mark by hand -> (2300, 1600) 90.0 deg  r=10 mm
  lepes_kezd();  balra_fok(360.0);     lepes_var(6000);    // [12 csillag - befele] -> (2300, 1600) 90.0 deg  r=10 mm
  lepes_kezd();  jobbra_fok(360.0);    lepes_var(6000);    // [13 csillag - egy lepes] -> (2300, 1600) 90.0 deg  r=10 mm
  lepes_kezd();  balra_fok(180.0);     lepes_var(11500);   // [14 sorba allas 1 - eleje, vege, beallas] -> (2300, 1600) -90.0 deg  r=10 mm
  lepes_kezd();                        lepes_var(11500);   // [15 sorba allas 2 - a kozepe] hold -> (2300, 1600) -90.0 deg  r=10 mm
  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [16 egy lepes a kozonseghez] -> (2300, 1300) -90.0 deg  r=136 mm
  lepes_kezd();  balra_fok(1080.0);    lepes_var(9500);    // [17 zaro porges] -> (2300, 1300) -90.0 deg  r=136 mm
  lepes_kezd();                        lepes_var(1000);    // [18 szunet 4] ANCHOR: re-place the robot on its mark by hand -> (2300, 1300) -90.0 deg  r=10 mm
  lepes_kezd();                        lepes_var(16000);   // [19 hazateres 1 - szetnyilik a sor] hold -> (2300, 1300) -90.0 deg  r=10 mm
  lepes_kezd();                        lepes_var(1000);    // [20 szunet 5] ANCHOR: re-place the robot on its mark by hand -> (2300, 1300) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [21 hazateres 2 - egyutt a rajtjelre] 2 moves in 13000 ms
                 elore_cm(70.0);                           // [21 hazateres 2 - egyutt a rajtjelre] -> (2300, 600) -90.0 deg  r=92 mm
                 balra_fok(180.0);                         // [21 hazateres 2 - egyutt a rajtjelre] -> (2300, 600) 90.0 deg  r=92 mm
                                       lepes_var(13000);   // [21 hazateres 2 - egyutt a rajtjelre] end
  lepes_kezd();                        lepes_var(2000);    // [22 vege] hold -> (2300, 600) 90.0 deg  r=92 mm

}


// =====================================================================
//  7. INDITAS
// =====================================================================

void indulas() {
  motor(0, 0);
  uzenet("=== SHOW v6 -- robot " + String(ROBOT) + " ===");
  uzenet("sebesseg " + String(SEBESSEG_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(pwm_sebessegbol(SEBESSEG_MM_S))
         + " | porges " + String(PORGES_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(PORGES_PWM > 0 ? PORGES_PWM : pwm_sebessegbol(PORGES_MM_S))
         + " | lassu " + String(LASSU_MM_S, 0) + " mm/s | tempo x" + String(TEMPO, 2)
         + " | fek " + String(FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : FEK_PWM)
         + (FEK_ELLEN_PWM > 0 ? " fix" : " aranyos"));
  uzenet("nyomtav " + String(NYOMTAV_MM, 1) + " | szinkron "
         + String(SZINKRON, 1) + " | lassitas " + String(LASSITAS_MM, 0)
         + " mm | rafutas " + String(RAFUTAS_IMP) + " imp | fek PWM "
         + String(FEK_PWM) + " | tures " + String(TURES_IMP) + " imp");
  uzenet("Indulas 3 mp mulva.");
  varj(3000);

  koreografia();

  motor(0, 0);
  uzenet("=========== SHOW VEGE ===========");
}


// =====================================================================
//  8. VEZERLES
// =====================================================================

void vezerles() {
  motor(0, 0);      // a koreografia az indulas()-ban fut le
}
```

### Robot 4

```cpp
// =====================================================================
//  SHOW -- ROBOT 4   (v6)
//  Enkoderes koreografia vonal nelkul, kerekenkent szinkronizalva.
//
//  EZ A FAJL KET RESZBOL ALL:
//    2. blokk  = PER ROBOT mert adatok   -> robotonkent MAS
//    3. blokk  = KOZOS show-beallitasok  -> mind az ot roboton UGYANAZ
//  A tobbihez nem kell nyulni.
// =====================================================================
//
// ---------------------------------------------------------------------
//  A. HOGYAN MUKODIK
// ---------------------------------------------------------------------
//  Nincs vonal, tehat nincs kulso visszacsatolas. Ami maradt: a ket
//  enkoder. Minden mozgas egy impulzus-cel kerekenkent, es a mozgas()
//  ciklus 10 ms-onkent ujraszamolja a ket PWM-et.
//
//  KESZ = A KET KEREK EGYUTT: a mozgas akkor er veget, amikor a ket
//  enkoder OSSZEGE eleri a ket cel osszeget. Egyenesben ez a tavolsag,
//  porgesben ez a szog ((sB + sJ) / nyomtav) -- fuggetlenul attol,
//  melyik kerek mennyit vitt belole. A regi (v5) valtozat mindket
//  kereket kulon varta meg, es porgesben a hamarabb keszen levo kereket
//  a robot forgasa tovabb pergette: +900 impulzus, +90..120 fok.
//
//  SZINKRON: a ciklus azt nezi, a ket kerek hany SZAZALEKAN all a SAJAT
//  celjanak. Amelyik siet, kevesebb PWM-et kap, amelyik lemarad, tobbet.
//  Ettol megy egyenesen, es ettol marad helyben a porges.
//
//  LASSITAS + AKTIV FEK + UTANIGAZITAS: az utolso LASSITAS_MM-en a robot
//  LASSU_MM_S-sel kuszik, RAFUTAS_IMP-pel a cel elott lekapcsol, majd
//  ellen-PWM-mel fekez, amig a kerekek meg nem allnak (a puszta
//  motor(0,0) a TB6612-n keszenlet = szabadon gurulas). Ha az osszeg
//  igy is TURES_IMP-nel tobbel ter el, a ket kerek lassan behozza.
//
// ---------------------------------------------------------------------
//  B. SEBESSEG -- EGY SZAM, MIND AZ OT ROBOTRA
// ---------------------------------------------------------------------
//  A PWM robotonkent MAST jelent (mas motor, mas surlodas, mas akku).
//  Ezert a koreografia nem PWM-ben, hanem mm/s-ban all: SEBESSEG_MM_S.
//  Minden robot a SAJAT mert PWM/sebesseg egyenesevel szamolja at:
//
//        PWM = PWM_PER_MMS * v + PWM_NULLA
//
//  Igy eleg EGY helyen allitani a sebesseget, es mind az ot ugyanolyan
//  gyorsan megy. A ket atvalto szamot a T7_sebesseg.txt meri robotonkent.
//
// ---------------------------------------------------------------------
//  C. A NAPLOT IGY OLVASD
// ---------------------------------------------------------------------
//  Minden mozgas utan a naplo kiirja: cel bal/jobb -> bal=.. jobb=..
//  A KET SZAM OSSZEGE szamit: az legyen TURES_IMP-en belul a ket cel
//  osszegehez kepest. Porgesben a ket kerek kulon-kulon elterhet
//  (az elore halado kerek terheletlen, a hatra halado terhelt), ez nem
//  hiba, a szog az osszegbol jon.
//  Ha a robot a padlon MEGIS tobbet/kevesebbet fordul, mint a naplo
//  szerint kellene: PORGES_TRIM (2. blokk). Ha az egyenes hosszabb /
//  rovidebb: MM_PER_IMP (T1 tolasi teszt).
//
// ---------------------------------------------------------------------
//  D. AMI NEM JAVITHATO TOVABB
// ---------------------------------------------------------------------
//  Csuszas: a kerek elfordul, a robot megsem oda megy. Az enkoder ezt
//  elvileg sem latja. Nagysagrend: +-10 cm meterenkent, +-20 fok harom
//  porges utan, padlofuggoen. Ne tervezz 20 cm-nel kisebb hezagot ket
//  robot koze, es ne fuzz sok porgest egymas utan -- kulso referencia
//  nelkul a szoghiba osszeadodik.
//
//  Ha a robot ugyanazzal a kodddal futasrol futasra rosszabb lesz:
//  eloszor az AKKUT merd (V parancs), ne a szamokat allitsd.
// =====================================================================


// ============ 1. MELYIK ROBOT VAGYOK ============

#define ROBOT 4


// =====================================================================
//  2. PER ROBOT MERT ADATOK  --  ROBOTONKENT MAS
//     (a MERESI_MENET.md tablazatabol)
// =====================================================================

// --- T1 tolasi teszt + T5 hajtott egyenes ---
const float MM_PER_IMP_BAL  = 0.34582;
const float MM_PER_IMP_JOBB = 0.34392;

// --- T7 sebessegmeres: PWM = PWM_PER_MMS * v + PWM_NULLA ---
//     ELOZETES ertek a T2 D-fazisabol illesztve. Futtasd a T7-et
//     es ird felul -- ez a ket szam teszi egyformava az ot robotot.
const float PWM_PER_MMS = 0.14500;
const float PWM_NULLA   = 9.30;

// --- porges: HANGOLT szam, nem fizikai nyomtav (a csuszast is tartalmazza)
const float NYOMTAV_MM  = 151.1;
const float PORGES_TRIM = 1.000;   // tul sokat porog -> 0,985 | keveset -> 1,015

// --- egyenes futas arany-finomitasa (1,000 = nincs javitas)
//     farat BALRA tolja -> 0,996 | JOBBRA -> 1,004 | egy lepes ~4 mm/meter
const float BAL_TRIM = 1.004;

// --- holtsav (T2 C fazis): bal 20/40, jobb 25/20 -> a legrosszabb 40
const int PWM_MIN = 45;            // ez ala semmilyen szamitas nem viheti

// --- porges es fek finomhangolas (2026-09-21, robot 5). 0 / 1,00 = a
//     3. blokk kozos beallitasa ervenyes, a tobbi robot igy fut.
//     PORGES_PWM: >0 = ez a PWM az alap porgesben a PORGES_MM_S-bol
//     szamolt helyett. Nagyobb alap: a terhelt (hatra halado) kerek
//     azonnal kap nyomatekot, es a szinkronnak van hova levinnie a
//     sieto szabad kereket (a PWM_MIN alatt nem mehet).
const int PORGES_PWM = 0;
//     iranyfuggo trim a PORGES_TRIM-en FELUL: balra keveset fordul ->
//     _BAL 1,02 | jobbra sokat -> _JOBB 0,98. A naplo "cel" oszlopa a
//     trim NELKULI cel, az enkoder-osszeg a cel x trim koze all be.
const float PORGES_TRIM_BAL  = 1.000;
const float PORGES_TRIM_JOBB = 1.000;
//     PORGES_OFFSET_FOK: FIX fok, amit MINDEN porgesbol levonunk -- a
//     megallas (rafutas + fek alatti csuszas) minden porgesnel ugyanannyi
//     fokot ad hozza, a kicsiknel ez a fo hiba. 45 fok 8-cal tul -> 6.
const float PORGES_OFFSET_FOK = 3.0;
//     PORGES_LASSITAS_MM: a lassu szakasz hossza PORGESBEN (0 = a kozos
//     LASSITAS_MM). Egy 90 fokos fordulat 123 mm kerekenkent, azaz 100-as
//     lassitassal szinte vegig kuszas -- a terhelt kerek ott megall es
//     rangat (robot 2: 90/180 fok 10-15-tel rovid, a 720 pontos). 30-cal
//     a kis fordulat is sebesseggel megy, mint a nagy.
const float PORGES_LASSITAS_MM = 0.0;
//     FEK_ELLEN_PWM: >0 = FIX ellen-hajtas ennyi PWM-mel, amig a kerek
//     meg nem all (a sebessegaranyos FEK_PWM helyett). Erosebb, de a
//     lezart kereken a robot megcsuszhat -- padlon ellenorizd.
const int FEK_ELLEN_PWM = 0;
//     TEMPO: a 3. blokk SEBESSEG_MM_S / PORGES_MM_S szorzoja CSAK ezen a
//     roboton (1,0 = a kozos tempo). Probahoz: 1,5 = masfelszeres.
const float TEMPO = 1.50;


// =====================================================================
//  3. KOZOS SHOW-BEALLITASOK  --  MIND AZ OT ROBOTON UGYANAZ
// =====================================================================

const float SEBESSEG_MM_S = 300.0;   // egyenes haladas
const float PORGES_MM_S   = 300.0;   // a kerekek keruleti sebessege porgesben

const float SZINKRON       = 8.0;    // keresztcsatolas ereje
                                     //   billeg/rangat -> 4.0
                                     //   szetcsuszik   -> 12.0
const float LASSITAS_MM    = 100.0;  // ennyi kerek-mm-rel a cel elott mar
const float LASSU_MM_S     = 150.0;  //   csak ilyen lassan kuszik
const int   RAFUTAS_IMP    = 50;     // ennyi impulzussal a cel elott kapcsol
                                     //   le a hajtas: a fek alatt a ket kerek
                                     //   OSSZESEN kb. ennyit gurul meg
const int   FEK_PWM        = 60;     // aktiv fek: ellen-PWM, amig a kerek
const int   FEK_MAX_MS     = 400;    //   meg nem all, legfeljebb ennyi ms
const int   TURES_IMP      = 16;     // a ket kerek OSSZESEN ennyin belul kesz
const int   JAVITAS_MAX    = 2;      // legfeljebb ennyi utanigazitas
const int   INDULAS_MS     = 300;    // lagy inditas: ennyi ido alatt fut fel a
                                     //   PWM (allasbol ugorva a kerek kiporog)
const int   PWM_PLAFON     = 200;

const unsigned long IDOKORLAT = 20000;

const float SHOW_PI = 3.14159265;


// =====================================================================
//  4. A MOZGATO CIKLUS  --  INNENTOL NEM KELL ALLITANI
// =====================================================================

long imp_bal(float mm)  { return (long)(mm / MM_PER_IMP_BAL  + (mm < 0 ? -0.5 : 0.5)); }
long imp_jobb(float mm) { return (long)(mm / MM_PER_IMP_JOBB + (mm < 0 ? -0.5 : 0.5)); }

long abszolut(long x) { return (x < 0) ? -x : x; }

int hatarol(int v, int also, int felso) {
  if (v < also)  return also;
  if (v > felso) return felso;
  return v;
}

// mm/s -> PWM, a robot sajat mert egyenesevel (es sajat TEMPO-javal)
int pwm_sebessegbol(float mm_s) {
  int p = (int)(PWM_PER_MMS * mm_s * TEMPO + PWM_NULLA + 0.5);
  return hatarol(p, PWM_MIN, PWM_PLAFON);
}

//  Kerek-sebesseg: impulzus / 10 ms a kerek SAJAT iranyaban (+ = halad).
//  (8 imp/10 ms = 800 imp/s ~ 275 mm/s.)

//  AKTIV FEK: ellen-PWM a sebesseggel aranyosan (FEK_PWM 8 imp/10 ms
//  felett), es amint a kerek mar csak kuszik, rovidzar-fek: PWM 1 a
//  TB6612-n 99,6 % "short brake" -- a puszta motor(0,0) keszenlet, azaz
//  szabadon gurulas. Egy fix eros ellen-lokes a kereket megallitja, de a
//  robot tovabb csuszik rajta (2026-09-13: +32 imp a fek UTAN). Kesz, ha
//  mindket kerek 3 egymas utani mintaban allt; legfeljebb FEK_MAX_MS.
void fekez(int irB, int irJ) {
  long pB = encBal, pJ = encJobb;
  int allB = 0, allJ = 0;
  unsigned long t0 = millis();
  while (millis() - t0 < (unsigned long)FEK_MAX_MS) {
    varj(10);
    long nB = encBal, nJ = encJobb;
    long vB = (nB - pB) * irB, vJ = (nJ - pJ) * irJ;
    pB = nB; pJ = nJ;
    allB = (vB <= 1) ? allB + 1 : 0;
    allJ = (vJ <= 1) ? allJ + 1 : 0;
    if (allB >= 3 && allJ >= 3) break;
    int fB = (vB <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vB / 8), 1, FEK_PWM));
    int fJ = (vJ <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vJ / 8), 1, FEK_PWM));
    motor(-irB * fB, -irJ * fJ);
  }
  motor(0, 0);
}

//  cb, cj = elojeles impulzus-cel kerekenkent (+ = elore, - = hatra)
//
//  A mozgas akkor kesz, amikor a ket kerek EGYUTT tette meg a ket cel
//  OSSZEGET -- nem akkor, amikor kulon-kulon mindketto elerte a sajatjat.
//  Egyenesben az osszeg = 2x a tavolsag, porgesben az osszeg adja a
//  szoget ((sB + sJ) / nyomtav), fuggetlenul attol, hogy a ket kerek
//  hogyan osztozott rajta. Igy egyik kerek sem var a masikra hajtas
//  nelkul, es a robot forgasa nem pergeti tovabb (ez adta porgesben a
//  +900 impulzust az elore halado kereken: 2026-09-13-i telemetria).
//
//  TERHELES (lokes): a PWM_PER_MMS egyenes terheletlen kerekre igaz.
//  Porgesben a hatra halado kerek erosen terhelt (58 PWM-en megallt),
//  ezert a ciklus a ket kerek EGYUTTES sebesseget a celhoz meri, es
//  10 ms-onkent 1 PWM-mel emeli (lassu -> +) vagy csokkenti (gyors -> -)
//  a kozos ratartast. Ez a szonyeg / lemerult akku ellen is ved.
//
//  SZINKRON: a ket kerek a SAJAT celjanak hany szazalekan all; aki siet,
//  kevesebb PWM-et kap, aki lemarad, tobbet -- ettol megy egyenesen.
//  A korrekcio +-alap-ig mehet (nem alap/2-ig): porgesben az elore
//  halado kerek terheletlen, 50 vs 105 PWM mellett is az volt a gyorsabb.
//
//  Lefutas: lagy inditas (INDULAS_MS) -> teljes sebesseg -> az utolso LASSITAS_MM-en LASSU_MM_S-sel
//  kuszas (amelyik kerek gyorsabb ennel, az addig rovidzar-feket kap)
//  -> RAFUTAS_IMP-pel a cel elott hajtas le, aktiv fek -> ha az osszeg
//  TURES_IMP-nel tobbel ter el, utanigazitas (mindket kerek a hiba
//  felet), legfeljebb JAVITAS_MAX-szor.
void mozgas(long cb, long cj, int pwm) {
  long celB = abszolut(cb);
  long celJ = abszolut(cj);
  int  irB  = (cb >= 0) ? 1 : -1;
  int  irJ  = (cj >= 0) ? 1 : -1;

  // PORGES = a ket kerek ellentetes iranyba megy (porog_fok). Iranyfuggo
  // trim a celokon (bal kerek hatra = balra porges), es sajat PWM-alap.
  if (irB != irJ) {
    float trim = (cb < 0) ? PORGES_TRIM_BAL : PORGES_TRIM_JOBB;
    float offMm = SHOW_PI * NYOMTAV_MM * (PORGES_OFFSET_FOK / 360.0);   // kerekenkent
    celB = (long)(celB * trim + 0.5) - imp_bal(offMm);
    celJ = (long)(celJ * trim + 0.5) - imp_jobb(offMm);
    if (celB < 0) celB = 0;
    if (celJ < 0) celJ = 0;
    if (PORGES_PWM > 0) pwm = hatarol(PORGES_PWM, PWM_MIN, PWM_PLAFON);
  }
  long celOssz = celB + celJ;

  if (celOssz < 1) { enkoderNullaz(); return; }   // a naplo 0/0-t mutasson, ne a regit

  // a lassu szakasz hossza az OSSZEG terben (mindket kerek LASSITAS_MM-je;
  // porgesben a robot sajat PORGES_LASSITAS_MM-je, ha van)
  float lassMm = (irB != irJ && PORGES_LASSITAS_MM > 0) ? PORGES_LASSITAS_MM : LASSITAS_MM;
  long lassuImp = imp_bal(lassMm) + imp_jobb(lassMm);
  // cel-sebessegek kerekenkent, imp / 10 ms
  float mmPerImp = (MM_PER_IMP_BAL + MM_PER_IMP_JOBB) * 0.5;
  float vCel   = (float)(pwm - PWM_NULLA) / PWM_PER_MMS / mmPerImp / 100.0;
  float vLassu = LASSU_MM_S / mmPerImp / 100.0;
  if (vCel < vLassu) vCel = vLassu;

  enkoderNullaz();
  unsigned long t0 = millis();
  long pB = 0, pJ = 0;
  int  lokes = 0;

  while (true) {
    long eB = encBal * irB;           // haladas a SAJAT iranyban (+)
    long eJ = encJobb * irJ;
    long vB = eB - pB, vJ = eJ - pJ;  // imp / 10 ms
    pB = eB; pJ = eJ;
    long ossz = eB + eJ;
    long hatra = celOssz - ossz;

    if (hatra <= RAFUTAS_IMP) break;
    if (millis() - t0 > IDOKORLAT) {
      uzenet("!!! idokorlat -- a mozgas nem fejezodott be");
      break;
    }

    bool lassu = (hatra <= lassuImp);
    float vKell = lassu ? vLassu : vCel;
    int   alapNyers = lassu ? PWM_MIN : pwm;

    // lagy inditas: az elso INDULAS_MS alatt a PWM egyenletesen fut fel
    unsigned long eltelt = millis() - t0;
    bool indul = eltelt < (unsigned long)INDULAS_MS;
    if (indul) alapNyers = PWM_MIN + (int)((long)(alapNyers - PWM_MIN) * (long)eltelt / INDULAS_MS);

    // kozos terheles-ratartas a ket kerek egyuttes sebessege alapjan
    // (felfutas alatt nem tanul: akkor meg szandekosan lassu)
    float vVan = (float)(vB + vJ) * 0.5;
    if (indul) { /* tart */ }
    else if (vVan < vKell * 0.9 && alapNyers + lokes < PWM_PLAFON) lokes++;
    else if (vVan > vKell * 1.1 && lokes > 0) lokes--;
    int alap = hatarol(alapNyers + lokes, PWM_MIN, PWM_PLAFON);

    // hol tart a ket kerek a SAJAT celjahoz kepest (0..1)
    float fB = (celB < 1) ? 1.0 : (float)eB / (float)celB;
    float fJ = (celJ < 1) ? 1.0 : (float)eJ / (float)celJ;

    // + = a bal siet -> a bal kap kevesebbet, a jobb tobbet
    float hiba = fB - fJ;
    int   korr = hatarol((int)(SZINKRON * hiba * (float)alap), -alap, alap);

    int pwmB = (celB < 1) ? 0 : hatarol(alap - korr, PWM_MIN, PWM_PLAFON);
    int pwmJ = (celJ < 1) ? 0 : hatarol(alap + korr, PWM_MIN, PWM_PLAFON);

    // lassu szakasz: amelyik kerek meg gyorsabb a kuszasnal, rovidzar-fek
    if (lassu && vB > vLassu * 1.2) pwmB = 1;
    if (lassu && vJ > vLassu * 1.2) pwmJ = 1;

    motor(irB * pwmB, irJ * pwmJ);
    varj(10);
  }

  fekez(irB, irJ);
  varj(100);

  // UTANIGAZITAS: az osszeg hibajat a ket kerek felezve hozza be.
  // 5 ms-os ciklus, a kuszas felevel (bang-bang: aki gyorsabb, rovidzar-
  // fek), es egy mintaval ELORE all meg (a kerek allasbol ugorva indul).
  for (int k = 0; k < JAVITAS_MAX; k++) {
    long hiba = celOssz - (encBal * irB + encJobb * irJ);   // + = keves, - = tul sok
    if (abszolut(hiba) <= TURES_IMP) break;
    int   d    = (hiba > 0) ? 1 : -1;
    long  celK = abszolut(hiba) / 2;
    float vKuszo = vLassu * 0.5 * 0.5;                    // imp / 5 ms
    long  sB = encBal, sJ = encJobb;
    long  qB = 0, qJ = 0;
    int   p = PWM_MIN;
    unsigned long t1 = millis();
    while (millis() - t1 < 1500) {
      long mB = (encBal - sB) * irB * d, mJ = (encJobb - sJ) * irJ * d;
      long vB = mB - qB, vJ = mJ - qJ;
      qB = mB; qJ = mJ;
      bool keszB = mB + vB >= celK, keszJ = mJ + vJ >= celK;
      if (keszB && keszJ) break;
      if (vB + vJ == 0 && p < PWM_PLAFON) p++;              // holtsav: emeljuk, amig megindul
      int pB = keszB ? 1 : (vB > vKuszo ? 1 : p);
      int pJ = keszJ ? 1 : (vJ > vKuszo ? 1 : p);
      motor(irB * d * pB, irJ * d * pJ);
      varj(5);
    }
    fekez(irB * d, irJ * d);
    varj(100);
  }

  motor(0, 0);
  varj(200);
}


// =====================================================================
//  5. A MOZGAS-KESZLET  --  ezeket hivod a koreografiaban
// =====================================================================

unsigned long lepesStart = 0;
void lepes_kezd() { lepesStart = millis(); }

// kitolti a lepes idokeretet -- ettol marad szinkronban az ot robot
void lepes_var(unsigned long ido) {
  motor(0, 0);
  while (millis() - lepesStart < ido) varj(20);
}

void megy_cm(float cm) {
  float mm = cm * 10.0;
  long cb = imp_bal(mm * BAL_TRIM), cj = imp_jobb(mm);
  mozgas(cb, cj, pwm_sebessegbol(SEBESSEG_MM_S));
  uzenet("megy " + String(cm, 0) + " cm | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

// + = JOBBRA (oramutato szerint), - = BALRA. Helyben porges.
void porog_fok(float fok) {
  float ivMm = SHOW_PI * NYOMTAV_MM * PORGES_TRIM * (fok / 360.0);
  long cb = imp_bal(ivMm), cj = -imp_jobb(ivMm);
  mozgas(cb, cj, pwm_sebessegbol(PORGES_MM_S));
  uzenet("porog " + String(fok, 0) + " fok | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

void elore_cm(float cm)  { megy_cm(+cm); }
void hatra_cm(float cm)  { megy_cm(-cm); }
void balra_fok(float f)  { porog_fok(-f); }
void jobbra_fok(float f) { porog_fok(+f); }
void balra_kor(float k)  { porog_fok(-360.0 * k); }
void jobbra_kor(float k) { porog_fok(+360.0 * k); }


// =====================================================================
//  6. A KOREOGRAFIA  --  EZT IRD AT (mind az ot roboton UGYANAZ a lista)
// =====================================================================
//
//  Minta:  lepes_kezd();  <mozgas>;  lepes_var(<ezredmasodperc>);
//
//  Az idot a LEGLASSABB robothoz meretezd: a tobbi allva varja ki a
//  maradekot, es igy mind egyszerre lep tovabb. Enelkul a show nehany
//  lepes utan szetcsuszik IDOBEN, akkor is, ha pozicioban mind pontos.

void koreografia() {

  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [1 felvonulas] -> (2950, 900) 90.0 deg  r=45 mm
  lepes_kezd();                                            // [2 szetnyilas a negyzetre] 3 moves in 17000 ms
                 jobbra_fok(90.0);                         // [2 szetnyilas a negyzetre] -> (2950, 900) 0.0 deg  r=45 mm
                 elore_cm(5.0);                            // [2 szetnyilas a negyzetre] -> (3000, 900) 0.0 deg  r=53 mm
                 balra_fok(90.0);                          // [2 szetnyilas a negyzetre] -> (3000, 900) 90.0 deg  r=53 mm
                                       lepes_var(17000);   // [2 szetnyilas a negyzetre] end
  lepes_kezd();                        lepes_var(5000);    // [3 hullam - kozep] hold -> (3000, 900) 90.0 deg  r=53 mm
  lepes_kezd();                        lepes_var(5000);    // [4 hullam - hatso par] hold -> (3000, 900) 90.0 deg  r=53 mm
  lepes_kezd();  balra_fok(360.0);     lepes_var(5000);    // [5 hullam - elso par] -> (3000, 900) 90.0 deg  r=53 mm
  lepes_kezd();  jobbra_fok(720.0);    lepes_var(7500);    // [6 mind porog] -> (3000, 900) 90.0 deg  r=53 mm
  lepes_kezd();                        lepes_var(1000);    // [7 szunet 1] ANCHOR: re-place the robot on its mark by hand -> (3000, 900) 90.0 deg  r=10 mm
  lepes_kezd();                                            // [8 keringo 1 - kozep balra] 2 moves in 13000 ms
                 elore_cm(140.0);                          // [8 keringo 1 - kozep balra] -> (3000, 2300) 90.0 deg  r=174 mm
                 balra_fok(90.0);                          // [8 keringo 1 - kozep balra] -> (3000, 2300) 180.0 deg  r=174 mm
                                       lepes_var(13000);   // [8 keringo 1 - kozep balra] end
  lepes_kezd();                        lepes_var(1000);    // [9 szunet 2] ANCHOR: re-place the robot on its mark by hand -> (3000, 2300) 180.0 deg  r=10 mm
  lepes_kezd();                                            // [10 keringo 2 - kozep jobbra] 2 moves in 13000 ms
                 elore_cm(140.0);                          // [10 keringo 2 - kozep jobbra] -> (1600, 2300) 180.0 deg  r=174 mm
                 balra_fok(90.0);                          // [10 keringo 2 - kozep jobbra] -> (1600, 2300) -90.0 deg  r=174 mm
                                       lepes_var(13000);   // [10 keringo 2 - kozep jobbra] end
  lepes_kezd();                        lepes_var(1000);    // [11 szunet 3] ANCHOR: re-place the robot on its mark by hand -> (1600, 2300) -90.0 deg  r=10 mm
  lepes_kezd();  balra_fok(45.0);      lepes_var(6000);    // [12 csillag - befele] -> (1600, 2300) -45.0 deg  r=10 mm
  lepes_kezd();  elore_cm(25.0);       lepes_var(6000);    // [13 csillag - egy lepes] -> (1777, 2123) -45.0 deg  r=43 mm
  lepes_kezd();                                            // [14 sorba allas 1 - eleje, vege, beallas] 3 moves in 11500 ms
                 jobbra_fok(44.9);                         // [14 sorba allas 1 - eleje, vege, beallas] -> (1777, 2123) -89.9 deg  r=43 mm
                 elore_cm(18.1);                           // [14 sorba allas 1 - eleje, vege, beallas] -> (1777, 1942) -89.9 deg  r=72 mm
                 balra_fok(89.9);                          // [14 sorba allas 1 - eleje, vege, beallas] -> (1777, 1942) 0.0 deg  r=72 mm
                                       lepes_var(11500);   // [14 sorba allas 1 - eleje, vege, beallas] end
  lepes_kezd();                                            // [15 sorba allas 2 - a kozepe] 2 moves in 11500 ms
                 elore_cm(52.3);                           // [15 sorba allas 2 - a kozepe] -> (2300, 1942) 0.0 deg  r=176 mm
                 jobbra_fok(90.0);                         // [15 sorba allas 2 - a kozepe] -> (2300, 1942) -90.0 deg  r=176 mm
                                       lepes_var(11500);   // [15 sorba allas 2 - a kozepe] end
  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [16 egy lepes a kozonseghez] -> (2300, 1642) -90.0 deg  r=252 mm
  lepes_kezd();  jobbra_fok(720.0);    lepes_var(9500);    // [17 zaro porges] -> (2300, 1642) -90.0 deg  r=252 mm
  lepes_kezd();                        lepes_var(1000);    // [18 szunet 4] ANCHOR: re-place the robot on its mark by hand -> (2300, 1642) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [19 hazateres 1 - szetnyilik a sor] 3 moves in 16000 ms
                 balra_fok(90.0);                          // [19 hazateres 1 - szetnyilik a sor] -> (2300, 1642) 0.0 deg  r=10 mm
                 elore_cm(65.0);                           // [19 hazateres 1 - szetnyilik a sor] -> (2950, 1642) 0.0 deg  r=105 mm
                 jobbra_fok(90.0);                         // [19 hazateres 1 - szetnyilik a sor] -> (2950, 1642) -90.0 deg  r=105 mm
                                       lepes_var(16000);   // [19 hazateres 1 - szetnyilik a sor] end
  lepes_kezd();                        lepes_var(1000);    // [20 szunet 5] ANCHOR: re-place the robot on its mark by hand -> (2950, 1642) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [21 hazateres 2 - egyutt a rajtjelre] 2 moves in 13000 ms
                 elore_cm(104.2);                          // [21 hazateres 2 - egyutt a rajtjelre] -> (2950, 600) -90.0 deg  r=132 mm
                 balra_fok(180.0);                         // [21 hazateres 2 - egyutt a rajtjelre] -> (2950, 600) 90.0 deg  r=132 mm
                                       lepes_var(13000);   // [21 hazateres 2 - egyutt a rajtjelre] end
  lepes_kezd();                        lepes_var(2000);    // [22 vege] hold -> (2950, 600) 90.0 deg  r=132 mm

}


// =====================================================================
//  7. INDITAS
// =====================================================================

void indulas() {
  motor(0, 0);
  uzenet("=== SHOW v6 -- robot " + String(ROBOT) + " ===");
  uzenet("sebesseg " + String(SEBESSEG_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(pwm_sebessegbol(SEBESSEG_MM_S))
         + " | porges " + String(PORGES_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(PORGES_PWM > 0 ? PORGES_PWM : pwm_sebessegbol(PORGES_MM_S))
         + " | lassu " + String(LASSU_MM_S, 0) + " mm/s | tempo x" + String(TEMPO, 2)
         + " | fek " + String(FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : FEK_PWM)
         + (FEK_ELLEN_PWM > 0 ? " fix" : " aranyos"));
  uzenet("nyomtav " + String(NYOMTAV_MM, 1) + " | szinkron "
         + String(SZINKRON, 1) + " | lassitas " + String(LASSITAS_MM, 0)
         + " mm | rafutas " + String(RAFUTAS_IMP) + " imp | fek PWM "
         + String(FEK_PWM) + " | tures " + String(TURES_IMP) + " imp");
  uzenet("Indulas 3 mp mulva.");
  varj(3000);

  koreografia();

  motor(0, 0);
  uzenet("=========== SHOW VEGE ===========");
}


// =====================================================================
//  8. VEZERLES
// =====================================================================

void vezerles() {
  motor(0, 0);      // a koreografia az indulas()-ban fut le
}
```

### Robot 5

```cpp
// =====================================================================
//  SHOW -- ROBOT 5   (v6)
//  Enkoderes koreografia vonal nelkul, kerekenkent szinkronizalva.
//
//  EZ A FAJL KET RESZBOL ALL:
//    2. blokk  = PER ROBOT mert adatok   -> robotonkent MAS
//    3. blokk  = KOZOS show-beallitasok  -> mind az ot roboton UGYANAZ
//  A tobbihez nem kell nyulni.
// =====================================================================
//
// ---------------------------------------------------------------------
//  A. HOGYAN MUKODIK
// ---------------------------------------------------------------------
//  Nincs vonal, tehat nincs kulso visszacsatolas. Ami maradt: a ket
//  enkoder. Minden mozgas egy impulzus-cel kerekenkent, es a mozgas()
//  ciklus 10 ms-onkent ujraszamolja a ket PWM-et.
//
//  KESZ = A KET KEREK EGYUTT: a mozgas akkor er veget, amikor a ket
//  enkoder OSSZEGE eleri a ket cel osszeget. Egyenesben ez a tavolsag,
//  porgesben ez a szog ((sB + sJ) / nyomtav) -- fuggetlenul attol,
//  melyik kerek mennyit vitt belole. A regi (v5) valtozat mindket
//  kereket kulon varta meg, es porgesben a hamarabb keszen levo kereket
//  a robot forgasa tovabb pergette: +900 impulzus, +90..120 fok.
//
//  SZINKRON: a ciklus azt nezi, a ket kerek hany SZAZALEKAN all a SAJAT
//  celjanak. Amelyik siet, kevesebb PWM-et kap, amelyik lemarad, tobbet.
//  Ettol megy egyenesen, es ettol marad helyben a porges.
//
//  LASSITAS + AKTIV FEK + UTANIGAZITAS: az utolso LASSITAS_MM-en a robot
//  LASSU_MM_S-sel kuszik, RAFUTAS_IMP-pel a cel elott lekapcsol, majd
//  ellen-PWM-mel fekez, amig a kerekek meg nem allnak (a puszta
//  motor(0,0) a TB6612-n keszenlet = szabadon gurulas). Ha az osszeg
//  igy is TURES_IMP-nel tobbel ter el, a ket kerek lassan behozza.
//
// ---------------------------------------------------------------------
//  B. SEBESSEG -- EGY SZAM, MIND AZ OT ROBOTRA
// ---------------------------------------------------------------------
//  A PWM robotonkent MAST jelent (mas motor, mas surlodas, mas akku).
//  Ezert a koreografia nem PWM-ben, hanem mm/s-ban all: SEBESSEG_MM_S.
//  Minden robot a SAJAT mert PWM/sebesseg egyenesevel szamolja at:
//
//        PWM = PWM_PER_MMS * v + PWM_NULLA
//
//  Igy eleg EGY helyen allitani a sebesseget, es mind az ot ugyanolyan
//  gyorsan megy. A ket atvalto szamot a T7_sebesseg.txt meri robotonkent.
//
// ---------------------------------------------------------------------
//  C. A NAPLOT IGY OLVASD
// ---------------------------------------------------------------------
//  Minden mozgas utan a naplo kiirja: cel bal/jobb -> bal=.. jobb=..
//  A KET SZAM OSSZEGE szamit: az legyen TURES_IMP-en belul a ket cel
//  osszegehez kepest. Porgesben a ket kerek kulon-kulon elterhet
//  (az elore halado kerek terheletlen, a hatra halado terhelt), ez nem
//  hiba, a szog az osszegbol jon.
//  Ha a robot a padlon MEGIS tobbet/kevesebbet fordul, mint a naplo
//  szerint kellene: PORGES_TRIM (2. blokk). Ha az egyenes hosszabb /
//  rovidebb: MM_PER_IMP (T1 tolasi teszt).
//
// ---------------------------------------------------------------------
//  D. AMI NEM JAVITHATO TOVABB
// ---------------------------------------------------------------------
//  Csuszas: a kerek elfordul, a robot megsem oda megy. Az enkoder ezt
//  elvileg sem latja. Nagysagrend: +-10 cm meterenkent, +-20 fok harom
//  porges utan, padlofuggoen. Ne tervezz 20 cm-nel kisebb hezagot ket
//  robot koze, es ne fuzz sok porgest egymas utan -- kulso referencia
//  nelkul a szoghiba osszeadodik.
//
//  Ha a robot ugyanazzal a kodddal futasrol futasra rosszabb lesz:
//  eloszor az AKKUT merd (V parancs), ne a szamokat allitsd.
// =====================================================================


// ============ 1. MELYIK ROBOT VAGYOK ============

#define ROBOT 5


// =====================================================================
//  2. PER ROBOT MERT ADATOK  --  ROBOTONKENT MAS
//     (a MERESI_MENET.md tablazatabol)
// =====================================================================

// --- T1 tolasi teszt + T5 hajtott egyenes ---
const float MM_PER_IMP_BAL  = 0.34582;
const float MM_PER_IMP_JOBB = 0.34392;

// --- T7 sebessegmeres: PWM = PWM_PER_MMS * v + PWM_NULLA ---
//     ELOZETES ertek a T2 D-fazisabol illesztve. Futtasd a T7-et
//     es ird felul -- ez a ket szam teszi egyformava az ot robotot.
const float PWM_PER_MMS = 0.14500;
const float PWM_NULLA   = 26.50;

// --- porges: HANGOLT szam, nem fizikai nyomtav (a csuszast is tartalmazza)
const float NYOMTAV_MM  = 158.6;
const float PORGES_TRIM = 0.987;   // tul sokat porog -> 0,985 | keveset -> 1,015

// --- egyenes futas arany-finomitasa (1,000 = nincs javitas)
//     farat BALRA tolja -> 0,996 | JOBBRA -> 1,004 | egy lepes ~4 mm/meter
const float BAL_TRIM = 1.006;

// --- holtsav (T2 C fazis): bal 20/40, jobb 25/20 -> a legrosszabb 40
const int PWM_MIN = 45;            // ez ala semmilyen szamitas nem viheti

// --- porges es fek finomhangolas (2026-09-21, robot 5). 0 / 1,00 = a
//     3. blokk kozos beallitasa ervenyes, a tobbi robot igy fut.
//     PORGES_PWM: >0 = ez a PWM az alap porgesben a PORGES_MM_S-bol
//     szamolt helyett. Nagyobb alap: a terhelt (hatra halado) kerek
//     azonnal kap nyomatekot, es a szinkronnak van hova levinnie a
//     sieto szabad kereket (a PWM_MIN alatt nem mehet).
const int PORGES_PWM = 0;
//     iranyfuggo trim a PORGES_TRIM-en FELUL: balra keveset fordul ->
//     _BAL 1,02 | jobbra sokat -> _JOBB 0,98. A naplo "cel" oszlopa a
//     trim NELKULI cel, az enkoder-osszeg a cel x trim koze all be.
const float PORGES_TRIM_BAL  = 1.000;
const float PORGES_TRIM_JOBB = 1.000;
//     PORGES_OFFSET_FOK: FIX fok, amit MINDEN porgesbol levonunk -- a
//     megallas (rafutas + fek alatti csuszas) minden porgesnel ugyanannyi
//     fokot ad hozza, a kicsiknel ez a fo hiba. 45 fok 8-cal tul -> 6.
const float PORGES_OFFSET_FOK = 6.0;
//     PORGES_LASSITAS_MM: a lassu szakasz hossza PORGESBEN (0 = a kozos
//     LASSITAS_MM). Egy 90 fokos fordulat 123 mm kerekenkent, azaz 100-as
//     lassitassal szinte vegig kuszas -- a terhelt kerek ott megall es
//     rangat (robot 2: 90/180 fok 10-15-tel rovid, a 720 pontos). 30-cal
//     a kis fordulat is sebesseggel megy, mint a nagy.
const float PORGES_LASSITAS_MM = 0.0;
//     FEK_ELLEN_PWM: >0 = FIX ellen-hajtas ennyi PWM-mel, amig a kerek
//     meg nem all (a sebessegaranyos FEK_PWM helyett). Erosebb, de a
//     lezart kereken a robot megcsuszhat -- padlon ellenorizd.
const int FEK_ELLEN_PWM = 60;
//     TEMPO: a 3. blokk SEBESSEG_MM_S / PORGES_MM_S szorzoja CSAK ezen a
//     roboton (1,0 = a kozos tempo). Probahoz: 1,5 = masfelszeres.
const float TEMPO = 1.50;


// =====================================================================
//  3. KOZOS SHOW-BEALLITASOK  --  MIND AZ OT ROBOTON UGYANAZ
// =====================================================================

const float SEBESSEG_MM_S = 300.0;   // egyenes haladas
const float PORGES_MM_S   = 300.0;   // a kerekek keruleti sebessege porgesben

const float SZINKRON       = 8.0;    // keresztcsatolas ereje
                                     //   billeg/rangat -> 4.0
                                     //   szetcsuszik   -> 12.0
const float LASSITAS_MM    = 100.0;  // ennyi kerek-mm-rel a cel elott mar
const float LASSU_MM_S     = 150.0;  //   csak ilyen lassan kuszik
const int   RAFUTAS_IMP    = 50;     // ennyi impulzussal a cel elott kapcsol
                                     //   le a hajtas: a fek alatt a ket kerek
                                     //   OSSZESEN kb. ennyit gurul meg
const int   FEK_PWM        = 60;     // aktiv fek: ellen-PWM, amig a kerek
const int   FEK_MAX_MS     = 400;    //   meg nem all, legfeljebb ennyi ms
const int   TURES_IMP      = 16;     // a ket kerek OSSZESEN ennyin belul kesz
const int   JAVITAS_MAX    = 2;      // legfeljebb ennyi utanigazitas
const int   INDULAS_MS     = 300;    // lagy inditas: ennyi ido alatt fut fel a
                                     //   PWM (allasbol ugorva a kerek kiporog)
const int   PWM_PLAFON     = 200;

const unsigned long IDOKORLAT = 20000;

const float SHOW_PI = 3.14159265;


// =====================================================================
//  4. A MOZGATO CIKLUS  --  INNENTOL NEM KELL ALLITANI
// =====================================================================

long imp_bal(float mm)  { return (long)(mm / MM_PER_IMP_BAL  + (mm < 0 ? -0.5 : 0.5)); }
long imp_jobb(float mm) { return (long)(mm / MM_PER_IMP_JOBB + (mm < 0 ? -0.5 : 0.5)); }

long abszolut(long x) { return (x < 0) ? -x : x; }

int hatarol(int v, int also, int felso) {
  if (v < also)  return also;
  if (v > felso) return felso;
  return v;
}

// mm/s -> PWM, a robot sajat mert egyenesevel (es sajat TEMPO-javal)
int pwm_sebessegbol(float mm_s) {
  int p = (int)(PWM_PER_MMS * mm_s * TEMPO + PWM_NULLA + 0.5);
  return hatarol(p, PWM_MIN, PWM_PLAFON);
}

//  Kerek-sebesseg: impulzus / 10 ms a kerek SAJAT iranyaban (+ = halad).
//  (8 imp/10 ms = 800 imp/s ~ 275 mm/s.)

//  AKTIV FEK: ellen-PWM a sebesseggel aranyosan (FEK_PWM 8 imp/10 ms
//  felett), es amint a kerek mar csak kuszik, rovidzar-fek: PWM 1 a
//  TB6612-n 99,6 % "short brake" -- a puszta motor(0,0) keszenlet, azaz
//  szabadon gurulas. Egy fix eros ellen-lokes a kereket megallitja, de a
//  robot tovabb csuszik rajta (2026-09-13: +32 imp a fek UTAN). Kesz, ha
//  mindket kerek 3 egymas utani mintaban allt; legfeljebb FEK_MAX_MS.
void fekez(int irB, int irJ) {
  long pB = encBal, pJ = encJobb;
  int allB = 0, allJ = 0;
  unsigned long t0 = millis();
  while (millis() - t0 < (unsigned long)FEK_MAX_MS) {
    varj(10);
    long nB = encBal, nJ = encJobb;
    long vB = (nB - pB) * irB, vJ = (nJ - pJ) * irJ;
    pB = nB; pJ = nJ;
    allB = (vB <= 1) ? allB + 1 : 0;
    allJ = (vJ <= 1) ? allJ + 1 : 0;
    if (allB >= 3 && allJ >= 3) break;
    int fB = (vB <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vB / 8), 1, FEK_PWM));
    int fJ = (vJ <= 1) ? 1 : (FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : hatarol((int)(FEK_PWM * vJ / 8), 1, FEK_PWM));
    motor(-irB * fB, -irJ * fJ);
  }
  motor(0, 0);
}

//  cb, cj = elojeles impulzus-cel kerekenkent (+ = elore, - = hatra)
//
//  A mozgas akkor kesz, amikor a ket kerek EGYUTT tette meg a ket cel
//  OSSZEGET -- nem akkor, amikor kulon-kulon mindketto elerte a sajatjat.
//  Egyenesben az osszeg = 2x a tavolsag, porgesben az osszeg adja a
//  szoget ((sB + sJ) / nyomtav), fuggetlenul attol, hogy a ket kerek
//  hogyan osztozott rajta. Igy egyik kerek sem var a masikra hajtas
//  nelkul, es a robot forgasa nem pergeti tovabb (ez adta porgesben a
//  +900 impulzust az elore halado kereken: 2026-09-13-i telemetria).
//
//  TERHELES (lokes): a PWM_PER_MMS egyenes terheletlen kerekre igaz.
//  Porgesben a hatra halado kerek erosen terhelt (58 PWM-en megallt),
//  ezert a ciklus a ket kerek EGYUTTES sebesseget a celhoz meri, es
//  10 ms-onkent 1 PWM-mel emeli (lassu -> +) vagy csokkenti (gyors -> -)
//  a kozos ratartast. Ez a szonyeg / lemerult akku ellen is ved.
//
//  SZINKRON: a ket kerek a SAJAT celjanak hany szazalekan all; aki siet,
//  kevesebb PWM-et kap, aki lemarad, tobbet -- ettol megy egyenesen.
//  A korrekcio +-alap-ig mehet (nem alap/2-ig): porgesben az elore
//  halado kerek terheletlen, 50 vs 105 PWM mellett is az volt a gyorsabb.
//
//  Lefutas: lagy inditas (INDULAS_MS) -> teljes sebesseg -> az utolso LASSITAS_MM-en LASSU_MM_S-sel
//  kuszas (amelyik kerek gyorsabb ennel, az addig rovidzar-feket kap)
//  -> RAFUTAS_IMP-pel a cel elott hajtas le, aktiv fek -> ha az osszeg
//  TURES_IMP-nel tobbel ter el, utanigazitas (mindket kerek a hiba
//  felet), legfeljebb JAVITAS_MAX-szor.
void mozgas(long cb, long cj, int pwm) {
  long celB = abszolut(cb);
  long celJ = abszolut(cj);
  int  irB  = (cb >= 0) ? 1 : -1;
  int  irJ  = (cj >= 0) ? 1 : -1;

  // PORGES = a ket kerek ellentetes iranyba megy (porog_fok). Iranyfuggo
  // trim a celokon (bal kerek hatra = balra porges), es sajat PWM-alap.
  if (irB != irJ) {
    float trim = (cb < 0) ? PORGES_TRIM_BAL : PORGES_TRIM_JOBB;
    float offMm = SHOW_PI * NYOMTAV_MM * (PORGES_OFFSET_FOK / 360.0);   // kerekenkent
    celB = (long)(celB * trim + 0.5) - imp_bal(offMm);
    celJ = (long)(celJ * trim + 0.5) - imp_jobb(offMm);
    if (celB < 0) celB = 0;
    if (celJ < 0) celJ = 0;
    if (PORGES_PWM > 0) pwm = hatarol(PORGES_PWM, PWM_MIN, PWM_PLAFON);
  }
  long celOssz = celB + celJ;

  if (celOssz < 1) { enkoderNullaz(); return; }   // a naplo 0/0-t mutasson, ne a regit

  // a lassu szakasz hossza az OSSZEG terben (mindket kerek LASSITAS_MM-je;
  // porgesben a robot sajat PORGES_LASSITAS_MM-je, ha van)
  float lassMm = (irB != irJ && PORGES_LASSITAS_MM > 0) ? PORGES_LASSITAS_MM : LASSITAS_MM;
  long lassuImp = imp_bal(lassMm) + imp_jobb(lassMm);
  // cel-sebessegek kerekenkent, imp / 10 ms
  float mmPerImp = (MM_PER_IMP_BAL + MM_PER_IMP_JOBB) * 0.5;
  float vCel   = (float)(pwm - PWM_NULLA) / PWM_PER_MMS / mmPerImp / 100.0;
  float vLassu = LASSU_MM_S / mmPerImp / 100.0;
  if (vCel < vLassu) vCel = vLassu;

  enkoderNullaz();
  unsigned long t0 = millis();
  long pB = 0, pJ = 0;
  int  lokes = 0;

  while (true) {
    long eB = encBal * irB;           // haladas a SAJAT iranyban (+)
    long eJ = encJobb * irJ;
    long vB = eB - pB, vJ = eJ - pJ;  // imp / 10 ms
    pB = eB; pJ = eJ;
    long ossz = eB + eJ;
    long hatra = celOssz - ossz;

    if (hatra <= RAFUTAS_IMP) break;
    if (millis() - t0 > IDOKORLAT) {
      uzenet("!!! idokorlat -- a mozgas nem fejezodott be");
      break;
    }

    bool lassu = (hatra <= lassuImp);
    float vKell = lassu ? vLassu : vCel;
    int   alapNyers = lassu ? PWM_MIN : pwm;

    // lagy inditas: az elso INDULAS_MS alatt a PWM egyenletesen fut fel
    unsigned long eltelt = millis() - t0;
    bool indul = eltelt < (unsigned long)INDULAS_MS;
    if (indul) alapNyers = PWM_MIN + (int)((long)(alapNyers - PWM_MIN) * (long)eltelt / INDULAS_MS);

    // kozos terheles-ratartas a ket kerek egyuttes sebessege alapjan
    // (felfutas alatt nem tanul: akkor meg szandekosan lassu)
    float vVan = (float)(vB + vJ) * 0.5;
    if (indul) { /* tart */ }
    else if (vVan < vKell * 0.9 && alapNyers + lokes < PWM_PLAFON) lokes++;
    else if (vVan > vKell * 1.1 && lokes > 0) lokes--;
    int alap = hatarol(alapNyers + lokes, PWM_MIN, PWM_PLAFON);

    // hol tart a ket kerek a SAJAT celjahoz kepest (0..1)
    float fB = (celB < 1) ? 1.0 : (float)eB / (float)celB;
    float fJ = (celJ < 1) ? 1.0 : (float)eJ / (float)celJ;

    // + = a bal siet -> a bal kap kevesebbet, a jobb tobbet
    float hiba = fB - fJ;
    int   korr = hatarol((int)(SZINKRON * hiba * (float)alap), -alap, alap);

    int pwmB = (celB < 1) ? 0 : hatarol(alap - korr, PWM_MIN, PWM_PLAFON);
    int pwmJ = (celJ < 1) ? 0 : hatarol(alap + korr, PWM_MIN, PWM_PLAFON);

    // lassu szakasz: amelyik kerek meg gyorsabb a kuszasnal, rovidzar-fek
    if (lassu && vB > vLassu * 1.2) pwmB = 1;
    if (lassu && vJ > vLassu * 1.2) pwmJ = 1;

    motor(irB * pwmB, irJ * pwmJ);
    varj(10);
  }

  fekez(irB, irJ);
  varj(100);

  // UTANIGAZITAS: az osszeg hibajat a ket kerek felezve hozza be.
  // 5 ms-os ciklus, a kuszas felevel (bang-bang: aki gyorsabb, rovidzar-
  // fek), es egy mintaval ELORE all meg (a kerek allasbol ugorva indul).
  for (int k = 0; k < JAVITAS_MAX; k++) {
    long hiba = celOssz - (encBal * irB + encJobb * irJ);   // + = keves, - = tul sok
    if (abszolut(hiba) <= TURES_IMP) break;
    int   d    = (hiba > 0) ? 1 : -1;
    long  celK = abszolut(hiba) / 2;
    float vKuszo = vLassu * 0.5 * 0.5;                    // imp / 5 ms
    long  sB = encBal, sJ = encJobb;
    long  qB = 0, qJ = 0;
    int   p = PWM_MIN;
    unsigned long t1 = millis();
    while (millis() - t1 < 1500) {
      long mB = (encBal - sB) * irB * d, mJ = (encJobb - sJ) * irJ * d;
      long vB = mB - qB, vJ = mJ - qJ;
      qB = mB; qJ = mJ;
      bool keszB = mB + vB >= celK, keszJ = mJ + vJ >= celK;
      if (keszB && keszJ) break;
      if (vB + vJ == 0 && p < PWM_PLAFON) p++;              // holtsav: emeljuk, amig megindul
      int pB = keszB ? 1 : (vB > vKuszo ? 1 : p);
      int pJ = keszJ ? 1 : (vJ > vKuszo ? 1 : p);
      motor(irB * d * pB, irJ * d * pJ);
      varj(5);
    }
    fekez(irB * d, irJ * d);
    varj(100);
  }

  motor(0, 0);
  varj(200);
}


// =====================================================================
//  5. A MOZGAS-KESZLET  --  ezeket hivod a koreografiaban
// =====================================================================

unsigned long lepesStart = 0;
void lepes_kezd() { lepesStart = millis(); }

// kitolti a lepes idokeretet -- ettol marad szinkronban az ot robot
void lepes_var(unsigned long ido) {
  motor(0, 0);
  while (millis() - lepesStart < ido) varj(20);
}

void megy_cm(float cm) {
  float mm = cm * 10.0;
  long cb = imp_bal(mm * BAL_TRIM), cj = imp_jobb(mm);
  mozgas(cb, cj, pwm_sebessegbol(SEBESSEG_MM_S));
  uzenet("megy " + String(cm, 0) + " cm | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

// + = JOBBRA (oramutato szerint), - = BALRA. Helyben porges.
void porog_fok(float fok) {
  float ivMm = SHOW_PI * NYOMTAV_MM * PORGES_TRIM * (fok / 360.0);
  long cb = imp_bal(ivMm), cj = -imp_jobb(ivMm);
  mozgas(cb, cj, pwm_sebessegbol(PORGES_MM_S));
  uzenet("porog " + String(fok, 0) + " fok | cel " + String(cb) + "/" + String(cj)
         + " -> bal=" + String(encBal) + " jobb=" + String(encJobb));
}

void elore_cm(float cm)  { megy_cm(+cm); }
void hatra_cm(float cm)  { megy_cm(-cm); }
void balra_fok(float f)  { porog_fok(-f); }
void jobbra_fok(float f) { porog_fok(+f); }
void balra_kor(float k)  { porog_fok(-360.0 * k); }
void jobbra_kor(float k) { porog_fok(+360.0 * k); }


// =====================================================================
//  6. A KOREOGRAFIA  --  EZT IRD AT (mind az ot roboton UGYANAZ a lista)
// =====================================================================
//
//  Minta:  lepes_kezd();  <mozgas>;  lepes_var(<ezredmasodperc>);
//
//  Az idot a LEGLASSABB robothoz meretezd: a tobbi allva varja ki a
//  maradekot, es igy mind egyszerre lep tovabb. Enelkul a show nehany
//  lepes utan szetcsuszik IDOBEN, akkor is, ha pozicioban mind pontos.

void koreografia() {

  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [1 felvonulas] -> (3700, 900) 90.0 deg  r=45 mm
  lepes_kezd();                                            // [2 szetnyilas a negyzetre] 3 moves in 17000 ms
                 balra_fok(26.6);                          // [2 szetnyilas a negyzetre] -> (3700, 900) 116.6 deg  r=45 mm
                 elore_cm(156.5);                          // [2 szetnyilas a negyzetre] -> (2999, 2299) 116.6 deg  r=267 mm
                 balra_fok(63.4);                          // [2 szetnyilas a negyzetre] -> (2999, 2299) 180.0 deg  r=267 mm
                                       lepes_var(17000);   // [2 szetnyilas a negyzetre] end
  lepes_kezd();                        lepes_var(5000);    // [3 hullam - kozep] hold -> (2999, 2299) 180.0 deg  r=267 mm
  lepes_kezd();  balra_fok(360.0);     lepes_var(5000);    // [4 hullam - hatso par] -> (2999, 2299) 180.0 deg  r=267 mm
  lepes_kezd();                        lepes_var(5000);    // [5 hullam - elso par] hold -> (2999, 2299) 180.0 deg  r=267 mm
  lepes_kezd();  balra_fok(720.0);     lepes_var(7500);    // [6 mind porog] -> (2999, 2299) 180.0 deg  r=267 mm
  lepes_kezd();                        lepes_var(1000);    // [7 szunet 1] ANCHOR: re-place the robot on its mark by hand -> (2999, 2299) 180.0 deg  r=10 mm
  lepes_kezd();                                            // [8 keringo 1 - kozep balra] 2 moves in 13000 ms
                 elore_cm(139.9);                          // [8 keringo 1 - kozep balra] -> (1600, 2299) 180.0 deg  r=174 mm
                 balra_fok(90.0);                          // [8 keringo 1 - kozep balra] -> (1600, 2299) -90.0 deg  r=174 mm
                                       lepes_var(13000);   // [8 keringo 1 - kozep balra] end
  lepes_kezd();                        lepes_var(1000);    // [9 szunet 2] ANCHOR: re-place the robot on its mark by hand -> (1600, 2299) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [10 keringo 2 - kozep jobbra] 2 moves in 13000 ms
                 elore_cm(139.9);                          // [10 keringo 2 - kozep jobbra] -> (1600, 900) -90.0 deg  r=174 mm
                 balra_fok(90.0);                          // [10 keringo 2 - kozep jobbra] -> (1600, 900) 0.0 deg  r=174 mm
                                       lepes_var(13000);   // [10 keringo 2 - kozep jobbra] end
  lepes_kezd();                        lepes_var(1000);    // [11 szunet 3] ANCHOR: re-place the robot on its mark by hand -> (1600, 900) 0.0 deg  r=10 mm
  lepes_kezd();  balra_fok(45.0);      lepes_var(6000);    // [12 csillag - befele] -> (1600, 900) 45.0 deg  r=10 mm
  lepes_kezd();  elore_cm(25.0);       lepes_var(6000);    // [13 csillag - egy lepes] -> (1777, 1077) 45.0 deg  r=43 mm
  lepes_kezd();                                            // [14 sorba allas 1 - eleje, vege, beallas] 3 moves in 11500 ms
                 jobbra_fok(62.1);                         // [14 sorba allas 1 - eleje, vege, beallas] -> (1777, 1077) -17.1 deg  r=43 mm
                 elore_cm(54.7);                           // [14 sorba allas 1 - eleje, vege, beallas] -> (2300, 916) -17.1 deg  r=133 mm
                 jobbra_fok(72.9);                         // [14 sorba allas 1 - eleje, vege, beallas] -> (2300, 916) -90.0 deg  r=133 mm
                                       lepes_var(11500);   // [14 sorba allas 1 - eleje, vege, beallas] end
  lepes_kezd();                        lepes_var(11500);   // [15 sorba allas 2 - a kozepe] hold -> (2300, 916) -90.0 deg  r=133 mm
  lepes_kezd();  elore_cm(30.0);       lepes_var(5000);    // [16 egy lepes a kozonseghez] -> (2300, 616) -90.0 deg  r=199 mm
  lepes_kezd();  balra_fok(720.0);     lepes_var(9500);    // [17 zaro porges] -> (2300, 616) -90.0 deg  r=199 mm
  lepes_kezd();                        lepes_var(1000);    // [18 szunet 4] ANCHOR: re-place the robot on its mark by hand -> (2300, 616) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [19 hazateres 1 - szetnyilik a sor] 3 moves in 16000 ms
                 balra_fok(90.0);                          // [19 hazateres 1 - szetnyilik a sor] -> (2300, 616) 0.0 deg  r=10 mm
                 elore_cm(140.0);                          // [19 hazateres 1 - szetnyilik a sor] -> (3700, 616) 0.0 deg  r=215 mm
                 jobbra_fok(90.0);                         // [19 hazateres 1 - szetnyilik a sor] -> (3700, 616) -90.0 deg  r=215 mm
                                       lepes_var(16000);   // [19 hazateres 1 - szetnyilik a sor] end
  lepes_kezd();                        lepes_var(1000);    // [20 szunet 5] ANCHOR: re-place the robot on its mark by hand -> (3700, 616) -90.0 deg  r=10 mm
  lepes_kezd();                                            // [21 hazateres 2 - egyutt a rajtjelre] 3 moves in 13000 ms
                 balra_fok(0.5);                           // [21 hazateres 2 - egyutt a rajtjelre] -> (3700, 616) -89.5 deg  r=10 mm
                 elore_cm(1.6);                            // [21 hazateres 2 - egyutt a rajtjelre] -> (3700, 600) -89.5 deg  r=12 mm
                 balra_fok(179.5);                         // [21 hazateres 2 - egyutt a rajtjelre] -> (3700, 600) 90.0 deg  r=12 mm
                                       lepes_var(13000);   // [21 hazateres 2 - egyutt a rajtjelre] end
  lepes_kezd();                        lepes_var(2000);    // [22 vege] hold -> (3700, 600) 90.0 deg  r=12 mm

}


// =====================================================================
//  7. INDITAS
// =====================================================================

void indulas() {
  motor(0, 0);
  uzenet("=== SHOW v6 -- robot " + String(ROBOT) + " ===");
  uzenet("sebesseg " + String(SEBESSEG_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(pwm_sebessegbol(SEBESSEG_MM_S))
         + " | porges " + String(PORGES_MM_S * TEMPO, 0) + " mm/s -> PWM "
         + String(PORGES_PWM > 0 ? PORGES_PWM : pwm_sebessegbol(PORGES_MM_S))
         + " | lassu " + String(LASSU_MM_S, 0) + " mm/s | tempo x" + String(TEMPO, 2)
         + " | fek " + String(FEK_ELLEN_PWM > 0 ? FEK_ELLEN_PWM : FEK_PWM)
         + (FEK_ELLEN_PWM > 0 ? " fix" : " aranyos"));
  uzenet("nyomtav " + String(NYOMTAV_MM, 1) + " | szinkron "
         + String(SZINKRON, 1) + " | lassitas " + String(LASSITAS_MM, 0)
         + " mm | rafutas " + String(RAFUTAS_IMP) + " imp | fek PWM "
         + String(FEK_PWM) + " | tures " + String(TURES_IMP) + " imp");
  uzenet("Indulas 3 mp mulva.");
  varj(3000);

  koreografia();

  motor(0, 0);
  uzenet("=========== SHOW VEGE ===========");
}


// =====================================================================
//  8. VEZERLES
// =====================================================================

void vezerles() {
  motor(0, 0);      // a koreografia az indulas()-ban fut le
}
```

## Change log

- 2026-09-21 — first approved version. Robots 1–4 from robots.json; robot 5 placeholder.
- 2026-09-21 — robot 5 replaced (bad encoders on the first chassis). New one flashed keret-ep v7, named TaborRobot-5,
  provisional bring-up calibration in robots.json (robot 1's numbers, NYOMTAV 148.3, PWM_MIN 45) — marked PROVISIONAL here.
- 2026-09-21 — **robot 5 approved** after two 1 m / 3-spin runs (`RobotBaseStats/SHOW_robot5.md`): NYOMTAV 158.6,
  BAL_TRIM 1.020. All five robots final; this is the version to flash for the first full rehearsal.
