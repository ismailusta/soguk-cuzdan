import type { Metadata } from "next";
import {
  BRAND_DESCRIPTION_TR,
  BRAND_NAME,
  BRAND_TAGLINE_TR,
  siteUrl,
} from "@/lib/brand";
import "./globals.css";

const site = siteUrl();
const gsc = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: `${BRAND_NAME} — ${BRAND_TAGLINE_TR}`,
    template: `%s · ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION_TR,
  applicationName: BRAND_NAME,
  keywords: [
    "Kriptostore",
    "soğuk cüzdan",
    "donanım cüzdan",
    "hardware wallet",
    "Ledger",
    "Trezor",
    "SafePal",
    "BitBox",
    "kripto cüzdan Türkiye",
    "cold wallet",
    "USDT ödeme",
    "kripto ile ödeme",
  ],
  authors: [{ name: BRAND_NAME, url: site }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  category: "ecommerce",
  alternates: {
    canonical: site,
  },
  verification: gsc ? { google: gsc } : undefined,
  icons: {
    icon: [
      { url: "/brand/icon-v2.png", type: "image/png", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/brand/icon-v2.png"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — ${BRAND_TAGLINE_TR}`,
    description: BRAND_DESCRIPTION_TR,
    url: site,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — ${BRAND_TAGLINE_TR}`,
    description: BRAND_DESCRIPTION_TR,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/** Pass-through: store and Payload each render their own <html>/<body>. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
