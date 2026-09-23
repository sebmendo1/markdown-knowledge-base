"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hrefOf } from "@/lib/workspace/paths";
import { setMode } from "./draft-store";
import { createProject, renameProject } from "./project-store";

export type ProjectDraft = { mode: "create" } | { mode: "rename"; slug: string; name: string; description: string };

export function ProjectDialog({ draft, taken, onClose }: { draft: ProjectDraft; taken: string[]; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(draft.mode === "rename" ? draft.name : "");
  const [description, setDescription] = useState(draft.mode === "rename" ? draft.description : "");
  const nameRef = useRef<HTMLInputElement>(null);
  const creating = draft.mode === "create";

  useEffect(() => {
    nameRef.current?.focus();
    nameRef.current?.select();
  }, []);

  function submit() {
    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }
    if (draft.mode === "rename") {
      renameProject(draft.slug, name, description);
      onClose();
      return;
    }
    const made = createProject(name, description, taken);
    if (!made) return;
    onClose();
    setMode("edit");
    router.push(hrefOf(made.slug, made.path));
  }

  return (
    <div className="overlay share-overlay" onMouseDown={onClose}>
      <form
        className="share-dialog project-form"
        role="dialog"
        aria-label={creating ? "New project" : `Rename ${draft.name}`}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onClose();
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <header className="share-top">
          <h2>{creating ? "New project" : "Rename project"}</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="share-body">
          {creating ? <p>A project is a folder of pages. It lives in this browser until you export it.</p> : null}
          <label className="project-field">
            <span>Name</span>
            <input ref={nameRef} value={name} maxLength={80} placeholder="Product docs" onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="project-field">
            <span>Description</span>
            <textarea
              value={description}
              rows={2}
              maxLength={200}
              placeholder="What this project holds"
              onChange={(event) => setDescription(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
          </label>
          <div className="share-actions">
            <button type="button" className="text-button project-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="share-button" disabled={!name.trim()}>
              {creating ? "Create project" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
