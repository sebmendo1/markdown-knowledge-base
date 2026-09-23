import type { Editor, Range } from "@tiptap/core";
import type { CalloutKind } from "@/lib/editor/json";

export type TurnKind = "text" | "h1" | "h2" | "h3" | "bullet" | "numbered" | "todo" | "quote" | "callout" | "code";

export const TURN_INTO: { kind: TurnKind; label: string; glyph: string }[] = [
  { kind: "text", label: "Text", glyph: "T" },
  { kind: "h1", label: "Heading 1", glyph: "H1" },
  { kind: "h2", label: "Heading 2", glyph: "H2" },
  { kind: "h3", label: "Heading 3", glyph: "H3" },
  { kind: "bullet", label: "Bulleted list", glyph: "•" },
  { kind: "numbered", label: "Numbered list", glyph: "1." },
  { kind: "todo", label: "To-do list", glyph: "☐" },
  { kind: "quote", label: "Quote", glyph: "❝" },
  { kind: "callout", label: "Callout", glyph: "!" },
  { kind: "code", label: "Code", glyph: "</>" },
];

const freshBlocks = { open: false };

export function openNextBlock() {
  freshBlocks.open = true;
}

export function takeFreshBlock(): boolean {
  const open = freshBlocks.open;
  freshBlocks.open = false;
  return open;
}

export function currentKind(editor: Editor): TurnKind | null {
  if (editor.isActive("heading", { level: 1 })) return "h1";
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  if (editor.isActive("taskList")) return "todo";
  if (editor.isActive("orderedList")) return "numbered";
  if (editor.isActive("bulletList")) return "bullet";
  if (editor.isActive("callout")) return "callout";
  if (editor.isActive("blockquote")) return "quote";
  if (editor.isActive("paragraph")) return "text";
  return null;
}

export function turnInto(editor: Editor, kind: TurnKind) {
  if (kind === "code") {
    const { $from } = editor.state.selection;
    if (!$from.parent.isTextblock) return;
    const code = $from.parent.textContent;
    const node = editor.schema.nodes.codeFence.create({ language: "", code });
    openNextBlock();
    editor.chain().focus().command(({ tr }) => {
      tr.replaceWith($from.before(), $from.after(), node);
      return true;
    }).run();
    return;
  }
  const chain = editor.chain().focus().clearNodes();
  switch (kind) {
    case "text":
      chain.setParagraph().run();
      return;
    case "h1":
    case "h2":
    case "h3":
      chain.setHeading({ level: Number(kind.slice(1)) as 1 | 2 | 3 }).run();
      return;
    case "bullet":
      chain.toggleBulletList().run();
      return;
    case "numbered":
      chain.toggleOrderedList().run();
      return;
    case "todo":
      chain.toggleTaskList().run();
      return;
    case "quote":
      chain.wrapIn("blockquote").run();
      return;
    case "callout":
      chain.wrapIn("callout", { kind: "note" }).run();
      return;
  }
}

export type SlashItem = {
  id: string;
  label: string;
  hint: string;
  group: string;
  keywords: string;
  run: (editor: Editor, range: Range) => void;
};

const STARTERS = {
  mermaid: "flowchart LR\n  A[Start] --> B[Next]",
  chart:
    "title: Example\ndata:\n  values:\n    - { label: A, value: 3 }\n    - { label: B, value: 5 }\nmark: bar\nencoding:\n  x: { field: label, type: nominal }\n  y: { field: value, type: quantitative }",
  csv: "name,value\nA,1\nB,2",
  toggle: "<details>\n<summary>Toggle</summary>\n\nHidden content\n\n</details>",
};

function turn(kind: TurnKind) {
  return (editor: Editor, range: Range) => {
    editor.chain().focus().deleteRange(range).run();
    turnInto(editor, kind);
  };
}

function insertBlock(type: string, attrs: Record<string, unknown>) {
  return (editor: Editor, range: Range) => {
    openNextBlock();
    editor.chain().focus().deleteRange(range).insertContent({ type, attrs }).run();
  };
}

function callout(kind: CalloutKind, label: string): SlashItem {
  return {
    id: `callout-${kind}`,
    label,
    hint: `> [!${kind.toUpperCase()}]`,
    group: "Callouts",
    keywords: `callout alert admonition ${kind}`,
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).clearNodes().wrapIn("callout", { kind }).run();
    },
  };
}

export const SLASH_ITEMS: SlashItem[] = [
  { id: "text", label: "Text", hint: "Plain paragraph", group: "Basic", keywords: "paragraph plain", run: turn("text") },
  { id: "h1", label: "Heading 1", hint: "Page title size", group: "Basic", keywords: "title h1 big", run: turn("h1") },
  { id: "h2", label: "Heading 2", hint: "Section", group: "Basic", keywords: "h2 section", run: turn("h2") },
  { id: "h3", label: "Heading 3", hint: "Subsection", group: "Basic", keywords: "h3 subsection", run: turn("h3") },
  { id: "bullet", label: "Bulleted list", hint: "Simple list", group: "Basic", keywords: "ul unordered bullets", run: turn("bullet") },
  { id: "numbered", label: "Numbered list", hint: "Ordered steps", group: "Basic", keywords: "ol ordered steps", run: turn("numbered") },
  { id: "todo", label: "To-do list", hint: "Checkboxes", group: "Basic", keywords: "task check checkbox", run: turn("todo") },
  { id: "quote", label: "Quote", hint: "Pull quote", group: "Basic", keywords: "blockquote", run: turn("quote") },
  {
    id: "divider",
    label: "Divider",
    hint: "Horizontal rule",
    group: "Basic",
    keywords: "hr rule line separator",
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  callout("note", "Note callout"),
  callout("tip", "Tip callout"),
  callout("important", "Important callout"),
  callout("warning", "Warning callout"),
  callout("caution", "Caution callout"),
  {
    id: "table",
    label: "Table",
    hint: "3 × 3 grid",
    group: "Structure",
    keywords: "grid columns rows",
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  { id: "code", label: "Code", hint: "Highlighted code", group: "Structure", keywords: "snippet fence pre", run: insertBlock("codeFence", { language: "", code: "" }) },
  { id: "toggle", label: "Toggle", hint: "Collapsible section", group: "Structure", keywords: "details collapse summary", run: insertBlock("rawBlock", { source: STARTERS.toggle }) },
  {
    id: "page-link",
    label: "Link to page",
    hint: "[[page]]",
    group: "Pages",
    keywords: "wiki mention reference",
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertContent("[[").run();
    },
  },
  { id: "embed", label: "Embed page", hint: "Show another page here", group: "Pages", keywords: "transclude include", run: insertBlock("embed", { target: "", heading: null }) },
  {
    id: "image",
    label: "Image",
    hint: "From a URL or assets/",
    group: "Media",
    keywords: "picture photo img",
    run: (editor, range) => {
      const src = window.prompt("Image URL or path");
      editor.chain().focus().deleteRange(range).run();
      if (src?.trim()) editor.chain().focus().setImage({ src: src.trim(), alt: "" }).run();
    },
  },
  { id: "mermaid", label: "Mermaid diagram", hint: "Flowchart, sequence, …", group: "Visual", keywords: "diagram flowchart sequence graph", run: insertBlock("codeFence", { language: "mermaid", code: STARTERS.mermaid }) },
  { id: "chart", label: "Chart", hint: "Vega-Lite spec", group: "Visual", keywords: "graph plot vega bar line", run: insertBlock("codeFence", { language: "chart", code: STARTERS.chart }) },
  { id: "csv", label: "CSV table", hint: "Sortable data", group: "Visual", keywords: "data spreadsheet", run: insertBlock("codeFence", { language: "csv", code: STARTERS.csv }) },
  { id: "math", label: "Math block", hint: "KaTeX", group: "Visual", keywords: "equation latex katex formula", run: insertBlock("mathBlock", { value: "" }) },
  {
    id: "inline-math",
    label: "Inline math",
    hint: "In a sentence",
    group: "Visual",
    keywords: "equation latex katex formula",
    run: (editor, range) => {
      openNextBlock();
      editor.chain().focus().deleteRange(range).insertContent({ type: "inlineMath", attrs: { value: "" } }).run();
    },
  },
];

export function filterSlash(query: string): SlashItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return SLASH_ITEMS;
  return SLASH_ITEMS.filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(needle));
}
