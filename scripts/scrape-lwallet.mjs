/**
 * Fetch all products from lwallet.com.ua WooCommerce Store API → data/lwallet-dump.json
 *
 * Usage: node scripts/scrape-lwallet.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "data");
const outFile = join(outDir, "lwallet-dump.json");

const BASE = "https://lwallet.com.ua/wp-json/wc/store/v1/products";
const PER_PAGE = 50;

async function fetchPage(page) {
  const url = `${BASE}?per_page=${PER_PAGE}&page=${page}&orderby=title&order=asc`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Kriptostore-import/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} page ${page}`);
  const total = Number(res.headers.get("X-WP-Total") || 0);
  const pages = Number(res.headers.get("X-WP-TotalPages") || 1);
  const data = await res.json();
  return { data, total, pages };
}

function mapProduct(p) {
  const minor = p.prices?.currency_minor_unit ?? 2;
  const raw = Number(p.prices?.price || p.prices?.regular_price || 0);
  const priceUah = raw / 10 ** minor;

  return {
    sourceId: p.id,
    sku: p.sku || "",
    slug: p.slug,
    name: p.name,
    permalink: p.permalink,
    shortDescription: p.short_description || "",
    description: p.description || "",
    priceUah,
    currency: p.prices?.currency_code || "UAH",
    inStock: Boolean(p.is_in_stock),
    categories: (p.categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    images: (p.images || []).map((img) => ({
      id: img.id,
      src: img.src,
      alt: img.alt || p.name,
      name: img.name || "",
    })),
  };
}

async function main() {
  console.log("Fetching lwallet catalog…");
  const first = await fetchPage(1);
  const all = [...first.data.map(mapProduct)];
  console.log(`Page 1/${first.pages} (${first.total} total)`);

  for (let page = 2; page <= first.pages; page++) {
    await new Promise((r) => setTimeout(r, 400));
    const { data } = await fetchPage(page);
    all.push(...data.map(mapProduct));
    console.log(`Page ${page}/${first.pages} (+${data.length})`);
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        scrapedAt: new Date().toISOString(),
        source: "https://lwallet.com.ua",
        count: all.length,
        products: all,
      },
      null,
      2
    )
  );
  console.log(`Wrote ${all.length} products → ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
