import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

/** Lightweight DB check for Hostinger / Supabase debugging. */
export async function GET() {
  try {
    const payload = await getPayloadClient();
    const products = await payload.find({
      collection: "products",
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    return NextResponse.json({
      ok: true,
      products: products.totalDocs,
      dbHost: (() => {
        try {
          const u = new URL(
            (process.env.DATABASE_URL || "").replace(/^postgresql:/, "http:")
          );
          return u.hostname;
        } catch {
          return null;
        }
      })(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const cause =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : undefined;
    return NextResponse.json(
      {
        ok: false,
        error: message.slice(0, 400),
        cause: cause?.slice(0, 400),
      },
      { status: 500 }
    );
  }
}
