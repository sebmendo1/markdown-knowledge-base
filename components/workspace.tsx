"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Doc } from "@/lib/docs";
import type { Heading } from "@/lib/markdown/outline";
import { folderOf, hrefOf } from "@/lib/workspace/paths";
import type { ProjectEntry } from "@/lib/workspace/projects";
import { backlinks, rendersAsRepo } from "@/lib/workspace/tree";
import { onAgentEdit, resumeFollowing, useAgentActivity } from "./agent-activity";
import { setMode, setSidebarExpanded, useMode } from "./draft-store";
import { prefersReducedMotion, usePreferences } from "./preferences";
import { editPage } from "./history-store";
import { ProjectContext } from "./project-context";
import { touchProject, useRegistry } from "./project-store";
import { emit, listen } from "./ui-events";
import { useActiveHeading } from "./use-active-heading";
import { useEditorKeys } from "./use-editor-keys";
import { useHeadings } from "./use-headings";
import { loadDiskVersion, startDiskSync, useDiskConflicts } from "./disk-sync";
import { docOf, useHydrated, useWorkspace } from "./workspace-store";
import { WorkspaceView, type PageState } from "./workspace-view";

export function Workspace({
  project,
  projects: repoProjects,
  docs: repoDocs,
  currentPath,
  rendered,
  headings: repoHeadings,
  sync = false,
}: {
  project: string;
  projects: ProjectEntry[];
  docs: Doc[];
  currentPath: string;
  rendered: ReactNode;
  headings: Heading[];
  sync?: boolean;
}) {
  const router = useRouter();
  const ws = useWorkspace(project, repoDocs, { preserveDirtyBase: sync });
  const conflicts = useDiskConflicts();
  const hydrated = useHydrated();
  const registry = useRegistry();
  const projects = useMemo(
    () => [...repoProjects, ...registry.local.map((item): ProjectEntry => ({ ...item, kind: "local" }))],
    [repoProjects, registry.local],
  );
  const entry = projects.find((item) => item.slug === project);
  const docs = useMemo(() => ws.pages.map(docOf), [ws.pages]);
  const page = ws.pages.find((item) => item.path === currentPath);
  const doc = page ? docOf(page) : undefined;
  const value = page?.content ?? "";
  const mode = useMode();
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const last = useRef<{ id: string; path: string } | null>(null);
  const agents = useAgentActivity();
  const [watch, setWatch] = useState<{ agent: string; path: string } | null>(null);
  const { followAgents } = usePreferences();
  const followRef = useRef({ currentPath, mode, paused: agents.followPaused || !followAgents });
  useEffect(() => {
    followRef.current = { currentPath, mode, paused: agents.followPaused || !followAgents };
  }, [currentPath, mode, agents.followPaused, followAgents]);

  // Follow an agent to the page it is editing, once the browser has its edit. Someone typing is not
  // pulled away; they get a Watch prompt instead.
  useEffect(
    () =>
      onAgentEdit((event) => {
        if (event.project !== project || !event.path) return;
        if (event.op !== "create" && event.op !== "update" && event.op !== "move") return;
        const now = followRef.current;
        if (event.path === now.currentPath) return;
        if (now.mode === "preview" && !now.paused) router.push(hrefOf(project, event.path));
        else setWatch({ agent: event.agent, path: event.path });
      }),
    [project, router],
  );
  const watching = watch && agents.sessions.some((item) => item.project === project && item.path === watch.path) ? watch : null;

  function newPageHere() {
    setSidebarExpanded(true);
    setSidebarOpen(true);
    window.setTimeout(() => emit("markdown-kb-create", { kind: "page", folder: page ? folderOf(currentPath) : "" }), 0);
  }

  useEffect(() => listen("markdown-kb-help", () => setHelpOpen(true)), []);

  useEditorKeys({ mode, pageId: page?.id ?? null, setOutlineOpen, setSidebarOpen, setPaletteOpen, setHelpOpen, onNewPage: newPageHere });

  useEffect(() => {
    if (!sync) return;
    return startDiskSync(project, () => router.refresh());
  }, [sync, project, router]);

  useEffect(() => {
    const edit = new URLSearchParams(window.location.search).get("edit");
    if (edit === "1") setMode("edit");
    if (edit === "0") setMode("preview");
    if (edit === "1" || edit === "0") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !entry) return;
    if (page) {
      last.current = { id: page.id, path: page.path };
      touchProject(project, page.path);
      return;
    }
    if (currentPath === "") {
      const remembered = registry.last[project];
      const target = ws.pages.find((item) => item.path === remembered) ?? ws.pages[0];
      if (target) router.replace(hrefOf(project, target.path));
      return;
    }
    const previous = last.current;
    if (!previous || previous.path !== currentPath) return;
    const moved = ws.pages.find((item) => item.id === previous.id);
    if (moved) {
      last.current = { id: moved.id, path: moved.path };
      router.replace(hrefOf(project, moved.path));
    } else if (ws.trash.some((item) => item.id === previous.id)) {
      last.current = null;
      router.replace(hrefOf(project, ws.pages[0]?.path));
    }
  }, [hydrated, entry, page, currentPath, ws, router, project, registry.last]);

  useEffect(() => {
    if (doc) document.title = `${doc.title} · ${entry?.name ?? "markdown-kb"}`;
    else if (entry && currentPath === "") document.title = entry.name;
  }, [doc, entry, currentPath]);

  const asRepo = useMemo(
    () => Boolean(page && page.path === page.origin && rendersAsRepo(currentPath, docs, repoDocs)),
    [page, currentPath, docs, repoDocs],
  );
  const agentScreen = Boolean(page && mode === "preview" && !agents.followPaused && agents.sessions.some((item) => item.project === project && item.path === currentPath));
  // The agent editing screen mounts a new preview element, so the outline has to watch that one.
  const headings = useHeadings(previewRef, asRepo ? repoHeadings : [], `${currentPath}${agentScreen ? "#agent" : ""}`);
  const linkedFrom = useMemo(() => (page ? backlinks(docs, currentPath) : []), [docs, currentPath, page]);
  useActiveHeading(previewRef, value, mode, setActiveHeading);

  const state: PageState = !page
    ? "missing"
    : page.origin === undefined
      ? "created"
      : page.base !== undefined && page.content !== page.base
        ? "edited"
        : "repo";

  function go(href: string) {
    setPaletteOpen(false);
    setSidebarOpen(false);
    if (href) router.push(href);
  }

  function jump(id: string) {
    const motion = prefersReducedMotion() ? "auto" : "smooth";
    previewRef.current?.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ behavior: motion, block: "start" });
  }

  return (
    <ProjectContext.Provider value={project}>
      <WorkspaceView
        project={entry}
        projects={projects}
        projectKnown={!hydrated || Boolean(entry)}
        ws={ws}
        docs={docs}
        hydrated={hydrated}
        currentPath={currentPath}
        pageId={page?.id ?? null}
        title={doc?.title ?? ""}
        state={state}
        mode={mode}
        words={value.trim() ? value.trim().split(/\s+/).length : 0}
        outlineOpen={outlineOpen}
        sidebarOpen={sidebarOpen}
        paletteOpen={paletteOpen}
        helpOpen={helpOpen}
        value={value}
        rendered={asRepo ? rendered : null}
        headings={headings}
        linkedFrom={linkedFrom}
        activeHeading={activeHeading}
        previewRef={previewRef}
        setSidebarOpen={setSidebarOpen}
        setPaletteOpen={setPaletteOpen}
        setHelpOpen={setHelpOpen}
        onChange={(next) => page && editPage(page.id, next)}
        agentSession={page ? agents.sessions.find((item) => item.project === project && item.path === currentPath) : undefined}
        agentFollowing={!agents.followPaused}
        agentWatch={watching && watching.path !== currentPath ? watching : null}
        onWatchAgent={() => {
          if (!watching) return;
          setMode("preview");
          resumeFollowing();
          setWatch(null);
          go(hrefOf(project, watching.path));
        }}
        onResumeFollowing={resumeFollowing}
        diskConflict={Boolean(page && conflicts.some((item) => item.id === page.id))}
        onLoadDisk={() => page && loadDiskVersion(page.id)}
        go={go}
        jump={jump}
      />
    </ProjectContext.Provider>
  );
}
