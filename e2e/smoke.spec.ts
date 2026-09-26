import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the home page lists projects", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Projects" }).getByRole("listitem").first()).toBeVisible();
});

// Accessibility scan, contrast included (X-T-013 closed by F21-REQ-026).
test("the home page has no accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const violations = results.violations;
  expect(violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
});
