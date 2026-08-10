import type { CollectionConfig } from "payload";

const isAdmin = (req: { user?: { collection?: string } | null }) =>
  req.user?.collection === "users";

export const ProductReviews: CollectionConfig = {
  slug: "product-reviews",
  labels: {
    singular: "Ürün değerlendirmesi",
    plural: "Ürün değerlendirmeleri",
  },
  lockDocuments: false,
  admin: {
    useAsTitle: "authorName",
    defaultColumns: [
      "product",
      "rating",
      "authorName",
      "status",
      "source",
      "createdAt",
    ],
    group: "Mağaza",
    description:
      "Onaylı (approved) yorumlar sitede görünür. Kullanıcı yorumları pending gelir — buradan onayla.",
  },
  access: {
    read: ({ req }) => {
      if (isAdmin(req)) return true;
      return { status: { equals: "approved" } };
    },
    create: ({ req }) => isAdmin(req), // storefront create uses API + overrideAccess
    update: ({ req }) => isAdmin(req),
    delete: ({ req }) => isAdmin(req),
  },
  fields: [
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
      label: "Ürün",
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      label: "Puan (1–5)",
      admin: { step: 1 },
    },
    {
      name: "title",
      type: "text",
      label: "Başlık",
    },
    {
      name: "body",
      type: "textarea",
      required: true,
      label: "Yorum",
    },
    {
      name: "authorName",
      type: "text",
      required: true,
      label: "Görünen ad",
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      label: "Müşteri hesabı",
      admin: {
        position: "sidebar",
        description: "Boşsa seed / manuel yorum olabilir.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      options: [
        { label: "Beklemede", value: "pending" },
        { label: "Onaylı", value: "approved" },
        { label: "Reddedildi", value: "rejected" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "user",
      options: [
        { label: "Kullanıcı", value: "user" },
        { label: "Seed / manuel", value: "seed" },
      ],
      admin: {
        position: "sidebar",
        description: "Seed yorumlarda ‘satın aldı’ rozeti gösterilmez.",
      },
    },
    {
      name: "locale",
      type: "select",
      defaultValue: "tr",
      options: [
        { label: "TR", value: "tr" },
        { label: "EN", value: "en" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "verifiedPurchase",
      type: "checkbox",
      defaultValue: false,
      label: "Doğrulanmış satın alma",
      admin: { position: "sidebar" },
    },
  ],
};
