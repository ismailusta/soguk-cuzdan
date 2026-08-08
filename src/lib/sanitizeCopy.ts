import {
  hasRichText,
  normalizeLexical,
  type RichTextValue,
} from "@/lib/lexical";

/**
 * Strip leftover WPBakery / Elementor tab shortcode crumbs that leak into
 * product copy (title="", tab_id="", dangling ]).
 */
export function stripShortcodeArtifacts(input: string): string {
  if (!input) return "";
  let s = String(input);

  // Normalize fancy quotes used in scraped HTML entities
  s = s
    .replace(/[“”„‟″‶]/g, '"')
    .replace(/[‘’‚‛′]/g, "'");

  // title=... tab_id=...]  (with optional doubled quotes / spaces)
  s = s.replace(
    /\btitle\s*=\s*"+\s*[^"]*?"+\s*tab_id\s*=\s*"+\s*[^"]*?"+\s*\]?/gi,
    " "
  );
  s = s.replace(
    /\btitle\s*=\s*'+\s*[^']*?'+\s*tab_id\s*=\s*'+\s*[^']*?'+\s*\]?/gi,
    " "
  );

  // Lone attributes
  s = s.replace(/\btitle\s*=\s*"+[^"]*"+/gi, " ");
  s = s.replace(/\btitle\s*=\s*'+[^']*'+/gi, " ");
  s = s.replace(/\btab_id\s*=\s*"+[^"]*"+\s*\]?/gi, " ");
  s = s.replace(/\btab_id\s*=\s*'+[^']*'+\s*\]?/gi, " ");

  // Orphan shortcode wrappers
  s = s.replace(/\[\/?vc_[^\]]*\]/gi, " ");
  s = s.replace(/\[\/?[^\]]*(?:tab_id|vc_tta)[^\]]*\]/gi, " ");

  // Dangling ] left after partial strip (line-start or after whitespace)
  s = s.replace(/(^|\n)\s*\]+\s*/g, "$1");
  s = s.replace(/\s+\]+(?=\s|$)/g, " ");

  // Collapse whitespace
  s = s
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return s;
}

export function normalizeRichBody(value: unknown): RichTextValue | null {
  if (typeof value === "string") {
    const cleaned = stripShortcodeArtifacts(value);
    return normalizeLexical(cleaned);
  }
  return normalizeLexical(value);
}

export function cleanSection(s: {
  title: string;
  body: unknown;
}): { title: string; body: RichTextValue } | null {
  const title = stripShortcodeArtifacts(s.title);
  const body = normalizeRichBody(s.body);
  if (!title || !body || !hasRichText(body)) return null;
  return { title, body };
}

export function cleanFaq(f: {
  question: string;
  answer: unknown;
}): { question: string; answer: RichTextValue } | null {
  const question = stripShortcodeArtifacts(f.question);
  const answer = normalizeRichBody(f.answer);
  if (!question || !answer || !hasRichText(answer)) return null;
  return { question, answer };
}
