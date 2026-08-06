import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gizlilik",
  description: `${BRAND_NAME} gizlilik politikası (Privacy Policy).`,
};

export default async function Page() {
  const contact = await getSiteSettings();
  return <LegalPage kind="privacy" contact={contact} />;
}
