import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { applyCustomerSession, mapCustomer } from "@/lib/customer-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`register:${clientIp(request)}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Biraz bekleyin." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!body.email?.trim() || !body.password || body.password.length < 6) {
      return NextResponse.json(
        { error: "Geçerli e-posta ve en az 6 karakter şifre gerekli." },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();
    await payload.create({
      collection: "customers",
      data: {
        email: body.email.trim().toLowerCase(),
        password: body.password,
        name: body.name?.trim() || undefined,
      },
      overrideAccess: true,
    });

    const result = await payload.login({
      collection: "customers",
      data: {
        email: body.email.trim().toLowerCase(),
        password: body.password,
      },
    });

    if (!result.user || !result.token) {
      return NextResponse.json(
        { error: "Kayıt oldu ama giriş yapılamadı." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ user: mapCustomer(result.user) });
    await applyCustomerSession(response, result.token);
    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Kayıt başarısız.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
