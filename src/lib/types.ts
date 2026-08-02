export type Product = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  brand: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  description: string;
  descriptionEn?: string;
  detailSections?: { title: string; body: string }[];
  faqs?: { question: string; answer: string }[];
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
  detailSectionsEn?: { title: string; body: string }[];
  faqsEn?: { question: string; answer: string }[];
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
