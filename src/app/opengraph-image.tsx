import { ImageResponse } from "next/og";
import { BRAND_NAME, BRAND_TAGLINE_TR } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${BRAND_NAME} — ${BRAND_TAGLINE_TR}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, #0a0c10 0%, #12161e 45%, #1a1408 100%)",
          color: "#f4f1ea",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "linear-gradient(145deg, #e8c547, #c9a227)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0a0c10",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            K
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#e8c547",
            }}
          >
            {BRAND_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            {BRAND_TAGLINE_TR}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(244,241,234,0.72)",
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            Ledger, Trezor, SafePal ve daha fazlası. Türkiye teslimatı · kripto
            ile ödeme.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(244,241,234,0.55)",
          }}
        >
          <span>kriptostore.com</span>
          <span style={{ color: "#e8c547" }}>Orijinal donanım cüzdanları</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
