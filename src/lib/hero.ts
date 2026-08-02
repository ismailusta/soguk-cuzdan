import type { HeroBanner as PayloadHeroBanner, Product as PayloadProduct } from "@/payload-types";
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
  title: string;
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
  imageUrl?: string;
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

function pickLocale(
  value: LocalizedString,
  locale: "tr" | "en"
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value[locale] ?? value.tr ?? value.en ?? undefined;
}

function mediaUrl(
  image: PayloadHeroBanner["image"]
): string | undefined {
  if (!image || typeof image === "number") return undefined;
  return (image as MediaLike).url ?? undefined;
}

function resolveProduct(
  rel: PayloadHeroBanner["product"]
): Product | null {
  if (!rel || typeof rel === "number") return null;
  return mapProduct(rel as PayloadProduct);
}

export function mapHeroBanner(doc: PayloadHeroBanner): HeroSlide {
  const product = resolveProduct(doc.product);
  const uploaded = mediaUrl(doc.image);
  const imageUrl =
    uploaded ||
    doc.imageUrl ||
    product?.image ||
    product?.images?.[0] ||
    undefined;

  return {
    id: String(doc.id),
    title: pickLocale(doc.title as LocalizedString, "tr") || "",
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
    product,
    showPrice: doc.showPrice !== false,
    layout: (doc.layout as HeroLayout) || "textLeft",
    titleSize: (doc.titleSize as TitleSize) || "xl",
    subtitleSize: (doc.subtitleSize as SubtitleSize) || "md",
    titleAlign: (doc.titleAlign as TitleAlign) || "left",
    titleUppercase: doc.titleUppercase !== false,
    gradientFrom: doc.gradientFrom || undefined,
    gradientTo: doc.gradientTo || undefined,
    accentGlow: doc.accentGlow !== false,
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
