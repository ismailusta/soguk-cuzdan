/**
 * Upserts Site Settings global (contact + legal pages) for both locales.
 * Usage: npx tsx scripts/seed-site-settings.ts
 *
 * Also creates the global row if Hostinger admin shows "Not Found"
 * (run after db:push against Supabase).
 */
import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { DEFAULT_SITE_CONTACT } from "../src/lib/site-contact";

const d = DEFAULT_SITE_CONTACT;

async function upsertLocale(
  payload: Awaited<ReturnType<typeof getPayload>>,
  locale: "tr" | "en"
) {
  const L = locale;
  await (
    payload.updateGlobal as (args: {
      slug: string;
      locale?: string;
      data: Record<string, unknown>;
      overrideAccess?: boolean;
    }) => Promise<unknown>
  )({
    slug: "site-settings",
    locale,
    overrideAccess: true,
    data: {
      companyLegalName: d.companyLegalName,
      contactEmail: d.contactEmail,
      contactPhone: d.contactPhone || undefined,
      whatsapp: d.whatsapp || undefined,
      addressLine1: d.addressLine1,
      addressLine2: d.addressLine2 || undefined,
      city: d.city,
      state: d.state,
      postalCode: d.postalCode,
      country: d.country,
      supportHours: d.supportHours[L],
      contactPageTitle: d.contactPageTitle[L],
      contactPageIntro: d.contactPageIntro[L],
      productOrigin: d.productOrigin[L],
      privacyTitle: d.privacy.title[L],
      privacyBody: d.privacy.body[L],
      termsTitle: d.terms.title[L],
      termsBody: d.terms.body[L],
      returnsTitle: d.returns.title[L],
      returnsBody: d.returns.body[L],
      shippingTitle: d.shipping.title[L],
      shippingBody: d.shipping.body[L],
      kvkkTitle: d.kvkk.title[L],
      kvkkBody: d.kvkk.body[L],
    },
  });
}

async function main() {
  process.env.PAYLOAD_DATABASE_PUSH ??= "true";
  const payload = await getPayload({ config });
  await upsertLocale(payload, "tr");
  await upsertLocale(payload, "en");
  console.log("Site settings seeded (TR+EN):", d.companyLegalName);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
