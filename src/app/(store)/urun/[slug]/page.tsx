import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProductDetail } from "@/components/ProductDetail";
import { BRAND_NAME, siteUrl } from "@/lib/brand";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/products";
import {
  getApprovedReviewsForProduct,
} from "@/lib/reviews";
import { faqJsonLd, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı", robots: { index: false } };
  const description =
    product.shortDescription ||
    `${product.name} — ${product.brand} donanım cüzdanı. ${BRAND_NAME}'da satılır.`;
  const url = `${siteUrl()}/urun/${product.slug}`;
  const images = product.image
    ? [{ url: product.image, alt: product.name }]
    : undefined;
  return {
    title: product.name,
    description,
    keywords: [
      product.name,
      product.brand,
      "hardware wallet",
      "soğuk cüzdan",
      BRAND_NAME,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} · ${BRAND_NAME}`,
      description,
      url,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · ${BRAND_NAME}`,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.brand, product.id, 8);
  const reviews = await getApprovedReviewsForProduct(product.id);
  const faq = faqJsonLd(product.faqs ?? []);

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      {faq ? <JsonLd data={faq} /> : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", path: "/" },
          { name: "Ürünler", path: "/urunler" },
          { name: product.name, path: `/urun/${product.slug}` },
        ])}
      />
      <ProductDetail
        product={product}
        related={related}
        reviews={reviews}
      />
    </>
  );
}

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}
