"use client";

import Link from "next/link";
import { RichText } from "@/components/RichText";
import { BRAND_NAME } from "@/lib/brand";
import { useLocale } from "@/lib/i18n";
import type { SiteContact } from "@/lib/site-contact";
import {
  formatAddressOneLine,
  pickLocale,
  pickRichLocale,
} from "@/lib/site-contact";

type LegalKey = "privacy" | "terms" | "returns" | "kvkk";

export function LegalPage({
  kind,
  contact,
}: {
  kind: LegalKey;
  contact: SiteContact;
}) {
  const { locale, t } = useLocale();
  const page = contact[kind];
  const title = pickLocale(page.title, locale);
  const body = pickRichLocale(page.body, locale);
  const origin = pickLocale(contact.productOrigin, locale);

  return (
    <article className="animate-fade mx-auto max-w-2xl px-5 py-14 md:px-12 md:py-20">
      <p className="text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
        {t.legal}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h1>
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-fg-muted">
        <RichText data={body} />
        {origin ? (
          <p>
            <strong className="text-fg">
              {locale === "en" ? "Product origin: " : "Ürün kaynağı: "}
            </strong>
            {origin}
          </p>
        ) : null}
      </div>

      <div className="mt-10 rounded-xl border border-line bg-bg-elevated/40 p-5 text-sm leading-relaxed text-fg-muted">
        <p className="text-xs tracking-wider text-fg-faint uppercase">
          {locale === "en" ? "Merchant / contact" : "Satıcı / iletişim"}
        </p>
        <p className="mt-2 font-medium text-fg">{contact.companyLegalName}</p>
        <p className="mt-1">{formatAddressOneLine(contact)}</p>
        <p className="mt-2">
          <a
            href={`mailto:${contact.contactEmail}`}
            className="text-accent hover:underline"
          >
            {contact.contactEmail}
          </a>
          {contact.contactPhone ? (
            <>
              {" · "}
              <a
                href={`tel:${contact.contactPhone.replace(/\s/g, "")}`}
                className="text-accent hover:underline"
              >
                {contact.contactPhone}
              </a>
            </>
          ) : null}
        </p>
        <p className="mt-3">
          <Link href="/iletisim" className="text-accent hover:underline">
            {locale === "en" ? "Contact form →" : "İletişim formu →"}
          </Link>
        </p>
      </div>

      <p className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-accent hover:underline"
        >
          ← {BRAND_NAME}
        </Link>
      </p>
    </article>
  );
}
