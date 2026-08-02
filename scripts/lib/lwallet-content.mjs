/**
 * Parse lwallet WooCommerce / WPBakery HTML into clean short text, sections, FAQs.
 */

export function decodeEntities(html) {
  return String(html || "")
    .replace(/&#8221;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function stripTags(html) {
  return decodeEntities(html)
    .replace(/\[\/?[^\]]+\]/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h\d|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const FAQ_TITLE_RE = /^(faq|часті питання|часто задаваемые|sss|sıkça)/i;
const SKIP_SECTION_RE =
  /^(опис|описание|відгуки|отзывы|додаткова|дополнительн|video|відео|відеоогляд)/i;
const STORE_FAQ_RE =
  /реселлер|магазин кращий|гарантія на пристрої|технічну підтримку|доставку|сплатити при|оригінальний продукт|official reseller|shipping|garanti/i;

/** Extract vc_tta_section blocks → { sections, faqs } */
export function parseVcContent(rawHtml) {
  const html = decodeEntities(rawHtml);
  const parts = html.split(/\[vc_tta_section\b/i);
  const sections = [];
  const faqs = [];

  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const titleMatch = chunk.match(
      /title\s*=\s*"([^"]+)"|title\s*=\s*'([^']+)'/i
    );
    const title = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
    if (!title || FAQ_TITLE_RE.test(title) || SKIP_SECTION_RE.test(title)) {
      continue;
    }

    const end = chunk.search(/\[\/vc_tta_section\]/i);
    const bodyHtml = end >= 0 ? chunk.slice(0, end) : chunk;
    const body = stripTags(bodyHtml).trim();
    if (body.length < 20) continue;

    // Question titles → FAQ (except "what's in the box")
    const isBox =
      /комплекті|комплект|in the box|kutuda ne var/i.test(title);
    if ((/\?\s*$/.test(title) || title.length > 60) && !isBox) {
      if (STORE_FAQ_RE.test(title)) continue;
      faqs.push({
        question: title.slice(0, 300),
        answer: body.slice(0, 2000),
      });
      continue;
    }

    sections.push({ title, body: body.slice(0, 6000) });
  }

  return { sections, faqs: faqs.slice(0, 16) };
}

/** @deprecated use parseVcContent */
export function parseVcSections(rawHtml) {
  return parseVcContent(rawHtml).sections;
}

/** Parse FAQ from description (fallback) */
export function parseFaqs(rawHtml) {
  const fromVc = parseVcContent(rawHtml).faqs;
  if (fromVc.length) return fromVc;

  const text = stripTags(rawHtml);
  const faqs = [];
  const faqIdx = text.search(/\bFAQ\b|Часті питання|Часто задаваемые/i);
  const faqBlock = faqIdx >= 0 ? text.slice(faqIdx) : "";
  if (!faqBlock) return faqs;

  const lines = faqBlock
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  let q = null;
  let buf = [];

  const flush = () => {
    if (q && buf.join(" ").trim().length > 10) {
      faqs.push({
        question: q.slice(0, 300),
        answer: buf.join(" ").trim().slice(0, 2000),
      });
    }
    q = null;
    buf = [];
  };

  for (const line of lines) {
    if (/^(faq|часті|часто|sss)/i.test(line) && line.length < 40) continue;
    if (STORE_FAQ_RE.test(line)) continue;
    const isQ =
      /\?$/.test(line) &&
      line.length > 12 &&
      line.length < 220 &&
      !/https?:\/\//i.test(line);
    if (isQ) {
      flush();
      q = line;
    } else if (q) {
      buf.push(line);
    }
  }
  flush();

  return faqs.slice(0, 16);
}

/** Clean teaser from short_description HTML */
export function extractShort(rawShort, fallbackName) {
  let plain = stripTags(rawShort)
    .replace(/офіційний\s+(партнер|дилер)[^.!]*/gi, "")
    .replace(/official\s+(partner|dealer)[^.!]*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const sentences = plain
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 40 &&
        !/bitbox\.swiss|verified|офіційний|official/i.test(s)
    );

  if (sentences.length) {
    return sentences.slice(0, 2).join(" ").slice(0, 420);
  }
  if (plain.length > 50) return plain.slice(0, 420);
  return `${fallbackName} — donanım cüzdanı. Cryptomus ile kripto ödeme.`;
}

export function buildFeaturesFromSections(sections) {
  const features = [];
  for (const s of sections.slice(0, 6)) {
    const first = s.body.split(/\n/)[0]?.trim();
    if (first && first.length > 20 && first.length < 160) {
      features.push(first);
    } else if (s.title) {
      features.push(s.title);
    }
  }
  return features.slice(0, 8);
}
