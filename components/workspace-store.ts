"use client";

import { useSyncExternalStore } from "react";
import { reconcile, seed, type Page, type RepoDoc, type Workspace } from "@/lib/workspace/model";
import { LEGACY_PROJECT, repoIdPrefix } from "@/lib/workspace/projects";
import { toDoc, type PageDoc } from "@/lib/workspace/tree";
import { notify } from "./toast-host";

const LEGACY_KEY = "markdown-kb:workspace";
const EVENT = "markdown-kb-workspace";

const keyOf = (project: string) => `${LEGACY_KEY}:${project}`;

let current: { project: string; repo: RepoDoc[] } = { project: LEGACY_PROJECT, repo: [] };
const caches = new Map<string, { raw: string | null; repo: RepoDoc[]; ws: Workspace; preserve: boolean }>();
const serverSeeds = new WeakMap<RepoDoc[], Workspace>();
const docCache = new WeakMap<Page, PageDoc>();

export function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function changed() {
  window.dispatchEvent(new Event(EVENT));
}

export function currentProject() {
  return current.project;
}

function rawOf(project: string) {
  const raw = window.localStorage.getItem(keyOf(project));
  return raw === null && project === LEGACY_PROJECT ? window.localStorage.getItem(LEGACY_KEY) : raw;
}

export function storedWorkspace(project: string): Workspace | null {
  try {
    const parsed = JSON.parse(rawOf(project) ?? "null") as Workspace | null;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function legacyDraft(project: string) {
  return (path: string) => (project === LEGACY_PROJECT ? window.localStorage.getItem(`markdown-kb:${path}`) : null);
}

const dirtyBase = new Set<string>();

export function setPreserveDirtyBase(project: string, on: boolean) {
  if (on) dirtyBase.add(project);
  else dirtyBase.delete(project);
}

function dirtyOptions(project: string, options?: { preserveDirtyBase?: boolean }) {
  return options?.preserveDirtyBase || dirtyBase.has(project) ? { preserveDirtyBase: true } : undefined;
}

export function readProject(project: string, repo: RepoDoc[], options?: { preserveDirtyBase?: boolean }): Workspace {
  const raw = rawOf(project);
  const preserve = dirtyOptions(project, options);
  const preserving = Boolean(preserve);
  const hit = caches.get(project);
  if (hit && hit.raw === raw && hit.repo === repo && hit.preserve === preserving) return hit.ws;
  const prefix = repoIdPrefix(project);
  let ws: Workspace;
  try {
    const parsed = raw ? (JSON.parse(raw) as Workspace) : null;
    ws = parsed?.version === 1 ? reconcile(parsed, repo, prefix, preserve) : seed(repo, legacyDraft(project), prefix);
  } catch {
    ws = seed(repo, legacyDraft(project), prefix);
  }
  caches.set(project, { raw, repo, ws, preserve: preserving });
  return ws;
}

export function readWorkspace(): Workspace {
  return readProject(current.project, current.repo);
}

function serverSeed(project: string, docs: RepoDoc[]) {
  let ws = serverSeeds.get(docs);
  if (!ws) {
    ws = seed(docs, undefined, repoIdPrefix(project));
    serverSeeds.set(docs, ws);
  }
  return ws;
}

export function useWorkspace(project: string, docs: RepoDoc[], options?: { preserveDirtyBase?: boolean }): Workspace {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (current.project !== project || current.repo !== docs) current = { project, repo: docs };
      return readProject(project, docs, options);
    },
    () => serverSeed(project, docs),
  );
}

let afterWrite: (project: string) => void = () => {};

export function onWorkspaceWrite(listener: (project: string) => void) {
  afterWrite = listener;
}

export function writeProject(project: string, ws: Workspace, sync = true): boolean {
  const raw = JSON.stringify(ws);
  try {
    window.localStorage.setItem(keyOf(project), raw);
  } catch {
    notify("This browser is out of room for pages. Export a project, then empty its Trash.");
    return false;
  }
  caches.set(project, { raw, repo: project === current.project ? current.repo : [], ws, preserve: dirtyBase.has(project) });
  changed();
  if (sync) afterWrite(project);
  return true;
}

export function commit(update: (ws: Workspace) => Workspace): Workspace {
  const before = readWorkspace();
  const next = update(before);
  if (next === before) return before;
  return writeProject(current.project, next) ? next : before;
}

export function forgetProject(project: string) {
  const ws = storedWorkspace(project);
  for (const page of [...(ws?.pages ?? []), ...(ws?.trash ?? [])]) window.localStorage.removeItem(`markdown-kb:history:${page.id}`);
  window.localStorage.removeItem(keyOf(project));
  window.localStorage.removeItem(collapsedKey(project));
  caches.delete(project);
  changed();
}

export function docOf(page: Page): PageDoc {
  let doc = docCache.get(page);
  if (!doc) {
    doc = toDoc(page);
    docCache.set(page, doc);
  }
  return doc;
}

export function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

const collapsedKey = (project: string) => (project === LEGACY_PROJECT ? "markdown-kb:collapsed" : `markdown-kb:collapsed:${project}`);
const collapsedCaches = new Map<string, { raw: string | null; set: Set<string> }>();
const EMPTY = new Set<string>();

function readCollapsed() {
  const project = current.project;
  const raw = window.localStorage.getItem(collapsedKey(project));
  const hit = collapsedCaches.get(project);
  if (hit && hit.raw === raw) return hit.set;
  let list: string[] = [];
  try {
    list = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {}
  const set = new Set(list);
  collapsedCaches.set(project, { raw, set });
  return set;
}

export function useCollapsed() {
  return useSyncExternalStore(subscribe, readCollapsed, () => EMPTY);
}

export function setCollapsed(folder: string, collapsed: boolean) {
  const set = new Set(readCollapsed());
  if (set.has(folder) === collapsed) return;
  if (collapsed) set.add(folder);
  else set.delete(folder);
  window.localStorage.setItem(collapsedKey(current.project), JSON.stringify([...set]));
  changed();
}
