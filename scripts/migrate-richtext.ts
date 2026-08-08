/**
 * Migrate plain-string product/legal rich fields → Lexical JSON.
 *
 *   npx tsx scripts/migrate-richtext.ts
 *
 * Safe to re-run: skips values that already have a Lexical root.
 */
import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";
import {
  isLexicalState,
  normalizeLexical,
  textToLexical,
} from "../src/lib/lexical";
import { stripShortcodeArtifacts } from "../src/lib/sanitizeCopy";

process.env.DATABASE_SSL = process.env.DATABASE_SSL || "true";

function toLexical(value: unknown) {
  if (isLexicalState(value)) return null; // already migrated
  if (typeof value === "string") {
    const cleaned = stripShortcodeArtifacts(value);
    if (!cleaned.trim()) return null;
    return textToLexical(cleaned);
  }
  return normalizeLexical(value);
}

async function migrateProducts(payload: Awaited<ReturnType<typeof getPayload>>) {
  let updated = 0;
  for (const locale of ["tr", "en"] as const) {
    const result = await payload.find({
      collection: "products",
      limit: 2000,
      depth: 0,
      locale,
      overrideAccess: true,
    });

    for (const doc of result.docs) {
      const patch: Record<string, unknown> = {};

      const desc = toLexical(doc.description);
      if (desc) patch.description = desc;

      if (Array.isArray(doc.detailSections)) {
        let changed = false;
        const sections = doc.detailSections.map((s) => {
          const body = toLexical(s?.body);
          if (body) {
            changed = true;
            return { ...s, body };
          }
          return s;
        });
        if (changed) patch.detailSections = sections;
      }

      if (Array.isArray(doc.faqs)) {
        let changed = false;
        const faqs = doc.faqs.map((f) => {
          const answer = toLexical(f?.answer);
          if (answer) {
            changed = true;
            return { ...f, answer };
          }
          return f;
        });
        if (changed) patch.faqs = faqs;
      }

      if (Object.keys(patch).length === 0) continue;

      await payload.update({
        collection: "products",
        id: doc.id,
        data: patch,
        locale,
        overrideAccess: true,
        context: { disableRevalidate: true },
      });
      updated += 1;
      console.log(`product ${doc.id} (${locale}) migrated`);
    }
  }
  return updated;
}

async function migrateSiteSettings(
  payload: Awaited<ReturnType<typeof getPayload>>
) {
  let updated = 0;
  const keys = [
    "privacyBody",
    "termsBody",
    "returnsBody",
    "kvkkBody",
  ] as const;

  for (const locale of ["tr", "en"] as const) {
    const doc = await payload.findGlobal({
      slug: "site-settings",
      locale,
      overrideAccess: true,
    });

    const patch: Record<string, unknown> = {};
    for (const key of keys) {
      const next = toLexical(doc[key]);
      if (next) patch[key] = next;
    }
    if (Object.keys(patch).length === 0) continue;

    await payload.updateGlobal({
      slug: "site-settings",
      data: patch,
      locale,
      overrideAccess: true,
    });
    updated += 1;
    console.log(`site-settings (${locale}) migrated`);
  }
  return updated;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL gerekli");
  }
  const payload = await getPayload({ config });
  const products = await migrateProducts(payload);
  const settings = await migrateSiteSettings(payload);
  console.log(`Done. products=${products} site-settings-locales=${settings}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
