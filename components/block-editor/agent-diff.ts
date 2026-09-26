import { Extension, type Editor } from "@tiptap/core";
import type { Node as PMNodeObject } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { agentDiffMarks } from "@/lib/editor/agent-diff";

// Agent changes drawn over the page: insertions green and underlined, deletions red and struck, in place.
const agentDiffKey = new PluginKey<DecorationSet>("agentDiff");

function deleted(tag: "del" | "div", text: string, className: string): HTMLElement {
  const outer = document.createElement(tag === "div" ? "div" : "del");
  outer.className = className;
  outer.contentEditable = "false";
  if (tag === "div") {
    const inner = document.createElement("del");
    inner.textContent = text;
    outer.append(inner);
  } else {
    outer.textContent = text;
  }
  return outer;
}

function decorations(doc: PMNodeObject, baseline: string | null): DecorationSet {
  if (baseline === null) return DecorationSet.empty;
  const list = agentDiffMarks(doc, baseline).map((mark) => {
    switch (mark.kind) {
      case "added":
        return Decoration.inline(mark.from, mark.to, { nodeName: "ins", class: "diff-add" });
      case "block":
        return Decoration.node(mark.from, mark.to, { class: "diff-add-block" });
      case "removed":
        return Decoration.widget(mark.pos, () => deleted("del", mark.text, "diff-del"), {
          side: -1,
          ignoreSelection: true,
          key: `del:${mark.pos}:${mark.text}`,
        });
      case "removedBlock":
        return Decoration.widget(mark.pos, () => deleted("div", mark.text, "diff-del-block"), {
          side: -1,
          ignoreSelection: true,
          key: `delblock:${mark.pos}:${mark.text}`,
        });
    }
  });
  return DecorationSet.create(doc, list);
}

// Redraw the changes against `baseline`, the page without the agents' edits. Null clears them.
export function showAgentDiff(editor: Editor, baseline: string | null) {
  if (editor.isDestroyed) return;
  const set = decorations(editor.state.doc, baseline);
  editor.view.dispatch(editor.state.tr.setMeta(agentDiffKey, set).setMeta("addToHistory", false));
}

export const AgentDiff = Extension.create({
  name: "agentDiff",
  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: agentDiffKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, old) => {
            const next = tr.getMeta(agentDiffKey) as DecorationSet | undefined;
            if (next) return next;
            // Typing moves the marks along; they are redrawn from the page shortly after.
            return tr.docChanged ? old.map(tr.mapping, tr.doc) : old;
          },
        },
        props: {
          decorations: (state) => agentDiffKey.getState(state),
        },
      }),
    ];
  },
});
