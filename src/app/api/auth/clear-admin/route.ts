import { NextResponse } from "next/server";
import { clearAllAuthCookies } from "@/lib/customer-auth";

/** Admin veya müşteri cookie çakışmasını temizler → /admin/login */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/admin/login", url.origin));
  clearAllAuthCookies(response);
  return response;
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAllAuthCookies(response);
  return response;
}
