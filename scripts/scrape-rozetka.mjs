import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dumpsDir = join(root, "data", "rozetka-dumps");
const CATEGORY_URL =
  "https://rozetka.com.ua/ua/koshelki-dlya-kriptovalyut/c4647582/";

mkdirSync(dumpsDir, { recursive: true });

const collected = new Map();

function harvest(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  for (const item of items) {
    if (!item?.id || !item?.title) continue;
    if (item.category_id && item.category_id !== 4647582) continue;
    // Keep items that look like this category even without category_id
    if (!item.category_id && !String(item.href || "").includes("koshelki") && !item.title) {
      continue;
    }
    collected.set(String(item.id), item);
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
  }).catch(() =>
    chromium.launch({ headless: false })
  );

  const context = await browser.newContext({
    locale: "uk-UA",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  page.on("response", async (res) => {
    try {
      const url = res.url();
      if (!/rozetka\.com\.ua/.test(url)) return;
      if (!/details|goods\/get|goods\/search|catalog/.test(url)) return;
      if (res.status() !== 200) return;
      const ct = res.headers()["content-type"] || "";
      if (!ct.includes("json") && !ct.includes("javascript")) return;
      const json = await res.json().catch(() => null);
      if (json) harvest(json);
    } catch {
      /* ignore */
    }
  });

  console.log("Opening category…");
  await page.goto(CATEGORY_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(5000);

  // Age gate / cookie buttons if any
  for (const label of ["Так", "Так", "Accept", "Погоджуюсь", "Зрозуміло"]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.count()) {
      await btn.first().click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  // Try to discover total pages from pagination
  let maxPage = 1;
  const pageLinks = await page.locator("a[href*='page=']").all();
  for (const link of pageLinks) {
    const href = (await link.getAttribute("href")) || "";
    const m = href.match(/page=(\d+)/);
    if (m) maxPage = Math.max(maxPage, Number(m[1]));
  }
  // Also check text pagination
  const nums = await page.locator(".pagination a, [class*='pagination'] a, rz-paginator a").allTextContents().catch(() => []);
  for (const t of nums) {
    const n = Number(String(t).trim());
    if (Number.isFinite(n)) maxPage = Math.max(maxPage, n);
  }

  // Fallback: crawl until a page adds nothing new
  maxPage = Math.max(maxPage, 8);
  console.log(`Scanning up to page ${maxPage}…`);

  for (let p = 1; p <= maxPage; p++) {
    const before = collected.size;
    const url =
      p === 1 ? CATEGORY_URL : `${CATEGORY_URL}page=${p}/`;
    console.log(`→ ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 90000 }).catch(async () => {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    });
    await page.waitForTimeout(3500);
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1500);

    // Extract product ids from DOM links as backup
    const hrefs = await page.$$eval("a[href*='/p']", (as) =>
      as.map((a) => a.href).filter((h) => /\/p\d+\//.test(h))
    );
    const ids = [
      ...new Set(
        hrefs
          .map((h) => {
            const m = h.match(/\/p(\d+)\//);
            return m ? m[1] : null;
          })
          .filter(Boolean)
      ),
    ];

    if (ids.length) {
      // Fetch details in chunks via page.evaluate fetch (browser cookies)
      for (let i = 0; i < ids.length; i += 20) {
        const chunk = ids.slice(i, i + 20);
        const detailsUrl = `https://common-api.rozetka.com.ua/v2/goods/get-details?country=UA&lang=ua&ids=${chunk.join(",")}`;
        const altUrl = `https://common-api.rozetka.com.ua/v1/goods/details?country=UA&lang=ua&ids=${chunk.join(",")}`;
        for (const u of [detailsUrl, altUrl]) {
          const data = await page.evaluate(async (fetchUrl) => {
            try {
              const r = await fetch(fetchUrl, {
                credentials: "include",
                headers: { Accept: "application/json" },
              });
              if (!r.ok) return null;
              return await r.json();
            } catch {
              return null;
            }
          }, u);
          if (data) harvest(data);
        }
        await page.waitForTimeout(400);
      }
    }

    console.log(`  collected: ${collected.size} (+${collected.size - before})`);
    if (p > 1 && collected.size === before && ids.length === 0) {
      console.log("No new items — stopping.");
      break;
    }
  }

  const all = [...collected.values()];
  const outPath = join(dumpsDir, "all-scraped.json");
  writeFileSync(outPath, JSON.stringify({ data: all, errors: [] }, null, 2));
  console.log(`Saved ${all.length} products → ${outPath}`);

  await browser.close();

  const importResult = spawnSync(
    process.execPath,
    [join(root, "scripts", "import-rozetka.mjs"), outPath],
    { cwd: root, encoding: "utf-8" }
  );
  process.stdout.write(importResult.stdout || "");
  process.stderr.write(importResult.stderr || "");
  process.exit(importResult.status ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
