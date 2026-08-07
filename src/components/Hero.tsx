"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/hero";
import { useLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";

const TITLE_SIZE: Record<HeroSlide["titleSize"], string> = {
  sm: "text-[clamp(1.6rem,4vw,2.2rem)]",
  md: "text-[clamp(2rem,5vw,2.8rem)]",
  lg: "text-[clamp(2.4rem,6vw,3.4rem)]",
  xl: "text-[clamp(2.6rem,7vw,4.2rem)]",
};

const SUB_SIZE: Record<HeroSlide["subtitleSize"], string> = {
  sm: "text-[13px] md:text-[14px]",
  md: "text-[15px] md:text-[16px]",
  lg: "text-[16px] md:text-[18px]",
};

const BADGE_TONE: Record<HeroSlide["badgeTone"], string> = {
  accent: "bg-accent/25 text-accent",
  success: "bg-success/25 text-success",
  danger: "bg-danger/25 text-danger",
  muted: "bg-white/15 text-fg",
};

const DEFAULT_FROM = "oklch(0.12 0.02 260)";
const DEFAULT_TO = "oklch(0.16 0.04 80)";

function pick(
  locale: "tr" | "en",
  tr?: string | null,
  en?: string | null
): string {
  if (locale === "en" && en) return en;
  return tr || en || "";
}

function titleLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function FallbackSlide({ locale }: { locale: "tr" | "en" }): HeroSlide {
  return {
    id: "fallback",
    title: locale === "en" ? "KRIPTOSTORE\nCOLLECTION" : "KRIPTOSTORE\nCOLLECTION",
    subtitle:
      locale === "en"
        ? "Ledger, Trezor, SafePal and more — one store."
        : "Ledger, Trezor, SafePal ve daha fazlası — tek mağaza.",
    badge: locale === "en" ? "Collection" : "Koleksiyon",
    badgeTone: "muted",
    ctaLabel: locale === "en" ? "Browse catalog" : "Kataloğa git",
    ctaHref: "/urunler",
    showPrice: false,
    product: null,
    layout: "textOverlay",
    titleSize: "xl",
    subtitleSize: "md",
    titleAlign: "center",
    titleUppercase: true,
    accentGlow: true,
  };
}

/** All slides = full-bleed lifestyle banner (lwallet-style overlay). */
export function Hero({ banners = [] }: { banners?: HeroSlide[] }) {
  const { locale } = useLocale();
  const slides =
    banners.length > 0 ? banners : [FallbackSlide({ locale })];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];
  const title = pick(locale, slide.title, slide.titleEn);
  const subtitle = pick(locale, slide.subtitle, slide.subtitleEn);
  const badge = pick(locale, slide.badge, slide.badgeEn);
  const ctaLabel = pick(locale, slide.ctaLabel, slide.ctaLabelEn);
  const secondaryLabel = pick(
    locale,
    slide.secondaryLabel,
    slide.secondaryLabelEn
  );

  const productHref = slide.product
    ? `/urun/${slide.product.slug}`
    : undefined;
  const ctaHref = slide.ctaHref || productHref || "/urunler";
  const secondaryHref = slide.secondaryHref || "/urunler";

  const from = slide.gradientFrom || DEFAULT_FROM;
  const to = slide.gradientTo || DEFAULT_TO;
  const lines = titleLines(title);
  const alignCenter = slide.titleAlign !== "left";
  const showPrice = Boolean(slide.showPrice && slide.product);
  const hasOverlayText = Boolean(
    lines.length ||
      subtitle ||
      badge ||
      ctaLabel ||
      secondaryLabel ||
      showPrice
  );
  const [bgBroken, setBgBroken] = useState(false);

  useEffect(() => {
    setBgBroken(false);
  }, [slide.id, slide.imageUrl]);

  const showBg = Boolean(slide.imageUrl) && !bgBroken;

  return (
    <section className="animate-fade relative z-0 w-full">
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${from}, ${to})`,
        }}
      >
        {/* Full-bleed image */}
        {showBg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.imageUrl}
            alt={title || "Banner"}
            className="absolute inset-0 z-0 h-full w-full object-cover"
            onError={() => setBgBroken(true)}
          />
        )}

        {/* Dark scrim only when text sits on the image */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              showBg && hasOverlayText
                ? "linear-gradient(180deg, rgba(8,10,14,0.35) 0%, rgba(8,10,14,0.55) 55%, rgba(8,10,14,0.72) 100%)"
                : "transparent",
          }}
        />

        {slide.accentGlow && hasOverlayText && (
          <div
            className="pointer-events-none absolute inset-0 z-[1] opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 50% 40%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%)",
            }}
          />
        )}

        <div
          className={`relative z-[2] mx-auto flex min-h-[420px] max-w-[900px] flex-col justify-center px-5 py-16 md:min-h-[520px] md:py-20 ${
            alignCenter ? "items-center text-center" : "items-start text-left"
          } ${hasOverlayText ? "" : "pointer-events-none"}`}
        >
          {badge ? (
            <span
              className={`mb-5 inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold tracking-[1.4px] uppercase ${BADGE_TONE[slide.badgeTone]}`}
            >
              {badge}
            </span>
          ) : null}

          {lines.length > 0 ? (
            <h1
              className={`leading-[1.02] font-bold tracking-[-2px] text-fg ${TITLE_SIZE[slide.titleSize]} ${
                slide.titleUppercase ? "uppercase" : ""
              }`}
            >
              {lines.map((line, i) => (
                <span key={`${slide.id}-${i}`} className="block">
                  {line}
                </span>
              ))}
            </h1>
          ) : null}

          {subtitle ? (
            <p
              className={`mt-5 max-w-lg whitespace-pre-line leading-relaxed text-fg-muted ${SUB_SIZE[slide.subtitleSize]}`}
            >
              {subtitle}
            </p>
          ) : null}

          {showPrice && slide.product ? (
            <p className="mt-5 text-2xl font-semibold tabular-nums text-accent">
              {formatPrice(slide.product.price, slide.product.currency)}
            </p>
          ) : null}

          {(ctaLabel || secondaryLabel) && (
            <div className="mt-8 flex flex-wrap items-center gap-4 pointer-events-auto">
              {ctaLabel ? (
                <Link
                  href={ctaHref}
                  className="btn-primary rounded-full px-8 py-3.5 text-sm font-bold tracking-wide uppercase"
                >
                  {ctaLabel}
                </Link>
              ) : null}
              {secondaryLabel ? (
                <Link
                  href={secondaryHref}
                  className="text-sm font-medium text-fg-dim underline-offset-4 hover:text-fg hover:underline"
                >
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          )}

          {slides.length > 1 && (
            <div
              className={`mt-12 flex gap-2 pointer-events-auto ${
                hasOverlayText ? "" : "absolute bottom-8 left-1/2 -translate-x-1/2"
              }`}
              role="tablist"
              aria-label="Hero"
            >
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? "w-7 bg-accent"
                      : "w-2 bg-fg-faint hover:bg-fg-dim"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
