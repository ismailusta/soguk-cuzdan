/**
 * Live schema fix after failed drizzle push (text → jsonb + hero image localization).
 *
 *   $env:DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres?sslmode=no-verify"
 *   npx tsx scripts/migrate-live-schema.ts
 *
 * Then: npm run db:push
 */
import "dotenv/config";
import pg from "pg";

function requireUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || /localhost|127\.0\.0\.1/i.test(url)) {
    throw new Error("Supabase DATABASE_URL gerekli");
  }
  return url;
}

/** SQL expression: varchar/text column → Lexical jsonb document */
function lexicalExpr(col: string): string {
  return `
    CASE
      WHEN ${col} IS NULL OR btrim(${col}::text) = '' THEN NULL
      WHEN btrim(${col}::text) ~ '^\\{' AND btrim(${col}::text) LIKE '%"root"%' THEN
        CASE
          WHEN jsonb_typeof(btrim(${col}::text)::jsonb) = 'object'
            THEN btrim(${col}::text)::jsonb
          ELSE NULL
        END
      ELSE jsonb_build_object(
        'root', jsonb_build_object(
          'type', 'root',
          'format', '',
          'indent', 0,
          'version', 1,
          'direction', 'ltr',
          'children', (
            SELECT COALESCE(jsonb_agg(para ORDER BY ord), '[]'::jsonb)
            FROM (
              SELECT
                ord,
                jsonb_build_object(
                  'type', 'paragraph',
                  'format', '',
                  'indent', 0,
                  'version', 1,
                  'direction', 'ltr',
                  'textFormat', 0,
                  'textStyle', '',
                  'children', jsonb_build_array(
                    jsonb_build_object(
                      'type', 'text',
                      'version', 1,
                      'detail', 0,
                      'format', 0,
                      'mode', 'normal',
                      'style', '',
                      'text', regexp_replace(btrim(part), E'\\n+', ' ', 'g')
                    )
                  )
                ) AS para
              FROM regexp_split_to_table(btrim(${col}::text), E'\\n\\s*\\n')
                WITH ORDINALITY AS t(part, ord)
              WHERE btrim(part) <> ''
            ) parts
          )
        )
      )
    END
  `;
}

async function colType(client: pg.Client, table: string, column: string) {
  const r = await client.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1 AND column_name=$2`,
    [table, column]
  );
  return (r.rows[0]?.data_type as string | undefined) ?? null;
}

async function convertColumn(client: pg.Client, table: string, column: string) {
  const t = await colType(client, table, column);
  if (!t) {
    console.log(`  skip ${table}.${column} (missing)`);
    return;
  }
  if (t === "jsonb") {
    console.log(`  ok   ${table}.${column} already jsonb`);
    return;
  }
  console.log(`  convert ${table}.${column} (${t} → jsonb)`);
  const tmp = `${column}__lex_tmp`;
  await client.query(`ALTER TABLE "${table}" ADD COLUMN "${tmp}" jsonb`);
  await client.query(
    `UPDATE "${table}" SET "${tmp}" = ${lexicalExpr(`"${column}"`)}`
  );
  await client.query(`ALTER TABLE "${table}" DROP COLUMN "${column}"`);
  await client.query(
    `ALTER TABLE "${table}" RENAME COLUMN "${tmp}" TO "${column}"`
  );
}

async function migrateHeroImages(client: pg.Client) {
  console.log("\nHero images → locales");

  for (const [col, typ] of [
    ["image_id", "integer"],
    ["image_url", "varchar"],
    ["image_mobile_id", "integer"],
    ["image_url_mobile", "varchar"],
  ] as const) {
    const exists = await colType(client, "hero_banners_locales", col);
    if (!exists) {
      console.log(`  add hero_banners_locales.${col}`);
      await client.query(
        `ALTER TABLE hero_banners_locales ADD COLUMN "${col}" ${typ}`
      );
    }
  }

  // Ensure unique (locale, parent) for upsert
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS hero_banners_locales_locale_parent_uidx
    ON hero_banners_locales (_locale, _parent_id)
  `);

  const hasImage = await colType(client, "hero_banners", "image_id");
  if (!hasImage) {
    console.log("  hero_banners.image_id already removed");
    return;
  }

  console.log("  copy image_id/image_url into existing locale rows");
  await client.query(`
    UPDATE hero_banners_locales l
    SET
      image_id = COALESCE(l.image_id, h.image_id),
      image_url = COALESCE(l.image_url, h.image_url)
    FROM hero_banners h
    WHERE l._parent_id = h.id
  `);

  console.log("  drop non-localized hero_banners.image_*");
  await client.query(`ALTER TABLE hero_banners DROP COLUMN IF EXISTS image_id`);
  await client.query(`ALTER TABLE hero_banners DROP COLUMN IF EXISTS image_url`);
}

async function main() {
  const url = requireUrl();
  console.log("Migrating →", url.replace(/:[^:@/]+@/, ":***@"));

  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query("BEGIN");

    console.log("\n1) Rich text → Lexical jsonb");
    await convertColumn(client, "products_locales", "description");
    await convertColumn(client, "products_detail_sections", "body");
    await convertColumn(client, "products_faqs", "answer");
    await convertColumn(client, "site_settings_locales", "privacy_body");
    await convertColumn(client, "site_settings_locales", "terms_body");
    await convertColumn(client, "site_settings_locales", "returns_body");
    await convertColumn(client, "site_settings_locales", "kvkk_body");

    await migrateHeroImages(client);

    await client.query("COMMIT");
    console.log("\nOK — şimdi tekrar: npm run db:push");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("\nFAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
