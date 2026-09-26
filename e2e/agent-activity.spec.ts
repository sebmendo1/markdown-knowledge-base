import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { expect, test } from "@playwright/test";

// Drives the real stdio MCP server against the dev server's kb/ folder, and watches the browser follow along.
const repo = process.cwd();
const kb = process.env.KB_DIR ? path.resolve(process.env.KB_DIR) : path.join(repo, "kb");
const project = `e2e-agent-${process.pid}`;

// Every agent writes to the same activity log, and the working indicator shows the latest agent anywhere,
// so these tests run one at a time.
test.describe.configure({ mode: "serial" });

async function agent() {
  const client = new Client({ name: "claude-code", version: "0" });
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  await client.connect(
    new StdioClientTransport({ command: path.join(repo, "node_modules", ".bin", "tsx"), args: [path.join(repo, "mcp", "server.ts")], env: { ...env, KB_DIR: kb }, stderr: "ignore" }),
  );
  const call = async (name: string, args: Record<string, unknown>) => {
    const result = await client.callTool({ name, arguments: args });
    return JSON.parse((result.content as { text: string }[])[0].text) as Record<string, unknown>;
  };
  return { client, call };
}

test.beforeEach(() => {
  mkdirSync(path.join(kb, project), { recursive: true });
  writeFileSync(path.join(kb, project, "project.md"), '---\nname: "Agent E2E"\ndescription: ""\n---\n');
  writeFileSync(path.join(kb, project, "notes.md"), "# Notes\n\nThe first paragraph.\n\n- one\n- two\n");
});

test.afterEach(() => {
  rmSync(path.join(kb, project), { recursive: true, force: true });
});

test("an agent's edits show live in an editing screen, and the page follows the agent", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(`/${project}/notes`);
  await expect(page.locator(".md h1", { hasText: "Notes" })).toBeVisible();

  const { client, call } = await agent();
  try {
    const read = await call("read_file", { project, path: "notes.md" });
    await call("update_file", {
      project,
      path: "notes.md",
      version: read.version,
      edits: [{ find: "- two\n", replace: "- two\n- three, from the agent\n\nA paragraph the agent wrote.\n" }],
    });

    const bar = page.locator(".agent-bar");
    await expect(bar).toContainText("Claude Code is editing this page");
    await expect(bar).toContainText("1 edit");
    await expect(page.locator(".md li.agent-change")).toHaveText("three, from the agent");
    await expect(page.locator(".md p.agent-change")).toHaveText("A paragraph the agent wrote.");
    await expect(page.locator(".md li", { hasText: "one" })).not.toHaveClass(/agent-change/);
    await expect(page.locator(".agent-indicator")).toContainText("Claude Code is editing notes.md");
    await expect(page.getByRole("img", { name: "Claude Code is editing" })).toBeVisible();

    await call("create_file", { project, path: "plan.md", content: "# Plan\n\nWritten by the agent.\n" });
    await expect(page).toHaveURL(new RegExp(`/${project}/plan$`));
    await expect(page.locator(".agent-bar")).toContainText("Claude Code is editing this page");
    await expect(page.locator(".md h1.agent-change")).toHaveText("Plan");

    await expect(page.locator(".agent-bar")).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator(".md .agent-change")).toHaveCount(0);
  } finally {
    await client.close();
  }
});

test("someone editing a page gets a Watch prompt instead of being pulled away", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(`/${project}/notes?edit=1`);
  await expect(page.getByRole("button", { name: "Turn editing off" })).toBeVisible();

  const { client, call } = await agent();
  try {
    await call("create_file", { project, path: "draft.md", content: "# Draft\n" });
    const prompt = page.locator(".agent-banner", { hasText: "Claude Code is editing draft.md." });
    await expect(prompt).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/${project}/notes(\\?|$)`));
    await prompt.getByRole("button", { name: "Watch" }).click();
    await expect(page).toHaveURL(new RegExp(`/${project}/draft$`));
    await expect(page.locator(".agent-bar")).toContainText("is editing this page");
  } finally {
    await client.close();
  }
});
