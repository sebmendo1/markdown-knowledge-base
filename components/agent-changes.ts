"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  baselineOf,
  countChanges,
  hasChanges,
  mapThrough,
  recordAgentChange,
  type AgentChanges,
} from "@/lib/store/agent-changes";
import { onAgentEdit, wasAgentEdit } from "./agent-activity";
import { onDiskApply, type DiskApply } from "./disk-sync";
import { changed, subscribe } from "./workspace-store";

// Agent changes per page, kept in this browser until the person marks them reviewed.
const key = (id: string) => `markdown-kb:agent-changes:${id}`;
const caches = new Map<string, { raw: string | null; changes: AgentChanges | null }>();

function readChanges(id: string): AgentChanges | null {
  const raw = window.localStorage.getItem(key(id));
  const hit = caches.get(id);
  if (hit && hit.raw === raw) return hit.changes;
  let changes: AgentChanges | null = null;
  try {
    changes = raw ? (JSON.parse(raw) as AgentChanges) : null;
  } catch {}
  caches.set(id, { raw, changes });
  return changes;
}

function writeChanges(id: string, changes: AgentChanges | null) {
  try {
    if (changes && hasChanges(changes)) window.localStorage.setItem(key(id), JSON.stringify(changes));
    else window.localStorage.removeItem(key(id));
  } catch {
    return;
  }
  changed();
}

export function markReviewed(id: string) {
  writeChanges(id, null);
}

export function forgetAgentChanges(id: string) {
  window.localStorage.removeItem(key(id));
}

function record(change: DiskApply) {
  writeChanges(change.id, recordAgentChange(readChanges(change.id), change.before, change.after));
}

// A disk change that landed before its agent event arrived waits here briefly, so the order of the two does not matter.
const WAIT_MS = 5000;
const waiting = new Map<string, DiskApply & { at: number }>();
const waitKey = (project: string, path: string) => `${project}/${path}`;

if (typeof window !== "undefined") {
  onDiskApply((change) => {
    if (wasAgentEdit(change.project, change.path)) {
      waiting.delete(waitKey(change.project, change.path));
      record(change);
      return;
    }
    const earlier = waiting.get(waitKey(change.project, change.path));
    const before = earlier && earlier.after === change.before && Date.now() - earlier.at < WAIT_MS ? earlier.before : change.before;
    waiting.set(waitKey(change.project, change.path), { ...change, before, at: Date.now() });
  });
  onAgentEdit((event) => {
    if (!event.project || !event.path) return;
    const hit = waiting.get(waitKey(event.project, event.path));
    waiting.delete(waitKey(event.project, event.path));
    if (hit && Date.now() - hit.at < WAIT_MS) record(hit);
  });
}

export type AgentReview = { added: number; removed: number; baseline: string };

// The agent changes on a page as it reads now, carried over any typing since they were recorded.
export function useAgentChanges(id: string | null, content: string): AgentReview | null {
  const stored = useSyncExternalStore(
    subscribe,
    () => (id ? readChanges(id) : null),
    () => null,
  );
  return useMemo(() => {
    if (!stored) return null;
    const current = mapThrough(stored, content);
    if (!hasChanges(current)) return null;
    return { ...countChanges(current), baseline: baselineOf(current) };
  }, [stored, content]);
}
