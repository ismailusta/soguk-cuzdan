"use client";

import { Suspense } from "react";
import { ProductFilters } from "@/components/ProductFilters";
import { useProducts } from "@/components/ProductsProvider";
import { useLocale } from "@/lib/i18n";

function CatalogBody() {
  const { t } = useLocale();
  const { products, brands, ready } = useProducts();

  return (
    <div className="animate-fade mx-auto max-w-[1300px] px-5 py-10 md:px-12 md:py-14">
      <p className="text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
        {t.catalog}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        {t.products}
      </h1>
      <p className="mt-4 max-w-lg text-fg-muted">{t.catalogLead}</p>
      <div className="mt-12">
        {!ready ? (
          <p className="text-fg-muted">…</p>
        ) : (
          <ProductFilters products={products} brands={brands} />
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="px-5 py-20 text-center text-fg-dim">…</div>}>
      <CatalogBody />
    </Suspense>
  );
}
