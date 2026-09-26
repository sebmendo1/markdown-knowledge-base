import type { Element, Root as HastRoot } from "hast";
import type { Parent, PhrasingContent, Root, Text } from "mdast";
import { visit } from "unist-util-visit";
import { hrefFor, resolveDoc, type DocRef } from "./links";

const ALERT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/;
const WIKI = /(!?)\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
const MARK = /==([^=\n]+)==/g;

export function remarkAlerts() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node) => {
      const first = node.children[0];
      if (!first || first.type !== "paragraph") return;
      const textNode = first.children[0];
      if (!textNode || textNode.type !== "text") return;
      const match = ALERT.exec(textNode.value);
      if (!match) return;

      const kind = match[1].toLowerCase();
      textNode.value = textNode.value.slice(match[0].length);
      if (!textNode.value) first.children.shift();
      if (first.children.length === 0) node.children.shift();

      node.data = {
        hName: "div",
        hProperties: { className: ["callout", `callout-${kind}`] },
      };
      node.children.unshift({
        type: "paragraph",
        data: { hName: "p", hProperties: { className: ["callout-title"] } },
        children: [{ type: "text", value: kind[0].toUpperCase() + kind.slice(1) }],
      });
    });
  };
}

export function remarkHighlight() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index == null || !node.value.includes("==")) return;
      const parts = splitMarks(node.value);
      if (!parts) return;
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}

export function remarkWiki(docs: DocRef[], project: string) {
  return function remarkWikiPlugin() {
    return (tree: Root) => {
      visit(tree, "paragraph", (node) => {
        if (node.children.length !== 1 || node.children[0].type !== "text") return;
        const raw = node.children[0].value.trim();
        const match = /^!\[\[([^\]#]+)(?:#([^\]]+))?\]\]$/.exec(raw);
        if (!match) return;

        const doc = resolveDoc(docs, match[1]);
        if (!doc) {
          node.data = { hName: "p", hProperties: { className: ["wiki-broken"] } };
          node.children = [{ type: "text", value: `Missing page: ${match[1]}` }];
          return;
        }

        node.data = {
          hName: "div",
          hProperties: {
            className: ["embed"],
            dataEmbed: doc.path,
            dataHeading: match[2] ?? "",
          },
        };
      });

      visit(tree, "text", (node: Text, index, parent) => {
        if (!parent || index == null || !node.value.includes("[[")) return;
        if (isEmbed(parent)) return;
        const parts = splitWiki(node.value, docs, project);
        if (!parts) return;
        parent.children.splice(index, 1, ...parts);
        return index + parts.length;
      });
    };
  };
}

function isEmbed(parent: Parent): boolean {
  const properties = parent.data?.hProperties as { className?: string[] } | undefined;
  return properties?.className?.includes("embed") ?? false;
}

function splitMarks(value: string): PhrasingContent[] | null {
  if (!MARK.test(value)) return null;
  MARK.lastIndex = 0;
  const parts: PhrasingContent[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = MARK.exec(value))) {
    if (match.index > last) {
      parts.push({ type: "text", value: value.slice(last, match.index) });
    }
    parts.push({
      type: "strong",
      data: { hName: "mark" },
      children: [{ type: "text", value: match[1] }],
    });
    last = match.index + match[0].length;
  }
  if (parts.length === 0) return null;
  if (last < value.length) parts.push({ type: "text", value: value.slice(last) });
  return parts;
}

function splitWiki(value: string, docs: DocRef[], project: string): PhrasingContent[] | null {
  if (!WIKI.test(value)) return null;
  WIKI.lastIndex = 0;
  const parts: PhrasingContent[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = WIKI.exec(value))) {
    const [whole, bang, slug, heading, label] = match;
    if (match.index > last) {
      parts.push({ type: "text", value: value.slice(last, match.index) });
    }

    const doc = resolveDoc(docs, slug);
    const text = label || (bang ? doc?.title : heading) || doc?.title || slug;
    if (!doc) {
      parts.push({
        type: "emphasis",
        data: { hName: "span", hProperties: { className: ["wiki-broken"] } },
        children: [{ type: "text", value: text }],
      });
    } else {
      parts.push({
        type: "link",
        url: hrefFor(project, doc.path, heading),
        data: { hProperties: { className: ["wiki-link"] } },
        children: [{ type: "text", value: text }],
      });
    }
    last = match.index + whole.length;
  }

  if (parts.length === 0) return null;
  if (last < value.length) parts.push({ type: "text", value: value.slice(last) });
  return parts;
}

const TWICE = /^(#?)user-content-user-content-/;

export function rehypeSinglePrefix() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      for (const key of ["id", "href"] as const) {
        const value = node.properties[key];
        if (typeof value === "string" && TWICE.test(value)) node.properties[key] = value.replace(TWICE, "$1user-content-");
      }
    });
  };
}

// Marks the blocks that contain a changed line, so a page can show what an agent just wrote. It runs after
// sanitizing, so the class it adds is not stripped. Lists and tables are marked per item and per row.
export function rehypeMarkChanged(lines: ReadonlySet<number>) {
  return (tree: HastRoot) => {
    if (lines.size === 0) return;
    const touched = (node: { position?: { start: { line: number }; end: { line: number } } }) => {
      const span = node.position;
      if (!span) return false;
      for (let line = span.start.line; line <= span.end.line; line += 1) if (lines.has(line)) return true;
      return false;
    };
    const mark = (node: Element) => {
      const current: unknown = node.properties.className;
      const names = Array.isArray(current) ? current.map(String) : typeof current === "string" ? current.split(" ") : [];
      node.properties.className = [...names, "agent-change"];
    };
    const parts = (node: Element): Element[] => {
      if (node.tagName === "ul" || node.tagName === "ol") {
        return node.children.filter((child): child is Element => child.type === "element" && child.tagName === "li" && touched(child));
      }
      if (node.tagName === "table") {
        return node.children
          .filter((child): child is Element => child.type === "element")
          .flatMap((section) => section.children.filter((row): row is Element => row.type === "element" && row.tagName === "tr" && touched(row)));
      }
      return [];
    };
    for (const node of tree.children) {
      if (node.type !== "element" || !touched(node)) continue;
      const inner = parts(node);
      if (inner.length) inner.forEach(mark);
      else mark(node);
    }
  };
}
