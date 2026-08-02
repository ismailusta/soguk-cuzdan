"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";
import { useLocale } from "@/lib/i18n";

type Ticker = { price: string; change: string; up: boolean };

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, ready } = useCart();
  const { user } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [ticker, setTicker] = useState<Ticker>({
    price: "₺—",
    change: "—",
    up: true,
  });

  const navItems = useMemo(() => {
    const items = [
      { href: "/", label: t.navHome, match: (p: string) => p === "/" },
      {
        href: "/urunler",
        label: t.navProducts,
        match: (p: string) => p.startsWith("/urun"),
      },
      {
        href: "/odeme",
        label: t.navPay,
        match: (p: string) => p.startsWith("/odeme") || p.startsWith("/sepet"),
      },
      {
        href: user ? "/hesabim" : "/giris",
        label: user ? t.navAccount : t.navSignIn,
        match: (p: string) =>
          p.startsWith("/hesabim") || p.startsWith("/giris"),
      },
    ];
    return items;
  }, [t, user]);

  const activeIndex = useMemo(() => {
    const idx = navItems.findIndex((n) => n.match(pathname));
    return idx >= 0 ? idx : 0;
  }, [pathname, navItems]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try&include_24hr_change=true"
    )
      .then((r) => r.json())
      .then((data: { bitcoin?: { try?: number; try_24h_change?: number } }) => {
        if (cancelled || !data.bitcoin?.try) return;
        const change = data.bitcoin.try_24h_change ?? 0;
        setTicker({
          price: `₺${Math.round(data.bitcoin.try).toLocaleString("tr-TR")}`,
          change: `${change >= 0 ? "▲" : "▼"}${Math.abs(change).toFixed(1)}%`,
          up: change >= 0,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) {
      router.push("/urunler");
      return;
    }
    router.push(`/urunler?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
    setQ("");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg-nav">
      <div className="flex h-16 items-center gap-4 px-4 md:gap-8 md:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <BrandLogo size={44} priority />
        </Link>

        <nav className="relative hidden h-full items-center md:flex">
          <div
            className="absolute top-2 bottom-2 left-0 z-0 w-[104px] rounded-[9px] bg-bg-pill transition-transform duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ transform: `translateX(${activeIndex * 104}px)` }}
          />
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`relative z-[1] flex h-full w-[104px] items-center justify-center text-sm font-medium transition-colors ${
                  active ? "text-fg" : "text-fg-dim hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[oklch(0.28_0.006_260_/_0.5)] bg-[oklch(0.18_0.005_260)] text-fg-dim hover:text-fg"
            aria-label={t.search}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>

          <div className="hidden items-center gap-1 rounded-lg border border-line px-2 py-1 text-[11px] font-medium uppercase tracking-wider sm:flex">
            <button
              type="button"
              onClick={() => setLocale("tr")}
              className={locale === "tr" ? "text-accent" : "text-fg-dim"}
            >
              TR
            </button>
            <span className="text-fg-faint">/</span>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={locale === "en" ? "text-accent" : "text-fg-dim"}
            >
              EN
            </button>
          </div>

          <Link
            href="/sepet"
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[oklch(0.28_0.006_260_/_0.5)] bg-[oklch(0.18_0.005_260)] text-xs font-semibold"
            aria-label={t.cart}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
              <path d="M6 6L5 3H2" />
            </svg>
            {ready && count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-ink">
                {count}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2 font-mono text-xs lg:flex">
            <span className="h-1.5 w-1.5 animate-[pulseGlow_1.8s_ease-in-out_infinite_alternate] rounded-full bg-success" />
            <span className="text-fg-dim">BTC</span>
            <span className="text-fg-dim">{ticker.price}</span>
            <span className={ticker.up ? "text-success" : "text-danger"}>
              {ticker.change}
            </span>
          </div>

          <button
            type="button"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line md:hidden"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">{menuOpen ? t.closeMenu : t.openMenu}</span>
            <div className="flex w-4 flex-col gap-1">
              <span className={`h-0.5 bg-fg transition ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 bg-fg transition ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 bg-fg transition ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {searchOpen && (
        <form
          onSubmit={onSearch}
          className="animate-fade border-t border-line px-4 py-3 md:px-8"
        >
          <div className="mx-auto flex max-w-xl gap-2">
            <input
              autoFocus
              className="input-field flex-1"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.search}
            />
            <button type="submit" className="btn-primary shrink-0 px-4">
              {t.search}
            </button>
          </div>
        </form>
      )}

      {menuOpen && (
        <nav className="animate-fade border-t border-line px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  className={`block rounded-lg px-3 py-3 text-sm font-medium ${
                    item.match(pathname)
                      ? "bg-bg-pill text-fg"
                      : "text-fg-dim hover:bg-bg-pill/50 hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex gap-2 px-3">
              <button
                type="button"
                onClick={() => setLocale("tr")}
                className={`text-xs font-semibold ${locale === "tr" ? "text-accent" : "text-fg-dim"}`}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`text-xs font-semibold ${locale === "en" ? "text-accent" : "text-fg-dim"}`}
              >
                EN
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
