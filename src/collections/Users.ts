import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Yönetici",
    plural: "Yöneticiler",
  },
  admin: {
    useAsTitle: "email",
    group: "Sistem",
  },
  auth: true,
  access: {
    admin: ({ req }) => Boolean(req.user && req.user.collection === "users"),
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
