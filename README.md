# Údržba obce Běloky – statická SPA

Tato aplikace je připravená pro hostování na GitHub Pages bez jakéhokoli buildu. V repozitáři najdeš statické soubory aplikace (`index.html`, HTML fragmenty v `html/`, rozdělené styly v `css/` a logiku v `js/`) a adresář `data/` s otevřenými daty (koše, lampy, kontejnery s posypem, plochy údržby zeleně). Všechny závislosti (Leaflet) se načítají z CDN.

## Rychlé nasazení na GitHub Pages
1. Ověř, že branch s těmito soubory je `main` (nebo `master`).
2. Commitni a pushni změny do GitHubu: `git add . && git commit -m "Deploy" && git push origin main`.
3. Na GitHubu otevři **Settings → Pages**.
4. V části **Source** zvol možnost **Deploy from a branch**.
5. Jako branch vyber `main` a složku `/(root)`.
6. Ulož nastavení – GitHub Pages během několika minut vytvoří veřejnou URL ve tvaru `https://<tvuj-ucet>.github.io/<nazev-repa>/`.

## Struktura projektu
- `index.html` – kostra SPA s placeholders pro HTML fragmenty.
- `html/` – fragmenty rozhraní (`header.html`, `sidebar.html`, `views.html`) načítané na klientovi pro snazší údržbu.
- `css/core.css` a `css/views.css` – rozdělené styly pro základní layout a jednotlivé pohledy (mapa, hladina, odpad).
- `js/includes.js` – jednoduchý loader, který vloží HTML fragmenty.
- `js/data.js` – fallback data, načítání JSON/CSV (koše, lampy, kontejnery, zeleň, hladina) a parsování telemetrie.
- `js/main.js` – hlavní logika pro Leaflet mapu, přepínání kategorií, dashboard hladiny a odvozu.
- `data/` – otevřená data v JSON/CSV formátu (`kose.json`, `kose_telemetry.csv`, `lampy.json`, `kontejnery.json`, `zelene.json`, `hladina.csv`) připravená pro hostování na GitHub Pages nebo v AWS S3.

## Otevřená data a S3
- Výchozí cesta pro čtení dat je `./data`. Pokud chceš stejné soubory obsluhovat z AWS S3 nebo jiné domény, přidej před `js/data.js` malý inline skript a nastav `window.DATA_BASE_URL`, např.:

```html
<script>window.DATA_BASE_URL = "https://example-bucket.s3.eu-central-1.amazonaws.com/data";</script>
<script src="js/data.js"></script>
<script src="js/main.js"></script>
```

- `kose.json` obsahuje pouze definice košů (ID, název, souřadnice). Telemetrie (naplněnost, poslední aktualizace, stav baterie) se načítá z CSV `kose_telemetry.csv`, které může obsahovat vícero řádků na stejný koš; aplikace vždy vezme nejnovější záznam podle času `lastUpdated`.
- Struktura ostatních JSON souborů odpovídá poli objektů v `js/data.js`; díky tomu lze data spravovat odděleně jako open-data snapshoty.
- `hladina.csv` obsahuje historii úrovně potoka v centimetrech, formát řádku je `YYYY-MM-DD HH:mm:ss;HODNOTA`. Aplikace CSV načte (z `DATA_BASE_URL/hladina.csv`), použije ho pro 72h graf a zobrazí poslední záznam jako aktuální stav; pokud CSV chybí, použije vložený fallback se stejnou strukturou.

## Lokální náhled
Pro rychlé vyzkoušení lokálně stačí otevřít `index.html` přímo v prohlížeči nebo spustit jednoduchý server, např. `python -m http.server 8000` a přejít na `http://localhost:8000/`.
