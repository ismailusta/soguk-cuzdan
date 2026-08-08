import { getPayloadClient } from "@/lib/payload";
import {
  DEFAULT_SITE_CONTACT,
  type LegalPageContent,
  type LocalePair,
  type RichLocalePair,
  type SiteContact,
} from "@/lib/site-contact";
import { normalizeLexical, textToLexical, type RichTextValue } from "@/lib/lexical";

export type { SiteContact } from "@/lib/site-contact";
export {
  DEFAULT_SITE_CONTACT,
  bodyParagraphs,
  formatAddress,
  formatAddressOneLine,
  pickLocale,
  pickRichLocale,
} from "@/lib/site-contact";

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function asPair(v: unknown, fallback: LocalePair): LocalePair {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as { tr?: unknown; en?: unknown };
    return {
      tr: str(o.tr, fallback.tr),
      en: str(o.en, fallback.en),
    };
  }
  if (typeof v === "string" && v.trim()) {
    return { tr: v.trim(), en: v.trim() };
  }
  return { ...fallback };
}

function asRich(v: unknown, fallback: RichTextValue): RichTextValue {
  return normalizeLexical(v) || fallback;
}

function asRichPair(v: unknown, fallback: RichLocalePair): RichLocalePair {
  if (v && typeof v === "object" && !Array.isArray(v) && !("root" in v)) {
    const o = v as { tr?: unknown; en?: unknown };
    return {
      tr: asRich(o.tr, fallback.tr),
      en: asRich(o.en, fallback.en),
    };
  }
  if (typeof v === "string" && v.trim()) {
    const lex = textToLexical(v.trim());
    return { tr: lex, en: lex };
  }
  const single = normalizeLexical(v);
  if (single) return { tr: single, en: single };
  return { tr: fallback.tr, en: fallback.en };
}

function asLegal(
  title: unknown,
  body: unknown,
  fallback: LegalPageContent
): LegalPageContent {
  return {
    title: asPair(title, fallback.title),
    body: asRichPair(body, fallback.body),
  };
}

export async function getSiteSettings(): Promise<SiteContact> {
  try {
    const payload = await getPayloadClient();
    const doc = (await (
      payload.findGlobal as (args: {
        slug: string;
        depth?: number;
        locale?: "all" | "tr" | "en";
        overrideAccess?: boolean;
      }) => Promise<Record<string, unknown>>
    )({
      slug: "site-settings",
      depth: 0,
      locale: "all",
      overrideAccess: true,
    })) as Record<string, unknown>;

    return {
      companyLegalName: str(
        doc.companyLegalName,
        DEFAULT_SITE_CONTACT.companyLegalName
      ),
      contactEmail: str(doc.contactEmail, DEFAULT_SITE_CONTACT.contactEmail),
      contactPhone: str(doc.contactPhone),
      whatsapp: str(doc.whatsapp),
      supportHours: asPair(doc.supportHours, DEFAULT_SITE_CONTACT.supportHours),
      contactPageTitle: asPair(
        doc.contactPageTitle,
        DEFAULT_SITE_CONTACT.contactPageTitle
      ),
      contactPageIntro: asPair(
        doc.contactPageIntro,
        DEFAULT_SITE_CONTACT.contactPageIntro
      ),
      addressLine1: str(doc.addressLine1, DEFAULT_SITE_CONTACT.addressLine1),
      addressLine2: str(doc.addressLine2),
      city: str(doc.city, DEFAULT_SITE_CONTACT.city),
      state: str(doc.state, DEFAULT_SITE_CONTACT.state),
      postalCode: str(doc.postalCode, DEFAULT_SITE_CONTACT.postalCode),
      country: str(doc.country, DEFAULT_SITE_CONTACT.country),
      productOrigin: asPair(
        doc.productOrigin,
        DEFAULT_SITE_CONTACT.productOrigin
      ),
      privacy: asLegal(
        doc.privacyTitle,
        doc.privacyBody,
        DEFAULT_SITE_CONTACT.privacy
      ),
      terms: asLegal(doc.termsTitle, doc.termsBody, DEFAULT_SITE_CONTACT.terms),
      returns: asLegal(
        doc.returnsTitle,
        doc.returnsBody,
        DEFAULT_SITE_CONTACT.returns
      ),
      kvkk: asLegal(doc.kvkkTitle, doc.kvkkBody, DEFAULT_SITE_CONTACT.kvkk),
    };
  } catch {
    return structuredClone(DEFAULT_SITE_CONTACT);
  }
}
