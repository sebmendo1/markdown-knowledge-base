import assert from "node:assert/strict";
import { test } from "node:test";
import { titleOf } from "../markdown/outline";
import { allFolders, createFolder, createPage, purgePage, reconcile, restorePage, seed, trashFolder, trashPage, updateContent } from "./model";
import { duplicatePage, moveFolder, movePage, renameFolder, renamePage } from "./moves";
import { slugify } from "./paths";
import { setTitle } from "./title";
import { backlinks, buildTree, importFiles, rendersAsRepo, toDoc } from "./tree";
import { crc32, zip } from "./zip";

const repo = [
  { path: "docs/writing.md", content: "# Writing\n\nSee [[layout]] and [[docs/shortcuts#Keys|keys]].\n" },
  { path: "docs/layout.md", content: "---\ntitle: Layout\n---\n\nBack to [[writing]].\n" },
  { path: "docs/shortcuts.md", content: "# Shortcuts\n" },
];

const content = (ws: ReturnType<typeof seed>, path: string) => ws.pages.find((page) => page.path === path)?.content;

test("slugify keeps names readable and safe", () => {
  assert.equal(slugify("Product Specs: v2!"), "product-specs-v2");
  assert.equal(slugify("Café déjà vu"), "cafe-deja-vu");
  assert.equal(slugify("   "), "untitled");
});

test("setTitle updates frontmatter, then the first heading, then adds one", () => {
  assert.equal(setTitle("---\ntitle: Old\n---\n\nBody", "New: one"), '---\ntitle: "New: one"\n---\n\nBody');
  assert.equal(setTitle("---\ntitle: Old\n---\n\n# Old\n\nBody", "New"), "---\ntitle: New\n---\n\n# New\n\nBody");
  assert.equal(setTitle("```\n# not this\n```\n# Real\n", "Next"), "```\n# not this\n```\n# Next\n");
  assert.equal(setTitle("Just text\n", "Named"), "# Named\n\nJust text\n");
});

test("seed uses drafts, and reconcile follows untouched repository files", () => {
  const ws = seed(repo, (path) => (path === "docs/layout.md" ? "edited" : null));
  const next = reconcile(ws, [
    { path: "docs/writing.md", content: "# Writing v2\n" },
    { path: "docs/layout.md", content: "changed upstream" },
    { path: "docs/shortcuts.md", content: "# Shortcuts\n" },
    { path: "docs/new.md", content: "# New\n" },
  ]);
  assert.equal(content(next, "docs/writing.md"), "# Writing v2\n");
  assert.equal(content(next, "docs/layout.md"), "edited");
  assert.equal(content(next, "docs/new.md"), "# New\n");
  assert.equal(reconcile(next, [...repo.slice(2), { path: "docs/new.md", content: "# New\n" }]).pages.length, 4);
});

test("renaming a page moves the file and rewrites links to it", () => {
  const ws = renamePage(seed(repo), "repo:docs/layout.md", "Screen layout", 1);
  assert.ok(content(ws, "docs/screen-layout.md")?.includes("title: Screen layout"));
  assert.ok(content(ws, "docs/writing.md")?.includes("[[screen-layout]]"));
  assert.ok(content(ws, "docs/writing.md")?.includes("[[docs/shortcuts#Keys|keys]]"));
});

test("moving pages and folders keeps every link resolving", () => {
  let ws = createFolder(seed(repo), "", "Guides").ws;
  ws = movePage(ws, "repo:docs/shortcuts.md", "guides", 2);
  assert.ok(content(ws, "docs/writing.md")?.includes("[[guides/shortcuts#Keys|keys]]"));
  assert.ok(allFolders(ws).includes("docs"));

  ws = renameFolder(ws, "docs", "Handbook", 3);
  assert.ok(content(ws, "handbook/layout.md")?.includes("[[writing]]"));
  ws = moveFolder(ws, "guides", "handbook", 4);
  assert.ok(content(ws, "handbook/guides/shortcuts.md"));
  assert.equal(moveFolder(ws, "handbook", "handbook/guides", 5), ws);
});

test("trash, restore, and purge", () => {
  let ws = trashPage(seed(repo), "repo:docs/layout.md", 1);
  assert.equal(ws.trash.length, 1);
  ws = restorePage(ws, "repo:docs/layout.md");
  assert.ok(content(ws, "docs/layout.md"));
  ws = trashFolder(ws, "docs", 2);
  assert.equal(ws.pages.length, 0);
  ws = purgePage(ws);
  assert.equal(reconcile(ws, repo).pages.length, 0);
});

test("create, duplicate, import, tree, and backlinks", () => {
  let ws = createPage(seed(repo), "docs", "Writing", "p1", 1).ws;
  assert.ok(content(ws, "docs/writing-2.md"));
  ws = duplicatePage(ws, "repo:docs/shortcuts.md", "p2", 2).ws;
  assert.equal(titleOf(content(ws, "docs/shortcuts-copy.md") ?? "", ""), "Shortcuts copy");
  ws = importFiles(ws, [{ name: "Notes.md", content: "a\r\nb" }], "", () => "p3", 3).ws;
  assert.equal(content(ws, "notes.md"), "a\nb");

  const docs = ws.pages.map(toDoc);
  const tree = buildTree(ws, docs);
  assert.equal(tree[0].kind, "folder");
  assert.deepEqual(backlinks(docs, "docs/layout.md").map((doc) => doc.path), ["docs/writing.md"]);
});

test("a page renders as the repository copy until it or what it shows changes", () => {
  const repoDocs = seed(repo).pages.map(toDoc);
  assert.ok(rendersAsRepo("docs/writing.md", repoDocs, repoDocs));

  const edited = updateContent(seed(repo), "repo:docs/layout.md", "---\ntitle: Page layout\n---\n", 1);
  assert.equal(rendersAsRepo("docs/writing.md", edited.pages.map(toDoc), repoDocs), false);
  assert.ok(rendersAsRepo("docs/shortcuts.md", edited.pages.map(toDoc), repoDocs));

  const bodyOnly = updateContent(seed(repo), "repo:docs/layout.md", "---\ntitle: Layout\n---\n\nNew body.\n", 1);
  assert.ok(rendersAsRepo("docs/writing.md", bodyOnly.pages.map(toDoc), repoDocs));

  const embedRepo = [...repo, { path: "docs/embed.md", content: "![[layout]]\n" }];
  const embedDocs = seed(embedRepo).pages.map(toDoc);
  const embedEdited = updateContent(seed(embedRepo), "repo:docs/layout.md", "---\ntitle: Layout\n---\n\nNew body.\n", 1);
  assert.ok(rendersAsRepo("docs/embed.md", embedDocs, embedDocs));
  assert.equal(rendersAsRepo("docs/embed.md", embedEdited.pages.map(toDoc), embedDocs), false);

  const trashed = trashPage(seed(repo), "repo:docs/shortcuts.md", 1);
  assert.equal(rendersAsRepo("docs/writing.md", trashed.pages.map(toDoc), repoDocs), false);
  const created = createPage(seed(repo), "", "Missing", "p1", 1).ws;
  assert.ok(rendersAsRepo("docs/writing.md", created.pages.map(toDoc), repoDocs));
  assert.equal(rendersAsRepo("docs/writing.md", renamePage(seed(repo), "repo:docs/writing.md", "Guide", 1).pages.map(toDoc), repoDocs), false);
});

test("zip writes a stored archive with correct checksums", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  const bytes = zip([{ path: "docs/a.md", content: "# A\n" }]);
  assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x04034b50);
  assert.equal(new DataView(bytes.buffer).getUint32(bytes.length - 22, true), 0x06054b50);
});
