import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "KVKK",
  description: `${BRAND_NAME} KVKK aydınlatma metni — kişisel verilerin korunması.`,
};

export default function Page() {
  return <LegalPage kind="kvkk" />;
}
