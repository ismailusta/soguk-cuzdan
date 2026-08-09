/**
 * Replace Ukraine / LWallet boilerplate in product descriptions, detail
 * sections, and FAQs with Kriptostore + Türkiye + TL messaging.
 *
 * Dry-run:
 *   npx tsx scripts/scrub-ukraine-copy.ts
 * Apply:
 *   $env:APPLY=1; npx tsx scripts/scrub-ukraine-copy.ts
 *   npx tsx scripts/scrub-ukraine-copy.ts --limit=20 --apply
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { lexicalPlaintext, textToLexical } from "../src/lib/lexical";
import { stripShortcodeArtifacts } from "../src/lib/sanitizeCopy";

const MARKERS =
  /ukrayna|ukraine|ukrainian|украин|київ|kyiv|kiev|львів|lviv|харків|odesa|odessa|lwallet\.com\.ua|lwallet\.com|грн\b|\buah\b|₴/i;

const DROP_FAQ_Q =
  /ukrayna|ukraine|ukrainian|украин|lwallet|kyiv|kiev|грн|\buah\b|₴|resmi (bir )?bayi|official reseller|neden diğerlerinden|why.*(better|rest)|üreticiden satın|buy.*manufacturer|teslimat.*ukray|deliver.*ukrain/i;

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}`));
  if (!hit) return undefined;
  const i = hit.indexOf("=");
  return i >= 0 ? hit.slice(i + 1) : "true";
}

function needsScrub(s: string): boolean {
  return MARKERS.test(s || "");
}

/** Rewrite geo / store boilerplate; keep product facts when possible. */
export function rewriteUkraineCopy(input: string, locale: "tr" | "en"): string {
  let s = stripShortcodeArtifacts(input || "");
  if (!s.trim()) return "";

  // Currency
  s = s.replace(/(\d[\d\s.,]*)\s*₴/g, locale === "tr" ? "$1 TL" : "$1 TRY");
  s = s.replace(/\bгрн\.?\b/gi, locale === "tr" ? "TL" : "TRY");
  s = s.replace(/\bUAH\b/g, locale === "tr" ? "TL" : "TRY");
  s = s.replace(/~?\s*₴\s*\/\s*Th/gi, locale === "tr" ? "TL/Th" : "TRY/Th");

  // Domains / brand store
  s = s.replace(/https?:\/\/(?:www\.)?lwallet\.com\.ua\/?/gi, "https://kriptostore.com");
  s = s.replace(/\bLWallet\.com\.ua\b/gi, "Kriptostore");
  s = s.replace(/\bLWallet\.com\b/gi, "Kriptostore");
  s = s.replace(/\blwallet\.com\.ua\b/gi, "kriptostore.com");
  s = s.replace(/\bLWallet\b/g, "Kriptostore");

  // Official reseller boilerplate (whole sentences)
  if (locale === "tr") {
    s = s.replace(
      /Evet,?\s*[^.]{0,80}?(?:Ledger|Trezor|Tangem|CoolWallet|OneKey|Keystone|SafePal|BitBox)[^.]{0,40}?Ukrayna['’]?daki resmi bayisiyiz\.[^.]*\./gi,
      "Kriptostore olarak orijinal ürün satıyoruz; Türkiye içi teslimat ve Cryptomus ile kripto ödeme sunuyoruz."
    );
    s = s.replace(
      /Evet,?\s*[^.]{0,100}?Ukrayna['’]?daki resmi (?:bayisi|distribütörü)yüz\.[^.]*\./gi,
      "Kriptostore’da orijinal ürünler bulunur; Türkiye’ye teslimat yapılır."
    );
    s = s.replace(
      /Kriptostore,?\s*Ukrayna['’]?da[^.]*?(?:mağazadır|mağazasıdır)\./gi,
      "Kriptostore, Türkiye’de soğuk cüzdan ve güvenlik donanımı satan bir çevrimiçi mağazadır."
    );
    s = s.replace(
      /Ukrayna çapında teslimat[^.]*\./gi,
      "Türkiye genelinde teslimat yapıyoruz."
    );
    s = s.replace(
      /Ukrayna['’]?ya teslim edilmesini beklemeniz gerekecektir[^.]*\./gi,
      "Türkiye’ye hızlı kargo ile gönderilir."
    );
    s = s.replace(
      /ürünün Ukrayna['’]?ya teslim edilmesini beklemek zorunda kalacaksınız[^.]*\./gi,
      "ürün Türkiye’ye hızlı kargo ile gönderilir."
    );
    s = s.replace(
      /Bu bir haftadan bir aya kadar sürebilir\./gi,
      "Siparişler genellikle aynı gün veya ertesi iş günü kargoya verilir."
    );
    s = s.replace(
      /Mağazamız ülkedeki en geniş[^.]*\./gi,
      "Kriptostore’da Ledger, Trezor, SafePal ve daha fazlası bulunur."
    );
    s = s.replace(
      /ülkedeki en geniş cihaz yelpazesine[^.]*\./gi,
      "geniş bir soğuk cüzdan ve aksesuar yelpazesine sahibiz."
    );
    s = s.replace(
      /herhangi bir şehire|herhangi bir şehre|any city in Ukraine/gi,
      "Türkiye’nin her yerine"
    );
    // Leftover Ukraine mentions → Turkey
    // Leftover Ukraine mentions → Turkey (also glued forms without word boundary)
    s = s.replace(
      /teslim ediyoruz\s*Ukrayna['’]?nınki\.?/gi,
      "Türkiye genelinde teslimat yapıyoruz."
    );
    s = s.replace(
      /(?:Her şehre\s+)?teslimat yapıyoruz\s*Ukrayna\s*Tarihi\.?/gi,
      "Türkiye’nin her yerine teslimat yapıyoruz."
    );
    s = s.replace(/Ukrayna['’]?nınki/gi, "Türkiye’ninki");
    s = s.replace(/Ukrayna\s+Tarihi/gi, "Türkiye");
    s = s.replace(/Ukrayna['’]?da/gi, "Türkiye’de");
    s = s.replace(/Ukrayna['’]?daki/gi, "Türkiye’deki");
    s = s.replace(/Ukrayna['’]?ya/gi, "Türkiye’ye");
    s = s.replace(/Ukrayna['’]?nın/gi, "Türkiye’nin");
    s = s.replace(/Ukrayna/gi, "Türkiye");
    // Fix glued sentences after replacements
    s = s.replace(/([a-zçğıöşü])(Türkiye)/gi, "$1. $2");
    s = s.replace(
      /teslim alma noktasını seçebilirsiniz\./gi,
      "adresinize kargo ile gönderilir."
    );
  } else {
    s = s.replace(
      /Yes,?\s*we are (?:an |the )?official (?:reseller|distributor) of [^.]{0,60}?in Ukraine\.[^.]*\./gi,
      "Kriptostore sells genuine products with delivery in Turkey and crypto checkout via Cryptomus."
    );
    s = s.replace(
      /Kriptostore is an online store in Ukraine[^.]*\./gi,
      "Kriptostore is an online store in Turkey specializing in cold wallets and security hardware."
    );
    s = s.replace(
      /(?:is|are) an online store in Ukraine[^.]*\./gi,
      "is an online store in Turkey specializing in cold wallets and security hardware."
    );
    s = s.replace(
      /full-fledged online store in Ukraine[^.]*\./gi,
      "online store in Turkey for cold wallets and accessories."
    );
    s = s.replace(
      /delivery throughout Ukraine[^.]*\./gi,
      "delivery across Turkey."
    );
    s = s.replace(
      /delivered to Ukraine[^.]*\./gi,
      "shipped within Turkey."
    );
    s = s.replace(
      /This can take from one week to a month\./gi,
      "Orders usually ship the same day or next business day."
    );
    s = s.replace(
      /widest range of (?:devices|similar products) in the country[^.]*\./gi,
      "wide range of cold wallets and accessories."
    );
    s = s.replace(
      /We deliver to any city in Ukraine[^.]*\./gi,
      "We deliver across Turkey."
    );
    s = s.replace(/\bin Ukraine\b/gi, "in Turkey");
    s = s.replace(/\bto Ukraine\b/gi, "to Turkey");
    s = s.replace(/\bof Ukraine\b/gi, "of Turkey");
    s = s.replace(/\bUkraine\b/gi, "Turkey");
    s = s.replace(/\bUkrainian\b/gi, "Turkish");
  }

  // SecureToken / Diya government-Ukraine leftovers → soften
  if (locale === "tr") {
    s = s.replace(
      /Ukrayna Özel İletişim[^.]{0,120}\./gi,
      "Kurumsal ve güvenlik odaklı kullanım senaryolarına uygundur."
    );
    s = s.replace(
      /Ukrayna (?:Vergi|Devlet Vergi|Devlet Güvenlik)[^.]{0,80}\./gi,
      "Elektronik imza ve güvenli anahtar saklama senaryolarında kullanılabilir."
    );
    s = s.replace(/Diya\.Pidpis|Diya\.Portal|Vchasno|M\.E\.Doc/gi, "e-imza yazılımları");
  } else {
    s = s.replace(
      /State Service for Special Communications[^.]{0,120}\./gi,
      "Suitable for corporate and security-focused key storage scenarios."
    );
    s = s.replace(
      /Tax Service of Turkey|State Tax Administration of Turkey[^.]{0,80}\./gi,
      "electronic signature and secure key storage workflows."
    );
    // After Ukraine→Turkey replace, Diya names may remain
    s = s.replace(/Diya\.Pidpis|Diya\.Portal|Vchasno|M\.E\.Doc/gi, "e-signature software");
  }

  // Collapse whitespace
  s = s
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ \./g, ".")
    .trim();

  return s;
}

function shouldDropFaq(question: string, answer: string): boolean {
  const q = question || "";
  const a = answer || "";
  if (DROP_FAQ_Q.test(q)) return true;
  // Pure store-promo FAQs that only talk about Ukraine/LWallet after scrub would be empty/thin
  const scrubbed = rewriteUkraineCopy(a, /[а-яіїєґ]/i.test(a) ? "tr" : "en");
  if (needsScrub(a) && scrubbed.replace(/\s+/g, " ").trim().length < 40) {
    return true;
  }
  // FAQ that is only the LWallet promo paragraph
  if (
    /mağazanız neden|why.*(better|rest)|resmi (bir )?satıcı|official reseller/i.test(
      q
    ) &&
    needsScrub(a)
  ) {
    return true;
  }
  return false;
}

function ensureStoreFaq(
  faqs: Array<{ question: string; answer: string }>,
  locale: "tr" | "en"
): Array<{ question: string; answer: string }> {
  const hasDelivery = faqs.some((f) =>
    /teslimat|kargo|delivery|shipping|Türkiye|Turkey/i.test(f.question)
  );
  if (hasDelivery) return faqs;
  if (locale === "tr") {
    faqs.push({
      question: "Teslimat ve ödeme nasıl?",
      answer:
        "Türkiye genelinde kargo ile teslimat yapıyoruz. Ödeme Cryptomus üzerinden kripto ile alınır; fiyatlar TL cinsindendir.",
    });
  } else {
    faqs.push({
      question: "How do shipping and payment work?",
      answer:
        "We ship across Turkey. Checkout is crypto via Cryptomus; prices are shown in TRY (TL).",
    });
  }
  return faqs;
}

async function main() {
  process.env.NODE_ENV ||= "development";
  process.env.PAYLOAD_DATABASE_PUSH ??= "false";
  const apply = process.env.APPLY === "1" || process.argv.includes("--apply");
  const limit = Number(arg("limit") || 0) || 0;

  if (/localhost|127\.0\.0\.1/i.test(process.env.DATABASE_URL || "")) {
    throw new Error("Supabase DATABASE_URL kullan (localhost değil).");
  }

  const payload = await getPayload({ config });
  const pageSize = 40;
  let page = 1;
  const report: Array<{
    id: number;
    slug: string;
    locales: string[];
    droppedFaqs: number;
    samples: string[];
  }> = [];

  let scanned = 0;

  for (;;) {
    const result = await payload.find({
      collection: "products",
      depth: 0,
      limit: pageSize,
      page,
      overrideAccess: true,
      locale: "all",
    });

    for (const doc of result.docs) {
      if (limit > 0 && scanned >= limit) break;
      scanned++;

      const id = Number(doc.id);
      const slug = String(doc.slug || "");
      const touched: string[] = [];
      let droppedFaqs = 0;
      const samples: string[] = [];

      for (const locale of ["tr", "en"] as const) {
        const one = await payload.findByID({
          collection: "products",
          id,
          locale,
          depth: 0,
          overrideAccess: true,
        });

        const descRaw = lexicalPlaintext(one.description) || "";
        const shortRaw = String(one.shortDescription || "");
        const sections = Array.isArray(one.detailSections)
          ? one.detailSections
          : [];
        const faqs = Array.isArray(one.faqs) ? one.faqs : [];

        const dirtyDesc = needsScrub(descRaw);
        const dirtyShort = needsScrub(shortRaw);
        const dirtySections = sections.some(
          (s) =>
            needsScrub(String(s?.title || "")) ||
            needsScrub(lexicalPlaintext(s?.body) || "")
        );
        const dirtyFaqs = faqs.some(
          (f) =>
            needsScrub(String(f?.question || "")) ||
            needsScrub(lexicalPlaintext(f?.answer) || "") ||
            shouldDropFaq(
              String(f?.question || ""),
              lexicalPlaintext(f?.answer) || ""
            )
        );

        if (!dirtyDesc && !dirtyShort && !dirtySections && !dirtyFaqs) continue;

        touched.push(locale);

        const newDesc = dirtyDesc
          ? rewriteUkraineCopy(descRaw, locale)
          : descRaw;
        const newShort = dirtyShort
          ? rewriteUkraineCopy(shortRaw, locale)
          : shortRaw;

        const newSections = sections
          .map((s) => {
            const title = rewriteUkraineCopy(String(s?.title || ""), locale);
            const body = rewriteUkraineCopy(
              lexicalPlaintext(s?.body) || "",
              locale
            );
            return { title, body };
          })
          .filter((s) => s.title.trim() && s.body.trim().length >= 5);

        let newFaqs = faqs
          .map((f) => {
            const question = stripShortcodeArtifacts(String(f?.question || ""));
            const answerRaw = lexicalPlaintext(f?.answer) || "";
            return { question, answer: answerRaw };
          })
          .filter((f) => {
            if (shouldDropFaq(f.question, f.answer)) {
              droppedFaqs++;
              return false;
            }
            return true;
          })
          .map((f) => ({
            question: rewriteUkraineCopy(f.question, locale),
            answer: rewriteUkraineCopy(f.answer, locale),
          }))
          .filter(
            (f) => f.question.trim() && f.answer.replace(/\s+/g, " ").trim().length >= 20
          );

        // If we dropped Ukraine store FAQs, ensure one Turkey/TL FAQ remains
        if (dirtyFaqs && droppedFaqs > 0) {
          newFaqs = ensureStoreFaq(newFaqs, locale);
        }

        if (samples.length < 3) {
          if (dirtyDesc) {
            samples.push(
              `desc[${locale}]: ${descRaw.slice(0, 80).replace(/\s+/g, " ")} → ${newDesc.slice(0, 80).replace(/\s+/g, " ")}`
            );
          }
          if (dirtyFaqs) {
            samples.push(
              `faqs[${locale}]: kept ${newFaqs.length}, dropped~${droppedFaqs}`
            );
          }
        }

        if (!apply) continue;

        const data: Record<string, unknown> = {};
        if (dirtyShort) data.shortDescription = newShort;
        if (dirtyDesc) {
          data.description = textToLexical(
            newDesc ||
              (locale === "tr"
                ? `${String(one.name || slug)}. Orijinal ürün. Türkiye teslimatı. Fiyatlar TL.`
                : `${String(one.name || slug)}. Genuine product. Ships in Turkey. Prices in TRY.`)
          );
        }
        if (dirtySections) {
          data.detailSections = newSections.map((s) => ({
            title: s.title,
            body: textToLexical(s.body),
          }));
        }
        if (dirtyFaqs) {
          data.faqs = newFaqs.map((f) => ({
            question: f.question,
            answer: textToLexical(f.answer),
          }));
        }

        try {
          await payload.update({
            collection: "products",
            id,
            data,
            locale,
            overrideAccess: true,
          });
        } catch (e) {
          console.error(`Update fail #${id} ${locale}`, e);
        }
      }

      if (touched.length) {
        report.push({ id, slug, locales: touched, droppedFaqs, samples });
        if (apply) {
          console.log(
            `Scrubbed #${id} ${slug} [${touched.join(",")}] droppedFaqs~${droppedFaqs}`
          );
        }
      }
    }

    if (limit > 0 && scanned >= limit) break;
    if (page >= result.totalPages) break;
    page++;
  }

  const out = path.join("data", "products-ukraine-scrub.json");
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        apply,
        count: report.length,
        droppedFaqTotal: report.reduce((n, r) => n + r.droppedFaqs, 0),
        report,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(
    `${apply ? "Applied" : "Dry-run"}: ${report.length} products → ${out}`
  );
  process.exit(0);
}

const isDirect =
  process.argv[1] &&
  /scrub-ukraine-copy\.(ts|js)$/i.test(process.argv[1].replace(/\\/g, "/"));

if (isDirect) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
