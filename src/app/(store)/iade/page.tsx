import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İade & iptal",
  description: `${BRAND_NAME} iade politikası (Refund Policy).`,
};

export default async function Page() {
  const contact = await getSiteSettings();
  return <LegalPage kind="returns" contact={contact} />;
}
