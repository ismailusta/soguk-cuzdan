import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { getSiteSettings } from "@/lib/site-settings";
import { BRAND_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 200);
  const subject = String(body.subject || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 5000);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "name, email and message required" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const settings = await getSiteSettings();
  const to = settings.contactEmail;
  const topic = subject || "İletişim formu";

  try {
    const payload = await getPayloadClient();
    await payload.sendEmail({
      to,
      replyTo: email,
      subject: `[${BRAND_NAME}] ${topic} — ${name}`,
      text: `Ad: ${name}\nE-posta: ${email}\nKonu: ${topic}\n\n${message}`,
      html: `<p><strong>Ad:</strong> ${escapeHtml(name)}</p>
<p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
<p><strong>Konu:</strong> ${escapeHtml(topic)}</p>
<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>`,
    });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
