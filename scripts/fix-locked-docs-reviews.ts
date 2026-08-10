import "dotenv/config";
import pg from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const cols = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'payload_locked_documents_rels'
    ORDER BY ordinal_position
  `);
  console.log(
    "locked_docs_rels cols:",
    cols.rows.map((r) => r.column_name)
  );

  // Ensure ProductReviews lock relation column exists (Payload expects it)
  const has = cols.rows.some((r) => r.column_name === "product_reviews_id");
  if (!has) {
    await client.query(`
      ALTER TABLE payload_locked_documents_rels
      ADD COLUMN IF NOT EXISTS product_reviews_id integer
      REFERENCES product_reviews(id) ON DELETE CASCADE;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_product_reviews_id_idx
      ON payload_locked_documents_rels (product_reviews_id);
    `);
    console.log("Added product_reviews_id to payload_locked_documents_rels");
  } else {
    console.log("product_reviews_id already present");
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
