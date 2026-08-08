/**
 * Polish ALL product copy: fix broken EN, thin TR templates, leftover Cyrillic.
 *
 * Dry-run:
 *   $env:DATABASE_URL="postgresql://...supabase...?sslmode=no-verify"
 *   $env:PAYLOAD_SECRET="..."
 *   $env:NODE_ENV="development"
 *   npx tsx scripts/polish-product-copy.ts
 *
 * Apply:
 *   $env:APPLY=1; npx tsx scripts/polish-product-copy.ts
 *   npx tsx scripts/polish-product-copy.ts --limit=20
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { lexicalPlaintext, textToLexical } from "../src/lib/lexical";

type Loc = { tr?: unknown; en?: unknown } | string | null | Record<string, unknown>;

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}`));
  if (!hit) return undefined;
  const i = hit.indexOf("=");
  return i >= 0 ? hit.slice(i + 1) : "true";
}

function pick(v: Loc, locale: "tr" | "en"): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && "root" in v) {
    return lexicalPlaintext(v);
  }
  const o = v as { tr?: unknown; en?: unknown };
  const raw = o[locale] ?? o.tr ?? o.en;
  if (typeof raw === "string") return raw;
  return lexicalPlaintext(raw) || "";
}

function hasCyrillic(s: string): boolean {
  return /[\u0400-\u04FF]/.test(s || "");
}

function looksBrokenEn(s: string): boolean {
  if (!s.trim()) return true;
  return /soq |ile krypto|yıldız|yıldık|yıldı|ក្រា|соку|akşehir|aleksura|çalik|çalık|soğu |soğuk yıld|Cryptomus ile krypto|wallet \/ aksesuar|\/ aksesuar\.|ödeme Cryptomus/i.test(
    s
  );
}

function looksThinTr(s: string): boolean {
  if (!s.trim()) return true;
  return /soğuk cüzdan\s*\/\s*aksesuar|Türkiye teslimatı,\s*ödeme Cryptomus/i.test(
    s
  );
}

function hasRichBody(s: string): boolean {
  return /Cihaz hakkında|About the device|Kutuda ne var|What's in the box|Desteklenen/i.test(
    s
  );
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function gtx(text: string, from: string, to: string): Promise<string> {
  const input = String(text || "").trim();
  if (!input) return "";
  const chunks: string[] = [];
  let rest = input;
  while (rest.length) {
    chunks.push(rest.slice(0, 1600));
    rest = rest.slice(1600);
  }
  const out: string[] = [];
  for (const chunk of chunks) {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
      from +
      "&tl=" +
      to +
      "&dt=t&q=" +
      encodeURIComponent(chunk);
    const res = await fetch(url, {
      headers: { "User-Agent": "Kriptostore-polish/1.0" },
    });
    if (!res.ok) throw new Error(`translate HTTP ${res.status}`);
    const data = (await res.json()) as unknown;
    const parts = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
    const joined = parts
      .map((row: unknown) =>
        Array.isArray(row) && typeof row[0] === "string" ? row[0] : ""
      )
      .join("");
    out.push(joined || chunk);
    await sleep(80);
  }
  return out.join("").trim();
}

function shortTrTemplate(name: string, brand: string): string {
  return `${name} — ${brand} donanım / aksesuar. Türkiye'de teslimat, Cryptomus ile kripto ödeme.`;
}

function shortEnTemplate(name: string, brand: string): string {
  return `${name} — ${brand} hardware / accessory. Ships in Turkey. Pay with crypto via Cryptomus.`;
}

function descTrTemplate(name: string, brand: string): string {
  return `${name} (${brand}). Orijinal ürün. Türkiye teslimatı. Ödeme Cryptomus ile kripto üzerinden.`;
}

function descEnTemplate(name: string, brand: string): string {
  return `${name} (${brand}). Genuine product. Ships in Turkey. Pay with crypto via Cryptomus.`;
}

async function main() {
  process.env.NODE_ENV ||= "development";
  process.env.PAYLOAD_DATABASE_PUSH ??= "false";
  const apply = process.env.APPLY === "1" || process.argv.includes("--apply");
  const limit = Number(arg("limit") || 0) || 0;

  if (/localhost|127\.0\.0\.1/i.test(process.env.DATABASE_URL || "")) {
    throw new Error("Supabase DATABASE_URL kullan (localhost değil).");
  }

  const payload = await getPayload({ config });
  const pageSize = 100;
  let page = 1;
  const docs: Array<{
    id: number;
    slug: string;
    brand: string;
    nameTr: string;
    nameEn: string;
    shortTr: string;
    shortEn: string;
    descTr: string;
    descEn: string;
  }> = [];

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
      docs.push({
        id: Number(doc.id),
        slug: String(doc.slug || ""),
        brand: String(doc.brand || ""),
        nameTr: pick(doc.name as Loc, "tr"),
        nameEn: pick(doc.name as Loc, "en"),
        shortTr: pick(doc.shortDescription as Loc, "tr"),
        shortEn: pick(doc.shortDescription as Loc, "en"),
        descTr: pick(doc.description as Loc, "tr"),
        descEn: pick(doc.description as Loc, "en"),
      });
    }
    if (page >= result.totalPages) break;
    page++;
  }

  console.log("Loaded", docs.length);
  const targets = limit > 0 ? docs.slice(0, limit) : docs;

  type Change = {
    id: number;
    slug: string;
    fields: string[];
    nameEn?: string;
    shortTr?: string;
    shortEn?: string;
    descTr?: string;
    descEn?: string;
  };
  const changes: Change[] = [];
  let skipped = 0;

  for (const doc of targets) {
    const fields: string[] = [];
    const nameEn = doc.nameEn;
    const shortTr = doc.shortTr;
    const shortEn = doc.shortEn;
    const descTr = doc.descTr;
    const descEn = doc.descEn;

    const nameBroken =
      !nameEn.trim() ||
      nameEn === doc.nameTr ||
      hasCyrillic(nameEn) ||
      looksBrokenEn(nameEn);
    const shortTrBroken = looksThinTr(shortTr) || hasCyrillic(shortTr);
    const shortEnBroken = looksBrokenEn(shortEn) || hasCyrillic(shortEn);
    const descTrBroken =
      hasCyrillic(descTr) || (looksThinTr(descTr) && !hasRichBody(descTr));
    const descEnBroken =
      !descEn.trim() ||
      looksBrokenEn(descEn) ||
      hasCyrillic(descEn) ||
      descEn === descTr;

    if (
      !nameBroken &&
      !shortTrBroken &&
      !shortEnBroken &&
      !descTrBroken &&
      !descEnBroken
    ) {
      skipped++;
      continue;
    }

    if (nameBroken) fields.push("name_en");
    if (shortTrBroken) fields.push("short_tr");
    if (shortEnBroken || shortTrBroken) fields.push("short_en");
    if (descTrBroken) fields.push("desc_tr");
    if (descEnBroken || descTrBroken) fields.push("desc_en");

    changes.push({
      id: doc.id,
      slug: doc.slug,
      fields: [...new Set(fields)],
    });
  }

  // Counts by field
  const fieldCounts: Record<string, number> = {};
  for (const c of changes) {
    for (const f of c.fields) fieldCounts[f] = (fieldCounts[f] || 0) + 1;
  }
  console.log("Field counts:", fieldCounts);

  const out = path.join("data", "products-polish-plan.json");
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        apply,
        total: docs.length,
        scanned: targets.length,
        changeCount: changes.length,
        skipped,
        sample: changes.slice(0, 15),
        ids: changes.map((c) => c.id),
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(
    `\nPlan: ${changes.length} update, ${skipped} skip → ${out}`
  );

  if (!apply) {
    console.log(
      "Dry-run (no translate yet). Apply: $env:APPLY=1; npx tsx scripts/polish-product-copy.ts"
    );
    return;
  }

  let ok = 0;
  for (const [i, c] of changes.entries()) {
    const doc = docs.find((d) => d.id === c.id);
    if (!doc) continue;
    process.stdout.write(
      `\rApply [${i + 1}/${changes.length}] #${c.id} ${c.slug.slice(0, 36)}   `
    );
    try {
      let nameEn = doc.nameEn;
      let shortTr = doc.shortTr;
      let shortEn = doc.shortEn;
      let descTr = doc.descTr;
      let descEn = doc.descEn;

      if (c.fields.includes("name_en") && doc.nameTr) {
        nameEn = await gtx(doc.nameTr, "tr", "en");
      }
      if (c.fields.includes("short_tr")) {
        shortTr = shortTrTemplate(doc.nameTr || doc.slug, doc.brand || "Ürün");
      }
      if (c.fields.includes("short_en")) {
        if (shortTr && !looksThinTr(shortTr) && !hasCyrillic(shortTr)) {
          shortEn = await gtx(shortTr, "tr", "en");
        } else {
          shortEn = shortEnTemplate(
            nameEn || doc.nameTr || doc.slug,
            doc.brand || "Product"
          );
        }
      }
      if (c.fields.includes("desc_tr")) {
        if (hasCyrillic(doc.descTr)) {
          descTr = await gtx(doc.descTr, "uk", "tr");
        } else if (!hasRichBody(doc.descTr)) {
          descTr = descTrTemplate(doc.nameTr || doc.slug, doc.brand || "Ürün");
        } else {
          descTr = doc.descTr;
        }
      }
      if (c.fields.includes("desc_en")) {
        const src = c.fields.includes("desc_tr") ? descTr : doc.descTr;
        if (hasRichBody(src) || (src && !looksThinTr(src))) {
          descEn = await gtx(src, hasCyrillic(src) ? "uk" : "tr", "en");
        } else {
          descEn = descEnTemplate(
            nameEn || doc.nameTr || doc.slug,
            doc.brand || "Product"
          );
        }
      }

      const trData: Record<string, unknown> = {};
      if (c.fields.includes("short_tr")) trData.shortDescription = shortTr;
      if (c.fields.includes("desc_tr"))
        trData.description = textToLexical(descTr);
      if (Object.keys(trData).length) {
        await payload.update({
          collection: "products",
          id: c.id,
          data: trData,
          overrideAccess: true,
          locale: "tr",
        });
      }

      const enData: Record<string, unknown> = {};
      if (c.fields.includes("name_en")) enData.name = nameEn;
      if (c.fields.includes("short_en")) enData.shortDescription = shortEn;
      if (c.fields.includes("desc_en"))
        enData.description = textToLexical(descEn);
      if (Object.keys(enData).length) {
        await payload.update({
          collection: "products",
          id: c.id,
          data: enData,
          overrideAccess: true,
          locale: "en",
        });
      }
      ok++;
    } catch (e) {
      console.error("\nUpdate fail", c.id, e);
    }
  }
  console.log(`\nDone. Updated ${ok}/${changes.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
