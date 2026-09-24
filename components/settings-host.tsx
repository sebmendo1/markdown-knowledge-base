"use client";

import { useEffect, useRef, useState } from "react";
import type { McpSnippets } from "@/lib/mcp/snippets";
import { mcpSnippets } from "@/lib/mcp/snippets";
import { notify } from "./toast-host";
import { applyTheme, setTheme, useThemeChoice, type ThemeChoice } from "./theme-store";

const OPEN = "markdown-kb-settings";
type Section = "general" | "appearance" | "mcp";
const PLACEHOLDER = mcpSnippets("/absolute/path/to/markdown-knowledge-base/kb", "/absolute/path/to/markdown-knowledge-base/mcp/server.ts");

export function openSettings() {
  window.dispatchEvent(new Event(OPEN));
}

export function SettingsHost() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>("appearance");
  const choice = useThemeChoice();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyTheme();
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

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div className="overlay settings-overlay" onMouseDown={() => setOpen(false)}>
      <div ref={dialogRef} className="settings" role="dialog" aria-label="Settings" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}>
        <header className="settings-top">
          <h2>Settings</h2>
          <button type="button" className="icon-button" aria-label="Close settings" onClick={() => setOpen(false)}>
            ×
          </button>
        </header>
        <div className="settings-body">
          <nav className="settings-nav" aria-label="Settings sections">
            <button type="button" className={section === "general" ? "is-active" : undefined} onClick={() => setSection("general")}>
              General
            </button>
            <button type="button" className={section === "appearance" ? "is-active" : undefined} onClick={() => setSection("appearance")}>
              Appearance
            </button>
            <button type="button" className={section === "mcp" ? "is-active" : undefined} onClick={() => setSection("mcp")}>
              MCP
            </button>
          </nav>
          {section === "general" ? <General /> : section === "appearance" ? <Appearance choice={choice} /> : <McpSettings />}
        </div>
      </div>
    </div>
  );
}

function General() {
  return (
    <section className="settings-pane">
      <h3>General</h3>
      <p className="settings-lead">This copy stays on this machine.</p>
      <div className="settings-row">
        <div>
          <div className="settings-label">Pages</div>
          <p>Pages you create or edit live in this browser, one project at a time. Export a project from the Pages menu to keep a copy or move it to another device.</p>
        </div>
      </div>
    </section>
  );
}

function McpSettings() {
  const [snippets, setSnippets] = useState<McpSnippets>(PLACEHOLDER);
  const [local, setLocal] = useState(false);

  useEffect(() => {
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
  }, []);

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    notify(`Copied ${label} settings`);
  }

  return (
    <section className="settings-pane">
      <h3>MCP</h3>
      <p className="settings-lead">
        {local
          ? `These settings point agents at ${snippets.kbDir}. Paste one into Cursor, Claude Code, or Codex.`
          : "Run npm run dev on this machine to fill in the folder paths. Paste one of these into Cursor, Claude Code, or Codex."}
      </p>
      {(
        [
          ["Cursor", snippets.cursor],
          ["Claude Code", snippets.claude],
          ["Codex", snippets.codex],
        ] as const
      ).map(([label, text]) => (
        <div className="mcp-block" key={label}>
          <header>
            <div className="settings-label">{label}</div>
            <button type="button" className="mcp-copy" onClick={() => void copy(label, text)}>
              Copy
            </button>
          </header>
          <pre>{text}</pre>
        </div>
      ))}
    </section>
  );
}

function Appearance({ choice }: { choice: ThemeChoice }) {
  return (
    <section className="settings-pane">
      <h3>Appearance</h3>
      <p className="settings-lead">How markdown-kb looks on this machine.</p>
      <div className="settings-row">
        <div>
          <div className="settings-label">Theme</div>
          <p>Use the system setting, or keep one look.</p>
        </div>
        <div className="theme-switch" role="radiogroup" aria-label="Theme">
          {(
            [
              ["light", "Light"],
              ["dark", "Dark"],
              ["system", "System"],
            ] as const
          ).map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={choice === value} className={choice === value ? "is-active" : undefined} onClick={() => setTheme(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
