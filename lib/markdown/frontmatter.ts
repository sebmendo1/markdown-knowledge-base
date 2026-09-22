import { parse } from "yaml";

export type Frontmatter = Record<string, unknown>;

export function splitFrontmatter(source: string): {
  data: Frontmatter | null;
  body: string;
  error?: string;
} {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) {
    return { data: null, body: source };
  }

  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { data: null, body: source };

  const body = source.slice(match[0].length);
  try {
    const data = parse(match[1]);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { data: null, body, error: "Frontmatter must be a map." };
    }
    return { data: data as Frontmatter, body };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid YAML.";
    return { data: null, body, error: message };
  }
}
