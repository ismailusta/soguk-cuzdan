import type { Metadata } from "next";
import { ContactPageView } from "@/components/ContactPageView";
import { siteUrl } from "@/lib/brand";
import { getSiteSettings, pickLocale } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: pickLocale(s.contactPageTitle, "tr"),
    description: pickLocale(s.contactPageIntro, "tr"),
    alternates: { canonical: `${siteUrl()}/iletisim` },
  };
}

export default async function ContactPage() {
  const contact = await getSiteSettings();
  return <ContactPageView contact={contact} />;
}
