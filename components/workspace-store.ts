"use client";

import { useSyncExternalStore } from "react";
import { reconcile, seed, type Page, type RepoDoc, type Workspace } from "@/lib/workspace/model";
import { toDoc, type PageDoc } from "@/lib/workspace/tree";
import { notify } from "./toast-host";

const KEY = "markdown-kb:workspace";
const EVENT = "markdown-kb-workspace";

let repo: RepoDoc[] = [];
let cache: { raw: string | null; repo: RepoDoc[]; ws: Workspace } | null = null;
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

function legacyDraft(path: string) {
  return window.localStorage.getItem(`markdown-kb:${path}`);
}

export function readWorkspace(docs: RepoDoc[] = repo): Workspace {
  repo = docs;
  const raw = window.localStorage.getItem(KEY);
  if (cache && cache.raw === raw && cache.repo === repo) return cache.ws;
  let ws: Workspace;
  try {
    const parsed = raw ? (JSON.parse(raw) as Workspace) : null;
    ws = parsed?.version === 1 ? reconcile(parsed, repo) : seed(repo, legacyDraft);
  } catch {
    ws = seed(repo, legacyDraft);
  }
  cache = { raw, repo, ws };
  return ws;
}

function serverSeed(docs: RepoDoc[]) {
  let ws = serverSeeds.get(docs);
  if (!ws) {
    ws = seed(docs);
    serverSeeds.set(docs, ws);
  }
  return ws;
}

export function useWorkspace(docs: RepoDoc[]): Workspace {
  return useSyncExternalStore(subscribe, () => readWorkspace(docs), () => serverSeed(docs));
}

export function commit(update: (ws: Workspace) => Workspace): Workspace {
  const before = readWorkspace();
  const next = update(before);
  if (next === before) return before;
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    notify("This browser is out of room for pages. Export the workspace, then empty the Trash.");
    return before;
  }
  cache = { raw, repo, ws: next };
  changed();
  return next;
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

const COLLAPSED = "markdown-kb:collapsed";
let collapsedCache: { raw: string | null; set: Set<string> } = { raw: null, set: new Set() };
const EMPTY = new Set<string>();

function readCollapsed() {
  const raw = window.localStorage.getItem(COLLAPSED);
  if (raw !== collapsedCache.raw) {
    let list: string[] = [];
    try {
      list = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {}
    collapsedCache = { raw, set: new Set(list) };
  }
  return collapsedCache.set;
}

export function useCollapsed() {
  return useSyncExternalStore(subscribe, readCollapsed, () => EMPTY);
}

export function setCollapsed(folder: string, collapsed: boolean) {
  const set = new Set(readCollapsed());
  if (set.has(folder) === collapsed) return;
  if (collapsed) set.add(folder);
  else set.delete(folder);
  window.localStorage.setItem(COLLAPSED, JSON.stringify([...set]));
  changed();
}
