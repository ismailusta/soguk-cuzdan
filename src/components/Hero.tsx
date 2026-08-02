"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";
import { useLocale, productName, productShort } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";

export function Hero({ featured = [] }: { featured?: Product[] }) {
  const { t, locale } = useLocale();
  const heroProduct = featured[0];

  return (
    <section className="animate-fade px-5 pt-8 pb-16 md:px-12 md:pt-10 md:pb-20">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
          Vitrin
        </p>
        <div className="flex gap-2.5">
          <Link
            href="/urunler"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[oklch(0.28_0.006_260_/_0.5)] bg-[oklch(0.18_0.005_260)] text-sm"
            aria-label="Ara"
          >
            ⌕
          </Link>
          <Link
            href="/sepet"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[oklch(0.28_0.006_260_/_0.5)] bg-[oklch(0.18_0.005_260)] text-sm"
            aria-label="Sepet"
          >
            👜
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1300px] flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="animate-rise min-w-0 flex-1 lg:max-w-[460px]">
          <p className="mb-5 text-[13px] font-semibold tracking-[2px] text-accent uppercase">
            Noir · {t.heroEyebrow || "Soğuk Cüzdan"}
          </p>
          <h1 className="mb-5 text-[clamp(2.4rem,6vw,3.25rem)] leading-[1.08] font-bold tracking-[-1.5px]">
            Varlıklarınıza
            <br />
            layık bir zarafet.
          </h1>
          <p className="mb-9 max-w-[460px] text-[17px] leading-relaxed text-fg-muted">
            {heroProduct
              ? productShort(heroProduct, locale) || t.heroBody
              : t.heroBody}
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href={heroProduct ? `/urun/${heroProduct.slug}` : "/urunler"}
              className="btn-primary"
            >
              Şimdi Satın Al
            </Link>
            <Link href="/urunler" className="btn-ghost">
              {t.ctaCatalog || "Katalog"}
            </Link>
          </div>
        </div>

        <div className="relative flex h-[380px] w-full max-w-[380px] shrink-0 items-center justify-center md:h-[420px]">
          <div
            className="absolute h-[320px] w-[320px] rounded-full blur-[40px] animate-[pulseGlow_4s_ease-in-out_infinite_alternate]"
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-[6%] left-[-30px] flex h-[70px] w-[70px] items-center justify-center rounded-full text-2xl font-bold text-[#232a38] shadow-[0_14px_30px_rgba(0,0,0,0.55)]"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #ffc768, #f7931a 60%, #b86b00)",
              animation:
                "spin3d 8s linear infinite, floatA 5.5s ease-in-out infinite alternate",
            }}
          >
            ₿
          </div>
          <div
            className="absolute right-[-20px] bottom-[8%] flex h-[46px] w-[46px] items-center justify-center rounded-full text-lg font-bold text-[#232a38] shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #e3e9f2, #8f9bb3 60%, #4b5568)",
              animation:
                "spin3d 6.5s linear infinite reverse, floatB 4.5s ease-in-out infinite alternate",
            }}
          >
            Ξ
          </div>
          <div className="relative animate-[floatY_6s_ease-in-out_infinite_alternate]">
            {heroProduct ? (
              <div className="h-[340px] w-[260px] overflow-hidden rounded-[24px] border border-line md:h-[380px] md:w-[280px]">
                <ProductVisual product={heroProduct} className="h-full w-full" />
              </div>
            ) : (
              <div className="flex h-[340px] w-[260px] items-center justify-center rounded-[24px] border border-line bg-bg-elevated px-6 text-center text-sm text-fg-dim md:h-[380px] md:w-[280px]">
                Panelden “Anasayfada göster” işaretle
              </div>
            )}
          </div>
        </div>
      </div>

      {heroProduct && (
        <p className="mx-auto mt-6 max-w-[1300px] text-center text-sm text-fg-dim md:text-left">
          Vitrin ürünü:{" "}
          <Link href={`/urun/${heroProduct.slug}`} className="text-accent">
            {productName(heroProduct, locale)}
          </Link>{" "}
          · {formatPrice(heroProduct.price, heroProduct.currency)}
        </p>
      )}
    </section>
  );
}
