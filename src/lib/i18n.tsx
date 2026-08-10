"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { RichTextValue } from "@/lib/lexical";

export type Locale = "tr" | "en";

const dict = {
  tr: {
    brandTag: "TR · Hardware",
    products: "Ürünler",
    cart: "Sepet",
    catalog: "Katalog",
    shop: "Mağaza",
    legal: "Yasal",
    payment: "Ödeme",
    navHome: "Anasayfa",
    navProducts: "Ürün",
    navPay: "Ödeme",
    navContact: "İletişim",
    navAccount: "Hesap",
    navSignIn: "Giriş Yap",
    search: "Ara",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    allProducts: "Tüm ürünler",
    viewAll: "Tümünü gör →",
    selected: "Seçili modeller",
    browseCatalog: "Kataloğa bak",
    whyTitle: "Neden soğuk cüzdan?",
    whyBody:
      "Private key'leriniz internete çıkmaz. Exchange riski ve hot wallet tehditlerine karşı fiziksel güvenlik.",
    why1t: "Çevrimdışı imza",
    why1d: "İşlemler cihazda onaylanır; seed phrase sizde kalır.",
    why2t: "Kripto ödeme",
    why2d: "Cryptomus ile USDT, BTC, ETH ve diğerleriyle ödeyin.",
    why3t: "Türkiye teslimatı",
    why3d: "Sipariş sonrası iletişim bilgilerinize göre kargolanır.",
    security: "Güvenlik",
    heroEyebrow: "Cold storage · Türkiye",
    heroBody:
      "Anahtarlarınız çevrimdışı kalsın. Ledger, Trezor, SafePal ve daha fazlası — ödeme tamamen kripto ile.",
    ctaCatalog: "Kataloğu incele",
    ctaWhy: "Neden soğuk cüzdan?",
    heroChip1: "Orijinal ürün garantisi",
    heroChip2: "Kripto ile ödeme",
    heroChip3: "Türkiye'ye hızlı teslimat",
    footerBlurb:
      "Türkiye'ye donanım cüzdanları. Ödemeler Cryptomus üzerinden kripto ile alınır.",
    footerPay: "Ödeme · USDT / BTC / ETH",
    footerCopy: "Anahtarlarınız sizde kalır",
    footerMarkets: "Kripto piyasası",
    outOfStock: "Stok yok",
    addToCart: "Sepete ekle",
    added: "Sepete eklendi",
    backCatalog: "← Katalog",
    yourCart: "Sepetiniz",
    emptyCart: "Sepetiniz boş.",
    goProducts: "Ürünlere git",
    remove: "Sil",
    total: "Toplam",
    checkout: "Ödemeye geç",
    checkoutTitle: "Teslimat & kripto",
    checkoutBody:
      "Formu doldurun; Cryptomus ödeme sayfasına yönlendirileceksiniz.",
    name: "Ad Soyad",
    email: "E-posta",
    phone: "Telefon",
    city: "Şehir",
    address: "Adres",
    note: "Not (opsiyonel)",
    payCrypto: "Kripto ile öde",
    paying: "Cryptomus açılıyor…",
    orderSummary: "Sipariş özeti",
    filterAll: "Tümü",
    inStock: "Stokta",
    productCount: "ürün",
    noMatch: "Bu filtreye uygun ürün yok.",
    searchPlaceholder: "Ürün, marka veya model ara…",
    searchInBrand: "içinde ara",
    searchAll: "Tüm ürünlerde ara",
    catalogLead:
      "Donanım cüzdanları. Fiyatlar TRY; ödeme Cryptomus ile kripto üzerinden.",
    buyNow: "Satın al",
    categories: "Kategoriler",
    filter: "Filtre",
    privacy: "Gizlilik",
    terms: "Kullanım koşulları",
    returns: "İade & iptal",
    kvkk: "KVKK",
    contactFormLink: "İletişim formu",
    contactName: "Adınız",
    contactEmail: "E-posta",
    contactSubject: "Konu",
    contactMessage: "Mesajınız",
    contactSend: "Gönder",
    contactSending: "Gönderiliyor…",
    forgotPassword: "Şifremi unuttum",
    resetPassword: "Şifre sıfırla",
    sendReset: "Sıfırlama bağlantısı gönder",
    newPassword: "Yeni şifre",
    account: "Hesabım",
    myOrders: "Siparişlerim",
    signOut: "Çıkış",
    noOrders: "Henüz sipariş yok.",
    shippingAddress: "Teslimat adresi",
    save: "Kaydet",
    authTitle: "Varlıklarınıza layık bir güvenlik.",
    authBody: "Kriptostore hesabınızla siparişlerinizi takip edin, profilinizi yönetin.",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    reviewsTitle: "Değerlendirmeler",
    reviewsCount: "değerlendirme",
    reviewsEmpty: "Henüz değerlendirme yok.",
    reviewWrite: "Değerlendirme yaz",
    reviewLoginRequired: "Yorum yazmak için giriş yapın.",
    reviewNeedPurchase:
      "Yalnızca bu ürünü satın almış hesaplar değerlendirme yazabilir.",
    reviewAlready: "Bu ürün için değerlendirmeniz alındı veya yayınlandı.",
    reviewRating: "Puan",
    reviewTitleOptional: "Başlık (isteğe bağlı)",
    reviewBody: "Yorumunuz",
    reviewSubmit: "Gönder",
    reviewSending: "Gönderiliyor…",
    reviewPending: "Değerlendirmeniz alındı; onay sonrası yayınlanır.",
    reviewError: "Değerlendirme gönderilemedi.",
    reviewVerified: "Satın aldı",
  },
  en: {
    brandTag: "EN · Hardware",
    products: "Products",
    cart: "Cart",
    catalog: "Catalog",
    shop: "Shop",
    legal: "Legal",
    payment: "Payment",
    navHome: "Home",
    navProducts: "Shop",
    navPay: "Pay",
    navContact: "Contact",
    navAccount: "Account",
    navSignIn: "Sign in",
    search: "Search",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    allProducts: "All products",
    viewAll: "View all →",
    selected: "Featured",
    browseCatalog: "Browse catalog",
    whyTitle: "Why a cold wallet?",
    whyBody:
      "Your private keys stay offline. Physical security against exchange risk and hot-wallet threats.",
    why1t: "Offline signing",
    why1d: "Transactions are approved on-device; you keep the seed phrase.",
    why2t: "Crypto payments",
    why2d: "Pay with USDT, BTC, ETH and more via Cryptomus.",
    why3t: "Delivery in Turkey",
    why3d: "We ship after checkout using your contact details.",
    security: "Security",
    heroEyebrow: "Cold storage · Turkey",
    heroBody:
      "Keep your keys offline. Ledger, Trezor, SafePal and more — pay fully in crypto.",
    ctaCatalog: "Browse catalog",
    ctaWhy: "Why cold wallet?",
    heroChip1: "Genuine product guarantee",
    heroChip2: "Pay with crypto",
    heroChip3: "Fast delivery in Turkey",
    footerBlurb:
      "Hardware wallets for Turkey. Payments accepted in crypto via Cryptomus.",
    footerPay: "Pay · USDT / BTC / ETH",
    footerCopy: "Your keys stay yours",
    footerMarkets: "Crypto markets",
    outOfStock: "Out of stock",
    addToCart: "Add to cart",
    added: "Added",
    backCatalog: "← Catalog",
    yourCart: "Your cart",
    emptyCart: "Your cart is empty.",
    goProducts: "Browse products",
    remove: "Remove",
    total: "Total",
    checkout: "Checkout",
    checkoutTitle: "Shipping & crypto",
    checkoutBody: "Fill the form; you'll be redirected to Cryptomus.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    city: "City",
    address: "Address",
    note: "Note (optional)",
    payCrypto: "Pay with crypto",
    paying: "Opening Cryptomus…",
    orderSummary: "Order summary",
    filterAll: "All",
    inStock: "In stock",
    productCount: "products",
    noMatch: "No products match this filter.",
    searchPlaceholder: "Search product, brand or model…",
    searchInBrand: "search in",
    searchAll: "Search all products",
    catalogLead:
      "Hardware wallets. Prices in TRY; pay with crypto via Cryptomus.",
    buyNow: "Buy now",
    categories: "Categories",
    filter: "Filter",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    returns: "Refund Policy",
    kvkk: "Privacy notice",
    contactFormLink: "Contact form",
    contactName: "Your name",
    contactEmail: "Email",
    contactSubject: "Subject",
    contactMessage: "Message",
    contactSend: "Send",
    contactSending: "Sending…",
    forgotPassword: "Forgot password",
    resetPassword: "Reset password",
    sendReset: "Send reset link",
    newPassword: "New password",
    account: "My account",
    myOrders: "My orders",
    signOut: "Sign out",
    noOrders: "No orders yet.",
    shippingAddress: "Shipping address",
    save: "Save",
    authTitle: "Security worthy of your assets.",
    authBody: "Track orders and manage your profile with a Kriptostore account.",
    signIn: "Sign in",
    signUp: "Sign up",
    reviewsTitle: "Reviews",
    reviewsCount: "reviews",
    reviewsEmpty: "No reviews yet.",
    reviewWrite: "Write a review",
    reviewLoginRequired: "Sign in to leave a review.",
    reviewNeedPurchase: "Only customers who bought this product can review it.",
    reviewAlready: "You already submitted a review for this product.",
    reviewRating: "Rating",
    reviewTitleOptional: "Title (optional)",
    reviewBody: "Your review",
    reviewSubmit: "Submit",
    reviewSending: "Sending…",
    reviewPending: "Thanks — your review will appear after approval.",
    reviewError: "Could not submit review.",
    reviewVerified: "Verified purchase",
  },
} as const;

type Dict = (typeof dict)[Locale];

type LocaleCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
};

const Ctx = createContext<LocaleCtx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    const saved = localStorage.getItem("sc-locale");
    if (saved === "tr" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("sc-locale", l);
    document.documentElement.lang = l;
  };

  return (
    <Ctx.Provider value={{ locale, setLocale, t: dict[locale] }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale needs LocaleProvider");
  return ctx;
}

export function productName(
  p: { name: string; nameEn?: string },
  locale: Locale
) {
  return locale === "en" && p.nameEn ? p.nameEn : p.name;
}

export function productShort(
  p: { shortDescription: string; shortDescriptionEn?: string },
  locale: Locale
) {
  return locale === "en" && p.shortDescriptionEn
    ? p.shortDescriptionEn
    : p.shortDescription;
}

export function productDesc(
  p: {
    description: RichTextValue | null;
    descriptionEn?: RichTextValue | null;
  },
  locale: Locale
) {
  return locale === "en" && p.descriptionEn ? p.descriptionEn : p.description;
}
