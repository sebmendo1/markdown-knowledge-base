import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_PREFERENCES, parsePreferences } from "./preferences";
import { formatBytes, resetKeys, summarizeStorage } from "./storage";

test("preferences fall back one value at a time", () => {
  assert.deepEqual(parsePreferences(null), DEFAULT_PREFERENCES);
  assert.deepEqual(parsePreferences("not json"), DEFAULT_PREFERENCES);
  assert.deepEqual(parsePreferences("[1,2]"), DEFAULT_PREFERENCES);
  assert.deepEqual(parsePreferences('{"spellcheck":false,"followAgents":"no","motion":"fast"}'), {
    ...DEFAULT_PREFERENCES,
    spellcheck: false,
  });
  assert.equal(parsePreferences('{"motion":"reduce"}').motion, "reduce");
});

test("F10-AC-019a storage summary counts this browser's pages", () => {
  const workspace = JSON.stringify({
    version: 1,
    pages: [
      { id: "a", path: "a.md", content: "# A", origin: "a.md", base: "# A" },
      { id: "b", path: "b.md", content: "# New" },
      { id: "c", path: "c.md", content: "# C", origin: "c.md", base: "# C" },
    ],
  });
  const entries: [string, string][] = [
    ["markdown-kb:workspace:guide", workspace],
    ["markdown-kb:projects", JSON.stringify({ version: 1, local: [{ slug: "notes" }] })],
    ["markdown-kb:history:b", JSON.stringify([{ at: 1 }, { at: 2 }])],
    ["markdown-kb:history:a", JSON.stringify([{ at: 3 }])],
    ["markdown-kb:theme", "light"],
    ["someone-else", "x".repeat(1000)],
  ];
  const summary = summarizeStorage(entries);
  assert.equal(summary.projects, 2);
  assert.equal(summary.pagesChangedHere, 1);
  assert.equal(summary.versions, 3);
  const ours = entries.filter(([key]) => key.startsWith("markdown-kb"));
  assert.equal(summary.bytes, ours.reduce((sum, [key, value]) => sum + (key.length + value.length) * 2, 0));
});

test("a reset removes pages and view state but keeps the theme and preferences", () => {
  const keys = [
    "markdown-kb:workspace:guide",
    "markdown-kb:workspace",
    "markdown-kb:history:a",
    "markdown-kb:projects",
    "markdown-kb:collapsed:guide",
    "markdown-kb:access:guide/a",
    "markdown-kb:mode",
    "markdown-kb:sidebar",
    "markdown-kb:theme",
    "markdown-kb:prefs",
    "other-app",
  ];
  assert.deepEqual(resetKeys(keys), keys.slice(0, 8));
});

test("sizes read as bytes, kilobytes, or megabytes", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(2048), "2.0 KB");
  assert.equal(formatBytes(50 * 1024), "50 KB");
  assert.equal(formatBytes(3 * 1024 * 1024), "3.0 MB");
});
