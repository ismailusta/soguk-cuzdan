import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: {
    tr: "Site ayarları",
    en: "Site settings",
  },
  admin: {
    group: "Mağaza",
    description:
      "İletişim, şirket adresi ve destek bilgileri. Cryptomus / yasal sayfalar buradan beslenir.",
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
              admin: {
                description: "Sitede ve iletişim formunda görünür.",
              },
            },
            {
              name: "contactPhone",
              type: "text",
              label: "Telefon (opsiyonel)",
              admin: {
                description: "Boş bırakılırsa sitede gösterilmez.",
              },
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
          label: "Ürün / diğer",
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
                  "Moderasyon / yasal metinlerde ürün menşei açıklaması.",
              },
            },
          ],
        },
      ],
    },
  ],
};
