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
import { getSiteSettings } from "@/lib/site-settings";
// Must import here: root layout is pass-through (no <html>), so CSS must
// attach to this layout that actually renders the document shell.
import "../globals.css";

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

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await getSiteSettings();

  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        {/* Critical fallback if CSS chunk is briefly unavailable after deploy */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body{background:#0a0c10;color:#f4f1ea}body{margin:0}`,
          }}
        />
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
                    <Footer contact={contact} />
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
