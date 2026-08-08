/**
 * Export all Payload products to Excel-friendly CSV (UTF-8 BOM).
 *
 *   npx tsx scripts/export-products.ts
 *
 * Point at Supabase:
 *   $env:DATABASE_URL="postgresql://...supabase...?sslmode=no-verify"
 *   $env:PAYLOAD_SECRET="..."
 *   $env:NODE_ENV="development"
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { lexicalPlaintext } from "../src/lib/lexical";

type Loc =
  | string
  | { tr?: unknown; en?: unknown }
  | Record<string, unknown>
  | null;

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

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  process.env.NODE_ENV ||= "development";
  process.env.PAYLOAD_DATABASE_PUSH ??= "false";

  const payload = await getPayload({ config });
  const rows: Record<string, string | number | boolean>[] = [];
  const pageSize = 100;
  let page = 1;
  let total = 0;

  for (;;) {
    const result = await payload.find({
      collection: "products",
      depth: 0,
      limit: pageSize,
      page,
      overrideAccess: true,
      locale: "all",
      sort: "brand",
    });
    total = result.totalDocs;

    for (const doc of result.docs) {
      const name = doc.name as Loc;
      const short = doc.shortDescription as Loc;
      const desc = doc.description as Loc;
      rows.push({
        id: doc.id,
        slug: doc.slug ?? "",
        brand: doc.brand ?? "",
        name_tr: pick(name, "tr"),
        name_en: pick(name, "en"),
        short_tr: pick(short, "tr"),
        short_en: pick(short, "en"),
        description_tr: pick(desc, "tr"),
        description_en: pick(desc, "en"),
        price: doc.price ?? "",
        currency: doc.currency ?? "TRY",
        inStock: Boolean(doc.inStock),
        stockQty: doc.stockQty ?? 0,
        imageUrl: doc.imageUrl ?? "",
        sourceUrl: doc.sourceUrl ?? "",
        sourcePriceUah: doc.sourcePriceUah ?? "",
        featuredOnHome: Boolean(doc.featuredOnHome),
        featuredOrder: doc.featuredOrder ?? "",
        createdAt: doc.createdAt ?? "",
        updatedAt: doc.updatedAt ?? "",
      });
    }

    if (page >= result.totalPages) break;
    page += 1;
  }

  const headers = Object.keys(
    rows[0] ?? {
      id: "",
      slug: "",
      brand: "",
      name_tr: "",
      name_en: "",
      short_tr: "",
      short_en: "",
      description_tr: "",
      description_en: "",
      price: "",
      currency: "",
      inStock: "",
      stockQty: "",
      imageUrl: "",
      sourceUrl: "",
      sourcePriceUah: "",
      featuredOnHome: "",
      featuredOrder: "",
      createdAt: "",
      updatedAt: "",
    }
  );

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ];

  const outDir = path.join(process.cwd(), "data");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const outPath = path.join(outDir, `products-export-${stamp}.csv`);
  // BOM so Excel opens Turkish characters correctly
  writeFileSync(outPath, `\uFEFF${lines.join("\n")}`, "utf8");

  console.log(`Exported ${rows.length}/${total} products → ${outPath}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
