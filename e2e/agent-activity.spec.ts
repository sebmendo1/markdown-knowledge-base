import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { agent, kb, makeProject, removeProject } from "./helpers";

// Drives the real stdio MCP server against the dev server's kb/ folder, and watches the browser follow along.
const project = `e2e-agent-${process.pid}`;

// Every agent writes to the same activity log, and the working indicator shows the latest agent anywhere,
// so these tests run one at a time.
test.describe.configure({ mode: "serial" });

test.beforeEach(() => {
  makeProject(project, { "notes.md": "# Notes\n\nThe first paragraph.\n\n- one\n- two\n" });
});

test.afterEach(() => {
  removeProject(project);
});

test("a file changed on disk by something other than an agent is not counted", async ({ page }) => {
  // F13-AC-037a
  test.setTimeout(30_000);
  await page.goto(`/${project}/notes`);
  await expect(page.locator(".md h1", { hasText: "Notes" })).toBeVisible();
  writeFileSync(path.join(kb, project, "notes.md"), "# Notes\n\nChanged in another editor.\n\n- one\n- two\n");
  await expect(page.locator(".md p", { hasText: "Changed in another editor." })).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1000);
  await expect(page.getByRole("button", { name: /^Agent changes/ })).toHaveCount(0);
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

test("agent changes are counted left of Edit and highlighted while editing, until marked reviewed", async ({ page }) => {
  // F13-AC-038a, F13-AC-039a, F13-AC-040a
  test.setTimeout(60_000);
  await page.goto(`/${project}/notes?edit=1`);
  await expect(page.getByRole("button", { name: "Turn editing off" })).toBeVisible();
  await expect(page.locator(".block-doc p", { hasText: "The first paragraph." })).toBeVisible();

  const { client, call } = await agent();
  try {
    const read = await call("read_file", { project, path: "notes.md" });
    await call("update_file", { project, path: "notes.md", version: read.version, edits: [{ find: "first", replace: "second" }] });

    const counter = page.getByRole("button", { name: /^Agent changes: 6 characters added, 5 removed/ });
    await expect(counter).toBeVisible();
    await expect(counter).toHaveText("+6−5");
    const edit = page.getByRole("button", { name: "Turn editing off" });
    const [counterBox, editBox] = [await counter.boundingBox(), await edit.boundingBox()];
    expect(counterBox && editBox && counterBox.x + counterBox.width <= editBox.x).toBeTruthy();

    await expect(page.locator(".block-doc ins.diff-add")).toHaveText("second");
    await expect(page.locator(".block-doc del.diff-del")).toHaveText("first");

    await page.reload();
    await expect(counter).toHaveText("+6−5");
    await expect(page.locator(".block-doc ins.diff-add")).toHaveText("second");

    // The person's own typing is not counted.
    await page.locator(".block-doc h1").click();
    await page.keyboard.press("End");
    await page.keyboard.type(" and more");
    await expect(page.locator(".block-doc h1")).toHaveText("Notes and more");
    await expect(counter).toHaveText("+6−5");

    await counter.click();
    await expect(page.getByRole("button", { name: /^Agent changes/ })).toHaveCount(0);
    await expect(page.locator(".block-doc .diff-add, .block-doc .diff-del")).toHaveCount(0);
    await expect(page.locator(".block-doc p", { hasText: "The second paragraph." })).toBeVisible();
  } finally {
    await client.close();
  }
});

test("with local edits, the agent's change is highlighted after Load disk version", async ({ page }) => {
  // F13-AC-041a
  test.setTimeout(60_000);
  // Keep the typing below from reaching disk, so the agent's write is a conflict.
  await page.route("**/api/files", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await page.goto(`/${project}/notes?edit=1`);
  await page.locator(".block-doc h1").click();
  await page.keyboard.press("End");
  await page.keyboard.type(" (local)");
  await expect(page.locator(".block-doc h1")).toHaveText("Notes (local)");

  const { client, call } = await agent();
  try {
    const read = await call("read_file", { project, path: "notes.md" });
    await call("update_file", { project, path: "notes.md", version: read.version, edits: [{ find: "- two\n", replace: "- two\n- three\n" }] });

    const banner = page.locator(".disk-banner", { hasText: "This page changed on disk." });
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /^Agent changes/ })).toHaveCount(0);
    await banner.getByRole("button", { name: "Load disk version" }).click();

    await expect(page.getByRole("button", { name: /^Agent changes: 8 characters added, 0 removed/ })).toBeVisible();
    await expect(page.locator(".block-doc li ins.diff-add")).toHaveText("three");
  } finally {
    await client.close();
  }
});
