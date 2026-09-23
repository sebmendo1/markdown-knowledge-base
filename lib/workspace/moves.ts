import { titleOf } from "../markdown/outline";
import { allFolders, pagePath, type Page, type Workspace } from "./model";
import { folderOf, join, nameOf, slugify, uniquePath, within } from "./paths";
import { relinker } from "./relink";
import { setTitle } from "./title";

function apply(ws: Workspace, moves: Map<string, string>, now: number, edits = new Map<string, string>()): Workspace {
  const fix = relinker(
    ws.pages.map((page) => page.path),
    moves,
  );
  const pages = ws.pages.map((page) => {
    const path = moves.get(page.path) ?? page.path;
    const content = fix(edits.get(page.id) ?? page.content);
    if (path === page.path && content === page.content) return page;
    return { ...page, path, content, updatedAt: now };
  });
  return { ...ws, pages };
}

export function renamePage(ws: Workspace, id: string, title: string, now: number): Workspace {
  const page = ws.pages.find((entry) => entry.id === id);
  if (!page) return ws;
  const same = slugify(title) === slugify(nameOf(page.path));
  const path = same ? page.path : pagePath(ws, folderOf(page.path), title, id);
  return apply(ws, new Map([[page.path, path]]), now, new Map([[id, setTitle(page.content, title)]]));
}

export function movePage(ws: Workspace, id: string, folder: string, now: number): Workspace {
  const page = ws.pages.find((entry) => entry.id === id);
  if (!page || folderOf(page.path) === folder) return ws;
  const path = pagePath(ws, folder, nameOf(page.path), id);
  const next = apply(ws, new Map([[page.path, path]]), now);
  const keep = folderOf(page.path);
  return keep && !next.folders.includes(keep) ? { ...next, folders: [...next.folders, keep] } : next;
}

function relocate(ws: Workspace, from: string, to: string, now: number): Workspace {
  if (from === to) return ws;
  const moves = new Map<string, string>();
  for (const page of ws.pages) {
    if (within(page.path, from)) moves.set(page.path, `${to}${page.path.slice(from.length)}`);
  }
  const moved = (folder: string) => (folder === from || within(folder, from) ? `${to}${folder.slice(from.length)}` : folder);
  const next = apply(ws, moves, now);
  return { ...next, folders: [...new Set([...ws.folders.map(moved), to])] };
}

export function renameFolder(ws: Workspace, folder: string, name: string, now: number): Workspace {
  const others = allFolders(ws).filter((entry) => entry !== folder && !within(entry, folder));
  const target = uniquePath(others, join(folderOf(folder), slugify(name)));
  return relocate(ws, folder, target, now);
}

export function moveFolder(ws: Workspace, folder: string, parent: string, now: number): Workspace {
  if (parent === folder || within(parent, folder) || folderOf(folder) === parent) return ws;
  const others = allFolders(ws).filter((entry) => entry !== folder && !within(entry, folder));
  const target = uniquePath(others, join(parent, nameOf(folder)));
  return relocate(ws, folder, target, now);
}

export function duplicatePage(ws: Workspace, id: string, newId: string, now: number) {
  const page = ws.pages.find((entry) => entry.id === id);
  if (!page) return { ws, page: undefined };
  const title = `${titleOf(page.content, nameOf(page.path))} copy`;
  const copy: Page = {
    id: newId,
    path: pagePath(ws, folderOf(page.path), title),
    content: setTitle(page.content, title),
    createdAt: now,
    updatedAt: now,
  };
  const index = ws.pages.indexOf(page);
  const pages = [...ws.pages.slice(0, index + 1), copy, ...ws.pages.slice(index + 1)];
  return { ws: { ...ws, pages }, page: copy };
}
