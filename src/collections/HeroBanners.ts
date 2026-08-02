import type { CollectionConfig } from "payload";

export const HeroBanners: CollectionConfig = {
  slug: "hero-banners",
  labels: {
    singular: "Hero Banner",
    plural: "Hero Bannerlar",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "active", "order", "layout", "updatedAt"],
    group: "Mağaza",
    description:
      "Anasayfa hero slide’ları. Başlıkta Enter ile satır kır. Sıra: küçük sayı önce.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      label: "Aktif",
      admin: { position: "sidebar" },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "Sıra",
      admin: {
        position: "sidebar",
        description: "Küçük sayı önce gösterilir.",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "İçerik",
          fields: [
            {
              name: "title",
              type: "textarea",
              required: true,
              localized: true,
              label: "Başlık",
              admin: {
                description:
                  "Her satır Enter ile kırılır. Örn:\nLEDGER\nSTAX",
              },
            },
            {
              name: "subtitle",
              type: "textarea",
              localized: true,
              label: "Alt metin",
            },
            {
              name: "badge",
              type: "text",
              localized: true,
              label: "Rozet metni",
              admin: { description: "Boş bırakılırsa rozet gösterilmez." },
            },
            {
              name: "badgeTone",
              type: "select",
              defaultValue: "success",
              options: [
                { label: "Accent", value: "accent" },
                { label: "Success", value: "success" },
                { label: "Danger", value: "danger" },
                { label: "Muted", value: "muted" },
              ],
              label: "Rozet rengi",
            },
            {
              type: "row",
              fields: [
                {
                  name: "ctaLabel",
                  type: "text",
                  localized: true,
                  label: "CTA metni",
                  admin: { width: "50%" },
                },
                {
                  name: "ctaHref",
                  type: "text",
                  label: "CTA link",
                  admin: {
                    width: "50%",
                    description:
                      "Boşsa ürün seçiliyse /urun/slug, değilse /urunler",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "secondaryLabel",
                  type: "text",
                  localized: true,
                  label: "İkinci link metni",
                  admin: { width: "50%" },
                },
                {
                  name: "secondaryHref",
                  type: "text",
                  label: "İkinci link",
                  admin: { width: "50%" },
                },
              ],
            },
          ],
        },
        {
          label: "Görsel",
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              label: "Banner görseli",
            },
            {
              name: "imageUrl",
              type: "text",
              label: "Harici görsel URL",
              admin: {
                description: "Upload yoksa kullanılır.",
              },
            },
            {
              name: "product",
              type: "relationship",
              relationTo: "products",
              label: "Ürün (opsiyonel)",
              admin: {
                description:
                  "Görsel / fiyat / CTA link için yedek. Serbest alanlar önceliklidir.",
              },
            },
            {
              name: "showPrice",
              type: "checkbox",
              defaultValue: true,
              label: "Fiyatı göster (ürün seçiliyse)",
            },
          ],
        },
        {
          label: "Düzen & stil",
          fields: [
            {
              name: "layout",
              type: "select",
              required: true,
              defaultValue: "textOverlay",
              options: [
                {
                  label: "Full banner (ortalı — önerilen)",
                  value: "textOverlay",
                },
                { label: "Metin sol hiza (yine full banner)", value: "textLeft" },
                { label: "Metin sağ hiza (yine full banner)", value: "textRight" },
              ],
              label: "Düzen",
              admin: {
                description:
                  "Tüm slide’lar full-bleed arka plan + üstünde metin. Bu alan sadece hizayı etkiler.",
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "titleSize",
                  type: "select",
                  defaultValue: "xl",
                  options: [
                    { label: "Küçük (sm)", value: "sm" },
                    { label: "Orta (md)", value: "md" },
                    { label: "Büyük (lg)", value: "lg" },
                    { label: "Çok büyük (xl)", value: "xl" },
                  ],
                  label: "Başlık boyutu",
                  admin: { width: "33%" },
                },
                {
                  name: "subtitleSize",
                  type: "select",
                  defaultValue: "md",
                  options: [
                    { label: "Küçük", value: "sm" },
                    { label: "Orta", value: "md" },
                    { label: "Büyük", value: "lg" },
                  ],
                  label: "Alt metin boyutu",
                  admin: { width: "33%" },
                },
                {
                  name: "titleAlign",
                  type: "select",
                  defaultValue: "left",
                  options: [
                    { label: "Sol", value: "left" },
                    { label: "Orta", value: "center" },
                  ],
                  label: "Başlık hizası",
                  admin: { width: "33%" },
                },
              ],
            },
            {
              name: "titleUppercase",
              type: "checkbox",
              defaultValue: true,
              label: "Başlık büyük harf",
            },
            {
              type: "row",
              fields: [
                {
                  name: "gradientFrom",
                  type: "text",
                  label: "Gradient başlangıç",
                  admin: {
                    width: "50%",
                    description: "hex veya oklch. Boş = varsayılan Kriptostore teması",
                    placeholder: "oklch(0.16 0.02 260)",
                  },
                },
                {
                  name: "gradientTo",
                  type: "text",
                  label: "Gradient bitiş",
                  admin: {
                    width: "50%",
                    placeholder: "oklch(0.14 0.04 300)",
                  },
                },
              ],
            },
            {
              name: "accentGlow",
              type: "checkbox",
              defaultValue: true,
              label: "Accent ışıltı",
            },
          ],
        },
      ],
    },
  ],
};
