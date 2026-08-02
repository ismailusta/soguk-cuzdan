import type { Metadata } from "next";
import "./globals.css";

const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "NOIR — Soğuk Cüzdan",
    template: "%s · NOIR",
  },
  description:
    "Varlıklarınıza layık bir zarafet. Donanım kripto cüzdanları. Ödeme Cryptomus ile.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    siteName: "NOIR",
    title: "NOIR — Soğuk Cüzdan",
    description:
      "Donanım kripto cüzdanları. Ödeme Cryptomus ile USDT, BTC, ETH.",
    url: site,
  },
  twitter: {
    card: "summary_large_image",
    title: "NOIR — Soğuk Cüzdan",
    description: "Donanım kripto cüzdanları. Kripto ile ödeme.",
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
