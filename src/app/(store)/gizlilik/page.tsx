import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Gizlilik",
  description: `${BRAND_NAME} gizlilik politikası — kişisel verilerinizin nasıl işlendiği.`,
};

export default function Page() {
  return <LegalPage kind="privacy" />;
}
