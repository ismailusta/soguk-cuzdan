"use client";

import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { useLocale } from "@/lib/i18n";
import type { SiteContact } from "@/lib/site-contact";
import { formatAddressOneLine, pickLocale } from "@/lib/site-contact";

export function Footer({ contact }: { contact: SiteContact }) {
  const { locale, t } = useLocale();
  const wa = contact.whatsapp.replace(/\D/g, "");

  return (
    <footer className="border-t border-line bg-bg-nav">
      <div className="mx-auto flex max-w-[1300px] flex-col gap-8 px-5 py-12 md:flex-row md:justify-between md:px-12">
        <div>
          <BrandLogo size={64} />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">
            {t.footerBlurb}
          </p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-fg-faint">
            {contact.companyLegalName}
            <br />
            {formatAddressOneLine(contact)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2 text-fg-dim">
            <p className="mb-1 text-xs tracking-wider text-fg-faint uppercase">
              {t.shop}
            </p>
            <Link href="/urunler" className="hover:text-accent">
              {t.catalog}
            </Link>
            <Link href="/sepet" className="hover:text-accent">
              {t.cart}
            </Link>
            <Link href="/iletisim" className="hover:text-accent">
              {t.navContact}
            </Link>
            <Link href="/giris" className="hover:text-accent">
              {t.navSignIn}
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-fg-dim">
            <p className="mb-1 text-xs tracking-wider text-fg-faint uppercase">
              {t.legal}
            </p>
            {locale === "en" ? (
              <>
                <Link href="/privacy" className="hover:text-accent">
                  {t.privacy}
                </Link>
                <Link href="/terms" className="hover:text-accent">
                  {t.terms}
                </Link>
                <Link href="/refund" className="hover:text-accent">
                  {t.returns}
                </Link>
                <Link href="/kvkk" className="hover:text-accent">
                  {t.kvkk}
                </Link>
              </>
            ) : (
              <>
                <Link href="/gizlilik" className="hover:text-accent">
                  {t.privacy}
                </Link>
                <Link href="/kullanim-kosullari" className="hover:text-accent">
                  {t.terms}
                </Link>
                <Link href="/iade" className="hover:text-accent">
                  {t.returns}
                </Link>
                <Link href="/kvkk" className="hover:text-accent">
                  {t.kvkk}
                </Link>
              </>
            )}
          </div>
          <div className="col-span-2 flex flex-col gap-2 text-fg-dim sm:col-span-1">
            <p className="mb-1 text-xs tracking-wider text-fg-faint uppercase">
              {t.navContact}
            </p>
            <a
              href={`mailto:${contact.contactEmail}`}
              className="hover:text-accent"
            >
              {contact.contactEmail}
            </a>
            {contact.contactPhone ? (
              <a
                href={`tel:${contact.contactPhone.replace(/\s/g, "")}`}
                className="hover:text-accent"
              >
                {contact.contactPhone}
              </a>
            ) : null}
            {wa ? (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                WhatsApp
              </a>
            ) : null}
            <Link href="/iletisim" className="hover:text-accent">
              {t.contactFormLink}
            </Link>
            <p className="mt-1 text-xs text-fg-faint">
              {pickLocale(contact.supportHours, locale)}
            </p>
            <p className="mt-2 text-fg-faint">{t.footerPay}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1300px] px-5 py-4 text-xs text-fg-faint md:px-12">
          © {new Date().getFullYear()} {contact.companyLegalName} ·{" "}
          {t.footerCopy}
        </p>
      </div>
    </footer>
  );
}
