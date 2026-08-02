/**
 * Restock all out-of-stock products to qty 10.
 * Usage: npx tsx scripts/restock-oos.ts
 */
import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";

async function main() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "products",
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  });

  let updated = 0;
  for (const doc of result.docs) {
    const qty = typeof doc.stockQty === "number" ? doc.stockQty : 0;
    const oos = !doc.inStock || qty <= 0;
    if (!oos) continue;

    await payload.update({
      collection: "products",
      id: doc.id,
      data: {
        stockQty: 10,
        inStock: true,
      },
      overrideAccess: true,
    });
    updated++;
    console.log(`  restocked ${doc.slug}`);
  }

  console.log(`\nDone. updated=${updated} total=${result.docs.length}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
