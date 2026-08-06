/**
 * Upserts Site Settings global with LLC defaults.
 * Usage: npx tsx scripts/seed-site-settings.ts
 */
import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { DEFAULT_SITE_CONTACT } from "../src/lib/site-contact";

async function main() {
  const payload = await getPayload({ config });
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      companyLegalName: DEFAULT_SITE_CONTACT.companyLegalName,
      contactEmail: DEFAULT_SITE_CONTACT.contactEmail,
      contactPhone: DEFAULT_SITE_CONTACT.contactPhone || undefined,
      whatsapp: DEFAULT_SITE_CONTACT.whatsapp || undefined,
      supportHours: DEFAULT_SITE_CONTACT.supportHours,
      addressLine1: DEFAULT_SITE_CONTACT.addressLine1,
      addressLine2: DEFAULT_SITE_CONTACT.addressLine2 || undefined,
      city: DEFAULT_SITE_CONTACT.city,
      state: DEFAULT_SITE_CONTACT.state,
      postalCode: DEFAULT_SITE_CONTACT.postalCode,
      country: DEFAULT_SITE_CONTACT.country,
      productOrigin: DEFAULT_SITE_CONTACT.productOrigin,
    },
    overrideAccess: true,
  });
  console.log("Site settings seeded:", DEFAULT_SITE_CONTACT.companyLegalName);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
