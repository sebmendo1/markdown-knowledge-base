import assert from "node:assert/strict";
import { test } from "node:test";
import { seed, type Workspace } from "../workspace/model";
import { mergeDisk, noteSaved, pendingChanges } from "./sync";
import { versionOf } from "./version";

const page = (path: string, content: string, extra?: Partial<Workspace["pages"][number]>): Workspace["pages"][number] => ({
  id: `repo:${path}`,
  path,
  content,
  origin: path,
  base: content,
  createdAt: 0,
  updatedAt: 0,
  ...extra,
});

test("pending changes follow origin and base", () => {
  const ws: Workspace = {
    version: 1,
    pages: [
      page("a.md", "same"),
      page("b.md", "edited", { base: "old" }),
      page("c.md", "moved", { path: "d.md" }),
      { id: "new", path: "e.md", content: "fresh\n", createdAt: 1, updatedAt: 1 },
    ],
    folders: ["notes"],
    trash: [{ ...page("gone.md", "x"), deletedAt: 1 }],
    removed: [],
  };
  const changes = pendingChanges(ws, new Set());
  assert.deepEqual(
    changes.map((change) => change.op),
    ["mkdir", "write", "move", "create", "trash"],
  );
  assert.equal(changes.find((change) => change.op === "write")?.version, versionOf("old"));
  assert.equal(pendingChanges(noteSaved(ws, [{ id: "new", op: "create", path: "e.md", content: "fresh\n" }]), new Set(["notes"])).some((change) => change.op === "create" && change.path === "e.md"), false);
});

test("a disk edit updates an untouched page and keeps local typing", () => {
  const ws = seed([{ path: "a.md", content: "one\n" }, { path: "b.md", content: "two\n" }], undefined, "repo:");
  const typed = { ...ws, pages: ws.pages.map((item) => (item.path === "b.md" ? { ...item, content: "two local\n" } : item)) };
  const listing = [
    { path: "a.md", version: versionOf("one changed\n") },
    { path: "b.md", version: versionOf("two disk\n") },
    { path: "c.md", version: versionOf("# C\n") },
  ];
  const merged = mergeDisk(
    typed,
    listing,
    [
      { path: "a.md", content: "one changed\n" },
      { path: "b.md", content: "two disk\n" },
      { path: "c.md", content: "# C\n" },
    ],
    [],
    "repo:",
  );
  assert.equal(merged.ws.pages.find((item) => item.origin === "a.md")?.content, "one changed\n");
  assert.equal(merged.ws.pages.find((item) => item.origin === "b.md")?.content, "two local\n");
  assert.equal(merged.conflicts[0]?.id, merged.ws.pages.find((item) => item.origin === "b.md")?.id);
  assert.equal(merged.ws.pages.some((item) => item.path === "c.md"), true);
});

test("a deleted disk page leaves the local copy when it has unsaved edits", () => {
  const ws = seed([{ path: "a.md", content: "one\n" }], undefined, "repo:");
  const dirty = { ...ws, pages: ws.pages.map((item) => ({ ...item, content: "dirty\n" })) };
  const removed = mergeDisk(ws, [], [], [], "repo:");
  assert.equal(removed.ws.pages.length, 0);
  assert.equal(removed.ws.trash[0]?.path, "a.md");
  assert.equal(removed.ws.removed[0], "a.md");
  const kept = mergeDisk(dirty, [], [], [], "repo:");
  assert.equal(kept.ws.pages.length, 1);
});
