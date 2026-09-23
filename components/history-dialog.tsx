"use client";

import { useEffect, useState } from "react";
import type { Workspace } from "@/lib/workspace/model";
import type { PageDoc } from "@/lib/workspace/tree";
import { restoreVersion, useHistory } from "./history-store";
import { MarkdownView } from "./markdown-view";
import { notify } from "./toast-host";
import { listen } from "./ui-events";
import { docOf } from "./workspace-store";

const when = (at: number) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(at);
const words = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export function HistoryDialog({ ws, docs }: { ws: Workspace; docs: PageDoc[] }) {
  const [id, setId] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const history = useHistory(id);

  useEffect(
    () =>
      listen("markdown-kb-history", (next) => {
        setId(next);
        setSelected(0);
      }),
    [],
  );

  const page = ws.pages.find((entry) => entry.id === id);
  if (!id || !page) return null;
  const versions = [
    { key: "now", label: "Current version", time: "Now", content: page.content },
    ...history.map((entry) => ({ key: String(entry.at), label: entry.label, time: when(entry.at), content: entry.content })),
    ...(page.base !== undefined ? [{ key: "repo", label: "Repository copy", time: "From the files", content: page.base }] : []),
  ];
  const chosen = versions[Math.min(selected, versions.length - 1)];
  const close = () => setId(null);

  return (
    <div className="overlay sheet-overlay" onMouseDown={close}>
      <div
        className="sheet history"
        role="dialog"
        aria-label={`Version history of ${docOf(page).title}`}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            close();
          }
        }}
      >
        <header className="share-top">
          <h2>Version history · {docOf(page).title}</h2>
          <button type="button" className="icon-button" aria-label="Close version history" onClick={close} autoFocus>
            ×
          </button>
        </header>
        <div className="history-body">
          <nav className="history-list" aria-label="Versions">
            {versions.map((version, index) => (
              <button key={version.key} type="button" className={version === chosen ? "is-active" : undefined} onClick={() => setSelected(index)}>
                <span>{version.label}</span>
                <small>
                  {version.time} · {words(version.content)} words
                </small>
              </button>
            ))}
            {history.length === 0 ? <p className="sheet-empty">Versions appear as you edit. Press ⌘S to keep one on purpose.</p> : null}
          </nav>
          <div className="history-preview">
            <MarkdownView source={chosen.content} docs={docs} />
          </div>
        </div>
        <div className="history-actions">
          <button
            type="button"
            className="share-button"
            disabled={chosen.content === page.content}
            onClick={() => {
              restoreVersion(page.id, chosen.content);
              notify("Version restored");
              close();
            }}
          >
            Restore this version
          </button>
        </div>
      </div>
    </div>
  );
}
