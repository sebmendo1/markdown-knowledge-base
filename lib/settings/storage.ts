import { PREFERENCES_KEY } from "./preferences";

// What this browser holds, read from its localStorage entries. Everything the app stores starts with "markdown-kb".
const PREFIX = "markdown-kb";
const THEME_KEY = "markdown-kb:theme";
const WORKSPACE_PREFIX = "markdown-kb:workspace";
const HISTORY_PREFIX = "markdown-kb:history:";
const REGISTRY_KEY = "markdown-kb:projects";

export type StorageSummary = {
  projects: number;
  pagesChangedHere: number;
  versions: number;
  bytes: number;
};

type StoredPage = { origin?: string; base?: string; content?: string };

export function summarizeStorage(entries: [string, string][]): StorageSummary {
  const ours = entries.filter(([key]) => key.startsWith(PREFIX));
  const projects = new Set<string>();
  let pagesChangedHere = 0;
  let versions = 0;
  let bytes = 0;
  for (const [key, value] of ours) {
    // localStorage keeps UTF-16, two bytes per code unit.
    bytes += (key.length + value.length) * 2;
    if (key === WORKSPACE_PREFIX || key.startsWith(`${WORKSPACE_PREFIX}:`)) {
      projects.add(key === WORKSPACE_PREFIX ? "guide" : key.slice(WORKSPACE_PREFIX.length + 1));
      try {
        const ws = JSON.parse(value) as { pages?: StoredPage[] };
        for (const page of ws.pages ?? []) {
          if (page.origin === undefined || (page.base !== undefined && page.content !== page.base)) pagesChangedHere += 1;
        }
      } catch {
        /* A corrupt workspace still counts toward space used. */
      }
    } else if (key.startsWith(HISTORY_PREFIX)) {
      try {
        const list = JSON.parse(value) as unknown;
        if (Array.isArray(list)) versions += list.length;
      } catch {
        /* Skip. */
      }
    } else if (key === REGISTRY_KEY) {
      try {
        const registry = JSON.parse(value) as { local?: { slug: string }[] };
        for (const project of registry.local ?? []) projects.add(project.slug);
      } catch {
        /* Skip. */
      }
    }
  }
  return { projects: projects.size, pagesChangedHere, versions, bytes };
}

// Everything a reset removes: pages, versions, the project list, and view state. The theme and preferences stay.
export function resetKeys(keys: string[]): string[] {
  const kept = new Set([THEME_KEY, PREFERENCES_KEY]);
  return keys.filter((key) => key.startsWith(PREFIX) && !kept.has(key));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
