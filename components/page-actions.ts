"use client";

import { createFolder, createPage, purgePage, restorePage, trashFolder, trashPage } from "@/lib/workspace/model";
import { duplicatePage, moveFolder, movePage, renameFolder, renamePage } from "@/lib/workspace/moves";
import { folderOf, humanize, nameOf, within } from "@/lib/workspace/paths";
import { importFiles } from "@/lib/workspace/tree";
import { zip } from "@/lib/workspace/zip";
import { forgetAgentChanges } from "./agent-changes";
import { forgetHistory, readHistory, restoreVersion, snapshot } from "./history-store";
import { notify } from "./toast-host";
import { commit, currentProject, docOf, makeId, readProject, readWorkspace } from "./workspace-store";

const now = () => Date.now();
const find = (id: string) => readWorkspace().pages.find((page) => page.id === id);
const pathOf = (id: string) => find(id)?.path ?? "";

export function newPage(folder: string, title: string): string {
  let path = "";
  commit((ws) => {
    const made = createPage(ws, folder, title, makeId(), now());
    path = made.page.path;
    return made.ws;
  });
  return path;
}

export function newPageAt(path: string): string {
  const title = humanize(nameOf(path));
  return newPage(folderOf(path), title);
}

export function newFolder(parent: string, name: string): string {
  let folder = "";
  commit((ws) => {
    const made = createFolder(ws, parent, name);
    folder = made.folder;
    return made.ws;
  });
  return folder;
}

export function renamePageTo(id: string, title: string) {
  commit((ws) => renamePage(ws, id, title, now()));
  return pathOf(id);
}

export function renameFolderTo(folder: string, name: string) {
  commit((ws) => renameFolder(ws, folder, name, now()));
}

export function movePageTo(id: string, folder: string) {
  commit((ws) => movePage(ws, id, folder, now()));
}

export function moveFolderTo(folder: string, parent: string) {
  commit((ws) => moveFolder(ws, folder, parent, now()));
}

export function duplicate(id: string): string {
  let path = "";
  commit((ws) => {
    const made = duplicatePage(ws, id, makeId(), now());
    path = made.page?.path ?? "";
    return made.ws;
  });
  return path;
}

export function trash(id: string) {
  const page = find(id);
  if (!page) return;
  commit((ws) => trashPage(ws, id, now()));
  notify(`Moved “${docOf(page).title}” to Trash`, { label: "Undo", run: () => commit((ws) => restorePage(ws, id)) });
}

export function trashFolderAt(folder: string) {
  const ids = readWorkspace()
    .pages.filter((page) => within(page.path, folder))
    .map((page) => page.id);
  commit((ws) => trashFolder(ws, folder, now()));
  notify(`Moved “${humanize(nameOf(folder))}” to Trash`, {
    label: "Undo",
    run: () => commit((ws) => ({ ...ids.reduce(restorePage, ws), folders: [...ws.folders, folder] })),
  });
}

export function restore(id: string) {
  commit((ws) => restorePage(ws, id));
}

export function purge(id?: string) {
  const ids = readWorkspace()
    .trash.filter((item) => id === undefined || item.id === id)
    .map((item) => item.id);
  commit((ws) => purgePage(ws, id));
  ids.forEach(forgetHistory);
  ids.forEach(forgetAgentChanges);
}

export function revert(id: string) {
  const page = find(id);
  if (page?.base !== undefined) restoreVersion(id, page.base, "Before reverting");
}

export function saveVersion(id: string) {
  const page = find(id);
  if (!page) return;
  const saved = snapshot(id, page.content, "Saved version");
  notify(saved ? "Version saved" : readHistory(id).length ? "No changes since the last version" : "Version saved");
}

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPage(id: string) {
  const page = find(id);
  if (page) download(`${nameOf(page.path)}.md`, new Blob([page.content], { type: "text/markdown" }));
}

export function exportWorkspace(project = currentProject()) {
  const ws = project === currentProject() ? readWorkspace() : readProject(project, []);
  const pages = ws.pages.map((page) => ({ path: page.path, content: page.content }));
  download(`${project}.zip`, new Blob([zip(pages)], { type: "application/zip" }));
  notify(`Exported ${pages.length} ${pages.length === 1 ? "page" : "pages"}`);
}

export async function importInto(files: File[], folder: string): Promise<string[]> {
  const markdown = files.filter((file) => /\.(md|markdown|txt)$/i.test(file.name));
  if (markdown.length === 0) {
    notify("Choose .md files to import");
    return [];
  }
  const read = await Promise.all(markdown.map(async (file) => ({ name: file.name, content: await file.text() })));
  let paths: string[] = [];
  commit((ws) => {
    const made = importFiles(ws, read, folder, makeId, now());
    paths = made.paths;
    return made.ws;
  });
  notify(`Imported ${paths.length} ${paths.length === 1 ? "page" : "pages"}`);
  return paths;
}
