export type ProductReviewPublic = {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  authorName: string;
  verifiedPurchase: boolean;
  source: "user" | "seed";
  locale?: string | null;
  createdAt: string;
};

export type ReviewSummary = {
  average: number;
  count: number;
};

export function summarizeReviews(
  reviews: ProductReviewPublic[]
): ReviewSummary {
  if (!reviews.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((n, r) => n + r.rating, 0);
  return {
    count: reviews.length,
    average: Math.round((sum / reviews.length) * 10) / 10,
  };
}
