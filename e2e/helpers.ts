import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// The dev server's knowledge-base folder, which the real stdio MCP server also writes.
export const repo = process.cwd();
export const kb = process.env.KB_DIR ? path.resolve(process.env.KB_DIR) : path.join(repo, "kb");

export function makeProject(slug: string, pages: Record<string, string>) {
  mkdirSync(path.join(kb, slug), { recursive: true });
  writeFileSync(path.join(kb, slug, "project.md"), `---\nname: "Agent E2E"\ndescription: ""\n---\n`);
  for (const [file, content] of Object.entries(pages)) writeFileSync(path.join(kb, slug, file), content);
}

export function removeProject(slug: string) {
  rmSync(path.join(kb, slug), { recursive: true, force: true });
}

// An MCP client that introduces itself as Claude Code, driving mcp/server.ts over stdio.
export async function agent() {
  const client = new Client({ name: "claude-code", version: "0" });
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  await client.connect(
    new StdioClientTransport({
      command: path.join(repo, "node_modules", ".bin", "tsx"),
      args: [path.join(repo, "mcp", "server.ts")],
      env: { ...env, KB_DIR: kb },
      stderr: "ignore",
    }),
  );
  const call = async (name: string, args: Record<string, unknown>) => {
    const result = await client.callTool({ name, arguments: args });
    return JSON.parse((result.content as { text: string }[])[0].text) as Record<string, unknown>;
  };
  return { client, call };
}
