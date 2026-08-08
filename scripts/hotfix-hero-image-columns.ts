/**
 * Hotfix: restore hero_banners.image_id / image_url for OLD production build
 * (Hostinger still queries non-localized columns).
 *
 * Keeps locale image columns too — new code uses those after deploy.
 */
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url || /localhost|127\.0\.0\.1/i.test(url)) {
  throw new Error("Supabase DATABASE_URL gerekli");
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Hotfix →", url.replace(/:[^:@/]+@/, ":***@"));

try {
  await client.query("BEGIN");

  await client.query(`
    ALTER TABLE hero_banners
      ADD COLUMN IF NOT EXISTS image_id integer,
      ADD COLUMN IF NOT EXISTS image_url varchar
  `);

  // Prefer TR locale image, else EN
  await client.query(`
    UPDATE hero_banners h
    SET
      image_id = COALESCE(
        (SELECT l.image_id FROM hero_banners_locales l
         WHERE l._parent_id = h.id AND l._locale::text = 'tr' LIMIT 1),
        (SELECT l.image_id FROM hero_banners_locales l
         WHERE l._parent_id = h.id AND l._locale::text = 'en' LIMIT 1),
        h.image_id
      ),
      image_url = COALESCE(
        (SELECT l.image_url FROM hero_banners_locales l
         WHERE l._parent_id = h.id AND l._locale::text = 'tr' LIMIT 1),
        (SELECT l.image_url FROM hero_banners_locales l
         WHERE l._parent_id = h.id AND l._locale::text = 'en' LIMIT 1),
        h.image_url
      )
  `);

  const check = await client.query(`
    SELECT h.id, h.image_id, h.image_url,
      (SELECT count(*) FROM hero_banners_locales l WHERE l._parent_id = h.id) AS locales
    FROM hero_banners h
  `);
  console.log("hero rows:", check.rows);

  await client.query("COMMIT");
  console.log("OK — image_id/image_url restored on hero_banners");
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  await client.end();
}
