"use client";

import { useSyncExternalStore } from "react";
import { updateContent } from "@/lib/workspace/model";
import { changed, commit, readWorkspace, subscribe } from "./workspace-store";

export type Snapshot = { at: number; content: string; label: string };

const LIMIT = 50;
const QUIET = 10 * 60 * 1000;
const key = (id: string) => `markdown-kb:history:${id}`;
const caches = new Map<string, { raw: string | null; list: Snapshot[] }>();
const NONE: Snapshot[] = [];

export function readHistory(id: string): Snapshot[] {
  const raw = window.localStorage.getItem(key(id));
  const hit = caches.get(id);
  if (hit && hit.raw === raw) return hit.list;
  let list: Snapshot[] = [];
  try {
    list = raw ? (JSON.parse(raw) as Snapshot[]) : [];
  } catch {}
  caches.set(id, { raw, list });
  return list;
}

export function useHistory(id: string | null) {
  return useSyncExternalStore(
    subscribe,
    () => (id ? readHistory(id) : NONE),
    () => NONE,
  );
}

export function snapshot(id: string, content: string, label: string): boolean {
  const list = readHistory(id);
  if (list[0]?.content === content) return false;
  const next = [{ at: Date.now(), content, label }, ...list].slice(0, LIMIT);
  try {
    window.localStorage.setItem(key(id), JSON.stringify(next));
  } catch {
    return false;
  }
  changed();
  return true;
}

export function editPage(id: string, content: string) {
  const page = readWorkspace().pages.find((entry) => entry.id === id);
  if (!page || page.content === content) return;
  const last = readHistory(id)[0];
  if (!last || Date.now() - last.at > QUIET) snapshot(id, page.content, "Before editing");
  commit((ws) => updateContent(ws, id, content, Date.now()));
}

export function restoreVersion(id: string, content: string, label = "Before restoring") {
  const page = readWorkspace().pages.find((entry) => entry.id === id);
  if (!page || page.content === content) return;
  snapshot(id, page.content, label);
  commit((ws) => updateContent(ws, id, content, Date.now()));
}

export function forgetHistory(id: string) {
  window.localStorage.removeItem(key(id));
  changed();
}
