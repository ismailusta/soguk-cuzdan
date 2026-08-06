import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KVKK",
  description: `${BRAND_NAME} KVKK aydınlatma metni.`,
};

export default async function Page() {
  const contact = await getSiteSettings();
  return <LegalPage kind="kvkk" contact={contact} />;
}
