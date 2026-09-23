"use client";

import { useEffect, useRef, useState } from "react";
import { allFolders, type Workspace } from "@/lib/workspace/model";
import { folderOf, humanize, nameOf, within } from "@/lib/workspace/paths";
import { moveFolderTo, movePageTo } from "./page-actions";
import { notify } from "./toast-host";
import { listen, type Target } from "./ui-events";
import { docOf } from "./workspace-store";

const labelOf = (folder: string) => (folder ? folder.split("/").map(humanize).join(" / ") : "Top level");

export function MoveDialog({ ws }: { ws: Workspace }) {
  const [target, setTarget] = useState<Target | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () =>
      listen("markdown-kb-move", (next) => {
        setTarget(next);
        setQuery("");
        setSelected(0);
      }),
    [],
  );

  useEffect(() => {
    if (target) inputRef.current?.focus();
  }, [target]);

  if (!target) return null;
  const page = target.kind === "page" ? ws.pages.find((entry) => entry.id === target.id) : undefined;
  const from = page ? folderOf(page.path) : target.kind === "folder" ? folderOf(target.path) : "";
  const name = page ? docOf(page).title : target.kind === "folder" ? humanize(nameOf(target.path)) : "";
  const needle = query.trim().toLowerCase();
  const options = ["", ...allFolders(ws)]
    .filter((folder) => folder !== from)
    .filter((folder) => target.kind === "page" || (folder !== target.path && !within(folder, target.path)))
    .filter((folder) => !needle || labelOf(folder).toLowerCase().includes(needle));
  const active = Math.min(selected, Math.max(options.length - 1, 0));

  function choose(folder: string) {
    if (!target) return;
    if (target.kind === "page") movePageTo(target.id, folder);
    else moveFolderTo(target.path, folder);
    notify(`Moved “${name}” to ${labelOf(folder)}`);
    setTarget(null);
  }

  return (
    <div className="overlay" onMouseDown={() => setTarget(null)}>
      <div className="palette" role="dialog" aria-label={`Move ${name}`} onMouseDown={(event) => event.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          placeholder={`Move “${name}” to…`}
          aria-label="Find a folder"
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setTarget(null);
            } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              const step = event.key === "ArrowDown" ? 1 : -1;
              setSelected(Math.max(0, Math.min(active + step, options.length - 1)));
            } else if (event.key === "Enter" && options[active] !== undefined) {
              event.preventDefault();
              choose(options[active]);
            }
          }}
        />
        <div className="palette-list">
          {options.length === 0 ? <p className="palette-empty">No other folders. Create one from the sidebar menu.</p> : null}
          {options.map((folder, index) => (
            <button
              key={folder || "/"}
              type="button"
              className={index === active ? "palette-item is-active" : "palette-item"}
              onMouseEnter={() => setSelected(index)}
              onClick={() => choose(folder)}
            >
              {labelOf(folder)}
              <small>{folder ? `${folder}/` : "/"}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
