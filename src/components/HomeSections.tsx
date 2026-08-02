"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { useLocale, productName, productShort } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";
import { ProductCard } from "./ProductCard";

type MarketCoin = {
  rank: number;
  name: string;
  symbol: string;
  price: string;
  change: string;
  up: boolean;
  image?: string;
};

const FALLBACK: MarketCoin[] = [
  { rank: 1, name: "Bitcoin", symbol: "BTC", price: "₺—", change: "—", up: true },
  { rank: 2, name: "Ethereum", symbol: "ETH", price: "₺—", change: "—", up: true },
  { rank: 3, name: "Tether", symbol: "USDT", price: "₺—", change: "—", up: true },
];

export function HomeSections({ featured }: { featured: Product[] }) {
  const { t, locale } = useLocale();
  const [coins, setCoins] = useState<MarketCoin[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=try&order=market_cap_desc&per_page=10&page=1&sparkline=false"
    )
      .then((r) => r.json())
      .then(
        (
          rows: {
            name: string;
            symbol: string;
            image?: string;
            current_price: number;
            price_change_percentage_24h: number;
          }[]
        ) => {
          if (cancelled || !Array.isArray(rows)) return;
          setCoins(
            rows.map((c, i) => {
              const change = c.price_change_percentage_24h ?? 0;
              return {
                rank: i + 1,
                name: c.name,
                symbol: c.symbol.toUpperCase(),
                image: c.image,
                price: `₺${Math.round(c.current_price).toLocaleString("tr-TR")}`,
                change: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
                up: change >= 0,
              };
            })
          );
        }
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="mx-auto max-w-[1300px] px-5 md:px-12">
        <div className="flex overflow-hidden rounded-[14px] border border-line bg-line">
          {[
            { value: "256-bit", label: "Donanımsal Şifreleme" },
            { value: "60+", label: "Desteklenen Zincir" },
            { value: "Ömür Boyu", label: "Garanti" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 bg-bg-soft px-6 py-6 text-center md:px-8 md:py-7"
            >
              <div className="text-[28px] font-bold text-accent">{s.value}</div>
              <div className="mt-1.5 text-[13px] text-fg-dim">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-5 pt-14 md:px-12 md:pt-16">
        <div className="mb-5 flex items-center gap-2.5">
          <h2 className="text-[22px] font-bold tracking-[-0.4px]">
            Canlı Piyasa
          </h2>
          <span className="h-[7px] w-[7px] animate-[pulseGlow_1.6s_ease-in-out_infinite_alternate] rounded-full bg-success" />
        </div>
        <div className="noir-card overflow-hidden">
          {coins.map((coin) => (
            <div
              key={coin.symbol}
              className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0 md:px-5"
            >
              <span className="w-5 text-xs text-fg-faint">{coin.rank}</span>
              {coin.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coin.image}
                  alt={coin.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-pill text-xs font-bold">
                  {coin.symbol.slice(0, 1)}
                </span>
              )}
              <div className="w-[120px] md:w-[150px]">
                <div className="text-sm font-semibold">{coin.name}</div>
                <div className="text-xs text-fg-dim">{coin.symbol}</div>
              </div>
              <div className="flex-1 text-right text-sm font-semibold tabular-nums">
                {coin.price}
              </div>
              <div
                className={`w-[76px] text-right text-[13px] font-semibold tabular-nums ${
                  coin.up ? "text-success" : "text-danger"
                }`}
              >
                {coin.change}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-5 py-14 md:px-12 md:py-16">
        <div className="mb-9 flex items-end justify-between gap-6">
          <div>
            <p className="text-[13px] tracking-[1px] text-fg-faint uppercase">
              {t.selected}
            </p>
            <h2 className="mt-2 text-[26px] font-bold tracking-[-0.5px]">
              {t.browseCatalog}
            </h2>
          </div>
          <Link
            href="/urunler"
            className="hidden text-xs font-semibold tracking-wider text-accent uppercase sm:inline"
          >
            {t.viewAll}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {featured.length === 0 ? (
            <p className="text-sm text-fg-dim sm:col-span-2 lg:col-span-3">
              Henüz vitrin ürünü yok. Admin panelde ürüne “Anasayfada göster”
              işaretle.
            </p>
          ) : (
            featured.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-5 pb-20 md:px-12">
        <h2 className="mb-9 text-[26px] font-bold tracking-[-0.5px]">
          Neden Noir
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Askeri Sınıf Güvenlik",
              body: "Secure Element çip ve çoklu imza doğrulaması ile anahtarlarınız asla cihazdan çıkmaz.",
              shape: "rounded-[10px]",
            },
            {
              title: "60+ Zincir Desteği",
              body: "Bitcoin, Ethereum ve daha fazlasını tek zarif cihazda saklayın.",
              shape: "rounded-full",
            },
            {
              title: "Zamansız Tasarım",
              body: "Uçak kalitesinde alüminyum gövde, el işçiliği detaylar.",
              shape: "rounded",
            },
          ].map((f) => (
            <div key={f.title} className="noir-card p-7">
              <div
                className={`mb-[18px] h-10 w-10 border-2 border-accent ${f.shape}`}
              />
              <h3 className="mb-2.5 text-[17px] font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-fg-muted">{f.body}</p>
            </div>
          ))}
        </div>
        {featured[0] && (
          <p className="mt-8 text-sm text-fg-dim">
            Öne çıkan: {productName(featured[0], locale)} —{" "}
            {productShort(featured[0], locale)}
          </p>
        )}
      </section>
    </>
  );
}
