/**
 * Create public `media` Storage bucket on Supabase (+ read/write policies).
 *
 *   $env:DATABASE_URL="postgresql://...supabase...?sslmode=no-verify"
 *   npx tsx scripts/create-supabase-media-bucket.ts
 */
import "dotenv/config";
import pg from "pg";

const sql = `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Authenticated upload/update/delete (S3 keys / service role bypass RLS anyway)
DROP POLICY IF EXISTS "Auth write media" ON storage.objects;
CREATE POLICY "Auth write media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Auth update media" ON storage.objects;
CREATE POLICY "Auth update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Auth delete media" ON storage.objects;
CREATE POLICY "Auth delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
`;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL gerekli");
  if (/localhost|127\.0\.0\.1/i.test(connectionString)) {
    throw new Error(
      "DATABASE_URL localhost — Supabase Session pooler URI kullan (storage şeması orada)."
    );
  }

  const client = new pg.Client({
    connectionString,
    ssl: /supabase\.com/i.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'media'`
  );
  console.log("Bucket ready:", rows[0]);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
