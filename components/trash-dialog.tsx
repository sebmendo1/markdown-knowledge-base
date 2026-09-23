"use client";

import { useEffect, useState } from "react";
import type { Workspace } from "@/lib/workspace/model";
import { purge, restore } from "./page-actions";
import { listen } from "./ui-events";
import { docOf } from "./workspace-store";

const when = (at: number) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(at);

export function TrashDialog({ ws }: { ws: Workspace }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);

  useEffect(
    () =>
      listen("markdown-kb-trash", () => {
        setConfirm(null);
        setOpen(true);
      }),
    [],
  );

  if (!open) return null;
  const close = () => setOpen(false);

  return (
    <div className="overlay sheet-overlay" onMouseDown={close}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Trash"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            close();
          }
        }}
      >
        <header className="share-top">
          <h2>Trash</h2>
          <button type="button" className="icon-button" aria-label="Close trash" onClick={close} autoFocus>
            ×
          </button>
        </header>
        <div className="sheet-body">
          {ws.trash.length === 0 ? (
            <p className="sheet-empty">Trash is empty. Pages you delete wait here until you remove them for good.</p>
          ) : (
            <ul className="trash-list">
              {ws.trash.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{docOf(item).title}</strong>
                    <small>
                      {item.path} · {when(item.deletedAt)}
                    </small>
                  </div>
                  <button type="button" className="text-button" onClick={() => restore(item.id)}>
                    Restore
                  </button>
                  <button
                    type="button"
                    className="text-button is-danger"
                    onClick={() => (confirm === item.id ? purge(item.id) : setConfirm(item.id))}
                  >
                    {confirm === item.id ? "Delete for good" : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {ws.trash.length > 0 ? (
            <div className="share-actions">
              <button type="button" className="text-button is-danger" onClick={() => (confirm === "all" ? purge() : setConfirm("all"))}>
                {confirm === "all" ? `Delete ${ws.trash.length} for good` : "Empty Trash"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
