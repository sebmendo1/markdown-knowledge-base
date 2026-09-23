"use client";

import { useEffect, useRef } from "react";
import { setMode, type Mode } from "./draft-store";
import { saveVersion } from "./page-actions";

export function useEditorKeys(options: {
  mode: Mode;
  pageId: string | null;
  setOutlineOpen: (update: (open: boolean) => boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  onNewPage: () => void;
}) {
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const { mode, pageId, setOutlineOpen, setSidebarOpen, setPaletteOpen, setHelpOpen, onNewPage } = latest.current;
      const meta = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement | null;
      const typing = Boolean(target?.closest("input, textarea, [contenteditable], .cm-content"));
      const overlay = Boolean(document.querySelector(".overlay, .menu"));
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
        setHelpOpen(false);
        return;
      }
      if (meta && event.key === "/") {
        event.preventDefault();
        setMode(mode === "source" ? "edit" : "source");
        return;
      }
      if (meta && event.key === "\\") {
        event.preventDefault();
        setOutlineOpen((open) => !open);
        return;
      }
      if (meta && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (pageId) saveVersion(pageId);
        return;
      }
      const plain = !typing && !overlay && !meta && !event.altKey;
      if (plain && event.key.toLowerCase() === "c") {
        event.preventDefault();
        onNewPage();
        return;
      }
      if (plain && event.key.toLowerCase() === "e" && pageId) {
        event.preventDefault();
        setMode("edit");
        return;
      }
      if (!typing && event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
        setPaletteOpen(false);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setHelpOpen(false);
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
