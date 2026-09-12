# Bemérési menet — robot 2, 3, 4, 5

A robot 1 kész. Ez a lap az, amit a maradék négyen végig kell csinálni.
Robotonként **kb. 25 perc**, és a végén egy kitöltött sor a táblázatban.

Előfeltétel minden robotnál: **friss akku** (`V` parancs, 8 V fölött), sima
padló, és lehetőleg **ugyanaz a padló, amin a show is lesz** — a pörgés
hangolása padlófüggő.

---

## 0. lépés — bekötés-ellenőrzés (T2), 2 perc

Ez fogta meg a robot 1 fő hibáját, és a többin is elsőként ezt kell kizárni.

Töltsd fel a **T2_irany_diagnosztika.txt**-t, Start, ~60 mp.

A **B fázis** a lényeg. Csak egy motor hajt, és **csak a hozzá tartozó
enkódernek szabad számolnia**:

| parancs | encBal | encJobb |
|---|---|---|
| csak BAL motor | változik | ≈ 0 |
| csak JOBB motor | ≈ 0 | változik |

- Ha fordítva számol → **az enkóder- és a motorkábelek keresztben vannak.**
  Ez volt a robot 1 hibája. Cseréld meg a G-kábeleket, és futtasd újra.
- Az **A fázis** előjeleit ne javítsd kézzel: ha előre hajtva nem pozitív
  mindkettő, a Műszerfalon **egyszer** `N,AUTO`, aztán T2 újra.
  `N,AUTO` **vagy** kézi javítás — soha nem mindkettő.

Írd fel: a **C fázis holtsáv** négy számát (bal/jobb × előre/hátra).
Ha bármelyik 45 fölött van, azon a roboton a PWM-et is feljebb kell venni.

---

## 1. lépés — mm/impulzus (T1), 5 perc

**T1_tolas.txt**, motorok végig állnak, a robotot kézzel tolod 1 métert
egy egyenes él mellett. **Háromszor** (Start újra).

- A program kiírja a mm/impulzust kerekenként.
- **Ellenőrzés:** a három tolás szórása 1 % alatt legyen. Ha nem, told újra
  — nem a robottal van baj, hanem a tolással.
- Az impulzus/fordulat 400 és 415 közé essen. Ha nem, nem annyit toltál,
  amennyit a `T1_UT_MM` mond.

A három érték átlaga megy a táblázatba.

---

## 2. lépés — hajtott egyenes (T5), 5 perc

**T5_egyenes.txt** a T1 értékeivel beírva, PWM 60, **háromszor**.

Szalagcsík a robot oldalára, és **mindent ahhoz mérj** — indulás előtt és
érkezés után is. Ez a lépés fogta meg a robot 1-nél, hogy a „125 cm"
valójában mérési hiba volt.

- **Távolság:** az enkóder és a szalagmérték ±1 %-on belül egyezzen.
  Ha nem, előbb a mérést nézd meg, ne a robotot.
- **Oldalirány:** jegyezd fel mm-ben és hogy melyik oldalra.

---

## 3. lépés — PWM/sebesség egyenes (T7), 3 perc

**T7_sebesseg.txt** a robot T1 értékeivel beírva. Friss akku, ugyanaz a
padló, ~2,5 m hely. A robot minden PWM-nél előre-hátra párban megy, tehát
a helyén marad. ~40 mp, magától lefut.

A végén kiír két bemásolható sort:

```cpp
const float PWM_PER_MMS = ...;
const float PWM_NULLA   = ...;
```

**Ez a lépés teszi lehetővé, hogy a sebességet egy helyen állítsuk.**
A PWM robotonként mást jelent; a show `SEBESSEG_MM_S`-ben áll, és minden
robot a saját egyenesével váltja át. Enélkül öt különböző gyorsaságú
robot lesz.

Ellenőrzés: a kiírt próbaértékek (200 / 230 / 260 mm/s) 45 és 200 PWM közé
essenek. Ha nem, az akkut nézd meg először.

---

## 4. lépés — a SHOW behangolása, 10 perc

Töltsd ki a **SHOW_robot1.txt** 2. blokkját az adott robot számaival, a
`#define ROBOT` sort is állítsd át. Kiindulásnak `NYOMTAV_MM = 143`.

Futtasd **háromszor**, és csak azt nézd, amit a padlón látsz.

**Egyenes — ha rendre ugyanarra viszi a farát:**
`BAL_TRIM` egy lépés = 0,004 ≈ 4 mm/méter
- farát BALRA tolja → 0,996
- farát JOBBRA tolja → 1,004

**Pörgés — ha rendre ugyanannyival téved:**
- túl sokat pörög → `NYOMTAV_MM` lejjebb (143 → 141)
- keveset pörög → feljebb (143 → 145)
- ha csak hajszálnyi: `PORGES_TRIM` 0,98 / 1,02

**Egyszerre egy számot állíts, és három futás átlagát nézd** — egy
szerencsés kör nem mérés.

### Amit NE hangolj

A napló pörgésnél azt fogja mutatni, hogy az előre haladó kerék
3–11 %-kal túlfutja a célt. **Ez normális**: az a kerék csúszik, az
enkóder számolja az elfordulást, de a robotot nem forgatja tovább.
A padlón látott szöget hangold, ne a napló százalékait.

---

## Adattáblázat

| | robot 1 | robot 2 | robot 3 | robot 4 | robot 5 |
|---|---|---|---|---|---|
| mm/imp **bal** | 0,34582 | | | | |
| mm/imp **jobb** | 0,34392 | | | | |
| holtsáv bal E/H | 20 / 40 | | | | |
| holtsáv jobb E/H | 25 / 20 | | | | |
| `NYOMTAV_MM` | 143,0 | | | | |
| `BAL_TRIM` | 0,996 | | | | |
| `PORGES_TRIM` | 1,00 | | | | |
| `PWM_PER_MMS` | 0,31449 ⚠ előzetes | | | | |
| `PWM_NULLA` | −2,35 ⚠ előzetes | | | | |
| 1 m alatt oldalra | ~0–6 cm | | | | |
| enkóder előjel | fordított (`menj` kompenzál) | | | | |

---

## Ha mind az öt megvan

1. **A lépésidők a leglassabb robothoz igazodnak.** A `lepes_var()`
   értékeket úgy állítsd, hogy a leglassabb is beleférjen — a többi
   állva várja ki. Enélkül a show néhány lépés után szétcsúszik időben,
   akkor is, ha pozícióban mindegyik pontos.

2. **A sebesség egy szám.** A `SEBESSEG_MM_S` mind az öt roboton ugyanaz;
   mindegyik a saját `PWM_PER_MMS` / `PWM_NULLA` párjával váltja PWM-re.
   Ha lassítani vagy gyorsítani akartok, **egy** számot írtok át, öt
   helyen ugyanarra. A `PWM_MIN`-t a legmagasabb holtsávú robothoz
   igazítsátok.

3. **Tervezési korlát:** a maradék hiba nagyságrendje **±10 cm méterenként**
   és **±20 fok három pörgés után**, és ez csúszásból jön — az enkóder
   elvileg sem látja, tehát kalibrációval nem tüntethető el.
   Ne tervezz 20 cm-nél kisebb hézagot két robot közé, és ne fűzz sok
   pörgést egymás után: külső referencia nélkül a szöghiba összeadódik,
   és nincs mihez visszaigazodni.
