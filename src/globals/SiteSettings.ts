import type { GlobalConfig } from "payload";
import { textToLexical } from "@/lib/lexical";

const richHint =
  "Kalın yazı, liste ve link destekler. TR/EN için üstteki dil seçicisini kullanın.";

function paragraphsToLexical(...paragraphs: string[]) {
  return textToLexical(paragraphs.join("\n\n"));
}

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: {
    tr: "Site ayarları",
    en: "Site settings",
  },
  admin: {
    group: "Mağaza",
    description:
      "İletişim, adres ve yasal sayfa metinleri (Gizlilik, TOS, İade, KVKK). Sitede anında yansır.",
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "İletişim",
          fields: [
            {
              name: "companyLegalName",
              type: "text",
              label: "Yasal şirket adı",
              defaultValue: "Kriptostore LLC",
              required: true,
            },
            {
              name: "contactEmail",
              type: "email",
              label: "Destek e-postası",
              defaultValue: "support@kriptostore.com",
              required: true,
            },
            {
              name: "contactPhone",
              type: "text",
              label: "Telefon (opsiyonel)",
            },
            {
              name: "whatsapp",
              type: "text",
              label: "WhatsApp (opsiyonel)",
              admin: {
                description: "Uluslararası format, örn. +905xxxxxxxxx",
              },
            },
            {
              name: "supportHours",
              type: "text",
              label: "Destek saatleri",
              defaultValue: "Pzt–Cum 10:00–18:00 (TR)",
              localized: true,
            },
            {
              name: "contactPageTitle",
              type: "text",
              label: "İletişim sayfası başlığı",
              defaultValue: "İletişim",
              localized: true,
            },
            {
              name: "contactPageIntro",
              type: "textarea",
              label: "İletişim sayfası giriş metni",
              localized: true,
              defaultValue:
                "Sipariş, iade veya ürün sorularınız için formu doldurun ya da doğrudan e-posta / telefon ile yazın.",
            },
          ],
        },
        {
          label: "Adres",
          fields: [
            {
              name: "addressLine1",
              type: "text",
              label: "Adres satırı 1",
              defaultValue: "5830 E 2ND ST, STE 7000 #37465",
              required: true,
            },
            {
              name: "addressLine2",
              type: "text",
              label: "Adres satırı 2",
            },
            {
              name: "city",
              type: "text",
              label: "Şehir",
              defaultValue: "Casper",
              required: true,
            },
            {
              name: "state",
              type: "text",
              label: "Eyalet / bölge",
              defaultValue: "WY",
              required: true,
            },
            {
              name: "postalCode",
              type: "text",
              label: "Posta kodu",
              defaultValue: "82609",
              required: true,
            },
            {
              name: "country",
              type: "text",
              label: "Ülke",
              defaultValue: "United States",
              required: true,
            },
          ],
        },
        {
          label: "Gizlilik (Privacy)",
          fields: [
            {
              name: "privacyTitle",
              type: "text",
              label: "Başlık",
              localized: true,
              defaultValue: "Gizlilik politikası (Privacy Policy)",
            },
            {
              name: "privacyBody",
              type: "richText",
              label: "Metin",
              localized: true,
              admin: { description: richHint },
              defaultValue: paragraphsToLexical(
                "Kriptostore olarak sipariş ve hesap verilerinizi yalnızca siparişinizin işlenmesi, kargo, destek ve yasal yükümlülükler için kullanırız.",
                "Ödeme Cryptomus üzerinden gerçekleşir; kart veya cüzdan özel anahtarlarınız bizde tutulmaz.",
                "Verileriniz güvenli sunucularda saklanır; üçüncü taraflarla pazarlama amacıyla paylaşılmaz.",
                "Haklarınız ve talepleriniz için iletişim sayfamızdaki e-posta veya formu kullanabilirsiniz."
              ),
            },
          ],
        },
        {
          label: "TOS (Şartlar)",
          fields: [
            {
              name: "termsTitle",
              type: "text",
              label: "Başlık",
              localized: true,
              defaultValue: "Kullanım / hizmet şartları (Terms of Service)",
            },
            {
              name: "termsBody",
              type: "richText",
              label: "Metin",
              localized: true,
              admin: { description: richHint },
              defaultValue: paragraphsToLexical(
                "Site üzerinden verilen siparişler Cryptomus faturası oluşturulduğunda rezervasyon sayılır; ödeme onayından sonra kesinleşir.",
                "Ürünler orijinal donanım cüzdanlarıdır; fiyatlar TRY cinsinden listelenir, ödeme kripto ile alınır.",
                "Yanlış tutar veya iptal durumlarında sipariş durumu güncellenir; stok iadesi ödeme durumuna göre yönetilir.",
                "Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız. Uyuşmazlıklarda öncelikle destek kanalımızla iletişime geçin."
              ),
            },
          ],
        },
        {
          label: "İade (Refund)",
          fields: [
            {
              name: "returnsTitle",
              type: "text",
              label: "Başlık",
              localized: true,
              defaultValue: "İade politikası (Refund Policy)",
            },
            {
              name: "returnsBody",
              type: "richText",
              label: "Metin",
              localized: true,
              admin: { description: richHint },
              defaultValue: paragraphsToLexical(
                "Ödeme tamamlanmadan iptal edilen Cryptomus faturalarında sipariş iptal durumuna geçer; ödeme alınmamışsa ücret iadesi gerekmez.",
                "Açılmamış, mühürlü donanım ürünlerinde yasal cayma hakkı kapsamında iade talepleri değerlendirilir.",
                "Açılmış veya aktive edilmiş cihazlarda güvenlik nedeniyle iade kısıtlı olabilir.",
                "İade talepleri için sipariş numaranız ve e-postanız ile iletişim formunu veya destek e-postasını kullanın. Onaylanan iadeler Cryptomus / ödeme kanalı üzerinden işlenir."
              ),
            },
          ],
        },
        {
          label: "Kargo (Shipping)",
          fields: [
            {
              name: "shippingTitle",
              type: "text",
              label: "Başlık",
              localized: true,
              defaultValue: "Kargo politikası (Shipping Policy)",
            },
            {
              name: "shippingBody",
              type: "richText",
              label: "Metin",
              localized: true,
              admin: { description: richHint },
              defaultValue: paragraphsToLexical(
                "Ödeme Cryptomus ile onaylandıktan sonra sipariş hazırlanır ve Türkiye içi kargo süreci başlar.",
                "Kargo ücretsizdir (aksi ürün sayfasında belirtilmedikçe). Teslimat süresi stoğa ve şehirlere göre genelde birkaç iş günü içinde başlar.",
                "Yurtdışı teslimat özel talep ile değerlendirilir; standart vitrin satışı Türkiye teslimatına göredir.",
                "Takip numarası e-posta ile iletilir. Adres hatalarından doğan gecikmeler için destek kanalımızla iletişime geçin."
              ),
            },
          ],
        },
        {
          label: "KVKK",
          fields: [
            {
              name: "kvkkTitle",
              type: "text",
              label: "Başlık",
              localized: true,
              defaultValue: "KVKK bilgilendirme",
            },
            {
              name: "kvkkBody",
              type: "richText",
              label: "Metin",
              localized: true,
              admin: { description: richHint },
              defaultValue: paragraphsToLexical(
                "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; ad, e-posta, telefon ve teslimat adresi sipariş süreçleri için işlenir.",
                "Amaç: sözleşme ifası, müşteri desteği ve yasal zorunluluklar.",
                "Haklarınız: erişim, düzeltme, silme ve itiraz. Taleplerinizi destek e-postası veya iletişim formu ile iletebilirsiniz.",
                "Saklama süresi: sipariş ve muhasebe yükümlülükleri süresince; ardından silinir veya anonimleştirilir."
              ),
            },
          ],
        },
        {
          label: "Ürün kaynağı",
          fields: [
            {
              name: "productOrigin",
              type: "textarea",
              label: "Ürün kaynağı (Cryptomus)",
              localized: true,
              defaultValue:
                "Satılan ürünler orijinal donanım kripto cüzdanlarıdır (Ledger, Trezor, SafePal vb.); yetkili dağıtım kanallarından temin edilip Türkiye’ye perakende satılır.",
              admin: {
                description:
                  "Yasal sayfalarda ve moderasyon metninde gösterilir.",
              },
            },
          ],
        },
      ],
    },
  ],
};
