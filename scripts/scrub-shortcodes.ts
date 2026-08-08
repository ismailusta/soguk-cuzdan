/**
 * Scrub title=/tab_id= shortcode crumbs from product descriptions,
 * detailSections, and FAQs (TR + EN).
 *
 * Dry-run:
 *   npx tsx scripts/scrub-shortcodes.ts
 * Apply:
 *   $env:APPLY=1; npx tsx scripts/scrub-shortcodes.ts
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { stripShortcodeArtifacts } from "../src/lib/sanitizeCopy";

function needsClean(s: string): boolean {
  return /title\s*=|tab_id\s*=|\[\/?vc_/i.test(s || "");
}

async function main() {
  process.env.NODE_ENV ||= "development";
  process.env.PAYLOAD_DATABASE_PUSH ??= "false";
  const apply = process.env.APPLY === "1" || process.argv.includes("--apply");

  if (/localhost|127\.0\.0\.1/i.test(process.env.DATABASE_URL || "")) {
    throw new Error("Supabase DATABASE_URL kullan.");
  }

  const payload = await getPayload({ config });
  const pageSize = 50;
  let page = 1;
  const changes: Array<{ id: number; slug: string; locales: string[] }> = [];

  for (;;) {
    const result = await payload.find({
      collection: "products",
      depth: 0,
      limit: pageSize,
      page,
      overrideAccess: true,
      locale: "all",
    });

    for (const doc of result.docs) {
      const id = Number(doc.id);
      const slug = String(doc.slug || "");
      const touched: string[] = [];

      for (const locale of ["tr", "en"] as const) {
        const one = await payload.findByID({
          collection: "products",
          id,
          locale,
          depth: 0,
          overrideAccess: true,
        });

        const desc = String(one.description || "");
        const sections = Array.isArray(one.detailSections)
          ? one.detailSections
          : [];
        const faqs = Array.isArray(one.faqs) ? one.faqs : [];

        const dirtyDesc = needsClean(desc);
        const dirtySections = sections.some(
          (s) =>
            needsClean(String(s?.title || "")) ||
            needsClean(String(s?.body || ""))
        );
        const dirtyFaqs = faqs.some(
          (f) =>
            needsClean(String(f?.question || "")) ||
            needsClean(String(f?.answer || ""))
        );

        if (!dirtyDesc && !dirtySections && !dirtyFaqs) continue;

        touched.push(locale);
        if (!apply) continue;

        const data: Record<string, unknown> = {};
        if (dirtyDesc) {
          const cleaned = stripShortcodeArtifacts(desc);
          data.description =
            cleaned || `${String(one.name || slug)} — ürün açıklaması.`;
        }
        if (dirtySections) {
          data.detailSections = sections
            .map((s) => ({
              title: stripShortcodeArtifacts(String(s?.title || "")),
              body: stripShortcodeArtifacts(String(s?.body || "")),
            }))
            .filter((s) => s.title.trim() && s.body.trim().length >= 5);
        }
        if (dirtyFaqs) {
          data.faqs = faqs
            .map((f) => ({
              question: stripShortcodeArtifacts(String(f?.question || "")),
              answer: stripShortcodeArtifacts(String(f?.answer || "")),
            }))
            .filter((f) => f.question.trim() && f.answer.trim().length >= 5);
        }

        try {
          await payload.update({
            collection: "products",
            id,
            data,
            locale,
            overrideAccess: true,
          });
        } catch (e) {
          console.error(`Update fail #${id} ${locale}`, e);
        }
      }

      if (touched.length) {
        changes.push({ id, slug, locales: touched });
        if (apply) {
          console.log(`Cleaned #${id} ${slug} [${touched.join(",")}]`);
        }
      }
    }

    if (page >= result.totalPages) break;
    page++;
  }

  const out = path.join("data", "products-shortcode-scrub.json");
  fs.writeFileSync(
    out,
    JSON.stringify({ apply, count: changes.length, changes }, null, 2),
    "utf8"
  );
  console.log(
    `${apply ? "Applied" : "Dry-run"}: ${changes.length} products → ${out}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
