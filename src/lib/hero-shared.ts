/** Client-safe hero types/helpers — no Payload / Node imports. */

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
  imageUrl?: string;
  imageUrlEn?: string;
  imageUrlMobile?: string;
  imageUrlMobileEn?: string;
  mimeType?: string;
  mimeTypeEn?: string;
  mimeTypeMobile?: string;
  mimeTypeMobileEn?: string;
  product?: {
    id: string;
    slug: string;
    price: number;
    currency: string;
  } | null;
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

export function isVideoMedia(
  url?: string | null,
  mimeType?: string | null
): boolean {
  if (mimeType && /^video\//i.test(mimeType)) return true;
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}
