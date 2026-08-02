"use client";

import Link from "next/link";
import { useState } from "react";
import { productDesc, productName, useLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";
import { ProductVisual } from "./ProductVisual";

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
        className="flex w-full items-center justify-between py-[18px] text-left"
      >
        <span className="text-[15px] font-semibold">{title}</span>
        <span
          className="text-lg text-fg-dim transition-transform duration-250"
          style={{ transform: `rotate(${open ? 45 : 0}deg)` }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="animate-fade pb-[18px] text-sm leading-[2] text-fg-muted">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const features =
    locale === "en" && product.featuresEn?.length
      ? product.featuresEn
      : product.features;
  const thumbs = [
    product.image,
    ...(product.images || []),
  ].filter(Boolean) as string[];

  return (
    <div className="animate-fade mx-auto max-w-[1240px] px-5 py-8 md:px-12 md:py-10">
      <p className="mb-8 text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
        Ürün Detayı
      </p>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
        <div className="w-full shrink-0 lg:w-[420px]">
          <ProductVisual
            product={product}
            large
            className="aspect-[420/440] w-full overflow-hidden rounded-[20px] border border-line"
          />
          {thumbs.length > 1 && (
            <div className="mt-3.5 flex gap-3 overflow-x-auto">
              {thumbs.slice(0, 4).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-xl border border-line object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-3.5 text-[13px] font-semibold tracking-[1.5px] text-accent uppercase">
            {product.brand}
          </p>
          <h1 className="mb-4 text-[34px] font-bold tracking-[-0.5px]">
            {productName(product, locale)}
          </h1>
          <div className="mb-7 flex items-baseline gap-3">
            <span className="text-[30px] font-bold tabular-nums">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>

          <p className="mb-8 text-base leading-relaxed text-fg-muted">
            {productDesc(product, locale)}
          </p>

          <div className="mb-9">
            <AddToCartButton
              productId={product.id}
              disabled={!product.inStock}
              className="w-full rounded-[14px] py-[17px] text-center text-base font-bold"
            />
            {!product.inStock && (
              <p className="mt-3 text-sm text-danger">{t.outOfStock}</p>
            )}
          </div>

          <div className="border-t border-line">
            <Accordion title="Teknik Özellikler">
              {features.length ? (
                features.map((f) => (
                  <div key={f}>{f}</div>
                ))
              ) : (
                <div>—</div>
              )}
            </Accordion>
            <Accordion title="Açıklama">
              {productDesc(product, locale)}
            </Accordion>
            <Accordion title="Garanti">
              Ömür boyu üretim hatası garantisi ve 30 gün koşulsuz iade
              koşulları ürün tipine göre değişebilir.
            </Accordion>
          </div>

          <Link
            href="/urunler"
            className="mt-8 inline-block text-sm text-fg-dim hover:text-accent"
          >
            ← {t.backCatalog}
          </Link>
        </div>
      </div>
    </div>
  );
}
