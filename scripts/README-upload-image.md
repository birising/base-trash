# Skript pro nahrávání obrázků závad

Interaktivní skript pro snadné nahrávání obrázků závad s automatickou extrakcí GPS souřadnic z EXIF dat.

## Instalace závislostí

```bash
npm install
```

## Použití

```bash
node scripts/upload-image.js <cesta-k-obrazku>
```

Nebo pokud máte skript spustitelný:

```bash
./scripts/upload-image.js <cesta-k-obrazku>
```

## Co skript dělá

1. **Extrahuje GPS souřadnice** z EXIF dat obrázku (pokud jsou dostupné)
2. **Ptá se na kategorii** závady (interaktivní výběr)
3. **Ptá se na GPS souřadnice** (pokud nejsou v EXIF, nebo pokud je chcete změnit)
4. **Ptá se na popis** závady
5. **Vygeneruje UUID** pro název souboru
6. **Zkopíruje obrázek** do `assets/` s novým názvem
7. **Vygeneruje thumbnail** do `assets/thumbs/`
8. **Přidá záznam** do `data/zavady.json`
9. **Commitne a pushne** změny na git

## Příklad použití

```bash
node scripts/upload-image.js ~/Pictures/zavada.jpg
```

Skript vás pak interaktivně provede:
- Výběr kategorie (1-5)
- Potvrzení nebo zadání GPS souřadnic
- Zadání popisu závady

## Dostupné kategorie

1. Zelen
2. Údržba zeleně
3. Koš
4. Lampa
5. Ostatní

## Poznámky

- Skript automaticky detekuje GPS souřadnice z EXIF dat (pokud jsou v obrázku)
- Pokud GPS nejsou v EXIF, můžete je zadat ručně
- Obrázek je automaticky pojmenován pomocí UUID
- Thumbnail je automaticky vygenerován
- Všechny změny jsou automaticky commitnuty a pushnuty na git

