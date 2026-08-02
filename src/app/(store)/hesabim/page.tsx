"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { formatPrice } from "@/lib/money";
import { useLocale } from "@/lib/i18n";

type OrderRow = {
  id: string;
  accessToken?: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  items: { name: string; quantity: number }[];
};

const STATUS: Record<string, { tr: string; en: string }> = {
  pending: { tr: "Beklemede", en: "Pending" },
  paid: { tr: "Ödendi", en: "Paid" },
  shipped: { tr: "Kargoda", en: "Shipped" },
  delivered: { tr: "Teslim", en: "Delivered" },
  cancelled: { tr: "İptal", en: "Cancelled" },
  wrong_amount: { tr: "Yanlış tutar", en: "Wrong amount" },
};

export default function AccountPage() {
  const { user, ready, logout, updateProfile } = useAuth();
  const { locale, t } = useLocale();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    postalCode: "",
  });

  useEffect(() => {
    if (ready && !user) router.replace("/giris");
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      city: user.city || "",
      district: user.district || "",
      address: user.address || "",
      postalCode: user.postalCode || "",
    });
    fetch("/api/auth/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { orders?: OrderRow[] }) => setOrders(data.orders || []))
      .catch(() => setOrders([]));
  }, [user]);

  async function saveAddress(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        address: form.address.trim(),
        postalCode: form.postalCode.trim(),
      });
      setMsg(locale === "en" ? "Saved." : "Teslimat bilgileri kaydedildi.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || !user) {
    return (
      <div className="px-5 py-20 text-center text-fg-dim md:px-12">…</div>
    );
  }

  return (
    <div className="animate-fade mx-auto max-w-[900px] px-5 py-8 md:px-12 md:py-10">
      <p className="mb-7 text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
        {t.account}
      </p>

      <div className="noir-card mb-8 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-pill text-xl font-bold text-accent">
          {(user.name || user.email).slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-[17px] font-bold">
            {user.name || "Noir"}
          </div>
          <div className="mt-1 text-sm text-fg-dim">{user.email}</div>
        </div>
        <button
          type="button"
          onClick={() => logout().then(() => router.push("/"))}
          className="btn-ghost text-sm"
        >
          {t.signOut}
        </button>
      </div>

      <h2 className="mb-3.5 text-base font-bold">{t.shippingAddress}</h2>
      <form onSubmit={saveAddress} className="noir-card mb-8 grid gap-3.5 p-6 sm:grid-cols-2">
        {(
          [
            ["name", t.name],
            ["phone", t.phone],
            ["city", t.city],
            ["district", locale === "en" ? "District" : "İlçe"],
            ["postalCode", locale === "en" ? "Postal code" : "Posta kodu"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input
              className="input-field"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="label">{t.address}</label>
          <textarea
            className="input-field min-h-[88px]"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
        {msg && <p className="sm:col-span-2 text-sm text-fg-muted">{msg}</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "…" : t.save}
          </button>
        </div>
      </form>

      <h2 className="mb-3.5 text-base font-bold">{t.myOrders}</h2>
      <div className="noir-card mb-8 overflow-hidden">
        {orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-fg-dim">
            {t.noOrders}{" "}
            <Link href="/urunler" className="text-accent hover:underline">
              {t.goProducts}
            </Link>
          </p>
        ) : (
          orders.map((o) => {
            const href = o.accessToken
              ? `/siparis/${o.id}?t=${o.accessToken}`
              : `/siparis/${o.id}`;
            const label = STATUS[o.status]?.[locale] || o.status;
            return (
              <Link
                key={o.id}
                href={href}
                className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0 hover:bg-bg-pill/40"
              >
                <div className="min-w-0 flex-1 text-sm font-semibold">
                  #{o.id} · {o.items?.[0]?.name || "—"}
                  {o.trackingNumber ? (
                    <span className="mt-1 block text-xs font-normal text-fg-dim">
                      {o.carrier || "Kargo"}: {o.trackingNumber}
                    </span>
                  ) : null}
                </div>
                <div className="w-[120px] text-[13px] text-fg-dim">
                  {new Date(o.createdAt).toLocaleDateString(
                    locale === "en" ? "en-GB" : "tr-TR"
                  )}
                </div>
                <div className="w-[100px] text-[13px] font-semibold text-success">
                  {label}
                </div>
                <div className="text-[13px] tabular-nums text-fg-muted">
                  {formatPrice(o.total, o.currency)}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
