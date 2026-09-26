"use client";

import type { Workspace } from "@/lib/workspace/model";
import type { ProjectEntry } from "@/lib/workspace/projects";
import type { PageDoc } from "@/lib/workspace/tree";
import { GearIcon } from "./gear-icon";
import { PageTree } from "./page-tree";
import { PanelIcon } from "./panel-icon";
import { ProjectSwitcher } from "./project-switcher";
import { openSettings } from "./settings-host";

export function FileSidebar({
  project,
  projects,
  ws,
  docs,
  currentPath,
  open,
  onGo,
  onSearch,
  onRetract,
}: {
  project?: ProjectEntry;
  projects: ProjectEntry[];
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
      </div>
      <div className="project-row">
        <ProjectSwitcher project={project} projects={projects} />
      </div>
      <button type="button" className="search-button" onClick={onSearch}>
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
      <PageTree ws={ws} docs={docs} currentPath={currentPath} onGo={onGo} />
      {/* One account row (F08-REQ-037). It reads "Settings" until sign-in exists; Trash is in the Pages menu. */}
      <div className="sidebar-foot">
        <button type="button" className="settings-entry" onClick={openSettings}>
          <GearIcon />
          Settings
        </button>
      </div>
    </aside>
  );
}

