import { getPayloadClient } from "@/lib/payload";
import {
  DEFAULT_SITE_CONTACT,
  type SiteContact,
} from "@/lib/site-contact";

export type { SiteContact } from "@/lib/site-contact";
export {
  DEFAULT_SITE_CONTACT,
  formatAddress,
  formatAddressOneLine,
} from "@/lib/site-contact";

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

export async function getSiteSettings(): Promise<SiteContact> {
  try {
    const payload = await getPayloadClient();
    // Global types lag until `payload generate:types` after SiteSettings is added
    const doc = (await (
      payload.findGlobal as (args: {
        slug: string;
        depth?: number;
        overrideAccess?: boolean;
      }) => Promise<Record<string, unknown>>
    )({
      slug: "site-settings",
      depth: 0,
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
      supportHours: str(doc.supportHours, DEFAULT_SITE_CONTACT.supportHours),
      addressLine1: str(doc.addressLine1, DEFAULT_SITE_CONTACT.addressLine1),
      addressLine2: str(doc.addressLine2),
      city: str(doc.city, DEFAULT_SITE_CONTACT.city),
      state: str(doc.state, DEFAULT_SITE_CONTACT.state),
      postalCode: str(doc.postalCode, DEFAULT_SITE_CONTACT.postalCode),
      country: str(doc.country, DEFAULT_SITE_CONTACT.country),
      productOrigin: str(
        doc.productOrigin,
        DEFAULT_SITE_CONTACT.productOrigin
      ),
    };
  } catch {
    return { ...DEFAULT_SITE_CONTACT };
  }
}
