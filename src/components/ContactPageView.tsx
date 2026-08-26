"use client";

import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { BRAND_NAME } from "@/lib/brand";
import { useLocale } from "@/lib/i18n";
import type { SiteContact } from "@/lib/site-contact";
import { formatAddress, pickLocale } from "@/lib/site-contact";

export function ContactPageView({ contact }: { contact: SiteContact }) {
  const { locale, t } = useLocale();
  const wa = contact.whatsapp.replace(/\D/g, "");
  const title = pickLocale(contact.contactPageTitle, locale);
  const intro = pickLocale(contact.contactPageIntro, locale);
  const hours = pickLocale(contact.supportHours, locale);

  return (
    <div className="animate-fade mx-auto max-w-3xl px-5 py-14 md:px-12 md:py-20">
      <p className="text-[13px] tracking-[1px] text-fg-faint uppercase">
        {locale === "en" ? "Support" : "Destek"} · {BRAND_NAME}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fg-muted">
        {intro}
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <aside className="space-y-5 text-sm text-fg-muted">
          <div>
            <p className="text-xs tracking-wider text-fg-faint uppercase">
              {locale === "en" ? "Company" : "Şirket"}
            </p>
            <p className="mt-1 font-medium text-fg">
              {contact.companyLegalName}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-wider text-fg-faint uppercase">
              {locale === "en" ? "Email" : "E-posta"}
            </p>
            <a
              href={`mailto:${contact.contactEmail}`}
              className="mt-1 inline-block text-accent hover:underline"
            >
              {contact.contactEmail}
            </a>
          </div>
          {contact.contactPhone ? (
            <div>
              <p className="text-xs tracking-wider text-fg-faint uppercase">
                {locale === "en" ? "Phone" : "Telefon"}
              </p>
              <a
                href={`tel:${contact.contactPhone.replace(/\s/g, "")}`}
                className="mt-1 inline-block text-accent hover:underline"
              >
                {contact.contactPhone}
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
                {contact.whatsapp}
              </a>
            </div>
          ) : null}
          <div>
            <p className="text-xs tracking-wider text-fg-faint uppercase">
              {locale === "en" ? "Address" : "Adres"}
            </p>
            <p className="mt-1 whitespace-pre-line leading-relaxed">
              {formatAddress(contact)}
            </p>
          </div>
          {hours ? (
            <div>
              <p className="text-xs tracking-wider text-fg-faint uppercase">
                {locale === "en" ? "Hours" : "Saatler"}
              </p>
              <p className="mt-1">{hours}</p>
            </div>
          ) : null}
          {pickLocale(contact.productOrigin, locale) ? (
            <div>
              <p className="text-xs tracking-wider text-fg-faint uppercase">
                {locale === "en" ? "Product origin" : "Ürün kaynağı"}
              </p>
              <p className="mt-1 leading-relaxed">
                {pickLocale(contact.productOrigin, locale)}
              </p>
            </div>
          ) : null}
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/iade" className="text-accent hover:underline">
              {t.returns} →
            </Link>
            <Link
              href={locale === "en" ? "/shipping" : "/kargo"}
              className="text-accent hover:underline"
            >
              {t.shipping} →
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
