/**
 * Seed fake approved product reviews (TR + EN), 4–5★, product-aware copy.
 *
 *   $env:APPLY=1; $env:REPLACE=1; $env:PER_PRODUCT=5; npx tsx scripts/seed-product-reviews.ts
 */
import "dotenv/config";
import pg from "pg";
import { getPayload } from "payload";
import config from "../src/payload.config";

const NAMES_TR = [
  "Ahmet Yılmaz",
  "Elif Demir",
  "Mert Kaya",
  "Zeynep Arslan",
  "Can Öztürk",
  "Selin Aydın",
  "Emre Çelik",
  "Deniz Şahin",
  "Burak Koç",
  "Ayşe Yıldız",
  "Onur Polat",
  "Ceren Aksoy",
  "Barış Erdoğan",
  "Melis Kurt",
  "Hakan Doğan",
  "İrem Güneş",
  "Serkan Avcı",
  "Gizem Taş",
  "Tolga Acar",
  "Pınar Bulut",
  "Kerem Özkan",
  "Derya Çakır",
  "Oğuz Karaca",
  "Seda Uçar",
  "Volkan Tekin",
];

const NAMES_EN = [
  "James Carter",
  "Emma Walsh",
  "Liam Brooks",
  "Olivia Reed",
  "Noah Bennett",
  "Sophia Hayes",
  "Ethan Cole",
  "Mia Turner",
  "Lucas Grant",
  "Ava Morgan",
  "Henry Blake",
  "Chloe Price",
  "Jack Foster",
  "Lily Hughes",
  "Owen Parker",
];

const RATINGS = [5, 5, 4, 5, 4] as const;

function shortName(full: string): string {
  const t = full.replace(/\s+/g, " ").trim();
  if (t.length <= 42) return t;
  return `${t.slice(0, 39).trim()}…`;
}

function bodiesTr(name: string, brand: string): string[] {
  const n = shortName(name);
  const b = brand?.trim() || "cihaz";
  return [
    `${n} elime geçti, kutu mühürlüydü. ${b} tarafı orijinal hissettirdi; kurulumu da sorunsuz yaptım.`,
    `Uzun zamandır ${n} bakıyordum, sonunda aldım. Günlük kullanımda rahat, ekranı/okuma net.`,
    `${n} için fiyat makul geldi. Cryptomus ile ödedim, kargo Türkiye’ye hızlı çıktı.`,
    `İlk cold wallet deneyimim ${n} oldu. Seed’i offline tutmak içimi rahatlattı, tavsiye ederim.`,
    `${b} ${n} paketlemesi sağlamdı, çizik yok. Destek de sorularıma net cevap verdi.`,
    `Arkadaşıma da ${n} önerdim. Benimki 4 günde geldi, kurulum videosuna gerek kalmadı.`,
    `${n} stoğu vardı, hemen sipariş ettim. Ödeme ve teslimat pürüzsüz geçti.`,
    `Beklediğim gibi ${n}: sağlam his, net menü. Soğuk cüzdan arayanlara uygun.`,
  ];
}

function titlesTr(name: string): string[] {
  const n = shortName(name);
  return [
    `${n} memnuniyeti`,
    "Orijinal ve hızlı kargo",
    "Kurulum kolaydı",
    "Tavsiye ederim",
    "İyi aldım",
  ];
}

function bodiesEn(name: string, brand: string): string[] {
  const n = shortName(name);
  const b = brand?.trim() || "device";
  return [
    `Got my ${n} — sealed box, felt genuine ${b}. Setup was straightforward.`,
    `Had my eye on the ${n} for a while. Comfortable daily use, clear screen/readout.`,
    `Fair price for the ${n}. Paid via Cryptomus; shipping to Turkey was quick.`,
    `First cold wallet was the ${n}. Keeping the seed offline finally felt right.`,
    `${b} ${n} packing was solid, no scratches. Support answered clearly.`,
    `Recommended the ${n} to a friend. Mine arrived in a few days, no fuss.`,
    `${n} was in stock so I ordered right away. Payment and delivery were smooth.`,
    `Exactly what I wanted from ${n}: solid build, clear menus. Good cold storage pick.`,
  ];
}

function titlesEn(name: string): string[] {
  const n = shortName(name);
  return [
    `Happy with ${n}`,
    "Genuine & fast shipping",
    "Easy setup",
    "Would recommend",
    "Solid buy",
  ];
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

async function deleteAllSeedSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const res = await client.query(
    `DELETE FROM product_reviews WHERE source = 'seed'`
  );
  await client.end();
  return res.rowCount ?? 0;
}

type SeedRow = {
  product_id: number;
  rating: number;
  title: string;
  body: string;
  author_name: string;
  locale: "tr" | "en";
};

async function insertSeedRows(rows: SeedRow[]) {
  if (!rows.length) return 0;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const chunk = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += chunk) {
    const part = rows.slice(i, i + chunk);
    const values: unknown[] = [];
    const placeholders: string[] = [];
    part.forEach((r, j) => {
      const o = j * 6;
      placeholders.push(
        `($${o + 1}::integer, $${o + 2}::numeric, $${o + 3}::varchar, $${o + 4}::varchar, $${o + 5}::varchar, 'approved'::enum_product_reviews_status, 'seed'::enum_product_reviews_source, $${o + 6}::enum_product_reviews_locale, false, now(), now())`
      );
      values.push(
        r.product_id,
        r.rating,
        r.title,
        r.body,
        r.author_name,
        r.locale
      );
    });
    await client.query(
      `INSERT INTO product_reviews
        (product_id, rating, title, body, author_name, status, source, locale, verified_purchase, updated_at, created_at)
       VALUES ${placeholders.join(",")}`,
      values
    );
    inserted += part.length;
  }

  await client.end();
  return inserted;
}

async function main() {
  process.env.NODE_ENV ||= "development";
  const apply = process.env.APPLY === "1" || process.argv.includes("--apply");
  const replace =
    process.env.REPLACE === "1" || process.argv.includes("--replace");
  const perProduct = Math.min(
    10,
    Math.max(1, Number(process.env.PER_PRODUCT || 5) || 5)
  );
  const maxProducts = Math.min(
    500,
    Math.max(1, Number(process.env.MAX_PRODUCTS || 500) || 500)
  );

  const payload = await getPayload({ config });

  if (replace && apply) {
    const n = await deleteAllSeedSql();
    console.log(`Deleted ${n} old seed reviews.`);
  }

  const products = await payload.find({
    collection: "products",
    limit: maxProducts,
    pagination: false,
    sort: "id",
    depth: 0,
    overrideAccess: true,
  });

  console.log(
    `${apply ? "APPLY" : "DRY-RUN"} · ${products.docs.length} products · ${perProduct} TR + ${perProduct} EN (4–5★)`
  );

  const rows: SeedRow[] = [];

  for (const [pi, product] of products.docs.entries()) {
    const nameTr = String(product.name || product.slug || "Ürün");
    const nameEn = String(
      (product as { nameEn?: string | null }).nameEn || nameTr
    );
    const brand = String(product.brand || "");
    const productId = Number(product.id);

    for (const locale of ["tr", "en"] as const) {
      const name = locale === "en" ? nameEn : nameTr;
      const bodyPool =
        locale === "en" ? bodiesEn(name, brand) : bodiesTr(name, brand);
      const titlePool =
        locale === "en" ? titlesEn(name) : titlesTr(name);
      const names = locale === "en" ? NAMES_EN : NAMES_TR;

      for (let i = 0; i < perProduct; i++) {
        const idx = pi * 11 + i * 5 + (locale === "en" ? 3 : 0);
        rows.push({
          product_id: productId,
          rating: RATINGS[i % RATINGS.length]!,
          title: pick(titlePool, idx),
          body: pick(bodyPool, idx + 1),
          author_name: pick(names, idx + 2),
          locale,
        });
      }
    }
  }

  if (!apply) {
    console.log(`Would create ${rows.length} reviews`);
    console.log("TR sample:", rows.find((r) => r.locale === "tr")?.body);
    console.log("EN sample:", rows.find((r) => r.locale === "en")?.body);
    console.log("Re-run with APPLY=1 REPLACE=1 to write.");
    process.exit(0);
  }

  // If not replace, skip products that already have enough seed per locale
  let toInsert = rows;
  if (!replace) {
    const existing = await payload.find({
      collection: "product-reviews",
      where: { source: { equals: "seed" } },
      limit: 10000,
      depth: 0,
      overrideAccess: true,
      pagination: false,
    });
    const counts = new Map<string, number>();
    for (const d of existing.docs) {
      const pid =
        typeof d.product === "object" && d.product
          ? d.product.id
          : d.product;
      const key = `${pid}:${d.locale || "tr"}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    toInsert = rows.filter((r) => {
      const key = `${r.product_id}:${r.locale}`;
      const have = counts.get(key) || 0;
      if (have >= perProduct) return false;
      counts.set(key, have + 1);
      return true;
    });
  }

  const created = await insertSeedRows(toInsert);
  console.log(`Created ${created} reviews (TR+EN).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
