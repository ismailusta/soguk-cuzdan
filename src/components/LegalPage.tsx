"use client";

import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { useLocale } from "@/lib/i18n";
import type { SiteContact } from "@/lib/site-contact";
import { formatAddressOneLine } from "@/lib/site-contact";

type LegalKey = "privacy" | "terms" | "returns" | "kvkk";

const copy: Record<
  LegalKey,
  { tr: { title: string; body: string[] }; en: { title: string; body: string[] } }
> = {
  privacy: {
    tr: {
      title: "Gizlilik politikası (Privacy Policy)",
      body: [
        "Kriptostore olarak sipariş ve hesap verilerinizi yalnızca siparişinizin işlenmesi, kargo, destek ve yasal yükümlülükler için kullanırız.",
        "Ödeme Cryptomus üzerinden gerçekleşir; kart veya cüzdan özel anahtarlarınız bizde tutulmaz.",
        "Verileriniz güvenli sunucularda saklanır; üçüncü taraflarla pazarlama amacıyla paylaşılmaz.",
        "Haklarınız ve talepleriniz için iletişim sayfamızdaki e-posta veya formu kullanabilirsiniz.",
      ],
    },
    en: {
      title: "Privacy Policy",
      body: [
        "Kriptostore uses your order and account data only to process orders, shipping, support, and legal obligations.",
        "Payments run via Cryptomus; we never store card details or your crypto private keys.",
        "Data is stored securely and is not sold for marketing.",
        "For privacy requests, use the email or contact form on our Contact page.",
      ],
    },
  },
  terms: {
    tr: {
      title: "Kullanım / hizmet şartları (Terms of Service)",
      body: [
        "Site üzerinden verilen siparişler Cryptomus faturası oluşturulduğunda rezervasyon sayılır; ödeme onayından sonra kesinleşir.",
        "Ürünler orijinal donanım cüzdanlarıdır; fiyatlar TRY cinsinden listelenir, ödeme kripto ile alınır.",
        "Yanlış tutar veya iptal durumlarında sipariş durumu güncellenir; stok iadesi ödeme durumuna göre yönetilir.",
        "Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız. Uyuşmazlıklarda öncelikle destek kanalımızla iletişime geçin.",
      ],
    },
    en: {
      title: "Terms of Service",
      body: [
        "Orders are reserved when a Cryptomus invoice is created and confirmed after payment.",
        "Products are genuine hardware wallets; prices are listed in TRY and paid in crypto.",
        "Wrong-amount or cancelled payments update order status; stock is managed accordingly.",
        "By using the site you accept these terms. Contact support first for any dispute.",
      ],
    },
  },
  returns: {
    tr: {
      title: "İade politikası (Refund Policy)",
      body: [
        "Ödeme tamamlanmadan iptal edilen Cryptomus faturalarında sipariş iptal durumuna geçer; ödeme alınmamışsa ücret iadesi gerekmez.",
        "Açılmamış, mühürlü donanım ürünlerinde yasal cayma hakkı kapsamında iade talepleri değerlendirilir.",
        "Açılmış veya aktive edilmiş cihazlarda güvenlik nedeniyle iade kısıtlı olabilir.",
        "İade talepleri için sipariş numaranız ve e-postanız ile iletişim formunu veya destek e-postasını kullanın. Onaylanan iadeler Cryptomus / ödeme kanalı üzerinden işlenir.",
      ],
    },
    en: {
      title: "Refund Policy",
      body: [
        "Unpaid Cryptomus invoices move the order to cancelled; no refund is due if no payment was received.",
        "Unopened sealed hardware may be returnable under applicable cooling-off rules.",
        "Opened or activated devices may have limited return options for security reasons.",
        "Request returns via the contact form or support email with your order ID. Approved refunds are processed via Cryptomus / the payment channel.",
      ],
    },
  },
  kvkk: {
    tr: {
      title: "KVKK bilgilendirme",
      body: [
        "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; ad, e-posta, telefon ve teslimat adresi sipariş süreçleri için işlenir.",
        "Amaç: sözleşme ifası, müşteri desteği ve yasal zorunluluklar.",
        "Haklarınız: erişim, düzeltme, silme ve itiraz. Taleplerinizi destek e-postası veya iletişim formu ile iletebilirsiniz.",
        "Saklama süresi: sipariş ve muhasebe yükümlülükleri süresince; ardından silinir veya anonimleştirilir.",
      ],
    },
    en: {
      title: "Privacy notice (KVKK)",
      body: [
        "Under Turkish KVKK, name, email, phone and shipping address are processed for order fulfillment.",
        "Purpose: contract performance, customer support and legal duties.",
        "Your rights include access, correction, deletion and objection via support email or the contact form.",
        "Retention follows order/accounting obligations, then deletion or anonymization.",
      ],
    },
  },
};

export function LegalPage({
  kind,
  contact,
}: {
  kind: LegalKey;
  contact: SiteContact;
}) {
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
        {contact.productOrigin ? (
          <p>
            <strong className="text-fg">
              {locale === "en" ? "Product origin: " : "Ürün kaynağı: "}
            </strong>
            {contact.productOrigin}
          </p>
        ) : null}
      </div>

      <div className="mt-10 rounded-xl border border-line bg-bg-elevated/40 p-5 text-sm leading-relaxed text-fg-muted">
        <p className="text-xs tracking-wider text-fg-faint uppercase">
          {locale === "en" ? "Merchant / contact" : "Satıcı / iletişim"}
        </p>
        <p className="mt-2 font-medium text-fg">{contact.companyLegalName}</p>
        <p className="mt-1">{formatAddressOneLine(contact)}</p>
        <p className="mt-2">
          <a
            href={`mailto:${contact.contactEmail}`}
            className="text-accent hover:underline"
          >
            {contact.contactEmail}
          </a>
          {contact.contactPhone ? (
            <>
              {" · "}
              <a
                href={`tel:${contact.contactPhone.replace(/\s/g, "")}`}
                className="text-accent hover:underline"
              >
                {contact.contactPhone}
              </a>
            </>
          ) : null}
        </p>
        <p className="mt-3">
          <Link href="/iletisim" className="text-accent hover:underline">
            {locale === "en" ? "Contact form →" : "İletişim formu →"}
          </Link>
        </p>
      </div>

      <p className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-accent hover:underline"
        >
          ← {BRAND_NAME}
        </Link>
      </p>
    </article>
  );
}
