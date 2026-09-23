"use client";

import type { Editor } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEffect, useReducer, useState } from "react";
import { currentKind, TURN_INTO, turnInto, type TurnKind } from "./commands";

type MarkButton = { mark: string; label: string; glyph: string; toggle: (editor: Editor) => void };

const MARKS: MarkButton[] = [
  { mark: "bold", label: "Bold (⌘B)", glyph: "B", toggle: (editor) => editor.chain().focus().toggleBold().run() },
  { mark: "italic", label: "Italic (⌘I)", glyph: "I", toggle: (editor) => editor.chain().focus().toggleItalic().run() },
  { mark: "strike", label: "Strikethrough", glyph: "S", toggle: (editor) => editor.chain().focus().toggleStrike().run() },
  { mark: "code", label: "Inline code (⌘E)", glyph: "</>", toggle: (editor) => editor.chain().focus().toggleCode().run() },
  { mark: "highlight", label: "Highlight", glyph: "==", toggle: (editor) => editor.chain().focus().toggleHighlight().run() },
];

const BUBBLE_OPTIONS = { placement: "top" as const, offset: 8 };

function showBubble({ editor, state, from, to }: { editor: Editor; state: Editor["state"]; from: number; to: number }) {
  if (!editor.isEditable || from === to) return false;
  if (state.selection instanceof NodeSelection) return false;
  return state.doc.textBetween(from, to).trim().length > 0;
}

export function BubbleToolbar({ editor }: { editor: Editor }) {
  const [, refresh] = useReducer((count: number) => count + 1, 0);
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    editor.on("transaction", refresh);
    return () => {
      editor.off("transaction", refresh);
    };
  }, [editor]);

  function applyLink() {
    const href = link?.trim() ?? "";
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    setLink(null);
  }

  function pageLink() {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    editor.chain().focus().insertContentAt({ from, to }, `[[${text}`).run();
  }

  const kind = currentKind(editor);

  return (
    <BubbleMenu
      editor={editor}
      options={BUBBLE_OPTIONS}
      shouldShow={showBubble}
      className="bubble"
    >
      {link !== null ? (
        <form
          className="bubble-link"
          onSubmit={(event) => {
            event.preventDefault();
            applyLink();
          }}
        >
          <input
            autoFocus
            value={link}
            placeholder="Paste a link, or leave empty to remove"
            aria-label="Link address"
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setLink(null);
                editor.commands.focus();
              }
            }}
          />
          <button type="submit">Apply</button>
        </form>
      ) : (
        <>
          <select
            className="bubble-turn"
            aria-label="Turn into"
            value={kind ?? ""}
            onChange={(event) => turnInto(editor, event.target.value as TurnKind)}
          >
            {kind === null ? <option value="">Block</option> : null}
            {TURN_INTO.map((item) => (
              <option key={item.kind} value={item.kind}>
                {item.label}
              </option>
            ))}
          </select>
          <span className="bubble-gap" />
          {MARKS.map((item) => (
            <button
              key={item.mark}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={editor.isActive(item.mark)}
              className={`bubble-mark bubble-${item.mark}${editor.isActive(item.mark) ? " is-on" : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => item.toggle(editor)}
            >
              {item.glyph}
            </button>
          ))}
          <span className="bubble-gap" />
          <button
            type="button"
            className={editor.isActive("link") ? "bubble-mark is-on" : "bubble-mark"}
            title="Link (⌘K in text)"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setLink(String(editor.getAttributes("link").href ?? ""))}
          >
            Link
          </button>
          <button type="button" className="bubble-mark" title="Link to a page" onMouseDown={(event) => event.preventDefault()} onClick={pageLink}>
            Page
          </button>
        </>
      )}
    </BubbleMenu>
  );
}
