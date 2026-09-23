"use client";

import Link from "next/link";
import { hrefOf, humanize, nameOf } from "@/lib/workspace/paths";
import type { PageDoc } from "@/lib/workspace/tree";
import { setMode } from "./draft-store";
import { newPage, newPageAt } from "./page-actions";
import { useProject } from "./project-context";

export function MissingPage({ path, first, go }: { path: string; first?: PageDoc; go: (href: string) => void }) {
  const project = useProject();
  const title = humanize(nameOf(path));
  function create() {
    const made = newPageAt(path);
    setMode("edit");
    if (made && made !== path) go(hrefOf(project, made));
  }
  return (
    <div className="stage preview">
      <div className="missing-page">
        <p className="missing-kicker">{path}</p>
        <h1>“{title}” has no page yet</h1>
        <p>Links can point to pages you haven’t written. Create it now and start writing, or open another page.</p>
        <div className="missing-actions">
          <button type="button" className="share-button" onClick={create}>
            Create this page
          </button>
          {first ? (
            <Link href={hrefOf(project, first.path)} className="text-button" onClick={() => go("")}>
              Open {first.title}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyProject({ name, go }: { name: string; go: (href: string) => void }) {
  const project = useProject();
  function create() {
    const made = newPage("", "Untitled");
    setMode("edit");
    if (made) go(hrefOf(project, made));
  }
  return (
    <div className="stage preview">
      <div className="missing-page">
        <p className="missing-kicker">{project}</p>
        <h1>{name} has no pages yet</h1>
        <p>Write the first page, or drop Markdown files on the sidebar to bring them in.</p>
        <div className="missing-actions">
          <button type="button" className="share-button" onClick={create}>
            Write the first page
          </button>
          <Link href="/" className="text-button">
            All projects
          </Link>
        </div>
      </div>
    </div>
  );
}

export function UnknownProject() {
  const project = useProject();
  return (
    <main className="missing">
      <div className="missing-page">
        <p className="missing-kicker">{project}</p>
        <h1>This project isn’t in this browser</h1>
        <p>Projects you create or open from a folder live in the browser that made them. Pick a project from the list, or open the folder again.</p>
        <div className="missing-actions">
          <Link href="/" className="share-button project-link-button">
            All projects
          </Link>
        </div>
      </div>
    </main>
  );
}
