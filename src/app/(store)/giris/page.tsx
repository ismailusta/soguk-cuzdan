"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/lib/i18n";

export default function AuthPage() {
  const { user, ready, login, register } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/hesabim");
  }, [ready, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        await register({ email, password, name });
      }
      router.push("/hesabim");
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-bg-nav px-8 py-16">
        <div
          className="absolute h-[420px] w-[420px] rounded-full opacity-40 blur-[60px]"
          style={{
            background:
              "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[14%] right-[12%] flex h-[62px] w-[62px] items-center justify-center rounded-full text-2xl font-bold text-[#232a38] shadow-[0_14px_28px_rgba(0,0,0,0.55)]"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #ffc768, #f7931a 60%, #b86b00)",
            animation:
              "spin3d 9s linear infinite, floatA 6s ease-in-out infinite alternate",
          }}
        >
          ₿
        </div>
        <div className="relative max-w-[420px]">
          <div
            className="mb-7 h-10 w-10 rounded-[10px]"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), oklch(0.4 0.02 260))",
            }}
          />
          <h1 className="mb-[18px] text-[34px] leading-[1.15] font-bold tracking-[-1px]">
            {t.authTitle}
          </h1>
          <p className="text-[15px] leading-relaxed text-fg-muted">{t.authBody}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[380px]">
          <div className="relative mb-8 flex rounded-xl bg-bg-elevated p-1">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[9px] bg-accent transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
              style={{
                transform:
                  mode === "signup" ? "translateX(100%)" : "translateX(0)",
                left: 4,
              }}
            />
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`relative z-[1] flex-1 py-2.5 text-sm font-semibold ${
                mode === "signin" ? "text-accent-ink" : "text-fg-dim"
              }`}
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`relative z-[1] flex-1 py-2.5 text-sm font-semibold ${
                mode === "signup" ? "text-accent-ink" : "text-fg-dim"
              }`}
            >
              {t.signUp}
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
            {mode === "signup" && (
              <div>
                <label className="label">{t.name}</label>
                <input
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
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
              <div>
                <label className="label">Şifre</label>
                <input
                  className="input-field"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full font-bold"
            >
              {loading ? "…" : mode === "signin" ? t.signIn : t.signUp}
            </button>
          </form>

          {mode === "signin" && (
            <p className="mt-4 text-center text-sm text-fg-dim">
              <Link href="/sifre-sifirla" className="text-accent hover:underline">
                {t.forgotPassword}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
