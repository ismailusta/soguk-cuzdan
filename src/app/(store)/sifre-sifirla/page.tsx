"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useLocale } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İstek başarısız.");
      setMsg(data.message || "Tamam.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "İstek başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade mx-auto max-w-md px-5 py-16 md:px-12">
      <h1 className="text-2xl font-bold">{t.forgotPassword}</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Kayıtlı e-postanıza sıfırlama bağlantısı gönderilir.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3.5">
        <div>
          <label className="label">{t.email}</label>
          <input
            className="input-field"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {msg && <p className="text-sm text-success">{msg}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "…" : t.sendReset}
        </button>
      </form>
      <p className="mt-6 text-sm text-fg-dim">
        <Link href="/giris" className="text-accent hover:underline">
          ← {t.signIn}
        </Link>
      </p>
    </div>
  );
}
