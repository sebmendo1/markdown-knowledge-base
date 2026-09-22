import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { splitFrontmatter } from "./frontmatter";

export type Heading = {
  depth: number;
  text: string;
  id: string;
};

export function extractHeadings(source: string): Heading[] {
  const { body } = splitFrontmatter(source);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(body) as Root;
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  visit(tree, "heading", (node) => {
    const text = toString(node).replace(/\s+/g, " ").trim();
    headings.push({ depth: node.depth, text, id: slugger.slug(text) });
  });

  return headings;
}

export function titleOf(source: string, fallback: string): string {
  const { data } = splitFrontmatter(source);
  const titled = data?.title;
  if (typeof titled === "string" && titled.trim()) return titled.trim();
  return extractHeadings(source).find((heading) => heading.depth === 1)?.text || fallback;
}

export function extractSection(source: string, heading: string): string {
  const { body } = splitFrontmatter(source);
  const target = heading.trim().toLowerCase();
  if (!target) return body;

  const lines = body.split("\n");
  let start = -1;
  let depth = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(#{1,6})\s+(.*)$/.exec(lines[index]);
    if (!match) continue;
    const text = match[2].trim().toLowerCase();
    if (start === -1 && text === target) {
      start = index;
      depth = match[1].length;
      continue;
    }
    if (start !== -1 && match[1].length <= depth) {
      return lines.slice(start, index).join("\n");
    }
  }

  return start === -1 ? body : lines.slice(start).join("\n");
}
