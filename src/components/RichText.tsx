import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react";
import {
  hasRichText,
  normalizeLexical,
  type RichTextValue,
} from "@/lib/lexical";

const PROSE =
  "rich-text max-w-none space-y-3 text-[15px] leading-relaxed text-fg-muted " +
  "[&_p]:mb-0 [&_strong]:font-semibold [&_strong]:text-fg " +
  "[&_em]:italic " +
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 " +
  "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 " +
  "[&_li]:leading-relaxed " +
  "[&_a]:text-accent [&_a]:underline-offset-2 hover:[&_a]:underline " +
  "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-fg " +
  "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-fg " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic";

export function RichText({
  data,
  className = "",
}: {
  data: RichTextValue | string | null | undefined;
  className?: string;
}) {
  const normalized = normalizeLexical(data);
  if (!normalized || !hasRichText(normalized)) return null;

  return (
    <PayloadRichText
      data={normalized}
      className={`${PROSE} ${className}`.trim()}
    />
  );
}
