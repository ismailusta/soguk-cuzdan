import type { Metadata } from "next";
import { BRAND_DESCRIPTION_TR, BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Ürünler",
  description: BRAND_DESCRIPTION_TR,
  openGraph: {
    title: `Ürünler · ${BRAND_NAME}`,
    description: BRAND_DESCRIPTION_TR,
  },
};

export default function UrunlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
