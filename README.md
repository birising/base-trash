# Údržba obce Běloky – statická SPA

Tato aplikace je připravená pro hostování na GitHub Pages bez jakéhokoli buildu. V repozitáři jsou pouze tři soubory: `index.html`, `style.css` a `app.js`. Všechny závislosti (Leaflet) se načítají z CDN.

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
- `app.js` – logika pro Leaflet mapu, přepínání kategorií (koše, lampy, kontejnery) a doplnění markerů z vložených dat.

## Lokální náhled
Pro rychlé vyzkoušení lokálně stačí otevřít `index.html` přímo v prohlížeči nebo spustit jednoduchý server, např. `python -m http.server 8000` a přejít na `http://localhost:8000/`.
