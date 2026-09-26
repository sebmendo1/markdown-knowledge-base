import { readFileSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { agent, kb, makeProject, removeProject } from "./helpers";

const project = `e2e-settings-${process.pid}`;
const NOTES = "# Notes\n\nThe first paragraph.\n";

test.beforeEach(() => {
  makeProject(project, { "notes.md": NOTES });
});

test.afterEach(() => {
  removeProject(project);
});

async function openSettings(page: Page, url = `/${project}/notes`) {
  await page.goto(url);
  await expect(page.locator(".md h1").first()).toBeVisible();
  await page.locator(".settings-entry", { hasText: "Settings" }).click();
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function section(page: Page, name: string) {
  await page.getByRole("navigation", { name: "Settings sections" }).getByRole("button", { name }).click();
  await expect(page.getByRole("dialog", { name: "Settings" }).getByRole("heading", { level: 3, name })).toBeVisible();
}

test("F10-AC-017a settings lists six sections in order", async ({ page }) => {
  await openSettings(page);
  const names = await page.getByRole("navigation", { name: "Settings sections" }).getByRole("button").allTextContents();
  expect(names).toEqual(["General", "Appearance", "Editor", "Agents", "Keyboard", "About"]);
  for (const name of names) await section(page, name);
});

test("F10-AC-018a agents section shows the connection snippets", async ({ page }) => {
  const dialog = await openSettings(page);
  await section(page, "Agents");
  await expect(dialog.getByRole("heading", { name: "Connect an agent" })).toBeVisible();
  await expect(dialog.getByText(`These settings point agents at ${kb}.`)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Copy" })).toHaveCount(3);
});

test("F10-AC-020a reset asks for confirmation", async ({ page }) => {
  const dialog = await openSettings(page);
  await section(page, "General");
  await page.evaluate(() => localStorage.setItem("markdown-kb:history:e2e", JSON.stringify([{ at: 1, content: "x", label: "Before editing" }])));
  await dialog.getByRole("button", { name: "Reset this browser's copy" }).click();
  await expect(dialog.getByRole("button", { name: "Reset and reload" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("markdown-kb:history:e2e"))).not.toBeNull();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog.getByRole("button", { name: "Reset this browser's copy" })).toBeVisible();
});

test("F10-AC-021a reset clears browser pages and keeps the theme", async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("markdown-kb:theme", "light");
    localStorage.setItem("markdown-kb:history:e2e", JSON.stringify([{ at: 1, content: "x", label: "Before editing" }]));
    localStorage.setItem("markdown-kb:projects", JSON.stringify({ version: 1, local: [{ slug: "browser-only", name: "Browser only" }] }));
  });
  const dialog = await openSettings(page);
  await section(page, "General");
  await expect(dialog.locator(".settings-stats")).toContainText("1");
  await dialog.getByRole("button", { name: "Reset this browser's copy" }).click();
  await dialog.getByRole("button", { name: "Reset and reload" }).click();
  await expect(page.locator(".md h1").first()).toBeVisible();
  const left = await page.evaluate(() => ({
    history: localStorage.getItem("markdown-kb:history:e2e"),
    projects: localStorage.getItem("markdown-kb:projects"),
    theme: localStorage.getItem("markdown-kb:theme"),
  }));
  expect(left.history).toBeNull();
  expect(left.projects === null || !left.projects.includes("browser-only")).toBe(true);
  expect(left.theme).toBe("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(readFileSync(path.join(kb, project, "notes.md"), "utf8")).toBe(NOTES);
});

test("F10-AC-022a appearance offers motion system and reduce", async ({ page }) => {
  const dialog = await openSettings(page);
  const motion = dialog.getByRole("radiogroup", { name: "Motion" });
  await expect(motion.getByRole("radio")).toHaveText(["System", "Reduce"]);
  await expect(motion.getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true");
});

test("F10-AC-023a reduce motion stops animation and survives a reload", async ({ page }) => {
  const dialog = await openSettings(page);
  await dialog.getByRole("radiogroup", { name: "Motion" }).getByRole("radio", { name: "Reduce" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  const animation = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.className = "agent-pulse";
    document.body.appendChild(probe);
    const name = getComputedStyle(probe, "::after").animationName;
    probe.remove();
    return name;
  });
  expect(animation).toBe("none");
  // The startup script in <body> runs while the HTML is parsed, before hydration.
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe("reduce");
});

test("F10-AC-024a spellcheck off reaches the editor", async ({ page }) => {
  const dialog = await openSettings(page);
  await section(page, "Editor");
  const toggle = dialog.getByRole("switch", { name: "Spellcheck" });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Turn editing on" }).click();
  await expect(page.locator(".block-doc")).toHaveAttribute("spellcheck", "false");
});

test.describe("with an agent", () => {
  test.describe.configure({ mode: "serial" });

  test("F10-AC-025a F10-AC-026a agents section names the last agent and lists recent actions", async ({ page }) => {
    const { client, call } = await agent();
    try {
      const read = await call("read_file", { project, path: "notes.md" });
      await call("update_file", { project, path: "notes.md", version: read.version, edits: [{ find: "first", replace: "only" }] });
    } finally {
      await client.close();
    }
    const dialog = await openSettings(page);
    await section(page, "Agents");
    await expect(dialog.getByRole("status")).toContainText("Claude Code");
    await expect(dialog.getByRole("status")).toContainText("last seen just now");
    const rows = dialog.getByRole("list", { name: "Recent agent activity" }).getByRole("listitem");
    await expect(rows.nth(0)).toContainText(`Claude Code edited notes.md · ${project}`);
    await expect(rows.nth(1)).toContainText(`Claude Code read notes.md · ${project}`);
  });

  test("F10-AC-027a follow off keeps the open page", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("markdown-kb:prefs", JSON.stringify({ followAgents: false })));
    await page.goto(`/${project}/notes`);
    await expect(page.locator(".md h1", { hasText: "Notes" })).toBeVisible();
    const { client, call } = await agent();
    try {
      await call("create_file", { project, path: "plan.md", content: "# Plan\n" });
      await expect(page.locator(".agent-banner", { hasText: "Claude Code is editing plan.md." })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/${project}/notes$`));
    } finally {
      await client.close();
    }
  });

  test("F10-AC-028a highlight off marks no changes", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("markdown-kb:prefs", JSON.stringify({ highlightAgentChanges: false })));
    await page.goto(`/${project}/notes`);
    await expect(page.locator(".md h1", { hasText: "Notes" })).toBeVisible();
    const { client, call } = await agent();
    try {
      const read = await call("read_file", { project, path: "notes.md" });
      await call("update_file", { project, path: "notes.md", version: read.version, edits: [{ find: "The first paragraph.", replace: "A new paragraph." }] });
      await expect(page.locator(".agent-bar")).toContainText("Claude Code is editing this page");
      await expect(page.locator(".md p", { hasText: "A new paragraph." })).toBeVisible();
      await expect(page.locator(".md .agent-change")).toHaveCount(0);
    } finally {
      await client.close();
    }
  });
});

test("F10-AC-029a keyboard section opens shortcut help", async ({ page }) => {
  const dialog = await openSettings(page);
  await section(page, "Keyboard");
  await dialog.getByRole("button", { name: "Show shortcuts" }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Shortcuts" })).toBeVisible();
});

test("F10-AC-030a about shows the version and links", async ({ page }) => {
  const dialog = await openSettings(page);
  await section(page, "About");
  const version = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")).version as string;
  await expect(dialog.getByText(version, { exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Open the guide" })).toHaveAttribute("href", "/guide");
  await expect(dialog.getByRole("link", { name: "Open the specs" })).toHaveAttribute("href", "/specs");
  await expect(dialog.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", /github\.com/);
});

test("the settings dialog has no accessibility violations other than contrast", async ({ page }) => {
  await openSettings(page);
  for (const name of ["General", "Appearance", "Editor", "Agents", "Keyboard", "About"]) {
    await section(page, name);
    const results = await new AxeBuilder({ page }).include(".settings").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const violations = results.violations.filter((violation) => violation.id !== "color-contrast");
    expect(violations.map((violation) => `${name}: ${violation.id}: ${violation.help}`)).toEqual([]);
  }
});
