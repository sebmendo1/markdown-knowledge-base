import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the home page lists projects", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Projects" }).getByRole("listitem").first()).toBeVisible();
});

// Baseline accessibility scan. Contrast is reported but not failed until X-T-013 fixes the dark theme.
test("the home page has no accessibility violations other than contrast", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const violations = results.violations.filter((violation) => violation.id !== "color-contrast");
  expect(violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
});
