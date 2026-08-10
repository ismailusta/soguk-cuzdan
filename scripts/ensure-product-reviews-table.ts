/**
 * Create product_reviews table + enums without a full Payload schema push
 * (push would try to drop unrelated columns due to local/DB drift).
 *
 *   npx tsx scripts/ensure-product-reviews-table.ts
 */
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

  await client.query(`
    DO $$ BEGIN
      CREATE TYPE enum_product_reviews_status AS ENUM ('pending', 'approved', 'rejected');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE enum_product_reviews_source AS ENUM ('user', 'seed');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE enum_product_reviews_locale AS ENUM ('tr', 'en');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id serial PRIMARY KEY,
      product_id integer REFERENCES products(id) ON DELETE SET NULL,
      rating numeric NOT NULL,
      title varchar,
      body varchar NOT NULL,
      author_name varchar NOT NULL,
      customer_id integer REFERENCES customers(id) ON DELETE SET NULL,
      status enum_product_reviews_status DEFAULT 'pending'::enum_product_reviews_status NOT NULL,
      source enum_product_reviews_source DEFAULT 'user'::enum_product_reviews_source NOT NULL,
      locale enum_product_reviews_locale DEFAULT 'tr'::enum_product_reviews_locale,
      verified_purchase boolean DEFAULT false,
      updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
      created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS product_reviews_product_idx ON product_reviews (product_id);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS product_reviews_status_idx ON product_reviews (status);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS product_reviews_created_at_idx ON product_reviews (created_at);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS product_reviews_updated_at_idx ON product_reviews (updated_at);
  `);

  // Payload often tracks enum in drizzle migrations table — optional no-op.
  const cols = await client.query(`
    SELECT column_name, udt_name
    FROM information_schema.columns
    WHERE table_name = 'product_reviews'
    ORDER BY ordinal_position
  `);
  console.log("OK product_reviews columns:", cols.rows);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
