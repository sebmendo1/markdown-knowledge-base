"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Doc } from "@/lib/docs";
import { extractHeadings } from "@/lib/markdown/outline";
import { folderOf, hrefOf } from "@/lib/workspace/paths";
import { backlinks } from "@/lib/workspace/tree";
import { setMode, setSidebarExpanded, useMode } from "./draft-store";
import { editPage } from "./history-store";
import { emit } from "./ui-events";
import { useActiveHeading } from "./use-active-heading";
import { useEditorKeys } from "./use-editor-keys";
import { docOf, useHydrated, useWorkspace } from "./workspace-store";
import { WorkspaceView, type PageState } from "./workspace-view";

export function Workspace({ docs: repoDocs, currentPath }: { docs: Doc[]; currentPath: string }) {
  const router = useRouter();
  const ws = useWorkspace(repoDocs);
  const hydrated = useHydrated();
  const docs = useMemo(() => ws.pages.map(docOf), [ws.pages]);
  const page = ws.pages.find((entry) => entry.path === currentPath);
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

  function newPageHere() {
    setSidebarExpanded(true);
    setSidebarOpen(true);
    window.setTimeout(() => emit("markdown-kb-create", { kind: "page", folder: page ? folderOf(currentPath) : "" }), 0);
  }

  useEditorKeys({ mode, pageId: page?.id ?? null, setOutlineOpen, setSidebarOpen, setPaletteOpen, setHelpOpen, onNewPage: newPageHere });

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
    if (!hydrated) return;
    if (page) {
      last.current = { id: page.id, path: page.path };
      return;
    }
    const previous = last.current;
    if (!previous || previous.path !== currentPath) return;
    const moved = ws.pages.find((entry) => entry.id === previous.id);
    if (moved) {
      last.current = { id: moved.id, path: moved.path };
      router.replace(hrefOf(moved.path));
    } else if (ws.trash.some((entry) => entry.id === previous.id)) {
      last.current = null;
      if (ws.pages[0]) router.replace(hrefOf(ws.pages[0].path));
    }
  }, [hydrated, page, currentPath, ws, router]);

  useEffect(() => {
    if (doc) document.title = `${doc.title} · markdown-kb`;
  }, [doc]);

  const headings = useMemo(() => extractHeadings(value), [value]);
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
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    previewRef.current?.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ behavior: motion, block: "start" });
  }

  return (
    <WorkspaceView
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
      headings={headings}
      linkedFrom={linkedFrom}
      activeHeading={activeHeading}
      previewRef={previewRef}
      setSidebarOpen={setSidebarOpen}
      setPaletteOpen={setPaletteOpen}
      setHelpOpen={setHelpOpen}
      onChange={(next) => page && editPage(page.id, next)}
      go={go}
      jump={jump}
    />
  );
}
