"use client";

import type { Workspace } from "@/lib/workspace/model";
import type { PageDoc } from "@/lib/workspace/tree";
import { GearIcon } from "./gear-icon";
import { PageTree } from "./page-tree";
import { PanelIcon } from "./panel-icon";
import { openSettings } from "./settings-host";
import { emit } from "./ui-events";

export function FileSidebar({
  ws,
  docs,
  currentPath,
  open,
  onGo,
  onSearch,
  onRetract,
}: {
  ws: Workspace;
  docs: PageDoc[];
  currentPath: string;
  open: boolean;
  onGo: (href: string) => void;
  onSearch: () => void;
  onRetract: () => void;
}) {
  return (
    <aside className={open ? "sidebar is-open" : "sidebar"}>
      <div className="brand-row">
        <button type="button" className="icon-button" aria-label="Hide sidebar" onClick={onRetract}>
          <PanelIcon />
        </button>
        <div className="brand">markdown-kb</div>
      </div>
      <button type="button" className="search-button" onClick={onSearch}>
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
      <PageTree ws={ws} docs={docs} currentPath={currentPath} onGo={onGo} />
      <div className="sidebar-foot">
        <button type="button" className="settings-entry" onClick={() => emit("markdown-kb-trash", null)}>
          <TrashIcon />
          Trash
          {ws.trash.length > 0 ? <span className="count">{ws.trash.length}</span> : null}
        </button>
        <button type="button" className="settings-entry" onClick={openSettings}>
          <GearIcon />
          Settings
        </button>
      </div>
    </aside>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 4.5h11M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M4 4.5l.7 8.6a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9l.7-8.6" />
    </svg>
  );
}
