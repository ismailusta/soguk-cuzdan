import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";
import { getPayloadClient } from "@/lib/payload";

const site = siteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/urunler",
    "/iletisim",
    "/contact",
    "/giris",
    "/gizlilik",
    "/privacy",
    "/kullanim-kosullari",
    "/terms",
    "/iade",
    "/refund",
    "/kvkk",
  ].map((path) => ({
    url: `${site}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/urunler" ? "daily" : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/urunler" || path === "/iletisim"
          ? 0.8
          : 0.6,
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
