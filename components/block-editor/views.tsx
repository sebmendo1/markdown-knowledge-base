"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import katex from "katex";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Doc } from "@/lib/docs";
import { CALLOUT_KINDS, wikiSource } from "@/lib/editor/json";
import { hrefFor, resolveDoc } from "@/lib/markdown/links";
import { ChartBlock, CodeBlock, CsvTable, MermaidBlock } from "../blocks";
import { MarkdownView } from "../markdown-view";
import { takeFreshBlock } from "./commands";

export const EditorDocs = createContext<{ docs: Doc[]; go: (href: string) => void }>({ docs: [], go: () => {} });

function useFreshOpen(empty: boolean) {
  return useState(() => takeFreshBlock() || empty);
}

function SourceEditor({
  value,
  label,
  placeholder,
  onChange,
  onDone,
  onDeleteEmpty,
  children,
}: {
  value: string;
  label: ReactNode;
  placeholder: string;
  onChange: (next: string) => void;
  onDone: () => void;
  onDeleteEmpty: () => void;
  children?: ReactNode;
}) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  const area = useRef<HTMLTextAreaElement>(null);
  if (value !== seen) {
    setSeen(value);
    if (value !== draft) setDraft(value);
  }

  useLayoutEffect(() => {
    const element = area.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  }, [draft]);

  useEffect(() => {
    const element = area.current;
    element?.focus();
    element?.setSelectionRange(element.value.length, element.value.length);
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape" || (event.key === "Enter" && (event.metaKey || event.ctrlKey))) {
      event.preventDefault();
      onDone();
    } else if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      const element = event.currentTarget;
      const { selectionStart, selectionEnd } = element;
      const next = `${draft.slice(0, selectionStart)}  ${draft.slice(selectionEnd)}`;
      setDraft(next);
      onChange(next);
      requestAnimationFrame(() => element.setSelectionRange(selectionStart + 2, selectionStart + 2));
    } else if (event.key === "Backspace" && draft === "") {
      event.preventDefault();
      onDeleteEmpty();
    }
  }

  return (
    <div className="source-editor" contentEditable={false}>
      <div className="source-editor-bar">
        {label}
        <span className="source-editor-gap" />
        <button type="button" className="source-editor-done" onClick={onDone}>
          Done <kbd>Esc</kbd>
        </button>
      </div>
      <textarea
        ref={area}
        value={draft}
        rows={1}
        spellCheck={false}
        placeholder={placeholder}
        onChange={(event) => {
          setDraft(event.target.value);
          onChange(event.target.value);
        }}
        onKeyDown={onKeyDown}
      />
      {children}
    </div>
  );
}

function useBlockEditing(props: NodeViewProps, empty: boolean) {
  const [editing, setEditing] = useFreshOpen(empty);
  function done() {
    setEditing(false);
    const pos = props.getPos();
    if (typeof pos === "number") props.editor.chain().focus().setNodeSelection(pos).run();
  }
  function remove() {
    props.deleteNode();
    props.editor.commands.focus();
  }
  function open(event: React.MouseEvent) {
    if (!props.editor.isEditable) return;
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    setEditing(true);
  }
  function blur(event: React.FocusEvent) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEditing(false);
  }
  return { editing, done, remove, open, blur };
}

const FENCE_LABELS: Record<string, string> = {
  mermaid: "Mermaid diagram",
  chart: "Chart",
  vega: "Chart",
  "vega-lite": "Chart",
  csv: "CSV table",
  tsv: "TSV table",
};

function FencePreview({ language, code }: { language: string; code: string }) {
  if (!code.trim()) return <p className="block-empty">Empty {FENCE_LABELS[language]?.toLowerCase() ?? "code block"}. Click to write.</p>;
  if (language === "mermaid") return <MermaidBlock chart={code} />;
  if (language === "chart" || language === "vega" || language === "vega-lite") return <ChartBlock source={code} />;
  if (language === "csv" || language === "tsv") return <CsvTable source={code} delimiter={language === "tsv" ? "\t" : ","} />;
  return <CodeBlock code={code} lang={language} />;
}

export function FenceView(props: NodeViewProps) {
  const language = String(props.node.attrs.language ?? "");
  const code = String(props.node.attrs.code ?? "");
  const block = useBlockEditing(props, code === "");
  const visual = Boolean(FENCE_LABELS[language]);
  return (
    <NodeViewWrapper
      className={["block-atom", block.editing ? "is-editing" : "", props.selected ? "is-selected" : ""].join(" ")}
      onBlur={block.blur}
    >
      {block.editing ? (
        <SourceEditor
          value={code}
          placeholder={visual ? "Write the source…" : "Write code…"}
          label={
            <input
              className="source-editor-lang"
              value={language}
              placeholder="Language"
              aria-label="Code language"
              onChange={(event) => props.updateAttributes({ language: event.target.value.trim() })}
            />
          }
          onChange={(next) => props.updateAttributes({ code: next })}
          onDone={block.done}
          onDeleteEmpty={block.remove}
        >
          {visual && code.trim() ? (
            <div className="source-editor-preview">
              <FencePreview language={language} code={code} />
            </div>
          ) : null}
        </SourceEditor>
      ) : (
        <div className="block-atom-view" onClick={block.open}>
          <FencePreview language={language} code={code} />
        </div>
      )}
    </NodeViewWrapper>
  );
}

function Katex({ value, display }: { value: string; display: boolean }) {
  const html = useMemo(() => katex.renderToString(value, { displayMode: display, throwOnError: false }), [value, display]);
  return <span className={display ? "math-display" : "math-inline"} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MathBlockView(props: NodeViewProps) {
  const value = String(props.node.attrs.value ?? "");
  const block = useBlockEditing(props, value === "");
  return (
    <NodeViewWrapper
      className={["block-atom", block.editing ? "is-editing" : "", props.selected ? "is-selected" : ""].join(" ")}
      onBlur={block.blur}
    >
      {block.editing ? (
        <SourceEditor
          value={value}
          placeholder="E = mc^2"
          label={<span className="source-editor-label">Math · KaTeX</span>}
          onChange={(next) => props.updateAttributes({ value: next })}
          onDone={block.done}
          onDeleteEmpty={block.remove}
        >
          {value.trim() ? (
            <div className="source-editor-preview">
              <Katex value={value} display />
            </div>
          ) : null}
        </SourceEditor>
      ) : (
        <div className="block-atom-view math-block" onClick={block.open}>
          {value.trim() ? <Katex value={value} display /> : <p className="block-empty">Empty equation. Click to write.</p>}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export function InlineMathView(props: NodeViewProps) {
  const value = String(props.node.attrs.value ?? "");
  const [editing, setEditing] = useFreshOpen(value === "");
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);

  function finish() {
    setEditing(false);
    if (!draft.trim()) {
      props.deleteNode();
      return;
    }
    props.updateAttributes({ value: draft });
    const pos = props.getPos();
    if (typeof pos === "number") props.editor.chain().focus().setTextSelection(pos + props.node.nodeSize).run();
  }

  return (
    <NodeViewWrapper as="span" className={props.selected ? "inline-math is-selected" : "inline-math"}>
      {editing ? (
        <input
          ref={input}
          className="inline-math-input"
          value={draft}
          size={Math.max(4, draft.length)}
          placeholder="x^2"
          aria-label="Inline math"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={finish}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "Escape") {
              event.preventDefault();
              finish();
            }
          }}
        />
      ) : (
        <span onClick={() => props.editor.isEditable && setEditing(true)}>
          <Katex value={value} display={false} />
        </span>
      )}
    </NodeViewWrapper>
  );
}

export function WikiLinkView(props: NodeViewProps) {
  const { docs, go } = useContext(EditorDocs);
  const target = String(props.node.attrs.target ?? "");
  const heading = props.node.attrs.heading ? String(props.node.attrs.heading) : undefined;
  const doc = resolveDoc(docs, target);
  const label = String(props.node.attrs.label || heading || doc?.title || target);
  return (
    <NodeViewWrapper
      as="span"
      className={[doc ? "wiki-chip" : "wiki-chip wiki-broken", props.selected ? "is-selected" : ""].join(" ")}
      title={doc ? `Open ${doc.title}` : `No page named ${target}`}
      onClick={() => {
        if (doc) go(hrefFor(doc.path, heading));
      }}
    >
      <span className="wiki-chip-icon" aria-hidden>
        ↗
      </span>
      {label}
    </NodeViewWrapper>
  );
}

export function EmbedView(props: NodeViewProps) {
  const { docs } = useContext(EditorDocs);
  const target = String(props.node.attrs.target ?? "");
  const block = useBlockEditing(props, target === "");
  const [query, setQuery] = useState(target);
  const matches = docs
    .filter((doc) => `${doc.title} ${doc.path}`.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 6);

  function choose(path: string) {
    props.updateAttributes({ target: path.replace(/\.md$/i, ""), heading: null });
    block.done();
  }

  return (
    <NodeViewWrapper
      className={["block-atom", block.editing ? "is-editing" : "", props.selected ? "is-selected" : ""].join(" ")}
      onBlur={block.blur}
    >
      {block.editing ? (
        <div className="source-editor embed-picker" contentEditable={false}>
          <div className="source-editor-bar">
            <span className="source-editor-label">Embed a page</span>
            <span className="source-editor-gap" />
            <button type="button" className="source-editor-done" onClick={block.done}>
              Done <kbd>Esc</kbd>
            </button>
          </div>
          <input
            autoFocus
            className="embed-picker-input"
            value={query}
            placeholder="Search pages"
            aria-label="Search pages to embed"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") block.done();
              if (event.key === "Enter" && matches[0]) {
                event.preventDefault();
                choose(matches[0].path);
              }
            }}
          />
          <div className="embed-picker-list">
            {matches.map((doc) => (
              <button key={doc.path} type="button" onClick={() => choose(doc.path)}>
                <span>{doc.title}</span>
                <small>{doc.path}</small>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="block-atom-view" onClick={block.open}>
          {target ? (
            <MarkdownView source={wikiSource({ ...props.node.attrs, embed: true })} docs={docs} />
          ) : (
            <p className="block-empty">Choose a page to embed.</p>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export function RawView(props: NodeViewProps) {
  const { docs } = useContext(EditorDocs);
  const source = String(props.node.attrs.source ?? "");
  const block = useBlockEditing(props, source === "");
  return (
    <NodeViewWrapper
      className={["block-atom", block.editing ? "is-editing" : "", props.selected ? "is-selected" : ""].join(" ")}
      onBlur={block.blur}
    >
      {block.editing ? (
        <SourceEditor
          value={source}
          placeholder="Markdown or HTML"
          label={<span className="source-editor-label">Markdown</span>}
          onChange={(next) => props.updateAttributes({ source: next })}
          onDone={block.done}
          onDeleteEmpty={block.remove}
        >
          {source.trim() ? (
            <div className="source-editor-preview">
              <MarkdownView source={source} docs={docs} depth={1} />
            </div>
          ) : null}
        </SourceEditor>
      ) : (
        <div className="block-atom-view raw-view" onClick={block.open}>
          <MarkdownView source={source} docs={docs} depth={1} />
        </div>
      )}
    </NodeViewWrapper>
  );
}

export function CalloutView(props: NodeViewProps) {
  const kind = String(props.node.attrs.kind ?? "note");
  function cycle() {
    const index = CALLOUT_KINDS.indexOf(kind as never);
    props.updateAttributes({ kind: CALLOUT_KINDS[(index + 1) % CALLOUT_KINDS.length] });
  }
  return (
    <NodeViewWrapper className={`callout callout-${kind}`}>
      <button type="button" contentEditable={false} className="callout-title callout-switch" title="Change callout type" onClick={cycle}>
        {kind}
      </button>
      <NodeViewContent className="callout-body" />
    </NodeViewWrapper>
  );
}
