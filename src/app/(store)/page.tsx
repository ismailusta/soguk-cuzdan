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
      {/* Pull hero under transparent fixed navbar */}
      <div className="-mt-[64px] md:-mt-[72px]">
        <Hero banners={banners} />
      </div>
      {/* Category strip stays strictly below the hero */}
      <HomeSections products={grid} brands={brands} />
    </>
  );
}
