"use client";

import { useEffect, useRef, useState } from "react";
import type { McpSnippets } from "@/lib/mcp/snippets";
import { mcpSnippets } from "@/lib/mcp/snippets";
import { applyMotion } from "./preferences";
import { AboutSettings } from "./settings/about";
import { AgentsSettings } from "./settings/agents";
import { AppearanceSettings } from "./settings/appearance";
import { EditorSettings } from "./settings/editor";
import { GeneralSettings } from "./settings/general";
import { KeyboardSettings } from "./settings/keyboard";
import { applyTheme } from "./theme-store";

const OPEN = "markdown-kb-settings";
const SECTIONS = [
  ["general", "General"],
  ["appearance", "Appearance"],
  ["editor", "Editor"],
  ["agents", "Agents"],
  ["keyboard", "Keyboard"],
  ["about", "About"],
] as const;
type Section = (typeof SECTIONS)[number][0];
const PLACEHOLDER = mcpSnippets("/absolute/path/to/markdown-knowledge-base/kb", "/absolute/path/to/markdown-knowledge-base/mcp/server.ts");

export function openSettings() {
  window.dispatchEvent(new Event(OPEN));
}

export function SettingsHost({ canShowShortcuts = false }: { canShowShortcuts?: boolean }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>("appearance");
  const [snippets, setSnippets] = useState<McpSnippets>(PLACEHOLDER);
  const [local, setLocal] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyTheme();
    applyMotion();
    const show = () => {
      setSection("appearance");
      setOpen(true);
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener(OPEN, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // The local server fills in real folder paths for General and Agents. A deployed build has no endpoint.
  useEffect(() => {
    if (!open || local) return;
    let gone = false;
    void fetch("/api/mcp")
      .then(async (response) => {
        if (!response.ok) return;
        const body = (await response.json()) as McpSnippets;
        if (!gone) {
          setSnippets(body);
          setLocal(true);
        }
      })
      .catch(() => undefined);
    return () => {
      gone = true;
    };
  }, [open, local]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;
  const close = () => setOpen(false);
  return (
    <div className="overlay settings-overlay" onMouseDown={close}>
      <div ref={dialogRef} className="settings" role="dialog" aria-label="Settings" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}>
        <header className="settings-top">
          <h2>Settings</h2>
          <button type="button" className="icon-button" aria-label="Close settings" onClick={close}>
            ×
          </button>
        </header>
        <div className="settings-body">
          <nav className="settings-nav" aria-label="Settings sections">
            {SECTIONS.map(([id, label]) => (
              <button key={id} type="button" className={section === id ? "is-active" : undefined} aria-current={section === id ? "page" : undefined} onClick={() => setSection(id)}>
                {label}
              </button>
            ))}
          </nav>
          {section === "general" ? (
            <GeneralSettings kbDir={local ? snippets.kbDir : null} />
          ) : section === "appearance" ? (
            <AppearanceSettings />
          ) : section === "editor" ? (
            <EditorSettings />
          ) : section === "agents" ? (
            <AgentsSettings snippets={snippets} local={local} />
          ) : section === "keyboard" ? (
            <KeyboardSettings canShowShortcuts={canShowShortcuts} onClose={close} />
          ) : (
            <AboutSettings onClose={close} />
          )}
        </div>
      </div>
    </div>
  );
}
