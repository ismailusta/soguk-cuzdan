import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CUSTOMER_COOKIE } from "@/lib/customer-auth";
import { formatPrice } from "@/lib/money";
import { getOrderIfAllowed } from "@/lib/orders";
import { getPayloadClient } from "@/lib/payload";
import type { OrderStatus } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Sipariş ${id}` };
}

const statusCopy: Record<
  OrderStatus,
  { title: string; body: string; tone: string }
> = {
  pending: {
    title: "Ödeme bekleniyor",
    body: "Cryptomus üzerinden ödemeyi tamamladıysanız onay birkaç saniye sürebilir.",
    tone: "text-accent",
  },
  paid: {
    title: "Ödeme alındı",
    body: "Siparişiniz onaylandı. Kargo hazırlığına geçiyoruz.",
    tone: "text-success",
  },
  shipped: {
    title: "Kargoda",
    body: "Siparişiniz yola çıktı.",
    tone: "text-success",
  },
  delivered: {
    title: "Teslim edildi",
    body: "Siparişiniz teslim edildi. İyi kullanımlar.",
    tone: "text-success",
  },
  cancelled: {
    title: "Sipariş iptal",
    body: "Ödeme iptal edildi veya süresi doldu.",
    tone: "text-danger",
  },
  wrong_amount: {
    title: "Eksik / hatalı tutar",
    body: "Gönderilen tutar fatura ile eşleşmedi.",
    tone: "text-danger",
  },
};

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { t } = await searchParams;

  let email: string | null = null;
  try {
    const jar = await cookies();
    const token = jar.get(CUSTOMER_COOKIE)?.value;
    if (token) {
      const payload = await getPayloadClient();
      const { user } = await payload.auth({
        headers: new Headers({ Authorization: `JWT ${token}` }),
      });
      if (user?.collection === "customers") email = user.email;
    }
  } catch {
    // ignore
  }

  const order = await getOrderIfAllowed(id, { token: t, email });
  if (!order) notFound();

  const copy = statusCopy[order.status];
  const canSeePii = Boolean(t === order.accessToken || email);

  return (
    <div className="animate-fade mx-auto max-w-2xl px-5 py-14 md:px-12 md:py-20">
      <p className="text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
        Sipariş · {order.id}
      </p>

      <div className="noir-card mt-4 border border-line p-6 md:p-8">
        <h1 className={`text-3xl font-bold tracking-tight md:text-4xl ${copy.tone}`}>
          {copy.title}
        </h1>
        <p className="mt-3 text-fg-muted">{copy.body}</p>
        {(order.trackingNumber || order.carrier) && (
          <p className="mt-4 text-sm text-fg-dim">
            {order.carrier ? `${order.carrier}: ` : ""}
            {order.trackingNumber || "—"}
          </p>
        )}
      </div>

      <div className="noir-card mt-6 p-6">
        <p className="text-xs tracking-wider text-fg-dim uppercase">Kalemler</p>
        <ul className="mt-5 space-y-3">
          {order.items.map((item) => (
            <li
              key={`${item.productId}-${item.name}`}
              className="flex justify-between gap-4 text-sm"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="tabular-nums text-accent">
                {formatPrice(item.price * item.quantity, order.currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-between border-t border-line pt-5">
          <span className="text-xs tracking-wider text-fg-dim uppercase">
            Toplam
          </span>
          <span className="text-xl font-semibold tabular-nums text-accent">
            {formatPrice(order.total, order.currency)}
          </span>
        </div>
      </div>

      {canSeePii && (
        <div className="noir-card mt-6 p-6 text-sm text-fg-muted">
          <p>
            <span className="text-fg">Alıcı:</span> {order.customer.name}
          </p>
          <p className="mt-1">
            <span className="text-fg">E-posta:</span> {order.customer.email}
          </p>
          <p className="mt-1">
            <span className="text-fg">Şehir:</span> {order.customer.city}
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        {order.status === "pending" && order.cryptomusPaymentUrl && (
          <a href={order.cryptomusPaymentUrl} className="btn-primary">
            Ödemeye devam et
          </a>
        )}
        <Link href="/urunler" className="btn-ghost">
          Kataloğa dön
        </Link>
      </div>
    </div>
  );
}
