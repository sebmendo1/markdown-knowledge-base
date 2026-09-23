"use client";

import type { Editor } from "@tiptap/core";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Slice } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { useEffect, useRef, useState, type RefObject } from "react";
import { notify } from "../toast-host";
import { TURN_INTO, turnInto, type TurnKind } from "./commands";

type Block = { pos: number; top: number; dom: HTMLElement; caret?: boolean };

const TEXT_BLOCKS = new Set(["paragraph", "heading", "bulletList", "orderedList", "taskList", "blockquote", "callout"]);

function blockAt(editor: Editor, test: (dom: HTMLElement, pos: number) => boolean): { pos: number; dom: HTMLElement } | null {
  let found: { pos: number; dom: HTMLElement } | null = null;
  editor.state.doc.forEach((_, offset) => {
    if (found) return;
    const dom = editor.view.nodeDOM(offset);
    if (dom instanceof HTMLElement && test(dom, offset)) found = { pos: offset, dom };
  });
  return found;
}

function setDragging(view: EditorView, dragging: { slice: Slice; move: boolean } | null) {
  view.dragging = dragging;
}

function measure(root: HTMLElement, found: { pos: number; dom: HTMLElement }): Block {
  const rect = found.dom.getBoundingClientRect();
  const style = window.getComputedStyle(found.dom);
  const line = Number.parseFloat(style.lineHeight) || 26;
  const inset = Number.parseFloat(style.paddingTop) || 0;
  const firstLine = Math.min(rect.height, line + inset * 2);
  return { ...found, top: rect.top - root.getBoundingClientRect().top + Math.max(0, (firstLine - 24) / 2) };
}

export function BlockHandle({ editor, container }: { editor: Editor; container: RefObject<HTMLDivElement | null> }) {
  const [block, setBlock] = useState<Block | null>(null);
  const [menu, setMenu] = useState<{ pos: number; x: number; y: number } | null>(null);
  const lastY = useRef<number | null>(null);
  const menuOpen = useRef(false);
  const mouse = useRef(false);

  useEffect(() => {
    menuOpen.current = Boolean(menu);
  }, [menu]);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const host = root;
    const coarse = window.matchMedia("(hover: none)");
    const followCaret = () => coarse.matches && !mouse.current;
    function locateY(clientY: number) {
      const found = blockAt(editor, (dom) => {
        const rect = dom.getBoundingClientRect();
        return clientY >= rect.top - 6 && clientY <= rect.bottom + 6;
      });
      setBlock(found ? measure(host, found) : null);
    }
    function locateSelection() {
      if (!editor.isFocused) return;
      const { $from } = editor.state.selection;
      const pos = $from.depth > 0 ? $from.before(1) : editor.state.selection.from;
      const found = blockAt(editor, (_, offset) => offset === pos);
      setBlock(found ? { ...measure(host, found), caret: true } : null);
    }
    function onMove(event: PointerEvent) {
      mouse.current = event.pointerType === "mouse";
      if (menuOpen.current || !mouse.current) return;
      if ((event.target as HTMLElement).closest(".block-handle")) return;
      lastY.current = event.clientY;
      locateY(event.clientY);
    }
    function onLeave() {
      if (!menuOpen.current && !followCaret()) setBlock(null);
    }
    function onUpdate() {
      if (menuOpen.current) return;
      if (followCaret()) locateSelection();
      else if (lastY.current !== null) locateY(lastY.current);
    }
    function onSelection() {
      if (followCaret() && !menuOpen.current) locateSelection();
    }
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    editor.on("update", onUpdate);
    editor.on("selectionUpdate", onSelection);
    editor.on("focus", onSelection);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      editor.off("update", onUpdate);
      editor.off("selectionUpdate", onSelection);
      editor.off("focus", onSelection);
    };
  }, [container, editor]);

  if (!block) return null;

  function addBelow() {
    if (!block) return;
    const node = editor.state.doc.nodeAt(block.pos);
    if (!node) return;
    const end = block.pos + node.nodeSize;
    editor.chain().insertContentAt(end, { type: "paragraph" }).setTextSelection(end + 1).focus().insertContent("/").run();
  }

  function onDragStart(event: React.DragEvent) {
    if (!block) return;
    const { view } = editor;
    const selection = NodeSelection.create(view.state.doc, block.pos);
    view.dispatch(view.state.tr.setSelection(selection));
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", selection.node.textContent);
    event.dataTransfer.setDragImage(block.dom, 0, 0);
    setDragging(view, { slice: selection.content(), move: true });
  }

  return (
    <>
      <div className={block.caret ? "block-handle is-caret" : "block-handle"} style={{ top: block.top }} contentEditable={false}>
        <button type="button" className="block-add" aria-label="Insert a block below" title="Insert below" onClick={addBelow}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="block-grip"
          draggable
          aria-label="Block options. Drag to move."
          title="Drag to move · click for options"
          aria-haspopup="menu"
          aria-expanded={Boolean(menu)}
          onDragStart={onDragStart}
          onDragEnd={() => window.setTimeout(() => setDragging(editor.view, null), 0)}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setMenu(menu ? null : { pos: block.pos, x: rect.left, y: rect.bottom + 6 });
          }}
        >
          <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden>
            {[2, 7, 12].map((y) => (
              <g key={y}>
                <circle cx="2.5" cy={y} r="1.3" fill="currentColor" />
                <circle cx="7.5" cy={y} r="1.3" fill="currentColor" />
              </g>
            ))}
          </svg>
        </button>
      </div>
      {menu ? (
        <BlockMenu
          editor={editor}
          pos={menu.pos}
          x={menu.x}
          y={menu.y}
          dom={block.dom}
          onClose={() => {
            setMenu(null);
            setBlock(null);
          }}
        />
      ) : null}
    </>
  );
}

function BlockMenu({
  editor,
  pos,
  x,
  y,
  dom,
  onClose,
}: {
  editor: Editor;
  pos: number;
  x: number;
  y: number;
  dom: HTMLElement;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const node = editor.state.doc.nodeAt(pos);

  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const away = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) close.current();
    };
    window.addEventListener("mousedown", away);
    return () => window.removeEventListener("mousedown", away);
  }, []);

  if (!node) return null;
  const current = node;

  function selectInside() {
    const { state, view } = editor;
    const start = state.doc.resolve(pos + 1);
    const end = state.doc.resolve(pos + current.nodeSize - 1);
    view.dispatch(state.tr.setSelection(TextSelection.between(start, end)));
  }

  function run(action: () => void) {
    action();
    onClose();
  }

  function move(step: 1 | -1) {
    const { state, view } = editor;
    const index = state.doc.resolve(pos).index(0);
    const neighbor = index + step;
    if (neighbor < 0 || neighbor >= state.doc.childCount) return;
    const other = state.doc.child(neighbor);
    const tr = state.tr.delete(pos, pos + current.nodeSize);
    const target = step === -1 ? pos - other.nodeSize : pos + other.nodeSize;
    tr.insert(target, current);
    tr.setSelection(NodeSelection.create(tr.doc, target));
    view.dispatch(tr.scrollIntoView());
    view.focus();
  }

  function copyLink() {
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    url.hash = dom.id ? `#${dom.id}` : "";
    void navigator.clipboard?.writeText(url.toString()).then(() => notify(dom.id ? "Link to heading copied" : "Page link copied"));
  }

  function table(action: "addRowAfter" | "addColumnAfter" | "deleteRow" | "deleteColumn") {
    const { state } = editor;
    const inside = state.selection.from > pos && state.selection.to < pos + current.nodeSize;
    if (!inside) editor.commands.setTextSelection(pos + 4);
    editor.chain().focus()[action]().run();
  }

  const textual = TEXT_BLOCKS.has(current.type.name);
  const atomView = dom.querySelector<HTMLElement>(".block-atom-view");
  const left = Math.max(8, Math.min(x, window.innerWidth - 268));
  const top = Math.max(8, Math.min(y, window.innerHeight - 420));

  return (
    <div
      ref={ref}
      className="block-menu"
      role="menu"
      aria-label="Block options"
      style={{ left, top }}
      onKeyDown={(event) => {
        const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
          editor.commands.focus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const step = event.key === "ArrowDown" ? 1 : -1;
          buttons[(index + step + buttons.length) % buttons.length]?.focus();
        }
      }}
    >
      {textual ? (
        <>
          <p className="block-menu-label">Turn into</p>
          <div className="block-menu-grid">
            {TURN_INTO.map((item) => (
              <button
                key={item.kind}
                type="button"
                role="menuitem"
                title={item.label}
                onClick={() =>
                  run(() => {
                    selectInside();
                    turnInto(editor, item.kind as TurnKind);
                  })
                }
              >
                <span className="block-menu-glyph">{item.glyph}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="menu-divider" role="separator" />
        </>
      ) : null}
      {atomView ? (
        <button type="button" role="menuitem" onClick={() => run(() => atomView.click())}>
          Edit source
        </button>
      ) : null}
      {current.type.name === "table" ? (
        <>
          <button type="button" role="menuitem" onClick={() => run(() => table("addRowAfter"))}>
            Add row
          </button>
          <button type="button" role="menuitem" onClick={() => run(() => table("addColumnAfter"))}>
            Add column
          </button>
          <button type="button" role="menuitem" onClick={() => run(() => table("deleteRow"))}>
            Delete row
          </button>
          <button type="button" role="menuitem" onClick={() => run(() => table("deleteColumn"))}>
            Delete column
          </button>
          <div className="menu-divider" role="separator" />
        </>
      ) : null}
      <button
        type="button"
        role="menuitem"
        onClick={() =>
          run(() => {
            const copy = current.type.create(current.attrs, current.content, current.marks);
            editor.view.dispatch(editor.state.tr.insert(pos + current.nodeSize, copy));
          })
        }
      >
        Duplicate
      </button>
      <button type="button" role="menuitem" onClick={() => run(() => move(-1))}>
        Move up
      </button>
      <button type="button" role="menuitem" onClick={() => run(() => move(1))}>
        Move down
      </button>
      <button type="button" role="menuitem" onClick={() => run(copyLink)}>
        Copy link to block
      </button>
      <div className="menu-divider" role="separator" />
      <button
        type="button"
        role="menuitem"
        className="is-danger"
        onClick={() =>
          run(() => {
            editor.view.dispatch(editor.state.tr.delete(pos, pos + current.nodeSize));
            editor.commands.focus();
          })
        }
      >
        Delete
      </button>
    </div>
  );
}
