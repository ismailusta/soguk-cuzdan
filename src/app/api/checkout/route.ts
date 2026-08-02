import { NextResponse } from "next/server";
import { createInvoice } from "@/lib/cryptomus";
import { cookies } from "next/headers";
import { CUSTOMER_COOKIE } from "@/lib/customer-auth";
import { sendOrderCreatedEmail } from "@/lib/mail";
import {
  createOrder,
  toCryptomusOrderId,
  updateOrder,
} from "@/lib/orders";
import { getPayloadClient } from "@/lib/payload";
import { getProductById } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rate-limit";

type CheckoutBody = {
  items?: { productId: string; quantity: number }[];
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    note?: string;
  };
};

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`checkout:${clientIp(request)}`, 20, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Çok fazla istek. Biraz bekleyin." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as CheckoutBody;
    const items = body.items;
    const customer = body.customer;

    if (!items?.length) {
      return NextResponse.json({ error: "Sepet boş." }, { status: 400 });
    }

    if (
      !customer?.name?.trim() ||
      !customer?.email?.trim() ||
      !customer?.phone?.trim() ||
      !customer?.address?.trim() ||
      !customer?.city?.trim()
    ) {
      return NextResponse.json(
        { error: "Teslimat bilgileri eksik." },
        { status: 400 }
      );
    }

    let customerId: number | string | null = null;
    try {
      const jar = await cookies();
      const token = jar.get(CUSTOMER_COOKIE)?.value;
      if (token) {
        const payload = await getPayloadClient();
        const { user } = await payload.auth({
          headers: new Headers({ Authorization: `JWT ${token}` }),
        });
        if (user?.collection === "customers") customerId = user.id;
      }
    } catch {
      // guest checkout ok
    }

    const orderItems = [];
    for (const line of items) {
      const product = await getProductById(line.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Ürün bulunamadı: ${line.productId}` },
          { status: 400 }
        );
      }
      const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
      if (!product.inStock || product.stockQty < quantity) {
        return NextResponse.json(
          {
            error: `${product.name} şu an satın alınamıyor.`,
          },
          { status: 400 }
        );
      }
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const currency = "TRY";

    const order = await createOrder({
      items: orderItems,
      total,
      currency,
      customerId,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
        note: customer.note?.trim() || undefined,
      },
    });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;

    const orderUrl = `${siteUrl}/siparis/${order.id}?t=${order.accessToken}`;

    const invoice = await createInvoice({
      amount: total.toFixed(2),
      currency,
      orderId: toCryptomusOrderId(order.id),
      urlReturn: orderUrl,
      urlSuccess: orderUrl,
      urlCallback: `${siteUrl}/api/webhooks/cryptomus`,
    });

    await updateOrder(order.id, {
      cryptomusInvoiceUuid: invoice.uuid,
      cryptomusPaymentUrl: invoice.url,
    });

    try {
      await sendOrderCreatedEmail({
        ...order,
        cryptomusInvoiceUuid: invoice.uuid,
        cryptomusPaymentUrl: invoice.url,
      });
    } catch (err) {
      console.error("[checkout] email", err);
    }

    return NextResponse.json({
      orderId: order.id,
      accessToken: order.accessToken,
      paymentUrl: invoice.url,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Ödeme başlatılamadı.";
    console.error("[checkout]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
