import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { getActiveHeroBanners } from "@/lib/hero";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banners, products] = await Promise.all([
    getActiveHeroBanners(),
    getProducts(),
  ]);

  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const grid = products.slice(0, 24);

  return (
    <>
      <Hero banners={banners} />
      <HomeSections products={grid} brands={brands} />
    </>
  );
}
