"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/CartProvider";
import { ProductVisual } from "@/components/ProductVisual";
import { formatPrice } from "@/lib/money";
import { useProducts } from "@/components/ProductsProvider";

export default function CartPage() {
  const { items, setQuantity, remove, ready: cartReady } = useCart();
  const { getById, ready: productsReady } = useProducts();

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = getById(item.productId);
        if (!product) return null;
        return { item, product };
      })
      .filter(Boolean) as {
      item: { productId: string; quantity: number };
      product: NonNullable<ReturnType<typeof getById>>;
    }[];
  }, [items, getById]);

  const total = lines.reduce(
    (sum, l) => sum + l.product.price * l.item.quantity,
    0
  );

  if (!cartReady || !productsReady) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-fg-muted md:px-12">
        Sepet yükleniyor…
      </div>
    );
  }

  return (
    <div className="animate-fade mx-auto max-w-3xl px-5 py-10 md:px-12 md:py-14">
      <p className="text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
        Sepet
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Sepetiniz</h1>

      {lines.length === 0 ? (
        <div className="noir-card mt-12 p-10 text-center">
          <p className="text-fg-muted">Sepetiniz boş.</p>
          <Link href="/urunler" className="btn-primary mt-6 inline-flex">
            Ürünlere git
          </Link>
        </div>
      ) : (
        <>
          <ul className="noir-card mt-10 divide-y divide-line overflow-hidden">
            {lines.map(({ item, product }) => (
              <li key={product.id} className="flex gap-4 p-4 sm:gap-6 sm:p-5">
                <ProductVisual
                  product={product}
                  className="h-28 w-20 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-24"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-semibold tracking-wider text-accent uppercase">
                        {product.brand}
                      </p>
                      <Link
                        href={`/urun/${product.slug}`}
                        className="mt-1 block text-lg font-semibold hover:text-accent"
                      >
                        {product.name}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="text-xs text-fg-dim hover:text-danger"
                    >
                      Sil
                    </button>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                    <div className="flex items-center rounded-xl border border-line">
                      <button
                        type="button"
                        className="px-3 py-2 text-fg-dim hover:text-fg"
                        onClick={() =>
                          setQuantity(product.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-2 text-fg-dim hover:text-fg"
                        onClick={() =>
                          setQuantity(product.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold tabular-nums text-accent">
                      {formatPrice(product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="noir-card mt-6 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs tracking-wider text-fg-dim uppercase">
                Toplam
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-accent">
                {formatPrice(total)}
              </p>
            </div>
            <Link href="/odeme" className="btn-primary">
              Ödemeye geç
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
