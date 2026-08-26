import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kargo",
  description: `${BRAND_NAME} kargo politikası (Shipping Policy).`,
};

export default async function Page() {
  const contact = await getSiteSettings();
  return <LegalPage kind="shipping" contact={contact} />;
}
