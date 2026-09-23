"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { hrefOf } from "@/lib/workspace/paths";
import { sortProjects, type ProjectEntry } from "@/lib/workspace/projects";
import { useFolderPicker } from "./folder-picker";
import { ProjectDialog } from "./project-dialog";
import { useRegistry } from "./project-store";
import { ProjectTile } from "./project-tile";

export function ProjectSwitcher({ project, projects }: { project?: ProjectEntry; projects: ProjectEntry[] }) {
  const registry = useRegistry();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const slugs = projects.map((entry) => entry.slug);
  const folder = useFolderPicker(slugs);
  const sorted = sortProjects(projects, registry.opened);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("[aria-current='true']")?.focus();
    const away = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("mousedown", away);
    return () => window.removeEventListener("mousedown", away);
  }, [open]);

  function close(refocus = true) {
    setOpen(false);
    if (refocus) button.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(panel.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      items[(index + step + items.length) % items.length]?.focus();
    } else if (event.key === "Tab") {
      close(false);
    }
  }

  const name = project?.name ?? "Projects";
  return (
    <div className="project-switcher">
      <button
        ref={button}
        type="button"
        className="project-switch"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${name}. Switch project`}
        onClick={() => setOpen((value) => !value)}
      >
        {project ? <ProjectTile slug={project.slug} name={project.name} size="sm" /> : null}
        <span className="project-switch-name">{name}</span>
        <UpDownIcon />
      </button>
      {open ? (
        <div ref={panel} className="switcher" role="menu" aria-label="Projects" onKeyDown={onKeyDown}>
          <div className="switcher-label">Projects</div>
          <div className="switcher-list">
            {sorted.map((entry) => {
              const current = entry.slug === project?.slug;
              return (
                <Link
                  key={entry.slug}
                  role="menuitem"
                  href={hrefOf(entry.slug, registry.last[entry.slug])}
                  className="switcher-item"
                  aria-current={current ? "true" : undefined}
                  onClick={() => close(false)}
                >
                  <ProjectTile slug={entry.slug} name={entry.name} size="sm" />
                  <span className="switcher-text">
                    <strong>{entry.name}</strong>
                    <small>{entry.kind === "repo" ? "Repository" : "This browser"}</small>
                  </span>
                  {current ? <CheckIcon /> : null}
                </Link>
              );
            })}
          </div>
          <div className="menu-divider" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="switcher-action"
            onClick={() => {
              close(false);
              setCreating(true);
            }}
          >
            New project
          </button>
          <button
            type="button"
            role="menuitem"
            className="switcher-action"
            onClick={() => {
              close(false);
              folder.pick();
            }}
          >
            Open folder…
          </button>
          <Link role="menuitem" href="/" className="switcher-action" onClick={() => close(false)}>
            All projects
          </Link>
        </div>
      ) : null}
      {folder.input}
      {creating ? <ProjectDialog draft={{ mode: "create" }} taken={slugs} onClose={() => setCreating(false)} /> : null}
    </div>
  );
}

function UpDownIcon() {
  return (
    <svg className="project-switch-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 4.5 6 2l2.5 2.5M3.5 7.5 6 10l2.5-2.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="switcher-check" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 7.2 2.6 2.6L11 4.4" />
    </svg>
  );
}
