"use client";

import { useSyncExternalStore } from "react";
import { createPage, type Workspace } from "@/lib/workspace/model";
import { emptyRegistry, folderPages, projectSlug, type FolderFile, type LocalProject, type Registry } from "@/lib/workspace/projects";
import { humanize } from "@/lib/workspace/paths";
import { notify } from "./toast-host";
import { changed, forgetProject, makeId, subscribe, writeProject } from "./workspace-store";

const KEY = "markdown-kb:projects";
const EMPTY = emptyRegistry();
let cache: { raw: string | null; registry: Registry } = { raw: null, registry: EMPTY };

function readRegistry(): Registry {
  const raw = window.localStorage.getItem(KEY);
  if (raw === cache.raw) return cache.registry;
  let registry = emptyRegistry();
  try {
    const parsed = raw ? (JSON.parse(raw) as Registry) : null;
    if (parsed?.version === 1) registry = { ...emptyRegistry(), ...parsed };
  } catch {}
  cache = { raw, registry };
  return registry;
}

export function useRegistry(): Registry {
  return useSyncExternalStore(subscribe, readRegistry, () => EMPTY);
}

function save(update: (registry: Registry) => Registry): boolean {
  const next = update(readRegistry());
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    notify("This browser is out of room for projects.");
    return false;
  }
  cache = { raw, registry: next };
  changed();
  return true;
}

export function touchProject(slug: string, path: string) {
  const registry = readRegistry();
  if (registry.last[slug] === path && Date.now() - (registry.opened[slug] ?? 0) < 60_000) return;
  save((current) => ({
    ...current,
    opened: { ...current.opened, [slug]: Date.now() },
    last: path ? { ...current.last, [slug]: path } : current.last,
  }));
}

function register(project: LocalProject, ws: Workspace, first: string) {
  if (!writeProject(project.slug, ws)) return false;
  return save((registry) => ({
    ...registry,
    local: [...registry.local, project],
    opened: { ...registry.opened, [project.slug]: Date.now() },
    last: { ...registry.last, [project.slug]: first },
  }));
}

const blank = (): Workspace => ({ version: 1, pages: [], folders: [], trash: [], removed: [] });

export function createProject(name: string, description: string, taken: string[]): { slug: string; path: string } | null {
  const title = name.trim() || "Untitled project";
  const slug = projectSlug([...taken, ...readRegistry().local.map((project) => project.slug)], title);
  const now = Date.now();
  const made = createPage(blank(), "", title, makeId(), now, `# ${title}\n\n`);
  const project = { slug, name: title, description: description.trim(), createdAt: now };
  return register(project, made.ws, made.page.path) ? { slug, path: made.page.path } : null;
}

export async function openFolder(files: File[], taken: string[]): Promise<{ slug: string; path: string } | null> {
  const read: FolderFile[] = await Promise.all(
    files
      .filter((file) => /\.(md|markdown)$/i.test(file.name))
      .map(async (file) => ({ path: file.webkitRelativePath || file.name, content: await file.text() })),
  );
  const { name, pages } = folderPages(read);
  if (pages.length === 0) {
    notify("That folder has no Markdown files. Choose a folder with .md files.");
    return null;
  }
  const title = humanize(name || "Imported folder");
  const slug = projectSlug([...taken, ...readRegistry().local.map((project) => project.slug)], name || title);
  const now = Date.now();
  const ws: Workspace = {
    ...blank(),
    pages: pages.map((page) => ({ id: makeId(), path: page.path, content: page.content, createdAt: now, updatedAt: now })),
  };
  const project = { slug, name: title, description: `Opened from the ${name || "chosen"} folder`, createdAt: now };
  const first = preferredPage(pages.map((page) => page.path));
  if (!register(project, ws, first)) return null;
  notify(`Opened ${pages.length} ${pages.length === 1 ? "page" : "pages"} from ${name || "the folder"}`);
  return { slug, path: first };
}

function preferredPage(paths: string[]) {
  return paths.find((path) => /^(readme|index)\.md$/i.test(path)) ?? paths.find((path) => !path.includes("/")) ?? paths[0];
}

export function renameProject(slug: string, name: string, description: string) {
  save((registry) => ({
    ...registry,
    local: registry.local.map((project) =>
      project.slug === slug ? { ...project, name: name.trim() || project.name, description: description.trim() } : project,
    ),
  }));
}

export function deleteProject(slug: string) {
  forgetProject(slug);
  save((registry) => {
    const opened = { ...registry.opened };
    const last = { ...registry.last };
    delete opened[slug];
    delete last[slug];
    return { ...registry, local: registry.local.filter((project) => project.slug !== slug), opened, last };
  });
}
