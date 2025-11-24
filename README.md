# Údržba obce Běloky – statická SPA

Tato aplikace je připravená pro hostování na GitHub Pages bez jakéhokoli buildu. V repozitáři najdeš statické soubory aplikace (`index.html`, `style.css`, `app.js`) a adresář `data/` s otevřenými JSON daty (koše, lampy, kontejnery s posypem, plochy údržby zeleně). Všechny závislosti (Leaflet) se načítají z CDN.

## Rychlé nasazení na GitHub Pages
1. Ověř, že branch s těmito soubory je `main` (nebo `master`).
2. Commitni a pushni změny do GitHubu: `git add . && git commit -m "Deploy" && git push origin main`.
3. Na GitHubu otevři **Settings → Pages**.
4. V části **Source** zvol možnost **Deploy from a branch**.
5. Jako branch vyber `main` a složku `/(root)`.
6. Ulož nastavení – GitHub Pages během několika minut vytvoří veřejnou URL ve tvaru `https://<tvuj-ucet>.github.io/<nazev-repa>/`.

## Struktura projektu
- `index.html` – single-page rozhraní s top barem, postranním menu a kontejnerem mapy.
- `style.css` – responzivní vzhled s tmavou horní lištou a postranním panelem.
- `app.js` – logika pro Leaflet mapu, přepínání kategorií (koše, lampy, kontejnery, údržba zeleně) a doplnění markerů z načtených JSON dat.
- `data/` – otevřená data v JSON formátu (`kose.json`, `lampy.json`, `kontejnery.json`, `zelene.json`) připravená pro hostování na GitHub Pages nebo v AWS S3.

## Otevřená data a S3
- Výchozí cesta pro čtení dat je `./data`. Pokud chceš stejné JSON soubory obsluhovat z AWS S3 nebo jiné domény, přidej před `app.js` malý inline skript a nastav `window.DATA_BASE_URL`, např.:

```html
<script>window.DATA_BASE_URL = "https://example-bucket.s3.eu-central-1.amazonaws.com/data";</script>
<script src="app.js" defer></script>
```

- Struktura JSON souborů odpovídá poli objektů v `app.js`; díky tomu lze data spravovat odděleně jako open-data snapshoty.

## Lokální náhled
Pro rychlé vyzkoušení lokálně stačí otevřít `index.html` přímo v prohlížeči nebo spustit jednoduchý server, např. `python -m http.server 8000` a přejít na `http://localhost:8000/`.
