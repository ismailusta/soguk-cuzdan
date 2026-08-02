import { getPayloadClient } from "@/lib/payload";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/money";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const payload = await getPayloadClient();
  // Payload default: konsola yazar (email adapter yoksa)
  await payload.sendEmail({
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

function orderLines(order: Order) {
  return order.items
    .map(
      (i) =>
        `• ${i.name} × ${i.quantity} — ${formatPrice(i.price * i.quantity, order.currency)}`
    )
    .join("\n");
}

export async function sendOrderCreatedEmail(order: Order) {
  const link = `${siteUrl()}/siparis/${order.id}?t=${order.accessToken}`;
  const text = `Siparişiniz alındı: ${order.id}

${orderLines(order)}

Toplam: ${formatPrice(order.total, order.currency)}

Ödeme / durum: ${link}
`;

  await sendMail({
    to: order.customer.email,
    subject: `NOIR sipariş ${order.id}`,
    text,
    html: `<p>Siparişiniz alındı: <strong>${order.id}</strong></p>
<pre>${orderLines(order)}</pre>
<p>Toplam: <strong>${formatPrice(order.total, order.currency)}</strong></p>
<p><a href="${link}">Sipariş durumu</a></p>`,
  });
}

export async function sendOrderPaidEmail(order: Order) {
  const link = `${siteUrl()}/siparis/${order.id}?t=${order.accessToken}`;
  const text = `Ödemeniz alındı: ${order.id}

Toplam: ${formatPrice(order.total, order.currency)}

Durum: ${link}
`;

  await sendMail({
    to: order.customer.email,
    subject: `NOIR ödeme onaylandı — ${order.id}`,
    text,
    html: `<p>Ödemeniz alındı: <strong>${order.id}</strong></p>
<p>Toplam: <strong>${formatPrice(order.total, order.currency)}</strong></p>
<p>Kargo için sizinle iletişime geçeceğiz.</p>
<p><a href="${link}">Sipariş durumu</a></p>`,
  });
}

export async function sendOrderShippedEmail(order: Order) {
  const link = `${siteUrl()}/siparis/${order.id}?t=${order.accessToken}`;
  const track = order.trackingNumber
    ? `Takip: ${order.carrier || "Kargo"} ${order.trackingNumber}`
    : "Takip numarası yakında.";
  await sendMail({
    to: order.customer.email,
    subject: `NOIR kargoda — ${order.id}`,
    text: `Siparişiniz kargoya verildi.\n${track}\n${link}`,
    html: `<p>Siparişiniz kargoya verildi: <strong>${order.id}</strong></p>
<p>${track}</p>
<p><a href="${link}">Sipariş durumu</a></p>`,
  });
}
