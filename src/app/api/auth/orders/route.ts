import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { CUSTOMER_COOKIE } from "@/lib/customer-auth";

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get(CUSTOMER_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Oturum yok." }, { status: 401 });
    }

    const payload = await getPayloadClient();
    const { user } = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token}`,
      }),
    });

    if (!user || user.collection !== "customers") {
      return NextResponse.json({ error: "Oturum yok." }, { status: 401 });
    }

    const result = await payload.find({
      collection: "orders",
      where: {
        or: [
          { customerEmail: { equals: user.email } },
          { customer: { equals: user.id } },
        ],
      },
      sort: "-createdAt",
      limit: 50,
      overrideAccess: true,
    });

    return NextResponse.json({
      orders: result.docs.map((o) => ({
        id: o.orderNumber,
        accessToken: o.accessToken,
        status: o.status,
        total: o.total,
        currency: o.currency,
        createdAt: o.createdAt,
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        items: o.items,
      })),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Siparişler alınamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
