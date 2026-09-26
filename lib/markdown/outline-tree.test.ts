import assert from "node:assert/strict";
import { test } from "node:test";
import type { Heading } from "./outline";
import { groupOutline, sectionOf } from "./outline-tree";

const h = (depth: number, text: string): Heading => ({ depth, text, id: text.toLowerCase().replace(/\s+/g, "-") });

test("F08-AC-039a outline lists the title and each h2 with a chevron slot", () => {
  const tree = groupOutline([h(1, "Plan"), h(2, "Sources"), h(3, "PRD"), h(3, "Decisions"), h(2, "Phases"), h(4, "Deep")]);
  assert.equal(tree.title?.text, "Plan");
  assert.deepEqual(
    tree.sections.map((section) => [section.heading.text, section.children.map((child) => child.text)]),
    [
      ["Sources", ["PRD", "Decisions"]],
      ["Phases", ["Deep"]],
    ],
  );
});

test("F08-AC-040a an h2 chevron shows and hides its h3 rows: sections know their children", () => {
  const tree = groupOutline([h(1, "Plan"), h(2, "Sources"), h(3, "PRD")]);
  assert.equal(sectionOf(tree, "prd"), "sources");
  assert.equal(sectionOf(tree, "sources"), "sources");
  assert.equal(sectionOf(tree, "plan"), null);
  assert.equal(sectionOf(tree, null), null);
});

test("headings before the first h2 stand alone, and a page without an h1 has no title", () => {
  const tree = groupOutline([h(3, "Intro note"), h(2, "Body"), h(3, "Part")]);
  assert.equal(tree.title, null);
  assert.deepEqual(
    tree.sections.map((section) => [section.heading.text, section.children.length]),
    [
      ["Intro note", 0],
      ["Body", 1],
    ],
  );
  assert.deepEqual(groupOutline([]), { title: null, sections: [] });
});
