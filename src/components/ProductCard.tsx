"use client";

import Link from "next/link";
import { productName, productShort, useLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLocale();

  return (
    <Link
      href={`/urun/${product.slug}`}
      className="noir-card group flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      <ProductVisual
        product={product}
        className="aspect-[4/5] w-full rounded-t-[12px] sm:rounded-t-[16px]"
      />
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[1.2px] text-accent uppercase sm:text-[12px] sm:tracking-[1.5px]">
              {product.brand}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold tracking-tight transition-colors group-hover:text-accent sm:mt-1 sm:text-lg">
              {productName(product, locale)}
            </h3>
          </div>
          {!product.inStock && (
            <span className="shrink-0 rounded-md bg-danger/10 px-1.5 py-0.5 text-[9px] font-semibold text-danger sm:rounded-lg sm:px-2 sm:text-[11px]">
              {t.outOfStock}
            </span>
          )}
        </div>
        <p className="line-clamp-2 hidden text-sm leading-relaxed text-fg-muted sm:block">
          {productShort(product, locale)}
        </p>
        <p className="mt-auto pt-1 text-xs font-semibold tabular-nums text-accent sm:pt-2 sm:text-sm">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
