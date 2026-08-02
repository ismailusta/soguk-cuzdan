"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { useAuth } from "@/components/AuthProvider";
import { Suspense } from "react";

function ResetForm() {
  const { t } = useLocale();
  const { refresh } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const tokenFromUrl = params.get("token") || "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sıfırlama başarısız.");
      await refresh();
      router.push("/hesabim");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sıfırlama başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade mx-auto max-w-md px-5 py-16 md:px-12">
      <h1 className="text-2xl font-bold">{t.resetPassword}</h1>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3.5">
        {!tokenFromUrl && (
          <div>
            <label className="label">Token</label>
            <input
              className="input-field"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="label">{t.newPassword}</label>
          <input
            className="input-field"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "…" : t.resetPassword}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="px-5 py-20 text-center text-fg-dim">…</div>}>
      <ResetForm />
    </Suspense>
  );
}
