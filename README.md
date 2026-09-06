# EP RobotChoreography — hat robot, egy koreográfia, vonal nélkül

Ez a repó a tábori **vonalkövető** robotokból csinál **szinkron táncoló rajt**.
Ugyanaz a hat robot, ugyanaz a hardver — de a padlón nincs fekete vonal, amit követhetnének.

Ha most találkozol a projekttel először, ez a lap az egyetlen, amit el kell olvasnod.

---

## 1. Mi a feladat, és miért nem triviális

A vonalkövető robotnak a **vonal** mondta meg folyamatosan, hogy jó helyen van-e.
Ha lecsúszott, a szenzor észrevette, és a PD-szabályzó visszatette. A vonal elvétele
nem egy funkciót vesz el — **az egyetlen külső visszacsatolást** veszi el.

Egy robot, aminek nincs visszajelzése a külvilágból, „vakon" megy: ha a bal kereke 1 %-kal
nagyobb, mint a jobb, akkor lassan elkanyarodik, és soha nem tudja meg, hogy elkanyarodott.
Hat robotnál ez hat különböző elkanyarodás — és pár méter után az alakzatból káosz lesz.

**A megoldás:** a PD-szabályzó marad, csak már nem a vonaltól kapja a hibajelet, hanem az
**enkóderektől** — kerekenként külön. És hogy ez működjön, minden robotot **külön be kell
mérni**, mert a hat robot fizikailag nem egyforma.

---

## 2. Mi készült el

| mappa / fájl | mi ez | ki használja |
|---|---|---|
| **`kalibracio/`** | öt bemérő program (K0…K4) + a kinyomtatható adatlap | a csapatok, bemérésnél |
| **`show/show_robot.txt`** | a végleges vezérlés — ez megy fel mind a hat robotra | a csapatok, a show előtt |
| **`szimulator/`** | koreográfia-szerkesztő és szimulátor (böngészőben) | aki a koreográfiát tervezi |
| **`README_show.md`** | a részletes mérnöki leírás: mit mérünk, hogyan hangolunk | mentor / haladó |
| **`CLAUDE.md`** | jegyzet AI-asszisztensnek, ha később módosítani kell a rendszert | — |
| a többi `.txt` és `.png` | az **eredeti tábori anyag** — változatlanul | referencia |

> 🔗 **A szimulátor itt nyílik:**
> <https://claude.ai/code/artifact/b7285a7e-1554-467c-bbf9-e2ee4da8a8f6>

---

## 3. Hogyan működik — négy mondatban

1. **A koreográfiát emberi nyelven írjuk meg:** lépésenként *mennyi ideig, milyen gyorsan
   előre, milyen gyorsan fordulva*. Például `{3000, 160, 0}` = 3 másodpercig 160 mm/s-mal
   előre.
2. **A robot ezt átváltja a saját kerekeire** a *saját* bemért adataival (mm/impulzus,
   nyomtáv). Itt tűnik el a hat robot közötti különbség: ugyanaz a lépés minden robotnál
   ugyanakkora *valódi* mozgás lesz, még ha más PWM-et is igényel.
3. **A PD-szabályzó 20 ezredmásodpercenként ellenőrzi**, hogy a kerék tényleg ott tart-e,
   ahol tartania kellene, és korrigál.
4. **Mind a hat robot ugyanabban a pillanatban indul**, mert a termi világítás
   lekapcsolását az öt IR-szenzoruk egyszerre veszi észre.

Nem került fel új alkatrész: az enkóderek és az IR-szenzorok eddig is ott voltak,
csak most más a dolguk.

---

## 4. A menetrend — nulláról a show-ig

### 1. lépés — teszt-terep felragasztása *(egyszer, ~30 perc)*

A **show valódi padlóján** (a szőnyeg mást mér, mint a márvány!), ragasztószalaggal:

- egy **≥ 2,5 m-es egyenes sáv** vezető éllel (fal, léc, hosszú vonalzó)
- egy **1 × 1 m-es négyzet**, sarkokban szalagkereszttel
- egy **nyíl** a padlón (fordulásméréshez), és egy csík a robot orrán
- mérőszalag, toll, kinyomtatott `kalibracio/robot_adatok.md` robotonként

### 2. lépés — bemérés *(robotonként ~30 perc)*

Robotonként, **ebben a sorrendben**, mert mindegyik az előzőre épül:

| | program | mit mér |
|---|---|---|
| K0 | `kalibracio/K0_elojel_holtsav.txt` | jó irányba forog-e minden; hol indul el a kerék |
| K1 | `kalibracio/K1_ut_per_impulzus.txt` | hány mm egy impulzus — bal és jobb kerékre külön |
| K2 | `kalibracio/K2_nyomtav.txt` | mekkora a robot „effektív nyomtávja" |
| K3 | `kalibracio/K3_pwm_sebesseg.txt` | mennyi PWM kell adott sebességhez |
| K4 | `kalibracio/K4_ellenorzes.txt` | a kész vezérlés hangolása és ellenőrzése |

**Használat:** a fájl tartalmát **egészben** bemásolod a webes szerkesztőbe
(Kód fül → régi tartalom törlése → beillesztés), `Fordít + Feltölt` (Ctrl+Enter), `Start`.
Az eredményt a program **kiírja a naplóba** — onnan az adatlapra.

**A három szabály, ami nélkül a mérés nem ér semmit:**

1. minden szám **3 mérés átlaga** (1 %-nál nagyobb szórás = előbb a mechanikát nézd meg)
2. **ugyanaz a padló és ugyanaz az akku-állapot**, mint amivel a show megy majd
3. egyszerre egy dolgot változtass, és írd fel, mit láttál

### 3. lépés — koreográfia tervezése *(a szimulátorban)*

Nyisd meg a szimulátort. A robotokat **egérrel húzhatod** a pályán (ide kerül majd a
szalagjel a padlóra), a lépéseket táblázatban írod. Amit a szimulátor **helyetted
ellenőriz**:

- **ütközés** és szoros elhaladás — megmondja a legszűkebb helyet és annak időpontját
- **pályaelhagyás** — szól, ha valaki eléri a 30 cm-es biztonsági sávot
- **túl gyors lépés** — ha egy robot ettől lelassulna, és **kiesne a szinkronból**
- **sodródás-próba** — elrontja a kalibrációt X %-kal, és megmutatja, mennyit csúsznak el
  a robotok a valóságban. Sima padlón indulj 1 %-ról.

Ha kész: **Kód exportálása → Vágólapra**.

### 4. lépés — feltöltés *(robotonként 2 perc)*

Nyisd meg a `show/show_robot.txt`-t, és három dolgot állíts be:

| hol | mit |
|---|---|
| **1. blokk** | `#define ROBOT 1` → a robot száma (1…6). **Ez az egyetlen, ami robotonként más.** |
| **2. blokk** | a bemért adatok az adatlapról (mind a hat robot sorát egyszer beírod) |
| **8. blokk** | a szimulátorból exportált koreográfia |

Ezután a fájl **egészben** bemásolva megy fel mindegyik robotra — csak a `#define ROBOT`
számot írod át közöttük.

### 5. lépés — a show

1. Ragaszd fel a padlóra a hat kiindulási jelet (a szimulátor X/Y értékei szerint).
2. Állítsd rá a robotokat, és nyomj **Start**ot mindegyiken.
   Mindegyik „élesítve" állapotba megy, és **fényjelre vár** — nem indul el.
3. **Kapcsold le a termi világítást.** Mind a hat egyszerre indul.

---

## 5. Amit a show előtt le kell ellenőrizni

| # | teszt | cél |
|---|---|---|
| 1 | K1 háromszor ugyanazon a roboton | szórás < 1 % |
| 2 | K4 / 1. teszt: 2 m egyenes | oldalirányú eltérés < 30 mm |
| 3 | K4 / 2–3. teszt: 1 m-es négyzet mindkét irányban, 5-5× | eltérés < 50 mm |
| 4 | két robot egymás mellett, azonos koreográfiával | a távolságuk ne nőjön |
| 5 | mind a hat élesítve, egy fényjel, telefonnal lassítva felvéve | a szórás tíz ms-os legyen |
| 6 | egy koreográfia a szimulátorban **és** a padlón | egyezzenek |
| 7 | a 2. teszt teli **és** félig lemerült akkuval | alig legyen különbség |

A 4. pont a rendszer igazi vizsgája — ez méri, amit a közönség látni fog.
A részletes hibakeresés (mit állíts, ha nem megy) a **`README_show.md`** 5. fejezetében van.

---

## 6. Gyakori kérdések

**Miért kell külön bemérni minden robotot? Ugyanabból a dobozból jöttek.**
A kerék gumija másképp kopott és lapul, a nyomtatott váz nyomtávja szór, a motorok
súrlódása eltér. 3 % úthiba egy 10 méteres koreográfia végére 30 cm. Vonalkövetésnél
ez nem látszott, mert a vonal folyton visszatette a robotot — most nincs, ami visszategye.

**Miért PD, és miért nincs I-tag?**
Mert itt a hiba **pozíció**-hiba, ami már önmagában a sebesség-hiba integrálja: a P-tag
végzi azt a munkát, amit vonalkövetésnél az I-tag végzett volna. Külön I-tag csak
felcsavarodást okozna. (Ugyanez az érvelés a *Szakmai Segédlet* 7.3-as pontjában.)

**Miért ne fényképezőgép-vakuval indítsuk?**
A vaku 1 ezredmásodperc alatt lezajlik, a robot pedig 20 ezredmásodpercenként mér —
simán átcsúszhat két minta között. A termi világítás **tartósan** változtatja meg a fényt,
azt biztosan elkapja mind a hat.

**Mi van, ha nem sikerül a fényjel?**
A `TARTALEK_MOD = 1` beállítás mellett a robot 10 másodperc után magától elindul.
**De ennek a pontossága csak annyi, amennyire egyszerre nyomtátok meg a Startot** — éles
show-n a fényjel a pontos megoldás. Ha inkább maradjon állva a robot, mint hogy rosszkor
induljon: `TARTALEK_MOD = 0`.

**A robot megcsikordul indulásnál.**
Csúszik a kerék. A megcsúszott kerék **utat veszít, amit az enkóder nem lát** — és amit
ezért semmilyen szabályzó nem tud visszaszerezni. Vedd lejjebb a `GYORSULAS_MM_S2` értéket
(alapból 600 mm/s²). A lassabb gyorsulás olcsóbb, mint egy szétesett alakzat.

**Miért nem megy gyorsabban a show?**
Mert a `VMAX_IMPS` a mért maximum 65 %-a. A maradék 35 % nem tartalék, hanem a szabályzó
**mozgástere**: kifutott motornál nincs szabályozás, a PD csak akkor tud korrigálni, ha van
még hova gyorsítania.

---

## 7. Jelenlegi állapot

- ✅ A teljes mérési lánc, a végleges vezérlés és a szimulátor kész.
- ✅ Mind az öt bemérő program és a végleges vezérlés lefordul (hibátlanul, figyelmeztetés nélkül).
- ✅ A demó koreográfia geometriailag ellenőrizve: 400 mm legszűkebb távolság, pályán belül,
  a VMAX 78 %-a, és 1 %-os sodródásnál mindössze 45 mm végponti eltérés.
- ⬜ **Egyik robot sincs még bemérve** — a `show_robot.txt` táblázataiban egyelőre
  *névleges* számok állnak. A show addig nem lesz szinkronban, amíg ez meg nem történik.
- ⬜ **A terem mérete nincs felmérve** — a szimulátor pályamérete ezért állítható
  (alapból 4000 × 5000 mm).
- ⬜ A `PD_KP` / `PD_KD` / `PD_KSYNC` értékek kiindulópontok; a K4 hangolási menete
  (P → D → KSYNC) adja a véglegeset.
