import type { Metadata } from "next";
import { BRAND_DESCRIPTION_TR, BRAND_NAME, siteUrl } from "@/lib/brand";

const url = `${siteUrl()}/urunler`;

export const metadata: Metadata = {
  title: "Ürünler",
  description: `Tüm donanım cüzdanları — Ledger, Trezor, SafePal ve daha fazlası. ${BRAND_DESCRIPTION_TR}`,
  alternates: { canonical: url },
  openGraph: {
    title: `Ürünler · ${BRAND_NAME}`,
    description: BRAND_DESCRIPTION_TR,
    url,
  },
};

export default function UrunlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
