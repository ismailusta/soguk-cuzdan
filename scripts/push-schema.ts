/**
 * Push Payload schema to DATABASE_URL (creates products, users, etc.).
 *
 * PowerShell:
 *   $env:NODE_ENV="development"
 *   $env:DATABASE_URL="postgresql://postgres.XXX:SIFRE@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=no-verify"
 *   $env:PAYLOAD_SECRET="en-az-32-karakter-secret-buraya"
 *   npx tsx scripts/push-schema.ts
 */
import "dotenv/config";

// Must be set before Payload connects — production blocks schema push.
process.env.NODE_ENV = "development";
process.env.PAYLOAD_DATABASE_PUSH = "true";
process.env.DATABASE_SSL = "true";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL gerekli (Supabase Session pooler URI)");
  }
  if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 16) {
    throw new Error("PAYLOAD_SECRET gerekli");
  }

  const safe = process.env.DATABASE_URL.replace(/:[^:@/]+@/, ":***@");
  console.log("Pushing schema →", safe);

  const { getPayload } = await import("payload");
  const { default: config } = await import("../src/payload.config");

  const payload = await getPayload({ config });

  for (const collection of [
    "users",
    "customers",
    "media",
    "products",
    "orders",
    "hero-banners",
  ] as const) {
    const r = await payload.find({
      collection,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    console.log(`✓ ${collection} (total=${r.totalDocs})`);
  }

  console.log("\nDone. Tables exist on Supabase. Open /admin and create first user.");
  process.exit(0);
}

main().catch((e) => {
  console.error("\nPUSH FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
