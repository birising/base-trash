# Údržba obce Běloky – Webová aplikace pro správu obce

## 📱 Co je to za aplikaci?

**Údržba obce Běloky** je moderní webová aplikace, která pomáhá občanům a úředníkům spravovat a monitorovat infrastrukturu obce na jednom místě. Aplikace zobrazuje na interaktivní mapě všechny důležité informace o:

- 🗑️ **Koších na odpad** – aktuální naplněnost, stav baterie, poslední aktualizace
- 💡 **Veřejném osvětlení** – přehled lamp a možnost nahlásit závadu
- 🚚 **Svozu odpadu** – harmonogram svozu, termíny, informace o sběrném dvoře
- 🌊 **Hladině potoka** – live monitoring hladiny vody s povodňovými stupni
- 🌿 **Údržbě zeleně** – plochy trávy a záhonů, poslední sečení, frekvence údržby
- 🧂 **Kontejnerech s posypem** – umístění kontejnerů pro zimní údržbu

### Pro koho je aplikace určena?

- **Občané** – mohou sledovat stav infrastruktury, nahlásit závadu nebo zjistit termín svozu odpadu
- **Úředníci a správci** – mají přehled o všech zařízeních a jejich stavu na jednom místě
- **Technici** – vidí telemetrii košů (naplněnost, baterie) a mohou efektivněji plánovat údržbu

### Hlavní funkce

✅ **Interaktivní mapa** – všechny objekty zobrazeny na mapě s možností kliknout pro detail  
✅ **Live data** – aktuální informace o koších a hladině potoka se automaticky aktualizují  
✅ **Mobilní optimalizace** – aplikace funguje skvěle i na telefonech a tabletech  
✅ **Tmavý/světlý režim** – přepínání barevného schématu podle preference  
✅ **Grafy a statistiky** – vizualizace hladiny potoka za posledních 24 hodin s povodňovými stupni  
✅ **Harmonogram svozu** – automatický výpočet dalších termínů svozu odpadu  

---

## 🚀 Jak aplikaci používat?

### Pro běžné uživatele

1. **Otevřete aplikaci** v prohlížeči (funguje na počítači, telefonu i tabletu)
2. **Vyberte kategorii** v levém menu nebo klikněte na kartu v dashboardu
3. **Klikněte na marker na mapě** pro zobrazení detailních informací
4. **Nahlášení závady** – v detailu lampy nebo zeleně najdete tlačítko pro nahlášení závady e-mailem
5. **Sledování hladiny** – v sekci "Hladina potoka" uvidíte graf a aktuální stav s povodňovými stupni

### Navigace na mobilu

- **Hamburger menu** (☰) vpravo nahoře otevře navigaci
- **Tlačítko "Zpět"** vlevo nahoře vás vrátí na úvodní přehled
- **Kliknutí na logo** také vrací na úvodní zobrazení

---

## 🛠️ Technické informace pro vývojáře

### Co je to za technologii?

Aplikace je **statická Single Page Application (SPA)** – nepotřebuje server, funguje přímo v prohlížeči. Všechny soubory jsou statické HTML, CSS a JavaScript, což umožňuje jednoduché hostování na GitHub Pages nebo jakémkoli webhostingu.

### Struktura projektu

```
base-trash/
├── index.html          # Hlavní HTML soubor
├── html/              # HTML fragmenty (header, sidebar, views)
│   ├── header.html
│   ├── sidebar.html
│   └── views.html
├── css/               # Styly
│   ├── core.css       # Základní layout a komponenty
│   └── views.css      # Styly pro jednotlivé pohledy
├── js/                # JavaScript logika
│   ├── includes.js    # Loader pro HTML fragmenty
│   ├── data.js        # Načítání a zpracování dat
│   └── main.js        # Hlavní logika aplikace
└── data/              # Otevřená data (JSON/CSV)
    ├── kose.json
    ├── kose_telemetry.csv
    ├── lampy.json
    ├── kontejnery.json
    ├── zelene.json
    └── hladina.csv
```

### Použité technologie

- **Leaflet** – knihovna pro interaktivní mapy (načítá se z CDN)
- **Vanilla JavaScript** – bez frameworků, čistý JS
- **OpenStreetMap** – mapové dlaždice
- **SVG grafy** – vlastní implementace bez externích knihoven

### Formát dat

#### Koše (`kose.json` + `kose_telemetry.csv`)
- `kose.json` – definice košů (ID, souřadnice, název)
- `kose_telemetry.csv` – telemetrie (naplněnost %, baterie %, čas aktualizace)
- Aplikace automaticky sloučí data a vezme nejnovější telemetrii pro každý koš

#### Lampy (`lampy.json`)
- Každá lampa má ID, souřadnice a název
- ID se zobrazuje na mapě pro rychlou identifikaci

#### Údržba zeleně (`zelene.json`)
- Polygony ploch s typem (`trava` nebo `zahony`)
- Informace o posledním sečení a frekvenci údržby

#### Hladina potoka (`hladina.csv`)
- Formát: `YYYY-MM-DD HH:mm:ss;HODNOTA` (hodnota v cm)
- Data se načítají z externího zdroje (S3) nebo lokálního souboru
- Graf zobrazuje posledních 24 hodin s povodňovými stupni (SPA 1/2/3)

---

## 📦 Nasazení aplikace

### Rychlé nasazení na GitHub Pages

1. Ověřte, že branch s těmito soubory je `main`
2. Commitněte a pushněte změny:
   ```bash
   git add .
   git commit -m "Deploy"
   git push origin main
   ```
3. Na GitHubu otevřete **Settings → Pages**
4. V části **Source** zvolte **Deploy from a branch**
5. Jako branch vyberte `main` a složku `/(root)`
6. Uložte nastavení – GitHub Pages během několika minut vytvoří veřejnou URL

### Hostování dat na AWS S3

Pokud chcete data hostovat na S3 místo lokálně, přidejte před `js/data.js`:

```html
<script>
  window.DATA_BASE_URL = "https://your-bucket.s3.eu-central-1.amazonaws.com/data";
</script>
<script src="js/data.js"></script>
```

### Lokální vývoj

Pro rychlé vyzkoušení lokálně:

```bash
# Otevřít přímo v prohlížeči
open index.html

# Nebo spustit jednoduchý server
python -m http.server 8000
# Pak otevřít http://localhost:8000/
```

---

## 🔧 Vlastnosti aplikace

### Error handling
- Aplikace funguje i při částečném selhání načítání dat (použije fallback data)
- Timeouty pro síťové požadavky (10s lokální, 15s externí)
- Graceful degradation – aplikace zůstane funkční i při chybách

### Mobilní optimalizace
- Touch targets minimálně 44x44px
- Plynulé scrollování s `-webkit-overflow-scrolling: touch`
- Responzivní design pro všechny velikosti obrazovek
- Optimalizované popupy a tlačítka pro dotykové ovládání

### Performance
- Lazy loading HTML fragmentů
- Optimalizované načítání dat (Promise.allSettled)
- SVG grafy místo canvas pro lepší výkon
- Automatické ořezávání historie dat (24h okno)

---

## 📝 Poznámky

- Aplikace je označena jako **neoficiální** a používá **testovací data**
- Pro produkční nasazení je potřeba aktualizovat data v adresáři `data/`
- E-mailové adresy pro nahlášení závad jsou nastavené na `info@beloky.cz`

---

## 📄 Licence

Tato aplikace je open-source a data jsou dostupná jako otevřená data.

---

## 🤝 Přispívání

Pokud chcete přispět k vývoji aplikace:
1. Forkněte repozitář
2. Vytvořte branch pro vaši funkci
3. Commitněte změny
4. Otevřete Pull Request

---

**Vytvořeno pro obec Běloky** 🏘️
