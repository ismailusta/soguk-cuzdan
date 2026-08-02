import type { CollectionAfterChangeHook, CollectionConfig } from "payload";
import { sendOrderShippedEmail } from "@/lib/mail";
import type { Order, OrderStatus } from "@/lib/types";

const isAdmin = (req: { user?: { collection?: string } | null }) =>
  req.user?.collection === "users";

const afterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  if (operation !== "update") return doc;
  if (doc.status !== "shipped" || previousDoc?.status === "shipped") return doc;

  const customerRel = doc.customer;
  const customerId =
    typeof customerRel === "object" && customerRel
      ? customerRel.id
      : customerRel ?? null;

  const order: Order = {
    id: doc.orderNumber,
    accessToken: doc.accessToken,
    status: doc.status as OrderStatus,
    total: doc.total,
    currency: doc.currency,
    customer: {
      name: doc.customerName,
      email: doc.customerEmail,
      phone: doc.customerPhone,
      address: doc.customerAddress,
      city: doc.customerCity,
      note: doc.customerNote ?? undefined,
    },
    customerId,
    trackingNumber: doc.trackingNumber ?? undefined,
    carrier: doc.carrier ?? undefined,
    cryptomusInvoiceUuid: doc.cryptomusInvoiceUuid ?? undefined,
    cryptomusPaymentUrl: doc.cryptomusPaymentUrl ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    items: (doc.items || []).map(
      (item: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
      }) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })
    ),
  };

  try {
    await sendOrderShippedEmail(order);
  } catch (err) {
    console.error("[orders] shipped email", err);
  }

  return doc;
};

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: [
      "orderNumber",
      "status",
      "total",
      "customerEmail",
      "trackingNumber",
      "createdAt",
    ],
    group: "Mağaza",
  },
  access: {
    read: ({ req }) => {
      if (isAdmin(req)) return true;
      if (req.user?.collection === "customers") {
        return { customerEmail: { equals: req.user.email } };
      }
      return false;
    },
    create: () => false,
    update: ({ req }) => isAdmin(req),
    delete: ({ req }) => isAdmin(req),
  },
  hooks: {
    afterChange: [afterChange],
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: "accessToken",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: "Sipariş sayfası erişim token’ı (URL ?t=)",
      },
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      label: "Müşteri hesabı",
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Beklemede", value: "pending" },
        { label: "Ödendi", value: "paid" },
        { label: "Kargoda", value: "shipped" },
        { label: "Teslim edildi", value: "delivered" },
        { label: "İptal", value: "cancelled" },
        { label: "Yanlış tutar", value: "wrong_amount" },
      ],
      index: true,
    },
    {
      name: "total",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "currency",
      type: "text",
      required: true,
      defaultValue: "TRY",
    },
    {
      name: "customerName",
      type: "text",
      required: true,
      label: "Müşteri adı",
    },
    {
      name: "customerEmail",
      type: "email",
      required: true,
      index: true,
      label: "E-posta",
    },
    {
      name: "customerPhone",
      type: "text",
      required: true,
      label: "Telefon",
    },
    {
      name: "customerAddress",
      type: "textarea",
      required: true,
      label: "Adres",
    },
    {
      name: "customerCity",
      type: "text",
      required: true,
      label: "Şehir",
    },
    {
      name: "customerNote",
      type: "textarea",
      label: "Not",
    },
    {
      name: "trackingNumber",
      type: "text",
      label: "Kargo takip no",
      admin: { position: "sidebar" },
    },
    {
      name: "carrier",
      type: "text",
      label: "Kargo firması",
      admin: { position: "sidebar" },
    },
    {
      name: "cryptomusInvoiceUuid",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "cryptomusPaymentUrl",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "items",
      type: "array",
      required: true,
      labels: { singular: "Kalem", plural: "Kalemler" },
      fields: [
        { name: "productId", type: "text", required: true },
        { name: "name", type: "text", required: true },
        { name: "price", type: "number", required: true },
        { name: "quantity", type: "number", required: true, min: 1 },
      ],
    },
  ],
};
