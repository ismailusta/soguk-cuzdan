/**
 * Allow hero video MIME types on the Supabase `media` bucket.
 *
 * Prefers Storage REST (service role), falls back to Postgres `storage.buckets`.
 *
 *   # Option A — Dashboard service role:
 *   $env:SUPABASE_URL="https://YOUR.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   npm run db:storage:allow-video
 *
 *   # Option B — Supabase DB URI (Session mode, not localhost):
 *   $env:DATABASE_URL="postgresql://postgres:...@db.YOUR.supabase.co:5432/postgres"
 *   npm run db:storage:allow-video
 */
import "dotenv/config";
import pg from "pg";

const MIMES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

function projectUrlFromEnv(): string | undefined {
  const direct = process.env.SUPABASE_URL?.trim()?.replace(/\/$/, "");
  if (direct) return direct;
  const publicUrl = process.env.S3_PUBLIC_URL?.trim();
  if (!publicUrl) return undefined;
  try {
    const u = new URL(publicUrl);
    // https://xxx.supabase.co/storage/v1/object/public/media
    if (u.hostname.endsWith(".supabase.co")) {
      return `${u.protocol}//${u.hostname}`;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

async function viaRest(): Promise<boolean> {
  const base = projectUrlFromEnv();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!base || !key) return false;

  const res = await fetch(`${base}/storage/v1/bucket/media`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "media",
      public: true,
      file_size_limit: 52428800,
      allowed_mime_types: MIMES,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Storage REST ${res.status}: ${text}`);
  }
  console.log("Updated media bucket via Storage REST:", text || "ok");
  return true;
}

async function viaPostgres(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL veya SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY gerekli"
    );
  }

  const client = new pg.Client({
    connectionString,
    ssl: /supabase\.com/i.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();

  try {
    const { rowCount } = await client.query(
      `UPDATE storage.buckets
       SET allowed_mime_types = $1::text[],
           file_size_limit = GREATEST(COALESCE(file_size_limit, 0), 52428800),
           public = true
       WHERE id = 'media'`,
      [MIMES]
    );

    if (!rowCount) {
      throw new Error(
        "storage.buckets içinde id=media yok — önce npm run db:storage:media"
      );
    }

    const { rows } = await client.query(
      `SELECT id, public, file_size_limit, allowed_mime_types
       FROM storage.buckets WHERE id = 'media'`
    );
    console.log("Updated media bucket via Postgres:", rows[0]);
  } finally {
    await client.end();
  }
}

async function main() {
  if (await viaRest()) return;
  try {
    await viaPostgres();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/storage\.buckets.*does not exist/i.test(msg)) {
      console.error(`
Bu DATABASE_URL Supabase Storage şemasını içermiyor (muhtemelen lokal Postgres).

Hızlı fix — Supabase Dashboard → Storage → media → Configuration:
  Allowed MIME types: image/*, video/mp4, video/webm, video/quicktime
  (veya boş bırak = hepsi)

Ya da service role ile:
  $env:SUPABASE_URL="https://YOUR.supabase.co"
  $env:SUPABASE_SERVICE_ROLE_KEY="..."
  npm run db:storage:allow-video
`);
    }
    throw e;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
