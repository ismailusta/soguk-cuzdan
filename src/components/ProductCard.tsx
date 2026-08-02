"use client";

import Link from "next/link";
import { productName, useLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";

/** Catalog card — lwallet-like hierarchy, Kriptostore styling */
export function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLocale();

  return (
    <Link
      href={`/urun/${product.slug}`}
      className="group flex flex-col"
    >
      <div className="relative overflow-hidden rounded-[14px] border border-line bg-bg-elevated transition-colors group-hover:border-line-strong">
        <ProductVisual
          product={product}
          className="aspect-square w-full"
        />
        {!product.inStock && (
          <span className="absolute top-2.5 right-2.5 rounded-md bg-danger/90 px-2 py-0.5 text-[10px] font-semibold text-fg">
            {t.outOfStock}
          </span>
        )}
      </div>
      <div className="mt-3 flex min-w-0 flex-1 flex-col gap-1 px-0.5">
        <h3 className="line-clamp-2 min-w-0 [overflow-wrap:anywhere] break-words text-[13px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent sm:text-[15px]">
          {productName(product, locale)}
        </h3>
        <p className="text-[11px] tracking-wide text-fg-faint uppercase sm:text-xs">
          {product.brand}
        </p>
        <p className="mt-auto pt-1 text-sm font-semibold tabular-nums text-accent sm:text-[15px]">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
