# iOS Aplikace - Hlášení závad pro obec Běloky

iOS aplikace pro hlášení závad v obci Běloky. Aplikace umožňuje občanům nahlásit závady přímo z mobilního zařízení s využitím GPS polohy a fotoaparátu.

## Funkce

- 📍 **Mapa s aktuální polohou** - Zobrazení mapy s možností výběru místa závady
- 📸 **Fotografie** - Možnost pořídit nebo vybrat fotografii závady
- 📝 **Kategorie závad** - Výběr z kategorií: Koš, Lampa, Údržba zeleně, Ostatní
- 📧 **Email kontakt** - Volitelné zadání emailu pro zpětnou vazbu
- 🌐 **API integrace** - Odesílání závad přes Formspree API (stejné jako webová aplikace)

## Požadavky

- iOS 17.0 nebo novější
- Xcode 15.0 nebo novější
- Swift 5.0

## Instalace

1. Otevřete projekt v Xcode:
   ```bash
   open ios-app/BelokyZavady/BelokyZavady.xcodeproj
   ```

2. Nastavte Development Team v projektu (Settings → Signing & Capabilities)

3. Připojte iPhone nebo spusťte v simulátoru

4. Build a Run (⌘R)

## Struktura projektu

```
BelokyZavady/
├── BelokyZavadyApp.swift    # Entry point aplikace
├── ContentView.swift         # Hlavní view
├── ReportView.swift         # View pro hlášení závad
├── MapView.swift            # MapKit wrapper pro zobrazení mapy
├── APIService.swift         # Service pro odesílání závad přes API
├── Models.swift             # Data modely
└── Assets.xcassets          # Assets (ikony, barvy)
```

## Použití

1. **Vyberte kategorii** závady z dropdown menu
2. **Vyberte místo** na mapě kliknutím nebo použijte aktuální polohu
3. **Napište popis** závady
4. **Přidejte fotografii** (volitelné) - buď z galerie nebo pořízenou fotoaparátem
5. **Zadejte email** (volitelné) pro zpětnou vazbu
6. **Odeslete** závadu

## API

Aplikace používá stejný Formspree endpoint jako webová aplikace:
- Endpoint: `https://formspree.io/f/xkgdbplk`
- Metoda: POST
- Formát: multipart/form-data

### Odesílaná data:
- `form_type`: "zavada_report"
- `category`: kose/lampy/zelen/ostatni
- `lat`: latitude (Double)
- `lng`: longitude (Double)
- `message`: popis závady (String)
- `email`: email uživatele (String, volitelné)
- `upload`: fotografie (JPEG, volitelné)

## Oprávnění

Aplikace vyžaduje následující oprávnění:
- **Location (When In Use)** - pro určení místa závady
- **Photo Library** - pro výběr fotografie z galerie
- **Camera** - pro pořízení fotografie

## Kompatibilita

- iPhone (všechny modely podporující iOS 17+)
- iPad (všechny modely podporující iOS 17+)

## Poznámky

- Aplikace je kompatibilní s webovou aplikací a používá stejný API endpoint
- Data jsou odesílána přes Formspree, které automaticky posílá email na `info@beloky.cz`
- Pro produkční nasazení může být potřeba upravit API endpoint podle vašich potřeb

## Licence

Tato aplikace je součástí projektu Údržba obce Běloky a je open-source.




