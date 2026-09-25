import { mergeAttributes, Node, type Extensions } from "@tiptap/core";
import Code from "@tiptap/extension-code";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { BulletList, OrderedList, TaskItem, TaskList } from "@tiptap/extension-list";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";
import { wikiSource } from "./json";

const tight = { tight: { default: true, rendered: false } };

// Markdown lets inline code sit inside a link, as in [`name`](url). Tiptap's code mark refuses every other mark.
export const LinkableCode = Code.extend({ excludes: "" });

export const TightBulletList = BulletList.extend({
  addAttributes() {
    return { ...this.parent?.(), ...tight };
  },
});

export const TightOrderedList = OrderedList.extend({
  addAttributes() {
    return { ...this.parent?.(), ...tight };
  },
});

export const TightTaskList = TaskList.extend({
  addAttributes() {
    return { ...this.parent?.(), ...tight };
  },
});

export const AlignedTable = Table.extend({
  addAttributes() {
    return { ...this.parent?.(), align: { default: null, rendered: false } };
  },
});

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      kind: {
        default: "note",
        parseHTML: (element) => element.getAttribute("data-kind") ?? "note",
        renderHTML: (attrs) => ({ "data-kind": attrs.kind }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0];
  },
});

export const CodeFence = Node.create({
  name: "codeFence",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      language: { default: "" },
      meta: { default: null },
      code: { default: "" },
    };
  },
  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
        getAttrs: (element) => {
          const code = element.querySelector("code");
          const lang = /language-([\w-]+)/.exec(code?.className ?? "")?.[1] ?? element.getAttribute("data-language") ?? "";
          return { language: lang, code: (code ?? element).textContent ?? "" };
        },
      },
    ];
  },
  renderHTML({ node }) {
    return ["pre", { "data-language": node.attrs.language }, ["code", {}, String(node.attrs.code)]];
  },
});

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { value: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "div[data-math]", getAttrs: (element) => ({ value: element.textContent ?? "" }) }];
  },
  renderHTML({ node }) {
    return ["div", { "data-math": "" }, String(node.attrs.value)];
  },
});

export const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return { value: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "span[data-math]", getAttrs: (element) => ({ value: element.textContent ?? "" }) }];
  },
  renderHTML({ node }) {
    return ["span", { "data-math": "" }, String(node.attrs.value)];
  },
  renderText({ node }) {
    return `$${String(node.attrs.value)}$`;
  },
});

export const WikiLink = Node.create({
  name: "wikiLink",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      target: { default: "" },
      heading: { default: null },
      label: { default: null },
      embed: { default: false },
    };
  },
  parseHTML() {
    return [
      {
        tag: "span[data-wiki]",
        getAttrs: (element) => ({
          target: element.getAttribute("data-wiki") ?? "",
          heading: element.getAttribute("data-heading"),
          label: element.getAttribute("data-label"),
        }),
      },
    ];
  },
  renderHTML({ node }) {
    return [
      "span",
      {
        "data-wiki": node.attrs.target,
        "data-heading": node.attrs.heading,
        "data-label": node.attrs.label,
        class: "wiki-link",
      },
      String(node.attrs.label || node.attrs.target),
    ];
  },
  renderText({ node }) {
    return wikiSource(node.attrs);
  },
});

export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { target: { default: "" }, heading: { default: null } };
  },
  parseHTML() {
    return [
      {
        tag: "div[data-embed]",
        getAttrs: (element) => ({
          target: element.getAttribute("data-embed") ?? "",
          heading: element.getAttribute("data-heading"),
        }),
      },
    ];
  },
  renderHTML({ node }) {
    return ["div", { "data-embed": node.attrs.target, "data-heading": node.attrs.heading }];
  },
});

export const RawBlock = Node.create({
  name: "rawBlock",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { source: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "div[data-raw]", getAttrs: (element) => ({ source: element.textContent ?? "" }) }];
  },
  renderHTML({ node }) {
    return ["div", { "data-raw": "" }, String(node.attrs.source)];
  },
});

export type NodeViews = Partial<Record<"callout" | "codeFence" | "mathBlock" | "inlineMath" | "wikiLink" | "embed" | "rawBlock", Node>>;

export function baseExtensions(views: NodeViews = {}): Extensions {
  return [
    StarterKit.configure({
      codeBlock: false,
      code: false,
      bulletList: false,
      orderedList: false,
      underline: false,
      dropcursor: { color: "#7aa2f7", width: 2 },
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      link: { openOnClick: false, autolink: true, linkOnPaste: true },
    }),
    LinkableCode,
    TightBulletList,
    TightOrderedList,
    TightTaskList,
    TaskItem.configure({ nested: true }),
    AlignedTable.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Highlight,
    Image.configure({ inline: true }),
    views.callout ?? Callout,
    views.codeFence ?? CodeFence,
    views.mathBlock ?? MathBlock,
    views.inlineMath ?? InlineMath,
    views.wikiLink ?? WikiLink,
    views.embed ?? Embed,
    views.rawBlock ?? RawBlock,
  ];
}
