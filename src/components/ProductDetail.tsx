"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  productDesc,
  productName,
  productShort,
  useLocale,
} from "@/lib/i18n";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";
import { ProductCard } from "./ProductCard";
import { ProductVisual } from "./ProductVisual";

const DEFAULT_FAQS_TR = [
  {
    question: "Ürünler orijinal mi?",
    answer:
      "Evet. Kriptostore yalnızca üreticiden / yetkili kanallardan temin edilen orijinal donanım satar.",
  },
  {
    question: "Nasıl ödeme yaparım?",
    answer:
      "Ödeme Cryptomus üzerinden kripto ile alınır (USDT, BTC, ETH ve diğerleri).",
  },
  {
    question: "Kargo ne kadar sürer?",
    answer:
      "Ödeme onayından sonra Türkiye içi kargo hazırlığı başlar; süre ürüne ve stoğa göre değişir.",
  },
  {
    question: "Kurulumda yardım alabilir miyim?",
    answer:
      "Evet. Cihaz kurulumu ve ilk yedekleme için destek kanalımızdan yazabilirsiniz.",
  },
];

const DEFAULT_FAQS_EN = [
  {
    question: "Are products genuine?",
    answer:
      "Yes. Kriptostore only sells original hardware from manufacturers or authorized channels.",
  },
  {
    question: "How do I pay?",
    answer:
      "Checkout is crypto-only via Cryptomus (USDT, BTC, ETH and more).",
  },
  {
    question: "How long is shipping?",
    answer:
      "After payment confirmation we prepare domestic shipping in Turkey; timing depends on stock.",
  },
  {
    question: "Can you help with setup?",
    answer:
      "Yes. Reach out for device setup and first backup guidance.",
  },
];

function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-w-0 items-center justify-between gap-4 py-4 text-left"
      >
        <span className="min-w-0 flex-1 [overflow-wrap:anywhere] break-words text-[15px] font-semibold leading-snug">
          {title}
        </span>
        <span
          className="shrink-0 text-lg text-fg-dim transition-transform duration-250"
          style={{ transform: `rotate(${open ? 45 : 0}deg)` }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="animate-fade max-w-full [overflow-wrap:anywhere] break-words pb-4 text-sm leading-relaxed text-fg-muted whitespace-pre-wrap">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductDetail({
  product,
  related = [],
}: {
  product: Product;
  related?: Product[];
}) {
  const { locale, t } = useLocale();

  const thumbs = useMemo(() => {
    const list = [product.image, ...(product.images || [])].filter(
      Boolean
    ) as string[];
    return [...new Set(list)];
  }, [product.image, product.images]);

  const [active, setActive] = useState(0);
  const activeSrc = thumbs[active] || product.image;

  const teaser = productShort(product, locale) || productDesc(product, locale);

  const sections =
    locale === "en" && product.detailSectionsEn?.length
      ? product.detailSectionsEn
      : product.detailSections?.length
        ? product.detailSections
        : [];

  const faqs =
    locale === "en" && product.faqsEn?.length
      ? product.faqsEn
      : product.faqs && product.faqs.length > 0
        ? product.faqs
        : locale === "en"
          ? DEFAULT_FAQS_EN
          : DEFAULT_FAQS_TR;

  return (
    <div className="animate-fade overflow-x-hidden">
      <div className="mx-auto max-w-[1240px] px-5 py-8 md:px-12 md:py-10">
        <p className="mb-8 text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
          {locale === "en" ? "Product" : "Ürün detayı"}
        </p>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div className="w-full min-w-0 shrink-0 lg:w-[460px]">
            <ProductVisual
              product={product}
              src={activeSrc}
              large
              className="aspect-[420/440] w-full overflow-hidden rounded-[20px] border border-line"
            />
            {thumbs.length > 1 && (
              <div className="mt-3.5 flex gap-3 overflow-x-auto pb-1">
                {thumbs.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`h-24 w-24 shrink-0 overflow-hidden rounded-xl border transition ${
                      i === active
                        ? "border-accent"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 overflow-x-hidden">
            <p className="mb-3.5 text-[13px] font-semibold tracking-[1.5px] text-accent uppercase">
              {product.brand}
            </p>
            <h1 className="mb-4 max-w-full [overflow-wrap:anywhere] break-words text-[28px] font-bold tracking-[-0.5px] md:text-[34px]">
              {productName(product, locale)}
            </h1>
            <div className="mb-6 flex flex-wrap items-baseline gap-3">
              <span className="text-[30px] font-bold tabular-nums">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.inStock ? (
                <span className="text-sm font-medium text-success">
                  {t.inStock}
                </span>
              ) : (
                <span className="text-sm font-medium text-danger">
                  {t.outOfStock}
                </span>
              )}
            </div>

            <p className="mb-8 max-w-full [overflow-wrap:anywhere] break-words text-[15px] leading-relaxed text-fg-muted md:max-w-xl">
              {teaser}
            </p>

            <div className="mb-6">
              <AddToCartButton
                productId={product.id}
                disabled={!product.inStock}
                className="w-full rounded-[14px] py-[17px] text-center text-base font-bold sm:w-auto sm:min-w-[240px]"
              />
            </div>

            <Link
              href={`/urunler?brand=${encodeURIComponent(product.brand)}`}
              className="text-sm text-fg-dim hover:text-accent"
            >
              {product.brand} →
            </Link>
          </div>
        </div>
      </div>

      {(sections.length > 0 || product.description) && (
        <section className="overflow-x-hidden border-t border-line bg-bg-nav/40">
          <div className="mx-auto w-full max-w-[900px] px-5 py-14 md:px-12 md:py-16">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">
              {locale === "en" ? "About this device" : "Cihaz hakkında"}
            </h2>

            {sections.length > 0 ? (
              <div className="space-y-10">
                {sections.map((s) => (
                  <div key={s.title} className="min-w-0 max-w-full">
                    <h3 className="mb-3 [overflow-wrap:anywhere] break-words text-lg font-semibold">
                      {s.title}
                    </h3>
                    <p className="max-w-full [overflow-wrap:anywhere] break-words text-[15px] leading-relaxed text-fg-muted whitespace-pre-wrap">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="max-w-full [overflow-wrap:anywhere] break-words text-[15px] leading-relaxed text-fg-muted whitespace-pre-wrap">
                {productDesc(product, locale)}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="overflow-x-hidden border-t border-line">
        <div className="mx-auto w-full max-w-[900px] px-5 py-14 md:px-12 md:py-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">FAQ</h2>
          <div className="min-w-0 max-w-full">
            {faqs.map((f) => (
              <Accordion key={f.question} title={f.question}>
                {f.answer}
              </Accordion>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-bg-nav/30">
          <div className="mx-auto max-w-[1300px] px-5 py-14 md:px-12 md:py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="min-w-0 break-words text-2xl font-bold tracking-tight">
                {locale === "en"
                  ? `More from ${product.brand}`
                  : `${product.brand} benzer ürünler`}
              </h2>
              <Link
                href={`/urunler?brand=${encodeURIComponent(product.brand)}`}
                className="shrink-0 text-sm text-accent hover:underline"
              >
                {t.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
