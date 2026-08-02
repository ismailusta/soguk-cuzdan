import type { Metadata } from "next";
import {
  BRAND_DESCRIPTION_TR,
  BRAND_ICON_PATH,
  BRAND_NAME,
  BRAND_TAGLINE_TR,
  siteUrl,
} from "@/lib/brand";
import "./globals.css";

const site = siteUrl();

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
    "kripto cüzdan Türkiye",
    "cold wallet",
  ],
  authors: [{ name: BRAND_NAME, url: site }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  alternates: {
    canonical: site,
  },
  icons: {
    icon: [{ url: BRAND_ICON_PATH, type: "image/png" }],
    apple: [{ url: BRAND_ICON_PATH }],
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — ${BRAND_TAGLINE_TR}`,
    description: BRAND_DESCRIPTION_TR,
    url: site,
    images: [
      {
        url: BRAND_ICON_PATH,
        width: 512,
        height: 512,
        alt: `${BRAND_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${BRAND_NAME} — ${BRAND_TAGLINE_TR}`,
    description: BRAND_DESCRIPTION_TR,
    images: [BRAND_ICON_PATH],
  },
  robots: {
    index: true,
    follow: true,
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
