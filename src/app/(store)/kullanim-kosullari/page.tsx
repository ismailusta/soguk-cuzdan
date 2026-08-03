import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Kullanım koşulları",
  description: `${BRAND_NAME} kullanım koşulları ve satış şartları.`,
};

export default function Page() {
  return <LegalPage kind="terms" />;
}
