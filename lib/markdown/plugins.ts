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

export function remarkWiki(docs: DocRef[]) {
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
        const parts = splitWiki(node.value, docs);
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

function splitWiki(value: string, docs: DocRef[]): PhrasingContent[] | null {
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
        url: hrefFor(doc.path, heading),
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
