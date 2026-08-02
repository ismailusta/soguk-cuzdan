import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`forgot:${clientIp(request)}`, 8, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Çok fazla istek. Biraz bekleyin." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
    }

    const payload = await getPayloadClient();
    // Güvenlik: kullanıcı yoksa da aynı mesaj
    try {
      await payload.forgotPassword({
        collection: "customers",
        data: { email },
      });
    } catch {
      // ignore enumeration
    }

    return NextResponse.json({
      ok: true,
      message:
        "E-posta kayıtlıysa sıfırlama bağlantısı gönderildi (geliştirmede konsola yazılır).",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "İstek işlenemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
