import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { FooterMarkets } from "@/components/FooterMarkets";
import { Header } from "@/components/Header";
import { ProductsProvider } from "@/components/ProductsProvider";
import {
  BRAND_DESCRIPTION_TR,
  BRAND_ICON_PATH,
  BRAND_NAME,
  siteUrl,
} from "@/lib/brand";
import { LocaleProvider } from "@/lib/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND_NAME,
  url: siteUrl(),
  description: BRAND_DESCRIPTION_TR,
  logo: `${siteUrl()}${BRAND_ICON_PATH}`,
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <div className="noir-shell flex min-h-full flex-col">
          <LocaleProvider>
            <AuthProvider>
              <ProductsProvider>
                <CartProvider>
                  <div className="relative z-[1] flex min-h-full flex-1 flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <FooterMarkets />
                    <Footer />
                  </div>
                </CartProvider>
              </ProductsProvider>
            </AuthProvider>
          </LocaleProvider>
        </div>
      </body>
    </html>
  );
}
