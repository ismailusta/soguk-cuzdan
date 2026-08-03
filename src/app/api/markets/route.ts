import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CacheEntry = { at: number; body: unknown };
const cache: { markets?: CacheEntry; btc?: CacheEntry } = {};
const TTL_MS = 60_000;

async function cached(
  key: "markets" | "btc",
  url: string
): Promise<{ ok: true; data: unknown } | { ok: false; status: number }> {
  const hit = cache[key];
  if (hit && Date.now() - hit.at < TTL_MS) {
    return { ok: true, data: hit.body };
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    cache[key] = { at: Date.now(), body: data };
    return { ok: true, data };
  } catch {
    if (hit) return { ok: true, data: hit.body };
    return { ok: false, status: 502 };
  }
}

/** Proxies CoinGecko to avoid browser CORS / network noise. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") || "markets";

  if (kind === "btc") {
    const result = await cached(
      "btc",
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try&include_24hr_change=true"
    );
    if (!result.ok) {
      return NextResponse.json({ error: "upstream" }, { status: result.status });
    }
    return NextResponse.json(result.data);
  }

  const result = await cached(
    "markets",
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=try&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h"
  );
  if (!result.ok) {
    return NextResponse.json({ error: "upstream" }, { status: result.status });
  }
  return NextResponse.json(result.data);
}
