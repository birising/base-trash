# Nastavení CORS na AWS S3 bucketu

## Problém
Bucket `trash-beloky` neumožňuje přístup z domény `udrzba-beloky.cz` kvůli CORS policy.

## Řešení - Nastavení CORS Policy

### Krok 1: Přihlášení do AWS Console
1. Přihlas se do [AWS Management Console](https://console.aws.amazon.com/)
2. Přejdi na [Amazon S3](https://console.aws.amazon.com/s3/)

### Krok 2: Otevření bucketu
1. Najdi bucket **`trash-beloky`**
2. Klikni na název bucketu

### Krok 3: Nastavení CORS
1. Klikni na záložku **"Permissions"** (Oprávnění)
2. Scrolluj dolů k sekci **"Cross-origin resource sharing (CORS)"**
3. Klikni na **"Edit"** (Upravit)

### Krok 4: Vložení CORS konfigurace
Vlož následující JSON konfiguraci:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "https://udrzba-beloky.cz",
            "https://www.udrzba-beloky.cz",
            "http://localhost:8000",
            "http://127.0.0.1:8000"
        ],
        "ExposeHeaders": [
            "ETag",
            "Content-Length",
            "Content-Type",
            "Last-Modified"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### Krok 5: Uložení
1. Klikni na **"Save changes"** (Uložit změny)
2. Počkej několik sekund, než se změny projeví

## Vysvětlení konfigurace

- **AllowedHeaders**: `["*"]` - povoluje všechny hlavičky
- **AllowedMethods**: `["GET", "HEAD"]` - povoluje čtení souborů
- **AllowedOrigins**: 
  - `https://udrzba-beloky.cz` - produkční doména
  - `https://www.udrzba-beloky.cz` - varianta s www
  - `http://localhost:8000` a `http://127.0.0.1:8000` - pro lokální vývoj
- **ExposeHeaders**: hlavičky, které může prohlížeč číst
- **MaxAgeSeconds**: 3000 - jak dlouho si prohlížeč může cacheovat CORS odpověď

## Alternativní konfigurace (pro více domén)

Pokud chceš povolit přístup z více domén nebo subdomén:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": [
            "https://udrzba-beloky.cz",
            "https://*.udrzba-beloky.cz",
            "https://birising.github.io"
        ],
        "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
        "MaxAgeSeconds": 3000
    }
]
```

## Ověření

Po uložení můžeš otestovat:
1. Otevři aplikaci na `https://udrzba-beloky.cz`
2. Otevři Developer Tools (F12) → Console
3. Měly by zmizet CORS chyby
4. Data hladiny by se měla načíst ze S3 místo fallbacku

## Poznámka

Pokud používáš GitHub Pages, můžeš také přidat:
- `https://birising.github.io` (pokud je to tvá GitHub Pages URL)
- Nebo použít wildcard `https://*.github.io` (méně bezpečné)

## Troubleshooting

Pokud CORS chyby přetrvávají:
1. Zkontroluj, že jsi uložil změny v S3
2. Počkej 1-2 minuty na propagaci změn
3. Vyčisti cache prohlížeče (Ctrl+Shift+R / Cmd+Shift+R)
4. Zkontroluj, že URL v aplikaci odpovídá `AllowedOrigins` (včetně http/https)
5. Zkontroluj, že bucket má správná oprávnění pro veřejný přístup (pokud je potřeba)

## Bucket Policy (pokud je potřeba veřejný přístup)

Pokud soubory nejsou veřejně dostupné, můžeš také potřebovat upravit Bucket Policy:

1. V S3 bucketu → **Permissions** → **Bucket policy**
2. Přidej policy pro veřejný read přístup k souborům v `public/`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::trash-beloky/public/*"
        }
    ]
}
```

**⚠️ POZOR**: Tato policy umožní veřejný přístup ke všem souborům v `public/` složce. Použij jen pokud je to bezpečné.
