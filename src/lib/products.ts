import type { Product as PayloadProduct } from "@/payload-types";
import { getPayloadClient } from "@/lib/payload";
import {
  cleanFaq,
  cleanSection,
  normalizeRichBody,
  stripShortcodeArtifacts,
} from "@/lib/sanitizeCopy";
import type { Product } from "@/lib/types";
import type { RichTextValue } from "@/lib/lexical";

type MediaLike = {
  url?: string | null;
};

type LocalizedString = string | { tr?: string | null; en?: string | null } | null;
type LocalizedStrings =
  | string[]
  | { tr?: string[] | null; en?: string[] | null }
  | null;
type LocalizedRich =
  | RichTextValue
  | string
  | { tr?: unknown; en?: unknown }
  | null
  | undefined;

function pickLocale(
  value: LocalizedString,
  locale: "tr" | "en"
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value[locale] ?? value.tr ?? value.en ?? undefined;
}

function pickLocaleRich(
  value: LocalizedRich,
  locale: "tr" | "en"
): RichTextValue | null {
  if (value == null) return null;
  if (typeof value === "string" || (typeof value === "object" && "root" in value)) {
    return normalizeRichBody(value);
  }
  const o = value as { tr?: unknown; en?: unknown };
  return (
    normalizeRichBody(o[locale]) ||
    normalizeRichBody(o.tr) ||
    normalizeRichBody(o.en)
  );
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

function mapSections(
  rows: { title?: string | null; body?: unknown }[] | null | undefined
) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((s) =>
      s?.title ? cleanSection({ title: String(s.title), body: s.body }) : null
    )
    .filter((s): s is { title: string; body: RichTextValue } => Boolean(s));
}

function mapFaqs(
  rows: { question?: string | null; answer?: unknown }[] | null | undefined
) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((f) =>
      f?.question
        ? cleanFaq({ question: String(f.question), answer: f.answer })
        : null
    )
    .filter(
      (f): f is { question: string; answer: RichTextValue } => Boolean(f)
    );
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

  const detailRaw = (doc as { detailSections?: unknown }).detailSections;
  const faqsRaw = (doc as { faqs?: unknown }).faqs;

  let detailSections = mapSections(
    Array.isArray(detailRaw)
      ? detailRaw
      : (detailRaw as { tr?: { title?: string; body?: unknown }[] })?.tr
  );
  let detailSectionsEn: Product["detailSectionsEn"];
  if (detailRaw && !Array.isArray(detailRaw) && typeof detailRaw === "object") {
    const en = (detailRaw as { en?: { title?: string; body?: unknown }[] }).en;
    if (Array.isArray(en)) detailSectionsEn = mapSections(en);
  }

  let faqs = mapFaqs(
    Array.isArray(faqsRaw)
      ? faqsRaw
      : (faqsRaw as { tr?: { question?: string; answer?: unknown }[] })?.tr
  );
  let faqsEn: Product["faqsEn"];
  if (faqsRaw && !Array.isArray(faqsRaw) && typeof faqsRaw === "object") {
    const en = (faqsRaw as { en?: { question?: string; answer?: unknown }[] })
      .en;
    if (Array.isArray(en)) faqsEn = mapFaqs(en);
  }

  // When locale=all returns arrays directly for default locale only
  if (Array.isArray(detailRaw) && !detailSectionsEn) {
    detailSections = mapSections(detailRaw);
  }
  if (Array.isArray(faqsRaw) && !faqsEn) {
    faqs = mapFaqs(faqsRaw);
  }

  return {
    id: String(doc.id),
    sku: typeof doc.sku === "string" && doc.sku ? doc.sku : undefined,
    slug: doc.slug,
    name,
    nameEn,
    brand: doc.brand,
    shortDescription: stripShortcodeArtifacts(
      pickLocale(doc.shortDescription as LocalizedString, "tr") || ""
    ),
    shortDescriptionEn: (() => {
      const v = pickLocale(doc.shortDescription as LocalizedString, "en");
      return v ? stripShortcodeArtifacts(v) : undefined;
    })(),
    description: pickLocaleRich(doc.description as LocalizedRich, "tr"),
    descriptionEn: pickLocaleRich(doc.description as LocalizedRich, "en"),
    price: doc.price,
    currency: doc.currency,
    features: pickLocaleList(doc.features as LocalizedStrings, "tr").map(
      stripShortcodeArtifacts
    ),
    featuresEn: pickLocaleList(doc.features as LocalizedStrings, "en").map(
      stripShortcodeArtifacts
    ),
    inStock: Boolean(doc.inStock) && (doc.stockQty ?? 0) > 0,
    stockQty: typeof doc.stockQty === "number" ? doc.stockQty : 0,
    accent: doc.accent || "#9aa4b2",
    image: cover,
    images,
    detailSections,
    detailSectionsEn,
    faqs,
    faqsEn,
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
    name: { tr: tr.name as string, en: (en?.name as string) || undefined },
    shortDescription: {
      tr: tr.shortDescription as string,
      en: (en?.shortDescription as string) || undefined,
    },
    description: {
      tr: tr.description,
      en: en?.description,
    },
    features: {
      tr: (tr.features as string[]) || [],
      en: (en?.features as string[]) || [],
    },
  } as never);

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
