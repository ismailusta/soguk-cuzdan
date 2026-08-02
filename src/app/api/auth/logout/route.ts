import { NextResponse } from "next/server";
import { clearAllAuthCookies } from "@/lib/customer-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAllAuthCookies(response);
  return response;
}
