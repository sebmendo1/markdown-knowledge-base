import type { AlignType, BlockContent, Parent, PhrasingContent, Root, RootContent, TableCell, TableRow } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import type { ParsedPage } from "./from-markdown";
import { wikiSource, type PMMark, type PMNode } from "./json";

const stringifier = unified()
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkStringify, {
    bullet: "-",
    emphasis: "*",
    strong: "*",
    fence: "`",
    fences: true,
    rule: "-",
    listItemIndent: "one",
    incrementListMarker: true,
  });

export type BlockItem = { index: number } | { node: PMNode };

export function joinBlocks(page: Pick<ParsedPage, "front" | "lead" | "trail" | "blocks" | "gaps">, items: BlockItem[]): string {
  let out = "";
  let previous: number | null = null;
  for (const item of items) {
    const original = "index" in item ? item.index : null;
    const text = original !== null ? page.blocks[original].source : blockToMarkdown((item as { node: PMNode }).node);
    if (!text) {
      previous = null;
      continue;
    }
    if (out) out += previous !== null && original === previous + 1 ? page.gaps[previous] : "\n\n";
    out += text;
    previous = original;
  }
  if (!out) return page.front;
  return page.front + page.lead + out + (page.trail || "\n");
}

export function nodesToMarkdown(nodes: PMNode[]): string {
  return joinBlocks({ front: "", lead: "", trail: "", blocks: [], gaps: [] }, nodes.map((node) => ({ node })));
}

export function blockToMarkdown(node: PMNode): string {
  if (node.type === "rawBlock") return String(node.attrs?.source ?? "").replace(/\n+$/, "");
  if (node.type === "paragraph" && !node.content?.some((child) => child.type !== "text" || child.text?.trim())) return "";
  const root: Root = { type: "root", children: [flow(node)] as RootContent[] };
  return String(stringifier.stringify(root)).replace(/\n+$/, "");
}

function flow(node: PMNode): BlockContent {
  const content = node.content ?? [];
  switch (node.type) {
    case "paragraph":
      return { type: "paragraph", children: phrasing(content) };
    case "heading":
      return { type: "heading", depth: clampDepth(node.attrs?.level), children: phrasing(content) };
    case "horizontalRule":
      return { type: "thematicBreak" };
    case "blockquote":
      return { type: "blockquote", children: flows(content) };
    case "callout": {
      const marker = `[!${String(node.attrs?.kind ?? "note").toUpperCase()}]`;
      const [first, ...rest] = flows(content);
      if (first?.type === "paragraph" && first.children.length > 0) {
        const lead: PhrasingContent[] = [{ type: "html", value: marker }, { type: "text", value: "\n" }];
        return { type: "blockquote", children: [{ ...first, children: [...lead, ...first.children] }, ...rest] };
      }
      const head = { type: "paragraph", children: [{ type: "html", value: marker }] } as BlockContent;
      return { type: "blockquote", children: [head, ...(first && !isEmpty(first) ? [first] : []), ...rest] };
    }
    case "bulletList":
    case "orderedList":
    case "taskList": {
      const spread = node.attrs?.tight === false;
      return {
        type: "list",
        ordered: node.type === "orderedList",
        start: node.type === "orderedList" ? Number(node.attrs?.start ?? 1) : undefined,
        spread,
        children: content.map((item) => ({
          type: "listItem",
          spread,
          checked: node.type === "taskList" ? Boolean(item.attrs?.checked) : undefined,
          children: flows(item.content ?? []).filter((child, index) => index === 0 || !isEmpty(child)),
        })),
      };
    }
    case "codeFence":
      return {
        type: "code",
        lang: String(node.attrs?.language ?? "") || null,
        meta: (node.attrs?.meta as string | null) ?? null,
        value: String(node.attrs?.code ?? ""),
      };
    case "mathBlock":
      return { type: "math", value: String(node.attrs?.value ?? "") } as BlockContent;
    case "embed":
      return { type: "html", value: wikiSource({ ...node.attrs, embed: true }) };
    case "rawBlock":
      return { type: "html", value: String(node.attrs?.source ?? "") };
    case "table": {
      const align = (node.attrs?.align as AlignType[] | null) ?? null;
      const rows: TableRow[] = content.map((row) => ({
        type: "tableRow",
        children: (row.content ?? []).map(
          (cell): TableCell => ({
            type: "tableCell",
            children: joinCell(cell.content ?? []),
          }),
        ),
      }));
      const width = rows[0]?.children.length ?? 0;
      return { type: "table", align: align && align.length === width ? align : Array(width).fill(null), children: rows };
    }
    default:
      return { type: "html", value: "" };
  }
}

function flows(content: PMNode[]): BlockContent[] {
  return content.map(flow);
}

function isEmpty(node: BlockContent): boolean {
  return node.type === "paragraph" && node.children.length === 0;
}

function joinCell(content: PMNode[]): PhrasingContent[] {
  const out: PhrasingContent[] = [];
  content.forEach((paragraph, index) => {
    if (index > 0) out.push({ type: "text", value: " " });
    out.push(...phrasing(paragraph.content ?? []));
  });
  return out;
}

function clampDepth(level: unknown): 1 | 2 | 3 | 4 | 5 | 6 {
  const depth = Math.min(6, Math.max(1, Number(level) || 1));
  return depth as 1 | 2 | 3 | 4 | 5 | 6;
}

const ORDER = ["link", "bold", "italic", "strike", "highlight"];

type Wrapper = { type: string; children: PhrasingContent[] } & Record<string, unknown>;

function markKey(mark: PMMark): string {
  return mark.type === "link" ? `link:${String(mark.attrs?.href ?? "")}` : mark.type;
}

function markNode(mark: PMMark): Wrapper {
  switch (mark.type) {
    case "link":
      return { type: "link", url: String(mark.attrs?.href ?? ""), title: (mark.attrs?.title as string | null) ?? null, children: [] };
    case "bold":
      return { type: "strong", children: [] };
    case "italic":
      return { type: "emphasis", children: [] };
    case "strike":
      return { type: "delete", children: [] };
    default:
      return { type: "__highlight", children: [] };
  }
}

const FLANKING = new Set(["bold", "italic", "strike", "highlight"]);

// Markdown drops whitespace at block edges and cannot open or close emphasis next to a
// space, so remark would escape those spaces as `&#x20;`. Move them outside the marks.
function tidy(content: PMNode[]): PMNode[] {
  const out = content.flatMap((item): PMNode[] => {
    if (item.type !== "text" || !item.marks?.some((mark) => FLANKING.has(mark.type))) return [item];
    const text = item.text ?? "";
    const [, before, middle, after] = /^(\s*)([\s\S]*?)(\s*)$/.exec(text) ?? ["", "", text, ""];
    const plain = item.marks.filter((mark) => !FLANKING.has(mark.type));
    const bare = (value: string): PMNode[] => (value ? [{ type: "text", text: value, ...(plain.length ? { marks: plain } : {}) }] : []);
    return [...bare(before), ...(middle ? [{ ...item, text: middle }] : []), ...bare(after)];
  });
  const isCode = (item: PMNode) => item.marks?.some((mark) => mark.type === "code");
  const first = out[0];
  if (first?.type === "text" && !isCode(first)) out[0] = { ...first, text: (first.text ?? "").replace(/^[ \t]+/, "") };
  const last = out.at(-1);
  if (last?.type === "text" && !isCode(last)) out[out.length - 1] = { ...last, text: (last.text ?? "").replace(/[ \t]+$/, "") };
  return out.filter((item) => item.type !== "text" || item.text);
}

function phrasing(content: PMNode[]): PhrasingContent[] {
  const root: Wrapper = { type: "root", children: [] };
  let stack: { key: string; node: Wrapper }[] = [];
  for (const item of tidy(content)) {
    const marks = (item.marks ?? [])
      .filter((mark) => ORDER.includes(mark.type))
      .sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
    let common = 0;
    while (common < stack.length && common < marks.length && stack[common].key === markKey(marks[common])) common += 1;
    stack = stack.slice(0, common);
    for (let index = common; index < marks.length; index += 1) {
      const wrapper = markNode(marks[index]);
      (stack.at(-1)?.node ?? root).children.push(wrapper as unknown as PhrasingContent);
      stack.push({ key: markKey(marks[index]), node: wrapper });
    }
    const leafNode = leaf(item);
    if (leafNode) (stack.at(-1)?.node ?? root).children.push(leafNode);
  }
  return flatten(root.children);
}

function flatten(children: PhrasingContent[]): PhrasingContent[] {
  return children.flatMap((child): PhrasingContent[] => {
    const wrapper = child as unknown as Wrapper;
    if (wrapper.type === "__highlight") {
      return [{ type: "html", value: "==" }, ...flatten(wrapper.children), { type: "html", value: "==" }];
    }
    if ("children" in child && Array.isArray(child.children)) {
      (child as Parent).children = flatten(child.children as PhrasingContent[]);
    }
    return [child];
  });
}

function leaf(node: PMNode): PhrasingContent | null {
  switch (node.type) {
    case "text": {
      const value = node.text ?? "";
      if (node.marks?.some((mark) => mark.type === "code")) return { type: "inlineCode", value };
      return { type: "text", value };
    }
    case "hardBreak":
      return { type: "break" };
    case "image":
      return {
        type: "image",
        url: String(node.attrs?.src ?? ""),
        alt: (node.attrs?.alt as string | null) ?? "",
        title: (node.attrs?.title as string | null) ?? null,
      };
    case "inlineMath":
      return { type: "inlineMath", value: String(node.attrs?.value ?? "") } as PhrasingContent;
    case "wikiLink":
      return { type: "html", value: wikiSource(node.attrs) };
    default:
      return null;
  }
}
