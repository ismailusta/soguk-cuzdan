import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    defaultColumns: [
      "name",
      "brand",
      "price",
      "stockQty",
      "inStock",
      "featuredOnHome",
      "updatedAt",
    ],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      label: "Ad",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "brand",
      type: "text",
      required: true,
      index: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "shortDescription",
      type: "textarea",
      required: true,
      localized: true,
      label: "Kısa açıklama",
    },
    {
      name: "description",
      type: "richText",
      required: true,
      localized: true,
      label: "Açıklama",
      admin: {
        description: "Kalın yazı, liste ve link destekler (Lexical).",
      },
    },
    {
      name: "detailSections",
      type: "array",
      label: "Detay bölümleri",
      labels: { singular: "Bölüm", plural: "Bölümler" },
      localized: true,
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Başlık",
          defaultValue: "Cihaz hakkında",
          admin: {
            description:
              "Sitede bölüm başlığı olur. Varsayılan: Cihaz hakkında",
          },
        },
        {
          name: "body",
          type: "richText",
          required: true,
          label: "Detay",
          admin: {
            description:
              "Kalın yazı, liste, link. Sitede başlığın altında çıkar.",
          },
        },
      ],
      admin: {
        initCollapsed: false,
        description:
          "Her bölüm: Başlık + Detay. TR/EN için üstteki dil seçicisini kullan.",
      },
    },
    {
      name: "faqs",
      type: "array",
      label: "Ürün SSS",
      labels: { singular: "Soru", plural: "Sorular" },
      localized: true,
      fields: [
        { name: "question", type: "text", required: true, label: "Soru" },
        {
          name: "answer",
          type: "richText",
          required: true,
          label: "Cevap",
        },
      ],
    },
    {
      name: "features",
      type: "text",
      hasMany: true,
      localized: true,
      label: "Özellikler",
    },
    {
      name: "price",
      type: "number",
      required: true,
      min: 0,
      label: "Fiyat (kuruşsuz TRY)",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "currency",
      type: "text",
      required: true,
      defaultValue: "TRY",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "stockQty",
      type: "number",
      required: true,
      defaultValue: 10,
      min: 0,
      label: "Stok adedi",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "inStock",
      type: "checkbox",
      defaultValue: true,
      label: "Stokta (görünür)",
      admin: {
        position: "sidebar",
        description: "false ise satışa kapalı. stockQty 0 olunca otomatik kapanır.",
      },
    },
    {
      name: "featuredOnHome",
      type: "checkbox",
      defaultValue: false,
      label: "Anasayfada göster",
      admin: {
        position: "sidebar",
        description: "İşaretlenen ürünler anasayfa vitrininde çıkar.",
      },
    },
    {
      name: "featuredOrder",
      type: "number",
      defaultValue: 0,
      label: "Vitrin sırası",
      admin: {
        position: "sidebar",
        description: "Küçük sayı önce gösterilir.",
        condition: (_, siblingData) => Boolean(siblingData?.featuredOnHome),
      },
    },
    {
      name: "accent",
      type: "text",
      defaultValue: "#9aa4b2",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Kapak görseli",
    },
    {
      name: "gallery",
      type: "array",
      label: "Galeri",
      labels: { singular: "Görsel", plural: "Görseller" },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
      admin: {
        description: "Kapak dışındaki ek ürün görselleri (Media’ya yüklenmiş).",
      },
    },
    {
      name: "imageUrl",
      type: "text",
      label: "Harici görsel URL",
      admin: {
        description: "Upload yoksa kullanılır (eski Rozetka URL’leri).",
      },
    },
    {
      name: "images",
      type: "text",
      hasMany: true,
      label: "Ek görsel URL’leri (harici)",
    },
    {
      name: "sourcePriceUah",
      type: "number",
      label: "Kaynak fiyat (UAH)",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "sourceUrl",
      type: "text",
      label: "Kaynak URL",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
