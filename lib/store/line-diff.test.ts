import assert from "node:assert/strict";
import { test } from "node:test";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { Element, Root } from "hast";
import { unified } from "unified";
import { rehypeMarkChanged } from "../markdown/plugins";
import { addedLines } from "./line-diff";

test("added lines are the lines of the new text that are not in the old one", () => {
  assert.deepEqual([...addedLines("a\nb\nc", "a\nb\nc")], []);
  assert.deepEqual([...addedLines("a\nb\nc", "a\nx\nb\nc")], [2]);
  assert.deepEqual([...addedLines("a\nb\nc", "a\nB\nc\nd")], [2, 4]);
  assert.deepEqual([...addedLines("", "# New\n\nText")], [1, 2, 3]);
});

function marked(markdown: string, lines: Set<number>): string[] {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeMarkChanged, lines);
  const tree = processor.runSync(processor.parse(markdown)) as Root;
  const found: string[] = [];
  const text = (node: Element | Root): string =>
    node.children.map((child) => (child.type === "text" ? child.value : child.type === "element" ? text(child) : "")).join("");
  const walk = (node: Element | Root) => {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      const names = child.properties.className;
      if (Array.isArray(names) && names.includes("agent-change")) found.push(`${child.tagName}:${text(child).trim()}`);
      walk(child);
    }
  };
  walk(tree);
  return found;
}

test("changed blocks, list items, and table rows get the agent-change class", () => {
  const before = "# Title\n\nFirst.\n\n- one\n- two\n\n| a |\n| - |\n| 1 |\n";
  const after = "# Title\n\nFirst, edited.\n\n- one\n- two\n- three\n\n| a |\n| - |\n| 1 |\n| 2 |\n";
  assert.deepEqual(marked(after, addedLines(before, after)), ["p:First, edited.", "li:three", "tr:2"]);
  assert.deepEqual(marked(after, new Set()), []);
});
