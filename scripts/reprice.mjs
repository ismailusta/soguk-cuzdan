import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pricing = JSON.parse(readFileSync(join(root, "data", "pricing.json"), "utf-8"));
const products = JSON.parse(readFileSync(join(root, "data", "products.json"), "utf-8"));

const { usdToTry, uahToUsd } = pricing;

for (const p of products) {
  const uah = Number(p.sourcePriceUah) || 0;
  if (uah > 0) {
    const usd = uah / uahToUsd;
    p.price = Math.max(100, Math.round(usd * usdToTry));
  }
}

writeFileSync(join(root, "data", "products.json"), JSON.stringify(products, null, 2) + "\n");
console.log(
  `Repriced ${products.length} products: TRY = (UAH / ${uahToUsd}) × ${usdToTry}`
);
