import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { readFileSync } from "fs";
import path from "path";
import { textToLexical } from "../src/lib/lexical";

type SeedProduct = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  brand: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  currency: string;
  features?: string[];
  featuresEn?: string[];
  inStock?: boolean;
  accent?: string;
  image?: string;
  images?: string[];
  sourcePriceUah?: number | null;
  sourceUrl?: string | null;
};

async function main() {
  const payload = await getPayload({ config });
  const file = path.join(process.cwd(), "data", "products.json");
  const products = JSON.parse(readFileSync(file, "utf-8")) as SeedProduct[];

  let upserted = 0;
  for (const p of products) {
    const shared = {
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      currency: p.currency || "TRY",
      inStock: p.inStock !== false,
      stockQty: p.inStock === false ? 0 : 25,
      accent: p.accent || "#9aa4b2",
      imageUrl: p.image,
      images: p.images || [],
      sourcePriceUah: p.sourcePriceUah ?? undefined,
      sourceUrl: p.sourceUrl ?? undefined,
    };

    const existing = await payload.find({
      collection: "products",
      where: { slug: { equals: p.slug } },
      limit: 1,
      overrideAccess: true,
      locale: "tr",
    });

    const id = existing.docs[0]?.id;

    if (id) {
      await payload.update({
        collection: "products",
        id,
        locale: "tr",
        data: {
          ...shared,
          name: p.name,
          shortDescription: p.shortDescription,
          description: textToLexical(p.description),
          features: p.features || [],
        },
        overrideAccess: true,
      });
    } else {
      const created = await payload.create({
        collection: "products",
        locale: "tr",
        data: {
          ...shared,
          name: p.name,
          shortDescription: p.shortDescription,
          description: textToLexical(p.description),
          features: p.features || [],
        },
        overrideAccess: true,
      });
      await payload.update({
        collection: "products",
        id: created.id,
        locale: "en",
        data: {
          name: p.nameEn || p.name,
          shortDescription: p.shortDescriptionEn || p.shortDescription,
          description: textToLexical(p.descriptionEn || p.description),
          features: p.featuresEn || p.features || [],
        },
        overrideAccess: true,
      });
      upserted += 1;
      if (upserted % 50 === 0) console.log(`… ${upserted}/${products.length}`);
      continue;
    }

    await payload.update({
      collection: "products",
      id,
      locale: "en",
      data: {
        name: p.nameEn || p.name,
        shortDescription: p.shortDescriptionEn || p.shortDescription,
        description: textToLexical(p.descriptionEn || p.description),
        features: p.featuresEn || p.features || [],
      },
      overrideAccess: true,
    });

    upserted += 1;
    if (upserted % 50 === 0) {
      console.log(`… ${upserted}/${products.length}`);
    }
  }

  console.log(`Seed tamam: ${upserted} ürün (tr + en)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
