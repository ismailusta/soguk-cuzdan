import { getPayloadClient } from "@/lib/payload";
import type { ProductReviewPublic } from "@/lib/reviews-shared";
export type { ProductReviewPublic, ReviewSummary } from "@/lib/reviews-shared";
export { summarizeReviews } from "@/lib/reviews-shared";

const PURCHASED_STATUSES = ["paid", "shipped", "delivered"] as const;

export async function getApprovedReviewsForProduct(
  productId: string | number
): Promise<ProductReviewPublic[]> {
  const payload = await getPayloadClient();
  const numericId = Number(productId);
  if (!Number.isFinite(numericId)) return [];

  const result = await payload.find({
    collection: "product-reviews",
    where: {
      and: [
        { product: { equals: numericId } },
        { status: { equals: "approved" } },
      ],
    },
    sort: "-createdAt",
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });

  return result.docs.map((doc) => ({
    id: String(doc.id),
    rating: Number(doc.rating) || 0,
    title: doc.title ?? null,
    body: String(doc.body || ""),
    authorName: String(doc.authorName || "Müşteri"),
    verifiedPurchase: Boolean(doc.verifiedPurchase),
    source: doc.source === "seed" ? "seed" : "user",
    locale: typeof doc.locale === "string" ? doc.locale : null,
    createdAt: String(doc.createdAt || ""),
  }));
}

/** Customer bought this product in a paid/shipped/delivered order. */
export async function customerPurchasedProduct(
  customer: { id: number | string; email: string },
  productId: string | number
): Promise<boolean> {
  const payload = await getPayloadClient();
  const pid = String(productId);

  const result = await payload.find({
    collection: "orders",
    where: {
      and: [
        {
          or: [
            { customer: { equals: customer.id } },
            { customerEmail: { equals: customer.email } },
          ],
        },
        { status: { in: [...PURCHASED_STATUSES] } },
      ],
    },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  });

  return result.docs.some((order) =>
    (order.items || []).some((item) => String(item.productId) === pid)
  );
}

export async function customerAlreadyReviewed(
  customerId: number | string,
  productId: string | number
): Promise<boolean> {
  const payload = await getPayloadClient();
  const numericId = Number(productId);
  if (!Number.isFinite(numericId)) return false;

  const result = await payload.find({
    collection: "product-reviews",
    where: {
      and: [
        { product: { equals: numericId } },
        { customer: { equals: customerId } },
        { status: { in: ["pending", "approved"] } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  return result.docs.length > 0;
}
