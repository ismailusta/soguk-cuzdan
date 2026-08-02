"use client";

import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { useLocale } from "@/lib/i18n";

type LegalKey = "privacy" | "terms" | "returns" | "kvkk";

const copy: Record<
  LegalKey,
  { tr: { title: string; body: string[] }; en: { title: string; body: string[] } }
> = {
  privacy: {
    tr: {
      title: "Gizlilik politikası",
      body: [
        "Kriptostore olarak sipariş ve hesap verilerinizi yalnızca siparişinizin işlenmesi, kargo ve yasal yükümlülükler için kullanırız.",
        "Ödeme Cryptomus üzerinden gerçekleşir; kart veya cüzdan özel anahtarlarınız bizde tutulmaz.",
        "Verileriniz Payload CMS / PostgreSQL üzerinde saklanır; üçüncü taraflarla pazarlama amacıyla paylaşılmaz.",
        "İletişim: site üzerinden hesap e-postanız veya sipariş e-postanız ile bize ulaşabilirsiniz.",
      ],
    },
    en: {
      title: "Privacy policy",
      body: [
        "Kriptostore uses your order and account data only to process orders, shipping, and legal obligations.",
        "Payments run via Cryptomus; we never store card details or your crypto private keys.",
        "Data is stored in Payload CMS / PostgreSQL and is not sold for marketing.",
        "Contact us using your account or order email.",
      ],
    },
  },
  terms: {
    tr: {
      title: "Kullanım koşulları",
      body: [
        "Site üzerinden verilen siparişler Cryptomus faturası oluşturulduğunda rezervasyon sayılır; ödeme onayından sonra kesinleşir.",
        "Ürünler orijinal donanım cüzdanlarıdır; fiyatlar TRY cinsinden listelenir, ödeme kripto ile alınır.",
        "Yanlış tutar veya iptal durumlarında sipariş durumu güncellenir; stok iadesi ödeme durumuna göre yönetilir.",
        "Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.",
      ],
    },
    en: {
      title: "Terms of use",
      body: [
        "Orders are reserved when a Cryptomus invoice is created and confirmed after payment.",
        "Products are genuine hardware wallets; prices are listed in TRY and paid in crypto.",
        "Wrong-amount or cancelled payments update order status; stock is managed accordingly.",
        "By using the site you accept these terms.",
      ],
    },
  },
  returns: {
    tr: {
      title: "İade ve iptal",
      body: [
        "Ödeme tamamlanmadan iptal edilen Cryptomus faturalarında sipariş iptal durumuna geçer.",
        "Açılmamış, mühürlü donanım ürünlerinde yasal cayma hakkı kapsamında iade talepleri değerlendirilir.",
        "Açılmış veya aktive edilmiş cihazlarda güvenlik nedeniyle iade kısıtlı olabilir.",
        "İade talepleriniz için sipariş e-postanız ve sipariş numaranız ile iletişime geçin.",
      ],
    },
    en: {
      title: "Returns & cancellation",
      body: [
        "Unpaid Cryptomus invoices move the order to cancelled.",
        "Unopened sealed hardware may be returnable under applicable cooling-off rules.",
        "Opened or activated devices may have limited return options for security reasons.",
        "Contact us with your order email and order ID for return requests.",
      ],
    },
  },
  kvkk: {
    tr: {
      title: "KVKK bilgilendirme",
      body: [
        "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; ad, e-posta, telefon ve teslimat adresi sipariş süreçleri için işlenir.",
        "Veri sorumlusu: Kriptostore. Amaç: sözleşme ifası ve yasal zorunluluklar.",
        "Haklarınız: erişim, düzeltme, silme ve itiraz. Taleplerinizi kayıtlı e-posta adresiniz üzerinden iletebilirsiniz.",
        "Saklama süresi: sipariş ve muhasebe yükümlülükleri süresince; ardından silinir veya anonimleştirilir.",
      ],
    },
    en: {
      title: "Privacy notice (KVKK)",
      body: [
        "Under Turkish KVKK, name, email, phone and shipping address are processed for order fulfillment.",
        "Controller: Kriptostore. Purpose: contract performance and legal duties.",
        "Your rights include access, correction, deletion and objection via your registered email.",
        "Retention follows order/accounting obligations, then deletion or anonymization.",
      ],
    },
  },
};

export function LegalPage({ kind }: { kind: LegalKey }) {
  const { locale, t } = useLocale();
  const content = copy[kind][locale];

  return (
    <article className="animate-fade mx-auto max-w-2xl px-5 py-14 md:px-12 md:py-20">
      <p className="text-[13px] tracking-[1px] text-[oklch(0.5_0.01_260)] uppercase">
        {t.legal}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        {content.title}
      </h1>
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-fg-muted">
        {content.body.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      <p className="mt-10">
        <Link href="/" className="inline-flex items-center text-sm text-accent hover:underline">
          ← {BRAND_NAME}
        </Link>
      </p>
    </article>
  );
}
