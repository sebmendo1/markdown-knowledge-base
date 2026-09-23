"use client";

import { useEffect, useRef, useState } from "react";
import { applyTheme, setTheme, useThemeChoice, type ThemeChoice } from "./theme-store";

const OPEN = "markdown-kb-settings";

export function openSettings() {
  window.dispatchEvent(new Event(OPEN));
}

export function SettingsHost() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<"general" | "appearance">("appearance");
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
          </nav>
          {section === "general" ? <General /> : <Appearance choice={choice} />}
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
