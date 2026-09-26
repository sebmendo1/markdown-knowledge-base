import assert from "node:assert/strict";
import { test } from "node:test";
import { getSchema } from "@tiptap/core";
import { agentDiffMarks, type DiffMark } from "./agent-diff";
import { parsePage } from "./from-markdown";
import { baseExtensions } from "./nodes";

const schema = getSchema(baseExtensions());

function docOf(source: string) {
  return schema.nodeFromJSON({ type: "doc", content: parsePage(source).nodes });
}

// Marks as readable strings: the text they cover in the document, or the text they show as deleted.
function describe(source: string, baseline: string): string[] {
  const doc = docOf(source);
  return agentDiffMarks(doc, baseline).map((mark: DiffMark) => {
    if (mark.kind === "added") return `+${doc.textBetween(mark.from, mark.to)}`;
    if (mark.kind === "block") return `block:${doc.nodeAt(mark.from)?.type.name}`;
    if (mark.kind === "removed") return `-${mark.text}`;
    return `removed block:${mark.text}`;
  });
}

test("inline and block decorations: a word changed in a paragraph (F13-AC-040a)", () => {
  assert.deepEqual(describe("# Title\n\nThe dog sat.\n", "# Title\n\nThe cat sat.\n"), ["-cat", "+dog"]);
  assert.deepEqual(describe("Same.\n", "Same.\n"), []);
});

test("inline and block decorations: a paragraph added and another removed (F13-AC-040b)", () => {
  const before = "# Title\n\nFirst.\n\nGone soon.\n\nLast.\n";
  const after = "# Title\n\nFirst.\n\nLast.\n\nBrand new.\n";
  assert.deepEqual(describe(after, before), ["removed block:Gone soon.", "+Brand new."]);
});

test("a new list item is marked by itself, and a changed code block as a whole", () => {
  assert.deepEqual(describe("- one\n- two\n- three\n", "- one\n- two\n"), ["+three"]);
  assert.deepEqual(describe("```js\nlet a = 2;\n```\n", "```js\nlet a = 1;\n```\n"), ["block:codeFence"]);
});

test("positions point into the open document", () => {
  const doc = docOf("Hello brave world.\n");
  const marks = agentDiffMarks(doc, "Hello world.\n");
  const added = marks.find((mark) => mark.kind === "added");
  assert.ok(added && added.kind === "added");
  assert.equal(doc.textBetween(added.from, added.to), "brave ");
});

test("blocks pair by kind, so an item added to a list is not shown as the whole list replaced", () => {
  const before = "# Notes\n\nThe cat sat on the mat.\n\nThis paragraph goes away.\n\n- one\n- two\n";
  const after = "# Notes\n\nThe dog sat on the new mat.\n\n- one\n- two\n- three\n\nA paragraph the agent wrote.\n";
  assert.deepEqual(describe(after, before), [
    "-cat",
    "+dog",
    "+ new",
    "removed block:This paragraph goes away.",
    "+three",
    "+A paragraph the agent wrote.",
  ]);
});
