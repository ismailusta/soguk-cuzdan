import type { MetadataRoute } from "next";
import { getPayloadClient } from "@/lib/payload";

const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/urunler",
    "/giris",
    "/gizlilik",
    "/kullanim-kosullari",
    "/iade",
    "/kvkk",
  ].map((path) => ({
    url: `${site}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/urunler" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const payload = await getPayloadClient();
    const products = await payload.find({
      collection: "products",
      limit: 500,
      depth: 0,
      overrideAccess: true,
    });

    const productRoutes: MetadataRoute.Sitemap = products.docs.map((p) => ({
      url: `${site}/urun/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
