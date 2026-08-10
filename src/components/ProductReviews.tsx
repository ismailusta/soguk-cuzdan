"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";
import type { ProductReviewPublic } from "@/lib/reviews-shared";
import { summarizeReviews } from "@/lib/reviews-shared";

function Stars({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "lg"
      ? "text-xl tracking-tight"
      : size === "sm"
        ? "text-sm tracking-tight"
        : "text-base tracking-tight";
  const full = Math.round(value);
  return (
    <span
      className={`${cls} text-accent`}
      aria-label={`${value} / 5`}
      title={`${value} / 5`}
    >
      {"★".repeat(Math.min(5, Math.max(0, full)))}
      <span className="text-fg-dim">
        {"★".repeat(Math.max(0, 5 - Math.min(5, Math.max(0, full))))}
      </span>
    </span>
  );
}

export function ReviewRatingBadge({
  reviews,
}: {
  reviews: ProductReviewPublic[];
}) {
  const { locale } = useLocale();
  const summary = summarizeReviews(filterByLocale(reviews, locale));
  if (!summary.count) return null;

  return (
    <a
      href="#urun-degerlendirmeleri"
      className="mb-4 inline-flex flex-wrap items-center gap-2 text-sm text-fg-muted hover:text-fg"
    >
      <Stars value={summary.average} size="sm" />
      <span className="tabular-nums font-medium text-fg">
        {summary.average.toFixed(1)}
      </span>
      <span>
        ({summary.count}{" "}
        {locale === "en"
          ? summary.count === 1
            ? "review"
            : "reviews"
          : "değerlendirme"}
        )
      </span>
    </a>
  );
}

function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function filterByLocale(
  all: ProductReviewPublic[],
  locale: string
): ProductReviewPublic[] {
  const preferred = all.filter((r) => (r.locale || "tr") === locale);
  if (preferred.length) return preferred;
  // fallback if a product only has one language seeded
  return all;
}

export function ProductReviewsSection({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: ProductReviewPublic[];
}) {
  const { locale, t } = useLocale();
  const [allReviews, setAllReviews] = useState(initialReviews);
  const reviews = filterByLocale(allReviews, locale);
  const summary = summarizeReviews(reviews);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function updateScrollButtons() {
    const el = scrollerRef.current;
    if (!el) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }

  function scrollByCard(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = (card?.offsetWidth || 280) + 16;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    el?.scrollTo({ left: 0 });
    updateScrollButtons();
    if (!el) return;
    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [reviews.length, locale]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/reviews?productId=${encodeURIComponent(productId)}`,
          { credentials: "include" }
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          reviews?: ProductReviewPublic[];
          canReview?: boolean;
          alreadyReviewed?: boolean;
          loggedIn?: boolean;
        };
        if (data.reviews) setAllReviews(data.reviews);
        setCanReview(Boolean(data.canReview));
        setAlreadyReviewed(Boolean(data.alreadyReviewed));
        setLoggedIn(Boolean(data.loggedIn));
      } catch {
        // keep SSR data
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
          locale,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setErr(data.error || t.reviewError);
        return;
      }
      setMsg(data.message || t.reviewPending);
      setCanReview(false);
      setAlreadyReviewed(true);
      setTitle("");
      setBody("");
      setRating(5);
    } catch {
      setErr(t.reviewError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="urun-degerlendirmeleri"
      className="border-t border-line bg-bg-nav/25"
    >
      <div className="mx-auto w-full max-w-[900px] px-5 pt-14 md:px-12 md:pt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t.reviewsTitle}
            </h2>
            {summary.count > 0 ? (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
                <Stars value={summary.average} />
                <span className="tabular-nums font-semibold text-fg">
                  {summary.average.toFixed(1)}
                </span>
                <span>
                  · {summary.count} {t.reviewsCount}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-fg-muted">{t.reviewsEmpty}</p>
            )}
          </div>

          {reviews.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canPrev}
                aria-label={locale === "en" ? "Previous reviews" : "Önceki yorumlar"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-lg text-fg transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canNext}
                aria-label={locale === "en" ? "Next reviews" : "Sonraki yorumlar"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-lg text-fg transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="relative mb-12">
          <ul
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 md:px-12 [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent"
            style={{
              maxWidth: 900,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {reviews.map((r) => (
              <li
                key={r.id}
                data-review-card
                className="w-[min(82vw,300px)] shrink-0 snap-start border-b border-line pb-5 sm:w-[280px]"
              >
                <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Stars value={r.rating} size="sm" />
                  {r.verifiedPurchase && (
                    <span className="text-[11px] tracking-wide text-accent uppercase">
                      {t.reviewVerified}
                    </span>
                  )}
                </div>
                <p className="mb-1 text-sm font-semibold">{r.authorName}</p>
                {r.createdAt && (
                  <p className="mb-2 text-xs text-fg-dim">
                    {formatDate(r.createdAt, locale)}
                  </p>
                )}
                {r.title ? (
                  <p className="mb-1.5 text-[14px] font-semibold leading-snug">
                    {r.title}
                  </p>
                ) : null}
                <p className="line-clamp-5 text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mx-auto w-full max-w-[900px] px-5 pb-14 md:px-12 md:pb-16">
        <div className="border-t border-line pt-10">
          <h3 className="mb-4 text-lg font-semibold tracking-tight">
            {t.reviewWrite}
          </h3>

          {!loggedIn && (
            <p className="text-sm text-fg-muted">
              {t.reviewLoginRequired}{" "}
              <Link href="/giris" className="text-accent hover:underline">
                {t.signIn}
              </Link>
            </p>
          )}

          {loggedIn && alreadyReviewed && !canReview && (
            <p className={`text-sm ${msg ? "text-success" : "text-fg-muted"}`}>
              {msg || t.reviewAlready}
            </p>
          )}

          {loggedIn && !canReview && !alreadyReviewed && (
            <p className="text-sm text-fg-muted">{t.reviewNeedPurchase}</p>
          )}

          {canReview && (
            <form onSubmit={submit} className="max-w-xl space-y-4">
              <div>
                <label className="mb-2 block text-sm text-fg-muted">
                  {t.reviewRating}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`text-2xl transition ${
                        n <= rating ? "text-accent" : "text-fg-dim"
                      }`}
                      aria-label={`${n}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-fg-muted">
                  {t.reviewTitleOptional}
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-xl border border-line bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-fg-muted">
                  {t.reviewBody}
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  className="w-full rounded-xl border border-line bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              {err && <p className="text-sm text-danger">{err}</p>}
              {msg && <p className="text-sm text-success">{msg}</p>}
              <button
                type="submit"
                disabled={busy}
                className="rounded-[14px] bg-accent px-6 py-3 text-sm font-bold text-accent-ink disabled:opacity-60"
              >
                {busy ? t.reviewSending : t.reviewSubmit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
