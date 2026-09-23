"use client";

import { Fragment, Slice, type Node as PMNodeObject } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Doc } from "@/lib/docs";
import { markdownToNodes, parsePage, type ParsedPage } from "@/lib/editor/from-markdown";
import { joinBlocks, type BlockItem } from "@/lib/editor/to-markdown";
import { BlockHandle } from "./block-handle";
import { BubbleToolbar } from "./bubble-toolbar";
import type { SlashItem } from "./commands";
import { editorExtensions, type PageOption } from "./extensions";
import { Properties } from "./properties";
import { SuggestList } from "./suggest-list";
import { createSuggestStore } from "./suggest-store";
import { EditorDocs } from "./views";

type Sync = {
  page: ParsedPage | null;
  front: string;
  originals: WeakMap<PMNodeObject, number>;
  emitted: string | null;
};

const MARKDOWN_HINT = /(^|\n)(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|```|\|.+\||!\[|\$\$)/;

function pasteMarkdown(view: EditorView, event: ClipboardEvent): boolean {
  const data = event.clipboardData;
  const text = data?.getData("text/plain") ?? "";
  const html = data?.getData("text/html") ?? "";
  const fromCode = Boolean(data?.types.includes("vscode-editor-data"));
  if (!text || (html && !fromCode) || !MARKDOWN_HINT.test(text)) return false;
  const { $from } = view.state.selection;
  if ($from.parent.type.spec.code) return false;
  const nodes = markdownToNodes(text).map((node) => view.state.schema.nodeFromJSON(node));
  if (nodes.length === 0) return false;
  view.dispatch(view.state.tr.replaceSelection(new Slice(Fragment.fromArray(nodes), 0, 0)).scrollIntoView());
  return true;
}

export function BlockEditor({
  value,
  docs,
  onChange,
  go,
}: {
  value: string;
  docs: Doc[];
  onChange: (next: string) => void;
  go: (href: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const sync = useRef<Sync>({ page: null, front: "", originals: new WeakMap(), emitted: null });
  const [setup] = useState(() => {
    const stores = { slash: createSuggestStore<SlashItem>(), pages: createSuggestStore<PageOption>() };
    let latest: Doc[] = [];
    const docsSource = { get: () => latest, set: (next: Doc[]) => void (latest = next) };
    return { stores, docsSource, extensions: editorExtensions({ ...stores, docs: docsSource }) };
  });
  const { stores, extensions } = setup;
  const [front, setFront] = useState("");

  useEffect(() => {
    setup.docsSource.set(docs);
    onChangeRef.current = onChange;
  });

  const emit = useCallback((editor: Editor) => {
    const state = sync.current;
    if (!state.page) return;
    const items: BlockItem[] = [];
    editor.state.doc.forEach((child) => {
      const index = state.originals.get(child);
      items.push(index === undefined ? { node: child.toJSON() } : { index });
    });
    const next = joinBlocks({ ...state.page, front: state.front }, items);
    if (next === state.emitted) return;
    state.emitted = next;
    onChangeRef.current(next);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    editorProps: {
      attributes: { class: "md block-doc", "aria-label": "Page content", spellcheck: "true" },
      handlePaste: (view, event) => pasteMarkdown(view, event),
    },
    onUpdate: ({ editor: current }) => emit(current),
  });

  const load = useCallback((current: Editor, source: string) => {
    const page = parsePage(source);
    const state = sync.current;
    state.page = page;
    state.front = page.front;
    state.emitted = source;
    setFront(page.front);
    const content = page.nodes.length > 0 ? page.nodes : [{ type: "paragraph" }];
    current.chain().setMeta("addToHistory", false).setContent({ type: "doc", content }, { emitUpdate: false }).run();
    const originals = new WeakMap<PMNodeObject, number>();
    current.state.doc.forEach((child, _, index) => {
      if (index < page.nodes.length && child.type.name === page.nodes[index].type) originals.set(child, index);
    });
    state.originals = originals;
  }, []);

  useEffect(() => {
    if (!editor || value === sync.current.emitted) return;
    queueMicrotask(() => {
      if (!editor.isDestroyed && value !== sync.current.emitted) load(editor, value);
    });
  }, [editor, load, value]);

  function changeFront(next: string) {
    sync.current.front = next;
    setFront(next);
    if (editor) emit(editor);
  }

  return (
    <EditorDocs.Provider value={{ docs, go }}>
      <div className="block-editor" ref={container}>
        {front ? <Properties front={front} onChange={changeFront} /> : null}
        <EditorContent editor={editor} />
        {editor ? <BlockHandle editor={editor} container={container} /> : null}
        {editor ? <BubbleToolbar editor={editor} /> : null}
        <SuggestList
          store={stores.slash}
          label="Insert a block"
          empty="No matching blocks"
          groupOf={(item) => item.group}
          keyOf={(item) => item.id}
        >
          {(item) => (
            <>
              <span className="suggest-title">{item.label}</span>
              <small>{item.hint}</small>
            </>
          )}
        </SuggestList>
        <SuggestList store={stores.pages} label="Link to a page" empty="No pages match" keyOf={(item) => item.path}>
          {(item) => (
            <>
              <span className="suggest-title">{item.title}</span>
              <small>{item.path}</small>
            </>
          )}
        </SuggestList>
      </div>
    </EditorDocs.Provider>
  );
}
