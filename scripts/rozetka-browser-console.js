/**
 * KULLANIM (Cloudflare geçilmiş kategori sayfasında):
 * 1) F12 → Console → bu dosyanın tamamını yapıştır → Enter
 * 2) Alttaki sayfa numaralarına tıkla: 1, 2, 3… (hepsine)
 * 3) Console'da yaz:   downloadRozetka()
 * 4) all-rozetka.json iner → data/rozetka-dumps/ içine koy
 * 5) npm run import:rozetka
 */
(() => {
  const byId = new Map();
  const CATEGORY = 4647582;

  function put(item) {
    if (!item?.id || !item?.title) return;
    // kategori dışı çöpleri ele (RAM, bira vs.)
    if (item.category_id && item.category_id !== CATEGORY) return;
    byId.set(String(item.id), item);
    console.log("✓", byId.size, item.title?.slice(0, 60));
  }

  function harvest(payload) {
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    for (const item of items) put(item);
  }

  // Sayfanın kendi fetch'ini dinle (doğru details URL neyse onu yakalar)
  const _fetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const res = await _fetch(...args);
    try {
      const url = String(typeof args[0] === "string" ? args[0] : args[0]?.url || "");
      if (/common-api\.rozetka\.com\.ua|catalog-api|xl-catalog-api/i.test(url)) {
        const clone = res.clone();
        const ct = clone.headers.get("content-type") || "";
        if (res.ok && ct.includes("json")) {
          clone.json().then(harvest).catch(() => {});
        }
      }
    } catch {}
    return res;
  };

  // XHR de dinle
  const _open = XMLHttpRequest.prototype.open;
  const _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__rzUrl = url;
    return _open.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener("load", function () {
      try {
        const url = String(this.__rzUrl || "");
        if (
          /common-api\.rozetka\.com\.ua|catalog-api|xl-catalog-api/i.test(url) &&
          this.status === 200
        ) {
          const ct = this.getResponseHeader("content-type") || "";
          if (ct.includes("json") || typeof this.response === "object") {
            const data =
              typeof this.response === "object" && this.response
                ? this.response
                : JSON.parse(this.responseText);
            harvest(data);
          }
        }
      } catch {}
    });
    return _send.apply(this, args);
  };

  // Şu anki DOM kartları
  function scrapeDom() {
    document.querySelectorAll("a[href*='/p']").forEach((a) => {
      const m = (a.href || "").match(/\/p(\d+)\//);
      if (!m) return;
      const id = m[1];
      if (byId.has(id)) return;
      const root =
        a.closest("[class*='tile'], [class*='goods'], li, article") || a.parentElement;
      const title = (a.textContent || "").replace(/\s+/g, " ").trim();
      if (title.length < 5) return;
      const priceText =
        root?.querySelector?.("[class*='price']")?.textContent || "";
      const price = Number(String(priceText).replace(/[^\d]/g, "")) || 0;
      const img = root?.querySelector?.("img")?.src || "";
      put({
        id: Number(id),
        href: a.href,
        title,
        brand: null,
        price,
        price_pcs: price ? +(price / 45).toFixed(2) : 0,
        images: { main: img, all: img ? [img] : [] },
        category_id: CATEGORY,
        sell_status: "available",
        status: "active",
      });
    });
  }

  scrapeDom();
  // SPA güncellemelerinde tekrar tara
  const mo = new MutationObserver(() => scrapeDom());
  mo.observe(document.body, { childList: true, subtree: true });

  window.downloadRozetka = () => {
    mo.disconnect();
    const data = [...byId.values()];
    const blob = new Blob([JSON.stringify({ data, errors: [] }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "all-rozetka.json";
    a.click();
    console.log("✅ İndirildi:", data.length, "ürün");
    return data.length;
  };

  console.log(`
✅ Dinleyici AÇIK.
1) Alttan sayfa 1, 2, 3… hepsine tıkla (birkaç sn bekle her birinde)
2) Konsolda yaz:  downloadRozetka()
Şu an yakalanan: ${byId.size}
`);
})();
