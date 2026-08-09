/**
 * Client-safe Lexical helpers (no Payload Node adapters).
 * Server code may still use @payloadcms/richtext-lexical/plaintext where needed.
 */

export type RichTextValue = {
  root: {
    type: string;
    children: unknown[];
    direction?: ("ltr" | "rtl") | null;
    format?: string;
    indent?: number;
    version?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

function paragraphNode(text: string) {
  return {
    type: "paragraph",
    version: 1,
    format: "" as const,
    indent: 0,
    direction: "ltr" as const,
    textFormat: 0,
    textStyle: "",
    children: text
      ? [
          {
            type: "text",
            version: 1,
            text,
            detail: 0,
            format: 0,
            mode: "normal" as const,
            style: "",
          },
        ]
      : [],
  };
}

/** Build a Lexical document from plain text (blank-line → paragraphs). */
export function textToLexical(input: string): RichTextValue {
  const parts = String(input || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const children =
    parts.length > 0
      ? parts.map((p) => paragraphNode(p.replace(/\n/g, " ")))
      : [paragraphNode("")];

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children,
    },
  };
}

export function isLexicalState(value: unknown): value is RichTextValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const root = (value as { root?: unknown }).root;
  if (!root || typeof root !== "object") return false;
  return (
    (root as { type?: unknown }).type === "root" &&
    Array.isArray((root as { children?: unknown }).children)
  );
}

/** Accept CMS Lexical JSON or legacy plain string. */
export function normalizeLexical(value: unknown): RichTextValue | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return textToLexical(trimmed);
  }
  if (isLexicalState(value)) return value;
  return null;
}

function collectText(node: unknown, out: string[]): void {
  if (node == null) return;
  if (typeof node === "string") {
    out.push(node);
    return;
  }
  if (typeof node !== "object") return;
  const n = node as {
    text?: unknown;
    type?: unknown;
    children?: unknown;
  };
  if (typeof n.text === "string") out.push(n.text);
  if (Array.isArray(n.children)) {
    for (const child of n.children) collectText(child, out);
  }
  // Soft break between block-ish nodes
  if (
    typeof n.type === "string" &&
    (n.type === "paragraph" ||
      n.type === "heading" ||
      n.type === "listitem" ||
      n.type === "quote")
  ) {
    out.push("\n");
  }
}

/** Plaintext for SEO / teasers — no Payload dependency. */
export function lexicalPlaintext(value: unknown): string {
  const data = normalizeLexical(value);
  if (!data) return "";
  const parts: string[] = [];
  collectText(data.root, parts);
  return parts
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function hasRichText(value: unknown): boolean {
  return Boolean(lexicalPlaintext(value));
}
