"use client";

import { useEffect, useSyncExternalStore } from "react";
import { diskListSignature, mergeDisk, noteSaved, pendingChanges, retryable, type DiskConflict } from "@/lib/store/sync";
import { versionOf } from "@/lib/store/version";
import { ancestors, folderOf } from "@/lib/workspace/paths";
import { repoIdPrefix } from "@/lib/workspace/projects";
import { notify } from "./toast-host";
import { changed, commit, currentProject, onWorkspaceWrite, readWorkspace, setPreserveDirtyBase, subscribe, writeProject } from "./workspace-store";

const watching = new Set<string>();
const syncedFolders = new Map<string, Set<string>>();
const timers = new Map<string, number>();
const chains = new Map<string, Promise<void>>();
const NONE: DiskConflict[] = [];
let conflictList = NONE;
let saveErrors = 0;
let lastError = "";

function enqueue(project: string, job: () => Promise<void>) {
  const previous = chains.get(project) ?? Promise.resolve();
  const next = previous.then(job, job);
  chains.set(project, next);
}

function foldersOf(project: string) {
  let folders = syncedFolders.get(project);
  if (!folders) {
    folders = new Set();
    syncedFolders.set(project, folders);
  }
  return folders;
}

function remember(project: string, folder: string) {
  if (!folder) return;
  const folders = foldersOf(project);
  for (const ancestor of ancestors(folder)) folders.add(ancestor);
}

async function push(project: string) {
  if (!watching.has(project) || currentProject() !== project) return;
  const folders = foldersOf(project);
  const changes = pendingChanges(readWorkspace(), folders);
  if (changes.length === 0) return;
  let response: Response;
  try {
    response = await fetch("/api/files", {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ project, changes }),
    });
  } catch {
    notify("Couldn't save pages to disk. They'll be tried again.");
    window.setTimeout(() => schedule(project), 2000);
    return;
  }
  if (response.status === 404) return;
  if (!response.ok) {
    saveErrors += 1;
    if (saveErrors === 1) notify("Couldn't save pages to disk. They'll be tried again.");
    if (saveErrors < 4) window.setTimeout(() => schedule(project), 2000);
    return;
  }
  saveErrors = 0;
  const result = (await response.json()) as {
    applied: { id?: string; op: string; path: string; content?: string }[];
    conflicts: DiskConflict[];
    errors: { message: string }[];
  };
  if (currentProject() !== project) return;
  for (const change of result.applied) {
    if (change.op === "mkdir") remember(project, change.path);
    else if (change.op !== "trash") remember(project, folderOf(change.path));
  }
  const next = noteSaved(readWorkspace(), result.applied);
  const conflictIds = new Set(result.conflicts.map((item) => item.id));
  const more = retryable(pendingChanges(next, foldersOf(project)), conflictIds);
  if (next !== readWorkspace()) writeProject(project, next, more);
  else if (more) schedule(project);
  const message = result.errors[0]?.message ?? "";
  if (message && message !== lastError) notify(message);
  lastError = message;
  setConflicts(result.conflicts.length ? mergeConflictList(result.conflicts) : conflictList.filter((item) => !saved(item.id, result.applied)));
}

function saved(id: string, applied: { id?: string; op: string }[]) {
  return applied.some((item) => item.id === id && item.op !== "trash");
}

function mergeConflictList(incoming: DiskConflict[]) {
  const byId = new Map(conflictList.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()];
}

async function pull(project: string, onRemote: () => void): Promise<"off" | "ok"> {
  if (!watching.has(project) || currentProject() !== project) return "ok";
  const response = await fetch(`/api/files?project=${encodeURIComponent(project)}`, { cache: "no-store" });
  if (response.status === 404) return "off";
  if (!response.ok) return "ok";
  const data = (await response.json()) as { pages: { path: string; version: string }[]; folders: string[] };
  if (currentProject() !== project) return "ok";
  const ws = readWorkspace();
  const listed = new Map(data.pages.map((item) => [item.path, item.version]));
  const need = new Set<string>();
  for (const page of ws.pages) {
    if (!page.origin || ws.removed.includes(page.origin)) continue;
    const version = listed.get(page.origin);
    if (!version) continue;
    if (version !== versionOf(page.base ?? "")) need.add(page.origin);
  }
  for (const item of data.pages) {
    const known =
      ws.pages.some((page) => page.origin === item.path || (!page.origin && page.path === item.path)) ||
      ws.trash.some((page) => page.origin === item.path) ||
      ws.removed.includes(item.path);
    if (!known) need.add(item.path);
  }
  const bodies = (
    await Promise.all(
      [...need].map(async (filePath) => {
        const file = await fetch(`/api/files?project=${encodeURIComponent(project)}&path=${encodeURIComponent(filePath)}`, {
          cache: "no-store",
        });
        if (!file.ok) return null;
        return (await file.json()) as { path: string; content: string };
      }),
    )
  ).filter((item): item is { path: string; content: string } => Boolean(item));
  if (currentProject() !== project) return "ok";
  const fresh = readWorkspace();
  const merged = mergeDisk(fresh, data.pages, bodies, data.folders, repoIdPrefix(project));
  for (const folder of data.folders) remember(project, folder);
  if (merged.ws !== fresh) {
    const more = pendingChanges(merged.ws, foldersOf(project)).length > 0;
    writeProject(project, merged.ws, more);
    onRemote();
  }
  const remaining = conflictList.filter((item) => {
    const page = (merged.ws === fresh ? fresh : merged.ws).pages.find((entry) => entry.id === item.id);
    return page && page.content !== page.base;
  });
  setConflicts(merged.conflicts.length ? mergeConflictList([...remaining, ...merged.conflicts]) : remaining);
  return "ok";
}

function setConflicts(next: DiskConflict[]) {
  const key = (list: DiskConflict[]) => list.map((item) => `${item.id}:${versionOf(item.content)}`).join("|");
  if (key(conflictList) === key(next)) return;
  conflictList = next;
  changed();
}

function schedule(project: string) {
  if (!watching.has(project)) return;
  const existing = timers.get(project);
  if (existing) window.clearTimeout(existing);
  timers.set(
    project,
    window.setTimeout(() => {
      timers.delete(project);
      enqueue(project, () => push(project));
    }, 500),
  );
}

onWorkspaceWrite((project) => schedule(project));

export function startDiskSync(project: string, onRemote: () => void) {
  watching.add(project);
  setPreserveDirtyBase(project, true);
  let timer = 0;
  const run = () =>
    enqueue(project, async () => {
      const status = await pull(project, onRemote).catch(() => "ok" as const);
      if (status === "off") {
        watching.delete(project);
        window.clearInterval(timer);
      }
    });
  void run();
  timer = window.setInterval(run, 3000);
  window.addEventListener("focus", run);
  return () => {
    watching.delete(project);
    setPreserveDirtyBase(project, false);
    window.clearInterval(timer);
    window.removeEventListener("focus", run);
  };
}

export function useDiskConflicts() {
  return useSyncExternalStore(subscribe, () => conflictList, () => NONE);
}

export function loadDiskVersion(id: string) {
  const hit = conflictList.find((item) => item.id === id);
  if (!hit) return;
  commit((ws) => ({
    ...ws,
    pages: ws.pages.map((page) =>
      page.id === id
        ? { ...page, path: hit.path, content: hit.content, base: hit.content, origin: hit.path, updatedAt: Date.now() }
        : page,
    ),
    removed: ws.removed.filter((item) => item !== hit.path),
  }));
  conflictList = conflictList.filter((item) => item.id !== id);
  changed();
}

export function useDiskProjectWatch(signature: string, refresh: () => void) {
  useEffect(() => {
    let seen = signature;
    let stop = false;
    async function check() {
      try {
        const response = await fetch("/api/files", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { projects: { slug: string; name: string; description: string; paths: string[] }[] };
        const next = diskListSignature(data.projects);
        if (!stop && next !== seen) {
          seen = next;
          refresh();
        }
      } catch {
        /* The local API is off when KB_LOCAL is unset. */
      }
    }
    const timer = window.setInterval(() => void check(), 3000);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => {
      stop = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [signature, refresh]);
}
