import type { Product as PayloadProduct } from "@/payload-types";
import { getPayloadClient } from "@/lib/payload";
import type { Product } from "@/lib/types";

type MediaLike = {
  url?: string | null;
};

type LocalizedString = string | { tr?: string | null; en?: string | null } | null;
type LocalizedStrings =
  | string[]
  | { tr?: string[] | null; en?: string[] | null }
  | null;

function pickLocale(
  value: LocalizedString,
  locale: "tr" | "en"
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value[locale] ?? value.tr ?? value.en ?? undefined;
}

function pickLocaleList(
  value: LocalizedStrings,
  locale: "tr" | "en"
): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value[locale] ?? value.tr ?? value.en ?? [];
}

function mediaUrl(image: PayloadProduct["image"]): string | undefined {
  if (!image || typeof image === "number") return undefined;
  return (image as MediaLike).url ?? undefined;
}

export function mapProduct(doc: PayloadProduct): Product {
  const name = pickLocale(doc.name as LocalizedString, "tr") || "";
  const nameEn = pickLocale(doc.name as LocalizedString, "en");

  return {
    id: String(doc.id),
    slug: doc.slug,
    name,
    nameEn,
    brand: doc.brand,
    shortDescription:
      pickLocale(doc.shortDescription as LocalizedString, "tr") || "",
    shortDescriptionEn: pickLocale(
      doc.shortDescription as LocalizedString,
      "en"
    ),
    description: pickLocale(doc.description as LocalizedString, "tr") || "",
    descriptionEn: pickLocale(doc.description as LocalizedString, "en"),
    price: doc.price,
    currency: doc.currency,
    features: pickLocaleList(doc.features as LocalizedStrings, "tr"),
    featuresEn: pickLocaleList(doc.features as LocalizedStrings, "en"),
    inStock: Boolean(doc.inStock) && (doc.stockQty ?? 0) > 0,
    stockQty: typeof doc.stockQty === "number" ? doc.stockQty : 0,
    accent: doc.accent || "#9aa4b2",
    image: mediaUrl(doc.image) || doc.imageUrl || undefined,
    images: doc.images ?? [],
    sourcePriceUah: doc.sourcePriceUah ?? null,
    sourceUrl: doc.sourceUrl ?? null,
    featuredOnHome: Boolean(doc.featuredOnHome),
    featuredOrder: doc.featuredOrder ?? 0,
  };
}

const productQuery = {
  collection: "products" as const,
  depth: 1,
  overrideAccess: true,
  locale: "all" as const,
};

export async function getProducts(): Promise<Product[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    ...productQuery,
    limit: 1000,
    sort: "name",
  });
  return result.docs.map(mapProduct);
}

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    ...productQuery,
    where: { featuredOnHome: { equals: true } },
    sort: "featuredOrder",
    limit,
  });
  return result.docs.map(mapProduct);
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    ...productQuery,
    where: { slug: { equals: slug } },
    limit: 1,
  });
  const doc = result.docs[0];
  return doc ? mapProduct(doc) : undefined;
}

export async function getProductById(
  id: string
): Promise<Product | undefined> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({
      ...productQuery,
      id,
    });
    return mapProduct(doc);
  } catch {
    return undefined;
  }
}

export async function getBrands(): Promise<string[]> {
  const products = await getProducts();
  return [...new Set(products.map((p) => p.brand))].sort();
}

export { formatPrice } from "@/lib/money";
