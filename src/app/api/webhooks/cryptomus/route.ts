import { NextResponse } from "next/server";
import { verifyWebhookSign } from "@/lib/cryptomus";
import { sendOrderPaidEmail } from "@/lib/mail";
import {
  decrementStockForOrder,
  findOrderByCryptomusId,
  mapPaymentStatus,
  updateOrder,
} from "@/lib/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`webhook:${clientIp(request)}`, 120, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const apiKey = process.env.CRYPTOMUS_PAYMENT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key missing" },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as Record<string, unknown>;

    if (!verifyWebhookSign(payload, apiKey)) {
      console.warn("[cryptomus webhook] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const orderIdRaw = payload.order_id;
    const statusRaw = payload.status;

    if (typeof orderIdRaw !== "string" || typeof statusRaw !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const order = await findOrderByCryptomusId(orderIdRaw);
    if (!order) {
      console.warn("[cryptomus webhook] order not found", orderIdRaw);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Tutar doğrulama (Cryptomus amount string olabilir)
    const amountRaw = payload.amount ?? payload.payment_amount;
    if (amountRaw != null) {
      const paid = Number(amountRaw);
      if (Number.isFinite(paid)) {
        const expected = order.total;
        // 1 TRY tolerans (yuvarlama)
        if (Math.abs(paid - expected) > 1) {
          console.warn("[cryptomus webhook] amount mismatch", {
            paid,
            expected,
            order: order.id,
          });
          await updateOrder(order.id, { status: "wrong_amount" });
          return NextResponse.json({ success: true, warning: "amount_mismatch" });
        }
      }
    }

    const mapped = mapPaymentStatus(statusRaw);
    if (!mapped) {
      return NextResponse.json({ success: true });
    }

    // Idempotent: already paid
    if (order.status === "paid" || order.status === "shipped" || order.status === "delivered") {
      if (mapped === "paid") {
        return NextResponse.json({ success: true });
      }
    }

    const updated = await updateOrder(order.id, { status: mapped });

    if (mapped === "paid" && order.status !== "paid") {
      await decrementStockForOrder(order);
      try {
        if (updated) await sendOrderPaidEmail(updated);
      } catch (err) {
        console.error("[cryptomus webhook] email", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cryptomus webhook]", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
