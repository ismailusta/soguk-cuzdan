export const BRAND_LOGO_PATH = "/brand/logo-v2.png";
export const BRAND_ICON_PATH = "/brand/icon-v2.png";

/** Public company / storefront brand — use everywhere for SEO & copy. */
export const BRAND_NAME = "Kriptostore";

export const BRAND_TAGLINE_TR = "Soğuk Cüzdan & Donanım Cüzdanları";
export const BRAND_TAGLINE_EN = "Cold Wallets & Hardware Wallets";

export const BRAND_DESCRIPTION_TR =
  "Kriptostore — Türkiye'ye orijinal donanım kripto cüzdanları. Ledger, Trezor, SafePal ve daha fazlası. Ödeme Cryptomus ile USDT, BTC, ETH.";

export const BRAND_DESCRIPTION_EN =
  "Kriptostore — genuine hardware crypto wallets shipped in Turkey. Ledger, Trezor, SafePal and more. Pay with crypto via Cryptomus (USDT, BTC, ETH).";

/** Canonical public origin (no trailing slash). */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function brandTitle(page?: string): string {
  if (!page) return `${BRAND_NAME} — ${BRAND_TAGLINE_TR}`;
  return `${page} · ${BRAND_NAME}`;
}
