import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "İade & iptal",
  description: `${BRAND_NAME} iade ve iptal koşulları.`,
};

export default function Page() {
  return <LegalPage kind="returns" />;
}
