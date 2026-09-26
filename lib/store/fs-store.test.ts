import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { openStore, StoreError } from "./fs-store";

let directory = "";
let store: ReturnType<typeof openStore>;

describe("disk store", () => {
before(() => {
  directory = mkdtempSync(path.join(tmpdir(), "kb-store-"));
  store = openStore(directory);
});

after(() => {
  rmSync(directory, { recursive: true, force: true });
});

test("a project is a folder with a project.md the page list skips", () => {
  const project = store.createProject("Test Notes", "Trying the disk");
  assert.equal(project.slug, "test-notes");
  assert.equal(store.listProjects()[0]?.description, "Trying the disk");
  assert.deepEqual(store.listFiles(project.slug).files.map((file) => file.path), []);
  assert.equal(store.listFiles(project.slug, { includeMeta: true }).files[0]?.path, "project.md");
});

test("pages round-trip, and a stale version is refused", () => {
  const project = "test-notes";
  const created = store.createFile(project, "notes/idea.md", "# Idea\n\nFirst.\n");
  assert.equal(store.listFiles(project).folders.includes("notes"), true);
  const updated = store.updateFile(project, created.path, created.version, { edits: [{ find: "First.", replace: "Second." }] });
  assert.match(updated.content, /Second\./);
  assert.throws(
    () => store.writeFile(project, created.path, "# Idea\n\nNope.\n", created.version),
    (error) => error instanceof StoreError && error.code === "conflict" && /read_file/.test(error.message),
  );
  assert.throws(
    () => store.createFile(project, "../secret.md", "nope"),
    (error) => error instanceof StoreError && error.code === "invalid_path",
  );
  assert.throws(
    () => store.createFile(project, "notes/picture.png", "nope"),
    (error) => error instanceof StoreError && error.code === "not_markdown",
  );
});

test("moving a page rewrites wiki links and trashing keeps the file", () => {
  const project = "test-notes";
  const target = store.createFile(project, "b.md", "# B\n");
  store.createFile(project, "a.md", "See [[b]].\n");
  const moved = store.moveFile(project, target.path, "notes/c.md", target.version);
  assert.equal(moved.path, "notes/c.md");
  assert.match(store.readFile(project, "a.md").content, /\[\[c\]\]/);
  const trashed = store.trashFile(project, moved.path, moved.version);
  assert.match(trashed.path, /^\.trash\//);
  assert.equal(store.listFiles(project).files.some((file) => file.path === "notes/c.md"), false);
  assert.equal(readFileSync(path.join(directory, project, trashed.path), "utf8"), moved.content);
});

test("search finds a page by its body", () => {
  const hits = store.search("test-notes", "second");
  assert.equal(hits[0]?.path, "notes/idea.md");
  assert.match(hits[0]?.snippet ?? "", /Second/);
});

test("search skips project.md, drops frontmatter from snippets, and ranks title hits first", () => {
  const project = "test-notes";
  store.createFile(project, "log.md", "---\ntitle: Log\n---\n\nNotes mention the harness here.\n");
  store.createFile(project, "harness.md", "---\ntitle: Harness\n---\n\n# Harness\n\nHow runs are set up.\n");
  const hits = store.search(project, "harness");
  assert.deepEqual(hits.map((hit) => hit.path), ["harness.md", "log.md"]);
  assert.equal(hits.some((hit) => /---|title:/.test(hit.snippet)), false);
  assert.match(hits[1]?.snippet ?? "", /mention the harness/);
  assert.deepEqual(store.search(project, "Test Notes"), []);
  assert.equal(store.search(project, "harness", 1).length, 1);
});

test("the page index has titles and sizes but no Markdown", () => {
  const index = store.listIndex("test-notes");
  const harness = index.files.find((file) => file.path === "harness.md");
  assert.deepEqual(Object.keys(harness ?? {}).sort(), ["bytes", "path", "title", "version"]);
  assert.equal(harness?.title, "Harness");
  assert.equal(harness?.bytes, Buffer.byteLength(store.readFile("test-notes", "harness.md").content));
  assert.equal(index.files.some((file) => file.path === "project.md"), false);
});

test("a read reports the path as it is on disk", (context) => {
  if (!existsSync(path.join(directory, "TEST-NOTES"))) {
    context.skip("the temp folder is case-sensitive");
    return;
  }
  const read = store.readFile("test-notes", "Notes/IDEA.md");
  assert.equal(read.path, "notes/idea.md");
  const updated = store.updateFile("test-notes", "NOTES/idea.md", read.version, { edits: [{ find: "Second.", replace: "Third." }] });
  assert.equal(updated.path, "notes/idea.md");
});
});
