/**
 * Ensure products.sku column + assign SN-XXXXXXXXX to every product.
 *
 * Dry-run:
 *   npx tsx scripts/assign-product-sns.ts
 * Apply:
 *   $env:APPLY=1; npx tsx scripts/assign-product-sns.ts
 */
import "dotenv/config";
import pg from "pg";
import { generateProductSn } from "../src/lib/product-sn";

async function main() {
  const apply = process.env.APPLY === "1" || process.argv.includes("--apply");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");

  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  await client.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS sku varchar;
  `);

  // Unique index (partial so nulls ok until filled)
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS products_sku_idx ON products (sku);
  `);

  const { rows } = await client.query<{
    id: number;
    slug: string;
    sku: string | null;
  }>(`SELECT id, slug, sku FROM products ORDER BY id`);

  const used = new Set(
    rows
      .map((r) => (r.sku || "").trim().toUpperCase())
      .filter(Boolean)
  );

  let assigned = 0;
  const samples: string[] = [];

  for (const row of rows) {
    const current = (row.sku || "").trim().toUpperCase();
    if (current) continue;

    let sn = generateProductSn();
    let guard = 0;
    while (used.has(sn) && guard < 20) {
      sn = generateProductSn();
      guard += 1;
    }
    used.add(sn);

    if (!apply) {
      if (samples.length < 5) samples.push(`#${row.id} ${row.slug} → ${sn}`);
      assigned += 1;
      continue;
    }

    await client.query(`UPDATE products SET sku = $1 WHERE id = $2`, [
      sn,
      row.id,
    ]);
    assigned += 1;
    if (samples.length < 5) samples.push(`#${row.id} ${row.slug} → ${sn}`);
  }

  // After fill, enforce NOT NULL if all have sku
  if (apply) {
    const missing = await client.query(
      `SELECT count(*)::int AS c FROM products WHERE sku IS NULL OR sku = ''`
    );
    if (Number(missing.rows[0]?.c || 0) === 0) {
      await client.query(`
        ALTER TABLE products
        ALTER COLUMN sku SET NOT NULL;
      `);
      console.log("sku column set NOT NULL.");
    }
  }

  await client.end();

  console.log(
    `${apply ? "APPLY" : "DRY-RUN"} · products=${rows.length} · assigned=${assigned}`
  );
  for (const s of samples) console.log(" ", s);
  if (!apply) console.log("Re-run with APPLY=1 to write.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
