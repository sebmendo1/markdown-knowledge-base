import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const repo = path.resolve(__dirname, "..", "..");
const tsx = path.join(repo, "node_modules", ".bin", "tsx");
const server = path.join(repo, "mcp", "server.ts");

async function listProjects(env: Record<string, string>, cwd: string): Promise<{ slug: string }[]> {
  const client = new Client({ name: "test", version: "0" });
  await client.connect(new StdioClientTransport({ command: tsx, args: [server], cwd, env, stderr: "ignore" }));
  try {
    const result = await client.callTool({ name: "list_projects", arguments: {} });
    const content = result.content as { text: string }[];
    return JSON.parse(content[0].text);
  } finally {
    await client.close();
  }
}

function baseEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined && key !== "KB_DIR") env[key] = value;
  return env;
}

test("the stdio server starts from any folder and reads KB_DIR", async () => {
  const kb = mkdtempSync(path.join(tmpdir(), "kb-server-"));
  const elsewhere = mkdtempSync(path.join(tmpdir(), "kb-cwd-"));
  try {
    mkdirSync(path.join(kb, "field-notes"));
    writeFileSync(path.join(kb, "field-notes", "a.md"), "# A\n");
    const projects = await listProjects({ ...baseEnv(), KB_DIR: kb }, elsewhere);
    assert.deepEqual(projects.map((project) => project.slug), ["field-notes"]);
  } finally {
    rmSync(kb, { recursive: true, force: true });
    rmSync(elsewhere, { recursive: true, force: true });
  }
});

test("without KB_DIR the stdio server reads the repository kb folder, not the working directory", async () => {
  const elsewhere = mkdtempSync(path.join(tmpdir(), "kb-cwd-"));
  try {
    mkdirSync(path.join(elsewhere, "kb", "decoy"), { recursive: true });
    const projects = await listProjects(baseEnv(), elsewhere);
    assert.equal(projects.some((project) => project.slug === "decoy"), false);
  } finally {
    rmSync(elsewhere, { recursive: true, force: true });
  }
});
