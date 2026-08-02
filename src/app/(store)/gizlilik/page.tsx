import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Gizlilik" };

export default function Page() {
  return <LegalPage kind="privacy" />;
}
