import fs from "node:fs";
import path from "node:path";
import { splitFrontmatter } from "../markdown/frontmatter";
import { quickTitle } from "../markdown/scan";
import { humanize, nameOf, slugify, uniquePath } from "../workspace/paths";
import { DISK_BLOCKED } from "../workspace/projects";
import { relinker } from "../workspace/relink";
import type { AppliedChange, Change } from "./sync";
import { versionOf } from "./version";

const MAX_BYTES = 200 * 1024;
const META = "project.md";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type DiskFile = { path: string; content: string; version: string };
export type DiskProject = { slug: string; name: string; description: string; paths: string[] };
export type SearchHit = { path: string; title: string; snippet: string };
export type Edit = { find: string; replace: string };

export type ChangeReport = {
  applied: AppliedChange[];
  conflicts: { id: string; path: string; content: string; version: string; message: string }[];
  errors: { id: string; message: string; code: string }[];
};

export class StoreError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: { path?: string; content?: string; version?: string },
  ) {
    super(message);
    this.name = "StoreError";
  }
}

export type Store = ReturnType<typeof openStore>;

export function openStore(rootDir: string) {
  const root = path.resolve(rootDir);

  function projectDir(slug: string, create = false): string {
    if (!SLUG.test(slug)) {
      throw new StoreError("invalid_project", "Use the project slug from list_projects, like test-notes.");
    }
    const dir = path.resolve(root, slug);
    if (!inside(root, dir)) throw new StoreError("invalid_project", "That project path is outside the knowledge base.");
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      if (!create) throw new StoreError("not_found", `No project named ${slug}. Call list_projects or create_project.`);
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  function userRel(rel: string, kind: "file" | "folder"): string {
    const normalized = rel.replace(/\\/g, "/").replace(/^\/+/, "");
    const parts = normalized.split("/");
    if (!normalized || parts.some((part) => part === "" || part === "." || part === "..")) {
      throw new StoreError("invalid_path", "Paths stay inside the project. Use a relative path like notes/idea.md.");
    }
    if (parts.some((part) => part.startsWith("."))) {
      throw new StoreError("invalid_path", "Hidden files and folders are skipped.");
    }
    if (kind === "file" && !normalized.toLowerCase().endsWith(".md")) {
      throw new StoreError("not_markdown", "Only .md files can be saved. Use a path ending in .md.");
    }
    if (kind === "folder" && normalized.toLowerCase().endsWith(".md")) {
      throw new StoreError("invalid_path", "A folder path has no .md suffix, for example notes/ideas.");
    }
    return normalized;
  }

  function locate(dir: string, rel: string): string {
    const abs = path.resolve(dir, ...rel.split("/"));
    if (!inside(dir, abs)) throw new StoreError("invalid_path", "That path leaves the project.");
    const parent = path.dirname(abs);
    if (fs.existsSync(parent)) {
      const realParent = fs.realpathSync(parent);
      const real = path.resolve(realParent, path.basename(abs));
      if (!inside(fs.realpathSync(dir), real)) throw new StoreError("invalid_path", "That path leaves the project.");
      if (fs.existsSync(abs) && fs.lstatSync(abs).isSymbolicLink()) {
        throw new StoreError("invalid_path", "Symlinks are not used.");
      }
    }
    return abs;
  }

  function assertSize(content: string) {
    if (Buffer.byteLength(content, "utf8") > MAX_BYTES) {
      throw new StoreError("too_large", "Pages are limited to 200 KB.");
    }
  }

  function readAt(dir: string, rel: string): DiskFile {
    const safe = userRel(rel, "file");
    const abs = locate(dir, safe);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      throw new StoreError("not_found", `No page at ${safe}. Call list_files to see this project.`);
    }
    const content = fs.readFileSync(abs, "utf8");
    return { path: safe, content, version: versionOf(content) };
  }

  function conflict(file: DiskFile) {
    return new StoreError("conflict", "Page changed since you read it. Call read_file again.", {
      path: file.path,
      content: file.content,
      version: file.version,
    });
  }

  function writeAt(dir: string, rel: string, content: string) {
    assertSize(content);
    const safe = userRel(rel, "file");
    const abs = locate(dir, safe);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
    return { path: safe, content, version: versionOf(content) };
  }

  function rename(dir: string, from: string, to: string) {
    const src = locate(dir, from);
    const dest = locate(dir, to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
  }

  function listFiles(slug: string, options?: { includeMeta?: boolean }): { files: DiskFile[]; folders: string[] } {
    const dir = projectDir(slug);
    const files: DiskFile[] = [];
    const folders: string[] = [];
    const walk = (abs: string, rel: string) => {
      for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
        if (entry.name.startsWith(".") || entry.isSymbolicLink()) continue;
        const childRel = rel ? `${rel}/${entry.name}` : entry.name;
        const childAbs = path.join(abs, entry.name);
        if (entry.isDirectory()) {
          folders.push(childRel);
          walk(childAbs, childRel);
          continue;
        }
        if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) continue;
        if (!options?.includeMeta && childRel === META) continue;
        const content = fs.readFileSync(childAbs, "utf8");
        files.push({ path: childRel, content, version: versionOf(content) });
      }
    };
    walk(dir, "");
    files.sort((a, b) => a.path.localeCompare(b.path));
    folders.sort((a, b) => a.localeCompare(b));
    return { files, folders };
  }

  function readMeta(slug: string): { name: string; description: string } {
    const file = path.join(root, slug, META);
    if (!fs.existsSync(file)) return { name: humanize(slug), description: "" };
    const parsed = splitFrontmatter(fs.readFileSync(file, "utf8"));
    const name = typeof parsed.data?.name === "string" && parsed.data.name.trim() ? parsed.data.name.trim() : humanize(slug);
    const description = typeof parsed.data?.description === "string" ? parsed.data.description.trim() : "";
    return { name, description };
  }

  return {
    root,

    listProjects(): DiskProject[] {
      if (!fs.existsSync(root)) return [];
      const projects: DiskProject[] = [];
      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith(".") || entry.isSymbolicLink()) continue;
        if (!SLUG.test(entry.name)) continue;
        const meta = readMeta(entry.name);
        const files = listFiles(entry.name).files;
        projects.push({ slug: entry.name, name: meta.name, description: meta.description, paths: files.map((file) => file.path) });
      }
      return projects.sort((a, b) => a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug));
    },

    createProject(name: string, description = ""): DiskProject {
      const display = name.trim() || "Untitled";
      const existing = fs.existsSync(root) ? fs.readdirSync(root) : [];
      const slug = uniquePath([...existing, ...DISK_BLOCKED], slugify(display));
      const dir = projectDir(slug, true);
      const about = description.trim();
      const content = `---\nname: ${JSON.stringify(display)}\ndescription: ${JSON.stringify(about)}\n---\n\n# ${display}\n`;
      fs.writeFileSync(path.join(dir, META), content, "utf8");
      return { slug, name: display, description: about, paths: [] };
    },

    listFiles,

    readFile(slug: string, rel: string): DiskFile {
      return readAt(projectDir(slug), rel);
    },

    createFile(slug: string, rel: string, content: string): DiskFile {
      const dir = projectDir(slug);
      const safe = userRel(rel, "file");
      const abs = locate(dir, safe);
      if (fs.existsSync(abs)) {
        const current = readAt(dir, safe);
        throw new StoreError("exists", `A page already exists at ${safe}. Call read_file, then update_file.`, {
          path: current.path,
          content: current.content,
          version: current.version,
        });
      }
      return writeAt(dir, safe, content);
    },

    writeFile(slug: string, rel: string, content: string, version: string): DiskFile {
      const dir = projectDir(slug);
      const current = readAt(dir, rel);
      if (current.version !== version) throw conflict(current);
      return writeAt(dir, current.path, content);
    },

    updateFile(slug: string, rel: string, version: string, next: { content?: string; edits?: Edit[] }): DiskFile {
      const dir = projectDir(slug);
      const current = readAt(dir, rel);
      if (current.version !== version) throw conflict(current);
      if (next.content !== undefined && next.edits !== undefined) {
        throw new StoreError("invalid_update", "Send content or edits, not both.");
      }
      const content = next.edits ? applyEdits(current.content, next.edits) : next.content;
      if (content === undefined) throw new StoreError("invalid_update", "Send the full content or a list of edits.");
      return writeAt(dir, current.path, content);
    },

    createFolder(slug: string, rel: string): { path: string } {
      const dir = projectDir(slug);
      const safe = userRel(rel, "folder");
      const abs = locate(dir, safe);
      if (fs.existsSync(abs) && !fs.statSync(abs).isDirectory()) {
        throw new StoreError("invalid_path", `${safe} is a file. Folder paths have no .md suffix.`);
      }
      fs.mkdirSync(abs, { recursive: true });
      return { path: safe };
    },

    moveFile(slug: string, from: string, to: string, version: string): DiskFile {
      const dir = projectDir(slug);
      const source = readAt(dir, from);
      if (source.version !== version) throw conflict(source);
      const dest = userRel(to, "file");
      if (source.path === dest) return source;
      if (fs.existsSync(locate(dir, dest))) {
        throw new StoreError("exists", `A page already exists at ${dest}. Pick a path that is free.`);
      }
      const listing = listFiles(slug, { includeMeta: true });
      const moves = new Map([[source.path, dest]]);
      const fix = relinker(listing.files.map((file) => file.path), moves);
      for (const file of listing.files) {
        if (file.path === source.path) continue;
        const updated = fix(file.content);
        if (updated !== file.content) writeAt(dir, file.path, updated);
      }
      const content = fix(source.content);
      rename(dir, source.path, dest);
      if (content !== source.content) return writeUnchecked(dir, dest, content);
      return { path: dest, content, version: versionOf(content) };
    },

    trashFile(slug: string, rel: string, version: string): { path: string } {
      const dir = projectDir(slug);
      const current = readAt(dir, rel);
      if (current.version !== version) throw conflict(current);
      const dest = trashName(dir, current.path);
      rename(dir, current.path, dest);
      return { path: dest };
    },

    search(slug: string, query: string, limit = 20): SearchHit[] {
      const needle = query.trim().toLowerCase();
      if (!needle) return [];
      const hits: SearchHit[] = [];
      for (const file of listFiles(slug, { includeMeta: true }).files) {
        const title = quickTitle(file.content, nameOf(file.path).replace(/-/g, " "));
        const at = file.content.toLowerCase().indexOf(needle);
        const inPath = file.path.toLowerCase().includes(needle) || title.toLowerCase().includes(needle);
        if (at < 0 && !inPath) continue;
        const start = at < 0 ? 0 : Math.max(0, at - 40);
        const snippet = file.content.slice(start, start + needle.length + 80).replace(/\s+/g, " ").trim();
        hits.push({ path: file.path, title, snippet });
        if (hits.length >= limit) break;
      }
      return hits;
    },

    applyChanges(slug: string, changes: Change[]): ChangeReport {
      const dir = projectDir(slug);
      const applied: AppliedChange[] = [];
      const conflicts: ChangeReport["conflicts"] = [];
      const errors: ChangeReport["errors"] = [];
      const moves: Extract<Change, { op: "move" }>[] = [];

      const fail = (id: string, error: unknown) => {
        if (error instanceof StoreError && (error.code === "conflict" || error.code === "exists")) {
          conflicts.push({
            id,
            path: error.details?.path ?? "",
            content: error.details?.content ?? "",
            version: error.details?.version ?? "",
            message: error.message,
          });
          return;
        }
        if (error instanceof StoreError) {
          errors.push({ id, message: error.message, code: error.code });
          return;
        }
        throw error;
      };

      for (const change of changes) {
        if (change.op === "move") {
          moves.push(change);
          continue;
        }
        try {
          if (change.op === "mkdir") {
            const safe = userRel(change.path, "folder");
            fs.mkdirSync(locate(dir, safe), { recursive: true });
            applied.push({ op: "mkdir", path: safe });
          } else if (change.op === "create") {
            const file = writeNew(dir, change.path, change.content);
            applied.push({ id: change.id, op: "create", path: file.path, content: file.content });
          } else if (change.op === "write") {
            const file = thisWrite(dir, change.path, change.content, change.version);
            applied.push({ id: change.id, op: "write", path: file.path, content: file.content });
          } else if (change.op === "trash") {
            const current = readAt(dir, change.path);
            if (current.version !== change.version) throw conflict(current);
            rename(dir, current.path, trashName(dir, current.path));
            applied.push({ id: change.id, op: "trash", path: current.path });
          }
        } catch (error) {
          fail("id" in change ? change.id : "", error);
        }
      }

      applyMoves(dir, moves, applied, conflicts, errors);
      return { applied, conflicts, errors };
    },
  };

  function writeNew(dir: string, rel: string, content: string): DiskFile {
    const safe = userRel(rel, "file");
    const abs = locate(dir, safe);
    if (fs.existsSync(abs)) {
      const current = readAt(dir, safe);
      throw new StoreError("exists", `A page already exists at ${safe}. Call read_file, then update_file.`, {
        path: current.path,
        content: current.content,
        version: current.version,
      });
    }
    return writeAt(dir, safe, content);
  }

  function thisWrite(dir: string, rel: string, content: string, version: string): DiskFile {
    const current = readAt(dir, rel);
    if (current.version !== version) throw conflict(current);
    return writeAt(dir, current.path, content);
  }

  function writeUnchecked(dir: string, rel: string, content: string): DiskFile {
    return writeAt(dir, rel, content);
  }

  function applyMoves(
    dir: string,
    moves: Extract<Change, { op: "move" }>[],
    applied: AppliedChange[],
    conflicts: ChangeReport["conflicts"],
    errors: ChangeReport["errors"],
  ) {
    const ready: Extract<Change, { op: "move" }>[] = [];
    const sources = new Set(moves.map((move) => userRelSafe(move.from)));
    for (const move of moves) {
      try {
        const current = readAt(dir, move.from);
        if (current.version !== move.version) throw conflict(current);
        assertSize(move.content);
        const dest = userRel(move.to, "file");
        const occupied = fs.existsSync(locate(dir, dest));
        if (current.path !== dest && occupied && !sources.has(dest)) {
          const existing = readAt(dir, dest);
          throw new StoreError("exists", `A page already exists at ${dest}. Pick a path that is free.`, {
            path: existing.path,
            content: existing.content,
            version: existing.version,
          });
        }
        ready.push({ ...move, from: current.path, to: dest });
      } catch (error) {
        if (error instanceof StoreError && (error.code === "conflict" || error.code === "exists")) {
          conflicts.push({
            id: move.id,
            path: error.details?.path ?? move.from,
            content: error.details?.content ?? "",
            version: error.details?.version ?? "",
            message: error.message,
          });
        } else if (error instanceof StoreError) {
          errors.push({ id: move.id, message: error.message, code: error.code });
        } else {
          throw error;
        }
      }
    }
    if (ready.length === 0) return;
    const temps = new Map<string, string>();
    ready.forEach((move, index) => {
      const temp = `.moving/${index}.md`;
      rename(dir, move.from, temp);
      temps.set(move.id, temp);
    });
    for (const move of ready) {
      const temp = temps.get(move.id);
      if (!temp) continue;
      rename(dir, temp, move.to);
      writeUnchecked(dir, move.to, move.content);
      applied.push({ id: move.id, op: "move", path: move.to, content: move.content });
    }
    const moving = path.join(dir, ".moving");
    if (fs.existsSync(moving) && fs.readdirSync(moving).length === 0) fs.rmdirSync(moving);
  }

  function userRelSafe(rel: string): string {
    try {
      return userRel(rel, "file");
    } catch {
      return rel;
    }
  }
}

function applyEdits(content: string, edits: Edit[]): string {
  if (edits.length === 0) throw new StoreError("invalid_update", "Send at least one edit, or send the full content.");
  let next = content;
  for (const edit of edits) {
    if (!edit.find) throw new StoreError("invalid_update", "Each edit needs the exact text to find.");
    const at = next.indexOf(edit.find);
    if (at < 0) {
      const preview = edit.find.length > 80 ? `${edit.find.slice(0, 80)}…` : edit.find;
      throw new StoreError("find_missing", `Could not find ${JSON.stringify(preview)}. Call read_file and try again.`);
    }
    next = next.slice(0, at) + edit.replace + next.slice(at + edit.find.length);
  }
  return next;
}

function trashName(dir: string, rel: string): string {
  const base = `.trash/${rel.replace(/\.md$/i, "")}`;
  let candidate = `${base}.md`;
  for (let count = 2; fs.existsSync(path.resolve(dir, ...candidate.split("/"))); count += 1) {
    candidate = `${base}-${count}.md`;
  }
  return candidate;
}

function inside(root: string, target: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

let cached: { dir: string; store: Store } | null = null;

export function defaultStore(): Store {
  const dir = process.env.KB_DIR
    ? path.resolve(/*turbopackIgnore: true*/ process.env.KB_DIR)
    : path.join(process.cwd(), "kb");
  if (!cached || cached.dir !== dir) cached = { dir, store: openStore(dir) };
  return cached.store;
}
