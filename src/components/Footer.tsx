"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="mt-auto border-t border-line bg-bg-nav">
      <div className="mx-auto flex max-w-[1300px] flex-col gap-8 px-5 py-12 md:flex-row md:justify-between md:px-12">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="h-7 w-7 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), oklch(0.4 0.02 260))",
              }}
            />
            <p className="text-xl font-bold tracking-[0.5px]">NOIR</p>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">
            {t.footerBlurb}
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
            <Link href="/giris" className="hover:text-accent">
              {t.navSignIn}
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-fg-dim">
            <p className="mb-1 text-xs tracking-wider text-fg-faint uppercase">
              {t.legal}
            </p>
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
          </div>
          <div className="col-span-2 flex flex-col gap-2 text-fg-dim sm:col-span-1">
            <p className="mb-1 text-xs tracking-wider text-fg-faint uppercase">
              {t.payment}
            </p>
            <span>{t.footerPay}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1300px] px-5 py-4 text-xs text-fg-faint md:px-12">
          © {new Date().getFullYear()} NOIR · {t.footerCopy}
        </p>
      </div>
    </footer>
  );
}
