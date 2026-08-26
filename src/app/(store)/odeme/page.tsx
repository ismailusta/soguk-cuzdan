"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/money";
import { useProducts } from "@/components/ProductsProvider";

type Coin = "BTC" | "ETH" | "USDT";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clear, ready: cartReady } = useCart();
  const { getById, ready: productsReady } = useProducts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coin, setCoin] = useState<Coin>("BTC");

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = getById(item.productId);
        if (!product || !product.inStock) return null;
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      })
      .filter(Boolean) as {
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }[];
  }, [items, getById]);

  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Sepetiniz boş veya ürünler stokta değil.");
      return;
    }

    const form = new FormData(e.currentTarget);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCoin: coin,
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
          customer: {
            name: String(form.get("name") || ""),
            email: String(form.get("email") || ""),
            phone: String(form.get("phone") || ""),
            address: String(form.get("address") || ""),
            city: String(form.get("city") || ""),
            note: String(form.get("note") || ""),
          },
        }),
      });

      const data = (await res.json()) as {
        paymentUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || "Ödeme başlatılamadı.");
      }

      clear();
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setLoading(false);
    }
  }

  if (!cartReady || !productsReady) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-fg-muted md:px-12">
        Yükleniyor…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center md:px-12">
        <h1 className="text-3xl font-bold">Ödeme</h1>
        <p className="mt-4 text-fg-muted">Sepetiniz boş.</p>
        <Link href="/urunler" className="btn-primary mt-8 inline-flex">
          Ürünlere git
        </Link>
      </div>
    );
  }

  const coins: { id: Coin; name: string; symbol: string; mark: string }[] = [
    { id: "BTC", name: "Bitcoin", symbol: "BTC", mark: "₿" },
    { id: "ETH", name: "Ethereum", symbol: "ETH", mark: "Ξ" },
    { id: "USDT", name: "Tether", symbol: "USDT", mark: "T" },
  ];

  return (
    <div className="animate-fade mx-auto max-w-[1160px] px-5 py-8 md:px-12 md:py-10">
      <p className="mb-6 text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
        Ödeme
      </p>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div className="min-w-0 flex-1">
          <h1 className="mb-5 text-[22px] font-bold">Kripto ile Öde</h1>

          <div className="mb-8 flex flex-col gap-3">
            {coins.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCoin(c.id)}
                className="flex items-center gap-3.5 rounded-[14px] bg-bg-elevated px-5 py-[18px] text-left transition-colors"
                style={{
                  border: `2px solid ${
                    coin === c.id ? "var(--accent)" : "transparent"
                  }`,
                }}
              >
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-bg-pill text-sm font-bold">
                  {c.mark}
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold">
                    {c.name}
                  </span>
                  <span className="text-xs text-fg-dim">{c.symbol}</span>
                </span>
                <span className="text-[15px] font-semibold tabular-nums">
                  {formatPrice(total)}
                </span>
              </button>
            ))}
          </div>

          <div className="noir-card mb-8 p-6">
            {lines.map((l) => (
              <div
                key={l.productId}
                className="mb-2.5 flex justify-between text-sm text-fg-muted"
              >
                <span>
                  {l.name} ×{l.quantity}
                </span>
                <span className="tabular-nums">
                  {formatPrice(l.price * l.quantity)}
                </span>
              </div>
            ))}
            <div className="mb-4 flex justify-between text-sm text-fg-muted">
              <span>Kargo</span>
              <span>Ücretsiz</span>
            </div>
            <div className="mb-4 h-px bg-line" />
            <div className="flex justify-between text-[17px] font-bold">
              <span>Toplam</span>
              <span className="tabular-nums text-accent">
                {formatPrice(total)} · {coin}
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">
                Ad Soyad
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={user?.name || ""}
                className="input-field"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="email">
                  E-posta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={user?.email || ""}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  Telefon
                </label>
                <input
                  id="phone"
                  name="phone"
                  required
                  defaultValue={user?.phone || ""}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="city">
                Şehir
              </label>
              <input
                id="city"
                name="city"
                required
                defaultValue={user?.city || ""}
                className="input-field"
                placeholder="İstanbul"
              />
            </div>
            <div>
              <label className="label" htmlFor="address">
                Adres
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                defaultValue={
                  [user?.district, user?.address].filter(Boolean).join(", ") ||
                  ""
                }
                className="input-field resize-none"
                placeholder="Mahalle, sokak, bina, daire"
              />
            </div>
            <div>
              <label className="label" htmlFor="note">
                Not
              </label>
              <input id="note" name="note" className="input-field" />
            </div>

            {error && (
              <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full font-bold"
            >
              {loading
                ? "Cryptomus açılıyor…"
                : `${coin} ile Cryptomus’ta öde`}
            </button>
            <p className="text-center text-xs leading-relaxed text-fg-faint">
              Ödeme Cryptomus üzerinden tamamlanır. Onay sonrası sipariş
              otomatik işlenir. Destek:{" "}
              <a href="mailto:support@kriptostore.com" className="underline">
                support@kriptostore.com
              </a>
            </p>
          </form>
        </div>

        <aside className="w-full shrink-0 lg:w-[340px]">
          <div className="noir-card rounded-[20px] p-7 text-center">
            <p className="mb-4 text-[13px] tracking-[1px] text-fg-dim uppercase">
              {coin} ile ödeme
            </p>
            <div className="mx-auto flex h-[200px] w-[200px] items-center justify-center rounded-2xl border border-line bg-bg-nav px-4 text-center text-sm text-fg-dim">
              Formu gönderince Cryptomus ödeme sayfası açılır
            </div>
            <div className="mt-5 rounded-xl bg-bg-nav p-3.5">
              <div className="mb-1 text-xs text-fg-dim">Ödeme</div>
              <div className="text-2xl font-bold tabular-nums text-accent">
                {formatPrice(total)}
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-fg-faint">
              Güvenli kripto ödeme · İletişim ve iade politikası sitede yayında.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
