"use client";

import { useSyncExternalStore } from "react";
import { EDIT_OPS, type ActivityEvent } from "@/lib/store/activity-types";
import { syncNow } from "./disk-sync";
import { notify } from "./toast-host";
import { currentProject, readWorkspace } from "./workspace-store";

// A page stays in the agent editing screen until the agent has been quiet this long.
const SESSION_IDLE_MS = 6000;
// Reads and searches keep the "working" indicator on this long.
const WORKING_IDLE_MS = 4000;

export type AgentSession = {
  project: string;
  path: string;
  agent: string;
  // The page before the agent's first edit in this session, to highlight what changed. Empty for a new page.
  before: string;
  edits: number;
  lastAt: number;
  // An edit was reported and the browser has not loaded it yet.
  pending: boolean;
};

export type AgentWork = { agent: string; op: ActivityEvent["op"]; project?: string; path?: string; at: number };

// recent: the latest actions this tab has seen, newest first, for Settings → Agents.
type State = { sessions: AgentSession[]; working: AgentWork | null; followPaused: boolean; recent: AgentWork[] };

const RECENT_LIMIT = 10;
const EMPTY: State = { sessions: [], working: null, followPaused: false, recent: [] };
let state = EMPTY;
const listeners = new Set<() => void>();
const editListeners = new Set<(event: ActivityEvent) => void>();
let source: EventSource | null = null;
let expiry = 0;
// When an agent last created, changed, or moved each page, by `project/path`. Outlives sessions.
const lastAgentEdit = new Map<string, number>();

function set(next: State) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  connect();
  return () => {
    listeners.delete(listener);
  };
}

function connect() {
  if (source || typeof window === "undefined" || typeof EventSource === "undefined") return;
  source = new EventSource("/api/activity");
  source.onmessage = (message) => {
    try {
      receive(JSON.parse(message.data) as ActivityEvent);
    } catch {
      /* Ignore a malformed line. */
    }
  };
  // A 404 (the local API is off in a deployed build) closes the stream for good; the browser retries other errors.
}

function key(project: string, path: string) {
  return `${project}/${path}`;
}

function pageContent(project: string, path: string): string {
  if (currentProject() !== project) return "";
  const page = readWorkspace().pages.find((item) => item.origin === path || item.path === path);
  return page?.content ?? "";
}

function receive(event: ActivityEvent) {
  const now = Date.now();
  // A replayed event from before this tab opened only counts if it is recent.
  if (now - event.at > SESSION_IDLE_MS) return;
  const working: AgentWork = { agent: event.agent, op: event.op, project: event.project, path: event.path, at: event.at };
  let sessions = state.sessions;
  const isPageEdit = event.project && event.path && (event.op === "create" || event.op === "update" || event.op === "move");

  if (event.op === "trash" && event.project && event.path) {
    sessions = sessions.filter((item) => key(item.project, item.path) !== key(event.project!, event.path!));
  }
  if (isPageEdit) {
    const project = event.project!;
    const path = event.path!;
    lastAgentEdit.set(key(project, path), now);
    const oldPath = event.op === "move" ? event.from : undefined;
    const previous =
      sessions.find((item) => item.project === project && item.path === path) ??
      (oldPath ? sessions.find((item) => item.project === project && item.path === oldPath) : undefined);
    const session: AgentSession = previous
      ? { ...previous, path, agent: event.agent, edits: previous.edits + 1, lastAt: event.at, pending: true }
      : {
          project,
          path,
          agent: event.agent,
          before: event.op === "create" ? "" : pageContent(project, oldPath ?? path),
          edits: 1,
          lastAt: event.at,
          pending: true,
        };
    sessions = [...sessions.filter((item) => item !== previous), session];
  }
  set({ ...state, sessions, working, recent: [working, ...state.recent].slice(0, RECENT_LIMIT) });
  scheduleExpiry();

  if (EDIT_OPS.has(event.op) && event.project) {
    const project = event.project;
    void syncNow(project).then(() => {
      if (isPageEdit) {
        set({
          ...state,
          sessions: state.sessions.map((item) =>
            item.project === project && item.path === event.path && item.lastAt <= event.at ? { ...item, pending: false } : item,
          ),
        });
      }
      for (const listener of editListeners) listener(event);
    });
  }
}

function scheduleExpiry() {
  window.clearTimeout(expiry);
  const now = Date.now();
  const deadlines = [
    ...state.sessions.map((item) => item.lastAt + SESSION_IDLE_MS),
    ...(state.working ? [state.working.at + WORKING_IDLE_MS] : []),
  ];
  if (deadlines.length === 0) return;
  expiry = window.setTimeout(expire, Math.max(50, Math.min(...deadlines) - now));
}

function expire() {
  const now = Date.now();
  const ended = state.sessions.filter((item) => !item.pending && now - item.lastAt >= SESSION_IDLE_MS);
  const sessions = state.sessions.filter((item) => !ended.includes(item));
  const working = state.working && now - state.working.at < WORKING_IDLE_MS ? state.working : null;
  const quiet = sessions.length === 0 && !working;
  set({ ...state, sessions, working, followPaused: quiet ? false : state.followPaused });
  for (const item of ended) {
    const name = item.path.split("/").pop();
    notify(`${item.agent} finished editing ${name} · ${item.edits} ${item.edits === 1 ? "edit" : "edits"}`);
  }
  scheduleExpiry();
}

// True when an agent reported changing this page recently, so a disk change to it is the agent's.
export function wasAgentEdit(project: string, path: string, withinMs = 15000): boolean {
  const at = lastAgentEdit.get(key(project, path));
  return at !== undefined && Date.now() - at <= withinMs;
}

// Called after the browser has loaded an agent's edit. Pages opened in view mode follow the agent.
export function onAgentEdit(listener: (event: ActivityEvent) => void) {
  editListeners.add(listener);
  connect();
  return () => {
    editListeners.delete(listener);
  };
}

export function pauseFollowing() {
  set({ ...state, followPaused: true });
}

export function resumeFollowing() {
  set({ ...state, followPaused: false });
}

export function useAgentActivity(): State {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

export function describeWork(work: AgentWork): string {
  const name = work.path?.split("/").pop();
  switch (work.op) {
    case "create":
      return `${work.agent} is writing ${name}`;
    case "update":
      return `${work.agent} is editing ${name}`;
    case "move":
      return `${work.agent} is moving ${name}`;
    case "trash":
      return `${work.agent} moved ${name} to Trash`;
    case "mkdir":
      return `${work.agent} is adding a folder`;
    case "create_project":
      return `${work.agent} is creating a project`;
    case "read":
      return `${work.agent} is reading ${name}`;
    case "search":
      return `${work.agent} is searching`;
    default:
      return `${work.agent} is looking around`;
  }
}
