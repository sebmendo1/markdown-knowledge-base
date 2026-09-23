import { allFolders, type Workspace } from "../workspace/model";
import { versionOf } from "./version";

export type Change =
  | { op: "mkdir"; path: string }
  | { op: "create"; id: string; path: string; content: string }
  | { op: "write"; id: string; path: string; content: string; version: string }
  | { op: "move"; id: string; from: string; to: string; content: string; version: string }
  | { op: "trash"; id: string; path: string; version: string };

export type AppliedChange = { id?: string; op: string; path: string; content?: string };

export type DiskConflict = { id: string; path: string; content: string; version?: string; message?: string };

export type DiskListing = { path: string; version: string };
export type DiskBody = { path: string; content: string };

const hasId = (change: Change): change is Exclude<Change, { op: "mkdir" }> => change.op !== "mkdir";

export function pendingChanges(ws: Workspace, syncedFolders: ReadonlySet<string>): Change[] {
  const changes: Change[] = [];
  for (const folder of allFolders(ws)) {
    if (!syncedFolders.has(folder)) changes.push({ op: "mkdir", path: folder });
  }
  for (const page of ws.pages) {
    if (!page.origin || ws.removed.includes(page.origin)) {
      changes.push({ op: "create", id: page.id, path: page.path, content: page.content });
      continue;
    }
    if (page.path !== page.origin) {
      changes.push({
        op: "move",
        id: page.id,
        from: page.origin,
        to: page.path,
        content: page.content,
        version: versionOf(page.base ?? ""),
      });
      continue;
    }
    if ((page.base ?? "") !== page.content) {
      changes.push({
        op: "write",
        id: page.id,
        path: page.path,
        content: page.content,
        version: versionOf(page.base ?? ""),
      });
    }
  }
  for (const item of ws.trash) {
    if (!item.origin || ws.removed.includes(item.origin)) continue;
    changes.push({ op: "trash", id: item.id, path: item.origin, version: versionOf(item.base ?? "") });
  }
  return changes;
}

export function noteSaved(ws: Workspace, applied: AppliedChange[]): Workspace {
  let removed = ws.removed;
  let changed = false;
  const pages = ws.pages.map((page) => {
    const change = applied.find((item) => item.id === page.id && item.op !== "trash" && item.op !== "mkdir");
    if (!change) return page;
    changed = true;
    if (change.op === "create") {
      removed = removed.filter((path) => path !== change.path && path !== page.origin);
    }
    return { ...page, origin: change.path, base: change.content ?? page.content };
  });
  for (const change of applied) {
    if (change.op !== "trash" || !change.path || removed.includes(change.path)) continue;
    removed = [...removed, change.path];
    changed = true;
  }
  return changed ? { ...ws, pages, removed } : ws;
}

export function mergeDisk(
  ws: Workspace,
  listing: DiskListing[],
  changed: DiskBody[],
  folders: string[],
  prefix: string,
): { ws: Workspace; conflicts: DiskConflict[] } {
  const listed = new Map(listing.map((item) => [item.path, item.version]));
  const updates = new Map(changed.map((item) => [item.path, item.content]));
  const conflicts: DiskConflict[] = [];
  const dropped: Workspace["pages"] = [];
  let touched = false;
  const now = Date.now();

  const pages = ws.pages.flatMap((page) => {
    if (!page.origin || ws.removed.includes(page.origin)) return [page];
    const version = listed.get(page.origin);
    if (!version) {
      if (page.path === page.origin && page.content === page.base) {
        touched = true;
        dropped.push(page);
        return [];
      }
      return [page];
    }
    if (page.path !== page.origin) {
      if (version !== versionOf(page.base ?? "")) {
        const content = updates.get(page.origin);
        if (content !== undefined) conflicts.push({ id: page.id, path: page.origin, content });
      }
      return [page];
    }
    if (version === versionOf(page.base ?? "")) return [page];
    const content = updates.get(page.origin);
    if (content === undefined) return [page];
    if (page.content === page.base) {
      touched = true;
      return [{ ...page, content, base: content, updatedAt: now }];
    }
    conflicts.push({ id: page.id, path: page.path, content });
    return [page];
  });

  const known = new Set(
    [...pages, ...ws.trash, ...dropped].map((page) => page.origin).filter((origin): origin is string => Boolean(origin)),
  );
  const taken = new Set(pages.map((page) => page.path));
  for (const item of listing) {
    if (known.has(item.path) || taken.has(item.path) || ws.removed.includes(item.path)) continue;
    const content = updates.get(item.path);
    if (content === undefined) continue;
    touched = true;
    pages.push({
      id: `${prefix}${item.path}`,
      path: item.path,
      content,
      origin: item.path,
      base: content,
      createdAt: now,
      updatedAt: now,
    });
    taken.add(item.path);
    known.add(item.path);
  }

  const folderSet = new Set(ws.folders);
  let foldersChanged = false;
  for (const folder of folders) {
    if (folderSet.has(folder)) continue;
    folderSet.add(folder);
    foldersChanged = true;
  }
  if (!touched && !foldersChanged) return { ws, conflicts };

  const removed = [...ws.removed];
  for (const page of dropped) {
    if (page.origin && !removed.includes(page.origin)) removed.push(page.origin);
  }
  return {
    ws: {
      ...ws,
      pages,
      folders: [...folderSet],
      trash: [...dropped.map((page) => ({ ...page, deletedAt: now })), ...ws.trash],
      removed,
    },
    conflicts,
  };
}

export function diskListSignature(
  projects: { slug: string; name: string; description: string; paths: string[] }[],
): string {
  return projects
    .map((project) => `${project.slug}\t${project.name}\t${project.description}\t${[...project.paths].sort().join("\n")}`)
    .sort()
    .join("\n---\n");
}

export function retryable(changes: Change[], conflictIds: ReadonlySet<string>): boolean {
  return changes.some((change) => !hasId(change) || !conflictIds.has(change.id));
}
