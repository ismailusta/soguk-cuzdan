import type { SerializedEditorState } from "lexical";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";

export type RichTextValue = SerializedEditorState;

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

export function lexicalPlaintext(value: unknown): string {
  const data = normalizeLexical(value);
  if (!data) return "";
  try {
    return convertLexicalToPlaintext({ data }).trim();
  } catch {
    return "";
  }
}

export function hasRichText(value: unknown): boolean {
  return Boolean(lexicalPlaintext(value));
}
