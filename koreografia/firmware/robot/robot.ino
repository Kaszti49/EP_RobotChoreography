// =====================================================================
//  robot.ino -- SAJAT KERET  (EP_RobotChoreography, "keret-ep" v1)
//
//  A tabori "keret 2.0" forrasa nincs meg, ezert ez a fajl adja ujra
//  azt az API-t, amit a SHOW_robot*.txt vazlatok hasznalnak
//  (Sources/Segedlet.txt): motor(), varj(), uzenet(), enkoderNullaz(),
//  menj(), encBal/encJobb, szenzor*[] es a Muszerfal-parancsok.
//
//  Labkiosztas: Sources/Labbekotesi tablazat.txt (ESP32 DevKit 38 lab).
//
//  A show maga a show.ino-ban van (a fordito altal kibocsatott .txt,
//  atnevezve). Ez a fajl ele kerul a forditasban, tehat a globalisok
//  itt vannak deklaralva.
//
//  Parancsok (USB soros ES Bluetooth SPP, egy sor = egy parancs):
//    T                inditas: indulas() egyszer, aztan vezerles() 20 ms-onkent
//    S | A            STOP: feladat torolve, motorok 0
//    M,<bal>,<jobb>   kezi motor (-255..255), csak ha nem fut feladat;
//                     1,5 s utan magatol leall, ha nem jon ujabb M
//    G,<iB>,<iJ>[,pwm] menj(): enkoder-cel impulzusban
//    Z                enkoderek nullazasa
//    P                info-sor
//    V                akkufeszultseg (mV)
//    D                diagnosztika
//    R,<hz>           telemetria, 0 = ki. Soronkent:
//                     E,<encBal>,<encJobb>,<mV>,<allapot>,<s1>,<s2>,<s3>,<s4>,<s5>,<pwmBal>,<pwmJobb>,<vonalpoz>
//                     (vonalpoz -2000..2000, 9999 = nincs vonal)
//    L                szenzor-kalibralas 3 s: kozben told a robotot a vonalon at;
//                     feher = max, fekete = min, NVS-be mentve. Valasz: L,OK,<feher1/../5>,<fekete1/../5>
//    L,?              a mentett kalibracio (ugyanabban a formaban)
//    H                kerek-meres: mindket kerek 120 PWM 1 s-ig, valasz H,<encBal>,<encJobb>,<jobb/bal arany>
//                     (L es H azert, mert a tabori keretben K es W mast jelent -- sebesseg-PI)
//    N | N,AUTO | N,<encL>,<encR>,<motL>,<motR>   elojelek (NVS-be mentve)
//    B,<n> | B,<nev>  Bluetooth-nev (TaborRobot-<n> / Tabor-<nev>), utana ujraindul
//    F,<meret>[,<md5>] firmware-frissites -- SAJAT protokoll, lasd lent
//
//  OTA protokoll (transport/ota.js ugyanezt beszeli):
//    gazda:  F,<meret>,<md5hex>\n
//    robot:  F,READY\n                  (vagy F,ERR,<ok>\n)
//    gazda:  nyers bajtok, tetszoleges darabokban
//    robot:  F,ACK,<eddig>\n  minden 4096 bajt utan (es a vegen)
//    robot:  F,OK\n  majd ujraindul   | F,ERR,<ok>\n
//    10 s adatcsend = megszakitas.
// =====================================================================

#include <Arduino.h>
#include <BluetoothSerial.h>
#include <Preferences.h>
#include <Update.h>

#define KERET_VERZIO "keret-ep v6"

// ---------------------------------------------------------------------
//  Labak
// ---------------------------------------------------------------------
static const int PIN_PWMA = 16, PIN_AIN1 = 17, PIN_AIN2 = 5;    // bal motor
static const int PIN_PWMB = 4,  PIN_BIN1 = 18, PIN_BIN2 = 19;   // jobb motor
static const int PIN_STBY = 23;
static const int PIN_ENC_BAL_A = 25, PIN_ENC_BAL_B = 26;
static const int PIN_ENC_JOBB_A = 27, PIN_ENC_JOBB_B = 14;
static const int PIN_AKKU = 33;                                 // 5:1 oszto
const uint8_t SENSOR_PIN[5] = {36, 39, 34, 35, 32};

static const int   PWM_FREQ_HZ = 20000;
static const int   PWM_BITS    = 8;
static const int   AKKU_MIN_MV = 6800;     // ez alatt a motorok tiltva
static const int   AKKU_FIGY_MV = 7400;    // ez alatt figyelmeztetes
static const unsigned long KEZI_IDOKORLAT_MS = 1500;
static const unsigned long OTA_CSEND_MS = 10000;

// ---------------------------------------------------------------------
//  A vazlatok altal hasznalt globalisok (Segedlet.txt)
// ---------------------------------------------------------------------
volatile long encBal = 0, encJobb = 0;
int   szenzor[5] = {0, 0, 0, 0, 0};
int   szenzorNorm[5] = {0, 0, 0, 0, 0};
bool  vonalLatszik = false;
int   kalFeher[5] = {4095, 4095, 4095, 4095, 4095};
int   kalFekete[5] = {0, 0, 0, 0, 0};
int   kuszob = 1700;
int   alapSebesseg = 120;
int   minimumPWM = 70;
int   maximumPWM = 255;
int   maxKorrekcio = 75;
float utolsoPozicio = 0;
int   keresesiIrany = 1;
int   vonalvesztesSzamlalo = 0;

// ---------------------------------------------------------------------
//  Belso allapot
// ---------------------------------------------------------------------
BluetoothSerial BT;
Preferences nvs;

// Alapertekek = robot 1 mert elojelei (2026-09-12, N,AUTO): a bal motor es
// MINDKET enkoder forditva van a labkiosztashoz kepest. Csak ures NVS-nel
// szamit; a Muszerfal "Robot beallitasa" (N,... / N,AUTO) az NVS-be ment.
static int  elojelEncBal = -1, elojelEncJobb = 1;
static int  elojelMotBal = -1, elojelMotJobb = 1;
static String btNev = "TaborRobot-0";

static TaskHandle_t feladatTask = NULL;
static volatile bool feladatFut = false;
static unsigned long keziUtolso = 0;
static bool keziAktiv = false;
static int  telemetriaHz = 0;
static unsigned long telemetriaUtolso = 0;
static int  utolsoBal = 0, utolsoJobb = 0;

// a vazlat fuggvenyei (show.ino)
void indulas();
void vezerles();

// ---------------------------------------------------------------------
//  Enkoderek: az A csatorna MINDKET elen szamolunk (CHANGE), B adja az
//  iranyt -- pontosan ugy, ahogy a tabori keret es a 2_enkoder.ino
//  (Szakmai Segedlet), tehat 408 impulzus = 1 kerekfordulat = 138,9 mm,
//  es a SHOW_robot*.txt / robots.json mert MM_PER_IMP ertekei valtozas
//  nelkul ervenyesek. (v1-v5 csak a felfuto elt szamolta: fele annyi
//  impulzus, ezert ment a robot 1 m helyett 2 m-t -- 2026-09-12.)
//  Az elojel-konvencio a regi maradt (A siet -> +), igy az NVS-ben
//  mentett N,... elojelek is ervenyesek.
// ---------------------------------------------------------------------
void IRAM_ATTR isrEncBal() {
  encBal += (digitalRead(PIN_ENC_BAL_A) != digitalRead(PIN_ENC_BAL_B) ? 1 : -1) * elojelEncBal;
}
void IRAM_ATTR isrEncJobb() {
  encJobb += (digitalRead(PIN_ENC_JOBB_A) != digitalRead(PIN_ENC_JOBB_B) ? 1 : -1) * elojelEncJobb;
}

void enkoderNullaz() {
  noInterrupts();
  encBal = 0;
  encJobb = 0;
  interrupts();
}

// ---------------------------------------------------------------------
//  Akku
// ---------------------------------------------------------------------
int akkuMv() {
  uint32_t osszeg = 0;
  for (int i = 0; i < 8; i++) osszeg += analogReadMilliVolts(PIN_AKKU);
  return (int)(osszeg / 8 * 5);
}

static bool akkuTiltva() {
  int mv = akkuMv();
  return mv > 500 && mv < AKKU_MIN_MV;   // 0 mV = nincs bekotve -> nem tiltunk
}

// ---------------------------------------------------------------------
//  Motor
// ---------------------------------------------------------------------
static void egyMotor(int pwmPin, int in1, int in2, int ertek) {
  int v = constrain(ertek, -255, 255);
  digitalWrite(in1, v > 0 ? HIGH : LOW);
  digitalWrite(in2, v < 0 ? HIGH : LOW);
  ledcWrite(pwmPin, abs(v));
}

void motor(int bal, int jobb) {
  if (akkuTiltva()) { bal = 0; jobb = 0; }
  utolsoBal = bal;
  utolsoJobb = jobb;
  digitalWrite(PIN_STBY, (bal == 0 && jobb == 0) ? LOW : HIGH);
  egyMotor(PIN_PWMA, PIN_AIN1, PIN_AIN2, bal * elojelMotBal);
  egyMotor(PIN_PWMB, PIN_BIN1, PIN_BIN2, jobb * elojelMotJobb);
}

// ---------------------------------------------------------------------
//  Uzenet, varakozas
// ---------------------------------------------------------------------
void uzenet(const String& sz) {
  Serial.println(sz);
  if (BT.hasClient()) BT.println(sz);
}
void uzenet(const char* sz) { uzenet(String(sz)); }

// A parancsokat a fo loop() dolgozza fel, a feladat kulon FreeRTOS-task,
// ezert a varj() egyszeruen atadja a vezerlest -- a Stop a taskot torli.
void varj(int ms) {
  if (ms <= 0) { taskYIELD(); return; }
  vTaskDelay(pdMS_TO_TICKS(ms));
}

// ---------------------------------------------------------------------
//  menj(): kerekenkent a sajat celjaig, aztan az a kerek megall.
//  (A SHOW sajat mozgas()-t hasznal; ez a G parancshoz es a regi
//  peldakhoz van.)
// ---------------------------------------------------------------------
bool menj(long impBal, long impJobb, int pwm) {
  enkoderNullaz();
  unsigned long t0 = millis();
  int p = constrain(abs(pwm), 0, 255);
  while (true) {
    long eB = encBal, eJ = encJobb;
    bool keszB = labs(eB) >= labs(impBal);
    bool keszJ = labs(eJ) >= labs(impJobb);
    if (keszB && keszJ) break;
    if (millis() - t0 > 20000) { motor(0, 0); uzenet("!!! menj: idokorlat"); return false; }
    int pB = keszB ? 0 : (impBal >= 0 ? p : -p);
    int pJ = keszJ ? 0 : (impJobb >= 0 ? p : -p);
    motor(pB, pJ);
    varj(5);
  }
  motor(0, 0);
  return true;
}

// ---------------------------------------------------------------------
//  Szenzorok (minimalis, a vonal nelkuli show-nak nem kell)
// ---------------------------------------------------------------------
void szenzorOlvas() {
  for (int i = 0; i < 5; i++) szenzor[i] = analogRead(SENSOR_PIN[i]);
}

void szenzorNormal() {
  for (int i = 0; i < 5; i++) {
    int tart = kalFeher[i] - kalFekete[i];
    if (tart < 1) tart = 1;
    long n = (long)(kalFeher[i] - szenzor[i]) * 1000L / tart;  // fekete = 1000
    szenzorNorm[i] = constrain((int)n, 0, 1000);
  }
}

int vonalPozicioSzamol() {
  szenzorNormal();
  static const int hely[5] = {-2000, -1000, 0, 1000, 2000};
  long sulyozott = 0, osszeg = 0;
  bool lat = false;
  for (int i = 0; i < 5; i++) {
    if (szenzorNorm[i] > 500) lat = true;
    sulyozott += (long)szenzorNorm[i] * hely[i];
    osszeg += szenzorNorm[i];
  }
  vonalLatszik = lat;
  if (!lat || osszeg == 0) return 9999;
  return (int)(sulyozott / osszeg);
}

// ---------------------------------------------------------------------
//  Feladat (indulas + vezerles) kulon taskban, hogy a Stop meg tudja szakitani
// ---------------------------------------------------------------------
static void feladatFo(void*) {
  feladatFut = true;
  indulas();
  while (feladatFut) {
    szenzorOlvas();
    vezerles();
    vTaskDelay(pdMS_TO_TICKS(20));
  }
  motor(0, 0);
  feladatTask = NULL;
  vTaskDelete(NULL);
}

static void feladatInditas() {
  if (feladatTask) { uzenet("!!! mar fut feladat -- elobb S"); return; }
  keziAktiv = false;
  motor(0, 0);
  xTaskCreatePinnedToCore(feladatFo, "feladat", 8192, NULL, 1, &feladatTask, 1);
  uzenet("feladat indul");
}

static void feladatLeallitas() {
  if (feladatTask) {
    feladatFut = false;
    TaskHandle_t h = feladatTask;
    feladatTask = NULL;
    vTaskDelete(h);
  }
  keziAktiv = false;
  motor(0, 0);
  uzenet("STOP");
}

// ---------------------------------------------------------------------
//  NVS
// ---------------------------------------------------------------------
static void beallitasBetolt() {
  nvs.begin("keret", true);
  elojelEncBal  = nvs.getInt("encL", elojelEncBal);
  elojelEncJobb = nvs.getInt("encR", elojelEncJobb);
  elojelMotBal  = nvs.getInt("motL", elojelMotBal);
  elojelMotJobb = nvs.getInt("motR", elojelMotJobb);
  btNev = nvs.getString("nev", "TaborRobot-0");
  if (nvs.getBytesLength("kalF") == sizeof(kalFeher)) nvs.getBytes("kalF", kalFeher, sizeof(kalFeher));
  if (nvs.getBytesLength("kalB") == sizeof(kalFekete)) nvs.getBytes("kalB", kalFekete, sizeof(kalFekete));
  nvs.end();
}

static void beallitasMent() {
  nvs.begin("keret", false);
  nvs.putInt("encL", elojelEncBal);
  nvs.putInt("encR", elojelEncJobb);
  nvs.putInt("motL", elojelMotBal);
  nvs.putInt("motR", elojelMotJobb);
  nvs.putString("nev", btNev);
  nvs.putBytes("kalF", kalFeher, sizeof(kalFeher));
  nvs.putBytes("kalB", kalFekete, sizeof(kalFekete));
  nvs.end();
}

static String kalibracioSor() {
  String k = "L,OK,";
  for (int i = 0; i < 5; i++) k += String(kalFeher[i]) + (i < 4 ? "/" : ",");
  for (int i = 0; i < 5; i++) k += String(kalFekete[i]) + (i < 4 ? "/" : "");
  return k;
}

// 3 s-ig mintavetelez, kozben a robotot at kell tolni a vonalon:
// a legvilagosabb ertek lesz a feher, a legsotetebb a fekete.
static void szenzorKalibral(Stream& s) {
  if (feladatTask) { s.println("L,ERR,elobb S"); return; }
  int mx[5], mn[5];
  for (int i = 0; i < 5; i++) { mx[i] = 0; mn[i] = 4095; }
  s.println("L,START,3000");
  unsigned long t0 = millis();
  while (millis() - t0 < 3000) {
    szenzorOlvas();
    for (int i = 0; i < 5; i++) { mx[i] = max(mx[i], szenzor[i]); mn[i] = min(mn[i], szenzor[i]); }
    delay(5);
  }
  for (int i = 0; i < 5; i++) {
    if (mx[i] - mn[i] < 100) { s.println("L,ERR,S" + String(i + 1) + " nem latott kontrasztot (" + String(mn[i]) + ".." + String(mx[i]) + ")"); return; }
    kalFeher[i] = mx[i];
    kalFekete[i] = mn[i];
  }
  beallitasMent();
  s.println(kalibracioSor());
}

// mindket kerek ugyanazzal a PWM-mel: az enkoderek aranya mutatja,
// mennyivel gyengebb az egyik motor (BAL_TRIM a show 2. blokkjaban)
static void kerekMeres(Stream& s) {
  if (feladatTask) { s.println("H,ERR,elobb S"); return; }
  enkoderNullaz();
  motor(120, 120);
  delay(1000);
  motor(0, 0);
  delay(300);
  long b = encBal, j = encJobb;
  if (labs(b) < 5 || labs(j) < 5) { s.println("H,ERR,az enkoder nem szamol (" + String(b) + "/" + String(j) + ")"); return; }
  s.println("H," + String(b) + "," + String(j) + "," + String((float)j / (float)b, 3));
}

static String elojelSor() {
  return "N," + String(elojelEncBal) + "," + String(elojelEncJobb) + ","
       + String(elojelMotBal) + "," + String(elojelMotJobb);
}

// egy motor elore, es megnezzuk, merre szamol a hozza tartozo enkoder
static void elojelAuto() {
  if (feladatTask) { uzenet("!!! elobb S"); return; }
  elojelEncBal = 1; elojelEncJobb = 1;
  enkoderNullaz(); motor(90, 0); delay(400); motor(0, 0); delay(300);
  long b = encBal, jKereszt = encJobb;
  enkoderNullaz(); motor(0, 90); delay(400); motor(0, 0); delay(300);
  long j = encJobb, bKereszt = encBal;
  if (labs(b) < 5 || labs(j) < 5) { uzenet("!!! N,AUTO: az enkoder nem szamol"); return; }
  if (labs(jKereszt) > labs(b) / 2 || labs(bKereszt) > labs(j) / 2) {
    uzenet("!!! N,AUTO: a motor es az enkoder KERESZTBEN van kotve (G-kabelek)");
  }
  elojelEncBal  = b > 0 ? 1 : -1;
  elojelEncJobb = j > 0 ? 1 : -1;
  beallitasMent();
  uzenet("N,AUTO kesz: " + elojelSor());
}

// ---------------------------------------------------------------------
//  OTA -- sajat protokoll (lasd fejlec)
// ---------------------------------------------------------------------
//  Puffereles -- ez volt a 2026-09-12-i "F,ERR,timeout" oka:
//    * a BluetoothSerial RX-sora fixen 512 bajt, es ami nem fer bele, azt
//      SZO NELKUL ELDOBJA ("RX Full! Discarding"); a gazda viszont 4096
//      bajtot kuld elore, es az Update.write() flash-torlese kozben
//      (tobb tiz ms) a BT-stack tovabb hoz adatot.
//    * az USB-soros RX-puffere alapbol 256 bajt, ugyanez a gond.
//  Ezert: USB-n 8 KB-os RX-puffer (setup), Bluetooth-on pedig az OTA
//  idejere a BT-stack kozvetlenul a sajat 16 KB-os gyurupufferunkbe ir
//  (BT.onData), megkerulve az 512-es sort.
static const size_t OTA_GYURU = 16384;
static uint8_t* otaGyuru = NULL;
static volatile size_t otaIr = 0, otaOlvas = 0;     // ir: BT-task, olvas: loop
static volatile bool otaTulcsordulas = false;

static void otaBtAdat(const uint8_t* adat, size_t n) {
  for (size_t i = 0; i < n; i++) {
    size_t kov = (otaIr + 1) % OTA_GYURU;
    if (kov == otaOlvas) { otaTulcsordulas = true; return; }
    otaGyuru[otaIr] = adat[i];
    otaIr = kov;
  }
}

static size_t otaVar(bool bt, Stream& s) {
  if (!bt) return (size_t)max(0, s.available());
  return (otaIr + OTA_GYURU - otaOlvas) % OTA_GYURU;
}

static size_t otaOlvasBe(bool bt, Stream& s, uint8_t* cel, size_t n) {
  if (!bt) return s.readBytes(cel, n);
  size_t i = 0;
  while (i < n && otaOlvas != otaIr) { cel[i++] = otaGyuru[otaOlvas]; otaOlvas = (otaOlvas + 1) % OTA_GYURU; }
  return i;
}

static void otaFogad(Stream& s, size_t meret, const String& md5) {
  feladatLeallitas();
  telemetriaHz = 0;
  const bool bt = (&s == (Stream*)&BT);
  if (bt) {
    if (!otaGyuru) otaGyuru = (uint8_t*)malloc(OTA_GYURU);
    if (!otaGyuru) { s.println("F,ERR,memoria"); return; }
    otaIr = otaOlvas = 0;
    otaTulcsordulas = false;
    BT.onData(otaBtAdat);
  }
  bool ok = false;
  String hiba;
  if (!Update.begin(meret)) {
    hiba = "begin " + String(Update.errorString());
  } else {
    if (md5.length() == 32) Update.setMD5(md5.c_str());
    s.println("F,READY");
    // Egy teljes 4 KB-os ablakot gyujtunk RAM-ba, es EGYBEN adjuk az
    // Update-nek, csak utana ACK-ozunk. Az Update ugyanis a tele szektort
    // csak a KOVETKEZO bajt erkezesekor irja flash-be (Updater.cpp:
    // "> SPI_FLASH_SEC_SIZE"), es a 100-200 ms-os torles alatt az UART
    // 128 bajtos FIFO-ja tulcsordul, ha a gazda kozben mar a kovetkezo
    // ablakot kuldi. Igy minden flash-muvelet akkor fut, amikor a gazda
    // az ACK-ra var, es a vonal csendes. (2026-09-12: ezert veszett el
    // a 2. ablak fele.)
    static const size_t ABLAK = 4096;
    uint8_t* ablak = (uint8_t*)malloc(ABLAK);
    if (!ablak) { hiba = "memoria"; }
    size_t kapott = 0, ablakLen = 0;
    unsigned long utolsoAdat = millis();
    while (!hiba.length() && kapott < meret) {
      if (otaTulcsordulas) { hiba = "gyurupuffer tele"; break; }
      size_t n = otaVar(bt, s);
      if (n == 0) {
        if (millis() - utolsoAdat > OTA_CSEND_MS) { hiba = "timeout " + String(kapott) + "/" + String(meret); break; }
        delay(1);
        continue;
      }
      size_t akar = min(n, min(ABLAK - ablakLen, meret - kapott));
      size_t lett = otaOlvasBe(bt, s, ablak + ablakLen, akar);
      ablakLen += lett;
      kapott += lett;
      utolsoAdat = millis();
      if (ablakLen == ABLAK || kapott == meret) {
        if (Update.write(ablak, ablakLen) != ablakLen) { hiba = "write " + String(Update.errorString()); break; }
        ablakLen = 0;
        s.println("F,ACK," + String(kapott));
      }
    }
    free(ablak);
    if (!hiba.length()) {
      if (Update.end(true)) ok = true; else hiba = "end " + String(Update.errorString());
    }
    if (!ok) Update.abort();
  }
  if (bt) BT.onData(nullptr);
  if (!ok) { s.println("F,ERR," + hiba); return; }
  s.println("F,OK");
  delay(300);
  ESP.restart();
}

// ---------------------------------------------------------------------
//  Parancsok
// ---------------------------------------------------------------------
static String mezoSz(const String& sor, int idx) {
  int p = 0;
  for (int i = 0; i < idx; i++) { p = sor.indexOf(',', p); if (p < 0) return ""; p++; }
  int v = sor.indexOf(',', p);
  String m = v < 0 ? sor.substring(p) : sor.substring(p, v);
  m.trim();
  return m;
}

static int mezo(const String& sor, int idx, int alap = 0) {
  String m = mezoSz(sor, idx);
  return m.length() ? m.toInt() : alap;
}

static void parancs(String sor, Stream& s) {
  sor.trim();
  if (!sor.length()) return;
  char c = toupper(sor[0]);
  switch (c) {
    case 'T': feladatInditas(); break;
    case 'S': case 'A': feladatLeallitas(); break;
    case 'M':
      if (feladatTask) { s.println("!!! fut a feladat, M tiltva"); break; }
      keziAktiv = true; keziUtolso = millis();
      motor(mezo(sor, 1), mezo(sor, 2));
      break;
    case 'G':
      if (feladatTask) { s.println("!!! fut a feladat, G tiltva"); break; }
      menj(mezo(sor, 1), mezo(sor, 2), mezo(sor, 3, 120));
      s.println("G kesz: bal=" + String(encBal) + " jobb=" + String(encJobb));
      break;
    case 'Z': enkoderNullaz(); s.println("Z ok"); break;
    case 'P':
      s.println(String("P,") + KERET_VERZIO + " (408 imp/ford)," + btNev + "," + (feladatTask ? "FUT" : "ALL")
                + ",enc=" + String(encBal) + "/" + String(encJobb) + "," + elojelSor()
                + ",akku=" + String(akkuMv()));
      break;
    case 'V': s.println("V," + String(akkuMv())); break;
    case 'D': {
      szenzorOlvas(); szenzorNormal();
      String d = "D,szenzor=";
      for (int i = 0; i < 5; i++) d += String(szenzor[i]) + (i < 4 ? "/" : "");
      d += ",norm=";
      for (int i = 0; i < 5; i++) d += String(szenzorNorm[i]) + (i < 4 ? "/" : "");
      d += ",enc=" + String(encBal) + "/" + String(encJobb) + ",akku=" + String(akkuMv())
         + ",motor=" + String(utolsoBal) + "/" + String(utolsoJobb);
      s.println(d);
      break;
    }
    case 'R': telemetriaHz = constrain(mezo(sor, 1), 0, 200); s.println("R," + String(telemetriaHz)); break;
    case 'L':
      if (mezoSz(sor, 1) == "?") s.println(kalibracioSor()); else szenzorKalibral(s);
      break;
    case 'H': kerekMeres(s); break;
    case 'N':
      if (sor.length() == 1) { s.println(elojelSor()); break; }
      if (mezoSz(sor, 1).equalsIgnoreCase("AUTO")) { elojelAuto(); break; }
      elojelEncBal  = mezo(sor, 1, 1) < 0 ? -1 : 1;
      elojelEncJobb = mezo(sor, 2, 1) < 0 ? -1 : 1;
      elojelMotBal  = mezo(sor, 3, 1) < 0 ? -1 : 1;
      elojelMotJobb = mezo(sor, 4, 1) < 0 ? -1 : 1;
      beallitasMent();
      s.println("mentve: " + elojelSor());
      break;
    case 'B': {
      String arg = mezoSz(sor, 1);
      if (!arg.length()) { s.println("B," + btNev); break; }
      bool szam = true;
      for (unsigned i = 0; i < arg.length(); i++) if (!isDigit(arg[i])) szam = false;
      btNev = szam ? "TaborRobot-" + arg : "Tabor-" + arg;
      beallitasMent();
      s.println("B," + btNev + " -- ujraindulas, Windows-ban ujra kell parositani");
      delay(300);
      ESP.restart();
      break;
    }
    case 'F': {
      long meret = mezo(sor, 1);
      if (meret <= 0) { s.println("F,ERR,meret"); break; }
      otaFogad(s, (size_t)meret, mezoSz(sor, 2));
      break;
    }
    case 'X': break;
    default: s.println("?? ismeretlen parancs: " + sor); break;
  }
}

static void sorOlvas(Stream& s, String& puffer) {
  while (s.available()) {
    char ch = (char)s.read();
    if (ch == '\n' || ch == '\r') {
      if (puffer.length()) { parancs(puffer, s); puffer = ""; }
    } else if (puffer.length() < 200) {
      puffer += ch;
    }
  }
}

// ---------------------------------------------------------------------
//  setup / loop
// ---------------------------------------------------------------------
void setup() {
  Serial.setRxBufferSize(8192);   // OTA: 4 KB erkezhet, mig a flash-torles blokkol
  Serial.begin(115200);
  beallitasBetolt();

  pinMode(PIN_AIN1, OUTPUT); pinMode(PIN_AIN2, OUTPUT);
  pinMode(PIN_BIN1, OUTPUT); pinMode(PIN_BIN2, OUTPUT);
  pinMode(PIN_STBY, OUTPUT); digitalWrite(PIN_STBY, LOW);
  ledcAttach(PIN_PWMA, PWM_FREQ_HZ, PWM_BITS);
  ledcAttach(PIN_PWMB, PWM_FREQ_HZ, PWM_BITS);
  motor(0, 0);

  pinMode(PIN_ENC_BAL_A, INPUT_PULLUP);  pinMode(PIN_ENC_BAL_B, INPUT_PULLUP);
  pinMode(PIN_ENC_JOBB_A, INPUT_PULLUP); pinMode(PIN_ENC_JOBB_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_ENC_BAL_A), isrEncBal, CHANGE);
  attachInterrupt(digitalPinToInterrupt(PIN_ENC_JOBB_A), isrEncJobb, CHANGE);

  analogReadResolution(12);
  analogSetPinAttenuation(PIN_AKKU, ADC_11db);
  for (int i = 0; i < 5; i++) analogSetPinAttenuation(SENSOR_PIN[i], ADC_11db);

  BT.begin(btNev);
  uzenet(String("=== ") + KERET_VERZIO + " | " + btNev + " | " + elojelSor() + " | akku " + String(akkuMv()) + " mV ===");
  uzenet("T = start, S = stop, P = info, V = akku, M,b,j = kezi motor, R,hz = telemetria, L = kalibralas, F = firmware");
}

void loop() {
  static String usbPuffer, btPuffer;
  sorOlvas(Serial, usbPuffer);
  sorOlvas(BT, btPuffer);

  if (keziAktiv && millis() - keziUtolso > KEZI_IDOKORLAT_MS) {
    keziAktiv = false;
    motor(0, 0);
  }

  if (telemetriaHz > 0 && millis() - telemetriaUtolso >= (unsigned long)(1000 / telemetriaHz)) {
    telemetriaUtolso = millis();
    // feladat nelkul itt olvassuk a szenzorokat; futo feladatnal a feladatFo teszi 20 ms-onkent
    if (!feladatTask) szenzorOlvas();
    int poz = vonalPozicioSzamol();
    String e = "E," + String(encBal) + "," + String(encJobb) + "," + String(akkuMv()) + "," + (feladatTask ? "FUT" : "ALL");
    for (int i = 0; i < 5; i++) e += "," + String(szenzor[i]);
    e += "," + String(utolsoBal) + "," + String(utolsoJobb) + "," + String(poz);
    uzenet(e);
  }

  static unsigned long akkuUtolso = 0;
  if (millis() - akkuUtolso > 5000) {
    akkuUtolso = millis();
    int mv = akkuMv();
    if (mv > 500 && mv < AKKU_FIGY_MV) uzenet("!!! akku " + String(mv) + " mV" + (mv < AKKU_MIN_MV ? " -- MOTOROK TILTVA" : ""));
  }
  delay(2);
}
