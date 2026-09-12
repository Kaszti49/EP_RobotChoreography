# Robot 1 — bemérés és hibakeresés, teljes napló

**Dátum:** 2026-09-08 · **Robot:** 1 · **Padló:** fa parketta · **Akku:** 8,62 → 8,7 V
**Állapot:** ✅ kész és behangolt. Előre, hátra, 3 pörgés balra, 3 pörgés jobbra — mind jó.

---

## 1. A kiindulási hiba

> „Egyenesen előre jól megy, de hátrafelé a jobb kerék teljesen átveszi, a bal
> kerék pedig mintha nem is kapna áramot."

Ez a hiba **nem** az volt, aminek látszott. Két, egymástól független
bekötési probléma rejtőzött mögötte, és mindkettőt lépésenként kellett
szétválasztani.

---

## 2. A hibakeresés menete — mit mért melyik teszt

| teszt | mit csinál | mit derített ki |
|---|---|---|
| **T1** tolás | motorok állnak, kézzel tolod 1 m-t | mm/impulzus kerekenként; az előjelek |
| **T2** irány-diagnosztika | nyílt kör, fix PWM, jelfeldolgozás nélkül | **a motor↔enkóder keresztezés** |
| **T3** megfigyelés | 3 lökés, te nézed a robotot | a motorok jó irányba forognak, csak az enkóder számol fordítva |
| **T5** tiszta egyenes | hajtott 1 m, közös vonatkoztatási pont | a távolság-kalibráció helyes (±1 %) |
| **T6** nyomtáv | 3 kör mindkét irányba | a fizikai nyomtáv ~148 mm |
| **SHOW** v1→v5 | maga a koreográfia | a fékezési és szinkron-hibák |

### 2.1 Első hiba — a motorok és az enkóderek keresztben voltak

A T2 **B fázisa** döntötte el, 60 másodperc alatt. Egyszerre csak egy motor
hajt, és megnézzük, melyik enkóder számol:

| parancs | encBal | encJobb |
|---|---|---|
| csak BAL motor előre | **4** | **452** |
| csak JOBB motor előre | **374** | **3** |

A hajtott kerék 4 impulzust adott (1,4 mm), a nem hajtott 452-t (156 mm).
Mechanikai magyarázat nincs rá: a `motor(bal, jobb)` és az
`(encBal, encJobb)` pár **keresztbe volt kötve**.

**Miért csak hátrafelé látszott?** Egyenesen előre mindkét kerék ugyanazt a
PWM-et kapja, a két hibajel azonos, a keresztezés láthatatlan. Amint bármi
aszimmetria van (hátramenet, kanyar, pörgés), a visszacsatolás a rossz
kerékre megy: negatív visszacsatolásból **pozitív** lesz. A szabályzó a
lemaradó kerék helyett a másikat nyomja padlóig. Egyik kerék átveszi, a
másik nullára esik.

**Javítás:** a G-kábelek (enkóder oldal) cseréje.

### 2.2 Második hiba — mindkét enkóder fordított előjel

A csere után a párosítás jó lett, de mindkét enkóder negatívot számolt
előremenetben. A T3 döntötte el, hogy melyik oldal a hibás: **a robot
fizikailag előre ment**, tehát a motorok jók, csak a számlálás fordított.

**Javítás:** `N,AUTO` a Műszerfalon, **egyszer**. (Korábban azért volt
haszontalan, mert a keresztezés nem előjel-probléma — előjelfordítással
nem javítható. `N,AUTO` **vagy** kézi javítás, soha nem mindkettő.)

Végállapot: a nyers `encBal`/`encJobb` fordított előjelű, de a mozgató
ciklus abszolút értékkel dolgozik, tehát ez nem zavar. **Ne futtass újra
`N,AUTO`-t.**

### 2.3 Egy zsákutca, amit érdemes feljegyezni

A T4 első futásában a robot „25 cm-rel többet ment 1 méternél", miközben
az enkóder 103 cm-t mondott. Nem hiba volt: **a start és a cél nem
ugyanarról a pontról lett mérve** — a robot ~20 cm hosszú, pont ennyi a
különbség. A T5 ezért ír elő egy szalagcsíkot a robot oldalára, amihez
indulás előtt és érkezés után is mérünk. Utána mindhárom futás pontosan
1 méter lett.

---

## 3. A vezérlés fejlődése — mi miért nem működött

| verzió | mit csinált | miért nem volt elég |
|---|---|---|
| **v1** | a keret `menj()` függvénye | egy közös PWM-mel hajtja mindkét kereket, és a lassabbat várja. Előre ~15 %-kal gyorsabb a robot, mint hátra, tehát pörgésnél a gyorsabb kerék 8-12 %-ot túlfutott. Emellett időtúllépés: egy pörgés a célnak csak 36 %-át teljesítette. |
| **v2** | saját ciklus, minden kerék a saját céljáig, aztán megáll | **nem javított.** A motor kikapcsolása nem állítja meg a kereket: a másik kerék még hajt, és a robot forgása a leállított kereket tovább pörgeti. Szabadon gurul, 400-500 impulzust szed össze. |
| **v3** | szinkron (keresztcsatolás) + aktív fék | ez volt a jó irány. A két kerék együtt érkezik, egyik sem gurul szabadon. |
| **v4** | Kaszti hangolása: nyomtáv 143, PWM 70 | ez adta a jó eredményt a padlón |
| **v5** | sebesség mm/s-ban, per-robot PWM átváltás | hogy egy helyen lehessen sebességet állítani mind az öt robotra |

**A tanulság:** a kerekeket nem külön-külön kell leállítani, hanem
**egyszerre kell odaérniük**. Ez az, amit a projekt eredeti terve
keresztcsatolásnak (KSYNC) hívott — a v2-ben tévedésből kidobtuk, és pont
attól nem javult semmi.

Külön részlet: a `motor(0,0)` a TB6612-n **szabadon gurulás, nem fékezés**.
Ezért van a mozgás végén egy rövid ellen-impulzus (`FEK_MS`) — enélkül az
egyenes is 2-4 %-ot túlfut.

---

## 4. Hogyan kell a naplót olvasni

Pörgésben az **előre haladó kerék 3-11 %-kal túlfutja a célt** a napló
szerint, a robot mégis a helyes szöget fordul. **Ez nem hiba: az a kerék
csúszik.** Az enkóder számolja az elfordulást, de az a plusz forgás nem
viszi tovább a robotot.

A bizonyíték: az egyik futásban PWM 80-on az enkóder 0,3 %-on belül
eltalálta a célt — és pont ott lett rossz a szög. Ahol 3-4 %-ot tévedett,
ott jó lett. **A két dolog nem korrelál.**

Ezért:

- **a padlón látott szöget hangold, ne a napló százalékait**;
- ezért lett a `NYOMTAV_MM` **143** a fizikailag mért **148** helyett — a
  hangolt szám a csúszást is magába nyeli, és ezért padlófüggő.

---

## 5. Végleges értékek — robot 1

```cpp
const float MM_PER_IMP_BAL  = 0.34582;   // T1 (3 tolás), T5 igazolta
const float MM_PER_IMP_JOBB = 0.34392;
const float PWM_PER_MMS     = 0.31449;   // ELŐZETES — a T7 méri pontosan
const float PWM_NULLA       = -2.35;     // ELŐZETES
const float NYOMTAV_MM      = 143.0;     // hangolt, nem fizikai
const float PORGES_TRIM     = 1.00;
const float BAL_TRIM        = 0.996;
const int   PWM_MIN         = 50;
```

Holtsáv (T2 C fázis): bal 20 / 40 (előre / hátra), jobb 25 / 20 →
a legrosszabb 40, ezért nem megyünk PWM 50 alá.

Enkóder előjel: fordított, a mozgató ciklus abszolút értékkel kezeli.

**Maradék hiba:** előre jó, hátra minimális balra sodródás, bal kanyar
hajszálnyi túlfutás, jobb kanyar jó. Milliméteres–pár centis nagyságrend.

---

## 6. Ami elvileg sem javítható tovább

**Csúszás.** A kerék elfordul, a robot mégsem oda megy. Az enkóder ezt
elvileg sem látja, tehát több méréssel nem lehet kiszedni belőle.

Nagyságrend: **±10 cm méterenként**, **±20 fok három pörgés után**,
padlófüggően (az asztalon mérhetően jobb volt, mint a parkettán).

Tervezési következmények:

- ne tervezz **20 cm-nél kisebb hézagot** két robot közé;
- **ne fűzz sok pörgést egymás után** — külső referencia nélkül a
  szöghiba összeadódik, és nincs mihez visszaigazodni;
- ha a show-t más padlón tartjátok, a `NYOMTAV_MM`-et újra kell hangolni.

---

## 7. Következő lépések

1. **T7 futtatása robot 1-en** — a `PWM_PER_MMS` / `PWM_NULLA` jelenleg
   előzetes érték, a T2 régi adataiból illesztve. A T7 méri pontosan.
2. **Robot 2 bemérése** a `MERESI_MENET.md` szerint (T2 → T1 → T5 → T7 →
   SHOW hangolás), kb. 25 perc.
3. **Összehangolás**, ha mind az öt megvan:
   - a `SEBESSEG_MM_S` egy szám, mind az öt roboton ugyanaz — ezt teszi
     lehetővé a T7 által mért per-robot átváltás;
   - a `lepes_var()` időket a **leglassabb** robothoz méretezni;
   - a `PWM_MIN`-t a **legmagasabb holtsávú** robothoz igazítani.
