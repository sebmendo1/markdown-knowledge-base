import assert from "node:assert/strict";
import { test } from "node:test";
import { baselineOf, countChanges, hasChanges, mapThrough, recordAgentChange } from "./agent-changes";

function marked(changes: ReturnType<typeof recordAgentChange>) {
  return {
    added: changes.added.map((range) => changes.text.slice(range.from, range.to)),
    removed: changes.removed.map((item) => item.text),
  };
}

test("an agent edit is counted and marked (F13-AC-038a)", () => {
  const changes = recordAgentChange(null, "The cat sat.", "The dog sat.");
  assert.deepEqual(countChanges(changes), { added: 3, removed: 3 });
  assert.deepEqual(marked(changes), { added: ["dog"], removed: ["cat"] });
  assert.equal(baselineOf(changes), "The cat sat.");
});

test("typing is not counted and deleting agent text lowers the count (F13-AC-038b)", () => {
  const agent = recordAgentChange(null, "The cat sat.\n", "The dog sat.\n");
  const typed = mapThrough(agent, "The dog sat.\nMy own line.\n");
  assert.deepEqual(countChanges(typed), { added: 3, removed: 3 });
  assert.equal(baselineOf(typed), "The cat sat.\nMy own line.\n");

  const cut = mapThrough(typed, "The  sat.\nMy own line.\n");
  assert.deepEqual(countChanges(cut), { added: 0, removed: 3 });
  assert.ok(hasChanges(cut));
});

test("typing inside an agent insertion is not marked as the agent's", () => {
  const agent = recordAgentChange(null, "A.", "A. Hello world.");
  const typed = mapThrough(agent, "A. Hello big world.");
  assert.equal(marked(typed).added.join(""), " Hello world.");
  assert.equal(countChanges(typed).added, " Hello world.".length);
  assert.match(baselineOf(typed), /^A\.\s?big\s?$/);
});

test("several agent edits pile up, and an agent deleting its own text is not a removal", () => {
  let changes = recordAgentChange(null, "One.\n", "One.\nTwo.\n");
  changes = recordAgentChange(changes, "One.\nTwo.\n", "One.\nTwo.\nThree.\n");
  assert.deepEqual(countChanges(changes), { added: "Two.\nThree.\n".length, removed: 0 });
  changes = recordAgentChange(changes, "One.\nTwo.\nThree.\n", "One.\nThree.\n");
  assert.deepEqual(countChanges(changes), { added: "Three.\n".length, removed: 0 });
  assert.equal(baselineOf(changes), "One.\n");
});

test("typing between two agent edits is carried and stays unmarked", () => {
  let changes = recordAgentChange(null, "Alpha.\n", "Alpha beta.\n");
  // The person types a line; the next agent edit starts from that text.
  changes = recordAgentChange(changes, "Alpha beta.\nMine.\n", "Alpha beta.\nMine.\nGamma.\n");
  assert.deepEqual(marked(changes).added, [" beta", "Gamma.\n"]);
  assert.equal(baselineOf(changes), "Alpha.\nMine.\n");
});
