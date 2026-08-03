"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { productName, productShort, useLocale } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

function normalize(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function ProductFilters({
  products,
  brands,
}: {
  products: Product[];
  brands: string[];
}) {
  const { locale, t } = useLocale();
  const searchParams = useSearchParams();
  const [brand, setBrand] = useState("all");
  const [stockOnly, setStockOnly] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
    const b = searchParams.get("brand");
    if (b) setBrand(b);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());

    return products.filter((p) => {
      if (brand !== "all" && p.brand !== brand) return false;
      if (stockOnly && !p.inStock) return false;
      if (!q) return true;

      const haystack = normalize(
        [
          productName(p, locale),
          p.name,
          p.nameEn || "",
          p.brand,
          productShort(p, locale),
          p.slug,
          ...(p.features || []),
        ].join(" ")
      );
      return haystack.includes(q);
    });
  }, [products, brand, stockOnly, query, locale]);

  const placeholder =
    brand === "all"
      ? t.searchPlaceholder
      : `${brand} ${t.searchInBrand}…`;

  return (
    <div>
      <div className="search-bar animate-rise mb-8">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M20 20l-3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={brand === "all" ? t.searchAll : `${brand} ${t.searchInBrand}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="font-mono text-[0.65rem] tracking-wider text-fg-muted uppercase hover:text-amber"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <div
          className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] snap-x snap-mandatory md:mx-0 md:px-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent"
          role="tablist"
          aria-label={t.catalog}
        >
          <div className="flex h-[8.75rem] w-max flex-col flex-wrap content-start gap-2">
            <button
              type="button"
              onClick={() => setBrand("all")}
              className={`pill shrink-0 snap-start px-4 py-2 font-mono text-xs tracking-[0.14em] uppercase transition-colors ${
                brand === "all" ? "pill-active" : ""
              }`}
            >
              {t.filterAll}
            </button>
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrand(b)}
                className={`pill shrink-0 snap-start px-4 py-2 font-mono text-xs tracking-[0.14em] uppercase transition-colors ${
                  brand === b ? "pill-active" : ""
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <label className="pill flex w-fit shrink-0 cursor-pointer items-center gap-2 px-4 py-2 font-mono text-xs tracking-[0.12em] uppercase">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => setStockOnly(e.target.checked)}
            className="accent-amber"
          />
          {t.inStock}
        </label>
      </div>

      <p className="mt-2 font-mono text-xs tracking-wider text-fg-muted uppercase">
        {filtered.length} {t.productCount}
        {brand !== "all" ? ` · ${brand}` : ""}
        {query.trim() ? ` · “${query.trim()}”` : ""}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-fg-muted">{t.noMatch}</p>
      )}
    </div>
  );
}
