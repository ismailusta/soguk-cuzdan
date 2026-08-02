import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { applyCustomerSession, mapCustomer } from "@/lib/customer-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`login:${clientIp(request)}`, 15, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Biraz bekleyin." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (!body.email?.trim() || !body.password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gerekli." },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();
    const result = await payload.login({
      collection: "customers",
      data: {
        email: body.email.trim().toLowerCase(),
        password: body.password,
      },
    });

    if (!result.user || !result.token) {
      return NextResponse.json({ error: "Giriş başarısız." }, { status: 401 });
    }

    const response = NextResponse.json({
      user: mapCustomer(result.user),
    });
    await applyCustomerSession(response, result.token);
    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Giriş başarısız.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
