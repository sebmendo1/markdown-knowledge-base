export type PMMark = { type: string; attrs?: Record<string, unknown> };

export type PMNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PMNode[];
  marks?: PMMark[];
  text?: string;
};

export const CALLOUT_KINDS = ["note", "tip", "important", "warning", "caution"] as const;
export type CalloutKind = (typeof CALLOUT_KINDS)[number];

export function wikiSource(attrs: Record<string, unknown> | undefined): string {
  const target = String(attrs?.target ?? "");
  const heading = attrs?.heading ? `#${String(attrs.heading)}` : "";
  const label = attrs?.label ? `|${String(attrs.label)}` : "";
  return `${attrs?.embed ? "!" : ""}[[${target}${heading}${label}]]`;
}
