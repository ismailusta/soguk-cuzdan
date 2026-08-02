import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const CUSTOMER_COOKIE = "noir-customer-token";
export const ADMIN_COOKIE = "payload-token";

export type CustomerProfile = {
  id: number | string;
  email: string;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  postalCode?: string | null;
};

export function mapCustomer(doc: {
  id: number | string;
  email: string;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  postalCode?: string | null;
}): CustomerProfile {
  return {
    id: doc.id,
    email: doc.email,
    name: doc.name ?? null,
    phone: doc.phone ?? null,
    city: doc.city ?? null,
    district: doc.district ?? null,
    address: doc.address ?? null,
    postalCode: doc.postalCode ?? null,
  };
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

/** Müşteri oturumu: admin cookie temizlenir (çakışma önlenir). */
export async function applyCustomerSession(
  response: NextResponse,
  token: string
) {
  const jar = await cookies();
  try {
    jar.delete(ADMIN_COOKIE);
  } catch {
    // ignore
  }

  response.cookies.delete(ADMIN_COOKIE);
  response.cookies.set(CUSTOMER_COOKIE, token, {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearCustomerSession(response: NextResponse) {
  response.cookies.delete(CUSTOMER_COOKIE);
}

/** Her iki oturumu da temizle (logout / panel geçişi). */
export function clearAllAuthCookies(response: NextResponse) {
  response.cookies.delete(CUSTOMER_COOKIE);
  response.cookies.delete(ADMIN_COOKIE);
}
