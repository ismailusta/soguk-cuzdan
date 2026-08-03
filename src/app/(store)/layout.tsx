import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { FooterMarkets } from "@/components/FooterMarkets";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { ProductsProvider } from "@/components/ProductsProvider";
import { LocaleProvider } from "@/lib/i18n";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

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
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Analytics />
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
