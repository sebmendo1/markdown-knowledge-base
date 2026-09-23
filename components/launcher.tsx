"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { hrefOf, humanize } from "@/lib/workspace/paths";
import { diskListSignature } from "@/lib/store/sync";
import { projectKindLabel, projectStats, sortProjects, type ProjectEntry, type ProjectSummary } from "@/lib/workspace/projects";
import { useDiskProjectWatch } from "./disk-sync";
import { DotsIcon, PlusIcon } from "./action-icons";
import { useFolderPicker } from "./folder-picker";
import { GearIcon } from "./gear-icon";
import { exportWorkspace } from "./page-actions";
import { PopoverMenu, type MenuItem } from "./popover-menu";
import { ProjectDialog, type ProjectDraft } from "./project-dialog";
import { deleteProject, useRegistry } from "./project-store";
import { ProjectTile } from "./project-tile";
import { openSettings, SettingsHost } from "./settings-host";
import { notify } from "./toast-host";
import { storedWorkspace, useHydrated } from "./workspace-store";

type Card = ProjectEntry & { paths: string[] };

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function ago(at: number) {
  const seconds = Math.round((at - Date.now()) / 1000);
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return "just now";
}

export function Launcher({ repo }: { repo: ProjectSummary[] }) {
  const router = useRouter();
  const registry = useRegistry();
  const hydrated = useHydrated();
  const diskSignature = useMemo(() => diskListSignature(repo.filter((project) => project.kind === "disk")), [repo]);
  useDiskProjectWatch(diskSignature, () => router.refresh());
  const [dialog, setDialog] = useState<ProjectDraft | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  const [doomed, setDoomed] = useState<Card | null>(null);

  const projects = useMemo<Card[]>(
    () => [...repo, ...registry.local.map((project) => ({ ...project, kind: "local" as const, paths: [] }))],
    [repo, registry.local],
  );
  const slugs = projects.map((project) => project.slug);
  const folder = useFolderPicker(slugs);
  const sorted = hydrated ? sortProjects(projects, registry.opened) : projects;
  const stats = useMemo(
    () => new Map(projects.map((project) => [project.slug, projectStats(hydrated ? storedWorkspace(project.slug) : null, project.paths)])),
    [projects, hydrated],
  );

  function openMenu(project: Card, button: HTMLElement) {
    const rect = button.getBoundingClientRect();
    setMenu({
      x: rect.right - 224,
      y: rect.bottom + 4,
      items: [
        { label: "Rename", run: () => setDialog({ mode: "rename", slug: project.slug, name: project.name, description: project.description }) },
        { label: "Export (.zip)", run: () => exportWorkspace(project.slug) },
        "divider",
        { label: "Delete project", danger: true, run: () => setDoomed(project) },
      ],
    });
  }

  return (
    <div className="launcher">
      <header className="launcher-top">
        <div className="launcher-brand">markdown-kb</div>
        <div className="topbar-spacer" />
        <button type="button" className="icon-button" aria-label="Settings" onClick={openSettings}>
          <GearIcon />
        </button>
      </header>
      <main className="launcher-body">
        <div className="launcher-head">
          <div>
            <h1>Projects</h1>
            <p>Each project is a folder of Markdown pages. Open one to read and edit it, and switch between them from the sidebar.</p>
          </div>
          <div className="launcher-actions">
            <button type="button" className="launcher-secondary" onClick={folder.pick}>
              <FolderIcon />
              Open folder
            </button>
            <button type="button" className="share-button launcher-primary" onClick={() => setDialog({ mode: "create" })}>
              <PlusIcon />
              New project
            </button>
          </div>
        </div>
        <ul className="project-grid" aria-label="Projects">
          {sorted.map((project) => {
            const stat = stats.get(project.slug) ?? { pages: 0, folders: [], updatedAt: 0 };
            const opened = hydrated ? registry.opened[project.slug] : undefined;
            const shown = stat.folders.slice(0, 4);
            return (
              <li key={project.slug} className="project-card">
                <Link href={hrefOf(project.slug, hydrated ? registry.last[project.slug] : undefined)} className="project-card-link">
                  <div className="project-card-head">
                    <ProjectTile slug={project.slug} name={project.name} size="lg" />
                    <div className="project-card-title">
                      <h2>{project.name}</h2>
                      <span>{projectKindLabel(project.kind)}</span>
                    </div>
                  </div>
                  <p className="project-card-desc">{project.description || "A folder of Markdown pages."}</p>
                  {shown.length > 0 ? (
                    <ul className="project-card-folders" aria-label="Folders">
                      {shown.map((name) => (
                        <li key={name}>
                          <FolderIcon />
                          {humanize(name)}
                        </li>
                      ))}
                      {stat.folders.length > shown.length ? <li>+{stat.folders.length - shown.length}</li> : null}
                    </ul>
                  ) : null}
                  <div className="project-card-foot">
                    <span>
                      {plural(stat.pages, "page")} · {plural(stat.folders.length, "folder")}
                    </span>
                    <span>{opened ? `Opened ${ago(opened)}` : ""}</span>
                  </div>
                </Link>
                {project.kind === "local" ? (
                  <button
                    type="button"
                    className="icon-button project-card-menu"
                    aria-label={`${project.name} actions`}
                    aria-haspopup="menu"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => (menu ? setMenu(null) : openMenu(project, event.currentTarget))}
                  >
                    <DotsIcon />
                  </button>
                ) : null}
              </li>
            );
          })}
          <li className="project-card is-new">
            <button type="button" className="project-card-link" onClick={() => setDialog({ mode: "create" })}>
              <span className="project-new-icon">
                <PlusIcon />
              </span>
              <strong>New project</strong>
              <span>Start with a blank page, or open a folder of .md files.</span>
            </button>
          </li>
        </ul>
      </main>
      {folder.input}
      {menu ? <PopoverMenu x={menu.x} y={menu.y} label="Project actions" items={menu.items} onClose={() => setMenu(null)} /> : null}
      {dialog ? <ProjectDialog draft={dialog} taken={slugs} onClose={() => setDialog(null)} /> : null}
      {doomed ? (
        <DeleteDialog
          project={doomed}
          pages={stats.get(doomed.slug)?.pages ?? 0}
          onClose={() => setDoomed(null)}
          onDelete={() => {
            deleteProject(doomed.slug);
            notify(`Deleted “${doomed.name}”`);
            setDoomed(null);
          }}
        />
      ) : null}
      <SettingsHost />
    </div>
  );
}

function DeleteDialog({ project, pages, onClose, onDelete }: { project: Card; pages: number; onClose: () => void; onDelete: () => void }) {
  return (
    <div className="overlay share-overlay" onMouseDown={onClose}>
      <div
        className="share-dialog"
        role="alertdialog"
        aria-label={`Delete ${project.name}`}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <header className="share-top">
          <h2>Delete “{project.name}”?</h2>
        </header>
        <div className="share-body">
          <p>
            Its {plural(pages, "page")} and their versions leave this browser for good. Export the project first to keep a copy.
          </p>
          <div className="share-actions">
            <button type="button" className="text-button project-cancel" onClick={onClose} autoFocus>
              Cancel
            </button>
            <button type="button" className="share-button is-danger" onClick={onDelete}>
              Delete project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.5 1.6h4.9A1.5 1.5 0 0 1 14 6.1v5.4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5z" />
    </svg>
  );
}
