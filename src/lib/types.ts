import type { RichTextValue } from "@/lib/lexical";

export type Product = {
  id: string;
  sku?: string;
  slug: string;
  name: string;
  nameEn?: string;
  brand: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  description: RichTextValue | null;
  descriptionEn?: RichTextValue | null;
  detailSections?: { title: string; body: RichTextValue }[];
  faqs?: { question: string; answer: RichTextValue }[];
  price: number;
  currency: string;
  features: string[];
  featuresEn?: string[];
  inStock: boolean;
  stockQty: number;
  accent: string;
  image?: string;
  images?: string[];
  sourcePriceUah?: number | null;
  sourceUrl?: string | null;
  featuredOnHome?: boolean;
  featuredOrder?: number;
  detailSectionsEn?: { title: string; body: RichTextValue }[];
  faqsEn?: { question: string; answer: RichTextValue }[];
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "wrong_amount";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  accessToken: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    note?: string;
  };
  customerId?: number | string | null;
  trackingNumber?: string;
  carrier?: string;
  cryptomusInvoiceUuid?: string;
  cryptomusPaymentUrl?: string;
  createdAt: string;
  updatedAt: string;
};
