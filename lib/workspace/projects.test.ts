import assert from "node:assert/strict";
import { test } from "node:test";
import { hrefFor } from "../markdown/links";
import { reconcile, seed, trashPage } from "./model";
import { hrefOf } from "./paths";
import { folderPages, projectSlug, projectStats, repoIdPrefix, sortProjects, type ProjectEntry } from "./projects";

test("project slugs stay unique and avoid reserved and old top-level paths", () => {
  assert.equal(projectSlug(["guide", "specs"], "Product Docs"), "product-docs");
  assert.equal(projectSlug(["guide", "product-docs"], "Product docs"), "product-docs-2");
  assert.equal(projectSlug(["guide"], "Docs"), "docs-2");
  assert.equal(projectSlug(["guide"], "Guide"), "guide-2");
});

test("page links carry the project and encode each segment", () => {
  assert.equal(hrefOf("guide"), "/guide");
  assert.equal(hrefOf("guide", "docs/writing.md"), "/guide/docs/writing");
  assert.equal(hrefOf("notes", "Meeting notes/Q3 plan.md"), "/notes/Meeting%20notes/Q3%20plan");
  assert.equal(hrefFor("notes", "a/b.md", "Next steps"), "/notes/a/b#next-steps");
});

test("repo page ids keep the old prefix for the first project and scope the rest", () => {
  const docs = [{ path: "PLAN.md", content: "# Plan\n" }];
  assert.equal(seed(docs, undefined, repoIdPrefix("guide")).pages[0].id, "repo:PLAN.md");
  const scoped = seed(docs, undefined, repoIdPrefix("specs"));
  assert.equal(scoped.pages[0].id, "repo:specs:PLAN.md");
  const added = reconcile(scoped, [...docs, { path: "source/prd.md", content: "# PRD\n" }], repoIdPrefix("specs"));
  assert.equal(added.pages[1].id, "repo:specs:source/prd.md");
});

test("an opened folder keeps its structure without the folder name, skipping hidden and non-Markdown files", () => {
  const { name, pages } = folderPages([
    { path: "Notes/README.md", content: "# Notes\r\n" },
    { path: "Notes/specs/Plan.markdown", content: "# Plan" },
    { path: "Notes/specs/diagram.png", content: "" },
    { path: "Notes/.obsidian/workspace.md", content: "" },
    { path: "Notes/node_modules/pkg/readme.md", content: "" },
    { path: "Notes/specs/plan.md", content: "# lower" },
  ]);
  assert.equal(name, "Notes");
  assert.deepEqual(
    pages.map((page) => page.path),
    ["README.md", "specs/Plan.md", "specs/plan-2.md"],
  );
  assert.equal(pages[0].content, "# Notes\n");
});

test("files picked without a shared folder keep their paths", () => {
  const { name, pages } = folderPages([
    { path: "a.md", content: "" },
    { path: "b/c.md", content: "" },
  ]);
  assert.equal(name, "");
  assert.deepEqual(
    pages.map((page) => page.path),
    ["a.md", "b/c.md"],
  );
});

test("project stats count stored pages plus repo files the browser has not seen", () => {
  const repo = [
    { path: "docs/writing.md", content: "# W\n" },
    { path: "ledger/space.md", content: "# S\n" },
  ];
  assert.deepEqual(projectStats(null, repo.map((doc) => doc.path)), { pages: 2, folders: ["docs", "ledger"], updatedAt: 0 });
  const ws = trashPage(seed(repo), "repo:ledger/space.md", 5);
  const stats = projectStats(ws, [...repo.map((doc) => doc.path), "docs/new.md"]);
  assert.equal(stats.pages, 2);
  assert.deepEqual(stats.folders, ["docs", "ledger"]);
});

test("projects sort by most recently opened, then keep their listed order", () => {
  const entry = (slug: string): ProjectEntry => ({ slug, name: slug, description: "", kind: "local" });
  const sorted = sortProjects([entry("a"), entry("b"), entry("c"), entry("d")], { c: 20, b: 10 });
  assert.deepEqual(
    sorted.map((project) => project.slug),
    ["c", "b", "a", "d"],
  );
});
