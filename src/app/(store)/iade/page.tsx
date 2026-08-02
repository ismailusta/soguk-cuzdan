import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "İade & iptal" };

export default function Page() {
  return <LegalPage kind="returns" />;
}
