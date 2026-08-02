# Soğuk Cüzdan

Türkiye için siyah temalı soğuk cüzdan mağazası. Ödemeler **Cryptomus** invoice API ile kripto üzerinden alınır.

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` içine Cryptomus Merchant UUID ve Payment API key’inizi yazın. Production’da `NEXT_PUBLIC_SITE_URL` mutlaka public HTTPS adresiniz olmalı (webhook için).

## Scriptler

- `npm run dev` — geliştirme sunucusu
- `npm run build` — production build
- `npm start` — production sunucu

## Notlar

- Ürünler: `data/products.json`
- Siparişler: `data/orders.json` (gitignore; runtime’da oluşur)
- Webhook: `POST /api/webhooks/cryptomus`
