"use client";

import { hrefOf } from "@/lib/workspace/paths";
import { downloadPage, duplicate, exportWorkspace, trash, trashFolderAt } from "./page-actions";
import type { MenuItem } from "./popover-menu";
import { emit, type Target } from "./ui-events";

export function treeItems(target: Target | null, project: string, go: (href: string) => void, pick: (folder: string) => void): MenuItem[] {
  if (!target) {
    return [
      { label: "New page", hint: "C", run: () => emit("markdown-kb-create", { kind: "page", folder: "" }) },
      { label: "New folder", run: () => emit("markdown-kb-create", { kind: "folder", folder: "" }) },
      "divider",
      { label: "Import Markdown files…", run: () => pick("") },
      { label: "Export project (.zip)", run: exportWorkspace },
      "divider",
      { label: "Trash", run: () => emit("markdown-kb-trash", null) },
    ];
  }

  if (target.kind === "folder") {
    const folder = target.path;
    return [
      { label: "New page", run: () => emit("markdown-kb-create", { kind: "page", folder }) },
      { label: "New folder", run: () => emit("markdown-kb-create", { kind: "folder", folder }) },
      { label: "Import Markdown files…", run: () => pick(folder) },
      "divider",
      { label: "Rename", run: () => emit("markdown-kb-rename", target) },
      { label: "Move to…", run: () => emit("markdown-kb-move", target) },
      "divider",
      { label: "Move to Trash", danger: true, run: () => trashFolderAt(folder) },
    ];
  }

  const id = target.id;
  return [
    { label: "Rename", run: () => emit("markdown-kb-rename", target) },
    {
      label: "Duplicate",
      run: () => {
        const path = duplicate(id);
        if (path) go(hrefOf(project, path));
      },
    },
    { label: "Move to…", run: () => emit("markdown-kb-move", target) },
    "divider",
    { label: "Version history", run: () => emit("markdown-kb-history", id) },
    { label: "Download Markdown", run: () => downloadPage(id) },
    "divider",
    { label: "Move to Trash", danger: true, run: () => trash(id) },
  ];
}
