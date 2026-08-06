"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "@/lib/i18n";

export function ContactForm() {
  const { locale, t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-fg-muted">{t.contactName}</span>
          <input
            className="input-field w-full"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-fg-muted">{t.contactEmail}</span>
          <input
            className="input-field w-full"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block text-fg-muted">{t.contactSubject}</span>
        <input
          className="input-field w-full"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-fg-muted">{t.contactMessage}</span>
        <textarea
          className="input-field min-h-[140px] w-full resize-y"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <button
        type="submit"
        className="btn-primary"
        disabled={status === "loading"}
      >
        {status === "loading" ? t.contactSending : t.contactSend}
      </button>
      {status === "ok" && (
        <p className="text-sm text-success">
          {locale === "en"
            ? "Message sent. We’ll reply by email."
            : "Mesajınız gönderildi. E-posta ile dönüş yapacağız."}
        </p>
      )}
      {status === "err" && (
        <p className="text-sm text-danger">
          {locale === "en"
            ? "Could not send. Try again or email us directly."
            : "Gönderilemedi. Tekrar deneyin veya doğrudan e-posta yazın."}
        </p>
      )}
    </form>
  );
}
