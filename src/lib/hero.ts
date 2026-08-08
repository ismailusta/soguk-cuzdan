import type {
  HeroBanner as PayloadHeroBanner,
  Product as PayloadProduct,
} from "@/payload-types";
import { getPayloadClient } from "@/lib/payload";
import { mapProduct } from "@/lib/products";
import type { Product } from "@/lib/types";

export type HeroLayout = "textLeft" | "textRight" | "textOverlay";
export type TitleSize = "sm" | "md" | "lg" | "xl";
export type SubtitleSize = "sm" | "md" | "lg";
export type TitleAlign = "left" | "center";
export type BadgeTone = "accent" | "success" | "danger" | "muted";

export type HeroSlide = {
  id: string;
  title?: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  badge?: string;
  badgeEn?: string;
  badgeTone: BadgeTone;
  ctaLabel?: string;
  ctaLabelEn?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryLabelEn?: string;
  secondaryHref?: string;
  /** Desktop banner TR */
  imageUrl?: string;
  /** Desktop banner EN */
  imageUrlEn?: string;
  /** Mobile banner TR (falls back to desktop) */
  imageUrlMobile?: string;
  /** Mobile banner EN (falls back to desktop EN / TR) */
  imageUrlMobileEn?: string;
  product?: Product | null;
  showPrice: boolean;
  layout: HeroLayout;
  titleSize: TitleSize;
  subtitleSize: SubtitleSize;
  titleAlign: TitleAlign;
  titleUppercase: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  accentGlow: boolean;
};

type MediaLike = { url?: string | null };
type LocalizedString = string | { tr?: string | null; en?: string | null } | null;
type LocalizedUpload =
  | number
  | MediaLike
  | {
      tr?: number | MediaLike | null;
      en?: number | MediaLike | null;
    }
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

function mediaUrl(image: number | MediaLike | null | undefined): string | undefined {
  if (!image || typeof image === "number") return undefined;
  return image.url ?? undefined;
}

function pickLocalizedUpload(
  value: LocalizedUpload,
  locale: "tr" | "en"
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return undefined;
  if ("url" in value || (!("tr" in value) && !("en" in value))) {
    return mediaUrl(value as MediaLike);
  }
  const loc = value as {
    tr?: number | MediaLike | null;
    en?: number | MediaLike | null;
  };
  return (
    mediaUrl(loc[locale] ?? undefined) ||
    mediaUrl(loc.tr ?? undefined) ||
    mediaUrl(loc.en ?? undefined)
  );
}

function firstHttp(
  ...urls: Array<string | null | undefined>
): string | undefined {
  for (const u of urls) {
    if (u && /^https?:\/\//i.test(u)) return u;
  }
  return undefined;
}

function firstAny(
  ...urls: Array<string | null | undefined>
): string | undefined {
  for (const u of urls) {
    if (u) return u;
  }
  return undefined;
}

function resolveSlot(opts: {
  imageUrl?: string;
  uploaded?: string;
  productFallback?: string;
}): string | undefined {
  return (
    firstHttp(opts.imageUrl, opts.productFallback, opts.uploaded) ||
    firstAny(opts.imageUrl, opts.uploaded, opts.productFallback)
  );
}

function resolveProduct(
  rel: PayloadHeroBanner["product"]
): Product | null {
  if (!rel || typeof rel === "number") return null;
  return mapProduct(rel as PayloadProduct);
}

export function mapHeroBanner(doc: PayloadHeroBanner): HeroSlide {
  const product = resolveProduct(doc.product);
  const productImg = product?.image || product?.images?.[0];

  const uploadedTr = pickLocalizedUpload(
    doc.image as LocalizedUpload,
    "tr"
  );
  const uploadedEn = pickLocalizedUpload(
    doc.image as LocalizedUpload,
    "en"
  );
  const uploadedMobileTr = pickLocalizedUpload(
    doc.imageMobile as LocalizedUpload,
    "tr"
  );
  const uploadedMobileEn = pickLocalizedUpload(
    doc.imageMobile as LocalizedUpload,
    "en"
  );

  const urlTr = pickLocale(doc.imageUrl as LocalizedString, "tr");
  const urlEn = pickLocale(doc.imageUrl as LocalizedString, "en");
  const urlMobileTr = pickLocale(doc.imageUrlMobile as LocalizedString, "tr");
  const urlMobileEn = pickLocale(doc.imageUrlMobile as LocalizedString, "en");

  const imageUrl = resolveSlot({
    imageUrl: urlTr,
    uploaded: uploadedTr,
    productFallback: productImg,
  });
  const imageUrlEn =
    resolveSlot({
      imageUrl: urlEn,
      uploaded: uploadedEn,
    }) || imageUrl;

  const imageUrlMobile =
    resolveSlot({
      imageUrl: urlMobileTr,
      uploaded: uploadedMobileTr,
    }) || undefined;
  const imageUrlMobileEn =
    resolveSlot({
      imageUrl: urlMobileEn,
      uploaded: uploadedMobileEn,
    }) || undefined;

  return {
    id: String(doc.id),
    title: pickLocale(doc.title as LocalizedString, "tr") || undefined,
    titleEn: pickLocale(doc.title as LocalizedString, "en"),
    subtitle: pickLocale(doc.subtitle as LocalizedString, "tr"),
    subtitleEn: pickLocale(doc.subtitle as LocalizedString, "en"),
    badge: pickLocale(doc.badge as LocalizedString, "tr"),
    badgeEn: pickLocale(doc.badge as LocalizedString, "en"),
    badgeTone: (doc.badgeTone as BadgeTone) || "success",
    ctaLabel: pickLocale(doc.ctaLabel as LocalizedString, "tr"),
    ctaLabelEn: pickLocale(doc.ctaLabel as LocalizedString, "en"),
    ctaHref: doc.ctaHref || undefined,
    secondaryLabel: pickLocale(doc.secondaryLabel as LocalizedString, "tr"),
    secondaryLabelEn: pickLocale(doc.secondaryLabel as LocalizedString, "en"),
    secondaryHref: doc.secondaryHref || undefined,
    imageUrl,
    imageUrlEn,
    imageUrlMobile,
    imageUrlMobileEn,
    product,
    showPrice: Boolean(doc.showPrice),
    layout: (doc.layout as HeroLayout) || "textOverlay",
    titleSize: (doc.titleSize as TitleSize) || "xl",
    subtitleSize: (doc.subtitleSize as SubtitleSize) || "md",
    titleAlign: (doc.titleAlign as TitleAlign) || "center",
    titleUppercase: doc.titleUppercase !== false,
    gradientFrom: doc.gradientFrom || undefined,
    gradientTo: doc.gradientTo || undefined,
    accentGlow: Boolean(doc.accentGlow),
  };
}

export async function getActiveHeroBanners(): Promise<HeroSlide[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "hero-banners",
    where: { active: { equals: true } },
    sort: "order",
    limit: 20,
    depth: 2,
    overrideAccess: true,
    locale: "all",
  });
  return result.docs.map(mapHeroBanner);
}
