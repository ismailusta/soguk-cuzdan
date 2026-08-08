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

export function cleanSection(s: {
  title: string;
  body: string;
}): { title: string; body: string } {
  return {
    title: stripShortcodeArtifacts(s.title),
    body: stripShortcodeArtifacts(s.body),
  };
}

export function cleanFaq(f: {
  question: string;
  answer: string;
}): { question: string; answer: string } {
  return {
    question: stripShortcodeArtifacts(f.question),
    answer: stripShortcodeArtifacts(f.answer),
  };
}
