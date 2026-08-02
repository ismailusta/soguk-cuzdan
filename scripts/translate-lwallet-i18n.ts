/**
 * Translate product content UK → TR + EN via Google gtx endpoint.
 *
 * Usage:
 *   npx tsx scripts/translate-lwallet-i18n.ts
 *   npx tsx scripts/translate-lwallet-i18n.ts --limit=5
 *   npx tsx scripts/translate-lwallet-i18n.ts --slug=bitbox02-nova
 */
import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";

const TITLE_MAP: Record<string, { tr: string; en: string }> = {
  "Про пристрій": { tr: "Cihaz hakkında", en: "About the device" },
  "Підтримувані валюти": {
    tr: "Desteklenen varlıklar",
    en: "Supported assets",
  },
  "Що в комплекті?": { tr: "Kutuda ne var?", en: "What's in the box?" },
  "Відеоогляд": { tr: "Video inceleme", en: "Video review" },
  "Огляд пристрою": { tr: "Cihaz incelemesi", en: "Device overview" },
};

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}`));
  if (!hit) return undefined;
  const i = hit.indexOf("=");
  return i >= 0 ? hit.slice(i + 1) : "true";
}

function hasCyrillic(s: string): boolean {
  return /[\u0400-\u04FF]/.test(s || "");
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function gtx(text: string, to: "tr" | "en"): Promise<string> {
  const input = String(text || "").trim();
  if (!input) return "";
  if (!hasCyrillic(input) && to === "tr") return input;

  // Chunk long text
  const chunks: string[] = [];
  let rest = input;
  while (rest.length) {
    chunks.push(rest.slice(0, 1800));
    rest = rest.slice(1800);
  }

  const out: string[] = [];
  for (const chunk of chunks) {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=uk&tl=" +
      to +
      "&dt=t&q=" +
      encodeURIComponent(chunk);
    const res = await fetch(url, {
      headers: { "User-Agent": "Kriptostore-translate/1.0" },
    });
    if (!res.ok) throw new Error(`translate HTTP ${res.status}`);
    const data = (await res.json()) as unknown;
    // [[ ["translated","src",..], ...], ...]
    const parts = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
    const joined = parts
      .map((row: unknown) =>
        Array.isArray(row) && typeof row[0] === "string" ? row[0] : ""
      )
      .join("");
    out.push(joined || chunk);
    await sleep(120);
  }
  return out.join("").trim();
}

async function mapTitle(title: string, to: "tr" | "en"): Promise<string> {
  const hit = TITLE_MAP[title];
  if (hit) return hit[to];
  return gtx(title, to);
}

async function main() {
  const limit = Number(arg("limit") || 0) || 0;
  const onlySlug = arg("slug");

  const payload = await getPayload({ config });

  const where = onlySlug
    ? { slug: { equals: onlySlug } }
    : undefined;

  const result = await payload.find({
    collection: "products",
    where,
    limit: limit > 0 ? limit : 500,
    overrideAccess: true,
    locale: "tr",
    depth: 0,
  });

  let ok = 0;
  let fail = 0;

  for (const [i, doc] of result.docs.entries()) {
    console.log(`\n[${i + 1}/${result.docs.length}] ${doc.slug}`);
    try {
      const shortTr = hasCyrillic(String(doc.shortDescription || ""))
        ? await gtx(String(doc.shortDescription), "tr")
        : String(doc.shortDescription || "");
      const shortEn = await gtx(
        hasCyrillic(String(doc.shortDescription || ""))
          ? String(doc.shortDescription)
          : shortTr,
        "en"
      );

      const descSrc = String(doc.description || "");
      const descTr = hasCyrillic(descSrc) ? await gtx(descSrc, "tr") : descSrc;
      const descEn = await gtx(hasCyrillic(descSrc) ? descSrc : descTr, "en");

      const sections = Array.isArray(doc.detailSections)
        ? doc.detailSections
        : [];
      const sectionsTr = [];
      const sectionsEn = [];
      for (const s of sections) {
        if (!s?.title || !s?.body) continue;
        const titleTr = await mapTitle(String(s.title), "tr");
        const bodyTr = hasCyrillic(String(s.body))
          ? await gtx(String(s.body), "tr")
          : String(s.body);
        const titleEn = await mapTitle(String(s.title), "en");
        const bodyEn = await gtx(
          hasCyrillic(String(s.body)) ? String(s.body) : bodyTr,
          "en"
        );
        sectionsTr.push({ title: titleTr, body: bodyTr });
        sectionsEn.push({ title: titleEn, body: bodyEn });
      }

      const faqs = Array.isArray(doc.faqs) ? doc.faqs : [];
      const faqsTr = [];
      const faqsEn = [];
      for (const f of faqs) {
        if (!f?.question || !f?.answer) continue;
        const qTr = hasCyrillic(String(f.question))
          ? await gtx(String(f.question), "tr")
          : String(f.question);
        const aTr = hasCyrillic(String(f.answer))
          ? await gtx(String(f.answer), "tr")
          : String(f.answer);
        const qEn = await gtx(
          hasCyrillic(String(f.question)) ? String(f.question) : qTr,
          "en"
        );
        const aEn = await gtx(
          hasCyrillic(String(f.answer)) ? String(f.answer) : aTr,
          "en"
        );
        faqsTr.push({ question: qTr, answer: aTr });
        faqsEn.push({ question: qEn, answer: aEn });
      }

      const features = Array.isArray(doc.features) ? doc.features : [];
      const featuresTr = [];
      const featuresEn = [];
      for (const feat of features) {
        const f = String(feat || "");
        if (!f) continue;
        const tr = hasCyrillic(f) ? await gtx(f, "tr") : f;
        const en = await gtx(hasCyrillic(f) ? f : tr, "en");
        featuresTr.push(tr);
        featuresEn.push(en);
      }

      await payload.update({
        collection: "products",
        id: doc.id,
        locale: "tr",
        data: {
          shortDescription: shortTr,
          description: descTr,
          detailSections: sectionsTr,
          faqs: faqsTr,
          features: featuresTr,
        },
        overrideAccess: true,
      });

      await payload.update({
        collection: "products",
        id: doc.id,
        locale: "en",
        data: {
          shortDescription: shortEn,
          description: descEn,
          detailSections: sectionsEn,
          faqs: faqsEn,
          features: featuresEn,
          name: doc.name, // keep product name
        },
        overrideAccess: true,
      });

      ok++;
      console.log(
        `  ok sections=${sectionsTr.length} faqs=${faqsTr.length}`
      );
    } catch (err) {
      fail++;
      console.error("  fail", err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nDone. ok=${ok} fail=${fail}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
