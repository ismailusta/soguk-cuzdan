import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { BRAND_NAME, siteUrl } from "@/lib/brand";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };
  const description =
    product.shortDescription ||
    `${product.name} — ${product.brand} donanım cüzdanı. ${BRAND_NAME}'da satılır.`;
  const url = `${siteUrl()}/urun/${product.slug}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} · ${BRAND_NAME}`,
      description,
      url,
      type: "website",
      images: product.image ? [{ url: product.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · ${BRAND_NAME}`,
      description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.brand, product.id, 8);

  return <ProductDetail product={product} related={related} />;
}

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}
