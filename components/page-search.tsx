"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Doc } from "@/lib/docs";
import { snippet } from "./draft-store";

export function PageSearch({
  docs,
  open,
  onClose,
  onOpen,
}: {
  docs: Doc[];
  open: boolean;
  onClose: () => void;
  onOpen: (path: string) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return docs;
    return docs.filter((doc) => `${doc.title}\n${doc.path}\n${doc.content}`.toLowerCase().includes(needle));
  }, [docs, query]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  if (!open) return null;
  const current = results[Math.min(selected, Math.max(results.length - 1, 0))];

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-label="Search pages" onMouseDown={(event) => event.stopPropagation()}>
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
            } else if (event.key === "Enter" && current) {
              event.preventDefault();
              onOpen(current.path);
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
              onClick={() => onOpen(doc.path)}
            >
              {doc.title}
              <small>{doc.path}</small>
              {query.trim() ? <small>{snippet(doc.content, query)}</small> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
