import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseDelimited } from "./csv";
import { splitFrontmatter } from "./frontmatter";
import { hrefFor, resolveDoc } from "./links";
import { extractHeadings, extractSection, titleOf } from "./outline";
import { quickTitle, scanHeadings } from "./scan";

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
  assert.equal(hrefFor("guide", "docs/shortcuts.md", "Keyboard"), "/guide/docs/shortcuts#keyboard");
});

test("quick titles match the full parser", () => {
  const samples = [
    "# Plain title\n\nBody",
    "---\ntitle: From frontmatter\n---\n# Heading\n",
    '---\ntype: doc\ntitle: "Quoted: with colon"\n---\n',
    "---\ntitle: 'It''s here'\n---\n",
    "---\ntitle: Trailing # comment\n---\n",
    "```md\n# Hidden\n```\n\n# Shown after a fence\n",
    "~~~\n# Hidden\n~~~\n\nSetext title\n============\n",
    "# The **bold** and `code` and [a link](https://x.y) idea\n",
    "# Keep [[wiki]] text\n",
    "## Only a second level\n",
    "#No space is not a heading\n",
    "# Closing hashes ##\n",
    "",
  ];
  for (const sample of samples) {
    assert.equal(quickTitle(sample, "Fallback"), titleOf(sample, "Fallback"), JSON.stringify(sample));
  }
});

test("quick titles skip math blocks, as the page renders them", () => {
  assert.equal(quickTitle("$$\n# not a heading\n$$\n\n# After math\n", "Fallback"), "After math");
});

test("quick titles agree with the full parser on every seeded page", () => {
  const root = path.join(process.cwd(), "content");
  const files = fs.readdirSync(root, { recursive: true, encoding: "utf8" }).filter((file) => file.endsWith(".md"));
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.equal(quickTitle(source, file), titleOf(source, file), file);
    assert.deepEqual(
      scanHeadings(source).map((heading) => heading.text),
      extractHeadings(source).map((heading) => heading.text),
      file,
    );
  }
});

test("csv keeps quoted commas in one cell", () => {
  const rows = parseDelimited('pane,job\nFiles,"Jump, then read"\n', ",");
  assert.deepEqual(rows, [
    ["pane", "job"],
    ["Files", "Jump, then read"],
  ]);
});
