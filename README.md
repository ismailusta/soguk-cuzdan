# Kriptostore

Türkiye için donanım kripto cüzdanı (soğuk cüzdan) mağazası. Marka: **Kriptostore**. Ödemeler **Cryptomus** invoice API ile kripto üzerinden alınır.

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` içine Cryptomus Merchant UUID ve Payment API key’inizi yazın. Production’da `NEXT_PUBLIC_SITE_URL` mutlaka public HTTPS adresiniz olmalı — örn. `https://kriptostore.com` (SEO, Open Graph, sitemap ve Cryptomus webhook için).

## Scriptler

- `npm run dev` — geliştirme sunucusu
- `npm run build` — production build
- `npm start` — production sunucu

## Notlar

- Ürünler: Payload CMS / PostgreSQL
- Webhook: `POST /api/webhooks/cryptomus`
- Sitemap: `/sitemap.xml` · Robots: `/robots.txt`
