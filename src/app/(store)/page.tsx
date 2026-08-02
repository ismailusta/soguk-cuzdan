import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { getFeaturedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProducts(12);
  return (
    <>
      <Hero featured={featured} />
      <HomeSections featured={featured} />
    </>
  );
}
