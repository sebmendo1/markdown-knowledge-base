import type { Workspace } from "./model";
import { folderOf, slugify, uniquePath } from "./paths";

export type ProjectKind = "repo" | "local" | "disk";

export type ProjectEntry = {
  slug: string;
  name: string;
  description: string;
  kind: ProjectKind;
};

export type RepoProjectSummary = ProjectEntry & { kind: "repo"; paths: string[] };
export type ProjectSummary = ProjectEntry & { paths: string[] };

export type LocalProject = {
  slug: string;
  name: string;
  description: string;
  createdAt: number;
};

export type Registry = {
  version: 1;
  local: LocalProject[];
  opened: Record<string, number>;
  last: Record<string, string>;
};

export const LEGACY_PROJECT = "guide";
export const RESERVED_SLUGS = ["docs", "ledger", "api", "new", "open", "projects", "settings"];
export const BUILTIN_SLUGS = ["guide", "specs"];
export const DISK_BLOCKED = [...RESERVED_SLUGS, ...BUILTIN_SLUGS];

export function projectKindLabel(kind: ProjectKind): string {
  if (kind === "disk") return "On this computer";
  if (kind === "local") return "This browser";
  return "Repository";
}

export const emptyRegistry = (): Registry => ({ version: 1, local: [], opened: {}, last: {} });

export function projectSlug(taken: Iterable<string>, name: string): string {
  return uniquePath([...taken, ...RESERVED_SLUGS], slugify(name));
}

export function repoIdPrefix(project: string): string {
  return project === LEGACY_PROJECT ? "repo:" : `repo:${project}:`;
}

export type ProjectStats = { pages: number; folders: string[]; updatedAt: number };

export function projectStats(ws: Workspace | null, repoPaths: string[]): ProjectStats {
  const known = new Set(ws ? [...ws.pages, ...ws.trash].map((page) => page.origin).concat(ws.removed) : []);
  const paths = [...(ws?.pages.map((page) => page.path) ?? []), ...repoPaths.filter((path) => !known.has(path))];
  const top = new Set<string>();
  for (const path of paths) {
    const folder = folderOf(path);
    if (folder) top.add(folder.split("/")[0]);
  }
  for (const folder of ws?.folders ?? []) top.add(folder.split("/")[0]);
  const updatedAt = Math.max(0, ...(ws?.pages.map((page) => page.updatedAt) ?? []));
  return { pages: paths.length, folders: [...top].sort(), updatedAt };
}

export type FolderFile = { path: string; content: string };

const SKIP = /(^|\/)(\.[^/]*|node_modules)(\/|$)/;

export function folderPages(files: FolderFile[]): { name: string; pages: FolderFile[] } {
  const clean = files
    .map((file) => ({ ...file, path: file.path.replace(/\\/g, "/").replace(/^\/+/, "") }))
    .filter((file) => /\.(md|markdown)$/i.test(file.path) && !SKIP.test(file.path));
  const roots = new Set(clean.map((file) => (file.path.includes("/") ? file.path.split("/")[0] : "")));
  const root = roots.size === 1 ? [...roots][0] : "";
  const taken = new Set<string>();
  const pages = clean
    .map((file) => ({ path: root ? file.path.slice(root.length + 1) : file.path, content: file.content.replace(/\r\n/g, "\n") }))
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((file) => {
      const base = file.path.replace(/\.(md|markdown)$/i, "");
      let path = `${base}.md`;
      for (let count = 2; taken.has(path.toLowerCase()); count += 1) path = `${base}-${count}.md`;
      taken.add(path.toLowerCase());
      return { path, content: file.content };
    });
  return { name: root, pages };
}

export function sortProjects<T extends ProjectEntry>(projects: T[], opened: Record<string, number>): T[] {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((a, b) => (opened[b.project.slug] ?? 0) - (opened[a.project.slug] ?? 0) || a.index - b.index)
    .map((entry) => entry.project);
}
