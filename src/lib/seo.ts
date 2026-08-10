import {
  BRAND_DESCRIPTION_TR,
  BRAND_ICON_PATH,
  BRAND_NAME,
  BRAND_TAGLINE_TR,
  siteUrl,
} from "@/lib/brand";
import { lexicalPlaintext } from "@/lib/lexical";
import type { Product } from "@/lib/types";
import type { RichTextValue } from "@/lib/lexical";

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = siteUrl();
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function organizationJsonLd() {
  const site = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: site,
    description: BRAND_DESCRIPTION_TR,
    logo: absoluteUrl(BRAND_ICON_PATH),
    email: "support@kriptostore.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "5830 E 2ND ST, STE 7000 #37465",
      addressLocality: "Casper",
      addressRegion: "WY",
      postalCode: "82609",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@kriptostore.com",
      availableLanguage: ["Turkish", "English"],
    },
  };
}

export function websiteJsonLd() {
  const site = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    alternateName: BRAND_TAGLINE_TR,
    url: site,
    description: BRAND_DESCRIPTION_TR,
    inLanguage: ["tr-TR", "en-US"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site}/urunler?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product) {
  const site = siteUrl();
  const url = `${site}/urun/${product.slug}`;
  const images = [product.image, ...(product.images ?? [])].filter(
    (u): u is string => Boolean(u)
  );

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.shortDescription ||
      lexicalPlaintext(product.description) ||
      `${product.name} — ${product.brand}`,
    sku: product.sku || product.slug,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency || "TRY",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: BRAND_NAME,
      },
    },
  };

  if (images.length) {
    data.image = images.map((u) => absoluteUrl(u));
  }

  return data;
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  const site = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site}${item.path}`,
    })),
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string | RichTextValue }[]
): Record<string, unknown> | null {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text:
          typeof f.answer === "string"
            ? f.answer
            : lexicalPlaintext(f.answer),
      },
    })),
  };
}
