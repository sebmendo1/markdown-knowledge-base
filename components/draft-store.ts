"use client";

import { useSyncExternalStore } from "react";

export type Mode = "preview" | "edit" | "source";

const DRAFT_EVENT = "markdown-kb-draft";

function subscribeDrafts(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DRAFT_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DRAFT_EVENT, onStoreChange);
  };
}

function writeStorage(key: string, value: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(DRAFT_EVENT));
}

export function useMode(): Mode {
  return useSyncExternalStore(subscribeDrafts, readMode, () => "preview");
}

function readMode(): Mode {
  const stored = window.localStorage.getItem("markdown-kb:mode");
  if (stored === "source") return "source";
  return stored === "edit" || stored === "split" ? "edit" : "preview";
}

export function setMode(mode: Mode) {
  writeStorage("markdown-kb:mode", mode);
}

export function useSidebarExpanded() {
  return useSyncExternalStore(subscribeDrafts, readSidebar, () => true);
}

function readSidebar() {
  return window.localStorage.getItem("markdown-kb:sidebar") !== "hidden";
}

export function setSidebarExpanded(expanded: boolean) {
  writeStorage("markdown-kb:sidebar", expanded ? "shown" : "hidden");
}

// Whether the outline beside the page is shown. Stored per machine; shown when nothing is stored (F08-REQ-043).
export function useOutlineOpen() {
  return useSyncExternalStore(subscribeDrafts, readOutline, () => true);
}

export function readOutline() {
  return window.localStorage.getItem("markdown-kb:outline") !== "hidden";
}

export function setOutlineOpen(open: boolean) {
  writeStorage("markdown-kb:outline", open ? "shown" : "hidden");
}

export function toggleOutline() {
  setOutlineOpen(!readOutline());
}

export function snippet(content: string, query: string) {
  const needle = query.trim().toLowerCase();
  const index = content.toLowerCase().indexOf(needle);
  if (index < 0) return "";
  const start = Math.max(0, index - 28);
  return content.slice(start, index + needle.length + 48).replace(/\s+/g, " ").trim();
}
