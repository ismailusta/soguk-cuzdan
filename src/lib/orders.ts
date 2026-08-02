import { randomUUID } from "crypto";
import type { Order as PayloadOrder } from "@/payload-types";
import { getPayloadClient } from "@/lib/payload";
import type { Order, OrderStatus } from "@/lib/types";

export function toCryptomusOrderId(orderId: string): string {
  return orderId.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function mapOrder(doc: PayloadOrder): Order {
  const customerRel = doc.customer;
  const customerId =
    typeof customerRel === "object" && customerRel
      ? customerRel.id
      : customerRel ?? null;

  return {
    id: doc.orderNumber,
    accessToken: doc.accessToken,
    status: doc.status as OrderStatus,
    total: doc.total,
    currency: doc.currency,
    customer: {
      name: doc.customerName,
      email: doc.customerEmail,
      phone: doc.customerPhone,
      address: doc.customerAddress,
      city: doc.customerCity,
      note: doc.customerNote ?? undefined,
    },
    customerId,
    trackingNumber: doc.trackingNumber ?? undefined,
    carrier: doc.carrier ?? undefined,
    cryptomusInvoiceUuid: doc.cryptomusInvoiceUuid ?? undefined,
    cryptomusPaymentUrl: doc.cryptomusPaymentUrl ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    items: (doc.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  };
}

async function findByOrderNumber(
  orderNumber: string
): Promise<PayloadOrder | undefined> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: orderNumber } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.docs[0];
}

export async function createOrder(
  data: Omit<Order, "id" | "accessToken" | "status" | "createdAt" | "updatedAt"> & {
    customerId?: number | string | null;
  }
): Promise<Order> {
  const payload = await getPayloadClient();
  const orderNumber = `SC-${randomUUID().slice(0, 8)}`;
  const accessToken = randomUUID().replace(/-/g, "");

  const doc = await payload.create({
    collection: "orders",
    data: {
      orderNumber,
      accessToken,
      status: "pending",
      total: data.total,
      currency: data.currency,
      customer: (() => {
        if (data.customerId == null || data.customerId === "") return undefined;
        const n = Number(data.customerId);
        return Number.isFinite(n) ? n : undefined;
      })(),
      customerName: data.customer.name,
      customerEmail: data.customer.email,
      customerPhone: data.customer.phone,
      customerAddress: data.customer.address,
      customerCity: data.customer.city,
      customerNote: data.customer.note,
      items: data.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    },
    overrideAccess: true,
  });
  return mapOrder(doc);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const doc = await findByOrderNumber(id);
  return doc ? mapOrder(doc) : undefined;
}

export async function getOrderIfAllowed(
  id: string,
  opts: { token?: string | null; email?: string | null }
): Promise<Order | undefined> {
  const order = await getOrder(id);
  if (!order) return undefined;
  if (opts.token && opts.token === order.accessToken) return order;
  if (
    opts.email &&
    opts.email.toLowerCase() === order.customer.email.toLowerCase()
  ) {
    return order;
  }
  return undefined;
}

export async function findOrderByCryptomusId(
  cryptomusOrderId: string
): Promise<Order | undefined> {
  const direct = await findByOrderNumber(cryptomusOrderId);
  if (direct) return mapOrder(direct);

  const sanitized = toCryptomusOrderId(cryptomusOrderId);
  if (sanitized !== cryptomusOrderId) {
    const again = await findByOrderNumber(sanitized);
    if (again) return mapOrder(again);
  }

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "orders",
    limit: 200,
    sort: "-createdAt",
    depth: 0,
    overrideAccess: true,
  });
  const match = result.docs.find(
    (o) =>
      o.orderNumber === cryptomusOrderId ||
      toCryptomusOrderId(o.orderNumber) === cryptomusOrderId
  );
  return match ? mapOrder(match) : undefined;
}

export async function updateOrder(
  id: string,
  patch: Partial<
    Pick<
      Order,
      | "status"
      | "cryptomusInvoiceUuid"
      | "cryptomusPaymentUrl"
      | "trackingNumber"
      | "carrier"
      | "updatedAt"
    >
  >
): Promise<Order | undefined> {
  const existing = await findByOrderNumber(id);
  if (!existing) return undefined;

  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: "orders",
    id: existing.id,
    data: {
      status: patch.status,
      cryptomusInvoiceUuid: patch.cryptomusInvoiceUuid,
      cryptomusPaymentUrl: patch.cryptomusPaymentUrl,
      trackingNumber: patch.trackingNumber,
      carrier: patch.carrier,
    },
    overrideAccess: true,
  });
  return mapOrder(doc);
}

export async function decrementStockForOrder(order: Order): Promise<void> {
  const payload = await getPayloadClient();
  for (const item of order.items) {
    try {
      const product = await payload.findByID({
        collection: "products",
        id: item.productId,
        overrideAccess: true,
      });
      const current = typeof product.stockQty === "number" ? product.stockQty : 0;
      const next = Math.max(0, current - item.quantity);
      await payload.update({
        collection: "products",
        id: item.productId,
        data: {
          stockQty: next,
          inStock: next > 0,
        },
        overrideAccess: true,
      });
    } catch (err) {
      console.error("[stock] decrement failed", item.productId, err);
    }
  }
}

export function mapPaymentStatus(status: string): OrderStatus | null {
  if (status === "paid" || status === "paid_over") return "paid";
  if (status === "cancel" || status === "fail" || status === "system_fail")
    return "cancelled";
  if (status === "wrong_amount" || status === "wrong_amount_waiting")
    return "wrong_amount";
  return null;
}
