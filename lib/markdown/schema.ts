import type { Schema } from "hast-util-sanitize";
import { defaultSchema } from "rehype-sanitize";

function attrs(tag: string, extra: string[]) {
  const current = defaultSchema.attributes?.[tag] ?? [];
  return [...current, ...extra];
}

export const sanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "details",
    "summary",
    "kbd",
    "mark",
    "sub",
    "sup",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": attrs("*", ["className", "id"]),
    div: attrs("div", ["className", "style", "dataEmbed", "dataHeading"]),
    span: attrs("span", ["className", "style", "ariaHidden"]),
    code: attrs("code", ["className"]),
    pre: attrs("pre", ["className", "style"]),
    img: attrs("img", ["width"]),
    details: attrs("details", ["open"]),
    annotation: ["encoding"],
  },
};
