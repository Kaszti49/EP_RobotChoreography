# SHOW_robot3 — robot 3 show sketch (v6 engine, firmware v7)

The sketch running on robot 3 as of 2026-09-14 (emitted by the site from `koreografia/data/robots.json`):
track 152.5 mm (at robot 1's 148.3 both 3-spin turns ended 30° short → × 1080/1050; approved on the floor),
PWM_MIN 45, speed line 0.145 / 9.30 and MM_PER_IMP copied from robot 1 (1 m forward and back land on the
mark), BAL_TRIM 1.000 (no drift seen). Wired like robot 1 — `N,AUTO` gave `N,-1,1,-1,1,0`, no cross-wiring flag.
Brought up from a Mac: flashed over USB (`/dev/cu.usbserial-0001`, Apple's built-in CP210x driver), renamed with
`B,3`, this sketch then pushed over Bluetooth OTA (1.1 MB in 130 s — macOS SPP does ~8 kB/s, Windows did 60).
Encoder log of the approved run (fresh pack, 9.3 V): 1 m → 2891/2906 of 2892/2908; back → −2908/−2901;
3 spins left → −4102/4234 (sum 8336 of 8335); 3 spins right → 4277/−4058 (sum 8335) — every move on its target.
Test choreography: `koreografia/data/teszt-1m-3kor.json` (robots 1, 2 and 3 side by side, 1.2 m apart).

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
const float PORGES_TRIM = 1.00;    // tul sokat porog -> 0,98 | keveset -> 1,02

// --- egyenes futas arany-finomitasa (1,000 = nincs javitas)
//     farat BALRA tolja -> 0,996 | JOBBRA -> 1,004 | egy lepes ~4 mm/meter
const float BAL_TRIM = 1.000;

// --- holtsav (T2 C fazis): bal 20/40, jobb 25/20 -> a legrosszabb 40
const int PWM_MIN = 45;            // ez ala semmilyen szamitas nem viheti


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

// mm/s -> PWM, a robot sajat mert egyenesevel
int pwm_sebessegbol(float mm_s) {
  int p = (int)(PWM_PER_MMS * mm_s + PWM_NULLA + 0.5);
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
    int fB = (vB <= 1) ? 1 : hatarol((int)(FEK_PWM * vB / 8), 1, FEK_PWM);
    int fJ = (vJ <= 1) ? 1 : hatarol((int)(FEK_PWM * vJ / 8), 1, FEK_PWM);
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
  long celOssz = celB + celJ;

  if (celOssz < 1) return;

  // a lassu szakasz hossza az OSSZEG terben (mindket kerek LASSITAS_MM-je)
  long lassuImp = imp_bal(LASSITAS_MM) + imp_jobb(LASSITAS_MM);
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

  lepes_kezd();  elore_cm(100.0);      lepes_var(8000);    // [1 elore 1 m] -> (3200, 1800) 90.0 deg  r=127 mm
  lepes_kezd();                        lepes_var(1000);    // [2 all] hold -> (3200, 1800) 90.0 deg  r=127 mm
  lepes_kezd();  hatra_cm(100.0);      lepes_var(8000);    // [3 hatra 1 m] -> (3200, 800) 90.0 deg  r=297 mm
  lepes_kezd();                        lepes_var(1000);    // [4 all] hold -> (3200, 800) 90.0 deg  r=297 mm
  lepes_kezd();  balra_fok(1080.0);    lepes_var(16000);   // [5 3 kor balra] -> (3200, 800) 90.0 deg  r=297 mm
  lepes_kezd();                        lepes_var(1000);    // [6 all] hold -> (3200, 800) 90.0 deg  r=297 mm
  lepes_kezd();  jobbra_fok(1080.0);   lepes_var(16000);   // [7 3 kor jobbra] -> (3200, 800) 90.0 deg  r=297 mm

}


// =====================================================================
//  7. INDITAS
// =====================================================================

void indulas() {
  motor(0, 0);
  uzenet("=== SHOW v6 -- robot " + String(ROBOT) + " ===");
  uzenet("sebesseg " + String(SEBESSEG_MM_S, 0) + " mm/s -> PWM "
         + String(pwm_sebessegbol(SEBESSEG_MM_S))
         + " | porges " + String(PORGES_MM_S, 0) + " mm/s -> PWM "
         + String(pwm_sebessegbol(PORGES_MM_S))
         + " | lassu " + String(LASSU_MM_S, 0) + " mm/s");
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
