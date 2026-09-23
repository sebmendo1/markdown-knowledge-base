import { ancestors, folderOf, join, slugify, uniquePath } from "./paths";

export type Page = {
  id: string;
  path: string;
  content: string;
  origin?: string;
  base?: string;
  createdAt: number;
  updatedAt: number;
};

export type Trashed = Page & { deletedAt: number };

export type Workspace = {
  version: 1;
  pages: Page[];
  folders: string[];
  trash: Trashed[];
  removed: string[];
};

export type RepoDoc = { path: string; content: string };

export function seed(repo: RepoDoc[], draft: (path: string) => string | null = () => null, prefix = "repo:"): Workspace {
  return {
    version: 1,
    pages: repo.map((doc) => repoPage(doc, draft(doc.path) ?? doc.content, doc.path, prefix)),
    folders: [],
    trash: [],
    removed: [],
  };
}

function repoPage(doc: RepoDoc, content: string, path: string, prefix: string): Page {
  return { id: `${prefix}${doc.path}`, path, content, origin: doc.path, base: doc.content, createdAt: 0, updatedAt: 0 };
}

export function reconcile(ws: Workspace, repo: RepoDoc[], prefix = "repo:"): Workspace {
  const byOrigin = new Map(repo.map((doc) => [doc.path, doc]));
  let changed = false;
  const pages = ws.pages.map((page) => {
    const doc = page.origin ? byOrigin.get(page.origin) : undefined;
    if (!doc || doc.content === page.base) return page;
    changed = true;
    const untouched = page.content === page.base;
    return { ...page, base: doc.content, content: untouched ? doc.content : page.content };
  });

  const known = new Set([...ws.pages, ...ws.trash].map((page) => page.origin).concat(ws.removed));
  for (const doc of repo) {
    if (known.has(doc.path)) continue;
    changed = true;
    const path = uniquePath(pages.map((page) => page.path), doc.path.replace(/\.md$/i, ""), ".md");
    pages.push(repoPage(doc, doc.content, path, prefix));
  }
  return changed ? { ...ws, pages } : ws;
}

export function allFolders(ws: Workspace): string[] {
  const set = new Set<string>();
  for (const folder of ws.folders) ancestors(folder).forEach((entry) => set.add(entry));
  for (const page of ws.pages) ancestors(folderOf(page.path)).forEach((entry) => set.add(entry));
  return [...set].sort();
}

export function pagePath(ws: Workspace, folder: string, name: string, except?: string): string {
  const taken = ws.pages.filter((page) => page.id !== except).map((page) => page.path);
  return uniquePath(taken, join(folder, slugify(name)), ".md");
}

function keepFolder(folders: string[], folder: string): string[] {
  return folder && !folders.includes(folder) ? [...folders, folder] : folders;
}

export function createPage(ws: Workspace, folder: string, title: string, id: string, now: number, content?: string) {
  const page: Page = {
    id,
    path: pagePath(ws, folder, title),
    content: content ?? `# ${title.trim() || "Untitled"}\n\n`,
    createdAt: now,
    updatedAt: now,
  };
  return { ws: { ...ws, pages: [...ws.pages, page], folders: keepFolder(ws.folders, folder) }, page };
}

export function createFolder(ws: Workspace, parent: string, name: string) {
  const folder = uniquePath(allFolders(ws), join(parent, slugify(name)));
  return { ws: { ...ws, folders: [...ws.folders, folder] }, folder };
}

export function updateContent(ws: Workspace, id: string, content: string, now: number): Workspace {
  return {
    ...ws,
    pages: ws.pages.map((page) => (page.id === id && page.content !== content ? { ...page, content, updatedAt: now } : page)),
  };
}

export function trashPage(ws: Workspace, id: string, now: number): Workspace {
  const page = ws.pages.find((entry) => entry.id === id);
  if (!page) return ws;
  return {
    ...ws,
    pages: ws.pages.filter((entry) => entry.id !== id),
    folders: keepFolder(ws.folders, folderOf(page.path)),
    trash: [{ ...page, deletedAt: now }, ...ws.trash],
  };
}

export function trashFolder(ws: Workspace, folder: string, now: number): Workspace {
  const inside = (path: string) => path === folder || path.startsWith(`${folder}/`);
  const gone = ws.pages.filter((page) => inside(folderOf(page.path)));
  return {
    ...ws,
    pages: ws.pages.filter((page) => !inside(folderOf(page.path))),
    folders: keepFolder(ws.folders.filter((entry) => !inside(entry)), folderOf(folder)),
    trash: [...gone.map((page) => ({ ...page, deletedAt: now })), ...ws.trash],
  };
}

export function restorePage(ws: Workspace, id: string): Workspace {
  const item = ws.trash.find((entry) => entry.id === id);
  if (!item) return ws;
  const { deletedAt: _deletedAt, ...page } = item;
  void _deletedAt;
  const path = uniquePath(ws.pages.map((entry) => entry.path), page.path.replace(/\.md$/i, ""), ".md");
  return { ...ws, pages: [...ws.pages, { ...page, path }], trash: ws.trash.filter((entry) => entry.id !== id) };
}

export function purgePage(ws: Workspace, id?: string): Workspace {
  const gone = ws.trash.filter((entry) => id === undefined || entry.id === id);
  const origins = gone.map((entry) => entry.origin).filter((origin): origin is string => Boolean(origin));
  return {
    ...ws,
    trash: ws.trash.filter((entry) => !gone.includes(entry)),
    removed: [...new Set([...ws.removed, ...origins])],
  };
}
