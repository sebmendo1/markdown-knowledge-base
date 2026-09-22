import assert from "node:assert/strict";
import test from "node:test";
import { parseDelimited } from "./csv";
import { splitFrontmatter } from "./frontmatter";
import { hrefFor, resolveDoc } from "./links";
import { extractHeadings, extractSection } from "./outline";

test("frontmatter separates the map from the body", () => {
  const result = splitFrontmatter("---\ntitle: Hi\n---\n# Hi\n");
  assert.equal(result.data?.title, "Hi");
  assert.equal(result.body, "# Hi\n");
});

test("headings skip fenced code and slug duplicates", () => {
  const headings = extractHeadings("```md\n# Hidden\n```\n\n# Shown\n\n## Shown\n");
  assert.deepEqual(
    headings.map((heading) => heading.id),
    ["shown", "shown-1"],
  );
});

test("section extract stops at the next heading of the same rank", () => {
  const section = extractSection("# A\n\nalpha\n\n## Nested\n\ninside\n\n# B\n\nbeta\n", "A");
  assert.match(section, /alpha/);
  assert.match(section, /inside/);
  assert.doesNotMatch(section, /beta/);
});

test("wiki refs resolve by file name when the path is unique", () => {
  const docs = [
    { path: "docs/shortcuts.md", title: "Shortcuts" },
    { path: "docs/writing.md", title: "Writing" },
  ];
  assert.equal(resolveDoc(docs, "shortcuts")?.path, "docs/shortcuts.md");
  assert.equal(hrefFor("docs/shortcuts.md", "Keyboard"), "/docs/shortcuts#keyboard");
});

test("csv keeps quoted commas in one cell", () => {
  const rows = parseDelimited('pane,job\nFiles,"Jump, then read"\n', ",");
  assert.deepEqual(rows, [
    ["pane", "job"],
    ["Files", "Jump, then read"],
  ]);
});
