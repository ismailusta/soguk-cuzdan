import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const productsPath = join(root, "data", "products.json");
const dumpsDir = join(root, "data", "rozetka-dumps");

const USD_TO_TRY = 42;
const CATEGORY_ID = 4647582;

const brandAccent = {
  Ledger: "#8a9ba8",
  Trezor: "#00b0a6",
  SafePal: "#4c8dff",
  OneKey: "#44d62c",
  OneKeyElectro: "#44d62c",
  ELLIPAL: "#d4af37",
  Ellipal: "#d4af37",
  Keystone: "#ff6b35",
  CoolBitX: "#5b8def",
  CoolWallet: "#5b8def",
  Blockstream: "#00c49a",
  Coinkite: "#f7931a",
  Coldcard: "#5cbf6a",
  Lapua: "#c9a227",
  Tron: "#9aa4b2",
  Stamp: "#b8a07e",
  "Stamp Seed": "#b8a07e",
  Btcwallet: "#f7931a",
  CryptoTag: "#c45c26",
  NAI: "#9aa4b2",
  Binance: "#f0b90b",
  Ethereum: "#627eea",
  Bitcoin: "#f7931a",
};

const JUNK_RE =
  /пиво|tuborg|dyson|sodimm|навушник|підставка для телефона|a\.pods|оперативна пам|пилесос|пилосос|вакуум/i;

function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function translateTitle(title) {
  return title
    .replace(/^Апаратний крипто\s*-?\s*гаманець\s*/i, "")
    .replace(/^Апаратний гаманець для криптовалют\s*/i, "")
    .replace(/^Апаратний гаманець\s*/i, "")
    .replace(/^Крипто-?\s*гаманець\s*/i, "")
    .replace(/^Чохол\s*/i, "Kılıf ")
    .replace(/^Захисний чохол\s*/i, "Kılıf ")
    .replace(/^Картка для резервної копії\s*/i, "Yedek kart ")
    .replace(/^Резервна картка\s*/i, "Yedek kart ")
    .replace(/^Резервне NFC сховище\s*/i, "NFC yedek ")
    .replace(/^Мнемонічний планшет\s*/i, "Seed tablet ")
    .replace(/^Мнемоническая пластина\s*/i, "Seed plaka ")
    .replace(/^Металлическая пластина\s*/i, "Seed plaka ")
    .replace(/^Металлические пластины\s*/i, "Metal plaka ")
    .replace(/^Металеві пластини\s*/i, "Metal plaka ")
    .replace(/^Металева капсула\s*/i, "Metal kapsül ")
    .replace(/^Книжка для сід-фраз\s*/i, "Seed kitap ")
    .replace(/^Гравірувальна ручка\s*/i, "Gravür kalemi ")
    .trim();
}

function normalizeBrand(brand, title) {
  const t = title.toLowerCase();
  if (!brand || brand === "Без бренду") {
    if (t.includes("ledger")) return "Ledger";
    if (t.includes("trezor")) return "Trezor";
    if (t.includes("safepal")) return "SafePal";
    if (t.includes("onekey")) return "OneKey";
    if (t.includes("ellipal")) return "ELLIPAL";
    if (t.includes("keystone")) return "Keystone";
    if (t.includes("coolwallet") || t.includes("coolbitx")) return "CoolWallet";
    if (t.includes("blockstream") || t.includes("jade")) return "Blockstream";
    if (t.includes("coldcard") || t.includes("opendime") || t.includes("coinkite"))
      return "Coinkite";
    if (t.includes("lapua")) return "Lapua";
    if (t.includes("btcwallet")) return "Btcwallet";
    if (t.includes("stamp seed")) return "Stamp Seed";
    if (t.includes("cryptotag")) return "CryptoTag";
    if (t.includes("billfodl")) return "Ledger";
    return "Aksesuar";
  }
  if (brand === "OneKeyElectro") return "OneKey";
  if (brand === "CoolBitX") return "CoolWallet";
  return brand;
}

function quality(item) {
  let s = 0;
  if (Number(item.price) > 0 || Number(item.price_pcs) > 0) s += 3;
  if (item.images?.main) s += 2;
  if (item.brand) s += 1;
  if (item.href) s += 1;
  return s;
}

function isUsable(item) {
  if (!item?.id || !item?.title) return false;
  if (JUNK_RE.test(item.title)) return false;
  if (item.category_id && item.category_id !== CATEGORY_ID) return false;
  const uah = Number(item.price) || 0;
  const usd = Number(item.price_pcs) || 0;
  if (uah <= 0 && usd <= 0) return false;
  return true;
}

function toProduct(item) {
  const brand = normalizeBrand(item.brand, item.title);
  const name = translateTitle(item.title) || item.title;
  const usd =
    Number(item.price_pcs) > 0
      ? Number(item.price_pcs)
      : Number(item.price) / 45;
  const price = Math.max(100, Math.round(usd * USD_TO_TRY));
  const image = item.images?.main || item.images?.all?.[0] || "";
  const images = (item.images?.all || []).filter(Boolean);
  const accent = brandAccent[brand] || "#9aa4b2";
  const inStock =
    item.sell_status === "available" ||
    item.status === "active" ||
    item.sell_status == null;

  return {
    id: String(item.id),
    slug: slugify(`${brand}-${name}`) || `urun-${item.id}`,
    name,
    brand,
    shortDescription: `${brand} — soğuk cüzdan / aksesuar.`,
    description: `${name}. Rozetka kategorisinden aktarıldı. TRY fiyat ≈ USD×${USD_TO_TRY}; kendi maliyetine göre güncelle.`,
    price,
    currency: "TRY",
    features: ["Soğuk cüzdan kategorisi", brand, inStock ? "Stokta" : "Stok belirsiz"],
    inStock,
    accent,
    image,
    images: images.length ? images : image ? [image] : [],
    sourcePriceUah: item.price || null,
    sourceUrl: item.href || null,
  };
}

function loadDump(filePath) {
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  throw new Error(`Geçersiz dump: ${filePath}`);
}

function main() {
  const existing = existsSync(productsPath)
    ? JSON.parse(readFileSync(productsPath, "utf-8"))
    : [];
  const byId = new Map(existing.map((p) => [p.id, p]));
  // track source quality for upgrades
  const qById = new Map(existing.map((p) => [p.id, p.image ? 5 : 1]));

  const args = process.argv.slice(2);
  let files =
    args.length > 0
      ? args
      : existsSync(dumpsDir)
        ? readdirSync(dumpsDir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => join(dumpsDir, f))
        : [];

  // Prefer all-rozetka.json last so it wins upgrades
  files.sort((a, b) => {
    const ap = a.includes("all-rozetka") ? 1 : 0;
    const bp = b.includes("all-rozetka") ? 1 : 0;
    return ap - bp;
  });

  if (files.length === 0) {
    console.error("Dump yok. data/rozetka-dumps/*.json koy.");
    process.exit(1);
  }

  let added = 0;
  let updated = 0;
  let skippedJunk = 0;
  let skippedNoPrice = 0;

  for (const file of files) {
    const items = loadDump(file);
    console.log("→", file, items.length);
    for (const item of items) {
      if (!item?.id) continue;
      if (JUNK_RE.test(item.title || "")) {
        skippedJunk++;
        continue;
      }
      if (item.category_id && item.category_id !== CATEGORY_ID) {
        skippedJunk++;
        continue;
      }
      if (!isUsable(item)) {
        skippedNoPrice++;
        continue;
      }

      const id = String(item.id);
      const q = quality(item);
      const product = toProduct(item);

      if (!byId.has(id)) {
        byId.set(id, product);
        qById.set(id, q);
        added++;
        continue;
      }

      if (q > (qById.get(id) || 0)) {
        byId.set(id, product);
        qById.set(id, q);
        updated++;
      }
    }
  }

  // unique slugs
  const seenSlug = new Set();
  for (const p of byId.values()) {
    let s = p.slug;
    let i = 2;
    while (seenSlug.has(s)) {
      s = `${p.slug}-${i++}`;
    }
    p.slug = s;
    seenSlug.add(s);
  }

  const products = [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );
  writeFileSync(productsPath, JSON.stringify(products, null, 2) + "\n");
  console.log(
    `OK: +${added} yeni, ${updated} güncellendi, ${skippedNoPrice} fiyatsız atlandı, ${skippedJunk} çöp atlandı. Toplam: ${products.length}`
  );
}

main();
