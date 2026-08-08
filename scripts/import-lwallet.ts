/**
 * Import lwallet dump into Payload:
 * - download product images into Media (default)
 * - OR --remote-images: store CDN URLs only (good for Hostinger without media disk)
 * - upsert products (cover + gallery)
 *
 * Usage:
 *   npx tsx scripts/import-lwallet.ts
 *   npx tsx scripts/import-lwallet.ts --remote-images
 *   npx tsx scripts/import-lwallet.ts --limit=10
 *   npx tsx scripts/import-lwallet.ts --skip-existing
 *
 * Point at Supabase:
 *   $env:DATABASE_URL="postgresql://...supabase...?sslmode=no-verify"
 *   $env:PAYLOAD_SECRET="..."
 *   $env:NODE_ENV="development"
 */
import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { textToLexical } from "../src/lib/lexical";

const UAH_TO_TRY = Number(process.env.LWALLET_UAH_TRY || 1.15);
const DUMP = path.join(process.cwd(), "data", "lwallet-dump.json");

const BRAND_ACCENT: Record<string, string> = {
  Ledger: "#8a9ba8",
  Trezor: "#00b0a6",
  SafePal: "#4c8dff",
  OneKey: "#44d62c",
  Keystone: "#ff6b35",
  CoolWallet: "#5b8def",
  Blockstream: "#00c49a",
  Coinkite: "#f7931a",
  Coldcard: "#5cbf6a",
  ELLIPAL: "#d4af37",
  SecuX: "#6c8cff",
  BitBox: "#9aa4b2",
  Seedor: "#c9a227",
};

type DumpImage = { id: number; src: string; alt: string; name: string };
type DumpProduct = {
  sourceId: number;
  sku: string;
  slug: string;
  name: string;
  permalink: string;
  shortDescription: string;
  description: string;
  priceUah: number;
  inStock: boolean;
  categories: { slug: string; name: string }[];
  images: DumpImage[];
};

function argFlag(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq >= 0 ? hit.slice(eq + 1) : "true";
}

function stripHtml(html: string): string {
  return String(html || "")
    .replace(/\[\/?vc_[^\]]*\]/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectBrand(name: string): string {
  const n = name.toLowerCase();
  const brands = Object.keys(BRAND_ACCENT);
  for (const b of brands) {
    if (n.includes(b.toLowerCase())) return b;
  }
  if (n.includes("coolbitx") || n.includes("cool wallet")) return "CoolWallet";
  if (n.includes("bitbox")) return "BitBox";
  const first = name.split(/\s+/)[0];
  return first && first.length > 1 ? first : "Kriptostore";
}

function guessMime(url: string): string {
  const u = url.toLowerCase();
  if (u.includes(".png")) return "image/png";
  if (u.includes(".webp")) return "image/webp";
  if (u.includes(".gif")) return "image/gif";
  return "image/jpeg";
}

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}

async function downloadBuffer(url: string): Promise<{
  data: Buffer;
  mimetype: string;
  name: string;
}> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Kriptostore-import/1.0" },
  });
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  const mime =
    res.headers.get("content-type")?.split(";")[0]?.trim() || guessMime(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const base =
    path.basename(new URL(url).pathname).replace(/[^a-zA-Z0-9._-]/g, "") ||
    `img.${extFromMime(mime)}`;
  return { data: buf, mimetype: mime, name: base };
}

async function main() {
  if (!existsSync(DUMP)) {
    console.error("Dump yok. Önce: node scripts/scrape-lwallet.mjs");
    process.exit(1);
  }

  const limit = Number(argFlag("limit") || 0) || 0;
  const skipExisting = argFlag("skip-existing") === "true";
  const remoteImages = argFlag("remote-images") === "true";
  const maxImages = Number(argFlag("max-images") || 8) || 8;

  const dump = JSON.parse(readFileSync(DUMP, "utf-8")) as {
    products: DumpProduct[];
  };
  let products = dump.products || [];
  if (limit > 0) products = products.slice(0, limit);

  console.log(
    `Import mode: ${remoteImages ? "remote CDN URLs" : "download → Media"} · ${products.length} products`
  );

  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const [idx, p] of products.entries()) {
    const slug = p.slug;
    console.log(`\n[${idx + 1}/${products.length}] ${slug}`);

    const existing = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
      locale: "tr",
    });
    const existingId = existing.docs[0]?.id;

    if (existingId && skipExisting) {
      console.log("  skip existing");
      skipped++;
      continue;
    }

    const brand = detectBrand(p.name);
    const priceTry = Math.max(1, Math.round(p.priceUah * UAH_TO_TRY));
    const shortTr =
      stripHtml(p.shortDescription).slice(0, 400) || `${brand} — ${p.name}`;
    const descTr = stripHtml(p.description).slice(0, 4000) || shortTr;

    const imgs = (p.images || []).slice(0, maxImages);
    const remoteSrcs = imgs.map((i) => i.src).filter(Boolean);

    let coverId: number | undefined;
    let gallery: { image: number }[] = [];

    if (!remoteImages) {
      const imageIds: number[] = [];
      for (const [i, img] of imgs.entries()) {
        try {
          await new Promise((r) => setTimeout(r, 250));
          const file = await downloadBuffer(img.src);
          const media = await payload.create({
            collection: "media",
            data: {
              alt: img.alt || `${p.name} ${i + 1}`,
            },
            file: {
              data: file.data,
              mimetype: file.mimetype,
              name: `${slug}-${i + 1}-${file.name}`.slice(0, 120),
              size: file.data.byteLength,
            },
            overrideAccess: true,
          });
          imageIds.push(Number(media.id));
          console.log(`  media #${media.id} ← ${file.name}`);
        } catch (err) {
          console.warn(
            `  image fail ${img.src}:`,
            err instanceof Error ? err.message : err
          );
        }
      }
      coverId = imageIds[0];
      gallery = imageIds.slice(1).map((id) => ({ image: id }));
    } else {
      console.log(`  remote images=${remoteSrcs.length}`);
    }

    const data = {
      slug,
      brand,
      price: priceTry,
      currency: "TRY",
      inStock: true,
      stockQty: 10,
      accent: BRAND_ACCENT[brand] || "#9aa4b2",
      name: p.name,
      shortDescription: shortTr,
      description: textToLexical(descTr),
      features: [],
      sourcePriceUah: p.priceUah,
      sourceUrl: p.permalink,
      image: coverId,
      gallery,
      imageUrl: remoteImages ? remoteSrcs[0] || undefined : undefined,
      images: remoteImages ? remoteSrcs.slice(1) : [],
    };

    if (existingId) {
      await payload.update({
        collection: "products",
        id: existingId,
        locale: "tr",
        data,
        overrideAccess: true,
      });
      updated++;
      console.log(`  updated product #${existingId}`);
    } else {
      const doc = await payload.create({
        collection: "products",
        locale: "tr",
        data,
        overrideAccess: true,
      });
      created++;
      console.log(`  created product #${doc.id}`);
    }
  }

  console.log(
    `\nDone. created=${created} updated=${updated} skipped=${skipped} (UAH→TRY ×${UAH_TO_TRY})`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
