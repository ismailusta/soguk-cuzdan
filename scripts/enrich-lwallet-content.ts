/**
 * Re-parse lwallet dump → update Payload shortDescription, description,
 * detailSections, faqs, features (cleans smashed VC HTML).
 *
 * Usage: npx tsx scripts/enrich-lwallet-content.ts
 */
import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { textToLexical } from "../src/lib/lexical";

const DUMP = path.join(process.cwd(), "data", "lwallet-dump.json");

function argLimit() {
  const hit = process.argv.find((a) => a.startsWith("--limit="));
  return hit ? Number(hit.split("=")[1]) || 0 : 0;
}

async function main() {
  const mod = await import(
    pathToFileURL(
      path.join(process.cwd(), "scripts/lib/lwallet-content.mjs")
    ).href
  );
  const {
    extractShort,
    parseVcContent,
    stripTags,
    buildFeaturesFromSections,
  } = mod;

  if (!existsSync(DUMP)) {
    console.error("Dump yok: npm run lwallet:scrape");
    process.exit(1);
  }

  const dump = JSON.parse(readFileSync(DUMP, "utf-8"));
  let list = dump.products || [];
  const limit = argLimit();
  if (limit > 0) list = list.slice(0, limit);

  const payload = await getPayload({ config });
  let updated = 0;
  let missing = 0;

  for (const [i, p] of list.entries()) {
    const found = await payload.find({
      collection: "products",
      where: { slug: { equals: p.slug } },
      limit: 1,
      overrideAccess: true,
      locale: "tr",
    });
    const doc = found.docs[0];
    if (!doc) {
      missing++;
      continue;
    }

    const { sections, faqs } = parseVcContent(p.description);
    const shortDescription = extractShort(p.shortDescription, p.name);
    const description =
      sections
        .map((s: { title: string; body: string }) => `${s.title}\n${s.body}`)
        .join("\n\n")
        .slice(0, 8000) ||
      stripTags(p.description).slice(0, 4000) ||
      shortDescription;

    const features = buildFeaturesFromSections(sections);

    await payload.update({
      collection: "products",
      id: doc.id,
      locale: "tr",
      data: {
        shortDescription,
        description: textToLexical(description),
        features,
        detailSections: sections.map(
          (s: { title: string; body: string }) => ({
            title: s.title,
            body: textToLexical(s.body),
          })
        ),
        faqs: faqs.map((f: { question: string; answer: string }) => ({
          question: f.question,
          answer: textToLexical(f.answer),
        })),
      },
      overrideAccess: true,
    });

    updated++;
    if ((i + 1) % 25 === 0 || i === 0) {
      console.log(
        `[${i + 1}/${list.length}] ${p.slug} sections=${sections.length} faqs=${faqs.length}`
      );
    }
  }

  console.log(`Done. updated=${updated} missing=${missing}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
