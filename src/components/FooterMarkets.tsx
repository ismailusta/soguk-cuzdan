"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap_rank: number | null;
};

function formatTry(n: number) {
  if (n >= 1000) {
    return `₺${Math.round(n).toLocaleString("tr-TR")}`;
  }
  if (n >= 1) {
    return `₺${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;
  }
  return `₺${n.toLocaleString("tr-TR", { maximumFractionDigits: 6 })}`;
}

export function FooterMarkets() {
  const { locale, t } = useLocale();
  const [coins, setCoins] = useState<MarketCoin[]>([]);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    fetch("/api/markets?kind=markets", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: MarketCoin[]) => {
        if (!cancelled && Array.isArray(data)) setCoins(data.slice(0, 50));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  if (coins.length === 0) return null;

  return (
    <section className="mt-auto border-t border-line bg-bg-elevated/60">
      <div className="mx-auto max-w-[1300px] py-8">
        <div className="mb-4 flex items-baseline justify-between gap-3 px-5 md:px-12">
          <p className="text-xs tracking-[1.5px] text-fg-faint uppercase">
            {t.footerMarkets}
          </p>
          <p className="text-[11px] text-fg-faint">
            {locale === "en"
              ? "Swipe → · CoinGecko"
              : "Kaydır → · CoinGecko"}
          </p>
        </div>
        <ul className="-mx-0 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:thin] snap-x snap-mandatory md:px-12 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line-strong">
          {coins.map((c) => {
            const change = c.price_change_percentage_24h ?? 0;
            const up = change >= 0;
            return (
              <li
                key={c.id}
                className="flex w-[132px] shrink-0 snap-start items-center gap-2.5 rounded-xl border border-line bg-bg-nav/50 px-3 py-2.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 rounded-full"
                  loading="lazy"
                />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[12px] font-semibold tracking-wide uppercase">
                    {c.symbol}
                  </p>
                  <p className="truncate text-[11px] tabular-nums text-fg-muted">
                    {formatTry(c.current_price)}
                  </p>
                  <p
                    className={`text-[10px] tabular-nums ${
                      up ? "text-success" : "text-danger"
                    }`}
                  >
                    {up ? "▲" : "▼"}
                    {Math.abs(change).toFixed(1)}%
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
