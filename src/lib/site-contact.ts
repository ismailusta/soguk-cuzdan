import { textToLexical, type RichTextValue } from "@/lib/lexical";

export type LocalePair = { tr: string; en: string };
export type RichLocalePair = { tr: RichTextValue; en: RichTextValue };

export type LegalPageContent = {
  title: LocalePair;
  body: RichLocalePair;
};

export type SiteContact = {
  companyLegalName: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  supportHours: LocalePair;
  contactPageTitle: LocalePair;
  contactPageIntro: LocalePair;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  productOrigin: LocalePair;
  privacy: LegalPageContent;
  terms: LegalPageContent;
  returns: LegalPageContent;
  kvkk: LegalPageContent;
};

function pair(tr: string, en: string): LocalePair {
  return { tr, en };
}

function richPair(tr: string, en: string): RichLocalePair {
  return { tr: textToLexical(tr), en: textToLexical(en) };
}

function legal(
  titleTr: string,
  titleEn: string,
  bodyTr: string,
  bodyEn: string
): LegalPageContent {
  return {
    title: pair(titleTr, titleEn),
    body: richPair(bodyTr, bodyEn),
  };
}

const privacyTr = [
  "Kriptostore olarak sipariş ve hesap verilerinizi yalnızca siparişinizin işlenmesi, kargo, destek ve yasal yükümlülükler için kullanırız.",
  "Ödeme Cryptomus üzerinden gerçekleşir; kart veya cüzdan özel anahtarlarınız bizde tutulmaz.",
  "Verileriniz güvenli sunucularda saklanır; üçüncü taraflarla pazarlama amacıyla paylaşılmaz.",
  "Haklarınız ve talepleriniz için iletişim sayfamızdaki e-posta veya formu kullanabilirsiniz.",
].join("\n\n");

const privacyEn = [
  "Kriptostore uses your order and account data only to process orders, shipping, support, and legal obligations.",
  "Payments run via Cryptomus; we never store card details or your crypto private keys.",
  "Data is stored securely and is not sold for marketing.",
  "For privacy requests, use the email or contact form on our Contact page.",
].join("\n\n");

const termsTr = [
  "Site üzerinden verilen siparişler Cryptomus faturası oluşturulduğunda rezervasyon sayılır; ödeme onayından sonra kesinleşir.",
  "Ürünler orijinal donanım cüzdanlarıdır; fiyatlar TRY cinsinden listelenir, ödeme kripto ile alınır.",
  "Yanlış tutar veya iptal durumlarında sipariş durumu güncellenir; stok iadesi ödeme durumuna göre yönetilir.",
  "Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız. Uyuşmazlıklarda öncelikle destek kanalımızla iletişime geçin.",
].join("\n\n");

const termsEn = [
  "Orders are reserved when a Cryptomus invoice is created and confirmed after payment.",
  "Products are genuine hardware wallets; prices are listed in TRY and paid in crypto.",
  "Wrong-amount or cancelled payments update order status; stock is managed accordingly.",
  "By using the site you accept these terms. Contact support first for any dispute.",
].join("\n\n");

const returnsTr = [
  "Ödeme tamamlanmadan iptal edilen Cryptomus faturalarında sipariş iptal durumuna geçer; ödeme alınmamışsa ücret iadesi gerekmez.",
  "Açılmamış, mühürlü donanım ürünlerinde yasal cayma hakkı kapsamında iade talepleri değerlendirilir.",
  "Açılmış veya aktive edilmiş cihazlarda güvenlik nedeniyle iade kısıtlı olabilir.",
  "İade talepleri için sipariş numaranız ve e-postanız ile iletişim formunu veya destek e-postasını kullanın. Onaylanan iadeler Cryptomus / ödeme kanalı üzerinden işlenir.",
].join("\n\n");

const returnsEn = [
  "Unpaid Cryptomus invoices move the order to cancelled; no refund is due if no payment was received.",
  "Unopened sealed hardware may be returnable under applicable cooling-off rules.",
  "Opened or activated devices may have limited return options for security reasons.",
  "Request returns via the contact form or support email with your order ID. Approved refunds are processed via Cryptomus / the payment channel.",
].join("\n\n");

const kvkkTr = [
  "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; ad, e-posta, telefon ve teslimat adresi sipariş süreçleri için işlenir.",
  "Amaç: sözleşme ifası, müşteri desteği ve yasal zorunluluklar.",
  "Haklarınız: erişim, düzeltme, silme ve itiraz. Taleplerinizi destek e-postası veya iletişim formu ile iletebilirsiniz.",
  "Saklama süresi: sipariş ve muhasebe yükümlülükleri süresince; ardından silinir veya anonimleştirilir.",
].join("\n\n");

const kvkkEn = [
  "Under Turkish KVKK, name, email, phone and shipping address are processed for order fulfillment.",
  "Purpose: contract performance, customer support and legal duties.",
  "Your rights include access, correction, deletion and objection via support email or the contact form.",
  "Retention follows order/accounting obligations, then deletion or anonymization.",
].join("\n\n");

export const DEFAULT_SITE_CONTACT: SiteContact = {
  companyLegalName: "Kriptostore LLC",
  contactEmail: "support@kriptostore.com",
  contactPhone: "",
  whatsapp: "",
  supportHours: pair("Pzt–Cum 10:00–18:00 (TR)", "Mon–Fri 10:00–18:00 (TR)"),
  contactPageTitle: pair("İletişim", "Contact"),
  contactPageIntro: pair(
    "Sipariş, iade veya ürün sorularınız için formu doldurun ya da doğrudan e-posta / telefon ile yazın.",
    "For orders, returns or product questions, use the form or email / phone us directly."
  ),
  addressLine1: "5830 E 2ND ST, STE 7000 #37465",
  addressLine2: "",
  city: "Casper",
  state: "WY",
  postalCode: "82609",
  country: "United States",
  productOrigin: pair(
    "Satılan ürünler orijinal donanım kripto cüzdanlarıdır (Ledger, Trezor, SafePal vb.); yetkili dağıtım kanallarından temin edilip Türkiye’ye perakende satılır.",
    "Products are genuine hardware crypto wallets (Ledger, Trezor, SafePal, etc.), sourced via authorized channels and sold retail in Turkey."
  ),
  privacy: legal(
    "Gizlilik politikası (Privacy Policy)",
    "Privacy Policy",
    privacyTr,
    privacyEn
  ),
  terms: legal(
    "Kullanım / hizmet şartları (Terms of Service)",
    "Terms of Service",
    termsTr,
    termsEn
  ),
  returns: legal(
    "İade politikası (Refund Policy)",
    "Refund Policy",
    returnsTr,
    returnsEn
  ),
  kvkk: legal("KVKK bilgilendirme", "Privacy notice (KVKK)", kvkkTr, kvkkEn),
};

export function pickLocale(
  value: LocalePair | string | undefined,
  locale: "tr" | "en"
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.tr || value.en || "";
}

export function pickRichLocale(
  value: RichLocalePair | RichTextValue | undefined,
  locale: "tr" | "en"
): RichTextValue | null {
  if (!value) return null;
  if ("root" in value) return value as RichTextValue;
  return value[locale] || value.tr || value.en || null;
}

/** @deprecated Prefer RichText component; kept for plain-string fallbacks */
export function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function formatAddress(c: SiteContact): string {
  const lines = [
    c.addressLine1,
    c.addressLine2,
    [c.city, c.state, c.postalCode].filter(Boolean).join(", "),
    c.country,
  ].filter(Boolean);
  return lines.join("\n");
}

export function formatAddressOneLine(c: SiteContact): string {
  return formatAddress(c).replace(/\n/g, ", ");
}
