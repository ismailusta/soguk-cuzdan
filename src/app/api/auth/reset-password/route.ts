import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { applyCustomerSession, mapCustomer } from "@/lib/customer-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`reset:${clientIp(request)}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Çok fazla istek. Biraz bekleyin." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };

    if (!body.token?.trim() || !body.password || body.password.length < 6) {
      return NextResponse.json(
        { error: "Geçerli token ve en az 6 karakter şifre gerekli." },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();
    const result = await payload.resetPassword({
      collection: "customers",
      data: {
        token: body.token.trim(),
        password: body.password,
      },
      overrideAccess: true,
    });

    if (!result.user || typeof result.user.email !== "string") {
      return NextResponse.json(
        { error: "Sıfırlama başarısız veya token geçersiz." },
        { status: 400 }
      );
    }

    const login = await payload.login({
      collection: "customers",
      data: {
        email: result.user.email,
        password: body.password,
      },
    });

    const userDoc = login.user || result.user;
    const response = NextResponse.json({
      user: mapCustomer(userDoc as Parameters<typeof mapCustomer>[0]),
    });
    if (login.token) await applyCustomerSession(response, login.token);
    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Sıfırlama başarısız.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
