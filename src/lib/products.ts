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

function galleryUrls(doc: PayloadProduct): string[] {
  const gallery = doc.gallery;
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((row) => {
      const img = row?.image;
      if (!img || typeof img === "number") return undefined;
      return (img as MediaLike).url ?? undefined;
    })
    .filter((u): u is string => Boolean(u));
}

export function mapProduct(doc: PayloadProduct): Product {
  const name = pickLocale(doc.name as LocalizedString, "tr") || "";
  const nameEn = pickLocale(doc.name as LocalizedString, "en");
  const uploaded = mediaUrl(doc.image);
  // Prefer remote CDN URLs when local media files are missing (Hostinger)
  const cover =
    (doc.imageUrl && /^https?:\/\//i.test(doc.imageUrl)
      ? doc.imageUrl
      : undefined) ||
    (uploaded && /^https?:\/\//i.test(uploaded) ? uploaded : undefined) ||
    doc.imageUrl ||
    uploaded ||
    undefined;
  const fromGallery = galleryUrls(doc);
  const fromUrls = doc.images ?? [];
  const images = [...fromGallery, ...fromUrls].filter(
    (u, i, arr) => u && u !== cover && arr.indexOf(u) === i
  ) as string[];

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
    image: cover,
    images,
    detailSections: Array.isArray(doc.detailSections)
      ? doc.detailSections
          .filter((s) => s?.title && s?.body)
          .map((s) => ({ title: String(s.title), body: String(s.body) }))
      : [],
    detailSectionsEn: (() => {
      const raw = (doc as { detailSections?: unknown }).detailSections;
      // when locale=all, localized arrays may be { tr, en }
      if (raw && !Array.isArray(raw) && typeof raw === "object") {
        const en = (raw as { en?: { title?: string; body?: string }[] }).en;
        if (Array.isArray(en)) {
          return en
            .filter((s) => s?.title && s?.body)
            .map((s) => ({ title: String(s.title), body: String(s.body) }));
        }
      }
      return undefined;
    })(),
    faqs: Array.isArray(doc.faqs)
      ? doc.faqs
          .filter((f) => f?.question && f?.answer)
          .map((f) => ({
            question: String(f.question),
            answer: String(f.answer),
          }))
      : [],
    faqsEn: (() => {
      const raw = (doc as { faqs?: unknown }).faqs;
      if (raw && !Array.isArray(raw) && typeof raw === "object") {
        const en = (raw as { en?: { question?: string; answer?: string }[] })
          .en;
        if (Array.isArray(en)) {
          return en
            .filter((f) => f?.question && f?.answer)
            .map((f) => ({
              question: String(f.question),
              answer: String(f.answer),
            }));
        }
      }
      return undefined;
    })(),
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
  const [trRes, enRes] = await Promise.all([
    payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
      locale: "tr",
    }),
    payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
      locale: "en",
    }),
  ]);

  const tr = trRes.docs[0];
  if (!tr) return undefined;
  const en = enRes.docs[0];

  const product = mapProduct({
    ...tr,
    // keep localized name/desc shape for pickLocale in mapProduct
    name: { tr: tr.name as string, en: (en?.name as string) || undefined },
    shortDescription: {
      tr: tr.shortDescription as string,
      en: (en?.shortDescription as string) || undefined,
    },
    description: {
      tr: tr.description as string,
      en: (en?.description as string) || undefined,
    },
    features: {
      tr: (tr.features as string[]) || [],
      en: (en?.features as string[]) || [],
    },
  } as never);

  const mapSections = (
    rows: { title?: string | null; body?: string | null }[] | null | undefined
  ) =>
    Array.isArray(rows)
      ? rows
          .filter((s) => s?.title && s?.body)
          .map((s) => ({ title: String(s.title), body: String(s.body) }))
      : [];

  const mapFaqs = (
    rows:
      | { question?: string | null; answer?: string | null }[]
      | null
      | undefined
  ) =>
    Array.isArray(rows)
      ? rows
          .filter((f) => f?.question && f?.answer)
          .map((f) => ({
            question: String(f.question),
            answer: String(f.answer),
          }))
      : [];

  product.detailSections = mapSections(tr.detailSections);
  product.detailSectionsEn = mapSections(en?.detailSections);
  product.faqs = mapFaqs(tr.faqs);
  product.faqsEn = mapFaqs(en?.faqs);

  return product;
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

export async function getRelatedProducts(
  brand: string,
  excludeId: string,
  limit = 8
): Promise<Product[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    ...productQuery,
    where: {
      and: [
        { brand: { equals: brand } },
        { id: { not_equals: excludeId } },
      ],
    },
    limit,
    sort: "-updatedAt",
  });
  return result.docs.map(mapProduct);
}

export { formatPrice } from "@/lib/money";
