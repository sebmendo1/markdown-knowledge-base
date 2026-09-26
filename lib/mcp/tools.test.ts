import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { openStore } from "../store/fs-store";
import { registerKbTools } from "./tools";

function textOf(result: { content?: { text?: string }[]; isError?: boolean }) {
  const text = result.content?.[0]?.text ?? "";
  return { raw: text, json: JSON.parse(text) as Record<string, unknown>, isError: result.isError === true };
}

test("mcp tools create a project and edit a page", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "kb-mcp-"));
  const store = openStore(directory);
  const mcp = new McpServer({ name: "markdown-kb", version: "0.1.0" });
  registerKbTools(mcp, store);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await mcp.connect(serverTransport);
  const client = new Client({ name: "test", version: "0" });
  await client.connect(clientTransport);

  try {
    const created = textOf(await client.callTool({ name: "create_project", arguments: { name: "Field Notes", description: "Local" } }));
    assert.equal(created.json.slug, "field-notes");
    const page = textOf(
      await client.callTool({
        name: "create_file",
        arguments: { project: "field-notes", path: "ideas/mcp.md", content: "# MCP\n\n- [ ] try it\n" },
      }),
    );
    assert.equal(page.json.path, "ideas/mcp.md");
    const read = textOf(await client.callTool({ name: "read_file", arguments: { project: "field-notes", path: "ideas/mcp.md" } }));
    const edited = textOf(
      await client.callTool({
        name: "update_file",
        arguments: {
          project: "field-notes",
          path: "ideas/mcp.md",
          version: read.json.version,
          edits: [{ find: "- [ ] try it", replace: "- [x] try it" }],
        },
      }),
    );
    assert.match(String(edited.json.content), /- \[x\] try it/);
    const stale = textOf(
      await client.callTool({
        name: "update_file",
        arguments: { project: "field-notes", path: "ideas/mcp.md", version: read.json.version, content: "# stale\n" },
      }),
    );
    assert.equal(stale.isError, true);
    assert.match(stale.raw, /read_file/);
    const found = textOf(await client.callTool({ name: "search", arguments: { project: "field-notes", query: "try it" } }));
    assert.equal((found.json as { path: string }[])[0]?.path, "ideas/mcp.md");
    const removed = textOf(
      await client.callTool({
        name: "delete_file",
        arguments: { project: "field-notes", path: "ideas/mcp.md", version: edited.json.version },
      }),
    );
    assert.match(String(removed.json.path), /^\.trash\//);
    const listed = textOf(await client.callTool({ name: "list_files", arguments: { project: "field-notes" } }));
    const entries = listed.json.files as Record<string, unknown>[];
    const files = entries.map((file) => file.path);
    assert.equal(files.includes("ideas/mcp.md"), false);
    assert.equal(files.includes("project.md"), false);
    assert.equal(entries.some((file) => "content" in file), false);
    assert.deepEqual(listed.json.folders, ["ideas"]);
  } finally {
    await client.close();
    await mcp.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
