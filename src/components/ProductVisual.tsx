import Image from "next/image";
import type { Product } from "@/lib/types";

export function ProductVisual({
  product,
  className = "",
  large = false,
}: {
  product: Product;
  className?: string;
  large?: boolean;
}) {
  if (product.image) {
    return (
      <div
        className={`relative overflow-hidden bg-bg-soft ${className}`}
        style={{
          background: `linear-gradient(160deg, ${product.accent}18 0%, #0e0e10 55%, #070708 100%)`,
        }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 33vw"}
          className="object-contain p-6 md:p-8"
          priority={large}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg/80 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(155deg, ${product.accent}22 0%, #0e0e10 45%, #070708 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, ${product.accent}55, transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,rgba(7,7,8,0.85))]" />
      <div
        className={`relative flex h-full flex-col items-center justify-center ${large ? "gap-4 p-10" : "gap-2 p-6"}`}
      >
        <span
          className={`font-mono tracking-[0.25em] text-steel uppercase ${large ? "text-xs" : "text-[0.6rem]"}`}
        >
          {product.brand}
        </span>
        <div
          className={`rounded-xl border border-line-strong bg-bg/40 backdrop-blur-sm ${large ? "h-40 w-24" : "h-28 w-16"}`}
          style={{
            boxShadow: `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px ${product.accent}33, 0 0 32px ${product.accent}22`,
          }}
        >
          <div
            className={`mx-auto mt-[18%] rounded-md ${large ? "h-10 w-14" : "h-7 w-10"}`}
            style={{
              background: `${product.accent}33`,
              border: `1px solid ${product.accent}66`,
              boxShadow: `0 0 18px ${product.accent}55`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
