import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { CUSTOMER_COOKIE, mapCustomer } from "@/lib/customer-auth";

async function getCustomer() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  const payload = await getPayloadClient();
  const { user } = await payload.auth({
    headers: new Headers({
      Authorization: `JWT ${token}`,
    }),
  });

  if (!user || user.collection !== "customers") return null;
  return user;
}

export async function GET() {
  try {
    const user = await getCustomer();
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: mapCustomer(user as never) });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCustomer();
    if (!user) {
      return NextResponse.json({ error: "Oturum yok." }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      city?: string;
      district?: string;
      address?: string;
      postalCode?: string;
    };

    const payload = await getPayloadClient();
    const updated = await payload.update({
      collection: "customers",
      id: user.id,
      data: {
        name: body.name,
        phone: body.phone,
        city: body.city,
        district: body.district,
        address: body.address,
        postalCode: body.postalCode,
      },
      overrideAccess: true,
    });

    return NextResponse.json({ user: mapCustomer(updated) });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Güncellenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
