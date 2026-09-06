# Robotshow — 6 robot, szinkron koreográfia, vonal nélkül

A tábori robotok eddig **fekete vonalat követtek**: ha lecsúsztak, a vonal visszatette őket.
Az új feladatban nincs vonal. Ez nem egy funkció elvétele — ez az **egyetlen külső
visszacsatolás** elvétele. Ettől az egész vezérlés más lesz, és ez a mappa erről szól.

---

## 1. Az alapötlet egy mondatban

A PD-szabályzó marad, de már nem a vonaltól kapja a hibajelet, hanem az **enkóderektől**:

```
vonalkövetés:  hiba = hol van a vonal a robot alatt
show:          hiba = hol kellene tartania a keréknek  −  hol tart valójában
```

Kerekenként külön — ezért mozog a két kerék függetlenül. A teljes szabályzó egy kerékre:

```
u = KFF·v_cél  +  KP·hiba  +  KD·d(hiba)/dt  +  KSYNC·(hibaBal − hibaJobb)
PWM = előjel · (HOLTSÁV + |u|)
```

| tag | mit csinál | honnan jön a száma |
|---|---|---|
| `KFF·v_cél` | **előrecsatolás**: a mért PWM/sebesség görbéből tudjuk, mennyi PWM kell | K3 |
| `HOLTSÁV` | az a PWM, ami alatt a kerék meg sem mozdul | K0, K3 |
| `KP·hiba` | a klasszikus arányos tag a **pozíció**-hibára | K4 hangolás |
| `KD·d(hiba)/dt` | csillapítás, szűrt deriválttal | K4 hangolás |
| `KSYNC·(hibaBal−hibaJobb)` | **keresztcsatolás**: a két kerék egymáshoz igazítása | K4 hangolás |

### Miért PD, és miért nem PID?

Mert a hibánk **pozíció**-hiba, ami már önmagában a sebesség-hiba integrálja. Egy tartós
sebesség-eltérés itt magától növekvő pozíció-hibává válik, amit a P-tag azonnal büntet —
vagyis a P-tag itt pontosan azt a munkát végzi, amit vonalkövetésnél az I-tag végzett volna.
Külön I-tag csak felcsavarodást (windup) hozna. Ez ugyanaz az érvelés, ami a *Szakmai
Segédlet* 7.3-as pontjában szerepel, csak most a másik oldalról igaz.

### Miért a keresztcsatolás a legfontosabb tag?

Mert nem az számít, hogy a bal kerék pontos legyen, és nem is az, hogy a jobb —
hanem hogy **egymáshoz képest** pontosak legyenek. Egy egyenes akkor egyenes, ha a két
kerék ugyanannyit tett meg. A `KSYNC` a két kerék hibájának *különbségét* bünteti:
ha a bal lemarad, a bal többet kap **és** a jobb kevesebbet — a hiba feleakkora úton eltűnik,
mint ha csak a lemaradót gyorsítanánk.

---

## 2. Mi van ebben a mappában

```
README_show.md              ez a lap
kalibracio/
  K0_elojel_holtsav.txt     előjelek + holtsáv kerekenként, irányonként
  K1_ut_per_impulzus.txt    mm/impulzus, bal és jobb kerékre külön
  K2_nyomtav.txt            effektív nyomtáv 5 fordulatos méréssel
  K3_pwm_sebesseg.txt       PWM→sebesség görbe, a program illeszti a KFF-et
  K4_ellenorzes.txt         a végleges vezérlés + mérőpályák + PD-hangolás
  robot_adatok.md           az adatlap: ezt nyomtasd ki és töltsd ki
show/
  show_robot.txt            A VÉGLEGES KÓD — ide megy a mért adat és a koreográfia
szimulator/
  show_szimulator.html      koreográfia-szerkesztő és szimulátor
```

A `.txt` fájlok a webes szerkesztőbe másolandó programok — pontosan úgy, ahogy a
tábori kódok: **teljes fájl, első sortól az utolsóig**, majd Fordít+Feltölt.

---

## 3. A menetrend

### 3.1 Fizikai teszt-terep (egyszer kell megcsinálni)

Ragasztószalaggal, a **show valódi padlóján** (márvány/parketta — a szőnyeg mást mér!):

| jelölés | mire kell | méret |
|---|---|---|
| egyenes sáv + vezető él (fal, léc, hosszú vonalzó) | K1 tolópróba | ≥ 2,5 m |
| nyíl a padlón + csík a robot orrán | K2 fordulásmérés | — |
| 2 m-es egyenes, start-kereszttel | K4 1. teszt | 2 m |
| 1 × 1 m-es négyzet, sarkokban szalagkereszt | K4 2–3. teszt (UMBmark) | 1 m |
| szabad terület | K3 sepregetés | ~2 m előre |

Ezen felül: mérőszalag, kinyomtatott `robot_adatok.md` robotonként, toll,
és tartalék elemek. A `V` paranccsal minden mérés előtt nézd meg az akkut.

### 3.2 Bemérés — robotonként kb. 30 perc

`K0 → K1 → K2 → K3 → K4`, ebben a sorrendben, mert mindegyik az előzőre épül.
Az eredményeket a `robot_adatok.md` adatlapjára, majd onnan a `show_robot.txt`
2. blokkjába.

**A három szabály, ami nélkül a mérés nem ér semmit:**

1. Minden szám **3 mérés átlaga**. 1 %-nál nagyobb szórás = előbb a mechanikát nézd meg.
2. **Ugyanaz a padló és ugyanaz az akku-állapot**, mint a show-n.
3. Egyszerre egy dolgot változtass, és írd fel, mit láttál.

### 3.3 Koreográfia — a szimulátorban

Nyisd meg a szimulátort, rakd a robotokat a kiindulási helyükre (a pályán húzhatók),
írd meg a lépéseket, nézd meg lejátszásban, majd **Kód exportálása → Vágólapra**,
és illeszd a `show_robot.txt` 8. blokkjába.

A szimulátor ugyanazt a kinematikát és ugyanazt a gyorsulás-korlátot futtatja, mint a
robot `vezerles()` függvénye, ezért amit ott látsz, az nagyon közel van ahhoz, ami a
padlón történik. Amit ellenőriz helyetted:

- **ütközés és szoros elhaladás** — a legszűkebb helyet és annak időpontját is megmondja
- **pályaelhagyás** — a 300 mm-es biztonsági sávnál szól
- **túl gyors lépés** — ha egy lépés kerék-sebessége meghaladná a `VMAX`-ot; ilyenkor a
  robot lelassítaná magát, és **kiesne a szinkronból**
- **sodródás-próba** — elrontja robotonként a kalibrációt X %-kal, és megmutatja a valódi
  pályát a tervezett mellett. Márványon indulj 1 %-ról: ennyi hiba a legjobb bemérés
  után is marad, és a koreográfiának **ezt is el kell bírnia**.

### 3.4 Feltöltés és a show

1. `show_robot.txt` → a **2. blokkba** a mért adatok, a **8. blokkba** az exportált koreográfia.
2. Robotonként **csak a `#define ROBOT` sort** írod át (1…6), és feltöltöd.
3. A padlóra ragaszd fel a hat kiindulási jelet a szimulátorból kiolvasott X/Y szerint.
4. Minden roboton **Start** → mindegyik „élesítve" állapotba megy, és fényjelre vár.
5. **Lekapcsolod a termi világítást** → mind a hat egyszerre indul.

---

## 4. Az indítás-szinkron

Nem szabad új alkatrészt feltenni, tehát a startjelet a meglévő öt IR-szenzorral kapjuk el:
a robot a szenzorok **összegét** figyeli, lassan követi az alapszintet (hogy a napszak és az
árnyékok ne indítsák el), és a **hirtelen** változásra indul.

**A megbízható jel a termi világítás le- vagy felkapcsolása**, mert az minden robotnál
ugyanabban a pillanatban, és *tartósan* változtatja meg a fényt. Fényképezőgép-vakut ne
használj: 1 ms alatt lezajlik, a robot pedig 20 ms-onként mér — simán átcsúszhat két
minta között.

| beállítás | mit állít |
|---|---|
| `TRIGGER_KUSZOB` | mekkora ugrás számít jelnek (nagyobb szám = kevésbé érzékeny) |
| `TRIGGER_MIN_MS` | ennyi ideig csak figyel indulás után (beáll az alapszint) |
| `TARTALEK_MOD` | `0` = csak fényjelre indul; `1` = visszaszámlálás is elindítja |
| `VISSZASZAMLALAS_MS` | `TARTALEK_MOD = 1` esetén ennyi idő után magától indul |

**A tartalék indítás pontossága csak annyi, amennyire egyszerre nyomtátok meg a Startot** —
a visszaszámlálás mindegyik robotnál a saját Start gombjától indul. Éles show-n a fényjel a
pontos megoldás; a visszaszámlálás azért van, hogy egy elrontott fényjel ne fagyassza le a
műsort. Ha inkább maradjon állva a robot, mint hogy rosszkor induljon: `TARTALEK_MOD = 0`.

A koreográfia első lépése szándékosan **állás** — ez nyeli el a maradék pár tíz ms szórást.

---

## 5. Amit a padlón kell ellenőrizni, mielőtt közönség elé viszitek

| # | teszt | cél | mit jelent, ha nem megy |
|---|---|---|---|
| 1 | K1 háromszor, ugyanazon a roboton | szórás < 1 % | csúszik vagy laza a kerék |
| 2 | K4 / 1. teszt: 2 m egyenes | oldalirányú eltérés < 30 mm | emeld a `PD_KSYNC`-et; ha mindig ugyanarra húz, a K1 arány rossz |
| 3 | K4 / 2. és 3. teszt: 1 m négyzet mindkét irányban, 5-5× | eltérés < 50 mm | **ugyanarra** húz a két irány → K1; **ellentétesen** → K2 |
| 4 | két robot egymás mellett, azonos koreográfiával | a távolságuk ne nőjön a show hosszán | ez a szinkron valódi vizsgája |
| 5 | mind a hat élesítve, egy fényjel, telefonnal lassítva felvéve | a szórás tíz ms-os, nem száz | `TRIGGER_KUSZOB` túl nagy, vagy nem elég erős a fényváltás |
| 6 | egy koreográfia a szimulátorban és a padlón | a kiírt odometria és a valóság egyezzen | a különbség maga a sodródás — ezt tedd be a szimulátor drift-csúszkájába |
| 7 | 2. teszt teli és félig lemerült akkuval | a különbség alig látszik | ha látszik, a show sebessége túl közel van a `VMAX_IMPS`-hez — vedd lejjebb |

A 7. pont a legfontosabb rejtett szabály: **a `VMAX_IMPS` a mért maximum 65 %-a legyen.**
A maradék 35 % nem tartalék, hanem a szabályzó *mozgástere*. Kifutott motornál nincs
szabályozás — a PD csak akkor tud korrigálni, ha van még hova gyorsítania.

---

## 6. Amit tudni érdemes a sima padlóról

Márványon és lakkozott parkettán a tapadás lényegesen kisebb, mint a tábori papírpályán.
A megcsúszott kerék **utat veszít, amit az enkóder nem lát** — és amit ezért **semmilyen
szabályzó nem tud visszaszerezni**. Ez az egyetlen hiba, ami ellen a PD tehetetlen.

Ezért van a kódban gyorsulás-korlát (`GYORSULAS_MM_S2`, alapból 600 mm/s²), és ezért
sima a lépések közti átmenet. Ha a robot indulásnál vagy fordulásnál megcsikordul,
**vedd lejjebb** — a lassabb gyorsulás olcsóbb, mint egy kicsúszott alakzat.

---

## 7. Változatlan hardver

Semmi nem került fel és semmi nem került le a robotokról. Amit a feladat használ, az
mind ott volt eddig is:

- a két **enkóder** — eddig csak a `menj()` pontos megállásához kellett, most ez az egyetlen
  visszacsatolás;
- az öt **IR-szenzor** — eddig a vonalat kereste, most fénymérőként adja a közös startjelet;
- a **keret** `motor()`, `encBal`/`encJobb`, `enkoderNullaz()`, `uzenet()` függvényei;
- a Műszerfal `N,AUTO` (enkóder-irány) és `V` (akkufeszültség) parancsai.
