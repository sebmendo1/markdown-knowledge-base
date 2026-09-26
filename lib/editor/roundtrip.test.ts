import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { getSchema } from "@tiptap/core";
import { markdownToNodes, parsePage } from "./from-markdown";
import type { PMNode } from "./json";
import { baseExtensions } from "./nodes";
import { blockToMarkdown, joinBlocks, nodesToMarkdown } from "./to-markdown";

const schema = getSchema(baseExtensions());

const SAMPLE = `---
type: experiment
title: Sample
---

# Sample page

Some *italic*, **bold**, ~~gone~~, \`code\`, ==marked==, a [link](https://example.com "Title") and [[shortcuts#Keyboard|keys]].

> [!NOTE]
> A callout with **weight**.

> Plain quote
>
> Two paragraphs

1. One
2. Two
   - Nested

- [x] Done
- [ ] Open

| Left | Right |
| :--- | ---: |
| a | b |
| c |

\`\`\`ts {2}
const a = 1;
\`\`\`

$$
x^2
$$

Inline $x+1$ math.\\
After a break.

![[layout]]

![alt](assets/a.png)

---

<details>
<summary>More</summary>

Hidden text

</details>

Footnote.[^1]

[^1]: A note.
`;

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

const sources: [string, string][] = [
  ["sample", SAMPLE],
  ...[...markdownFiles("content"), ...markdownFiles("specs")].map((path): [string, string] => [path, readFileSync(path, "utf8")]),
];

function normalize(nodes: PMNode[]): PMNode[] {
  return JSON.parse(JSON.stringify(nodes), (key, value) => (key === "text" && typeof value === "string" ? value.replace(/\s+/g, " ") : value));
}

function untouched(source: string): string {
  const page = parsePage(source);
  return joinBlocks(page, page.blocks.map((_, index) => ({ index })));
}

test("untouched pages serialize byte for byte", () => {
  for (const [name, source] of sources) {
    assert.equal(untouched(source), source, name);
  }
});

test("every parsed page fits the editor schema", () => {
  for (const [name, source] of sources) {
    const doc = schema.nodeFromJSON({ type: "doc", content: parsePage(source).nodes });
    assert.doesNotThrow(() => doc.check(), name);
  }
});

test("each block survives a rewrite with the same structure", () => {
  for (const [name, source] of sources) {
    for (const node of parsePage(source).nodes) {
      if (node.type === "rawBlock") continue;
      const rewritten = blockToMarkdown(node);
      assert.deepEqual(normalize(markdownToNodes(rewritten)), normalize([node]), `${name}: ${rewritten}`);
    }
  }
});

test("bold that starts with inline code stays one bold run", () => {
  for (const source of ["**`x` in**", "a **`#8A8A8A` in the product** b", "**x *y* z**"]) {
    const [node] = markdownToNodes(source);
    assert.equal(blockToMarkdown(node), source);
  }
});

test("unsupported syntax stays as raw source", () => {
  const types = parsePage(SAMPLE).nodes.map((node) => node.type);
  assert.equal(types.filter((type) => type === "rawBlock").length, 3);
  const details = parsePage(SAMPLE).nodes.find((node) => String(node.attrs?.source ?? "").startsWith("<details>"));
  assert.match(String(details?.attrs?.source), /Hidden text[\s\S]*<\/details>$/);
});

test("edited blocks write standard markdown", () => {
  const cases: [PMNode, string][] = [
    [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] }, "## Title"],
    [
      { type: "callout", attrs: { kind: "tip" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Try it" }] }] },
      "> [!TIP]\n> Try it",
    ],
    [
      {
        type: "taskList",
        attrs: { tight: true },
        content: [
          { type: "taskItem", attrs: { checked: true }, content: [{ type: "paragraph", content: [{ type: "text", text: "a" }] }] },
          { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "b" }] }] },
        ],
      },
      "- [x] a\n- [ ] b",
    ],
    [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "see " },
          { type: "wikiLink", attrs: { target: "docs/layout", heading: null, label: null, embed: false } },
          { type: "text", text: " and " },
          { type: "text", text: "this", marks: [{ type: "highlight" }] },
        ],
      },
      "see [[docs/layout]] and ==this==",
    ],
    [{ type: "codeFence", attrs: { language: "mermaid", meta: null, code: "flowchart LR\n  a --> b" } }, "```mermaid\nflowchart LR\n  a --> b\n```"],
    [{ type: "mathBlock", attrs: { value: "x^2" } }, "$$\nx^2\n$$"],
    [{ type: "embed", attrs: { target: "layout", heading: "Keys" } }, "![[layout#Keys]]"],
    [{ type: "paragraph" }, ""],
  ];
  for (const [node, expected] of cases) assert.equal(blockToMarkdown(node), expected);
});

test("new blocks between originals keep the original text around them", () => {
  const source = "# A\n\nfirst\n\n\nsecond\n";
  const page = parsePage(source);
  const inserted: PMNode = { type: "paragraph", content: [{ type: "text", text: "new" }] };
  const out = joinBlocks(page, [{ index: 0 }, { index: 1 }, { node: inserted }, { index: 2 }]);
  assert.equal(out, "# A\n\nfirst\n\nnew\n\nsecond\n");
  assert.equal(joinBlocks(page, [{ index: 0 }, { index: 1 }, { index: 2 }]), source);
});

test("pasted markdown becomes blocks", () => {
  const nodes = markdownToNodes("## Pasted\n\n- one\n- two\n");
  assert.deepEqual(nodes.map((node) => node.type), ["heading", "bulletList"]);
  assert.equal(nodesToMarkdown(nodes), "## Pasted\n\n- one\n- two\n");
});

test("spaces at mark and block edges stay plain spaces", () => {
  const italic = [{ type: "italic" }];
  const node: PMNode = {
    type: "paragraph",
    content: [
      { type: "text", text: "Some " },
      { type: "text", text: "text see ", marks: italic },
      { type: "wikiLink", attrs: { target: "docs/shortcuts" } },
      { type: "text", text: " " },
    ],
  };
  assert.equal(blockToMarkdown(node), "Some *text see* [[docs/shortcuts]]");
});
