import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl px-5 py-24 md:px-8">
      <div className="glass flex flex-col items-start p-8 md:p-10">
        <p className="font-mono text-xs tracking-[0.24em] text-steel uppercase">
          404
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Sayfa bulunamadı
        </h1>
        <p className="mt-4 text-fg-muted">
          Aradığınız sayfa yok veya taşınmış olabilir.
        </p>
        <Link href="/" className="btn-primary mt-10">
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
