import type { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  labels: {
    singular: "Müşteri",
    plural: "Müşteriler",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "city", "updatedAt"],
    group: "Mağaza",
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: (args: { token?: string } | undefined) => {
        const token = args?.token || "";
        const base =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
          "http://localhost:3000";
        const url = `${base}/sifre-yenile?token=${encodeURIComponent(token)}`;
        return `<p>NOIR şifre sıfırlama</p><p><a href="${url}">${url}</a></p>`;
      },
      generateEmailSubject: () => "NOIR şifre sıfırlama",
    },
  },
  access: {
    admin: () => false,
    create: () => true,
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === "users") return true;
      return { id: { equals: req.user.id } };
    },
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === "users") return true;
      return { id: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.collection === "users",
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Ad Soyad",
    },
    {
      name: "phone",
      type: "text",
      label: "Telefon",
    },
    {
      name: "city",
      type: "text",
      label: "Şehir",
    },
    {
      name: "district",
      type: "text",
      label: "İlçe",
    },
    {
      name: "address",
      type: "textarea",
      label: "Adres",
      admin: {
        description: "Mahalle, sokak, bina, daire — kargo teslimatı için.",
      },
    },
    {
      name: "postalCode",
      type: "text",
      label: "Posta kodu",
    },
  ],
};
