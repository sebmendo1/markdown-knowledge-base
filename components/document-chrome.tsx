"use client";

import { useState, type ReactNode } from "react";
import { hrefOf } from "@/lib/workspace/paths";
import { setMode, type Mode } from "./draft-store";
import { DotsIcon } from "./action-icons";
import { GearIcon } from "./gear-icon";
import { downloadPage, duplicate, revert, saveVersion, trash } from "./page-actions";
import { PanelIcon } from "./panel-icon";
import { PopoverMenu, type MenuItem } from "./popover-menu";
import { preloadBlockEditor } from "./preview-stage";
import { openSettings } from "./settings-host";
import { openShare } from "./share-host";
import { emit } from "./ui-events";
import type { PageState } from "./workspace-view";

const STATUS: Record<PageState, string> = {
  repo: "Repository copy",
  edited: "Edited in this browser",
  created: "Created in this browser",
  missing: "No page here yet",
};

const MODE_LABEL: Record<Mode, string> = {
  preview: "Viewing",
  edit: "Editing",
  source: "Markdown source",
};

export function DocumentChrome({
  title,
  path,
  pageId,
  state,
  words,
  mode,
  onOpenFiles,
  go,
  children,
}: {
  title: string;
  path: string;
  pageId: string | null;
  state: PageState;
  words: number;
  mode: Mode;
  onOpenFiles: () => void;
  go: (href: string) => void;
  children: ReactNode;
}) {
  const editing = mode !== "preview";
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const slug = path.replace(/\.md$/i, "").split("/");

  function items(id: string): MenuItem[] {
    return [
      {
        label: "Rename",
        run: () => {
          onOpenFiles();
          window.setTimeout(() => emit("markdown-kb-rename", { kind: "page", id }), 0);
        },
      },
      {
        label: "Duplicate",
        run: () => {
          const copy = duplicate(id);
          if (copy) go(hrefOf(copy));
        },
      },
      { label: "Move to…", run: () => emit("markdown-kb-move", { kind: "page", id }) },
      "divider",
      { label: "Save a version", hint: "⌘S", run: () => saveVersion(id) },
      { label: "Version history", run: () => emit("markdown-kb-history", id) },
      mode === "source"
        ? { label: "Edit as blocks", hint: "⌘/", run: () => setMode("edit") }
        : { label: "View Markdown source", hint: "⌘/", run: () => setMode("source") },
      { label: "Download Markdown", run: () => downloadPage(id) },
      ...(state === "edited" ? [{ label: "Revert to repository copy", run: () => revert(id) }] : []),
      "divider",
      { label: "Move to Trash", danger: true, run: () => trash(id) },
    ];
  }

  return (
    <>
      <header className="topbar">
        <button type="button" className="icon-button sidebar-reveal" aria-label="Show sidebar" onClick={onOpenFiles}>
          <PanelIcon />
        </button>
        <p className="crumbs">
          {slug.slice(0, -1).join(" / ")}
          {slug.length > 1 ? " / " : ""}
          <strong>{slug.at(-1)}.md</strong>
        </p>
        <div className="topbar-spacer" />
        {pageId ? (
          <>
            <button
              type="button"
              className={editing ? "edit-toggle is-on" : "edit-toggle"}
              aria-pressed={editing}
              aria-label={editing ? "Turn editing off" : "Turn editing on"}
              onPointerEnter={preloadBlockEditor}
              onFocus={preloadBlockEditor}
              onClick={() => setMode(editing ? "preview" : "edit")}
            >
              {editing ? "Editing" : "Edit"}
            </button>
            <button type="button" className="share-button" onClick={() => openShare({ title, path, state })}>
              Share
            </button>
            <button
              type="button"
              className="icon-button page-menu-button"
              aria-label="Page actions"
              aria-haspopup="menu"
              aria-expanded={Boolean(menu)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setMenu(menu ? null : { x: rect.right - 232, y: rect.bottom + 6 });
              }}
            >
              <DotsIcon />
            </button>
          </>
        ) : null}
        <button type="button" className="icon-button settings-launch" aria-label="Settings" onClick={openSettings}>
          <GearIcon />
        </button>
      </header>
      {children}
      <footer className="status">
        <span>{STATUS[state]}</span>
        <span className="status-gap" />
        {pageId ? <span>{words} words</span> : null}
        {pageId ? <span>{MODE_LABEL[mode]}</span> : null}
      </footer>
      {menu && pageId ? <PopoverMenu x={menu.x} y={menu.y} label="Page actions" items={items(pageId)} onClose={() => setMenu(null)} /> : null}
    </>
  );
}
