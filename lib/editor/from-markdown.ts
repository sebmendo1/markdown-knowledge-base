import type { BlockContent, DefinitionContent, List, PhrasingContent, Root, RootContent, Table } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { CALLOUT_KINDS, type PMMark, type PMNode } from "./json";

export type SourceBlock = { source: string; start: number; end: number };

export type ParsedPage = {
  front: string;
  lead: string;
  trail: string;
  blocks: SourceBlock[];
  gaps: string[];
  nodes: PMNode[];
};

const FRONT = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;
const ALERT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;
const EMBED = /^!\[\[([^\]#|]+)(?:#([^\]|]+))?\]\]$/;
const WIKI = /(!?)\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
const MARK = /==([^=\n]+)==/g;

class Unsupported extends Error {}

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);

export function splitFront(source: string): { front: string; body: string } {
  const match = source.startsWith("---") ? FRONT.exec(source) : null;
  if (!match) return { front: "", body: source };
  return { front: match[0], body: source.slice(match[0].length) };
}

export function parseMarkdownTree(markdown: string): Root {
  return parser.parse(markdown) as Root;
}

export function parsePage(source: string): ParsedPage {
  const { front, body } = splitFront(source);
  const tree = parseMarkdownTree(body);
  const blocks = groupBlocks(tree.children, body);
  const nodes = blocks.map((block) => blockNode(block, body));
  const first = blocks[0];
  const last = blocks.at(-1);
  return {
    front,
    lead: first ? body.slice(0, first.start) : "",
    trail: last ? body.slice(last.end) : "",
    blocks: blocks.map(({ start, end }) => ({ start, end, source: body.slice(start, end) })),
    gaps: blocks.slice(0, -1).map((block, index) => body.slice(block.end, blocks[index + 1].start)),
    nodes,
  };
}

export function markdownToNodes(markdown: string): PMNode[] {
  const tree = parseMarkdownTree(markdown);
  return groupBlocks(tree.children, markdown).map((block) => blockNode(block, markdown));
}

type Group = { start: number; end: number; nodes: RootContent[] };

function groupBlocks(children: RootContent[], body: string): Group[] {
  const groups: Group[] = [];
  let open: { group: Group; tag: string } | null = null;
  for (const child of children) {
    const start = child.position?.start.offset ?? 0;
    const end = child.position?.end.offset ?? start;
    if (open) {
      open.group.end = end;
      open.group.nodes.push(child);
      if (balanced(body.slice(open.group.start, end), open.tag)) open = null;
      continue;
    }
    const group = { start, end, nodes: [child] };
    groups.push(group);
    if (child.type === "html") {
      const tag = /^<([a-zA-Z][\w-]*)/.exec(child.value)?.[1];
      if (tag && !balanced(child.value, tag)) open = { group, tag };
    }
  }
  return groups;
}

function balanced(html: string, tag: string): boolean {
  const opens = html.match(new RegExp(`<${tag}(?=[\\s>/])`, "gi"))?.length ?? 0;
  const closes = html.match(new RegExp(`</${tag}\\s*>`, "gi"))?.length ?? 0;
  return closes >= opens;
}

function blockNode(group: Group, body: string): PMNode {
  const source = body.slice(group.start, group.end);
  if (group.nodes.length !== 1) return raw(source);
  try {
    return block(group.nodes[0]);
  } catch (error) {
    if (error instanceof Unsupported) return raw(source);
    throw error;
  }
}

function raw(source: string): PMNode {
  return { type: "rawBlock", attrs: { source } };
}

function block(node: RootContent | BlockContent | DefinitionContent): PMNode {
  switch (node.type) {
    case "paragraph": {
      const only = node.children.length === 1 ? node.children[0] : null;
      const embed = only?.type === "text" ? EMBED.exec(only.value.trim()) : null;
      if (embed) return { type: "embed", attrs: { target: embed[1].trim(), heading: embed[2]?.trim() ?? null } };
      return paragraph(inline(node.children));
    }
    case "heading":
      return withContent({ type: "heading", attrs: { level: node.depth } }, inline(node.children));
    case "thematicBreak":
      return { type: "horizontalRule" };
    case "blockquote":
      return quote(node.children);
    case "list":
      return list(node);
    case "code":
      return { type: "codeFence", attrs: { language: node.lang ?? "", meta: node.meta ?? null, code: node.value } };
    case "math":
      return { type: "mathBlock", attrs: { value: node.value } };
    case "table":
      return table(node);
    default:
      throw new Unsupported(node.type);
  }
}

function quote(children: (BlockContent | DefinitionContent)[]): PMNode {
  const first = children[0];
  const lead = first?.type === "paragraph" ? first.children[0] : undefined;
  const match = lead?.type === "text" ? ALERT.exec(lead.value) : null;
  if (!first || first.type !== "paragraph" || !lead || lead.type !== "text" || !match) {
    return { type: "blockquote", content: blocks(children) };
  }
  const rest = lead.value.slice(match[0].length);
  const phrasing = rest ? [{ ...lead, value: rest }, ...first.children.slice(1)] : first.children.slice(1);
  const body = phrasing.length > 0 ? [{ ...first, children: phrasing }, ...children.slice(1)] : children.slice(1);
  const kind = match[1].toLowerCase();
  if (!CALLOUT_KINDS.includes(kind as never)) throw new Unsupported("callout");
  return { type: "callout", attrs: { kind }, content: blocks(body) };
}

function blocks(children: (BlockContent | DefinitionContent | RootContent)[]): PMNode[] {
  const content = children.map(block);
  return content.length > 0 ? content : [paragraph([])];
}

function list(node: List): PMNode {
  const checks = node.children.map((item) => item.checked);
  const tasks = checks.every((checked) => typeof checked === "boolean");
  if (!tasks && checks.some((checked) => typeof checked === "boolean")) throw new Unsupported("mixed list");
  const tight = !(node.spread || node.children.some((item) => item.spread));
  const items = node.children.map((item) => {
    const content = item.children.map(block);
    if (content[0]?.type !== "paragraph") content.unshift(paragraph([]));
    return tasks
      ? { type: "taskItem", attrs: { checked: Boolean(item.checked) }, content }
      : { type: "listItem", content };
  });
  if (tasks) return { type: "taskList", attrs: { tight }, content: items };
  if (node.ordered) return { type: "orderedList", attrs: { start: node.start ?? 1, tight }, content: items };
  return { type: "bulletList", attrs: { tight }, content: items };
}

function table(node: Table): PMNode {
  const columns = Math.max(node.align?.length ?? 0, ...node.children.map((row) => row.children.length));
  const rows = node.children.map((row, rowIndex) => {
    const cells = Array.from({ length: columns }, (_, index) => {
      const cell = row.children[index];
      return {
        type: rowIndex === 0 ? "tableHeader" : "tableCell",
        content: [paragraph(cell ? inline(cell.children) : [])],
      };
    });
    return { type: "tableRow", content: cells };
  });
  return { type: "table", attrs: { align: node.align ?? null }, content: rows };
}

function paragraph(content: PMNode[]): PMNode {
  return withContent({ type: "paragraph" }, content);
}

function withContent(node: PMNode, content: PMNode[]): PMNode {
  return content.length > 0 ? { ...node, content } : node;
}

function inline(children: PhrasingContent[], marks: PMMark[] = []): PMNode[] {
  return children.flatMap((child) => phrasing(child, marks));
}

function phrasing(node: PhrasingContent, marks: PMMark[]): PMNode[] {
  switch (node.type) {
    case "text":
      return textRuns(node.value, marks);
    case "emphasis":
      return inline(node.children, [...marks, { type: "italic" }]);
    case "strong":
      return inline(node.children, [...marks, { type: "bold" }]);
    case "delete":
      return inline(node.children, [...marks, { type: "strike" }]);
    case "inlineCode":
      return node.value ? [text(node.value, [...marks, { type: "code" }])] : [];
    case "link":
      return inline(node.children, [...marks, { type: "link", attrs: { href: node.url, title: node.title ?? null } }]);
    case "image":
      return [{ type: "image", attrs: { src: node.url, alt: node.alt ?? null, title: node.title ?? null } }];
    case "break":
      return [{ type: "hardBreak" }];
    case "inlineMath":
      return [{ type: "inlineMath", attrs: { value: node.value } }];
    default:
      throw new Unsupported(node.type);
  }
}

function text(value: string, marks: PMMark[]): PMNode {
  return marks.length > 0 ? { type: "text", text: value, marks } : { type: "text", text: value };
}

function textRuns(value: string, marks: PMMark[]): PMNode[] {
  const out: PMNode[] = [];
  let last = 0;
  for (const match of value.matchAll(WIKI)) {
    const index = match.index ?? 0;
    out.push(...highlights(value.slice(last, index), marks));
    out.push({
      type: "wikiLink",
      attrs: {
        target: match[2].trim(),
        heading: match[3]?.trim() ?? null,
        label: match[4]?.trim() ?? null,
        embed: match[1] === "!",
      },
      ...(marks.length > 0 ? { marks } : {}),
    });
    last = index + match[0].length;
  }
  out.push(...highlights(value.slice(last), marks));
  return out;
}

function highlights(value: string, marks: PMMark[]): PMNode[] {
  const out: PMNode[] = [];
  let last = 0;
  for (const match of value.matchAll(MARK)) {
    const index = match.index ?? 0;
    if (index > last) out.push(text(value.slice(last, index), marks));
    out.push(text(match[1], [...marks, { type: "highlight" }]));
    last = index + match[0].length;
  }
  if (last < value.length) out.push(text(value.slice(last), marks));
  return out;
}
