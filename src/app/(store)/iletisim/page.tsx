import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { BRAND_NAME, siteUrl } from "@/lib/brand";
import {
  formatAddress,
  getSiteSettings,
} from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "İletişim",
    description: `${BRAND_NAME} müşteri destek ve iletişim.`,
    alternates: { canonical: `${siteUrl()}/iletisim` },
  };
}

export default async function ContactPage() {
  const s = await getSiteSettings();
  const wa = s.whatsapp.replace(/\D/g, "");

  return (
    <div className="animate-fade mx-auto max-w-3xl px-5 py-14 md:px-12 md:py-20">
      <p className="text-[13px] tracking-[1px] text-fg-faint uppercase">
        Destek
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        İletişim
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fg-muted">
        Sipariş, iade veya ürün sorularınız için formu doldurun ya da doğrudan
        e-posta / telefon ile yazın.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <aside className="space-y-5 text-sm text-fg-muted">
          <div>
            <p className="text-xs tracking-wider text-fg-faint uppercase">
              Şirket
            </p>
            <p className="mt-1 font-medium text-fg">{s.companyLegalName}</p>
          </div>
          <div>
            <p className="text-xs tracking-wider text-fg-faint uppercase">
              E-posta
            </p>
            <a
              href={`mailto:${s.contactEmail}`}
              className="mt-1 inline-block text-accent hover:underline"
            >
              {s.contactEmail}
            </a>
          </div>
          {s.contactPhone ? (
            <div>
              <p className="text-xs tracking-wider text-fg-faint uppercase">
                Telefon
              </p>
              <a
                href={`tel:${s.contactPhone.replace(/\s/g, "")}`}
                className="mt-1 inline-block text-accent hover:underline"
              >
                {s.contactPhone}
              </a>
            </div>
          ) : null}
          {wa ? (
            <div>
              <p className="text-xs tracking-wider text-fg-faint uppercase">
                WhatsApp
              </p>
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-accent hover:underline"
              >
                {s.whatsapp}
              </a>
            </div>
          ) : null}
          <div>
            <p className="text-xs tracking-wider text-fg-faint uppercase">
              Adres
            </p>
            <p className="mt-1 whitespace-pre-line leading-relaxed">
              {formatAddress(s)}
            </p>
          </div>
          {s.supportHours ? (
            <div>
              <p className="text-xs tracking-wider text-fg-faint uppercase">
                Saatler
              </p>
              <p className="mt-1">{s.supportHours}</p>
            </div>
          ) : null}
          <p>
            <Link href="/iade" className="text-accent hover:underline">
              İade politikası →
            </Link>
          </p>
        </aside>

        <div className="rounded-2xl border border-line bg-bg-elevated/40 p-5 md:p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
