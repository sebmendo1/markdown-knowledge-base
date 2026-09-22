"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { EditorView } from "@codemirror/view";
import type { Doc } from "@/lib/docs";
import { extractHeadings } from "@/lib/markdown/outline";
import { MarkdownView } from "./markdown-view";

const Editor = dynamic(() => import("./editor").then((module) => module.Editor), {
  ssr: false,
});

type Mode = "preview" | "split" | "source";

const MODES: Mode[] = ["preview", "split", "source"];

export function Workspace({ docs, currentPath }: { docs: Doc[]; currentPath: string }) {
  const router = useRouter();
  const current = docs.find((doc) => doc.path === currentPath) ?? docs[0];
  const storageKey = `markdown-kb:${current.path}`;
  const value = useDraft(storageKey, current.content);
  const mode = useMode();
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement | null;
      const typing = Boolean(target?.closest("input, textarea, .cm-content"));
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
        setHelpOpen(false);
        return;
      }
      if (meta && event.key === "/") {
        event.preventDefault();
        setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
        return;
      }
      if (meta && event.key === "\\") {
        event.preventDefault();
        setOutlineOpen((open) => !open);
        return;
      }
      if (meta && event.key.toLowerCase() === "s") {
        event.preventDefault();
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
  }, [mode]);

  useEffect(() => {
    if (paletteOpen) searchRef.current?.focus();
  }, [paletteOpen]);

  const headings = useMemo(() => extractHeadings(value), [value]);

  useEffect(() => {
    const root = previewRef.current;
    if (!root || mode === "source") return;
    const nodes = [...root.querySelectorAll("h1, h2, h3, h4")];
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveHeading(visible[0].target.id);
      },
      { root, rootMargin: "0px 0px -65% 0px", threshold: 0.1 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [value, mode]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return docs;
    return docs.filter((doc) =>
      `${doc.title}\n${doc.path}\n${doc.content}`.toLowerCase().includes(needle),
    );
  }, [docs, query]);

  const draft = value !== current.content;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const showOutline = outlineOpen && mode !== "split";
  const groups = groupDocs(docs);

  function update(next: string) {
    writeStorage(storageKey, next);
  }

  function reset() {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event("markdown-kb-draft"));
  }

  function jump(id: string, text: string) {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (mode !== "source") {
      previewRef.current?.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({
        behavior: motion,
        block: "start",
      });
      return;
    }
    const view = viewRef.current;
    if (!view) return;
    const lines = view.state.doc.toString().split("\n");
    const index = lines.findIndex((line) => line.replace(/^#{1,6}\s+/, "").trim() === text);
    if (index < 0) return;
    const line = view.state.doc.line(index + 1);
    view.dispatch({ selection: { anchor: line.from }, scrollIntoView: true });
    view.focus();
  }

  function openDoc(path: string) {
    const doc = docs.find((entry) => entry.path === path);
    if (!doc) return;
    setPaletteOpen(false);
    setQuery("");
    setSidebarOpen(false);
    router.push(`/${doc.slug.join("/")}`);
  }

  return (
    <div className="shell">
      <aside className={sidebarOpen ? "sidebar is-open" : "sidebar"}>
        <div className="brand">markdown-kb</div>
        <button type="button" className="search-button" onClick={() => setPaletteOpen(true)}>
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>
        <nav className="tree" aria-label="Pages">
          {groups.map((group) => (
            <div key={group.folder}>
              <div className="tree-group">{group.label}</div>
              {group.docs.map((doc) => (
                <Link
                  key={doc.path}
                  href={`/${doc.slug.join("/")}`}
                  className="tree-link"
                  aria-current={doc.path === current.path ? "page" : undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  {doc.title}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {sidebarOpen ? <button type="button" className="scrim" aria-label="Close files" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="main">
        <header className="topbar">
          <button type="button" className="files-button" onClick={() => setSidebarOpen(true)}>
            Files
          </button>
          <p className="crumbs">
            {current.slug.slice(0, -1).join(" / ")}
            {current.slug.length > 1 ? " / " : ""}
            <strong>{current.slug.at(-1)}.md</strong>
          </p>
          <div className="topbar-spacer" />
          {draft ? (
            <button type="button" className="text-button" onClick={reset}>
              Reset draft
            </button>
          ) : null}
          <div className="segment" role="group" aria-label="View">
            {MODES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={mode === item}
                onClick={() => setMode(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <div className={`stage ${mode}${showOutline ? "" : " outline-hidden"}`}>
          {mode !== "preview" ? (
            <div className="source-pane">
              <Editor value={value} onChange={update} onView={(view) => { viewRef.current = view; }} />
            </div>
          ) : null}
          {mode !== "source" ? (
            <div className="preview-pane" ref={previewRef}>
              <article className="md-column">
                <MarkdownView source={value} docs={docs} />
              </article>
            </div>
          ) : null}
          {showOutline ? (
            <aside className="outline" aria-label="Outline">
              <h2>Outline</h2>
              {headings.length === 0 ? <p className="outline-empty">No headings</p> : null}
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  type="button"
                  className={heading.id === activeHeading ? "is-active" : undefined}
                  style={{ paddingLeft: 8 + (heading.depth - 1) * 12 }}
                  onClick={() => jump(heading.id, heading.text)}
                >
                  {heading.text}
                </button>
              ))}
            </aside>
          ) : null}
        </div>

        <footer className="status">
          <span>{draft ? "Local draft" : "Repository copy"}</span>
          <span className="status-gap" />
          <span>{words} words</span>
          <span>{mode}</span>
        </footer>
      </div>

      {paletteOpen ? (
        <div className="overlay" onMouseDown={() => setPaletteOpen(false)}>
          <div
            className="palette"
            role="dialog"
            aria-label="Search pages"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(0);
              }}
              placeholder="Search pages"
              aria-label="Search query"
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSelected((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setSelected((index) => Math.max(index - 1, 0));
                } else if (event.key === "Enter" && results[Math.min(selected, results.length - 1)]) {
                  event.preventDefault();
                  openDoc(results[Math.min(selected, results.length - 1)].path);
                }
              }}
            />
            <div className="palette-list">
              {results.length === 0 ? <p className="palette-empty">No matching pages</p> : null}
              {results.map((doc, index) => (
                <button
                  key={doc.path}
                  type="button"
                  className={index === Math.min(selected, results.length - 1) ? "palette-item is-active" : "palette-item"}
                  onMouseEnter={() => setSelected(index)}
                  onClick={() => openDoc(doc.path)}
                >
                  {doc.title}
                  <small>{doc.path}</small>
                  {query.trim() ? <small>{snippet(doc.content, query)}</small> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {helpOpen ? (
        <div className="overlay" onMouseDown={() => setHelpOpen(false)}>
          <div className="help" role="dialog" aria-label="Shortcuts" onMouseDown={(event) => event.stopPropagation()}>
            <h2>Shortcuts</h2>
            <Shortcut keys="⌘K" label="Search pages" />
            <Shortcut keys="⌘/" label="Cycle Preview, Split, and Source" />
            <Shortcut keys={"⌘" + String.fromCharCode(92)} label="Show or hide the outline" />
            <Shortcut keys="⌘S" label="Keep the local draft" />
            <Shortcut keys="?" label="Show this list" />
            <p className="help-note">On Linux and Windows, Ctrl is the modifier.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="shortcut">
      <span>{label}</span>
      <kbd>{keys}</kbd>
    </div>
  );
}

function groupDocs(docs: Doc[]) {
  const folders: string[] = [];
  for (const doc of docs) {
    const folder = doc.slug[0] ?? "docs";
    if (!folders.includes(folder)) folders.push(folder);
  }
  return folders.map((folder) => ({
    folder,
    label: folder.charAt(0).toUpperCase() + folder.slice(1),
    docs: docs.filter((doc) => (doc.slug[0] ?? "docs") === folder),
  }));
}

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

function useDraft(key: string, fallback: string) {
  return useSyncExternalStore(
    subscribeDrafts,
    () => window.localStorage.getItem(key) ?? fallback,
    () => fallback,
  );
}

function useMode(): Mode {
  return useSyncExternalStore(subscribeDrafts, readMode, () => "preview");
}

function readMode(): Mode {
  const stored = window.localStorage.getItem("markdown-kb:mode");
  if (stored === "preview" || stored === "split" || stored === "source") return stored;
  return "preview";
}

function setMode(mode: Mode) {
  writeStorage("markdown-kb:mode", mode);
}

function snippet(content: string, query: string) {
  const needle = query.trim().toLowerCase();
  const index = content.toLowerCase().indexOf(needle);
  if (index < 0) return "";
  const start = Math.max(0, index - 28);
  return content.slice(start, index + needle.length + 48).replace(/\s+/g, " ").trim();
}
