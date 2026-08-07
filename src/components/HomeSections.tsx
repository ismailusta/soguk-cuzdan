"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Product } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import { ProductCard } from "./ProductCard";

export function HomeSections({
  products,
  brands,
}: {
  products: Product[];
  brands: string[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/urunler?q=${encodeURIComponent(term)}` : "/urunler");
  }

  return (
    <>
      {/* Category strip — directly under hero, never overlaid on it */}
      <nav
        className="relative z-10 border-b border-accent/25 bg-[color-mix(in_oklch,var(--accent)_14%,var(--bg-nav))]"
        aria-label={t.categories}
      >
        <div className="mx-auto flex max-w-[1300px] items-center gap-4 px-5 py-4 md:px-12">
          <div className="-mx-1 flex min-w-0 flex-1 items-center overflow-x-auto px-1 [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent">
            <Link
              href="/urunler"
              className="shrink-0 rounded-full bg-accent px-3 py-1 text-[13px] font-semibold text-accent-ink md:text-[15px]"
            >
              {t.filterAll}
            </Link>
            {brands.map((b) => (
              <span key={b} className="flex shrink-0 items-center">
                <span
                  className="mx-2 text-[13px] text-accent/45 select-none md:mx-2.5 md:text-[15px]"
                  aria-hidden
                >
                  /
                </span>
                <Link
                  href={`/urunler?brand=${encodeURIComponent(b)}`}
                  className="px-1 text-[13px] font-medium text-accent/85 transition-colors hover:text-accent md:text-[15px]"
                >
                  {b}
                </Link>
              </span>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-5 sm:flex">
            <Link
              href="/urunler"
              className="flex items-center gap-1.5 text-[13px] font-medium text-accent/80 hover:text-accent"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              {t.filter}
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-accent/80 hover:text-accent"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              {t.search}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={onSearch}
            className="border-t border-accent/20 px-5 py-3 md:px-12"
          >
            <div className="mx-auto flex max-w-[1300px] gap-2">
              <input
                autoFocus
                className="input-field flex-1"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.searchPlaceholder}
              />
              <button type="submit" className="btn-primary shrink-0 px-4">
                {t.search}
              </button>
            </div>
          </form>
        )}
      </nav>

      {/* Catalog grid */}
      <section className="mx-auto max-w-[1300px] px-5 py-10 md:px-12 md:py-14">
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
          {products.length === 0 ? (
            <p className="col-span-2 text-sm text-fg-dim lg:col-span-4">
              Henüz ürün yok. Admin panelden ekleyin.
            </p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {products.length > 0 && (
          <div className="mt-12 text-center">
            <Link href="/urunler" className="btn-ghost">
              {t.viewAll}
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
