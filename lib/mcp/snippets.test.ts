import assert from "node:assert/strict";
import test from "node:test";
import { mcpSnippets } from "./snippets";

test("mcp snippets point Cursor, Claude Code, and Codex at the same folder", () => {
  const snippets = mcpSnippets("/work/kb", "/work/mcp/server.ts");
  const cursor = JSON.parse(snippets.cursor) as {
    mcpServers: { "markdown-kb": { command: string; args: string[]; env: { KB_DIR: string } } };
  };
  assert.deepEqual(cursor.mcpServers["markdown-kb"], {
    command: "npx",
    args: ["tsx", "/work/mcp/server.ts"],
    env: { KB_DIR: "/work/kb" },
  });
  assert.match(snippets.claude, /KB_DIR=\/work\/kb/);
  assert.match(snippets.claude, /npx tsx \/work\/mcp\/server\.ts/);
  assert.match(snippets.codex, /KB_DIR = "\/work\/kb"/);
  assert.match(snippets.codex, /"tsx", "\/work\/mcp\/server\.ts"/);
});
