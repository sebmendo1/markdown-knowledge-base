"use client";

import { useState } from "react";
import { isMap, isScalar, parseDocument } from "yaml";

const HIDDEN = new Set(["title", "type"]);

function innerYaml(front: string): string {
  return front.replace(/^---\r?\n/, "").replace(/\r?\n?---(?:\r?\n)?$/, "");
}

export function Properties({ front, onChange }: { front: string; onChange: (next: string) => void }) {
  const doc = parseDocument(innerYaml(front));
  if (doc.errors.length > 0 || !isMap(doc.contents)) return null;
  const rows = doc.contents.items
    .map((pair) => ({ key: String(isScalar(pair.key) ? pair.key.value : pair.key), value: pair.value }))
    .filter((row) => !HIDDEN.has(row.key));
  if (rows.length === 0) return null;

  function commit(key: string, text: string, original: unknown) {
    const next = parseDocument(innerYaml(front));
    let value: unknown = text;
    if (typeof original === "number" && text.trim() !== "" && !Number.isNaN(Number(text))) value = Number(text);
    if (typeof original === "boolean" && (text === "true" || text === "false")) value = text === "true";
    if (String(original ?? "") === text) return;
    next.set(key, value);
    const ending = /---\r?\n$/.test(front) ? "\n" : "";
    onChange(`---\n${String(next)}---${ending}`);
  }

  return (
    <dl className="properties properties-edit" contentEditable={false}>
      {rows.map((row) => {
        const scalar = isScalar(row.value) ? row.value.value : undefined;
        return (
          <div key={row.key}>
            <dt>{row.key}</dt>
            <dd>
              {isScalar(row.value) ? (
                <PropertyInput value={scalar == null ? "" : String(scalar)} label={row.key} onCommit={(text) => commit(row.key, text, scalar)} />
              ) : (
                <span title="Edit in Markdown source (⌘/)">{JSON.stringify(row.value?.toJSON?.() ?? row.value)}</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function PropertyInput({ value, label, onCommit }: { value: string; label: string; onCommit: (text: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setDraft(value);
  }
  return (
    <input
      value={draft}
      size={Math.max(2, draft.length)}
      aria-label={label}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(value);
          event.currentTarget.blur();
        }
      }}
    />
  );
}
