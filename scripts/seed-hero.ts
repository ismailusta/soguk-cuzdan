import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";

/** Lifestyle-style full-bleed backgrounds (Unsplash — cold wallet / dark product mood) */
const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1639763413714-5482f3e0d0c5?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1800&q=80",
];

async function main() {
  const payload = await getPayload({ config });

  const products = await payload.find({
    collection: "products",
    limit: 200,
    overrideAccess: true,
    locale: "tr",
  });

  const find = (...keys: string[]) =>
    products.docs.find((p) => {
      const hay = `${p.slug} ${p.name} ${p.brand}`.toLowerCase();
      return keys.every((k) => hay.includes(k.toLowerCase()));
    }) ||
    products.docs.find((p) => {
      const hay = `${p.slug} ${p.name} ${p.brand}`.toLowerCase();
      return keys.some((k) => hay.includes(k.toLowerCase()));
    });

  const ledger = find("ledger", "stax") || find("ledger") || products.docs[0];
  const trezor = find("trezor") || products.docs[1];
  const safepal = find("safepal") || products.docs[2];

  const existing = await payload.find({
    collection: "hero-banners",
    limit: 50,
    overrideAccess: true,
  });
  for (const doc of existing.docs) {
    await payload.delete({
      collection: "hero-banners",
      id: doc.id,
      overrideAccess: true,
    });
  }

  const slides = [
    {
      order: 0,
      titleTr: "LEDGER\nSTAX",
      titleEn: "LEDGER\nSTAX",
      subTr: "E-ink dokunmatik. Anahtarların çevrimdışı — Cryptomus ile öde.",
      subEn: "E-ink touchscreen. Keys offline — pay with crypto.",
      badgeTr: "Stokta",
      badgeEn: "In stock",
      badgeTone: "success" as const,
      ctaTr: "Satın al",
      ctaEn: "Buy now",
      product: ledger,
      bg: BACKGROUNDS[0],
      showPrice: false,
    },
    {
      order: 1,
      titleTr: "TREZOR\nSAFE 5",
      titleEn: "TREZOR\nSAFE 5",
      subTr: "Güvenli cold storage. Türkiye teslimatı.",
      subEn: "Secure cold storage. Delivery in Turkey.",
      badgeTr: "Öne çıkan",
      badgeEn: "Featured",
      badgeTone: "accent" as const,
      ctaTr: "İncele",
      ctaEn: "View",
      product: trezor,
      bg: BACKGROUNDS[1],
      showPrice: false,
    },
    {
      order: 2,
      titleTr: "KRIPTOSTORE\nCOLLECTION",
      titleEn: "KRIPTOSTORE\nCOLLECTION",
      subTr: "Ledger, Trezor, SafePal ve daha fazlası — tek mağaza.",
      subEn: "Ledger, Trezor, SafePal and more — one store.",
      badgeTr: "Koleksiyon",
      badgeEn: "Collection",
      badgeTone: "muted" as const,
      ctaTr: "Kataloğa git",
      ctaEn: "Browse catalog",
      product: safepal,
      bg: BACKGROUNDS[2],
      showPrice: false,
    },
  ];

  for (const s of slides) {
    const href = s.product ? `/urun/${s.product.slug}` : "/urunler";
    const created = await payload.create({
      collection: "hero-banners",
      locale: "tr",
      data: {
        active: true,
        order: s.order,
        title: s.titleTr,
        subtitle: s.subTr,
        badge: s.badgeTr,
        badgeTone: s.badgeTone,
        ctaLabel: s.ctaTr,
        ctaHref: s.order === 2 ? "/urunler" : href,
        product: s.product?.id,
        imageUrl: s.bg,
        showPrice: s.showPrice,
        layout: "textOverlay",
        titleSize: "xl",
        subtitleSize: "md",
        titleAlign: "center",
        titleUppercase: true,
        accentGlow: true,
      },
      overrideAccess: true,
    });

    await payload.update({
      collection: "hero-banners",
      id: created.id,
      locale: "en",
      data: {
        title: s.titleEn,
        subtitle: s.subEn,
        badge: s.badgeEn,
        ctaLabel: s.ctaEn,
      },
      overrideAccess: true,
    });

    console.log(`✓ ${s.titleTr.replace("\n", " / ")}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
