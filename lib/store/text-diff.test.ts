import assert from "node:assert/strict";
import { test } from "node:test";
import { countHunks, diffText, type Hunk } from "./text-diff";

// Rebuild `after` from `before` and the hunks, to prove the hunks are complete.
function apply(before: string, after: string, hunks: Hunk[]): string {
  let out = "";
  let pos = 0;
  for (const hunk of hunks) {
    out += before.slice(pos, hunk.fromA) + after.slice(hunk.fromB, hunk.toB);
    pos = hunk.toA;
  }
  return out + before.slice(pos);
}

function show(before: string, after: string): string[] {
  return diffText(before, after).map((hunk) => `${before.slice(hunk.fromA, hunk.toA)}→${after.slice(hunk.fromB, hunk.toB)}`);
}

test("word hunks and character counts (F13-AC-038a)", () => {
  assert.deepEqual(show("The cat sat", "The dog sat"), ["cat→dog"]);
  assert.deepEqual(countHunks(diffText("The cat sat", "The dog sat")), { added: 3, removed: 3 });
  assert.deepEqual(show("same", "same"), []);
  assert.deepEqual(show("", "new page"), ["→new page"]);
  assert.deepEqual(show("gone", ""), ["gone→"]);
});

test("changes across lines stay word-sized and keep unchanged lines out", () => {
  const before = "# Title\n\nOne two three.\n\nKeep this.\n";
  const after = "# Title\n\nOne 2 three, four.\n\nKeep this.\n\nNew line.\n";
  assert.deepEqual(show(before, after), ["two→2", "→, four", "→\nNew line.\n"]);
  assert.equal(apply(before, after, diffText(before, after)), after);
});

test("hunks always rebuild the new text", () => {
  const cases: [string, string][] = [
    ["a b c", "a c"],
    ["a\nb\nc\n", "c\nb\na\n"],
    ["héllo wörld", "héllo wörld!"],
    ["x".repeat(3000), "y".repeat(3000)],
  ];
  for (const [before, after] of cases) assert.equal(apply(before, after, diffText(before, after)), after);
});

test("very long unrelated pages fall back to one replaced span", () => {
  const before = Array.from({ length: 2500 }, (_, i) => `a${i}`).join("\n");
  const after = Array.from({ length: 2500 }, (_, i) => `b${i}`).join("\n");
  const hunks = diffText(before, after);
  assert.equal(apply(before, after, hunks), after);
  assert.deepEqual(countHunks(hunks), { added: after.length, removed: before.length });
});
