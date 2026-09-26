import { Extension, InputRule, type Extensions } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node as PMNodeObject } from "@tiptap/pm/model";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ReactNodeViewRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import GithubSlugger from "github-slugger";
import type { Doc } from "@/lib/docs";
import { Callout, CodeFence, Embed, InlineMath, MathBlock, RawBlock, WikiLink, baseExtensions } from "@/lib/editor/nodes";
import { blockToMarkdown } from "@/lib/editor/to-markdown";
import { extractHeadings } from "@/lib/markdown/outline";
import { filterSlash, openNextBlock, type SlashItem } from "./commands";
import type { SuggestStore } from "./suggest-store";
import { CalloutView, EmbedView, FenceView, InlineMathView, MathBlockView, RawView, WikiLinkView } from "./views";
import { AgentDiff } from "./agent-diff";

const headingText = new WeakMap<PMNodeObject, string>();

function textOf(node: PMNodeObject): string {
  const cached = headingText.get(node);
  if (cached !== undefined) return cached;
  const text = extractHeadings(blockToMarkdown(node.toJSON()))[0]?.text ?? node.textContent;
  headingText.set(node, text);
  return text;
}

function headingDecorations(doc: PMNodeObject): DecorationSet {
  const slugger = new GithubSlugger();
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      decorations.push(Decoration.node(pos, pos + node.nodeSize, { id: slugger.slug(textOf(node)) }));
      return false;
    }
    return node.isBlock && !node.isAtom;
  });
  return DecorationSet.create(doc, decorations);
}

const HeadingIds = Extension.create({
  name: "headingIds",
  addProseMirrorPlugins() {
    const key = new PluginKey<DecorationSet>("headingIds");
    return [
      new Plugin<DecorationSet>({
        key,
        state: {
          init: (_, state) => headingDecorations(state.doc),
          apply: (tr, old) => (tr.docChanged ? headingDecorations(tr.doc) : old),
        },
        props: {
          decorations: (state) => key.getState(state),
        },
      }),
    ];
  },
});

const BlockRules = Extension.create({
  name: "blockRules",
  addInputRules() {
    const replaceBlock = (type: string, attrs: (match: RegExpMatchArray) => Record<string, unknown>) =>
      ({ state, range, match }: { state: import("@tiptap/pm/state").EditorState; range: { from: number }; match: RegExpMatchArray }) => {
        const $from = state.doc.resolve(range.from);
        if ($from.parent.textContent.trim() !== match[0].trim()) return null;
        openNextBlock();
        state.tr.replaceWith($from.before(), $from.after(), state.schema.nodes[type].create(attrs(match)));
      };
    return [
      new InputRule({ find: /^```([\w-]+)?[\s\n]$/, handler: replaceBlock("codeFence", (match) => ({ language: match[1] ?? "", code: "" })) }),
      new InputRule({ find: /^\$\$\s$/, handler: replaceBlock("mathBlock", () => ({ value: "" })) }),
    ];
  },
});

export function createSlash(store: SuggestStore<SlashItem>) {
  return Extension.create({
    name: "slashMenu",
    addProseMirrorPlugins() {
      return [
        Suggestion<SlashItem>({
          editor: this.editor,
          pluginKey: new PluginKey("slashMenu"),
          char: "/",
          allowSpaces: false,
          items: ({ query }) => filterSlash(query),
          command: ({ editor, range, props }) => props.run(editor, range),
          allow: ({ state, range }) => {
            const $from = state.doc.resolve(range.from);
            return $from.parent.type.name !== "codeFence";
          },
          render: () => store.render(),
        }),
      ];
    },
  });
}

export type PageOption = { path: string; title: string };

export function createPagePicker(store: SuggestStore<PageOption>, docs: { get: () => Doc[] }) {
  return Extension.create({
    name: "pagePicker",
    addProseMirrorPlugins() {
      return [
        Suggestion<PageOption>({
          editor: this.editor,
          pluginKey: new PluginKey("pagePicker"),
          char: "[[",
          allowSpaces: true,
          allowedPrefixes: null,
          items: ({ query }) => {
            const needle = query.replace(/\]+$/, "").trim().toLowerCase();
            return docs.get()
              .filter((doc) => `${doc.title} ${doc.path}`.toLowerCase().includes(needle))
              .slice(0, 8)
              .map((doc) => ({ path: doc.path, title: doc.title }));
          },
          command: ({ editor, range, props }) => {
            const after = editor.state.doc.textBetween(range.to, Math.min(range.to + 2, editor.state.doc.content.size));
            const to = after.startsWith("]]") ? range.to + 2 : range.to;
            editor
              .chain()
              .focus()
              .insertContentAt({ from: range.from, to }, [
                { type: "wikiLink", attrs: { target: props.path.replace(/\.md$/i, ""), heading: null, label: null, embed: false } },
                { type: "text", text: " " },
              ])
              .run();
          },
          render: () => store.render(),
        }),
      ];
    },
  });
}

export function editorExtensions(options: {
  slash: SuggestStore<SlashItem>;
  pages: SuggestStore<PageOption>;
  docs: { get: () => Doc[] };
}): Extensions {
  return [
    ...baseExtensions({
      callout: Callout.extend({ addNodeView: () => ReactNodeViewRenderer(CalloutView) }),
      codeFence: CodeFence.extend({ addNodeView: () => ReactNodeViewRenderer(FenceView) }),
      mathBlock: MathBlock.extend({ addNodeView: () => ReactNodeViewRenderer(MathBlockView) }),
      inlineMath: InlineMath.extend({ addNodeView: () => ReactNodeViewRenderer(InlineMathView, { as: "span" }) }),
      wikiLink: WikiLink.extend({ addNodeView: () => ReactNodeViewRenderer(WikiLinkView, { as: "span" }) }),
      embed: Embed.extend({ addNodeView: () => ReactNodeViewRenderer(EmbedView) }),
      rawBlock: RawBlock.extend({ addNodeView: () => ReactNodeViewRenderer(RawView) }),
    }),
    Placeholder.configure({
      showOnlyCurrent: true,
      includeChildren: true,
      placeholder: ({ node }) => {
        if (node.type.name === "heading") return `Heading ${String(node.attrs.level)}`;
        return "Type / for commands";
      },
    }),
    HeadingIds,
    AgentDiff,
    BlockRules,
    createSlash(options.slash),
    createPagePicker(options.pages, options.docs),
  ];
}
